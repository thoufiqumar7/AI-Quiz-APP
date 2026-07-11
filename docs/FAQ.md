# FAQ — SmartQuiz AI

Frequently asked questions about installing, using, and extending SmartQuiz AI.

---

## General

### What is SmartQuiz AI?

SmartQuiz AI is an open-source, enterprise-grade learning platform that uses AI to generate personalized quizzes, explain answers, and track student mastery. It is built on the MERN stack (MongoDB, Express, React, Node.js) with a resilient multi-provider AI Gateway.

---

### Is an AI API key required to run the app?

No. If no API key is configured, the **Local Intelligence Engine** activates automatically. It generates quizzes from the MongoDB question bank using rule-based logic, with no internet connection required. The platform remains fully functional — AI-powered features just won't use external LLMs.

---

### Which AI providers are supported?

| Priority | Provider | Notes |
|---|---|---|
| 1 | OpenRouter | 5 free models (Llama, Deepseek, Mistral, Gemma, Qwen) |
| 2 | Google Gemini | gemini-2.5-flash |
| 3 | Local Intelligence Engine | Offline, MongoDB-backed |

---

### What happens if OpenRouter is down?

The Circuit Breaker automatically detects failures. After 3 consecutive errors on a model, it trips that model for 5 minutes. If all 5 OpenRouter models fail, the system automatically falls back to Gemini. If Gemini also fails, the Local Intelligence Engine handles the request.

---

## Installation & Setup

### I get `MONGO_URI is required` on startup. What do I do?

You haven't created a `.env` file. Run:
```bash
cp server/.env.example server/.env
```
Then edit `server/.env` and add a valid `MONGO_URI`.

---

### How do I generate a secure JWT secret?

```bash
node -e "require('crypto').randomBytes(64).toString('hex') |> console.log"
```

Or using Python:
```bash
python -c "from secrets import token_hex; print(token_hex(64))"
```

---

### Where do I get an OpenRouter API key?

1. Go to [openrouter.ai](https://openrouter.ai)
2. Create a free account
3. Navigate to **Keys** and generate a key
4. Add it to `server/.env` as `OPENROUTER_API_KEY=sk-or-...`

Free accounts have access to all 5 models used by SmartQuiz AI.

---

### How do I create an admin account?

1. Register a normal account through the UI
2. Access MongoDB (Compass or Atlas) and update the user:
```javascript
db.users.updateOne({ email: "your@email.com" }, { $set: { role: "admin" } })
```
3. Log out and log back in — the Admin Panel will appear at `/admin`

---

### How do I seed the database with sample questions?

```bash
cd server
npm run seed:quiz
```

This creates sample categories and questions for immediate testing.

---

## Features

### Are chatbot conversations cached?

No. The chatbot (`POST /api/ai/chat`) is never cached. Only quiz generation, explanations, and recommendations are cached (30-minute TTL using SHA-256 keys).

---

### What does the AI Monitoring Dashboard show?

Available at `/admin/ai-monitoring` (admin/moderator only):
- Current active provider
- Health status of each OpenRouter model (healthy / in cooldown)
- Real-time metrics: requests, token usage, average latency, fallback count
- Offline response count

---

### Can I add more OpenRouter models?

Yes. Edit `server/services/ai/ModelSelector.js` and add your model to the `this.models` array:

```js
this.models = [
  'meta-llama/llama-3.3-70b-instruct:free',
  // Add your model here
  'your-new-model:free'
];
```

No other changes are required. The circuit breaker and retry manager apply automatically.

---

### Can I add a completely new AI provider (e.g., Cohere)?

Yes. The system is designed for this:
1. Create `CoherProvider.js` extending `AIProvider`
2. Implement `generateText()` and `generateStream()` using `ResponseFormatter.success()`
3. Register it in `ProviderFactory.js` with the desired priority

No controller or route changes are needed.

---

### How do I switch to Redis caching?

Set `CACHE_PROVIDER=redis` in `server/.env` and implement `RedisCacheProvider.js` extending `CacheProvider`. The `CacheFactory.js` will automatically load it. No changes to controllers or `ProviderFactory` are required.

---

## Docker & Deployment

### How do I run the full stack with Docker?

```bash
docker-compose up --build
```

This starts MongoDB, the API server, and the Nginx-served frontend simultaneously.

---

### Why does Docker Compose use a hardcoded `JWT_SECRET`?

The `docker-compose.yml` includes a placeholder `dev-secret-key-change-in-prod` for development convenience. **Always replace this with a secure secret before running in any shared or production environment.**

---

### How do I deploy to Render + Vercel?

See the full guide in [docs/DEPLOYMENT.md](./DEPLOYMENT.md). In summary:
- Backend → Render Web Service (root: `server/`)
- Frontend → Vercel (root: `client/`)
- Database → MongoDB Atlas

---

## Security

### Are API keys ever exposed to the frontend?

Never. API keys are stored in `server/.env` only. The frontend communicates exclusively with `/api/ai/*` endpoints. Provider implementation is completely hidden behind the AI Gateway.

---

### What protection exists against prompt injection?

The AI Gateway applies a regex filter to all user inputs that detects explicit system-manipulation patterns such as `"ignore previous instructions"` or `"reveal your system prompt"`. Educational content — including questions about code, SQL injection, or shell commands — is explicitly **not** blocked.

---

### Can I report a security vulnerability?

Please **do not** open a public GitHub issue for security vulnerabilities. Instead, email the maintainer directly or use GitHub's private security advisory feature.
