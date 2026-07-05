# KatherBox — Architecture

A short tour of the codebase so new contributors can find their way around quickly.

---

## High-level diagram

```
┌────────────────────────────────────────────────────────────┐
│  Browser  (React + Vite,  http://127.0.0.1:5173)          │
│                                                            │
│   - Axios + AuthContext (JWT in localStorage)              │
│   - React Router DOM (installed; views are state-driven)   │
└────────────────────┬───────────────────────────────────────┘
                     │  HTTP / JSON   Authorization: Bearer <jwt>
                     ▼
┌────────────────────────────────────────────────────────────┐
│  Gin HTTP Server   (Go,  http://localhost:8081)            │
│                                                            │
│   - CORS middleware                                       │
│   - Auth middleware (JWT verify + role set)                │
│   - Admin middleware (role == "admin")                     │
│   - Controllers (one per domain)                           │
│   - GORM ORM                                              │
└────────────────────┬───────────────────────────────────────┘
                     │
                     ▼
            ┌────────────────┐
            │  SQLite (file) │
            │ katherbox.db   │
            └────────────────┘
```

---

## Folder layout

```
katherbox/
├── ADMIN_GUIDE.md           ← how to manage the shop (shops operator)
├── DUMMY_USERS.md           ← seed credentials for testing
├── README.md                ← project pitch + quick start
├── docs/                    ← this folder
│   ├── INSTALLATION.md
│   ├── ARCHITECTURE.md
│   ├── API.md
│   ├── DATABASE.md
│   ├── DEPLOYMENT.md
│   ├── TESTING.md
│   ├── ROADMAP.md
│   └── CHANGELOG.md
│
├── backend/                 ← Go + Gin
│   ├── go.mod
│   ├── main.go              ← entry point, CORS, route registration
│   ├── controllers/         ← HTTP handlers (1 per domain)
│   │   ├── auth_controller.go
│   │   ├── product_controller.go
│   │   ├── cart_controller.go
│   │   ├── order_controller.go
│   │   ├── coupon_controller.go
│   │   ├── subscription_controller.go
│   │   ├── consultation_controller.go
│   │   ├── corporate_controller.go
│   │   ├── reminder_controller.go
│   │   ├── community_controller.go
│   │   ├── gift_controller.go
│   │   ├── seasonal_controller.go
│   │   ├── notification_controller.go
│   │   └── admin_extensions_controller.go + analytics_controller.go
│   │
│   ├── models/              ← GORM structs (1 per table)
│   ├── routes/              ← route registration (1 per domain)
│   ├── middleware/          ← auth + admin JWT guards
│   ├── utils/               ← hash + JWT helpers
│   ├── database/
│   │   └── database.go      ← GORM open + auto-migrate
│   └── cmd/
│       └── seedproducts/    ← CLI: `go run ./cmd/seedproducts [N]`
│
└── frontend/                ← React + Vite (plain CSS, no UI lib yet)
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── main.jsx
        ├── App.jsx          ← root component, NAV_ITEMS, view switcher
        ├── index.css        ← design tokens + all component styles
        │
        ├── api/             ← one file per backend domain
        │   ├── axios.js     ← baseURL + JWT interceptor
        │   ├── auth.js, products.js, cart.js, orders.js,
        │   ├── wishlist.js, coupons.js, notifications.js,
        │   ├── subscriptions.js, consultations.js, corporate.js,
        │   ├── community.js, seasonal.js, admin.js
        │
        ├── components/
        │   ├── ProductCard.jsx
        │   ├── Notifications.jsx
        │   └── EmailVerifyBanner.jsx
        │
        ├── context/
        │   └── AuthContext.jsx
        │
        └── pages/
            ├── Home.jsx             ← hero + SSEcommerce strip + products
            ├── Login.jsx, Register.jsx
            ├── Cart.jsx, Wishlist.jsx, Orders.jsx, ProductDetail.jsx
            ├── Admin.jsx           ← 6 tabs (Products/Orders/Coupons/Reminders/Subs/Consult/Corporate)
            ├── Subscriptions.jsx, Reminders.jsx, Consultations.jsx
            ├── Corporate.jsx, Community.jsx, Seasonal.jsx
```

---

## Backend patterns

### Layered
```
HTTP request
   ↓
routes/*.go            (URL → handler, attach middleware)
   ↓
controllers/*.go       (parse query/body, call DB, write JSON)
   ↓
models/*.go            (GORM structs)
   ↓
database.DB            (GORM instance)
```

### Auth & roles
1. `POST /api/auth/login` returns `{token, user}`; bcrypt hash is checked
2. Frontend stores `token` in `localStorage`; `axios.js` interceptor adds `Authorization: Bearer <token>` on every request
3. `middleware.AuthMiddleware()` parses the JWT, sets `user_id`, `email`, `role` on `*gin.Context`
4. `middleware.AdminMiddleware()` aborts with 403 unless `role == "admin"`

### Response shape
All list endpoints return a paginated envelope:
```json
{
  "items":       [...],
  "page":        1,
  "limit":       12,
  "total":       1102,
  "total_pages": 92
}
```

### Adding a new endpoint
1. Define model in `backend/models/foo.go`
2. Implement controller functions in `backend/controllers/foo_controller.go`
3. Register routes in `backend/routes/foo_routes.go`
4. Mount in `backend/main.go` (under the right middleware chain)
5. Add migration to `database.DB.AutoMigrate(...)` in `main.go`
6. Add API wrapper in `frontend/src/api/foo.js`
7. Build: `cd backend && go build && ./katherbox-bin`

---

## Frontend patterns

### Routing
- `react-router-dom` is installed but **not currently used**; navigation is state-driven:
  `App.jsx` holds `const [view, setView] = useState("home")`
  `window.__katherboxSetView?.("cart")` switches views.
  This keeps the SPA simple while the codebase is small.

### Auth
- `AuthContext.jsx` exposes `{ user, token, login(), logout(), register() }`
- On mount it reads `localStorage.token` and `localStorage.user`, validates `/api/auth/me`

### Design tokens
- `index.css` defines CSS variables at the top (`--primary`, `--leaf-*`, `--ink-*`, etc.)
- All components use these tokens — no hard-coded colors in components

### Components
- `ProductCard` is reusable across Home, Wishlist, Cart, Search
- All pages are class-based with semantic CSS classes (`.page`, `.card`, `.hero`, `.filter-bar`)

---

## Database

- Single SQLite file: `backend/katherbox.db`
- Auto-migrated at startup (no Alembic / Liquibase)
- GORM uses `modernc.org/sqlite` (pure Go, no CGO)

See `docs/DATABASE.md` for the full schema and ER diagram.

---

## Where things live — quick lookup

| If you want to change… | Edit file |
|---|---|
| Port numbers | `backend/main.go` (Gin `router.Run(":8081")`) |
| CORS allowed origins | `backend/main.go` (`cors.AllowOrigins`) |
| JWT secret | `backend/utils/jwt.go` |
| Brand colors | `frontend/src/index.css` (top: `--primary`, `--leaf-*`) |
| Nav items | `frontend/src/App.jsx` (`NAV_ITEMS`) |
| Footer columns | `frontend/src/App.jsx` (Footer component) |
| Stock thresholds (low/high) | `frontend/src/components/ProductCard.jsx` |
| Stripe keys (when added) | `backend/.env` (planned) |
| Seed product templates | `backend/cmd/seedproducts/main.go` |
