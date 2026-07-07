# 🚀 Setup Guide — install KatherBox on a new machine

Follow this end-to-end and you'll have the full app running locally in **under 10 minutes**.

---

## 0. Prerequisites

| Tool    | Minimum | Check                |
|---------|---------|----------------------|
| Git     | 2.30+   | `git --version`      |
| Go      | 1.25+   | `go version`         |
| Node.js | 18+     | `node --version`     |
| npm     | 9+      | `npm --version`      |
| sqlite3 | 3.x     | `sqlite3 --version` (optional, for DB inspection) |

### Install if missing

**Ubuntu / Debian**
```bash
sudo apt update
sudo apt install -y git sqlite3
# Go (latest):
wget https://go.dev/dl/go1.25.0.linux-amd64.tar.gz
sudo rm -rf /usr/local/go && sudo tar -C /usr/local -xzf go1.25.0.linux-amd64.tar.gz
echo 'export PATH=$PATH:/usr/local/go/bin' >> ~/.bashrc
# Node (use nvm — recommended):
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
source ~/.bashrc
nvm install --lts
```

**macOS**
```bash
brew install git go sqlite3 node
```

**Windows**
- Install [Git](https://git-scm.com/download/win)
- Install [Go](https://go.dev/dl/) (tick "Add to PATH")
- Install [Node LTS](https://nodejs.org/)
- Install [sqlite3](https://www.sqlite.org/download.html) (or use the VS Code SQLite extension)

---

## 1. Get the code

```bash
git clone https://github.com/<your-org>/kather_box.git
cd kather_box
```

(Replace `<your-org>` with the actual GitHub owner / fork URL.)

You should see:
```
backend/   frontend/   DATABASE.md   README.md   SETUP.md
```

---

## 2. Backend (Go API on port 8081)

```bash
cd backend

# 2.1 Fetch dependencies (auto on first run, but you can do it explicitly)
go mod tidy

# 2.2 Create the demo accounts (idempotent — safe to re-run)
go run ./cmd/resetusers/

# 2.3 (Optional) seed the product catalog
go run ./cmd/seedproducts/

# 2.4 (Optional) seed 50 of each order / subscription / consultation / corporate / reminder
go run ./cmd/seeddummy/

# 2.5 Start the API
go run main.go
```

Expected output:
```
[GIN-debug] Listening and serving HTTP on :8081
```

Test it:
```bash
curl http://localhost:8081/api/products | head -c 200
```

If you see JSON, the backend is up. **Leave this terminal running.**

---

## 3. Frontend (React app on port 5173)

Open a **new terminal**:

```bash
cd frontend
npm install
npm run dev
```

Expected output:
```
  VITE v8.x  ready in 400 ms
  ➜  Local:   http://localhost:5173/
```

Open <http://localhost:5173> in your browser. You should see the KatherBox storefront.

---

## 4. Log in

Pick any demo account:

| Email                 | Password         | Where it lands           |
|-----------------------|------------------|--------------------------|
| `admin@katherbox.com` | `Admin@12345`    | `/admin` panel           |
| `customer@test.com`   | `Customer@12345` | `/` with full demo data  |

The customer account already has 32 orders, 4 subscriptions, 5 wishlist items, 5 reviews, 3 addresses, 4 journal entries, 2 community posts, and a Gold loyalty tier — perfect for poking every screen.

---

## 5. Production-style preview

To preview the optimized bundle (closer to what you'd deploy):

```bash
cd frontend
npm run build
npm run preview            # → http://localhost:4173
```

The backend stays on `:8081`.

---

## 6. Where things are (cheat-sheet)

| Item | Path |
|---|---|
| Backend entry point | `backend/main.go` |
| Backend port | `8081` |
| SQLite DB | `backend/katherbox.db` (auto-created) |
| Frontend entry point | `frontend/src/main.jsx` + `App.jsx` |
| Frontend port | `5173` (dev), `4173` (preview) |
| Reset passwords | `backend/cmd/resetusers/main.go` |
| Reseed data | `backend/cmd/seeddummy/main.go` |
| API base URL | hard-coded in `frontend/src/api/axios.js` |

---

## 7. Resetting the database

If you want to wipe everything and start over:

```bash
cd backend
# 1. Stop the backend (Ctrl+C in its terminal)
rm -f katherbox.db
# 2. Restart it (re-creates schema)
go run main.go
# 3. Re-add demo accounts and data
go run ./cmd/resetusers/
go run ./cmd/seedproducts/
go run ./cmd/seeddummy/
```

---

## 8. Common pitfalls

| Symptom | Cause | Fix |
|---|---|---|
| `bind: address already in use` (8081) | Another process on port 8081 | `lsof -i :8081` then kill it, or change the port in `main.go` |
| `bind: address already in use` (5173) | Vite already running, or another dev server | `lsof -i :5173` then kill it, or run `npm run dev -- --port 5174` |
| `CORS error` in browser console | Backend not running | Start backend first (port 8081) |
| `401 Unauthorized` everywhere | Token expired / cleared | Log out and log back in |
| Frontend blank page, no errors | Service worker cache | DevTools → Application → Service workers → Unregister, then hard reload |
| `database is locked` | Two backends pointing at same DB | Kill all `go run main.go`, start one |
| `go: command not found` | Go not in PATH | Add `/usr/local/go/bin` to PATH (see step 0) |

---

## 9. Running both at once (one-liner)

On Linux / macOS with `tmux` or two terminals:

```bash
# Terminal 1
cd backend && go run main.go

# Terminal 2
cd frontend && npm run dev
```

If you want a single command, use a process manager like [`concurrently`](https://www.npmjs.com/package/concurrently) or `make`. Example `Makefile` snippet:

```makefile
.PHONY: dev
dev:
	cd backend && go run main.go &
	cd frontend && npm run dev
```

---

## 10. Deploying

Backend: build a static binary and run it behind any reverse proxy (nginx, Caddy, fly.io, etc.). Set `GIN_MODE=release`.

Frontend: `npm run build` produces `frontend/dist/`. Upload it to any static host. **Critical:** configure the host to serve `index.html` for every unknown path so React Router deep links work.

Examples:
- **Netlify** — add `/*  /index.html  200` to `_redirects`
- **Vercel** — auto
- **Nginx** — `try_files $uri /index.html;`
- **Apache** — `FallbackResource /index.html`

Point your frontend's `axios.js` `baseURL` at the deployed API origin.

---

## 11. Need help?

- Backend docs → [`backend/README.md`](./backend/README.md)
- Frontend docs → [`frontend/README.md`](./frontend/README.md)
- Database docs → [`DATABASE.md`](./DATABASE.md)
- Top-level overview → [`README.md`](./README.md)