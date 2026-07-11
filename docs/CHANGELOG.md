# Changelog — SmartQuiz AI

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] — 2026-07-11

Initial production release of SmartQuiz AI.

### Added

#### AI Provider Layer (New in v1.0.0)
- Enterprise-grade AI Gateway with cascading multi-provider fallback
- **OpenRouter** as the primary provider (5 free model rotation: Llama 3.3 70B, Deepseek R1, Mistral Small 3.2, Gemma 3 27B, Qwen3 Coder)
- **Google Gemini** (gemini-2.5-flash) as the secondary fallback
- **Local Intelligence Engine** — fully offline, rule-based quiz generation from MongoDB question bank
- Per-model `CircuitBreaker` — 3 failure threshold, 5-minute cooldown, automatic recovery
- `RetryManager` — exponential backoff retries (1s → 2s → 4s) for 429/5xx/timeout errors
- `ModelSelector` — round-robin + health-based model selection across 5 OpenRouter models
- Streaming fallback chain: OpenRouter Stream → OpenRouter Block → Gemini Stream → Gemini Block → Local → Graceful Error
- `ResponseFormatter` — standardised `{ success, provider, model, cached, latency, usage, confidence, source, data }` across all providers
- `PromptTemplates` — centralised prompt repository (quiz generation, explanation, recommendation, hint, chatbot)
- `CacheFactory` — configurable cache layer (`CACHE_PROVIDER=memory` by default, Redis-ready interface)
- `MemoryCacheProvider` — SHA-256 keyed in-memory cache, 30-minute TTL, lazy expiry cleanup
- `UsageTracker` — in-memory real-time telemetry (requests, latency, tokens, retries, fallbacks, cache hits)
- `MetricsPersister` — aggregated metrics flushed to MongoDB every 5 minutes with graceful shutdown support
- `AIUsageMetrics` Mongoose model with 30-day TTL index
- AI Controller endpoints: `POST /api/ai/chat` (SSE streaming), `POST /api/ai/generate-quiz`, `POST /api/ai/explain`, `POST /api/ai/recommend`, `GET /api/ai/status`
- Prompt injection mitigation via regex pattern matching on all AI inputs
- Input length enforcement via Zod (message max 1000 chars, topic max 200 chars)
- Frontend `AIMonitoringDashboard` in Admin Panel — real-time provider health, model status, token usage, latency, fallback counters
- `/admin/ai-monitoring` route added to admin layout and sidebar
- `aiService.js` frontend API client

#### Authentication & Security
- User registration and login with bcrypt password hashing (12 salt rounds)
- JWT access tokens with 15-minute expiry
- Rotating refresh tokens stored as SHA-256 hashes (httpOnly cookies)
- Refresh token reuse detection — all sessions revoked on reuse attempt
- CSRF protection via double-submit cookie pattern
- Session management: list, revoke individual, and revoke all sessions
- Maximum 5 concurrent active sessions per user
- Blocked account enforcement at authentication and refresh
- MongoDB TTL index for automatic expired token cleanup

#### Quiz Engine
- Start a quiz by selecting category, difficulty, and question count (5–20)
- Server-side session management with `in_progress` and `completed` states
- Answer submission with full correctness evaluation
- Per-question explanations on the result page
- Time limit enforcement with configurable per-difficulty limits
- Paginated quiz history endpoint

#### Scoring & Gamification
- Score calculation based on correct answers
- Bonus points for speed and active streaks
- XP award system after each completed quiz
- Level system based on cumulative XP thresholds
- Daily streak tracking with longest-streak record
- 6 achievement condition types: `total_quizzes`, `streak_days`, `high_accuracy_quizzes`, `perfect_scores`, `hard_quiz_wins`, `total_xp`
- Badge collection tied to achievement unlocks
- Daily challenges with configurable XP rewards

#### Analytics
- Dashboard analytics: total quizzes, average score, accuracy, streak data
- Performance chart data: score and accuracy over time
- Topic strength analytics: per-topic accuracy breakdown with caching
- Detailed history analytics: full session metadata

#### Leaderboards
- Global leaderboard ranked by XP
- Weekly leaderboard
- Monthly leaderboard
- Paginated results with rank positions

#### Recommendations
- Personalized category recommendations based on weakest topic accuracy
- Cache-busted on demand via `?refresh=true`

#### Social Sharing
- Share payload generation for score, achievement, and profile share types
- Canvas-based social share cards via `html2canvas`

#### Admin Panel
- Admin dashboard with aggregate stats
- User management: list, search, filter, block/unblock, role change, delete
- Role-Based Access Control: `user`, `moderator`, `admin` roles
- Custom permission arrays for moderator granularity
- Question management: full CRUD with duplicate detection
- Category management: full CRUD with referential integrity checks
- Challenge management: full CRUD
- Achievement management: full CRUD with cascade delete from user records
- Structured audit logging for all admin actions
- **AI Monitoring Dashboard**: real-time provider health, model health, latency, retries, fallback count, offline response count, cache hit ratio

#### Infrastructure
- Express application with Helmet (strict CSP), CORS allowlist, GZIP compression
- Pino structured JSON logging with per-request IDs
- Two-tier rate limiting: 300/15min general, 40/15min auth
- Zod schema validation on all request bodies, queries, and params
- XSS and NoSQL injection sanitization middleware
- Global error handler with consistent JSON error format
- Health check: `GET /api/health` (liveness)
- Readiness check: `GET /api/health/ready` (DB connectivity)
- In-memory TTL cache for high-frequency aggregation queries

#### Frontend
- React 18 SPA with React Router 6
- Tailwind CSS 3 design system with dark mode support
- Framer Motion animations throughout
- Recharts data visualizations (line charts, bar charts, stat cards)
- Code-split bundles: `recharts`, `framer-motion`, `html2canvas` in separate chunks
- Protected route HOC for authenticated-only pages
- Admin layout with sidebar for admin panel pages
- Vitest + React Testing Library test infrastructure

#### DevOps & Deployment
- `Dockerfile` for backend (Node.js Alpine)
- `Dockerfile` for frontend (Nginx Alpine serving Vite build)
- `docker-compose.yml` orchestrating client, server, and MongoDB
- `.dockerignore` for lean build contexts
- GitHub Actions CI workflow: install → test → build on push/PR
- `client/vercel.json`: SPA route rewrites for Vercel deployment
- `render.yaml`: Web service definition for Render deployment

#### Documentation
- `README.md`: Professional comprehensive project overview with architecture diagrams
- `docs/ARCHITECTURE.md`: Full system, auth, quiz engine, and AI gateway flow diagrams
- `docs/AI_PROVIDER_LAYER.md`: Complete AI layer technical reference
- `docs/API.md`: Complete REST API reference for all 35+ endpoints
- `docs/DATABASE.md`: All 11 MongoDB collections documented
- `docs/SECURITY.md`: All 10 security layers documented
- `docs/ENVIRONMENT.md`: All environment variables with tables and production checklist
- `docs/INSTALLATION.md`: Three setup options (local, Docker, production)
- `docs/DEPLOYMENT.md`: Render, Vercel, Atlas, and Docker guides with Nginx SSL
- `docs/TESTING.md`: Backend and frontend testing with AI load/stress test documentation
- `docs/PROJECT_STRUCTURE.md`: Fully annotated folder tree (70+ files)
- `docs/CONTRIBUTING.md`: Development workflow and Conventional Commits guide
- `docs/FAQ.md`: Frequently asked questions
- `docs/TROUBLESHOOTING.md`: Common issues and solutions
- `docs/CHANGELOG.md`: This file

---

## Future Releases

### [1.1.0] — Planned
- OAuth 2.0 login (Google, GitHub)
- Email notifications for achievements and daily challenges
- Hint generation endpoint (`POST /api/ai/hint`)

### [1.2.0] — Planned
- Real-time quiz multiplayer mode (WebSockets)
- AI-powered question generation from uploaded PDFs

### [1.3.0] — Planned
- Redis-backed distributed cache (`CACHE_PROVIDER=redis`)
- Prometheus + Grafana observability stack
- GraphQL API layer for complex analytics queries
