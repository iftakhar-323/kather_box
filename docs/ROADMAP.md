# KatherBox — Roadmap

What we're shipping next, grouped by sprint. Each item is independent so you
can re-order based on feedback.

Sprint definitions and effort estimates live in the **Baki ase** list (see
project root README). This file tracks progress and decisions.

---

## ✅ Done

- [x] Auth: register / login / forgot / reset / verify email
- [x] Products: CRUD, search, filter, sort, pagination (1102 seeded)
- [x] Cart, Wishlist, Orders, Coupons (backend)
- [x] Subscriptions (basic), Consultations, Corporate quotes
- [x] Care reminders, Community posts/comments/likes
- [x] Gift recommendations engine
- [x] Seasonal guide
- [x] Admin panel: 6 tabs (Products/Orders/Coupons/Reminders/Subs/Consult/Corporate)
- [x] 3D navbar + Footer + SSEcommerce trust strip
- [x] Responsive (3 breakpoints: 980 / 760 / 480)
- [x] Stock states in product cards (in/low/out)
- [x] CORS fix for `127.0.0.1` origins
- [x] Seed CLI (`cmd/seedproducts`)

---

## 🚀 Sprint A — Quick wins *(next up)*

| # | Item | Owner | Status |
|---|---|---|---|
| A1 | Forgot password UI | – | ⬜ |
| A2 | Reset password UI | – | ⬜ |
| A3 | Trust pages (About/Contact/FAQ/Privacy/Terms/Shipping/Refund) | – | ⬜ |
| A4 | Coupon UI on Cart | – | ⬜ |
| A5 | Order tracking timeline | – | ⬜ |
| A6 | Dark mode toggle | – | ⬜ |

---

## 🎨 Sprint B — Visual upgrades

| # | Item | Status |
|---|---|---|
| B1 | Image upload (replace emoji placeholders) | ⬜ |
| B2 | Multi-image gallery + zoom | ⬜ |
| B3 | Recently viewed + Related products | ⬜ |
| B4 | Compare products + Save for later | ⬜ |
| B5 | Reviews & ratings | ⬜ |

---

## 💳 Sprint C — Commerce

| # | Item | Status |
|---|---|---|
| C1 | Stripe (test mode) | ⬜ |
| C2 | Cash on Delivery | ⬜ |
| C3 | Invoice PDF | ⬜ |
| C4 | Order confirmation email | ⬜ |
| C5 | Shipping cost + tax calc | ⬜ |

---

## 🌿 Sprint D — Care / AI

| # | Item | Status |
|---|---|---|
| D1 | Plant Care Dashboard polish | ⬜ |
| D2 | AI Gift Recommendations UI on Home | ⬜ |
| D3 | Care Calendar view | ⬜ |
| D4 | Seasonal Recommendations | ✅ |

---

## 📚 Sprint E — Content / SEO

| # | Item | Status |
|---|---|---|
| E1 | Blog (list + detail + admin CMS) | ⬜ |
| E2 | Care Guides | ⬜ |
| E3 | Plant Encyclopedia | ⬜ |

---

## 💎 Sprint F — Loyalty / Community

| # | Item | Status |
|---|---|---|
| F1 | Green Points / Rewards | ⬜ |
| F2 | Referral program | ⬜ |
| F3 | Community v2 (photos, follows, Q&A) | ⬜ |
| F4 | Achievements / Membership | ⬜ |

---

## 🏢 Sprint G — Corporate portal

| # | Item | Status |
|---|---|---|
| G1 | Corporate full portal | ⬜ |

---

## 🚚 Sprint H — Delivery

| # | Item | Status |
|---|---|---|
| H1 | Live map tracking | ⬜ |
| H2 | Estimated delivery + partner dashboard | ⬜ |

---

## 🛠️ Sprint I — Admin

| # | Item | Status |
|---|---|---|
| I1 | Admin full panel (sales, users, CMS, settings) | ⬜ |

---

## 🔐 Sprint J — Auth / Social

| # | Item | Status |
|---|---|---|
| J1 | Google OAuth | ⬜ |
| J2 | Address book + change password + delete account | ⬜ |

---

## 💳 Sprint K — Multi-platform

| # | Item | Status |
|---|---|---|
| K1 | Multi-language (i18next) | ⬜ |
| K2 | Multi-currency | ⬜ |
| K3 | PWA + offline | ⬜ |
| K4 | Push notifications | ⬜ |
| K5 | SMS notifications | ⬜ |

---

## ☁️ Sprint L — Cloud / External

| # | Item | Status |
|---|---|---|
| L1 | Cloudinary | ⬜ |
| L2 | SSLCommerz | ⬜ |
| L3 | CSV import/export | ⬜ |

---

## 📊 Velocity target

| Sprint | Items | Est. |
|---|---|---|
| A | 6 | ~5 hr |
| B | 5 | ~13 hr |
| C | 5 | ~5 days |
| D | 4 | ~5 days |
| E | 3 | ~1.5 wk |
| F | 4 | ~1.5 wk |
| G | 1 | 1 wk |
| H | 2 | 1 wk |
| I | 1 | 3 days |
| J | 2 | 2 days |
| K | 5 | ~1.5 wk |
| L | 3 | 1 wk |

---

## 🚫 Out of scope (for now)

- Multi-tenant / SaaS mode
- Native mobile app (PWA covers basic install)
- Real-time chat (planned: WebSocket via SSE in Sprint D)
- Blockchain / NFT anything (not on the brief)

---

## How to add a roadmap item

1. Pick a sprint
2. Add a row with a stable id (`SprintLetter + Number`)
3. Update the **Done** list when shipped
4. Add a corresponding entry in `docs/CHANGELOG.md`