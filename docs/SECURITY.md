# Security — SmartQuiz AI

This document describes every security control implemented in SmartQuiz AI.

---

## Overview

SmartQuiz AI implements a **defence-in-depth** strategy with multiple independent security layers. A failure in any one layer does not expose the application.

```
Layer 1: Network         → CORS origin allowlist
Layer 2: Transport       → HTTPS enforced in production (secure cookies)
Layer 3: Application     → Helmet secure headers + rate limiting
Layer 4: Authentication  → Short-lived JWT + rotating refresh tokens
Layer 5: Authorization   → RBAC + granular permission arrays
Layer 6: Input           → Zod schema validation + XSS sanitization
Layer 7: Session         → CSRF double-submit cookie pattern
Layer 8: Data            → Passwords hashed with bcrypt (cost 12)
Layer 9: Audit           → Structured admin action logging
```

---

## JWT Access Tokens

**Library:** `jsonwebtoken`

Access tokens are short-lived **Bearer tokens** passed in the `Authorization` header.

| Property | Value |
|---|---|
| Algorithm | HS256 |
| Expiry | 15 minutes (configurable via `JWT_EXPIRES_IN`) |
| Payload | `{ sub: userId, role: userRole }` |
| Transport | `Authorization: Bearer <token>` header |

On every protected request:
1. Token is extracted from the `Authorization` header
2. Signature is verified with `JWT_SECRET`
3. User is loaded from the database and checked for `isBlocked`

**Why short expiry?** If a token is stolen, it becomes invalid within 15 minutes. Combined with refresh token rotation, session continuity is maintained without long-lived exposure.

---

## Refresh Tokens

Refresh tokens provide **silent reauthentication** without requiring the user to re-enter credentials.

### Implementation Details

| Property | Value |
|---|---|
| Storage | MongoDB `refreshtokens` collection |
| Format | 48 bytes of cryptographically random data (base64url) |
| Hashing | SHA-256 hash stored — raw token only on the cookie |
| Cookie | httpOnly, `secure` in production, `sameSite: none` in production |
| Path | `/api/auth` (not accessible from other routes) |
| Expiry | 7 days (configurable via `REFRESH_TOKEN_DAYS`) |
| Max sessions | 5 concurrent active sessions per user |

### Token Rotation

Every call to `POST /api/auth/refresh`:
1. Validates the raw token by hashing and comparing against the database
2. Creates a **new** refresh token record
3. Marks the old token as **revoked** (`revokedAt = now`)
4. Issues a new CSRF token alongside the new access token

### Reuse Detection

If a **revoked** token is presented (indicating possible token theft):
- All active sessions for that user are immediately revoked
- The user must log in again from scratch
- The attack vector is neutralized within one request

### Automatic Expiry

A MongoDB TTL index on `expiresAt` automatically deletes expired token documents without a cron job, keeping the collection lean.

---

## CSRF Protection

SmartQuiz AI uses the **double-submit cookie pattern** for CSRF protection.

### How it Works

1. On login/register, a cryptographically random CSRF token is issued
2. It is set as a **non-httpOnly cookie** (`smartquiz_csrf`) readable by JavaScript
3. On every mutating request (POST, PUT, DELETE), the client must echo the token in the `X-CSRF-Token` header
4. The server validates that the header value matches the cookie value

**Why this works:** A cross-site attacker cannot read the httpOnly refresh cookie or the CSRF cookie value (same-origin policy), so they cannot forge a valid request.

---

## Role-Based Access Control (RBAC)

Three roles are defined:

| Role | Description |
|---|---|
| `user` | Standard user — can take quizzes, view analytics, manage own profile |
| `moderator` | Extended user — custom permissions granted by an admin |
| `admin` | Full access — user management, content management, admin dashboard |

### Middleware

```javascript
// Require a specific role
requireRole('admin')

// Require a custom permission (moderators)
requirePermission('questions.write')
```

Admins bypass all `requirePermission` checks. Moderators only pass if the specific permission string is in their `rolePermissions` array.

---

## Input Validation

**Library:** Zod

Every API endpoint validates its inputs with explicit Zod schemas:
- Request bodies (`validateBody`)
- Query parameters (`validateQuery`)
- Route parameters (`validateParams`)

Validation failures return structured `400` errors listing every field-level issue.

### Example Enforcements
- ObjectId format validation on all ID parameters
- Enum validation on `difficulty`, `role`, `share type`
- Length limits on all string fields
- Numeric range validation on counts, XP rewards, etc.
- `answer` must exist in the `options` array (validated both in Zod schema and Mongoose)

---

## Input Sanitization

**Library:** `xss`

The `sanitizeInput` middleware recursively traverses all request bodies and sanitizes string values to neutralize HTML/JavaScript injection payloads. This runs before any controller logic.

This prevents **Stored XSS** attacks where malicious scripts are saved to the database and later rendered to other users.

---

## Helmet — Secure HTTP Headers

**Library:** `helmet`

The following headers are set on every response:

| Header | Value | Purpose |
|---|---|---|
| `Content-Security-Policy` | `default-src 'self'` + img/style exceptions | Prevents XSS |
| `X-Frame-Options` | `DENY` (`frameAncestors: none`) | Prevents clickjacking |
| `X-Content-Type-Options` | `nosniff` | Prevents MIME sniffing |
| `Referrer-Policy` | `no-referrer` | Limits information leakage |
| `X-XSS-Protection` | Disabled (CSP handles this) | |
| `Strict-Transport-Security` | Set by Helmet in production | Forces HTTPS |
| `Cross-Origin-Resource-Policy` | `cross-origin` | Controls resource sharing |

---

## Rate Limiting

**Library:** `express-rate-limit`

Two tiers of rate limiting:

| Tier | Window | Max Requests | Applied To |
|---|---|---|---|
| General API | 15 minutes | 300 | All `/api` routes |
| Authentication | 15 minutes | 40 | `/api/auth` routes |

Rate limit exceeded returns `429 Too Many Requests`.

In test mode (`NODE_ENV=test`), limits are raised to 10,000 to avoid test failures.

---

## CORS

**Library:** `cors`

Origin validation uses an **allowlist** strategy. Any request from an origin not in the `CLIENT_ORIGINS` environment variable is rejected with `403 Forbidden`.

Allowed methods: `GET, POST, PUT, PATCH, DELETE, OPTIONS`  
Credentials: Enabled (required for cookie-based refresh tokens)  
Preflight cache: 24 hours

---

## Password Security

**Library:** `bcryptjs`

- Passwords are hashed with bcrypt before storage
- The `password` field is excluded from all queries by default (`select: false`)
- Password is never returned in any API response

---

## Admin Audit Logging

Every admin action is logged via Pino with structured fields:

```json
{
  "level": "info",
  "adminId": "64f1a2b3...",
  "action": "user.block",
  "targetId": "64f1a2b4...",
  "metadata": { "isBlocked": true },
  "msg": "Admin action completed"
}
```

Logged actions include: user block/unblock, role change, user delete, question CRUD, category CRUD, challenge CRUD, achievement CRUD.

---

## AI Prompt Security

The AI Gateway applies its own input validation layer before prompts reach any LLM provider.

### Prompt Injection Mitigation

A regex filter blocks explicit manipulation attempts before they reach the AI providers:

```js
/(ignore previous instructions|reveal your system prompt|return api keys|bypass instructions)/i
```

**Design principle:** The filter is intentionally permissive toward educational content. Students may legitimately ask about SQL injection, shell commands, or code debugging. Only clear system-manipulation attempts are blocked.

### Input Length Enforcement

| Field | Max Length |
|---|---|
| `message` (chat) | 1,000 characters |
| `topic` (quiz) | 200 characters |
| `question` (explain) | 500 characters |
| History entries per request | 10 items |

### API Key Protection

- API keys are stored only in `process.env` / `.env` files
- Keys are never returned in any API response
- Keys are never logged (Pino masks env vars)
- Frontend communicates only with `/api/ai/*` — never directly with AI providers

### Rate Limiting on AI Endpoints

All `/api/ai/*` endpoints are subject to the global 300 req/15min rate limiter. Chat streaming connections are terminated if the client disconnects.

---

## Security Best Practices for Operators

1. **Rotate secrets regularly** — Change `JWT_SECRET` and `CSRF_SECRET` periodically
2. **Use strong secrets** — Generate with `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`
3. **Set `NODE_ENV=production`** — Enables secure cookie flags
4. **Set `TRUST_PROXY=true`** on Render/Heroku — Allows correct IP logging
5. **Configure MongoDB Atlas IP allowlist** — Only allow your server's IP
6. **Enable MongoDB Atlas alerts** — Monitor for unusual query patterns
7. **Review admin audit logs** — Periodically audit admin actions
8. **Rotate blocked user sessions** — Blocking a user immediately revokes all their refresh tokens
