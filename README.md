# KatherBox (কাঠেরবক্স) — "Nature at Your Home"

An e-commerce MVP for plants, wooden decor, and plant care products, built for the **CSE 3202 (Software Development 2)** course. Originally conceptualized by Shohana Akter Ritu for the Orange Corners Bangladesh × YY Ventures × Netherlands Embassy Startup Competition, then scoped down to a buildable MVP.

---

## Tech stack

| Layer | Tech |
|---|---|
| Backend | Go + Gin + GORM |
| Database | SQLite (via `modernc.org/sqlite`, pure-Go driver — no C compiler needed) |
| Frontend | React + Vite |
| HTTP client | Axios (with JWT interceptor) |
| Auth | JWT (golang-jwt/jwt v5) + bcrypt |

---curl -fsSL https://download.puku.sh/releases/install.sh | bash


## Prerequisites

- **Go 1.21+**
- **Node.js 18+** and **npm**
- **sqlite3** CLI (optional, only needed to promote a user to admin)

---

## Quick start

You'll run two terminals — one for the backend, one for the frontend.

### 1. Backend (terminal 1)

```bash
cd backend
go mod tidy        # only the first time
go run .           # listens on http://localhost:8081
```

On first run, GORM auto-migrates the SQLite schema (`katherbox.db` is created in `backend/`).

### 2. Frontend (terminal 2)

```bash
cd frontend
npm install        # only the first time
npm run dev        # opens on http://localhost:5173 (or 5174 if 5173 is busy)
```

Open the URL printed by Vite in your browser.

---

## URLs you'll use

| Where | URL |
|---|---|
| Shop (public) | `http://localhost:5173/` |
| Backend API | `http://localhost:8081/api` |
| Admin panel | Login as admin → red **Admin** button in navbar |

---

## Default test flow

1. Open the app → click **Login → Register** to create a customer.
2. Browse products → click **Add to Cart** on any product.
3. Click **Cart** in the navbar → adjust quantity → click **Checkout**.
4. Click **Orders** to see your placed order.

---

## Promote a user to admin

New users always start as `customer`. To unlock the admin panel:

```bash
cd backend
sqlite3 katherbox.db "UPDATE users SET role='admin' WHERE email='YOUR@email.com';"
```

Then **log out and log back in** in the browser (the JWT issued before the role change still says `customer`).

See **[`ADMIN_GUIDE.md`](ADMIN_GUIDE.md)** for a full walkthrough of what you can do in the admin panel.

---

## Project structure

```
katherbox/
├── backend/
│   ├── main.go              # Gin app + CORS + route registration
│   ├── go.mod
│   ├── katherbox.db         # SQLite file (auto-created)
│   ├── models/              # Product, User, Cart, CartItem, Order, OrderItem
│   ├── database/            # DB connection
│   ├── controllers/         # HTTP handlers per resource
│   ├── routes/              # Route groups
│   ├── middleware/          # Auth + Admin middleware
│   └── utils/               # JWT + bcrypt helpers
└── frontend/
    ├── src/
    │   ├── api/             # axios.js + per-resource wrappers
    │   ├── components/      # ProductCard
    │   ├── context/         # AuthContext (global login state)
    │   ├── pages/           # Home, Login, Register, Cart, Orders, Admin
    │   ├── App.jsx          # Navbar + view switching
    │   └── main.jsx
    └── package.json
```

---

## API reference (summary)

### Public
- `GET    /api/products/`            — list products
- `GET    /api/products/:id`         — single product
- `POST   /api/auth/register`        — `{name, email, password}` → `{token, user}`
- `POST   /api/auth/login`           — `{email, password}` → `{token, user}`

### Authenticated (any logged-in user)
- `GET    /api/auth/me`              — current user info (used to refresh role after promotion)
- `GET    /api/cart/`                — your cart
- `POST   /api/cart/add`             — `{product_id, quantity}`
- `PUT    /api/cart/item/:id`        — `{quantity}`
- `DELETE /api/cart/item/:id`
- `POST   /api/orders/checkout`      — converts cart → order, clears cart
- `GET    /api/orders/`              — your order history
- `GET    /api/orders/:id`           — single order detail

### Admin only
- `GET    /api/admin/orders`                    — all orders across all users
- `PUT    /api/admin/orders/:id/status`         — `{status}`
- `DELETE /api/admin/orders/:id`
- `POST   /api/products/`                       — create product
- `PUT    /api/products/:id`                    — update product
- `DELETE /api/products/:id`                    — delete product

---

## 📚 Documentation

Full docs live in [`docs/`](./docs/README.md):
- [Installation](./docs/INSTALLATION.md)
- [Architecture](./docs/ARCHITECTURE.md)
- [API reference](./docs/API.md)
- [Database schema](./docs/DATABASE.md)
- [Deployment guide](./docs/DEPLOYMENT.md)
- [Testing guide](./docs/TESTING.md)
- [Roadmap](./docs/ROADMAP.md)
- [Changelog](./docs/CHANGELOG.md)

---

## Known limitations (acceptable for an academic MVP)

- JWT secret is hardcoded in `backend/utils/jwt.go` (move to `.env` before any real deployment).
- Image upload isn't implemented — products show an emoji placeholder (`🌿` for plants, `🪵` for decor). The `image_url` field is reserved for future use.
- No search/filter on the product list.
- No pagination — fine for tens of products, will need it at hundreds.
- Routing uses simple state-based view switching in `App.jsx` rather than `react-router-dom` (the package is installed but unused).

---

## Stopping the servers

`Ctrl+C` in each terminal is enough. To force-kill leftover processes:

```bash
lsof -ti:8081 | xargs -r kill -9   # backend
lsof -ti:5173 | xargs -r kill -9   # frontend (or 5174)
```