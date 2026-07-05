# KatherBox — REST API Reference

Base URL: `http://localhost:8081/api`

All endpoints accept and return JSON. Authenticated endpoints require:

```
Authorization: Bearer <jwt>
```

Response envelope for list endpoints:
```json
{ "items": [...], "page": 1, "limit": 12, "total": 1102, "total_pages": 92 }
```

---

## Auth (`/api/auth`)

| Method | Path | Auth | Body / Query | Returns |
|---|---|---|---|---|
| POST | `/register` | – | `{email, password, name?}` | `{token, user}` |
| POST | `/login` | – | `{email, password}` | `{token, user}` |
| POST | `/forgot-password` | – | `{email}` | `{message}` + sends reset email |
| POST | `/reset-password` | – | `{token, new_password}` | `{message}` |
| GET | `/me` | ✓ | – | `user` (id, email, name, role, verified) |
| POST | `/send-verification` | ✓ | – | `{message}` + sends email |
| POST | `/verify-email` | – | `{token}` | `{message}` |

---

## Products (`/api/products`)

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/` | – | List with filters (see below) |
| GET | `/:id` | – | Single product |
| POST | `/` | admin | Create |
| PUT | `/:id` | admin | Update |
| DELETE | `/:id` | admin | Delete |

### Filters (all optional, query string)

| Param | Example | Effect |
|---|---|---|
| `search` | `?search=snake` | `name LIKE %snake% OR description LIKE %snake%` |
| `category` | `?category=plant` | exact match |
| `subcategory` | `?subcategory=indoor_plant` | exact match |
| `indoor_outdoor` | `?indoor_outdoor=indoor` | matches `indoor` or `both` |
| `min_price` | `?min_price=500` | `price >= 500` |
| `max_price` | `?max_price=2000` | `price <= 2000` |
| `sort` | `?sort=newest` | one of: `newest`, `price_asc`, `price_desc`, `name_asc` (default `newest`) |
| `page` | `?page=2` | 1-indexed (default 1) |
| `limit` | `?limit=12` | default 24, max 100 |

---

## Cart (`/api/cart`) — auth required

| Method | Path | Body |
|---|---|---|
| GET | `/` | – |
| POST | `/add` | `{product_id, quantity}` |
| PUT | `/item/:id` | `{quantity}` |
| DELETE | `/item/:id` | – |

---

## Wishlist (`/api/wishlist`) — auth required

| Method | Path | Body |
|---|---|---|
| GET | `/` | – |
| POST | `/add` | `{product_id}` |
| DELETE | `/:id` | – |

---

## Orders (`/api/orders`) — auth required

| Method | Path | Notes |
|---|---|---|
| GET | `/` | My order history |
| GET | `/:id` | Order detail |
| POST | `/` | Place order from current cart |
| POST | `/:id/cancel` | Cancel (if not shipped) |

---

## Coupons (`/api/coupons`) — auth required

| Method | Path | Body |
|---|---|---|
| GET | `/` | List active coupons |
| POST | `/apply` | `{code, cart_total}` → `{discount, new_total}` |

---

## Subscriptions (`/api/subscriptions`) — auth required

| Method | Path | Notes |
|---|---|---|
| POST | `/` | Subscribe to a box plan |
| GET | `/` | My subscriptions |
| POST | `/:id/cancel` | Cancel |
| POST | `/:id/advance` | Skip to next delivery |

---

## Consultations (`/api/consultations`) — auth required

| Method | Path | Notes |
|---|---|---|
| GET | `/experts` | Public list of available experts |
| POST | `/` | Book a slot — `{expert_id, scheduled_at, notes}` |
| GET | `/` | My bookings |
| POST | `/:id/cancel` | Cancel |

---

## Corporate quotes (`/api/corporate`) — auth required

| Method | Path | Body |
|---|---|---|
| POST | `/` | Request bulk quote — `{company, items, contact}` |
| GET | `/mine` | My corporate quotes |

---

## Reminders (`/api/reminders`) — auth required (plant care)

| Method | Path | Notes |
|---|---|---|
| GET | `/` | My reminders |
| POST | `/:id/complete` | Mark a reminder done |

---

## Community (`/api/community`) — auth required

| Method | Path | Body |
|---|---|---|
| GET | `/posts` | List all posts |
| POST | `/posts` | `{title, body}` |
| GET | `/posts/:id/comments` | List comments on a post |
| POST | `/posts/:id/comments` | `{body}` |
| POST | `/posts/:id/like` | Toggle like |
| DELETE | `/posts/:id` | Delete own post |

---

## Gifts (`/api/gifts`) — public

| Method | Path | Query | Returns |
|---|---|---|---|
| GET | `/recommend` | `?budget=2000&occasion=birthday&indoor=indoor` | `{items: [{product, score, reason}]}` |

---

## Seasonal guide (`/api/seasonal`) — public

| Method | Path | Notes |
|---|---|---|
| GET | `/` | Current month's plant care tips |

---

## Notifications (`/api/notifications`) — auth required

| Method | Path | Notes |
|---|---|---|
| GET | `/` | My notifications (unread first) |
| POST | `/mark-read` | `{id}` or `{all: true}` |

---

## Admin (`/api/admin`) — admin required

| Method | Path | Returns |
|---|---|---|
| GET | `/orders` | All orders (paginated) |
| PUT | `/orders/:id/status` | `{status}` (placed / confirmed / shipped / delivered / cancelled) |
| DELETE | `/orders/:id` | Delete |
| GET | `/analytics` | `{revenue, orders_today, new_users, ...}` |
| GET | `/reminders` | All reminders |
| POST | `/reminders/:id/complete` | Mark done |
| GET | `/subscriptions` | All subscriptions |
| POST | `/subscriptions/:id/cancel` | Cancel |
| GET | `/consultations` | All bookings |
| POST | `/consultations/:id/confirm` | Confirm |
| POST | `/consultations/:id/cancel` | Cancel |
| GET | `/corporate` | All corporate quotes |
| PUT | `/corporate/:id` | `{status}` (pending / approved / rejected) |

---

## Error codes

| HTTP | Meaning |
|---|---|
| 400 | Bad request — missing or invalid field |
| 401 | Missing or invalid JWT |
| 403 | Authenticated but not allowed (wrong role) |
| 404 | Resource not found |
| 409 | Conflict (duplicate email, etc.) |
| 500 | Server error |

Error body shape:
```json
{ "error": "Human readable message" }
```