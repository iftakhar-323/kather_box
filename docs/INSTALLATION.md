# KatherBox — Installation Guide

Step-by-step instructions to get the full stack running locally for development.

---

## 1. Prerequisites

| Tool | Min version | Check |
|---|---|---|
| **Go** | 1.21+ | `go version` |
| **Node.js** | 18+ | `node -v` |
| **npm** | 9+ | `npm -v` |
| **sqlite3** CLI | any | `sqlite3 --version` (optional, for DB inspection) |

No C compiler is required — SQLite uses the pure-Go driver `modernc.org/sqlite`.

---

## 2. Clone & enter the repo

```bash
git clone <repo-url> katherbox
cd katherbox
```

---

## 3. Backend setup

```bash
cd backend
go mod download          # download all Go dependencies
go run .                 # OR build + run:
# go build -o /tmp/katherbox-bin . && /tmp/katherbox-bin
```

The server listens on **`http://localhost:8081`** by default.

On first run it auto-creates `katherbox.db` and runs migrations for every model.

### Seed sample products (optional)

```bash
# Seed 100 products (default)
go run ./cmd/seedproducts

# Seed 1000 products
go run ./cmd/seedproducts 1000
```

---

## 4. Frontend setup

```bash
cd ../frontend
npm install              # install React + Vite + Axios + Router
npm run dev              # start Vite dev server
```

Vite opens on **`http://127.0.0.1:5173`**.

> **Important:** The backend CORS config allows origins `http://localhost:5173`,
> `http://localhost:5174`, `http://127.0.0.1:5173`, `http://127.0.0.1:5174`.
> If you change the Vite port, update `backend/main.go` `cors.AllowOrigins` and
> rebuild the backend.

---

## 5. Make yourself an admin (for testing the Admin panel)

```bash
cd backend
sqlite3 katherbox.db "UPDATE users SET role='admin' WHERE email='YOU@email.com';"
```

Then **log out and log back in** in the frontend so the JWT carries the new
`role: "admin"` claim.

See `docs/ADMIN_GUIDE.md` for the full admin workflow.

---

## 6. Smoke test

```bash
# Backend health
curl http://localhost:8081/api/products/?page=1\&limit=2

# Frontend
open http://127.0.0.1:5173
```

You should see the home page with the SSEcommerce trust strip and the product grid.

---

## 7. Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `403 Forbidden` on `/api/products/` | Browser sends `Origin: http://127.0.0.1:5173` but backend CORS only allows `localhost:5173` | Add `http://127.0.0.1:5173` to `cors.AllowOrigins` in `backend/main.go`, rebuild |
| `Failed to load products` in UI | Backend not running | Start backend: `cd backend && go run .` |
| Admin returns 403 | Stale JWT with `role: "customer"` | Log out and log back in |
| `address already in use` on port 8081 | Another process owns the port | `lsof -ti:8081 | xargs kill -9` |
| Go build fails on Windows | Path separator | Use forward slashes or WSL |
| Products show 🌿 emoji only | Image upload feature not yet wired (planned) | See `docs/ROADMAP.md` item B1 |

---

## 8. Environment variables (future)

Currently no `.env` is required — the backend reads config from code. When we
introduce secrets (Stripe, Cloudinary, SMTP), this is the planned location:

```bash
# backend/.env (not yet used)
JWT_SECRET=replace-me
STRIPE_SECRET=sk_test_xxx
CLOUDINARY_URL=cloudinary://...
SMTP_HOST=smtp.gmail.com
SMTP_USER=...
SMTP_PASS=...
```

---

## 9. Next steps

- Read `docs/API.md` for the full REST surface
- Read `docs/ARCHITECTURE.md` to understand the codebase
- Read `docs/ROADMAP.md` for what's coming next