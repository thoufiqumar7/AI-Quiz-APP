# Testing Guide — SmartQuiz AI

Complete documentation for the backend and frontend test suites.

---

## Backend Tests — Jest + Supertest

**Stack:** Jest, Supertest, mongodb-memory-server

Tests run against an isolated in-memory MongoDB instance — no real database is touched.

### Running Tests

```bash
cd server

# Run all tests
npm test

# Run with coverage report
npm run test:coverage

# Watch mode
npm run test:watch
```

### Test Files

| File | Type | Coverage |
|---|---|---|
| `tests/auth.test.js` | Integration | Register, login, refresh, logout, session management |
| `tests/quiz.test.js` | Integration | Start, submit, complete, history |
| `tests/admin.test.js` | Integration | User management, question CRUD, admin stats |
| `tests/ai.test.js` | Unit | Circuit breaker, model rotation, fallback chain |
| `tests/ai.loadtest.js` | Load | 100 concurrent request simulation |
| `tests/ai.stresstest.js` | Stress | Forced outage → fallback verification |

### Test Environment Setup

Tests use:
- `tests/setupEnv.js` — Sets test-specific env vars (JWT_SECRET, shorter token lifetimes)
- `tests/setupDb.js` — Starts `MongoMemoryServer`, connects Mongoose, tears down after all tests

### Coverage Targets

Coverage is collected from:
- `controllers/**/*.js`
- `middleware/**/*.js`
- `services/**/*.js`
- `utils/**/*.js`

Run `npm run test:coverage` to generate a full HTML report in `coverage/`.

---

## AI Gateway Tests

### Unit Tests (`ai.test.js`)

Tests the AI layer in complete isolation using Jest mocks:

| Test | Validates |
|---|---|
| CircuitBreaker trips at threshold | 3 failures → model disabled |
| CircuitBreaker cooldown and recovery | Auto-recovery after 5 minutes |
| ModelSelector rotation | Round-robin across 5 models |
| ProviderFactory primary fallback | OpenRouter fail → Gemini activates |
| ProviderFactory tertiary fallback | OpenRouter + Gemini fail → Local Engine activates |
| ResponseFormatter schema | All providers return identical shape |

### Load Test (`ai.loadtest.js`)

Simulates 100 concurrent requests through `ProviderFactory` using mocked providers:

```bash
npx jest tests/ai.loadtest.js
```

**Measured metrics:**
- Total duration
- Success/failure count
- Memory heap delta
- Usage tracker state

### Stress Test (`ai.stresstest.js`)

Forces specific provider failure scenarios:

| Scenario | Expected Behavior |
|---|---|
| OpenRouter 502 outage | Gemini activates, response returns `provider: gemini` |
| OpenRouter + Gemini outage | Local Engine activates, response returns `provider: local`, `source: offline` |

---

## Frontend Tests — Vitest + React Testing Library

**Stack:** Vitest, @testing-library/react, @testing-library/user-event, jsdom

### Running Tests

```bash
cd client

# Run all tests
npm test

# Coverage report
npm run test:coverage

# Watch mode
npm run test:watch
```

### Test Structure

Tests are located in `client/src/test/`.

| File | Coverage |
|---|---|
| `App.test.jsx` | Root component renders, routing sanity |
| `LoginPage.test.jsx` | Form validation, submit, error states |
| `ProtectedRoute.test.jsx` | Auth guard redirects |

### Testing Philosophy

- Test behavior, not implementation
- Prefer `userEvent` over `fireEvent` for realistic interaction simulation
- Mock API calls via `vi.mock('../services/api')`
- All tests run in `jsdom` environment

---

## Continuous Integration

Tests run automatically in GitHub Actions on every push and pull request:

```yaml
# .github/workflows/ci.yml
- install server deps → run server tests
- install client deps → run client tests → build
```

A failing test blocks the PR from being merged.
