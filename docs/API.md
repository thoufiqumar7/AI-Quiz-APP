# API Reference — SmartQuiz AI

Complete REST API reference for all endpoints.

**Base URL:** `http://localhost:5000/api` (development)

**Authentication:** Include the JWT as `Authorization: Bearer <token>` on all protected routes.

**Response envelope:**
```json
{
  "success": true | false,
  "message": "Human-readable message",
  "data": { ... }
}
```

---

## Authentication

### `POST /api/auth/register`
Register a new user account.

**Body:**
```json
{ "username": "string", "email": "string", "password": "string (min 8 chars)" }
```

**Response:** `201` — `{ user, accessToken }`

---

### `POST /api/auth/login`
Authenticate and receive tokens.

**Body:**
```json
{ "email": "string", "password": "string" }
```

**Response:** `200` — `{ user, accessToken }` + httpOnly `refreshToken` cookie

---

### `POST /api/auth/refresh`
Rotate the refresh token and receive a new access token.

**Cookies:** `refreshToken` (httpOnly)

**Response:** `200` — `{ accessToken }`

---

### `POST /api/auth/logout`
Invalidate the current refresh token.

**Response:** `200`

---

### `GET /api/auth/sessions`
🔒 *Requires auth*

List all active sessions for the current user.

---

### `DELETE /api/auth/sessions/:id`
🔒 *Requires auth*

Revoke a specific session by ID.

---

### `DELETE /api/auth/sessions`
🔒 *Requires auth*

Revoke all sessions (log out everywhere).

---

## Categories

### `GET /api/categories`
🔒 *Requires auth*

Fetch all quiz categories.

---

## Quiz Engine

### `POST /api/quiz/start`
🔒 *Requires auth*

Start a new quiz session.

**Body:**
```json
{
  "categoryId": "string",
  "difficulty": "easy | medium | hard",
  "count": 5
}
```

**Response:** `201` — `{ sessionId, questions: [...] }`

---

### `POST /api/quiz/submit`
🔒 *Requires auth*

Submit an answer for the current question.

**Body:**
```json
{
  "sessionId": "string",
  "questionId": "string",
  "answer": "string"
}
```

**Response:** `200` — `{ isCorrect, correctAnswer }`

---

### `POST /api/quiz/complete`
🔒 *Requires auth*

Complete the quiz session and receive results.

**Body:**
```json
{ "sessionId": "string" }
```

**Response:** `200` — `{ score, accuracy, xpAwarded, level, answers: [...] }`

---

### `GET /api/quiz/history`
🔒 *Requires auth*

Paginated quiz history.

**Query:** `?page=1&limit=10`

---

## Leaderboard

### `GET /api/leaderboard`
🔒 *Requires auth*

**Query:** `?period=global | weekly | monthly&page=1&limit=20`

---

## Analytics

### `GET /api/analytics/dashboard`
🔒 *Requires auth*

Summary stats: total quizzes, average score, accuracy, streak data.

---

### `GET /api/analytics/performance`
🔒 *Requires auth*

Score and accuracy chart data over time.

---

### `GET /api/analytics/topics`
🔒 *Requires auth*

Per-topic accuracy breakdown.

---

## Achievements

### `GET /api/achievements`
🔒 *Requires auth*

All unlocked achievements for the current user.

---

## Challenges

### `GET /api/challenges`
🔒 *Requires auth*

Current daily challenge.

### `POST /api/challenges/:id/complete`
🔒 *Requires auth*

Mark a challenge as completed.

---

## Recommendations

### `GET /api/recommendations`
🔒 *Requires auth*

Personalized category recommendations based on weak-topic analysis.

**Query:** `?refresh=true` to bypass cache.

---

## Profile

### `GET /api/profile`
🔒 *Requires auth*

Current user profile.

### `PATCH /api/profile`
🔒 *Requires auth*

Update username or avatar.

**Body:** `{ "username": "string" }`

---

## Social Share

### `POST /api/share/generate`
🔒 *Requires auth*

Generate a shareable payload.

**Body:**
```json
{ "type": "score | achievement | profile", "refId": "string" }
```

---

## AI Gateway

All AI routes require authentication. Inputs are validated via Zod and prompt-injection mitigated.

### `POST /api/ai/chat`
🔒 *Requires auth* | **Streaming (SSE)**

Educational chatbot. Responses are streamed as `text/event-stream`.

**Body:**
```json
{
  "message": "string (max 1000 chars)",
  "history": [{ "role": "user|assistant", "content": "string" }]
}
```

**Response:** SSE stream of `data: {"chunk": "..."}` events, ending with `data: [DONE]`

> ⚠️ Chat responses are **never cached**.

---

### `POST /api/ai/generate-quiz`
🔒 *Requires auth* | **Cached (30 min)**

Generate a topic-specific multiple-choice quiz.

**Body:**
```json
{
  "topic": "string (max 200 chars)",
  "difficulty": "easy | medium | hard",
  "count": 5
}
```

**Response:**
```json
{
  "success": true,
  "provider": "openrouter",
  "model": "meta-llama/llama-3.3-70b-instruct:free",
  "cached": false,
  "latency": 342,
  "usage": { "totalTokens": 512 },
  "source": "cloud",
  "data": {
    "title": "Python Basics Quiz",
    "questions": [
      {
        "question": "...",
        "options": ["A", "B", "C", "D"],
        "correctAnswer": "B",
        "explanation": "..."
      }
    ]
  }
}
```

---

### `POST /api/ai/explain`
🔒 *Requires auth* | **Cached (30 min)**

Explain why an answer is correct or incorrect.

**Body:**
```json
{
  "question": "string (max 500 chars)",
  "selectedAnswer": "string",
  "correctAnswer": "string",
  "isCorrect": false
}
```

**Response:** `{ ...standard envelope, data: "Explanation text" }`

---

### `POST /api/ai/recommend`
🔒 *Requires auth* | **Cached (30 min)**

Get personalized study topic recommendations.

**Body:**
```json
{
  "weakTopics": ["JavaScript", "CSS"],
  "strongTopics": ["HTML", "Git"]
}
```

**Response:** `{ ...standard envelope, data: ["Recommendation 1", "Recommendation 2", "Recommendation 3"] }`

---

### `GET /api/ai/status`
🔒 *Requires auth, admin or moderator role*

Real-time AI Gateway telemetry.

**Response:**
```json
{
  "success": true,
  "data": {
    "activeProvider": "openrouter",
    "models": [
      { "name": "meta-llama/llama-3.3-70b-instruct:free", "healthy": true },
      { "name": "deepseek/deepseek-r1:free", "healthy": false }
    ],
    "metrics": {
      "openrouter:meta-llama/llama-3.3-70b-instruct:free": {
        "requests": 48,
        "successfulRequests": 47,
        "failedRequests": 1,
        "totalLatency": 14400,
        "totalTokens": 24576,
        "cacheHits": 12,
        "cacheMisses": 36,
        "retryCount": 1,
        "fallbackCount": 0
      }
    }
  }
}
```

---

## Admin (Role: admin)

### `GET /api/admin/stats`
Platform aggregate statistics.

### `GET /api/admin/users`
List users. Query: `?search=&role=&blocked=&page=&limit=`

### `PATCH /api/admin/users/:id`
Update user: `{ "role": "user|moderator|admin", "isBlocked": true|false }`

### `DELETE /api/admin/users/:id`
Delete user and all associated data.

### `GET /api/admin/questions`
List all questions with pagination.

### `POST /api/admin/questions`
Create question: `{ text, options, correctAnswer, explanation, difficulty, categoryId }`

### `PATCH /api/admin/questions/:id`
Update question fields.

### `DELETE /api/admin/questions/:id`
Delete question.

*Category, Challenge, Achievement endpoints follow the same CRUD pattern.*

---

## Health

### `GET /api/health`
Liveness check.

**Response:** `{ status: "healthy", uptimeSeconds: 3600 }`

### `GET /api/health/ready`
Readiness check (database connectivity).

**Response:** `200` when DB is connected, `503` otherwise.

---

## Error Format

All errors follow a consistent structure:

```json
{
  "success": false,
  "message": "Human-readable error description",
  "errors": [{ "field": "email", "message": "Invalid email format" }]
}
```

| Code | Meaning |
|---|---|
| `400` | Validation failure |
| `401` | Unauthenticated |
| `403` | Forbidden (insufficient role) |
| `404` | Resource not found |
| `409` | Conflict (duplicate) |
| `429` | Rate limit exceeded |
| `500` | Internal server error |
