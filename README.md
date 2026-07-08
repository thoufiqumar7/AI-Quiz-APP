# SmartQuiz AI

## Project Overview
SmartQuiz AI is a next-generation quiz platform featuring adaptive difficulty, gamification, detailed analytics, and intelligent recommendation systems. It challenges users, tracks their progress, and builds a comprehensive learning profile.

## Features
- **Adaptive Quiz Engine**: Dynamically adjusts difficulty based on performance.
- **Gamification**: XP points, daily challenges, badges, and streaks.
- **Analytics & Leaderboards**: Comprehensive real-time tracking of accuracy and rankings.
- **Admin Panel**: Role-Based Access Control (RBAC) to manage users and questions.
- **Security**: JWT-based authentication with secure refresh token rotation.

## Tech Stack
- **Frontend**: React, Vite, Tailwind CSS, React Router, Recharts, Framer Motion
- **Backend**: Node.js, Express.js
- **Database**: MongoDB, Mongoose
- **DevOps**: Docker, Docker Compose, GitHub Actions, Vercel, Render

## Folder Structure
```
AI-QUIZ-APP/
├── client/          # React + Vite frontend SPA
├── server/          # Node.js + Express backend API
├── shared/          # Shared constants, types, and utilities
├── docs/            # Additional markdown documentation
└── .github/         # CI/CD GitHub Actions workflows
```

## Installation
1. Clone the repository: `git clone <repo-url>`
2. Install client dependencies: `cd client && npm install`
3. Install server dependencies: `cd server && npm install`

## Environment Variables
Copy `.env.example` to `.env` in both `client` and `server` directories and fill in the missing secrets.
- `server/.env`: Requires `MONGO_URI` and `JWT_SECRET`
- `client/.env`: Requires `VITE_API_URL`

## Running Locally
1. Start the backend: `cd server && npm run dev`
2. Start the frontend: `cd client && npm run dev`
3. Visit `http://localhost:3000`

## Docker Setup
Ensure Docker Desktop is running, then execute from the root directory:
```bash
docker-compose up --build
```
This will spin up MongoDB, the Node backend, and the React frontend in isolated containers.

## Deployment
- **Frontend**: Connect `client` to Vercel. Route rewrites are handled by `vercel.json`.
- **Backend**: Connect `server` to Render as a Web Service utilizing `render.yaml`.
See `docs/DEPLOYMENT.md` for full instructions.

## Screenshots
*(Add screenshots of the Dashboard, Quiz interface, and Analytics here)*

## API Overview
The backend provides RESTful endpoints:
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Authenticate user
- `GET /api/quiz` - Fetch adaptive quiz questions
- `GET /api/leaderboard` - Fetch global rankings
Refer to `docs/API.md` for comprehensive API details.

## Future Improvements
- GraphQL integration for complex analytic querying.
- Social OAuth logins (Google, GitHub).
- AI-generated question expansions.

## License
MIT License.
