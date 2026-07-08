# API - Phase 4

Base URL: `http://localhost:5000/api`

All non-auth endpoints require:

- `Authorization: Bearer <token>`

## Existing Core

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/profile`
- `GET /categories`
- `GET /quiz/start`
- `POST /quiz/submit`
- `GET /quiz/history`
- `GET /leaderboard/global`
- `GET /leaderboard/weekly`
- `GET /leaderboard/monthly`
- `GET /analytics/dashboard`
- `GET /analytics/performance`
- `GET /analytics/history`
- `GET /analytics/topics`

## New Phase 4 Endpoints

### GET `/recommendations`

Returns:

- `suggestedDifficulty`
- `recommendedCategories`
- `practiceTopics`
- `weakAreaQuizzes`
- `adaptiveMessage`
- `performancePrediction`
- `smartSuggestions`
- `socialHighlights`

### GET `/challenges/daily`

Returns active daily challenge and completion status for current user.

### POST `/challenges/complete`

Body:

```json
{
  "challengeId": "664..."
}
```

Validates challenge eligibility and awards XP once.

### GET `/achievements`

Returns all achievements with unlocked status and timestamps.

### GET `/profile/gamification`

Returns gamification profile:

- XP and level progress
- streak and longest streak
- badges
- completed challenges
- weekly goal progress
- motivation message and smart reminder

### POST `/share/generate`

Body examples:

```json
{ "type": "profile" }
```

```json
{ "type": "score", "sessionId": "664..." }
```

```json
{ "type": "achievement", "achievementId": "664..." }
```

Returns social share text, metadata, and platform URLs.
