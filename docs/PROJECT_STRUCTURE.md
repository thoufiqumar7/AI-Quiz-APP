# Project Structure — SmartQuiz AI

Annotated directory tree for the entire SmartQuiz AI codebase.

---

```
AI-QUIZ-APP/
│
├── client/                              # Vite + React 18 Frontend SPA
│   ├── src/
│   │   ├── components/
│   │   │   ├── admin/
│   │   │   │   ├── AdminSidebar.jsx     # Admin nav sidebar
│   │   │   │   └── AIMonitoringDashboard.jsx  # AI telemetry dashboard
│   │   │   ├── analytics/              # Analytics chart components
│   │   │   ├── common/
│   │   │   │   ├── Loader.jsx
│   │   │   │   ├── Modal.jsx
│   │   │   │   └── ...
│   │   │   └── quiz/                   # Quiz UI components
│   │   │
│   │   ├── context/
│   │   │   └── AuthContext.jsx         # Global auth state
│   │   │
│   │   ├── hooks/                      # Custom React hooks
│   │   │
│   │   ├── layouts/
│   │   │   ├── MainLayout.jsx          # Default layout with nav
│   │   │   └── AdminLayout.jsx         # Admin panel layout with sidebar
│   │   │
│   │   ├── pages/
│   │   │   ├── HomePage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── CategoriesPage.jsx
│   │   │   ├── QuizSetupPage.jsx
│   │   │   ├── QuizPage.jsx
│   │   │   ├── ResultPage.jsx
│   │   │   ├── HistoryPage.jsx
│   │   │   ├── LeaderboardPage.jsx
│   │   │   ├── AnalyticsDashboard.jsx
│   │   │   ├── PerformancePage.jsx
│   │   │   ├── TopicAnalysisPage.jsx
│   │   │   ├── RecommendationsPage.jsx
│   │   │   ├── AchievementsPage.jsx
│   │   │   ├── ChallengesPage.jsx
│   │   │   ├── GamificationDashboard.jsx
│   │   │   ├── SocialSharePage.jsx
│   │   │   └── admin/
│   │   │       ├── AdminDashboard.jsx
│   │   │       ├── UserManagement.jsx
│   │   │       ├── QuestionManagement.jsx
│   │   │       ├── CategoryManagement.jsx
│   │   │       ├── ChallengeManagement.jsx
│   │   │       ├── AchievementManagement.jsx
│   │   │       └── AIMonitoringDashboard.jsx
│   │   │
│   │   ├── routes/
│   │   │   ├── AppRoutes.jsx           # Central route definitions
│   │   │   └── ProtectedRoute.jsx      # Auth guard HOC
│   │   │
│   │   ├── services/
│   │   │   ├── api.js                  # Axios instance with interceptors
│   │   │   ├── authService.js
│   │   │   ├── quizService.js
│   │   │   ├── analyticsService.js
│   │   │   ├── aiService.js            # AI Gateway client
│   │   │   └── ...
│   │   │
│   │   ├── styles/                     # Global CSS
│   │   ├── test/                       # Vitest + RTL test files
│   │   ├── utils/                      # Date formatters, helpers
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── Dockerfile                      # Multi-stage: Vite build → Nginx serve
│   ├── vercel.json                     # SPA fallback routing for Vercel
│   ├── vite.config.js                  # Vite config with code splitting
│   ├── tailwind.config.js
│   └── .env.example
│
├── server/                             # Express.js + Node.js Backend
│   ├── config/
│   │   ├── env.js                      # Centralised env validation and export
│   │   └── logger.js                   # Pino structured logger
│   │
│   ├── controllers/                    # Route handler layer (12 controllers)
│   │   ├── authController.js
│   │   ├── quizController.js
│   │   ├── adminController.js
│   │   ├── aiController.js             # AI endpoint handlers
│   │   ├── analyticsController.js
│   │   └── ...
│   │
│   ├── database/
│   │   ├── connectDB.js                # Mongoose connection
│   │   └── seedQuizData.js             # Dev seed script
│   │
│   ├── middleware/
│   │   ├── auth.js                     # requireAuth, requireRole
│   │   ├── csrf.js                     # CSRF double-submit cookie
│   │   ├── sanitize.js                 # XSS + NoSQL injection sanitizer
│   │   ├── validate.js                 # Zod validation factory
│   │   └── errorHandlers.js            # notFoundHandler, errorHandler
│   │
│   ├── models/                         # Mongoose schemas (11 models)
│   │   ├── User.js
│   │   ├── RefreshToken.js
│   │   ├── Question.js
│   │   ├── QuizSession.js
│   │   ├── AIUsageMetrics.js           # 30-day TTL index
│   │   └── ...
│   │
│   ├── routes/                         # Express routers (12 routers)
│   │   ├── authRoutes.js
│   │   ├── aiRoutes.js                 # /api/ai/* with Zod + injection mitigation
│   │   ├── adminRoutes.js
│   │   └── ...
│   │
│   ├── services/
│   │   ├── ai/                         # AI Gateway layer (15 modules)
│   │   │   ├── AIProvider.js           # Abstract base class
│   │   │   ├── ProviderFactory.js      # Orchestrator + fallback logic
│   │   │   ├── OpenRouterProvider.js   # Primary LLM provider
│   │   │   ├── GeminiProvider.js       # Gemini fallback
│   │   │   ├── LocalIntelligenceProvider.js  # Offline engine
│   │   │   ├── ModelSelector.js        # Round-robin + health selection
│   │   │   ├── CircuitBreaker.js       # Per-model failure isolation
│   │   │   ├── RetryManager.js         # Exponential backoff
│   │   │   ├── PromptTemplates.js      # Centralised prompts
│   │   │   ├── ResponseFormatter.js    # Normalised output schema
│   │   │   ├── CacheProvider.js        # Abstract cache interface
│   │   │   ├── CacheFactory.js         # Cache provider selection
│   │   │   ├── MemoryCacheProvider.js  # In-memory Map cache
│   │   │   ├── UsageTracker.js         # Real-time metrics
│   │   │   └── MetricsPersister.js     # 5-min MongoDB flush
│   │   ├── analyticsService.js
│   │   ├── achievementService.js
│   │   └── ...
│   │
│   ├── tests/                          # Jest test suite
│   │   ├── setupEnv.js
│   │   ├── setupDb.js
│   │   ├── auth.test.js
│   │   ├── quiz.test.js
│   │   ├── ai.test.js
│   │   ├── ai.loadtest.js
│   │   └── ai.stresstest.js
│   │
│   ├── utils/                          # Shared utility functions
│   ├── app.js                          # Express application + middleware chain
│   ├── server.js                       # Entry point (listen, graceful shutdown)
│   ├── Dockerfile
│   └── .env.example
│
├── shared/                             # Shared JS constants (no runtime deps)
│   └── constants/
│
├── docs/                               # Project documentation
│   ├── ARCHITECTURE.md
│   ├── AI_PROVIDER_LAYER.md
│   ├── API.md
│   ├── DATABASE.md
│   ├── DEPLOYMENT.md
│   ├── ENVIRONMENT.md
│   ├── INSTALLATION.md
│   ├── PROJECT_STRUCTURE.md
│   ├── SECURITY.md
│   ├── TESTING.md
│   ├── CONTRIBUTING.md
│   ├── CHANGELOG.md
│   ├── FAQ.md
│   └── TROUBLESHOOTING.md
│
├── .github/
│   └── workflows/
│       └── ci.yml                      # CI: test → build on push/PR
│
├── docker-compose.yml                  # Full-stack Docker orchestration
├── render.yaml                         # Render deployment blueprint
├── .gitignore
├── LICENSE
└── README.md
```
