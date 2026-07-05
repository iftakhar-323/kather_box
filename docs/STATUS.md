# KatherBox — Project Status Report

**Generated:** July 5, 2026
**Repo:** `github.com/iftakhar-323/kather_box`
**Latest commit:** `59c55b4` on `main`

---

## 📊 At a glance

| Metric | Count |
|---|---|
| Backend controllers | 16 |
| Backend models (DB tables) | 12 |
| Backend route files | 15 |
| Frontend pages | 16 |
| Frontend API wrappers | 13 |
| Frontend components | 3 |
| Products seeded | 1,102 |
| Dummy users seeded | 4+ |
| Documentation files | 9 (~1,600 lines) |
| Git commits | 2 |
| Total source files in repo | ~90 |

---

## ✅ What is DONE (already working in the app)

### 🔐 Authentication & Users
- [x] **Register** — email + password + name → JWT token
- [x] **Login** — email + password → JWT
- [x] **Forgot password** — sends reset email (backend `POST /api/auth/forgot-password`)
- [x] **Reset password** — token + new password (backend `POST /api/auth/reset-password`)
- [x] **Email verification** — token-based (`/api/auth/send-verification`, `/verify-email`)
- [x] **JWT** stored in `localStorage`, auto-attached via axios interceptor
- [x] **Role-based access** (`customer` / `admin`) enforced by `middleware.AdminMiddleware()`
- [x] **bcrypt** password hashing
- [x] `GET /api/auth/me` returns current user

### 🛍️ Products & Catalog
- [x] **1102 products** seeded (varied categories + stock states)
- [x] **CRUD** for products (admin only on POST/PUT/DELETE)
- [x] **Search** by name or description (`?search=snake`)
- [x] **Filter** by category, subcategory, indoor/outdoor, min_price, max_price
- [x] **Sort** by newest, price_asc, price_desc, name_asc
- [x] **Pagination** with `{items, page, limit, total, total_pages}` envelope
- [x] **Stock states** rendered in UI: green "In stock · N available", amber "Only N left", red "Out of stock" — with colored dot + pill
- [x] **Seed CLI** `go run ./cmd/seedproducts [N]` with proportional weight distribution across 7 templates
- [x] **Product detail page** with view-by-id routing

### 🛒 Shopping flows
- [x] **Cart** — add, update qty, remove, view total (auth required)
- [x] **Wishlist** — add, view, remove
- [x] **Orders** — place from cart, list, view detail, cancel
- [x] **Coupons** — `POST /api/coupons/apply` (backend ready; UI not wired yet)
- [x] **Add-to-cart** disabled when stock = 0
- [x] **Wishlist ♥ Save** on every product card

### 🌿 Subscriptions
- [x] **Subscribe** to a plan (`POST /api/subscriptions`)
- [x] **List mine**
- [x] **Cancel** subscription
- [x] **Advance** to next delivery

### 🩺 Consultations
- [x] **List experts** (`GET /api/consultations/experts`)
- [x] **Book** a consultation (`POST /api/consultations`)
- [x] **List mine**
- [x] **Cancel** a booking
- [x] Admin can confirm/cancel any booking

### 🏢 Corporate
- [x] **Submit corporate quote request** (company, items, contact)
- [x] **List my quotes**
- [x] Admin can update status (pending/approved/rejected)

### 🌱 Plant Care Reminders
- [x] **Reminders** model (water / fertilizer / repot)
- [x] **List my reminders** (`GET /api/reminders`)
- [x] **Mark complete**
- [x] Admin can list all reminders

### 👥 Community
- [x] **Posts** — create, list, delete own
- [x] **Comments** — add, list per post
- [x] **Likes** — toggle

### 🎁 Smart features
- [x] **Gift recommendations** (`GET /api/gifts/recommend`) — by budget, occasion, indoor/outdoor
- [x] **Seasonal guide** (`GET /api/seasonal-guide`) — Bangladesh-friendly monthly planting calendar
- [x] **SSEcommerce trust strip** on Home (4 tiles with multi-layer gradient, shimmer animation, gold badges)

### 🔔 Notifications
- [x] **Notifications bell** in navbar (live count, dropdown)
- [x] **Backend** stores per-user notifications (order updates, subscription alerts, etc.)
- [x] **Mark as read** (single or all)

### 🛠️ Admin Panel
- [x] **Admin dashboard** at `/admin` (visible only when `role === "admin"`)
- [x] **Tab 1 — Products**: list, create, edit, delete (with stock-color coding)
- [x] **Tab 2 — Orders**: list all orders, update status, delete
- [x] **Tab 3 — Coupons**: list active coupons
- [x] **Tab 4 — Reminders**: list all reminders, mark complete
- [x] **Tab 5 — Subscriptions**: list all, cancel any
- [x] **Tab 6 — Consultations**: list all, confirm/cancel
- [x] **Tab 7 — Corporate**: list all quotes, update status
- [x] **Analytics endpoint**: revenue, orders count, new users (admin only)

### 🎨 UI / Design
- [x] **Modern green theme** matching brief palette (`#1B4332`, `#2D6A4F`, `#40916C`)
- [x] **3D navbar** with bevel highlights, hard shadows, gradient base
- [x] **Footer** with brand/links/contact columns, social chips, copyright
- [x] **SSEcommerce trust strip** — premium dark-green panel with shimmer, embossed icons, gold badges
- [x] **EmailVerifyBanner** — appears on Home when user is logged in but email not verified
- [x] **Responsive** at 3 breakpoints: **980px** (tablet), **760px** (mobile), **480px** (small mobile)
- [x] **No horizontal scroll** at any width
- [x] **Smooth shadows + rounded cards** consistent across all pages

### 🐛 Bug fixes this session
- [x] **CORS 403 on `127.0.0.1:5173`** — was rejecting every browser request; added origins to `cors.AllowOrigins`
- [x] **Duplicate `getProduct` export** in `frontend/src/api/products.js` removed
- [x] **Seeder stuck on first template** — replaced quota with proportional weight + `split()`
- [x] **Seeder infinite loop on duplicate names** — added serial suffix `#{0001}` + tag

### 📚 Documentation (this session's biggest deliverable)
- [x] `docs/README.md` — index
- [x] `docs/INSTALLATION.md` — local setup, env vars, troubleshooting
- [x] `docs/ARCHITECTURE.md` — codebase tour, patterns, where-to-change-what
- [x] `docs/API.md` — every endpoint documented
- [x] `docs/DATABASE.md` — schema, ER diagram, seed data, planned migrations
- [x] `docs/DEPLOYMENT.md` — Vercel + Render, env vars, Stripe/SSLCommerz stubs
- [x] `docs/TESTING.md` — manual smoke tests + Go/Vitest/Playwright templates + CI
- [x] `docs/ROADMAP.md` — sprint tracker with checkboxes
- [x] `docs/CHANGELOG.md` — version history (Keep a Changelog)
- [x] `README.md` — updated with docs index

---

## ❌ What is NOT done yet (the "Baki ase" list)

### 🚀 Sprint A — Quick wins (~5 hours total)

| # | Feature | Why it matters | Backend | Frontend | Est. |
|---|---|---|---|---|---|
| **A1** | **Forgot Password UI page** | Users can request reset link | ✅ ready | ❌ missing | 30 min |
| **A2** | **Reset Password UI page** | Users can set new password via email link | ✅ ready | ❌ missing | 30 min |
| **A3** | **Trust/Legal pages** — About, Contact, FAQ, Privacy Policy, Terms, Shipping Policy, Refund Policy | Required for trust + legal compliance | n/a | ❌ 7 pages missing | 1 hr |
| **A4** | **Coupon UI on Cart** — input field, "Apply" button, show discount in totals | Makes existing backend endpoint usable | ✅ ready | ❌ missing | 1 hr |
| **A5** | **Order tracking timeline** — visual stepper (Placed → Confirmed → Shipped → Delivered) | Standard e-commerce expectation | ⚠️ status field exists | ❌ only a badge | 1 hr |
| **A6** | **Dark mode toggle** in navbar with persistence | Brief asked, visual upgrade | n/a | ❌ no toggle | 1 hr |

### 🎨 Sprint B — Visual upgrades (~13 hours)

| # | Feature | Backend | Frontend | Est. |
|---|---|---|---|---|
| **B1** | **Image upload** — replace 🌿 emoji with real images, store in `/uploads/` | ❌ | ❌ | 2 hr |
| **B2** | **Multi-image gallery + zoom** on product detail | ❌ | ❌ | 2 hr |
| **B3** | **Recently viewed + Related products** on ProductDetail | ❌ | ❌ | 2 hr |
| **B4** | **Compare products + Save for Later** | ❌ | ❌ | 3 hr |
| **B5** | **Reviews & ratings** (1–5 stars + comments) | ❌ no model | ❌ | 4 hr |

### 💳 Sprint C — Commerce depth (~5 days)

| # | Feature | Backend | Frontend | Est. |
|---|---|---|---|---|
| **C1** | **Stripe payment** (test mode) | ❌ | ❌ | 1 day |
| **C2** | **Cash on Delivery** flow | ❌ no `payment_method` | ❌ | 4 hr |
| **C3** | **Invoice PDF generation** + download from Orders | ❌ | ❌ | 4 hr |
| **C4** | **Order confirmation email** with summary | ❌ | n/a | 2 hr |
| **C5** | **Shipping cost + tax** in Cart | ❌ | ❌ | 4 hr |

### 🌿 Sprint D — Care / AI (~5 days)

| # | Feature | Backend | Frontend | Est. |
|---|---|---|---|---|
| **D1** | **Plant Care Dashboard polish** (water log, growth journal) | ⚠️ reminders exist | ⚠️ basic list | 2 days |
| **D2** | **AI Gift Recommendations UI on Home** (promo card) | ✅ exists | ⚠️ widget exists | 1 day |
| **D3** | **Care Calendar** view per plant | ❌ | ❌ | 1 day |
| **D4** | Seasonal Recommendations engine | ✅ | ✅ | ✅ done |

### 📚 Sprint E — Content / SEO (~1.5 weeks)

| # | Feature | Est. |
|---|---|---|
| **E1** | **Blog** (list + detail + admin CMS) | 2 days |
| **E2** | **Care Guides** (markdown articles) | 2 days |
| **E3** | **Plant Encyclopedia** (searchable species DB) | 3 days |

### 💎 Sprint F — Loyalty / Community (~1.5 weeks)

| # | Feature | Est. |
|---|---|---|
| **F1** | **Green Points / Rewards** (earn on purchase, redeem) | 3 days |
| **F2** | **Referral program** (code + bonus) | 2 days |
| **F3** | **Community v2** — photos, bookmarks, follows, Q&A, leaderboard | 1 week |
| **F4** | **Achievements / Membership tiers** | 2 days |

### 🏢 Sprint G — Corporate portal (1 week)

| # | Feature | Est. |
|---|---|---|
| **G1** | **Corporate full portal** (bulk orders, custom branding, approval workflow, employee gifts) | 1 week |

### 🚚 Sprint H — Delivery (1 week)

| # | Feature | Est. |
|---|---|---|
| **H1** | **Live map tracking** | 1 week |
| **H2** | **Estimated delivery + partner dashboard** | 3 days |

### 🛠️ Sprint I — Admin (3 days)

| # | Feature | Est. |
|---|---|---|
| **I1** | **Admin full panel** (dashboard charts, sales reports, categories, users, admins, blogs CMS, inventory, settings, roles/permissions) | 3 days |

### 🔐 Sprint J — Auth / Social (2 days)

| # | Feature | Est. |
|---|---|---|
| **J1** | **Google OAuth** login | 1 day |
| **J2** | **Address book + change password + delete account** pages | 1 day |

### 💳 Sprint K — Multi-platform (~1.5 weeks)

| # | Feature | Est. |
|---|---|---|
| **K1** | **Multi-language (i18next)** | 3 days |
| **K2** | **Multi-currency** | 2 days |
| **K3** | **PWA manifest + offline shell** | 2 days |
| **K4** | **Push notifications** | 2 days |
| **K5** | **SMS notifications** | 1 day |

### ☁️ Sprint L — Cloud / External (1 week)

| # | Feature | Est. |
|---|---|---|
| **L1** | **Cloudinary** image storage | 2 days |
| **L2** | **SSLCommerz** payment | 2 days |
| **L3** | **CSV import/export** for products | 1 day |

---

## 🚫 Out of scope (intentionally skipped)

- Multi-tenant / SaaS mode
- Native mobile apps (PWA covers basic install)
- Real-time chat (planned in Sprint D as a stretch)
- Anything blockchain/NFT

---

## 📈 Total work remaining

| | |
|---|---|
| **Items left** | **41** |
| **Total estimated effort** | **~7–8 weeks** (one dev, full-time) |
| **Recommended first sprint** | Sprint A (6 items, ~5 hours) |

---

## 🎯 Sprint A in priority order

1. **A1 + A2** — Forgot/Reset Password UI (completes the auth loop)
2. **A3** — Trust/legal pages bundle (1 shared template, 7 pages)
3. **A4** — Coupon UI on Cart (backend ready, just wire frontend)
4. **A5** — Order tracking timeline (visual upgrade, easy)
5. **A6** — Dark mode toggle (CSS vars already exist)

After Sprint A, the most impactful next picks are:
- **B1** — Image upload (kills the emoji placeholder — biggest visual upgrade)
- **C1** — Stripe test mode (makes checkout real)
- **D1** — Plant Care Dashboard polish (uses existing reminders)

---

## 📂 File-by-file deliverable summary

### Backend (Go)
```
backend/
├── main.go                              ← CORS fix, route registration
├── go.mod                               ← deps
├── database/database.go                 ← GORM open + auto-migrate (12 tables)
├── models/                              ← 12 model files
├── controllers/                         ← 16 controller files
├── routes/                              ← 15 route files
├── middleware/                          ← auth + admin JWT guards
├── utils/                               ← hash + jwt + reset helpers
└── cmd/seedproducts/main.go             ← CLI seeder (proportional weights)
```

### Frontend (React + Vite)
```
frontend/
├── package.json                         ← React, Axios, Router DOM
├── vite.config.js
├── index.html
└── src/
    ├── main.jsx
    ├── App.jsx                          ← state-based view switching, NAV_ITEMS, Footer
    ├── index.css                        ← design tokens + all component CSS
    ├── api/                             ← 13 API wrappers
    ├── components/                      ← ProductCard, Notifications, EmailVerifyBanner
    ├── context/AuthContext.jsx
    └── pages/                           ← 16 page components
```

### Docs
```
docs/
├── README.md                            ← index
├── INSTALLATION.md                      ← setup guide
├── ARCHITECTURE.md                      ← codebase tour
├── API.md                               ← REST reference
├── DATABASE.md                          ← schema + ER
├── DEPLOYMENT.md                        ← Vercel + Render
├── TESTING.md                           ← test plan + templates
├── ROADMAP.md                           ← sprint tracker
├── CHANGELOG.md                         ← version history
└── STATUS.md                            ← this file
```

### Repo root
```
README.md                                ← pitch + docs index (updated)
ADMIN_GUIDE.md                           ← admin workflow
DUMMY_USERS.md                           ← seed credentials
.gitignore                               ← +.puku/ exclusion
```

---

## ✅ Recommendation

Start with **Sprint A** in one sitting (~5 hours):
- Closes the trust + auth + commerce loop
- Most items are 30–60 min each
- All backend code already exists for A1/A2/A4
- A6 (dark mode) is satisfying because design tokens are already in CSS

After that, jump to **B1 (image upload)** — single biggest visual upgrade, kills the emoji placeholder, makes the app look production-ready.

Tell me "start A1" or "do A1+A2+A3" and I'll batch-build.