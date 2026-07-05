# KatherBox — Database Schema

Single SQLite file: `backend/katherbox.db` (auto-migrated at startup via GORM).

---

## ER Diagram (text form)

```
users ──┬──< carts ──< cart_items >── products
        ├──< wishlist_items >──────────── products
        ├──< orders ──< order_items >──── products
        ├──< notifications
        ├──< subscriptions
        ├──< consultations ──────── (experts table planned)
        ├──< corporate_quotes
        └──< care_reminders ──────── products

products ──< reviews (planned) >
products ──< product_images (planned) >
products ──< product_views (planned, for "recently viewed")

coupons (global, applied at checkout)
community_posts ──< community_comments
                ──< community_likes
coupons, seasons (single-row tables)
```

---

## Tables

### `users`
| Column | Type | Notes |
|---|---|---|
| id | uint PK | auto |
| email | string | unique |
| password | string | bcrypt hashed |
| name | string | |
| role | string | `customer` (default) / `admin` |
| email_verified | bool | |
| created_at / updated_at / deleted_at | time | GORM soft-delete |

### `products`
| Column | Type | Notes |
|---|---|---|
| id | uint PK | |
| name | string | |
| category | string | `plant` / `decor` / `care` |
| subcategory | string | `indoor_plant` / `outdoor_plant` / `plant_box` / `decor` / `soil` / `fertilizer` / `care_kit` |
| indoor_outdoor | string | `indoor` / `outdoor` / `both` / `` |
| price | float64 | BDT (৳) |
| stock | uint | 0 = out of stock |
| description | string | |
| image_url | string | (planned: replace with `product_images` join table) |
| created_at / updated_at / deleted_at | time | |

### `carts` & `cart_items`
- `carts`: one per user (`user_id` unique)
- `cart_items`: `{cart_id, product_id, quantity}`

### `wishlist_items`
- `{user_id, product_id}` — unique pair

### `orders` & `order_items`
- `orders`: `{user_id, total, status, address, payment_method, created_at}`
- `order_items`: `{order_id, product_id, quantity, price_at_purchase}`

### `notifications`
- `{user_id, type, title, body, read, created_at}`

### `subscriptions`
- `{user_id, plan, status, next_delivery_at, started_at}`

### `consultations`
- `{user_id, expert_id, scheduled_at, status, notes}`

### `corporate_quotes`
- `{user_id, company, contact_email, items_json, status}`

### `care_reminders`
- `{user_id, product_id, type (water/fert/repot), due_at, completed}`

### `coupons`
- `{code, discount_type (percent/fixed), amount, min_cart_total, expires_at, active}`

### `community_posts`, `community_comments`, `community_likes`
- Posts: `{user_id, title, body}`
- Comments: `{post_id, user_id, body}`
- Likes: `{post_id, user_id}` (unique pair)

### `seasonal_guides`
- `{month, title, body, created_at}` (public read)

---

## Seed data

`backend/cmd/seedproducts` creates 1000+ products distributed across 7 templates:

| Template | Weight | Examples |
|---|---|---|
| indoor_plant | 20 | Snake Plant, Pothos, Monstera, ZZ Plant |
| outdoor_plant | 18 | Rose, Jasmine, Marigold, Hibiscus |
| decor | 18 | Ceramic pot, Macramé hanger, Glass terrarium |
| soil | 14 | Potting mix, Cocopeat, Vermicompost |
| fertilizer | 14 | Neem cake, All-purpose NPK, Rooting hormone |
| plant_box | 8 | Wooden window box, Balcony planter |
| care_kit | 8 | Pruning kit, Anti-transpirant spray |

Weights are normalized — `split(N, templates)` distributes proportionally.

Stock distribution after a recent random pass:
- 848 in-stock (5+ units)
- 164 low-stock (1–4 units)
- 90 out-of-stock (0)

---

## Quick queries

```bash
# Open the DB
sqlite3 backend/katherbox.db

# Counts
SELECT COUNT(*) FROM products;
SELECT stock, COUNT(*) FROM products GROUP BY stock = 0;

# Find all admin users
SELECT email, role FROM users WHERE role='admin';

# Recent orders
SELECT id, user_id, total, status, created_at FROM orders ORDER BY id DESC LIMIT 5;
```

---

## Planned migrations

| Table | Purpose | Sprint |
|---|---|---|
| `product_images` | multi-image + image zoom | B |
| `reviews` | 1–5 star + comment | B |
| `product_views` | "recently viewed" | B |
| `addresses` | multi-address book | J |
| `payments` | Stripe/SSLCommerz records | C |
| `gift_cards` | redeemable codes | F |
| `green_points` | loyalty ledger | F |
| `referrals` | code + bonus tracking | F |
| `blog_posts` | content CMS | E |
| `care_guides` | markdown articles | E |
| `delivery_events` | tracking timeline | H |
| `audit_logs` | admin action history | I |