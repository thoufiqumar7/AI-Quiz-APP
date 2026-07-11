# Installation Guide — SmartQuiz AI

Step-by-step instructions for setting up SmartQuiz AI on your local machine.

---

## Prerequisites

| Requirement | Minimum Version | How to Check |
|---|---|---|
| Node.js | 24.0.0+ | `node --version` |
| npm | 10.0.0+ | `npm --version` |
| Git | 2.0+ | `git --version` |
| MongoDB | 6.0+ (local) or Atlas URI | — |

---

## Option 1 — Local Development Setup

### Step 1 — Clone the Repository

```bash
git clone https://github.com/thoufiqumar7/AI-Quiz-APP.git
cd AI-QUIZ-APP
```

### Step 2 — Configure the Backend

```bash
cd server
cp .env.example .env
```

Open `server/.env` and fill in:

```env
MONGO_URI=mongodb://127.0.0.1:27017/smartquiz_ai
JWT_SECRET=<generate a 64-byte random hex string>
OPENROUTER_API_KEY=<your key from openrouter.ai>
```

Generate a JWT secret:
```bash
node -e "require('crypto').randomBytes(64).toString('hex') |> console.log"
```

### Step 3 — Configure the Frontend

```bash
cd ../client
cp .env.example .env
```

The default `VITE_API_URL=http://localhost:5000/api` works for local development — no changes needed.

### Step 4 — Install Dependencies

```bash
# Backend
cd server && npm install

# Frontend
cd ../client && npm install
```

### Step 5 — Seed the Database *(Recommended)*

```bash
cd server
npm run seed:quiz
```

This populates the database with sample categories and questions so the platform is immediately usable without requiring AI-generated content.

### Step 6 — Start the Development Servers

Open **two terminal windows**:

```bash
# Terminal 1 — Backend (http://localhost:5000)
cd server && npm run dev

# Terminal 2 — Frontend (http://localhost:5173)
cd client && npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Option 2 — Docker Compose (Recommended for Isolated Testing)

```bash
# From the project root
docker-compose up --build
```

This starts:
- MongoDB on port `27017`
- Backend API on port `5000`
- Frontend on port `3000`

> ⚠️ The Docker Compose setup uses placeholder secrets. Update `docker-compose.yml` before using in any shared environment.

---

## Option 3 — Production-Mode Local Build

```bash
# Build the frontend production bundle
cd client && npm run build

# Start the backend in production mode
cd ../server && NODE_ENV=production npm start
```

---

## Verifying the Installation

Once both servers are running, verify:

```bash
# Backend health check
curl http://localhost:5000/api/health

# Expected: { "success": true, "status": "healthy" }
```

```bash
# Backend readiness check
curl http://localhost:5000/api/health/ready

# Expected: { "success": true, "status": "ready" } when DB is connected
```

---

## Creating an Admin Account

1. Register a regular account via the UI or `POST /api/auth/register`
2. Connect to MongoDB and update the user's role:

```javascript
// In MongoDB Shell or Compass
db.users.updateOne(
  { email: "your@email.com" },
  { $set: { role: "admin" } }
)
```

3. Log in — the Admin Panel will now be visible at `/admin`.

---

## Troubleshooting Installation

| Symptom | Likely Cause | Fix |
|---|---|---|
| `MONGO_URI is required` | Missing `.env` | Copy `.env.example` to `.env` |
| `Cannot connect to MongoDB` | DB not running | Start MongoDB or verify Atlas URI |
| `JWT_SECRET is required` | Missing secret | Add `JWT_SECRET` to `.env` |
| Port 5000 already in use | Another process | Change `PORT` in `.env` or kill the conflicting process |
| Frontend shows blank page | Missing `VITE_API_URL` | Verify `client/.env` |

See [docs/TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for more.
