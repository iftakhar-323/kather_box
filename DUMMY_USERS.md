# KatherBox — Dummy Test Accounts

This is the **test user list** created for the KatherBox MVP. Use these to
log in at `http://localhost:5174/` and try out both the customer and admin
flows. Backend runs on `http://localhost:8081`.

> **All passwords are `test123`** unless stated otherwise.
> The accounts were created via `POST /api/auth/register`, so the bcrypt
> hashes are real — these accounts actually work.

---

## 5 Dummy Customers

| # | Name           | Email              | Password | Notes                  |
|---|----------------|--------------------|----------|------------------------|
| 1 | Rahim Ahmed    | `rahim@test.com`   | `test123`| First dummy customer   |
| 2 | Fatima Khan    | `fatima@test.com`  | `test123`|                        |
| 3 | Karim Hossain  | `karim@test.com`   | `test123`| **Promoted to admin**  |
| 4 | Nasreen Akter  | `nasreen@test.com` | `test123`|                        |
| 5 | Saiful Islam   | `saiful@test.com`  | `test123`|                        |

---

## 1 Admin Account

| Name           | Email              | Password | Role   |
|----------------|--------------------|----------|--------|
| Karim Hossain  | `karim@test.com`   | `test123`| `admin`|

Karim was one of the 5 dummy customers above; he was promoted after
registration via:

```bash
sqlite3 backend/katherbox.db \
  "UPDATE users SET role='admin' WHERE email='karim@test.com';"
```

---

## Full users table (after this batch)

```
id | name              | email                 | role
---+-------------------+-----------------------+---------
 1 | Ritu              | ritu@test.com         | admin
 2 | Customer Test     | customer@test.com     | admin
 3 | iftakhar alam     | iftakhar@gmail.com    | customer
 4 | Test Customer     | cust1@test.com        | customer
 5 | Tester            | stocktest@test.com    | customer
 6 | Ad                | admintest@test.com    | admin
 7 | Rahim Ahmed       | rahim@test.com        | customer   ← new
 8 | Fatima Khan       | fatima@test.com       | customer   ← new
 9 | Karim Hossain     | karim@test.com        | admin      ← new
10 | Nasreen Akter     | nasreen@test.com      | customer   ← new
11 | Saiful Islam      | saiful@test.com       | customer   ← new
```

The rows marked **← new** are the 5 dummy customers + 1 dummy admin
created in this batch.

---

## How to log in

1. Make sure both servers are running (see [`README.md`](README.md)):
   - Backend on `http://localhost:8081`
   - Frontend on `http://localhost:5173` (or `5174` if 5173 is busy)
2. Open the frontend URL.
3. Click **Login** in the navbar.
4. Enter one of the emails above + password `test123`.
5. Click **Logout**, then **Login** again any time you change someone's role
   in the DB (the JWT issued before the role change still says the old role).

---

## How to test the admin flow with Karim

1. Log in as `karim@test.com` / `test123`.
2. You should see:
   - A red **Admin** button in the navbar.
   - An `ADMIN` badge next to the name in the navbar.
3. Click **Admin** to open the admin panel — there you'll find:
   - **Products** tab — create, edit, delete products.
   - **Orders** tab — see every order from every customer, change status,
     delete orders.

See [`ADMIN_GUIDE.md`](ADMIN_GUIDE.md) for the full admin walkthrough.

---

## How to test the customer flow

1. Log in as any of the 5 customers above (e.g. `rahim@test.com`).
2. Click **Add to Cart** on any product on the home page.
3. Click **Cart** → adjust quantity → **Checkout**.
4. Click **Orders** to see your placed order with its status badge.

Try the same flow with two different customers to confirm orders are
isolated per user.

---

## Re-creating these accounts

If you wipe `backend/katherbox.db`, run this from the project root to
re-create the same accounts:

```bash
cd /home/iftakhar/ritu/katherbox

# 1. register the 5 customers
for U in \
  "Rahim Ahmed:rahim@test.com" \
  "Fatima Khan:fatima@test.com" \
  "Karim Hossain:karim@test.com" \
  "Nasreen Akter:nasreen@test.com" \
  "Saiful Islam:saiful@test.com" ; do
  NAME="${U%%:*}"; EMAIL="${U##*:}"
  curl -s -X POST http://localhost:8081/api/auth/register \
    -H 'Content-Type: application/json' \
    -d "{\"name\":\"$NAME\",\"email\":\"$EMAIL\",\"password\":\"test123\"}" \
    -o /dev/null -w "$EMAIL -> %{http_code}\n"
done

# 2. promote Karim to admin
sqlite3 backend/katherbox.db \
  "UPDATE users SET role='admin' WHERE email='karim@test.com';"
```

The backend must be running (port 8081) before the `curl` calls above.