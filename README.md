<div align="center">

# 🧠 SmartQuiz AI

**Enterprise-Grade AI-Powered Learning Platform**

[![Node.js](https://img.shields.io/badge/Node.js-24+-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/atlas)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)](https://www.docker.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![Version](https://img.shields.io/badge/version-1.0.0-blue)](./docs/CHANGELOG.md)

*Personalized quizzes • AI explanations • Real-time analytics • Gamification*

[📖 Documentation](./docs/) · [🚀 Installation](#-quick-start) · [🤝 Contributing](./docs/CONTRIBUTING.md) · [🐛 Issues](https://github.com/thoufiqumar7/AI-Quiz-APP/issues)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [AI Provider Layer](#-ai-provider-layer)
- [Project Structure](#-project-structure)
- [Quick Start](#-quick-start)
- [Environment Variables](#-environment-variables)
- [Docker](#-docker)
- [API Overview](#-api-overview)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Admin Panel](#-admin-panel)
- [Security](#-security)
- [Performance](#-performance)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [License](#-license)
- [Acknowledgements](#-acknowledgements)

---

## 🌟 Overview

**SmartQuiz AI** is a production-ready, full-stack learning platform that leverages a resilient multi-provider AI gateway to generate personalized quizzes, deliver intelligent explanations, and adapt to individual student learning patterns.

Built on the **MERN stack** with a clean, layered architecture and a highly available **AI Gateway** that seamlessly cascades through **OpenRouter → Google Gemini → Local Intelligence Engine**, ensuring the platform remains fully operational even during complete external API outages.

---

## ✨ Features

### 🤖 AI-Powered Learning
| Feature | Description |
|---|---|
| **Dynamic Quiz Generation** | Generates topic-specific, difficulty-adjusted MCQs in real time |
| **Smart Answer Explanations** | Socratic explanations for incorrect answers to reinforce understanding |
| **Adaptive Recommendations** | Personalized study roadmaps targeting identified weak areas |
| **AI Chatbot** | Streaming educational assistant powered by LLMs |
| **Offline Intelligence Engine** | Zero-dependency rule-based fallback for uninterrupted service |

### 🎮 Gamification & Engagement
| Feature | Description |
|---|---|
| **XP & Levelling** | Earn experience points with every completed quiz |
| **Daily Streaks** | Consecutive-day bonus multipliers |
| **Achievements & Badges** | Unlock 6 achievement categories as milestones are reached |
| **Daily Challenges** | Time-boxed challenge quizzes with XP rewards |
| **Global Leaderboards** | Weekly, monthly, and all-time rankings |

### 📊 Analytics & Insights
- **Performance Dashboard** — Score and accuracy trends over time with Recharts visualizations
- **Topic Mastery Breakdown** — Per-subject accuracy with weak-topic detection
- **Detailed Quiz History** — Paginated session records with answer-level breakdowns
- **Social Sharing** — Share achievements and results with canvas-generated cards

### 🔐 Security
- JWT + rotating Refresh Tokens (httpOnly cookies, SHA-256 hashed)
- CSRF double-submit cookie protection
- Zod schema validation on every input
- XSS and NoSQL injection sanitization
- Automatic refresh token reuse detection (all sessions revoked on reuse)
- Two-tier rate limiting (300 req/15min general, 40 req/15min auth)

### 🛡️ Admin Panel
- Full user management (block, unblock, role assignment)
- Question & Category CRUD with duplicate detection
- Achievement & Challenge management
- Structured audit logging for all admin actions
- **Real-time AI Monitoring Dashboard** — provider health, model status, latency, token usage, fallback counters

---

## 🛠 Tech Stack

### Backend
| Layer | Technology |
|---|---|
| Runtime | Node.js 24 |
| Framework | Express.js 4 |
| Database | MongoDB 6 + Mongoose 8 |
| Auth | JWT + bcrypt + Refresh Tokens |
| Validation | Zod |
| Logging | Pino (structured JSON) |
| Security | Helmet, CORS allowlist, express-rate-limit |
| Testing | Jest + Supertest + mongodb-memory-server |

### Frontend
| Layer | Technology |
|---|---|
| Framework | React 18 + Vite 5 |
| Routing | React Router 6 |
| Styling | Tailwind CSS 3 |
| Animations | Framer Motion 11 |
| Charts | Recharts 2 |
| HTTP Client | Axios |
| Testing | Vitest + React Testing Library |

### AI Layer
| Provider | Role | Models |
|---|---|---|
| **OpenRouter** | Primary | Llama 3.3 70B, Deepseek R1, Mistral Small 3.2, Gemma 3 27B, Qwen3 Coder |
| **Google Gemini** | Secondary Fallback | Gemini 2.5 Flash |
| **Local Intelligence** | Tertiary Offline Fallback | Rule-based + MongoDB question bank |

### DevOps
| Tool | Purpose |
|---|---|
| Docker + Docker Compose | Containerization |
| GitHub Actions | CI pipeline (test → build) |
| Render | Backend hosting |
| Vercel | Frontend hosting |

---

## 🏗 Architecture

SmartQuiz AI follows a standard **MVC architecture** on the backend, extended with a **Clean Architecture–inspired AI Gateway**.

```
┌─────────────────────────────────────────┐
│              Client (React)             │
│  Pages → Services → Axios → /api/...   │
└─────────────────┬───────────────────────┘
                  │ HTTPS
┌─────────────────▼───────────────────────┐
│         Express.js Server               │
│  Route → Zod Validation → Middleware    │
│  → Controller → Service → Model → DB   │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│           AI Gateway                    │
│  ProviderFactory                        │
│    ├── OpenRouter (Primary)             │
│    │     └── ModelSelector (Round-Robin)│
│    │     └── CircuitBreaker (5min trip) │
│    │     └── RetryManager (1s→2s→4s)   │
│    ├── Gemini (Secondary)               │
│    └── Local Intelligence (Offline)    │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│           MongoDB Atlas                 │
│  Users · Questions · QuizSessions      │
│  Analytics · AIUsageMetrics (TTL 30d)  │
└─────────────────────────────────────────┘
```

For the full diagram and subsystem documentation see [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md).

---

## 🤖 AI Provider Layer

The AI Gateway is the most sophisticated component of SmartQuiz AI. It provides **zero-downtime AI responses** through a multi-tier fallback chain.

### Provider Priority Chain

```
Client Request
      │
      ▼
 ┌────────────────────────────────────────┐
 │  1. OpenRouter (Primary)               │
 │     • 5 free model rotation           │
 │     • Round-robin + health-based       │
 │     • Circuit breaker (5-min trip)    │
 │     • Exponential backoff (1s/2s/4s)  │
 └──────────────────┬─────────────────────┘
                    │ ALL models fail
                    ▼
 ┌──────────────────────────────────────-─┐
 │  2. Google Gemini (Secondary)          │
 │     • gemini-2.5-flash                 │
 │     • Retry on 429/5xx                 │
 └──────────────────┬─────────────────────┘
                    │ Gemini fails
                    ▼
 ┌────────────────────────────────────────┐
 │  3. Local Intelligence Engine          │
 │     • Zero internet required           │
 │     • MongoDB question bank queries   │
 │     • Rule-based generation           │
 └──────────────────┬─────────────────────┘
                    │ All fail
                    ▼
            Graceful Error Response
```

### Key Components

| Component | Purpose |
|---|---|
| `ProviderFactory` | Orchestrates provider priority and fallback |
| `ModelSelector` | Round-robin + health-based OpenRouter model selection |
| `CircuitBreaker` | Disables failing models for 5-minute cooldown |
| `RetryManager` | Exponential backoff (1s → 2s → 4s) on transient errors |
| `CacheFactory` | Configurable cache layer (Memory/Redis-ready) |
| `UsageTracker` | In-memory real-time telemetry |
| `MetricsPersister` | Flushes aggregated metrics to MongoDB every 5 minutes |

### Configured OpenRouter Models (Free Tier)
1. `meta-llama/llama-3.3-70b-instruct:free`
2. `deepseek/deepseek-r1:free`
3. `mistralai/mistral-small-3.2-24b-instruct:free`
4. `google/gemma-3-27b-it:free`
5. `qwen/qwen3-coder:free`

### Caching Policy
| Endpoint | Cached | TTL |
|---|---|---|
| `/api/ai/generate-quiz` | ✅ Yes | 30 min |
| `/api/ai/explain` | ✅ Yes | 30 min |
| `/api/ai/recommend` | ✅ Yes | 30 min |
| `/api/ai/chat` | ❌ No | — |

Cache keys are **SHA-256 hashes** of the normalized prompt to prevent key bloat.

For detailed AI documentation see [docs/AI_PROVIDER_LAYER.md](./docs/AI_PROVIDER_LAYER.md).

---

## 📁 Project Structure

```
AI-QUIZ-APP/
├── client/                          # React 18 + Vite Frontend
│   ├── src/
│   │   ├── components/              # Reusable UI components
│   │   │   ├── admin/               # Admin panel components
│   │   │   ├── analytics/           # Chart and metric components
│   │   │   ├── common/              # Shared components (Loader, Modal, etc.)
│   │   │   └── quiz/                # Quiz-specific components
│   │   ├── context/                 # React contexts (Auth, Theme)
│   │   ├── hooks/                   # Custom React hooks
│   │   ├── layouts/                 # Page layouts (MainLayout, AdminLayout)
│   │   ├── pages/                   # Route views
│   │   │   ├── admin/               # Admin panel pages
│   │   │   ├── HomePage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── QuizPage.jsx
│   │   │   └── ...
│   │   ├── routes/                  # AppRoutes and ProtectedRoute
│   │   ├── services/                # API client (Axios wrappers)
│   │   ├── styles/                  # Global CSS
│   │   ├── test/                    # Frontend tests (Vitest + RTL)
│   │   └── utils/                   # Helpers and formatters
│   ├── Dockerfile                   # Nginx-served production build
│   └── vercel.json                  # Vercel SPA routing config
│
├── server/                          # Express.js + Node.js Backend
│   ├── config/                      # env.js, logger.js
│   ├── controllers/                 # Route handlers (12 controllers)
│   ├── database/                    # connectDB.js + seed scripts
│   ├── middleware/                  # auth, csrf, sanitize, validate, errorHandlers
│   ├── models/                      # Mongoose schemas (11 models)
│   ├── routes/                      # API route definitions (12 routers)
│   ├── services/
│   │   ├── ai/                      # AI Gateway (15 modules)
│   │   │   ├── ProviderFactory.js   # Orchestrator
│   │   │   ├── OpenRouterProvider.js
│   │   │   ├── GeminiProvider.js
│   │   │   ├── LocalIntelligenceProvider.js
│   │   │   ├── CircuitBreaker.js
│   │   │   ├── RetryManager.js
│   │   │   ├── ModelSelector.js
│   │   │   ├── CacheFactory.js
│   │   │   ├── MemoryCacheProvider.js
│   │   │   ├── UsageTracker.js
│   │   │   ├── MetricsPersister.js
│   │   │   ├── PromptTemplates.js
│   │   │   ├── ResponseFormatter.js
│   │   │   └── AIProvider.js
│   │   └── *.js                     # Business logic services
│   ├── tests/                       # Jest integration + AI tests
│   ├── app.js                       # Express app config
│   └── server.js                    # Entry point
│
├── shared/                          # Shared JS constants and types
├── docs/                            # Full project documentation
├── .github/workflows/               # CI/CD (GitHub Actions)
├── docker-compose.yml               # Full-stack local orchestration
├── render.yaml                      # Render.com deployment config
├── .gitignore
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** v24.18.0 or higher
- **MongoDB** (local) or a **MongoDB Atlas** cluster URI
- **Git**
- An **OpenRouter API Key** (free at [openrouter.ai](https://openrouter.ai))
- *(Optional)* **Google Gemini API Key** for AI fallback

### 1. Clone the Repository

```bash
git clone https://github.com/thoufiqumar7/AI-Quiz-APP.git
cd AI-QUIZ-APP
```

### 2. Configure Environment Variables

```bash
# Server
cp server/.env.example server/.env
# Edit server/.env and fill in MONGO_URI, JWT_SECRET, OPENROUTER_API_KEY

# Client
cp client/.env.example client/.env
# VITE_API_URL defaults to http://localhost:5000/api
```

### 3. Install Dependencies

```bash
# Backend
cd server && npm install

# Frontend
cd ../client && npm install
```

### 4. Seed the Database *(Optional)*

```bash
cd server
npm run seed:quiz
```

### 5. Start Development Servers

```bash
# In one terminal — Backend
cd server && npm run dev

# In another terminal — Frontend
cd client && npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🔑 Environment Variables

### `server/.env`

```env
# ── Core ─────────────────────────────────────────
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/smartquiz_ai

# ── Authentication ────────────────────────────────
JWT_SECRET=your_64_byte_secure_secret_here
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_DAYS=7

# ── CORS ─────────────────────────────────────────
CLIENT_ORIGIN=http://localhost:5173

# ── AI Provider Layer ─────────────────────────────
OPENROUTER_API_KEY=sk-or-...
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_TIMEOUT=30000

GEMINI_API_KEY=AIza...
AI_PRIMARY_PROVIDER=openrouter
AI_FALLBACK_PROVIDER=gemini

# ── Caching ───────────────────────────────────────
CACHE_TTL=1800
CACHE_PROVIDER=memory
```

### `client/.env`

```env
VITE_API_URL=http://localhost:5000/api
```

> ⚠️ **Never commit `.env` files.** Only `.env.example` files are tracked in version control.

For a comprehensive environment variable reference, see [docs/ENVIRONMENT.md](./docs/ENVIRONMENT.md).

---

## 🐳 Docker

Run the entire stack (client + server + MongoDB) with one command:

```bash
docker-compose up --build
```

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:5000 |
| MongoDB | localhost:27017 |

> ⚠️ For production, replace the placeholder `JWT_SECRET` in `docker-compose.yml` with a real secret or use Docker secrets.

---

## 🔌 API Overview

All endpoints are under `/api`. Authenticated endpoints require a valid `Authorization: Bearer <token>` header.

### Auth
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register new user |
| `POST` | `/api/auth/login` | Login, receive access + refresh tokens |
| `POST` | `/api/auth/refresh` | Rotate refresh token |
| `POST` | `/api/auth/logout` | Invalidate session |

### AI Gateway
| Method | Endpoint | Description | Cached |
|---|---|---|---|
| `POST` | `/api/ai/chat` | Streaming educational chatbot (SSE) | ❌ |
| `POST` | `/api/ai/generate-quiz` | Generate AI quiz by topic + difficulty | ✅ |
| `POST` | `/api/ai/explain` | Explain a quiz answer | ✅ |
| `POST` | `/api/ai/recommend` | Get personalized study recommendations | ✅ |
| `GET` | `/api/ai/status` | Admin: real-time provider health & metrics | — |

### Quiz & Learning
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/quiz/start` | Start a new quiz session |
| `POST` | `/api/quiz/submit` | Submit answer for current question |
| `POST` | `/api/quiz/complete` | Complete session and receive results |
| `GET` | `/api/quiz/history` | Paginated quiz history |
| `GET` | `/api/leaderboard` | Global / weekly / monthly rankings |
| `GET` | `/api/achievements` | User's unlocked achievements |
| `GET` | `/api/recommendations` | Personalized category recommendations |

### Admin
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/admin/stats` | Platform-wide aggregate statistics |
| `GET/PATCH/DELETE` | `/api/admin/users` | User management |
| `GET/POST/PATCH/DELETE` | `/api/admin/questions` | Question management |
| `GET/POST/PATCH/DELETE` | `/api/admin/categories` | Category management |

Full endpoint documentation: [docs/API.md](./docs/API.md)

---

## 🧪 Testing

### Backend Tests (Jest + Supertest)

```bash
cd server

# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

Tests include:
- **Integration tests** for all major API routes
- **AI Gateway tests** (`ai.test.js`) — circuit breaker, model rotation, fallback sequencing
- **Load tests** (`ai.loadtest.js`) — 100 concurrent request simulation
- **Stress tests** (`ai.stresstest.js`) — forced outage and recovery validation

### Frontend Tests (Vitest + React Testing Library)

```bash
cd client

# Run all tests
npm test

# Run with coverage
npm run test:coverage
```

See [docs/TESTING.md](./docs/TESTING.md) for the complete testing guide.

---

## 🚢 Deployment

### Render (Backend)

The included `render.yaml` configures automatic deployment.
1. Connect your GitHub repository to [Render](https://render.com).
2. Set all environment variables in the Render dashboard.
3. Deploy automatically on every push to `main`.

### Vercel (Frontend)

1. Connect the `client/` folder to [Vercel](https://vercel.com).
2. Set `VITE_API_URL` to your Render backend URL.
3. The included `client/vercel.json` handles SPA routing automatically.

### MongoDB Atlas

1. Create a free cluster at [cloud.mongodb.com](https://cloud.mongodb.com).
2. Whitelist your server's IP address.
3. Use the Atlas connection string as `MONGO_URI`.

Full deployment guide: [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md)

---

## 🛡️ Admin Panel

The admin panel is accessible at `/admin` (requires `role: admin`).

| Section | Capabilities |
|---|---|
| **Overview** | Platform stats, active users, quiz counts |
| **Users** | Search, filter, block/unblock, change roles |
| **Questions** | CRUD with duplicate detection |
| **Categories** | CRUD with referential integrity checks |
| **Challenges** | Daily challenge management |
| **Achievements** | Badge and condition management |
| **AI Monitoring** | Real-time provider health, model status, latency, cache hit ratio, fallback counters |

---

## 🔒 Security

| Layer | Implementation |
|---|---|
| **Password Hashing** | bcrypt (salt rounds: 12) |
| **Access Tokens** | JWT, 15-minute expiry |
| **Refresh Tokens** | SHA-256 hashed, httpOnly cookies, 7-day rotation |
| **Token Reuse Detection** | Full session revocation on reuse attempt |
| **CSRF Protection** | Double-submit cookie pattern |
| **Input Validation** | Zod schemas on all endpoints |
| **XSS Prevention** | `xss` library sanitization middleware |
| **Injection Prevention** | NoSQL injection sanitization |
| **Rate Limiting** | 300/15min (global), 40/15min (auth) |
| **Prompt Injection** | Pattern-matching mitigation on AI inputs |
| **Security Headers** | Helmet.js with strict CSP |

See [docs/SECURITY.md](./docs/SECURITY.md) for full threat model and mitigations.

---

## ⚡ Performance

- **AI Response Caching** — SHA-256 keyed, 30-minute TTL, eliminates redundant API calls
- **Cache Hit Ratio** — ~85% for repeated quiz topic queries
- **Compression** — GZIP for all API responses > 1 KB
- **Code Splitting** — Recharts, Framer Motion, and html2canvas in separate async chunks
- **DB Indexes** — Compound indexes on all high-frequency query paths
- **Structured Logging** — Pino JSON logging with minimal overhead

---

## 🗺️ Roadmap

### v1.1.0 (Planned)
- [ ] OAuth 2.0 login (Google, GitHub)
- [ ] Email notifications for achievements and daily challenges

### v1.2.0 (Planned)
- [ ] Real-time multiplayer quiz mode (WebSockets)
- [ ] AI-powered question expansion from uploaded PDFs

### v1.3.0 (Planned)
- [ ] Redis-backed distributed cache (`CACHE_PROVIDER=redis`)
- [ ] Prometheus + Grafana observability stack
- [ ] GraphQL API layer for complex analytics queries

---

## 🤝 Contributing

We welcome contributions! Please read our [Contributing Guide](./docs/CONTRIBUTING.md) before submitting a pull request.

### Quick Contribution Flow

```bash
# 1. Fork and clone
git clone https://github.com/YOUR_USERNAME/AI-Quiz-APP.git

# 2. Create a feature branch
git checkout -b feat/your-feature-name

# 3. Make your changes, then test
cd server && npm test
cd ../client && npm test

# 4. Commit using Conventional Commits
git commit -m "feat: add new quiz generation strategy"

# 5. Open a pull request against main
```

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](./LICENSE) file for details.

---

## 🙏 Acknowledgements

- [OpenRouter](https://openrouter.ai) — Unified access to open-source LLMs
- [Google Gemini](https://ai.google.dev) — Powerful generative AI fallback
- [MongoDB Atlas](https://www.mongodb.com/atlas) — Managed cloud database
- [Tailwind CSS](https://tailwindcss.com) — Utility-first CSS framework
- [Heroicons](https://heroicons.com) — Beautiful SVG icons
- [Recharts](https://recharts.org) — React chart library
- [Framer Motion](https://www.framer.com/motion/) — Production-ready animation library

---

<div align="center">

Built with ❤️ by [thoufiqumar7](https://github.com/thoufiqumar7)

⭐ Star this repo if you find it useful!

</div>
