# Deployment Guide — SmartQuiz AI

Complete deployment instructions for Render (backend), Vercel (frontend), MongoDB Atlas (database), and Docker.

---

## Recommended Architecture

```
Internet
   │
   ├── Vercel (Frontend CDN)
   │       └── React SPA → calls backend API
   │
   └── Render (Backend Web Service)
           └── Express.js → MongoDB Atlas
```

---

## 1. MongoDB Atlas Setup

1. Create a free account at [cloud.mongodb.com](https://cloud.mongodb.com)
2. Create a new **M0 Free Cluster**
3. Create a database user with read/write permissions
4. Whitelist your backend server's IP (or use `0.0.0.0/0` for development)
5. Copy the connection string: `mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/smartquiz_ai`
6. Use this as `MONGO_URI` in your production environment

---

## 2. Render — Backend Deployment

The project includes a `render.yaml` blueprint for automatic Render deployment.

### Manual Setup

1. Create a **Render** account at [render.com](https://render.com)
2. Click **New → Web Service**
3. Connect your GitHub repository
4. Configure:
   - **Root Directory:** `server`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Environment:** `Node`
5. Add all environment variables from `server/.env.example`:

| Key | Value |
|---|---|
| `NODE_ENV` | `production` |
| `MONGO_URI` | Your Atlas URI |
| `JWT_SECRET` | 64-byte random secret |
| `CLIENT_ORIGIN` | Your Vercel frontend URL |
| `OPENROUTER_API_KEY` | Your OpenRouter key |
| `GEMINI_API_KEY` | Your Gemini key |
| `TRUST_PROXY` | `true` |

6. Deploy. Render builds and starts automatically on every `git push` to `main`.

### Using `render.yaml`

The included `render.yaml` automates this configuration. Just connect your repo to Render and it auto-detects the blueprint.

---

## 3. Vercel — Frontend Deployment

1. Create a **Vercel** account at [vercel.com](https://vercel.com)
2. Click **New Project → Import Git Repository**
3. Select your repository
4. Configure:
   - **Root Directory:** `client`
   - **Framework Preset:** `Vite`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. Add environment variable:

| Key | Value |
|---|---|
| `VITE_API_URL` | `https://your-render-service.onrender.com/api` |

6. Deploy.

The `client/vercel.json` already handles SPA routing (all paths rewrite to `index.html`).

---

## 4. Docker — Self-Hosted Deployment

Use the included Docker Compose setup for self-hosted production:

### Update Environment Variables

Edit `docker-compose.yml` and replace placeholder values:

```yaml
environment:
  - MONGO_URI=mongodb://mongodb:27017/smartquiz
  - JWT_SECRET=<your-real-64-byte-secret>
  - OPENROUTER_API_KEY=<your-key>
  - GEMINI_API_KEY=<your-key>
  - CLIENT_ORIGINS=https://your-domain.com
```

### Deploy

```bash
docker-compose up --build -d
```

### Check Status

```bash
docker-compose ps
docker-compose logs -f server
```

### SSL / HTTPS

For production HTTPS, place Nginx in front of the Docker services:

```nginx
server {
    listen 443 ssl;
    server_name api.yourdomain.com;
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

---

## 5. GitHub Actions CI/CD

The `.github/workflows/` directory contains the CI pipeline that runs on every push and pull request to `main`:

1. Install dependencies (server + client)
2. Run backend tests (`npm test`)
3. Build the frontend (`npm run build`)

> The workflow fails fast on any test failure, preventing broken code from reaching production.

---

## Post-Deployment Verification

After deploying, verify:

```bash
# Liveness
curl https://your-api.onrender.com/api/health

# Readiness (DB connected)
curl https://your-api.onrender.com/api/health/ready

# CORS (from browser console on frontend)
fetch('/api/health').then(r => r.json()).then(console.log)
```

---

## Environment Variables Summary

| Variable | Development | Production |
|---|---|---|
| `NODE_ENV` | `development` | `production` |
| `TRUST_PROXY` | `false` | `true` |
| `MONGO_URI` | Local MongoDB | Atlas URI |
| `CLIENT_ORIGIN` | `http://localhost:5173` | Your Vercel URL |
| `VITE_API_URL` | `http://localhost:5000/api` | Your Render URL |

Full variable reference: [ENVIRONMENT.md](./ENVIRONMENT.md)
