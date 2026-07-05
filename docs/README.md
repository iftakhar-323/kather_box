# KatherBox — Documentation

Start here, then dive into whichever doc you need.

---

## 🚀 Getting started

1. **[INSTALLATION.md](./INSTALLATION.md)** — full local setup
2. **[ARCHITECTURE.md](./ARCHITECTURE.md)** — codebase tour for new contributors
3. **[API.md](./API.md)** — every endpoint with request/response examples

## 🛠️ Building & shipping

4. **[DATABASE.md](./DATABASE.md)** — schema, ER diagram, seed data
5. **[DEPLOYMENT.md](./DEPLOYMENT.md)** — Vercel + Render walkthrough
6. **[TESTING.md](./TESTING.md)** — manual smoke tests + plan for automated tests

## 📋 Planning

7. **[ROADMAP.md](./ROADMAP.md)** — what's shipped, what's next, what's deferred
8. **[CHANGELOG.md](./CHANGELOG.md)** — version history (Keep a Changelog format)

---

## Quick links

| I want to… | Read |
|---|---|
| Run the app locally | INSTALLATION |
| Find where to add a feature | ARCHITECTURE |
| Call an API from the frontend | API |
| Add a database field | DATABASE |
| Deploy to production | DEPLOYMENT |
| Write my first test | TESTING |
| Pick the next thing to build | ROADMAP |
| See what changed recently | CHANGELOG |
| Become an admin | ADMIN_GUIDE (project root) |
| Seed test data | DUMMY_USERS (project root) |

---

## Conventions used in this codebase

### Commits
```
feat: add coupon apply on cart
fix: cors rejecting 127.0.0.1 origin
chore: bump vite to 8.1
docs: add ARCHITECTURE.md
```

### Branches
- `main` — always shippable
- `feature/<id>-<short-name>` — e.g. `feature/A3-trust-pages`
- `fix/<id>-<short-name>` — e.g. `fix/cors-127-origin`

### Code style
- Go: `gofmt` + `go vet ./...`
- React: 2-space indent, function components, no class components
- CSS: design tokens at top of `index.css`, no hard-coded colors in components
