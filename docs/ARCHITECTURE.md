# System Architecture — SmartQuiz AI

This document describes the complete technical architecture of SmartQuiz AI, covering the system overview, data flow, auth model, quiz engine, AI gateway, and database design.

---

## System Overview

SmartQuiz AI follows a classic **MVC architecture** on the backend, paired with a React SPA on the frontend and a provider-agnostic AI Gateway layer that is entirely decoupled from business logic.

```
┌─────────────────────────────────────────────────────────────┐
│                     Browser (React SPA)                     │
│  React Router 6 → Pages → Services → Axios → REST/SSE      │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTPS
┌──────────────────────────────▼──────────────────────────────┐
│                   Express.js API Server                     │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Middleware Pipeline                                  │  │
│  │  Pino Logger → Helmet → CORS → Compression →        │  │
│  │  Cookie Parser → JSON Body → XSS Sanitize →         │  │
│  │  Rate Limiter → Route                                │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  Route → Zod Validation → Auth Middleware                   │
│       → Controller → Service → Model → MongoDB            │
│                   └─────→ AI Gateway                        │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│                    AI Gateway Layer                         │
│                                                             │
│  ProviderFactory (Orchestrator)                             │
│    │                                                        │
│    ├── 1. OpenRouterProvider (Primary)                      │
│    │        └── ModelSelector (Round-Robin + Health)        │
│    │        └── CircuitBreaker (3 failures → 5-min trip)   │
│    │        └── RetryManager (1s → 2s → 4s backoff)        │
│    │                                                        │
│    ├── 2. GeminiProvider (Secondary Fallback)               │
│    │        └── RetryManager                                │
│    │                                                        │
│    └── 3. LocalIntelligenceProvider (Offline Tertiary)     │
│              └── MongoDB Question Bank Query                │
│              └── Rule-Based Response Generation             │
│                                                             │
│  CacheFactory → MemoryCacheProvider (SHA-256 keys, 30m TTL)│
│  UsageTracker → MetricsPersister (→ MongoDB every 5 min)  │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│                       MongoDB Atlas                         │
│                                                             │
│  Users · RefreshTokens · Categories · Questions            │
│  QuizSessions · Leaderboard · UserAnalytics               │
│  Achievements · UserAchievements · DailyChallenge          │
│  AIUsageMetrics (TTL Index: 30 days)                       │
└─────────────────────────────────────────────────────────────┘
```

---

## Authentication Flow

```
Register / Login
      │
      ▼
Validate (Zod) → Hash Password (bcrypt 12)
      │
      ▼
Generate JWT (15m) + Refresh Token (7d)
      │
      ├── JWT → Authorization header (client stores in memory)
      └── Refresh Token → httpOnly cookie (SHA-256 hashed in DB)
```

**Refresh Token Rotation:**
1. Client sends expired JWT
2. Client hits `POST /api/auth/refresh` with httpOnly cookie
3. Server verifies token hash, issues new JWT + new Refresh Token
4. Old Refresh Token is revoked (single-use enforcement)
5. If a reused token is detected → ALL user sessions are revoked immediately

---

## Quiz Engine Flow

```
POST /api/quiz/start
  → Validate category, difficulty, count (5–20)
  → Fetch N random questions from DB
  → Create QuizSession { status: "in_progress", answers: [], startedAt }
  → Return questions (without correctAnswers)

POST /api/quiz/submit  (per answer)
  → Look up QuizSession
  → Evaluate correctness
  → Store answer + isCorrect

POST /api/quiz/complete
  → Tally results
  → Calculate score (accuracy % + speed bonus + streak bonus)
  → Award XP
  → Update UserAnalytics
  → Check and unlock Achievements
  → Update Leaderboard
  → Return full result with explanations
```

---

## AI Gateway Streaming Flow

```
POST /api/ai/chat
  │
  ├── Set SSE headers (text/event-stream)
  │
  ├── Try OpenRouter Stream
  │    ├── Success → pipe chunks → res.write("data: ...")
  │    └── Fail → Try OpenRouter Block → pipe as single chunk
  │                    └── Fail → Try Gemini Stream
  │                                  └── Fail → Try Gemini Block
  │                                                └── Try Local Engine
  │                                                      └── All fail → error event
  │
  └── write "data: [DONE]" → res.end()
```

---

## Middleware Pipeline

| Order | Middleware | Purpose |
|---|---|---|
| 1 | `pino-http` | Structured request/response logging |
| 2 | `helmet` | Security headers + strict CSP |
| 3 | `cors` | Allowlist-based CORS |
| 4 | `compression` | GZIP responses > 1 KB |
| 5 | `cookie-parser` | Parse httpOnly auth cookies |
| 6 | `express.json` | Parse JSON bodies (max 256 KB) |
| 7 | `sanitizeInput` | Strip XSS and NoSQL injection patterns |
| 8 | `rateLimit` (global) | 300 req/15min per IP |
| 9 | Route handlers | Business logic |
| 10 | `notFoundHandler` | 404 catch-all |
| 11 | `errorHandler` | Centralized error formatting |

---

## Database Models

| Model | Collection | Purpose |
|---|---|---|
| `User` | `users` | Accounts, XP, levels, streaks |
| `RefreshToken` | `refreshtokens` | SHA-256 hashed tokens (TTL indexed) |
| `Category` | `categories` | Quiz topic taxonomy |
| `Question` | `questions` | MCQ question bank |
| `QuizSession` | `quizsessions` | Active and completed quiz sessions |
| `Leaderboard` | `leaderboards` | XP-ranked user records |
| `UserAnalytics` | `useranalytics` | Per-user performance timeseries |
| `Achievement` | `achievements` | Achievement definitions |
| `UserAchievement` | `userachievements` | Unlocked achievements per user |
| `DailyChallenge` | `dailychallenges` | Daily challenge instances |
| `AIUsageMetrics` | `aiusagemetrics` | AI telemetry (30-day TTL index) |

---

## Related Documentation

- [AI Provider Layer](./AI_PROVIDER_LAYER.md)
- [API Reference](./API.md)
- [Database Schema](./DATABASE.md)
- [Security Model](./SECURITY.md)
