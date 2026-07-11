# Database Schema — SmartQuiz AI

Complete reference for all 11 MongoDB collections, their Mongoose schemas, indexes, and relationships.

---

## Collections Overview

| Collection | Model | Purpose |
|---|---|---|
| `users` | `User` | User accounts, XP, levels, streaks |
| `refreshtokens` | `RefreshToken` | Hashed refresh tokens with TTL |
| `categories` | `Category` | Quiz topic taxonomy |
| `questions` | `Question` | MCQ question bank |
| `quizsessions` | `QuizSession` | Active and completed quiz sessions |
| `leaderboards` | `Leaderboard` | XP-ranked user records |
| `useranalytics` | `UserAnalytics` | Per-user performance timeseries |
| `achievements` | `Achievement` | Achievement definitions |
| `userachievements` | `UserAchievement` | Unlocked achievements per user |
| `dailychallenges` | `DailyChallenge` | Daily challenge instances |
| `aiusagemetrics` | `AIUsageMetrics` | AI gateway telemetry with 30-day TTL |

---

## User

```js
{
  username:     String,       // Unique
  email:        String,       // Unique, lowercase
  password:     String,       // bcrypt hashed
  role:         String,       // 'user' | 'moderator' | 'admin'
  isBlocked:    Boolean,
  xp:           Number,
  level:        Number,
  streak:       Number,
  longestStreak:Number,
  lastActive:   Date,
  createdAt:    Date
}
```
**Indexes:** `email` (unique), `username` (unique), `xp` (descending — leaderboard queries)

---

## RefreshToken

```js
{
  userId:     ObjectId → User,
  tokenHash:  String,   // SHA-256 hash, never plain text
  userAgent:  String,
  ip:         String,
  expiresAt:  Date      // TTL index — auto-deleted on expiry
}
```
**Indexes:** `tokenHash` (unique), `expiresAt` (TTL)

---

## Category

```js
{
  name:        String,  // Unique
  description: String,
  icon:        String,
  isActive:    Boolean
}
```

---

## Question

```js
{
  text:          String,
  options:       [String],    // Exactly 4 options
  correctAnswer: String,      // Must match one of options
  explanation:   String,
  difficulty:    String,      // 'easy' | 'medium' | 'hard'
  categoryId:    ObjectId → Category
}
```
**Indexes:** `categoryId`, `difficulty`

---

## QuizSession

```js
{
  userId:     ObjectId → User,
  categoryId: ObjectId → Category,
  difficulty: String,
  questions:  [ObjectId → Question],
  answers:    [{
    questionId: ObjectId,
    answer:     String,
    isCorrect:  Boolean,
    timeSpent:  Number
  }],
  status:       String,   // 'in_progress' | 'completed' | 'abandoned'
  score:        Number,
  accuracy:     Number,
  xpAwarded:   Number,
  startedAt:   Date,
  completedAt: Date
}
```
**Indexes:** `userId`, `status`, `completedAt`

---

## UserAnalytics

```js
{
  userId:   ObjectId → User,
  entries:  [{
    date:       Date,
    score:      Number,
    accuracy:   Number,
    quizCount:  Number,
    topicBreakdown: Map<String, { correct, total }>
  }]
}
```
**Indexes:** `userId` (unique)

---

## AIUsageMetrics

```js
{
  timestamp:          Date,     // TTL index: expires after 30 days
  provider:           String,   // 'openrouter' | 'gemini' | 'local'
  model:              String,
  requests:           Number,
  successfulRequests: Number,
  failedRequests:     Number,
  averageLatency:     Number,   // ms
  totalTokens:        Number,
  promptTokens:       Number,
  completionTokens:   Number,
  cacheHits:          Number,
  cacheMisses:        Number,
  retryCount:         Number,
  fallbackCount:      Number,
  offlineResponseCount:Number
}
```
**Indexes:** `timestamp` (TTL — 30-day expiry), `{ provider, model, timestamp }` (compound)

---

## Relationships Diagram

```
User ──────────────< QuizSession
User ──────────────< RefreshToken
User ──────────────── UserAnalytics
User ──────────────< UserAchievement >──── Achievement
Category ──────────< Question
Category ──────────< QuizSession
QuizSession ───────< answers[] → Question
```

---

## Seeding the Database

The project includes a seed script for categories and sample questions:

```bash
cd server
npm run seed:quiz
```

This populates:
- Standard quiz categories (Programming, Math, Science, etc.)
- Sample questions per category for immediate platform testing
