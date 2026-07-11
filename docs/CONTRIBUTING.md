# Contributing to SmartQuiz AI

Thank you for your interest in contributing! This guide will help you get started.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Branch Strategy](#branch-strategy)
- [Commit Message Convention](#commit-message-convention)
- [Code Standards](#code-standards)
- [Testing Requirements](#testing-requirements)
- [Pull Request Process](#pull-request-process)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Features](#suggesting-features)

---

## Code of Conduct

This project maintains a welcoming and inclusive environment. All contributors are expected to:
- Be respectful and constructive in all interactions
- Accept feedback gracefully
- Focus on what is best for the project and its users

---

## Getting Started

1. **Fork** the repository on GitHub
2. **Clone** your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/AI-Quiz-APP.git
   cd AI-Quiz-APP
   ```
3. **Install dependencies** for both client and server:
   ```bash
   cd server && npm install && cd ..
   cd client && npm install && cd ..
   ```
4. **Set up environment variables** (see [docs/ENVIRONMENT.md](./ENVIRONMENT.md))
5. **Create a feature branch** from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```

---

## Development Workflow

1. Make your changes
2. Write or update tests to cover your changes
3. Ensure all tests pass:
   ```bash
   cd server && npm test
   cd client && npm test
   ```
4. Ensure the application builds successfully:
   ```bash
   cd client && npm run build
   ```
5. Commit your changes using the conventional commit format
6. Push your branch and open a Pull Request

---

## Branch Strategy

| Branch | Purpose |
|---|---|
| `main` | Stable production code. Direct pushes are not allowed. |
| `develop` | Integration branch for completed features (if used) |
| `feature/*` | New features (`feature/quiz-timer-improvements`) |
| `fix/*` | Bug fixes (`fix/auth-token-expiry`) |
| `docs/*` | Documentation updates (`docs/update-api-reference`) |
| `chore/*` | Maintenance tasks (`chore/update-dependencies`) |

---

## Commit Message Convention

SmartQuiz AI uses the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <short summary>
```

### Types

| Type | When to Use |
|---|---|
| `feat` | Adding a new feature |
| `fix` | Fixing a bug |
| `docs` | Documentation changes only |
| `test` | Adding or updating tests |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `perf` | A code change that improves performance |
| `chore` | Build system, dependency updates, tooling |
| `style` | Formatting, missing semicolons — no logic change |

### Examples

```bash
feat(quiz): add adaptive difficulty scoring algorithm
fix(auth): resolve refresh token rotation race condition
docs(api): document the /api/share/generate endpoint
test(admin): add integration tests for user management routes
chore(deps): update mongoose to v8.5.3
```

---

## Code Standards

### General

- Follow existing code style in each file
- Prefer clarity over cleverness
- Add comments for non-obvious logic
- No console.log in production code (use the Pino logger)

### Backend (Node.js)

- All business logic goes in `services/`, not `controllers/`
- Controllers should only: validate input, call a service, send the response
- Always handle errors using `next(error)` — never call `res.json` in a catch block
- Use `async/await` — avoid callbacks
- Add Zod validation to every new route

### Frontend (React)

- One component per file
- Prefer functional components with hooks
- Global state goes in Context — local state stays in the component
- API calls go in `services/`, not in components or hooks
- Use `useCallback` and `useMemo` for expensive operations

---

## Testing Requirements

All Pull Requests must include tests for new functionality:

- **Backend**: Jest + Supertest integration tests in `server/tests/`
- **Frontend**: Vitest + React Testing Library tests co-located or in `client/src/test/`
- Tests must pass in CI before a PR can be merged
- Do not reduce existing test coverage

---

## Pull Request Process

1. Ensure your branch is up to date with `main`:
   ```bash
   git fetch origin
   git rebase origin/main
   ```
2. Push your branch:
   ```bash
   git push origin feature/your-feature-name
   ```
3. Open a Pull Request on GitHub against the `main` branch
4. Fill in the PR template:
   - **What does this PR do?**
   - **How has it been tested?**
   - **Screenshots (for UI changes)**
5. Wait for CI to pass
6. Request a review from a maintainer
7. Address any review feedback
8. Once approved, the maintainer will merge the PR

---

## Reporting Bugs

Please use [GitHub Issues](https://github.com/thoufiqumar7/AI-Quiz-APP/issues) and include:

- **Description**: What happened vs. what was expected
- **Steps to reproduce**: Exact steps to trigger the issue
- **Environment**: OS, Node.js version, browser
- **Logs**: Any relevant error messages or console output

---

## Suggesting Features

Open a [GitHub Issue](https://github.com/thoufiqumar7/AI-Quiz-APP/issues) with the `enhancement` label and include:

- **Problem statement**: What user need does this address?
- **Proposed solution**: How you envision it working
- **Alternatives considered**: Other approaches you thought about
