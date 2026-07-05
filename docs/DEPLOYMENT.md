# KatherBox — Deployment Guide

Production deployment plan. The current codebase runs locally only; this guide
describes how to ship it.

---

## Recommended hosts

| Layer | Service | Why |
|---|---|---|
| Frontend | **Vercel** | Free, zero-config for Vite, CDN edge |
| Backend | **Render** or **Railway** | Free tier, Go support, persistent disk |
| Database | **Turso** (hosted SQLite) or **PlanetScale MySQL** | For now, the same SQLite file works on Render with a persistent volume |

> Note: The brief asked for MongoDB + Atlas. We deliberately chose SQLite for
> MVP simplicity. Migration to Mongo is on the roadmap (Sprint L).

---

## Backend deployment (Render)

### 1. Prepare the repo

Add a `render.yaml` at the repo root:

```yaml
services:
  - type: web
    name: katherbox-api
    runtime: go
    buildCommand: cd backend && go build -o ../katherbox-bin .
    startCommand: ./katherbox-bin
    envVars:
      - key: PORT
        value: "8081"
      - key: JWT_SECRET
        generateValue: true
      - key: GIN_MODE
        value: release
    disk:                       # persist SQLite
      name: katherbox-db
      mountPath: /data
      sizeGB: 1
```

Change `katherbox.db` path in `backend/database/database.go` to `/data/katherbox.db`.

### 2. Push & connect

```bash
git push origin main
# In Render dashboard: New → Blueprint → pick your repo
```

### 3. Verify

```bash
curl https://katherbox-api.onrender.com/api/products/?page=1\&limit=2
```

---

## Frontend deployment (Vercel)

### 1. Add env file

```bash
# frontend/.env.production
VITE_API_URL=https://katherbox-api.onrender.com/api
```

Update `frontend/src/api/axios.js`:

```js
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8081/api",
});
```

### 2. Deploy

```bash
cd frontend
npx vercel
# follow prompts, set root = frontend/
```

### 3. Add the production origin to backend CORS

In `backend/main.go`:

```go
AllowOrigins: []string{
    "http://localhost:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
    "https://katherbox.vercel.app",          // ← add
    "https://www.katherbox.com",            // ← add when you have a domain
},
```

---

## Database backup

```bash
# Manual
cp katherbox.db katherbox-$(date +%F).db

# Cron — daily, keep 14 days
0 3 * * *  cp /data/katherbox.db /backups/katherbox-$(date +\%F).db
find /backups -name 'katherbox-*.db' -mtime +14 -delete
```

---

## Stripe (when you wire it up)

```bash
# Backend
go get github.com/stripe/stripe-go

# Env
STRIPE_SECRET=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

Webhook endpoint: `POST /api/payments/stripe-webhook` (verify signature).

---

## SSLCommerz (when you wire it up)

```bash
SSLCZ_STORE_ID=your_id
SSLCZ_STORE_PASSWD=your_pass
SSLCZ_IS_SANDBOX=true   # flip to false for production
SSLCZ_SUCCESS_URL=https://katherbox.vercel.app/order/success
SSLCZ_FAIL_URL=https://katherbox.vercel.app/order/failed
SSLCZ_CANCEL_URL=https://katherbox.vercel.app/order/cancelled
```

---

## Monitoring (recommended)

- **Uptime**: UptimeRobot (free) pinging `/api/products` every 5 min
- **Errors**: Sentry (free tier) — drop the Go SDK into middleware
- **Logs**: Render ships stdout/stderr; pipe to Logtail or Datadog if you outgrow it

---

## Pre-launch checklist

- [ ] Change `JWT_SECRET` from default
- [ ] Lock CORS to production origins only
- [ ] Enable HTTPS (Vercel + Render do this by default)
- [ ] Set `GIN_MODE=release` to silence debug logs
- [ ] Add rate limiting (e.g., `github.com/ulule/limiter`)
- [ ] Add Helmet-style security headers
- [ ] Test signup → admin flow end-to-end
- [ ] Add a Terms of Service + Privacy Policy page (Sprint A3)
- [ ] Add a status page (e.g. statuspage.io)
- [ ] Set up error monitoring
- [ ] Configure backups (cron + off-site)