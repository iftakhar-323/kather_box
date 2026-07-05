# KatherBox — Project Summary

> One file that captures everything built so far and answers the key question:
> **Do any features depend on external APIs or third-party services? → NO.**
> Everything runs locally on `http://localhost:8081` (Go backend) + `http://localhost:5173` (Vite frontend).
> No Stripe, no Cloudinary, no SMTP, no OAuth, no SMS, no push service, no payment gateway.
> LocalStorage on the frontend + SQLite + JWT on the backend — that's the entire stack.

---

## 1. Tech Stack

| Layer    | Tech                                                      |
|----------|-----------------------------------------------------------|
| Backend  | Go 1.21+ · Gin · GORM · SQLite · JWT (HS256) · bcrypt     |
| Frontend | React 18 · Vite · Axios · plain CSS (no Tailwind/MUI)     |
| Storage  | SQLite file (`backend/katherbox.db`) + `localStorage` (UI) |

---

## 2. Backend (`backend/`)

### Models (`models/` — 13 files)
`user, product, cart, order, wishlist, reminder, coupon, notification, subscription, consultation, corporate, community, gift`

### Controllers (`controllers/` — 17 files)
`auth, product, cart, order, wishlist, reminder, coupon, notification, subscription, consultation, corporate, community, gift, seasonal, analytics, admin_extensions, admin_extensions`

### Routes (`routes/` — 16 files)
REST endpoints mounted under `/api/`:
- `/auth/*` — register, login, me, forgot/reset password (dev token returned)
- `/products/*` — CRUD + listing/sort/filter/pagination
- `/cart/*` — add / update / remove / clear
- `/orders/*` — place / list / cancel
- `/wishlist/*`, `/reminders/*`, `/coupons/*`
- `/subscriptions/*` — plant-box plans + subscribe
- `/consultations/*` — book expert time slots
- `/corporate/*` — bulk corporate gifting quotes
- `/community/*` — posts + likes (basic)
- `/gift/*` — gift recommendations engine
- `/seasonal/*` — Bangladesh planting calendar (static)
- `/notifications/*`, `/admin/*`, `/analytics/*`

### Middleware
`auth_middleware.go` (JWT verify) · `admin_middleware.go` (role gate)

### Utilities
`hash.go` (bcrypt) · `jwt.go` (sign/verify) · `reset.go` (password-reset token generator)

---

## 3. Frontend (`frontend/src/`)

### Pages (`pages/` — 20 files)
| File                  | Purpose                                        |
|-----------------------|------------------------------------------------|
| `Home.jsx`            | Product listing + filters                      |
| `ProductDetail.jsx`   | Full product view, compare/save/share          |
| `Cart.jsx`            | Cart + checkout + coupon + Green Points        |
| `Orders.jsx`          | Order history + tracking stepper               |
| `Login / Register`    | Auth flow                                      |
| `ForgotPassword / ResetPassword` | Password recovery (dev token)        |
| `Profile.jsx`         | Address book, change password, delete account  |
| `Wishlist.jsx`        | Saved products                                 |
| `Reminders.jsx`       | Plant care reminders                           |
| `Subscriptions.jsx`   | Plant-box plans                                |
| `Consultations.jsx`   | Book expert slots                              |
| `Corporate.jsx`       | Corporate gifting                              |
| `Community.jsx`       | Posts / likes                                  |
| `Seasonal.jsx`        | Planting calendar                              |
| `StaticPage.jsx`      | about / contact / faq / privacy / terms / shipping / refund |
| `Admin.jsx`           | 7 admin tabs                                   |

### Components (`components/` — 15 files)
**Sprint A** — `EmailVerifyBanner`, `Notifications`
**Sprint B** — `ProductCard` (with hover overlay)
**Sprint C2 (no-API UI polish)** — `Toast`, `ScrollProgress`, `ThemeToggle`, `RecentlyViewed`, `CompareDrawer` (+ `CompareBar`), `QuickView`, `FeaturedCollections`, `Skeleton`, `Onboarding`, `StatsCounter`

### API wrappers (`api/` — 13 files)
`axios.js` (baseURL = `http://localhost:8081`, JWT injected) + per-resource modules: `auth, products, cart, orders, wishlist, reminders, coupons, notifications, subscriptions, consultations, corporate, community, seasonal, admin`

### State / Utils
- `context/AuthContext.jsx` — JWT + user in `localStorage`
- `utils/kb.js` — Sprint C2 localStorage stores:
  - `ThemeStore` (light/dark)
  - `RecentStore` (last 8 viewed)
  - `CompareStore` (up to 4)
  - `SaveForLaterStore`
  - `SearchStore`
  - `OnbStore` (onboarding dismissed flag)
  - Helpers: `fmtBDT`, `emojiFor`, `onStoreChange`
- Cross-component events: `kb:theme-changed`, `kb:recent-changed`, `kb:compare-changed`, `kb:save-changed`, `kb:search-changed`

---

## 4. Features Delivered

### Sprint A — Auth + Profile
- JWT register/login/logout
- `/auth/me` profile fetch
- Forgot/reset password (dev token surfaced in response)
- Profile page: address book, change password, delete account
- Email-verify banner (UI only — no SMTP wired)

### Sprint B — Catalogue + Cart
- Product CRUD + admin panel (7 tabs)
- Cart v2 with shipping fee + tax + Green Points
- Coupon system (apply/remove)
- Order placement + history + cancel
- Wishlist + Reminders + Notifications

### Sprint C — Commerce (commerce only; payments external)
- Cash-on-delivery-ready flow
- Invoice + email intentionally deferred (no SMTP)

### Sprint C2 — UI polish, **100% no-API / localStorage only**
| Feature                  | Where it lives                                |
|--------------------------|-----------------------------------------------|
| Dark theme               | `[data-theme="dark"]` in `index.css` + `ThemeStore` |
| Recently viewed strip    | `RecentlyViewed.jsx` + `RecentStore`          |
| Compare up to 4 products | `CompareDrawer.jsx` + `CompareStore` + `CompareBar` |
| Save for later           | `SaveForLaterStore` + buttons on card/detail  |
| Quick view modal         | `QuickView.jsx` (uses existing `getProduct`)  |
| Featured collections     | `FeaturedCollections.jsx` (4 client-curated rows) |
| Skeleton loaders         | `Skeleton.jsx` (CSS shimmer)                  |
| 4-step onboarding modal  | `Onboarding.jsx` + `OnbStore` (shown once)    |
| Animated stats counter   | `StatsCounter.jsx` (IntersectionObserver)     |
| Toast notifications      | `Toast.jsx` + `useToast` hook                 |
| Scroll progress bar      | `ScrollProgress.jsx`                          |
| Product-card hover overlay | Compare / Save / Quick-view buttons          |
| Product-detail action row | Compare / Save-for-later / Share buttons      |
| Share product link       | Web Share API → falls back to clipboard       |

### Admin
7 tabs: Products · Orders · Coupons · Reminders · Subscriptions · Consultations · Corporate (analytics charts pending — Sprint I1).

---

## 5. Run Locally

```bash
# backend
cd backend
go run main.go                 # serves http://localhost:8081

# frontend
cd frontend
npm install
npm run dev                    # serves http://localhost:5173
```

Admin login: see `DUMMY_USERS.md` (deleted — recreate by promoting a user via SQL `UPDATE users SET role='admin' WHERE email='...'`, then re-login so the new role enters the JWT).

---

## 6. External Resources — the explicit answer

**Nothing in the project depends on an external API or paid service.**

| Concern              | Status         | How it works today                                  |
|----------------------|----------------|-----------------------------------------------------|
| Payments             | ⏭️ deferred    | Cart shows total; "place order" succeeds without gateway |
| Image storage        | ⏭️ deferred    | Emoji placeholders 🌿 🪵 🧴 on cards + detail       |
| SMTP / email         | ⏭️ deferred    | Verification banner is UI-only                      |
| OAuth (Google/FB)    | ⏭️ deferred    | Email + password only                               |
| SMS / push           | ⏭️ deferred    | No service                                         |
| Maps / live tracking | ⏭️ deferred    | Static "Dispatched" status in Orders                |
| Analytics charts     | ⏳ pending     | Backend `/analytics/*` exists; admin tab UI pending |
| Search               | ✅ internal    | Client-side filter on `/products` response          |
| Recommendations      | ✅ internal    | `gift_controller.go` rule engine + `FeaturedCollections.jsx` client filter |
| Theme / prefs        | ✅ internal    | `localStorage` (`kb:*`)                             |
| Compare / Recent / Save-for-later | ✅ internal | `localStorage` (`kb:*`)                    |

Everything functional today is **just code** — Go on the server, React + CSS on the client, SQLite for persistence, JWT for auth, `localStorage` for UI state. No keys, no tokens, no webhooks, no cloud buckets.

---

## 7. What's still on the backlog (optional, no external deps required)

- **B1** Real product images (replace emoji placeholders)
- **I1** Admin sales/user charts
- **C2** Cash-on-delivery formalisation
- **D1** Plant-care dashboard polish
- **E1** Blog list + detail (markdown → DB)
- **L3** CSV import/export for products

None of the above needs a third party — all are pure code.