# 🔧 Backend (`backend/`)

Go + Gin + GORM + SQLite REST API. Default port **8081**.

---

## 1. Stack

| | Version |
|---|---|
| Go | 1.25+ |
| Gin | v1.12 |
| GORM | v1.31 |
| SQLite driver | gorm.io/driver/sqlite v1.6 |
| JWT | github.com/golang-jwt/jwt/v5 v5.3 |
| bcrypt | golang.org/x/crypto v0.53 |

All deps are in `go.mod`. **No external services required** — DB is a single SQLite file.

---

## 2. Layout

```
backend/
├── main.go               # Gin bootstrap, route mounting, CORS
├── go.mod
├── katherbox.db          # SQLite file (auto-created on first run)
│
├── controllers/          # 26 HTTP handlers
│   ├── auth_controller.go        # register / login / me / forgot / reset
│   ├── product_controller.go     # CRUD + listing/sort/filter/pagination
│   ├── cart_controller.go        # add / update / remove / clear
│   ├── order_controller.go       # place / list / cancel / admin
│   ├── wishlist_controller.go    # list / add / remove
│   ├── reminder_controller.go    # list / complete
│   ├── subscription_controller.go
│   ├── consultation_controller.go
│   ├── corporate_controller.go
│   ├── community_controller.go
│   ├── blog_controller.go
│   ├── care_journal_controller.go
│   ├── loyalty_controller.go     # achievements / tier / referral / rewards
│   ├── gift_controller.go        # gift recommendation engine
│   ├── seasonal_controller.go    # Bangladesh planting calendar
│   ├── notification_controller.go
│   ├── coupon_controller.go
│   ├── csv_controller.go         # admin exports
│   ├── backup_controller.go      # DB backup / restore
│   ├── analytics_controller.go   # top-customers / revenue
│   ├── admin_extensions_controller.go
│   ├── admin_users_controller.go
│   ├── blog_controller.go
│   ├── care_journal_controller.go
│   ├── community_extensions_controller.go
│   ├── corporate_order_controller.go
│   ├── order_extensions_controller.go
│   ├── shopping_controller.go
│   └── subscription_extensions_controller.go
│
├── routes/               # 27 files mirroring controllers
├── models/               # 13 GORM models (User, Product, Order, …)
├── middleware/           # auth_middleware.go, admin_middleware.go
├── utils/                # hash.go (bcrypt), jwt.go (sign/verify), reset.go
├── database/             # database.go (GORM connect + auto-migrate)
│
└── cmd/                  # Standalone CLI tools
    ├── makeadmin/        # Create / reset admin user
    ├── resetusers/       # Reset all demo passwords
    ├── seedproducts/     # Seed product catalog
    ├── seeddummy/        # Seed 50 of each entity with random user IDs
    └── seedorders/       # Seed a single user's orders
```

---

## 3. Run

```bash
cd backend

# (Optional) one-time setup
go run ./cmd/resetusers/      # creates + resets all demo accounts
go run ./cmd/seedproducts/    # seeds ~24 products
go run ./cmd/seeddummy/       # seeds 50 each of orders/subs/etc.

# Start the API
go run main.go                # → http://localhost:8081
```

Gin runs in **debug mode** by default (`http://localhost:8081`). For production:

```bash
GIN_MODE=release go run main.go
```

---

## 4. Configuration

No `.env` is required. Defaults are baked in:

| Setting      | Value                                     | Source                          |
|--------------|-------------------------------------------|---------------------------------|
| Port         | `8081`                                    | `main.go`                       |
| DB file      | `backend/katherbox.db` (relative)         | `database/database.go`          |
| JWT secret   | `KATHERBOX_DEV_SECRET` (hard-coded dev)   | `utils/jwt.go`                  |
| JWT expiry   | 30 days                                   | `utils/jwt.go`                  |
| bcrypt cost  | `bcrypt.DefaultCost`                      | `utils/hash.go`                 |

> ⚠️ **The JWT secret is hard-coded for dev.** Before production, replace `getSecret()` in `utils/jwt.go` with `os.Getenv("JWT_SECRET")`.

---

## 5. API surface

All endpoints are under `/api/`. Auth-required routes expect:

```
Authorization: Bearer <jwt>
```

### Auth (`/api/auth/*`)
- `POST /register` — `{name, email, password}` → `{token, user}`
- `POST /login`    — `{email, password}` → `{token, user}`
- `GET  /me`       — current user (requires Bearer)
- `POST /forgot`   — `{email}` → dev token returned in response
- `POST /reset`    — `{token, new_password}` → ok

### Storefront (`/api/*`)
- `/products` — GET list (filter/sort/paginate), GET `:id`, POST/PUT/DELETE (admin)
- `/cart`, `/orders`, `/wishlist`, `/reminders`
- `/subscriptions`, `/consultations`, `/corporate`, `/corp-portal`
- `/community/posts`, `/community/posts/:id/comments`, `/community/posts/:id/like`
- `/blog`, `/blog/:slug`, `/blog/categories`
- `/care-journal`, `/journal`, `/care-schedule`, `/care-calendar`
- `/gift/recommendations`, `/gift-cards`, `/gift/wizard`
- `/seasonal` (static calendar)
- `/coupons/apply`, `/coupons/validate`
- `/notifications`, `/addresses`
- `/products/:id/reviews`, `/reviews/mine`, `/reviews/:id`

### Loyalty (`/api/loyalty/*`)
- `GET  /achievements`, `GET /achievements/me`
- `POST /achievements/:id/claim`, `POST /check-achievements`
- `GET  /tier`, `GET /referral`, `POST /referral/redeem`, `GET /referrals/me`
- `GET  /rewards`, `POST /rewards/:id/redeem`

### Admin-only (`/api/admin/*` — requires admin role)
- `/orders` (list, create, update status, delete)
- `/reminders`, `/subscriptions`, `/consultations`, `/corporate`
- `/users` (list, update role)
- `/analytics`, `/backup`, `/csv/export`, `/categories`, `/products`

### User profile (`/api/auth/addresses`, etc.)
- `/addresses` — list / create / update / delete (in `auth_controller.go`)

---

## 6. CLI tools (`cmd/`)

```bash
# Make / reset admin
go run ./cmd/makeadmin/        # → admin@katherbox.com / Admin@12345

# Reset every demo account's password + role
go run ./cmd/resetusers/       # idempotent; safe to re-run

# Seed product catalog
go run ./cmd/seedproducts/

# Seed 50 each of orders, subscriptions, consultations, corporate, reminders
go run ./cmd/seeddummy/        # random user_id between 1 and 50

# Seed a single user's orders (older utility)
go run ./cmd/seedorders/
```

All scripts connect to the same SQLite file and are idempotent enough to re-run.

---

## 7. Demo accounts

Set by `cmd/resetusers/`:

| Email | Password | Role |
|---|---|---|
| `admin@katherbox.com` | `Admin@12345` | admin |
| `admin@demo.com` | `Admin@12345` | admin |
| `customer@test.com` | `Customer@12345` | customer |
| `iftakhar@gmail.com` | `Customer@12345` | customer |
| `cust1@test.com` | `Customer@12345` | customer |

---

## 8. Auth model

- `POST /api/auth/login` returns `{ token, user }`.
- Frontend stores `token` in `localStorage.kb_token` and the user object in `localStorage.kb_user`.
- All auth-required routes parse the Bearer token via `middleware.AuthMiddleware()`, which sets `user_id` and `role` on `*gin.Context`.
- Admin routes additionally chain `middleware.AdminMiddleware()` (returns 403 for non-admins).

---

## 9. CORS

CORS is permissive in dev (any origin, all common methods). Adjust `main.go` for production.

---

## 10. Common tasks

**Reset everything from scratch**
```bash
cd backend
rm -f katherbox.db          # wipe DB
go run main.go              # re-creates schema via auto-migrate
go run ./cmd/resetusers/    # demo accounts
go run ./cmd/seedproducts/  # catalog
go run ./cmd/seeddummy/     # orders/subs/etc.
```

**Check server health**
```bash
curl http://localhost:8081/api/products | head -c 200
```

**Login and capture a token**
```bash
curl -X POST http://localhost:8081/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@katherbox.com","password":"Admin@12345"}'
```

For database inspection, see [`../DATABASE.md`](../DATABASE.md).