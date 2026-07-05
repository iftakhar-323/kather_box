# Changelog

All notable changes to KatherBox, newest first.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

---

## [Unreleased]

### Planned
- Forgot/Reset password UI (Sprint A1, A2)
- Trust/legal pages bundle (Sprint A3)
- Coupon UI on Cart (Sprint A4)
- Order tracking timeline (Sprint A5)
- Dark mode toggle (Sprint A6)

---

## [0.5.0] — 2026-07-05

### Added
- **SSEcommerce trust strip** on Home with multi-layer gradient, animated shimmer, embossed icon medallions, gold pill badges (PCI·DSS, FREE ৳1500+, RATED 4.9★, 24/7)
- **Responsive breakpoints** (980px / 760px / 480px) covering nav, hero, filter bar, product grid, footer, SSE strip
- **Stock state UI** on every product card: green "In stock · N available", amber "Only N left in stock", red "Out of stock" — with colored dot and pill background
- **Seed CLI** `backend/cmd/seedproducts` accepts a count argument and uses proportional weight distribution across 7 templates; output: `requested=N created=N skipped=N total_in_db=N`
- **Footer** component with brand/links/contact columns, social chips, copyright strip
- **Admin tabs** for Reminders, Subscriptions, Consultations, Corporate
- **3D navbar** (gradient, bevel highlights, hard shadows, layered leaves)

### Fixed
- **CORS 403 on `Origin: http://127.0.0.1:5173`** — added `127.0.0.1:5173` and `127.0.0.1:5174` to `cors.AllowOrigins` in `backend/main.go`
- Duplicate `export const getProduct` removed from `frontend/src/api/products.js`
- Seeder only filled first template (now uses `weight` + `split()`)
- Seeder infinite-loop on duplicate names (now uses `#{serial:04d}` suffix + tag)

### Changed
- 1102 products now in DB (mixed stock: 848 in / 164 low / 90 out)

---

## [0.4.0] — 2026-07-04

### Added
- Coupons backend (`POST /api/coupons/apply`)
- Gift recommendations (`GET /api/gifts/recommend`)
- Corporate quotes flow
- Care reminders (CRUD)
- Community posts/comments/likes
- Seasonal guide endpoint
- Admin analytics endpoint

### Changed
- Migrated from raw SQL to GORM ORM
- Auto-migrate on startup

---

## [0.3.0] — 2026-07-03

### Added
- JWT auth with role claim (`customer` / `admin`)
- bcrypt password hashing
- Email verification + password reset (token-based)

---

## [0.2.0] — 2026-07-02

### Added
- Product CRUD with admin guard
- Cart + Wishlist endpoints
- Order placement flow

---

## [0.1.0] — 2026-07-01

### Added
- Initial Go + Gin + SQLite scaffold
- React + Vite frontend with manual CSS design system
- Public product browse (no auth)