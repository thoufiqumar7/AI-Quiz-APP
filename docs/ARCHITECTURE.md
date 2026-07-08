# Architecture - Phase 4

## Backend Additions

### Updated Model

- `models/User.js`
  - adds: `xpPoints`, `currentLevel`, `streakCount`, `longestStreak`, `achievements`, `badges`, `completedChallenges`, `lastQuizDate`

### New Models

- `models/Achievement.js`
- `models/UserAchievement.js`
- `models/DailyChallenge.js`

### New Services

- `services/gamificationService.js`
  - XP formula, level calculation, streak tracking
- `services/achievementService.js`
  - default achievements, unlock engine, duplicate prevention
- `services/challengeService.js`
  - daily challenge generation, completion validation, reward grant
- `services/recommendationService.js`
  - adaptive difficulty + performance prediction + smart suggestions
- `services/shareService.js`
  - score/achievement/profile share payload generation

### Updated Quiz Submit Pipeline

`controllers/quizController.js` now performs:

1. advanced scoring
2. XP + streak update
3. achievement unlock check
4. leaderboard refresh
5. analytics refresh

### New Controllers/Routes

- `controllers/recommendationController.js` + `routes/recommendationRoutes.js`
- `controllers/challengeController.js` + `routes/challengeRoutes.js`
- `controllers/achievementController.js` + `routes/achievementRoutes.js`
- `controllers/profileController.js` + `routes/profileRoutes.js`
- `controllers/shareController.js` + `routes/shareRoutes.js`

## Frontend Additions

### New Context

- `context/GamificationContext.jsx`
  - manages XP, profile, recommendations, achievements, challenge, share state

### New Pages

- `pages/RecommendationsPage.jsx`
- `pages/AchievementsPage.jsx`
- `pages/ChallengesPage.jsx`
- `pages/GamificationDashboard.jsx`
- `pages/SocialSharePage.jsx`

### New Components

- `components/gamification/XPCard.jsx`
- `components/gamification/LevelProgress.jsx`
- `components/gamification/AchievementCard.jsx`
- `components/gamification/StreakCard.jsx`
- `components/gamification/RecommendationCard.jsx`
- `components/gamification/DailyChallengeCard.jsx`
- `components/gamification/ShareScoreCard.jsx`
- `components/gamification/BadgeGrid.jsx`

## Smart AI Simulation Logic

No external AI APIs are used.

Logic is generated via:

- trend calculations
- threshold-based adaptive difficulty
- category/topic weakness detection
- heuristic performance prediction
- rules for motivation and reminders
