# 🗄️ Database (SQLite)

KatherBox uses a **single SQLite file** for everything: products, users, orders, subscriptions, reviews, blog posts, community, loyalty, journals, etc.

- **Path:** `backend/katherbox.db` (auto-created on first run)
- **Driver:** `gorm.io/driver/sqlite` v1.6
- **Migrations:** automatic via GORM `AutoMigrate` on backend startup
- **No external DB server needed**

---

## 1. Where the file lives

`backend/database/database.go` opens it relative to the working directory:

```go
gorm.Open(sqlite.Open("katherbox.db"), &gorm.Config{})
```

So when you run `go run main.go` from `backend/`, the DB is `backend/katherbox.db`. If you `cd ..` first, you'll create a stray `katherbox.db` in the project root. Always run from `backend/`.

---

## 2. Tools you can use

### Option A — `sqlite3` CLI (recommended)

```bash
sudo apt install -y sqlite3     # one-time
sqlite3 backend/katherbox.db    # opens an interactive shell
```

Inside the shell:

```sql
.tables                    -- list all tables
.schema users              -- show CREATE statement
.headers on
.mode column
SELECT id, name, email, role FROM users;
```

### Option B — `litecli` (nicer UI)

```bash
pip install litecli
litecli backend/katherbox.db
```

Tab-completion, syntax highlighting, history.

### Option C — DB Browser for SQLite (GUI)

<https://sqlitebrowser.org/> — point it at `backend/katherbox.db`.

### Option D — VS Code extension

Install **SQLite Viewer** by `qwerttvv`, open the `.db` file directly.

### Option E — through the Go app

```go
// anywhere in your code:
database.DB.Raw("SELECT * FROM users").Scan(&out)
```

---

## 3. Schema overview

Auto-migrated tables (created in this order on first run):

| Table | Purpose | Key columns |
|---|---|---|
| `users` | Login accounts + customers + admins | `id, name, email, password (bcrypt), role, phone, address, …` |
| `addresses` | Shipping addresses per user | `user_id, label, recipient, phone, line1, line2, city, region, postal_code, country, is_default` |
| `products` | Catalog | `id, name, slug, sku, brand, price, stock, category, parent_category, image_url, description, …` |
| `carts` | Active cart per user | `user_id, product_id, quantity` |
| `orders` | Placed orders | `user_id, total_price, status, address_id, gift_wrap, …` |
| `order_items` | Line items per order | `order_id, product_id, quantity, unit_price` |
| `wishlists` | Saved products | `user_id, product_id` |
| `reminders` | Restock / care reminders | `user_id, product_id, type, next_due_date` |
| `subscriptions` | Plant-box plans | `user_id, plan_name, interval_days, next_delivery, status` |
| `consultations` | Booked expert slots | `user_id, expert_name, topic, scheduled_at, status` |
| `corporate_quotes` | Bulk gifting | `user_id, company_name, contact_name, contact_email, recipients (JSON), budget_per_gift, total_estimate, status` |
| `community_posts` | Q&A posts | `user_id, title, body` |
| `community_comments` | Replies | `post_id, user_id, body` |
| `community_likes` | Likes | `post_id, user_id` |
| `blog_posts` | Blog CMS | `slug, title, body, author, …` |
| `reviews` | Product reviews | `product_id, user_id, rating, comment` |
| `journals` | Care journal entries | `user_id, product_id, note, mood` |
| `notifications` | In-app messages | `user_id, type, title, body, read` |
| `coupons` | Promo codes | `code, discount_pct, valid_from, valid_to, …` |
| `loyalty_*` | Achievements, referrals, rewards | … |

For exact columns run `.schema <table>` in `sqlite3`.

---

## 4. Common SQL recipes

### Reset everything
```bash
cd backend
rm -f katherbox.db
go run main.go                  # re-creates an empty schema
go run ./cmd/resetusers/        # demo accounts
go run ./cmd/seedproducts/      # products
go run ./cmd/seeddummy/         # 50 of each order/subscription/etc.
```

### List all users
```sql
SELECT id, name, email, role FROM users;
```

### Promote a customer to admin
```sql
UPDATE users SET role = 'admin' WHERE email = 'customer@test.com';
-- Then log out and log back in so the new role enters the JWT.
```

### Reset a user's password (without the seed script)
You need a fresh bcrypt hash. The easiest path is to re-run `resetusers`:

```bash
go run ./cmd/resetusers/
```

If you need a one-off hash, do it in Go:

```go
h, _ := utils.HashPassword("MyNewPass123")
database.DB.Model(&models.User{}).
  Where("email = ?", "x@y.com").
  Update("password", h)
```

### Count orders per customer
```sql
SELECT u.id, u.name, u.email, COUNT(o.id) AS orders, SUM(o.total_price) AS spent
FROM users u
LEFT JOIN orders o ON o.user_id = u.id AND o.deleted_at IS NULL
GROUP BY u.id
ORDER BY spent DESC;
```

### Find orphaned orders (no matching user)
```sql
SELECT o.* FROM orders o
LEFT JOIN users u ON u.id = o.user_id
WHERE u.id IS NULL;
```

### Soft-deletes
GORM soft-deletes set `deleted_at`. To truly purge:

```sql
DELETE FROM orders WHERE deleted_at IS NOT NULL;
```

---

## 5. Test customer account — `customer@test.com`

This is the canonical "everything works" account. Run `go run ./cmd/resetusers/` to ensure the password is `Customer@12345`, then:

| Service | Count | Notes |
|---|---|---|
| Orders | 32 | seeded by `seeddummy` |
| Subscriptions | 4 | seeded |
| Consultations | 1 | seeded |
| Corporate quotes | 5 | seeded |
| Reminders | 2 | seeded |
| Wishlist | 5 | populated by `resetusers` follow-up script |
| Addresses | 3 (Home / Office / Mom's) | populated |
| Reviews | 5 on real products | populated |
| Community posts | 2 (Q&A) | populated |
| Care journal | 4 entries | populated |
| Loyalty | Gold tier · 472 pts · 10% discount · ৳69,000 spend | seeded |
| Referral code | minted | seeded |

To recreate this account on a fresh DB:

```bash
cd backend
rm -f katherbox.db
go run main.go                                # creates schema
go run ./cmd/resetusers/                      # resets password + role
go run ./cmd/seedproducts/
go run ./cmd/seeddummy/                       # 50 of each entity
go run ./cmd/topup-customer/                  # (optional) wishlist/reviews/journal/community — see below
```

> The `topup-customer` helper lives in a one-off script; if it isn't committed in your checkout, the items above can be added manually via the UI as `customer@test.com` or via the admin REST endpoints (see `backend/README.md`).

---

## 6. Backing up / restoring

### Backup
```bash
sqlite3 backend/katherbox.db ".backup '/tmp/kb-$(date +%F).db'"
```

Or just copy the file:
```bash
cp backend/katherbox.db ~/backup/katherbox-2026-07-07.db
```

**Stop the backend first** for a clean copy. SQLite is safe to copy while live for most cases, but a `.backup` is the canonical way.

### Restore
```bash
cp ~/backup/katherbox-2026-07-07.db backend/katherbox.db
# then restart the backend
```

There is also an in-app endpoint:
- `POST /api/admin/backup` — downloads a `.db` snapshot (admin only)

---

## 7. Inspecting migrations

```sql
SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';
```

To see GORM's auto-migrate history, the schema lives in the SQL definitions themselves (no separate migration log). Each table's `CREATE` statement is reconstructable with `.schema`.

---

## 8. Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| `database is locked` | Two backends pointed at the same file | Kill all `go run main.go` and restart one |
| Schema missing after fresh checkout | You haven't run the backend yet | `cd backend && go run main.go` |
| `password column null` after register | Migration ran before `password` column added | Delete `katherbox.db` and re-run |
| Foreign-key errors on delete | GORM uses soft-delete; not actually freed | Hard-delete via `Unscoped().Delete(...)` |
| Stale data after editing seeders | Old rows still there | `DELETE FROM <table>` and re-seed |