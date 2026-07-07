# 🎨 Frontend (`frontend/`)

React 19 + Vite + React Router v7 SPA. Default port **5173**.

---

## 1. Stack

| | Version |
|---|---|
| React | 19 |
| Vite | 8 |
| React Router | v7 (`react-router-dom`) |
| Axios | 1.x |
| Styling | Hand-rolled CSS (no Tailwind / MUI) |
| i18n | Custom `I18nProvider` with `en.json` / `bn.json` |

---

## 2. Layout

```
frontend/
├── package.json
├── vite.config.js
├── index.html
├── public/
│   ├── manifest.webmanifest
│   └── sw.js                # service worker
└── src/
    ├── main.jsx             # ReactDOM.createRoot
    ├── App.jsx              # <BrowserRouter> + global shell
    ├── index.css            # single global stylesheet
    │
    ├── api/                 # Axios clients
    │   ├── axios.js         # shared instance + auth interceptor
    │   ├── auth.js
    │   ├── admin.js
    │   ├── products.js
    │   ├── cart.js
    │   ├── orders.js
    │   ├── wishlist.js
    │   ├── reminders.js
    │   ├── subscriptions.js
    │   ├── consultations.js
    │   ├── corporate.js
    │   ├── community.js
    │   ├── blog.js
    │   ├── care.js
    │   ├── loyalty.js
    │   ├── gift.js
    │   ├── seasonal.js
    │   ├── notifications.js
    │   ├── coupon.js
    │   ├── analytics.js
    │   ├── backup.js
    │   ├── csv.js
    │   └── orderExt.js
    │
    ├── components/          # Reusable widgets
    │   ├── Navbar           # (defined inline in App.jsx)
    │   ├── Footer           # (defined inline in App.jsx)
    │   ├── ProductCard.jsx
    │   ├── QuickView.jsx
    │   ├── CompareDrawer.jsx
    │   ├── Notifications.jsx
    │   ├── Toast.jsx
    │   ├── ThemeToggle.jsx
    │   ├── LangToggle.jsx
    │   ├── Onboarding.jsx
    │   ├── ScrollProgress.jsx
    │   ├── FeaturedCollections.jsx
    │   ├── RecentlyViewed.jsx
    │   ├── StatsCounter.jsx
    │   ├── ErrorBoundary.jsx
    │   └── ReviewsSection.jsx
    │
    ├── pages/               # One file per route
    │   ├── Home.jsx
    │   ├── Login.jsx
    │   ├── Register.jsx
    │   ├── Profile.jsx
    │   ├── ProductDetail.jsx
    │   ├── Cart.jsx
    │   ├── Orders.jsx
    │   ├── OrderDetail.jsx
    │   ├── Wishlist.jsx
    │   ├── Reminders.jsx
    │   ├── Seasonal.jsx
    │   ├── Subscriptions.jsx
    │   ├── Consultations.jsx
    │   ├── Corporate.jsx
    │   ├── CorporateOrders.jsx
    │   ├── Community.jsx
    │   ├── CommunityQA.jsx
    │   ├── Blog.jsx
    │   ├── BlogDetail.jsx
    │   ├── Care.jsx
    │   ├── Loyalty.jsx
    │   ├── GiftCards.jsx
    │   ├── StaticPage.jsx
    │   └── Admin.jsx
    │
    ├── context/AuthContext.jsx
    ├── hooks/               # custom hooks
    ├── i18n/                # I18nProvider + JSON dictionaries
    │   ├── I18nProvider.jsx
    │   ├── en.json
    │   └── bn.json
    └── utils/               # formatters, helpers
```

---

## 3. Run

```bash
cd frontend
npm install
npm run dev                  # → http://localhost:5173
```

Other scripts (`package.json`):

```bash
npm run build                # production bundle to ./dist
npm run preview              # serve ./dist locally
npm run lint                 # oxlint
```

The dev server proxies API calls to `http://localhost:8081` because `axios.js` is hard-coded with that base URL. **Backend must be running first.**

---

## 4. Routing (React Router v7)

The whole app lives under `<BrowserRouter>` in `App.jsx`. Two helpers form the source of truth:

```js
pathFor(view)        // "cart"           → "/cart"
                     // "product-1202"   → "/product/1202"
                     // "blog-my-post"   → "/blog/my-post"

viewFromPath(pathname)  // "/orders/39" → { view: "order-detail", orderId: "39" }
```

### Route table

| Path | Component | Notes |
|---|---|---|
| `/` | `HomePage` | storefront |
| `/login`, `/register` | `Login`, `Register` | |
| `/profile` | `Profile` | |
| `/admin` | `Admin` | auto-redirect for non-admins |
| `/cart`, `/orders`, `/orders/:id` | `Cart`, `Orders`, `OrderDetail` | |
| `/wishlist`, `/reminders`, `/seasonal` | … | |
| `/subscriptions`, `/consultations`, `/corporate`, `/corp-portal` | … | |
| `/community`, `/communityqa`, `/blog`, `/blog/:slug` | … | |
| `/loyalty`, `/care`, `/gift-cards` | … | |
| `/product/:id` | `ProductDetail` | |
| `/about`, `/contact`, `/faq`, `/privacy`, `/terms`, `/shipping`, `/refund` | `StaticPage` | |
| `*` | `<Navigate to="/" />` | catch-all |

### Admin guard
A `useEffect` in `MainApp` watches `useLocation()`. If `user.role === "admin"` and the path is a customer-only view, it pushes `/admin` with `replace: true`.

### Deep-linkable components
`ProductCard`, `Cart`, `Wishlist`, `RecentlyViewed`, `CompareDrawer`, `QuickView`, `Blog`, `ReviewsSection` all use the global escape hatch:

```js
window.__katherboxSetView?.("home")         // → navigate("/")
window.__katherboxSetView?.(`product-${id}`) // → navigate(`/product/${id}`)
window.__katherboxOpenOrder?.(order)         // → navigate(`/orders/${id}`)
window.__katherboxOpenQuickView?.(id)        // opens the modal (still global state)
```

These globals are set in a single `useEffect` in `MainApp`.

---

## 5. State management

- **Auth** — `AuthContext` (`src/context/AuthContext.jsx`) provides `{ user, login, logout, register }`. Token + user persisted in `localStorage` (`kb_token`, `kb_user`).
- **i18n** — `I18nProvider` (`src/i18n/I18nProvider.jsx`) loads `en.json` or `bn.json`, exposes `t(key)` and `lang`. Language persisted in `localStorage.kb_lang`.
- **Theme** — light/dark via `[data-theme]` attribute on `<html>`; persisted in `localStorage.kb_theme`.
- **Cart / Compare / Quick-view** — local component state. Cart persists server-side.
- **No Redux / Zustand** — kept deliberately minimal.

---

## 6. API layer (`src/api/`)

Every domain has a small Axios wrapper. They all share `axios.js`, which:

- Sets `baseURL` to `http://localhost:8081/api`
- Attaches `Authorization: Bearer <kb_token>` from `localStorage` on every request
- Surfaces 401s by clearing the token and redirecting to `/login`

Example:

```js
// src/api/products.js
import api from "./axios";
export const listProducts = (params) => api.get("/products", { params }).then(r => r.data);
export const getProduct   = (id)     => api.get(`/products/${id}`).then(r => r.data);
```

To switch the API origin (e.g. for staging), edit `axios.js`.

---

## 7. Styling

- Single global stylesheet (`src/index.css`) with **CSS variables** for theming.
- Dark mode = `[data-theme="dark"]` on `<html>`. All colors derive from vars.
- Admin panel has its own shell (`.app-shell.is-admin-shell`, `.navbar.is-admin`, `.footer.is-admin-footer`).
- No preprocessor, no CSS-in-JS. Class names follow a flat BEM-ish convention.

---

## 8. Internationalization

Two dictionaries: `en.json`, `bn.json`. Languages: English + বাংলা. Toggle via the globe icon in the navbar. Keys look up with dotted paths, e.g.:

```js
t("nav.cart")            // "Cart" / "কার্ট"
t("footer.aboutUs")      // "About Us" / "আমাদের সম্পর্কে"
```

Add a new key in **both** files when introducing copy.

---

## 9. Build & deploy

```bash
npm run build             # → dist/
```

The output is a static SPA. **Critical**: configure your host to serve `index.html` for every unknown path so React Router can resolve deep links. Examples:

- **Vercel** — auto
- **Netlify** — add `/*  /index.html  200` to `_redirects`
- **Nginx** — `try_files $uri /index.html;`
- **Apache** — `FallbackResource /index.html`

---

## 10. Demo login (in UI)

| Email | Password | Result |
|---|---|---|
| `admin@katherbox.com` | `Admin@12345` | Redirected to `/admin` |
| `customer@test.com` | `Customer@12345` | Lands on `/` with full demo data |

See root [`README.md`](../README.md#4-demo-accounts) for what the customer account contains.