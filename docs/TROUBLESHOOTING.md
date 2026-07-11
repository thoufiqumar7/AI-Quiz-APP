# Troubleshooting — SmartQuiz AI

Solutions to common setup and runtime issues.

---

## Server Won't Start

### Error: `MONGO_URI is required`

**Cause:** The `server/.env` file is missing or `MONGO_URI` is not set.

**Fix:**
```bash
cd server
cp .env.example .env
# Open .env and set MONGO_URI to your MongoDB connection string
```

---

### Error: `JWT_SECRET is required`

**Cause:** `JWT_SECRET` is not set in `server/.env`.

**Fix:**
```bash
# Generate a secure secret
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
# Add to server/.env:
# JWT_SECRET=<generated-value>
```

---

### Error: `EADDRINUSE: address already in use :::5000`

**Cause:** Another process is using port 5000.

**Fix (Windows):**
```powershell
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

**Fix (Linux/macOS):**
```bash
lsof -ti:5000 | xargs kill -9
```

Or change the port in `server/.env`:
```env
PORT=5001
```
And update `client/.env`:
```env
VITE_API_URL=http://localhost:5001/api
```

---

### Error: `Cannot connect to MongoDB` / `MongoNetworkError`

**Cause:** MongoDB is not running locally, or the Atlas connection string is wrong.

**Fix (local MongoDB):**
```bash
# Windows — start MongoDB service
net start MongoDB

# Linux
sudo systemctl start mongod

# macOS
brew services start mongodb/brew/mongodb-community
```

**Fix (MongoDB Atlas):**
1. Check the connection string is complete and correctly substituted (username, password, cluster name)
2. Check the IP allowlist at cloud.mongodb.com → Network Access (add `0.0.0.0/0` for development)
3. Verify the database user has Read/Write permissions

---

## Authentication Issues

### Error: `Invalid token user` on every request

**Cause:** The `JWT_SECRET` changed since the token was issued. All previously issued tokens are now invalid.

**Fix:** Log out and log in again. If this happens after a server restart, ensure `JWT_SECRET` is persisted in `.env` and not randomly generated at startup.

---

### Users are logged out immediately after login

**Cause:** The refresh token cookie is not being sent back to the client.

**Fix:**
1. Ensure `CLIENT_ORIGINS` in `server/.env` exactly matches the frontend URL (including protocol)
2. In development: cookies require `sameSite: lax` (default) and no `secure` flag — both are handled automatically when `NODE_ENV !== production`
3. In production: ensure the frontend and backend are on compatible domains for cookies

---

### Error: `CSRF token mismatch`

**Cause:** The `X-CSRF-Token` header is missing or doesn't match the `smartquiz_csrf` cookie.

**Fix:** The frontend Axios interceptor should automatically attach the CSRF token. If using the API directly, read the `smartquiz_csrf` cookie value and send it as `X-CSRF-Token` on every mutating request.

---

### Error: `Account is blocked. Contact support.`

**Cause:** An admin blocked this user account.

**Fix:** An admin must unblock the account via the Admin Panel → User Management → unblock toggle.

---

## CORS Issues

### Error: `Access-Control-Allow-Origin` missing / CORS policy blocked

**Cause:** The frontend URL is not in the `CLIENT_ORIGINS` allowlist on the backend.

**Fix:**
```env
# In server/.env
CLIENT_ORIGINS=http://localhost:5173,http://localhost:3000
```

For production:
```env
CLIENT_ORIGINS=https://smartquiz-ai.vercel.app
```

Multiple origins are comma-separated. There must be no trailing slash.

---

## Quiz Issues

### Quiz doesn't start — `No questions found`

**Cause:** The selected category has no questions for the chosen difficulty.

**Fix:** Run the seed script to populate questions:
```bash
cd server
npm run seed:quiz
```

Or add questions via the Admin Panel → Question Management.

---

### Quiz submission returns `Session not found`

**Cause:** The `sessionId` is invalid, or the session has already been submitted.

**Fix:** Start a new quiz. Sessions can only be submitted once.

---

## Docker Issues

### `docker-compose up` fails with port conflict

**Cause:** Port 5000, 3000, or 27017 is already in use on your machine.

**Fix:** Edit `docker-compose.yml` to change the host port:
```yaml
ports:
  - "5001:5000"  # Map host:5001 to container:5000
```

---

### Docker build fails: `npm ci` error

**Cause:** `package-lock.json` is missing or doesn't match `package.json`.

**Fix:**
```bash
cd server && npm install  # Regenerates package-lock.json
cd ../client && npm install
git add package-lock.json
git commit -m "chore: regenerate lockfile"
```

---

### Container starts but can't connect to MongoDB

**Cause:** In Docker Compose, services connect by service name, not `localhost`.

**Fix:** Ensure the server's `MONGO_URI` uses the service name:
```yaml
# docker-compose.yml
environment:
  - MONGO_URI=mongodb://mongodb:27017/smartquiz
```
Note `mongodb` (the service name), not `localhost`.

---

## Frontend Issues

### Vite dev server starts but shows a blank page

**Cause:** JavaScript errors preventing React from mounting.

**Fix:**
1. Open browser DevTools → Console tab
2. Look for the specific error
3. Common causes: missing environment variable (`VITE_API_URL`), API server not running

---

### After deployment, refreshing any non-root page shows `404`

**Cause:** The hosting provider is trying to serve the URL as a file, but React Router handles routing client-side.

**Fix (Vercel):** The `client/vercel.json` includes rewrites to handle this:
```json
{ "source": "/(.*)", "destination": "/index.html" }
```
Ensure this file is committed and deployed.

**Fix (Nginx):** Add `try_files $uri /index.html;` to your Nginx configuration.

---

### Charts are not rendering

**Cause:** Recharts can fail if data is malformed (empty arrays, null values).

**Fix:**
1. Check the API response for the analytics endpoint
2. Ensure the backend is running and `VITE_API_URL` is correct
3. Check the browser console for `Cannot read property of undefined` errors

---

## Test Issues

### Jest tests fail with `Cannot find module '../app'`

**Cause:** Tests are being run from the wrong directory.

**Fix:**
```bash
cd server   # Must be in server/ directory
npm test
```

---

### `mongodb-memory-server` download takes too long

**Cause:** It downloads a MongoDB binary on first run.

**Fix:** It only downloads once. Subsequent runs use the cached binary. If on a slow connection, wait for the first download to complete.

---

### Vitest test fails with `matchMedia is not a function`

**Cause:** `window.matchMedia` doesn't exist in jsdom.

**Fix:** This is handled in `client/src/test/setup.js`. Ensure the setup file is referenced in `client/vite.config.js`:
```javascript
test: {
  setupFiles: './src/test/setup.js',
}
```

---

## Performance Issues

### API responses are slow on first request after idle

**Cause:** On Render's free tier, the server goes to sleep after 15 minutes of inactivity. The first request wakes it up (cold start, ~30 seconds).

**Fix:** Upgrade to Render's paid tier, or use an external uptime monitoring tool (like UptimeRobot) to ping `/api/health` every 14 minutes to prevent sleep.

---

### MongoDB queries are slow

**Cause:** Indexes may not be created yet on a fresh Atlas cluster.

**Fix:** Indexes are created automatically by Mongoose on first server start. Check via MongoDB Atlas → Browse Collections → Indexes tab. If missing, restart the server or run:
```javascript
// One-time in MongoDB shell
db.users.createIndex({ xpPoints: -1, currentLevel: -1 });
```

---

## AI Gateway Issues

### All AI responses are coming from the Local Intelligence Engine

**Cause:** Both `OPENROUTER_API_KEY` and `GEMINI_API_KEY` are missing or invalid.

**Fix:**
1. Check `server/.env` has valid keys
2. Test your OpenRouter key: `curl -H "Authorization: Bearer sk-or-..." https://openrouter.ai/api/v1/models`
3. Restart the server after updating `.env`

---

### AI Quiz generation returns raw text instead of parsed JSON

**Cause:** The LLM wrapped the JSON in a markdown code block (` ```json ... ``` `).

**Fix:** This is handled automatically by `aiController.js`. If you see raw markdown, check that the cleanup logic `response.data.replace(/```json/gi, '').replace(/```/g, '')` is running without errors in the controller.

---

### Chat streaming stops mid-response

**Cause:** Network interruption, provider timeout (30s default), or the client disconnecting.

**Fix:**
1. Increase `OPENROUTER_TIMEOUT` in `server/.env` (e.g., `60000` for 60 seconds)
2. Check the server logs for `OpenRouter Streaming Error` messages
3. The streaming fallback chain will automatically attempt Gemini or Local Engine on the next request

---

### `GET /api/ai/status` returns 403 Forbidden

**Cause:** The endpoint requires `admin` or `moderator` role.

**Fix:** Ensure your user account has `role: admin` or `role: moderator` in the database. See [Installation > Creating an Admin Account](./INSTALLATION.md).

---

### Circuit Breaker keeps tripping the same model

**Cause:** The model is genuinely experiencing issues (rate limits or downtime).

**Fix:**
1. Check the OpenRouter status page at [status.openrouter.ai](https://status.openrouter.ai)
2. The circuit breaker automatically recovers after 5 minutes
3. If the issue is persistent, remove the model from `ModelSelector.js` temporarily
