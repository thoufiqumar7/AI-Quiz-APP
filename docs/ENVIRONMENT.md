# Environment Variables — SmartQuiz AI

This document is the authoritative reference for all environment variables used by SmartQuiz AI.

> ⚠️ **Never commit `.env` files to source control.** Only `.env.example` files are tracked.

---

## Server — `server/.env`

Copy the template:
```bash
cp server/.env.example server/.env
```

### Core

| Variable | Required | Default | Description |
|---|---|---|---|
| `PORT` | No | `5000` | Port the Express server listens on |
| `NODE_ENV` | No | `development` | `development`, `test`, or `production` |
| `MONGO_URI` | **Yes** | — | Full MongoDB connection string (local or Atlas) |
| `TRUST_PROXY` | No | `false` | Set `true` when behind a reverse proxy (Render, Nginx) |
| `LOG_LEVEL` | No | `debug` (dev) / `info` (prod) | Pino log level |

### Authentication

| Variable | Required | Default | Description |
|---|---|---|---|
| `JWT_SECRET` | **Yes** | — | Minimum 64-byte random secret. Generate: `node -e "require('crypto').randomBytes(64).toString('hex') |> console.log"` |
| `JWT_EXPIRES_IN` | No | `15m` | Access token lifetime |
| `REFRESH_TOKEN_DAYS` | No | `7` | Refresh token lifetime in days |
| `CSRF_SECRET` | No | Falls back to `JWT_SECRET` | Secret for CSRF double-submit cookie |

### CORS

| Variable | Required | Default | Description |
|---|---|---|---|
| `CLIENT_ORIGIN` | No | `http://localhost:5173` | Single frontend origin |
| `CLIENT_ORIGINS` | No | — | Comma-separated list for multiple origins |
| `COOKIE_DOMAIN` | No | — | Cookie domain for cross-subdomain deployments |

### AI Provider Layer

| Variable | Required | Default | Description |
|---|---|---|---|
| `OPENROUTER_API_KEY` | No* | — | API key from [openrouter.ai](https://openrouter.ai). Required for AI features |
| `OPENROUTER_BASE_URL` | No | `https://openrouter.ai/api/v1` | Override for self-hosted OpenRouter-compatible endpoints |
| `OPENROUTER_TIMEOUT` | No | `30000` | Request timeout in milliseconds |
| `GEMINI_API_KEY` | No* | — | API key from [Google AI Studio](https://aistudio.google.com). Required for Gemini fallback |
| `AI_PRIMARY_PROVIDER` | No | `openrouter` | Primary AI provider. Options: `openrouter` |
| `AI_FALLBACK_PROVIDER` | No | `gemini` | Secondary fallback provider. Options: `gemini` |

*If neither API key is set, the Local Intelligence Engine will be used for all AI requests.

### Caching

| Variable | Required | Default | Description |
|---|---|---|---|
| `CACHE_TTL` | No | `1800` | Cache time-to-live in seconds (30 minutes) |
| `CACHE_PROVIDER` | No | `memory` | Cache backend. Options: `memory` (default) or `redis` (future) |

---

## Client — `client/.env`

Copy the template:
```bash
cp client/.env.example client/.env
```

| Variable | Required | Default | Description |
|---|---|---|---|
| `VITE_API_URL` | No | `http://localhost:5000/api` | Backend API base URL. Must be updated for production |

---

## Production Checklist

Before deploying to production, verify:

- [ ] `JWT_SECRET` is a cryptographically random 64-byte string (never use the default)
- [ ] `NODE_ENV=production`
- [ ] `TRUST_PROXY=true` if behind Render, Nginx, or a load balancer
- [ ] `MONGO_URI` points to your production MongoDB Atlas cluster
- [ ] `CLIENT_ORIGIN` is set to your production frontend URL
- [ ] `OPENROUTER_API_KEY` and/or `GEMINI_API_KEY` are configured
- [ ] `VITE_API_URL` in the client points to your production backend URL
- [ ] No `.env` files committed to Git

---

## Generating a Secure JWT Secret

```bash
node -e "const { randomBytes } = require('crypto'); console.log(randomBytes(64).toString('hex'));"
```

Or using Python:
```bash
python -c "from secrets import token_hex; print(token_hex(64))"
```
