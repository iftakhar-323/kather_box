# KatherBox — Admin Panel Guide

A short step-by-step for whoever is going to manage the shop (Ritu or
course evaluators). Assumes both servers are running:
backend on `http://localhost:8081` and frontend on `http://localhost:5174`.

---

## 1. Make sure your account is an admin

Newly registered users always start with `role = "customer"`. To
become an admin you have to be promoted once. Two easy ways:

### Option A — SQL (simplest)
```bash
cd backend
sqlite3 katherbox.db "UPDATE users SET role='admin' WHERE email='YOU@email.com';"
sqlite3 katherbox.db "SELECT email, role FROM users;"
```

### Option B — Promote via the running backend
Not implemented yet (planned). Use Option A for now.

---

## 2. Get a fresh admin token (IMPORTANT)

Your **JWT** was issued at login time and embeds the role claim. If
you were promoted *after* your last login, the browser still holds a
token with `role: "customer"` — and the backend will reject every
admin request with `403 Admin access required`.

**Fix:** log out, then log back in. The new token will carry
`role: "admin"`.

```
http://localhost:5174/
  → click "Logout"
  → click "Login"
  → enter your email + password
```

---

## 3. Open the admin panel

When you're logged in as an admin you'll see:

- A red **Admin** button in the navbar
- An `ADMIN` badge next to your name

Click **Admin**. The page has two tabs:

### Tab 1 — Products

| Action   | What it does                                              |
|----------|-----------------------------------------------------------|
| **+ New Product** | Opens a modal to create a product             |
| **Edit**         | Opens the same modal pre-filled with the row  |
| **Delete**       | Removes the product (confirmation required)   |

Modal fields:
- **Name** (required)
- **Category** — `plant` or `decor`
- **Price** (৳) — number
- **Stock** — integer
- **Description** — optional
- **Image URL** — optional (full https URL)

The Stock column is color-coded:
- **Red** = 0 (out of stock, Add-to-Cart is disabled on the shop page)
- **Orange** = < 5
- **Green** = healthy

### Tab 2 — All Orders

Shows every order placed by any customer, newest first.

Columns:
- **Order #** — the order ID
- **User** — `User #<id>` of the customer who placed it
- **Date** — when it was created
- **Items** — line items (name × qty)
- **Total** — ৳ amount
- **Status** — dropdown (change to update immediately)
- **Delete** — removes the order (irreversible)

Status values: `Pending` → `Processing` → `Packed` → `On the Way` → `Delivered`.
The same status is shown to the customer in their **Orders** page.

---

## 4. Common issues and fixes

| Symptom                                          | Likely cause / fix                                                                 |
|--------------------------------------------------|------------------------------------------------------------------------------------|
| "Admin access required" on every action          | Stale JWT — log out and log back in.                                               |
| "Admin access required" + you're sure you're admin | DB still says `customer`. Run: `sqlite3 backend/katherbox.db "UPDATE users SET role='admin' WHERE email='YOU@email.com';"`, then re-login. |
| Admin tab is empty / 404                         | Backend not running on 8081, or you restarted the backend without rebuilding.     |
| Product create succeeds but stock didn't change  | The reservation happens on Add-to-Cart, not on Create Product. Add-to-Cart must succeed for stock to drop. (This is correct behaviour.) |

---

## 5. Quick smoke-test (curl)

```bash
# 1. login as admin
TOKEN=$(curl -s -X POST http://localhost:8081/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"YOU@email.com","password":"YOUR_PASSWORD"}' \
  | python3 -c "import json,sys;print(json.load(sys.stdin)['token'])")

# 2. list all orders (admin only)
curl -s http://localhost:8081/api/admin/orders -H "Authorization: Bearer $TOKEN"

# 3. change order #1 status to "Processing"
curl -s -X PUT http://localhost:8081/api/admin/orders/1/status \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"status":"Processing"}'
```

---

## 6. Where the code lives

| Concern                        | File                                                      |
|--------------------------------|-----------------------------------------------------------|
| Admin middleware               | `backend/middleware/admin_middleware.go`                  |
| `/api/admin/*` routes          | `backend/routes/order_routes.go`                          |
| Admin endpoints (controllers)  | `backend/controllers/order_controller.go` (`GetAllOrders`, `DeleteOrder`) |
| Admin panel UI                 | `frontend/src/pages/Admin.jsx`                            |
| Admin API wrappers             | `frontend/src/api/admin.js`                               |
| `/auth/me` (role refresh)      | `backend/controllers/auth_controller.go` (`Me`)           |