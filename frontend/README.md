# KatherBox — Frontend

React + Vite frontend for the KatherBox e-commerce platform.

> For full setup (backend + frontend) see the [root README](../README.md).
> This file is the Vite/React-specific developer guide.

## Prerequisites

- Node.js 18+
- The KatherBox backend running on `http://localhost:8081`
  (see `../backend` and the root README)

## Install

```bash
cd frontend
npm install
```

## Run (development)

```bash
npm run dev
```

Vite will start on `http://localhost:5173` (or `5174` if 5173 is taken).
Open that URL in your browser.

## Build (production)

```bash
npm run build       # outputs to dist/
npm run preview     # serves the built dist/ locally
```

## Project Layout

```
frontend/src/
├── api/         axios instance + per-resource wrappers
│   ├── axios.js
│   ├── auth.js        → /auth/register, /auth/login
│   ├── products.js    → /products/
│   ├── cart.js        → /cart/...
│   ├── orders.js      → /orders/...
│   └── admin.js       → /admin/orders/..., /auth/me
├── components/  reusable UI (ProductCard)
├── context/     AuthContext (login state in localStorage)
├── pages/       one file per route:
│   ├── Home.jsx       product listing
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── Cart.jsx       cart + checkout
│   ├── Orders.jsx     order history
│   └── Admin.jsx      admin panel (products + orders)
├── App.jsx      Navbar + view switching
├── main.jsx     React entry
└── index.css
```

## Backend URL

Default: `http://localhost:8081` — see `src/api/axios.js`. Change
`baseURL` there if your backend runs elsewhere.

## Notes for development

- Auth token + user info are stored in `localStorage` by `AuthContext`.
  Clearing them = logging out.
- The frontend uses simple state-based view switching in `App.jsx`
  (not react-router) — fine for an MVP, easy to swap later.
- Admin routes are gated by `user.role === "admin"`. If you just
  promoted your DB user to admin, **log out and log back in** so the
  JWT carries the new role claim.
