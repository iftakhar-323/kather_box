# KatherBox — Testing Guide

How to run, write, and extend tests. **Currently the project has no automated
tests** — this document is the plan to add them, plus a manual smoke-test
checklist you can run today.

---

## Manual smoke test (no test framework needed)

Open the frontend in two browser windows and the backend in a terminal.

### 1. Backend health
```bash
curl -s http://localhost:8081/api/products/?page=1\&limit=2 | head -c 200
```
Expected: 200 OK, JSON with `items`, `page`, `limit`, `total`.

### 2. Auth flow
| Step | Expected |
|---|---|
| Visit `/register`, create `test@x.com` / `pw1234` | Redirected to home, logged in |
| Refresh the page | Still logged in (token persists) |
| Click **Logout** | Returns to home, token removed |
| Log in again | Welcome back |
| POST `/api/auth/forgot-password` with your email | `{message: "..."}` |

### 3. Cart flow
| Step | Expected |
|---|---|
| Add a product to cart (must be logged in) | Toast "Added ✓" |
| Visit `/cart` | Product shows with qty input |
| Change qty to 3 | Total recalculates |
| Click remove | Item disappears |

### 4. Admin flow
| Step | Expected |
|---|---|
| Promote yourself via `sqlite3 ... UPDATE users SET role='admin' WHERE email=...` | – |
| Log out, log in | New JWT carries `role: admin` |
| See red **Admin** button in navbar | – |
| Open Admin → Products → + New | Modal opens, create product |
| Open Admin → Orders | See all orders |

### 5. CORS sanity
```bash
# Should return 200
curl -H "Origin: http://localhost:5173" http://localhost:8081/api/products/

# Should return 200 (after the 127.0.0.1 fix)
curl -H "Origin: http://127.0.0.1:5173" http://localhost:8081/api/products/

# Should return 403
curl -H "Origin: http://evil.com" http://localhost:8081/api/products/
```

---

## Backend testing (Go) — recommended

### Frameworks
- **stdlib** `net/http/httptest` for handler tests
- **`github.com/stretchr/testify/assert`** for clean assertions
- **`github.com/golang-migrate/migrate`** not needed; GORM auto-migrates

### Sample test layout
```
backend/
├── controllers/
│   ├── product_controller.go
│   └── product_controller_test.go   ← new
```

### Example: product list test
```go
package controllers

import (
    "net/http/httptest"
    "testing"
    "github.com/gin-gonic/gin"
    "github.com/stretchr/testify/assert"
)

func TestGetProductsReturns200(t *testing.T) {
    gin.SetMode(gin.TestMode)
    r := gin.New()
    r.GET("/api/products/", GetProducts)

    req := httptest.NewRequest("GET", "/api/products/?page=1&limit=5", nil)
    w := httptest.NewRecorder()
    r.ServeHTTP(w, req)

    assert.Equal(t, 200, w.Code)
    assert.Contains(t, w.Body.String(), `"items"`)
}
```

### Run
```bash
cd backend
go test ./...
```

---

## Frontend testing — recommended

### Frameworks
- **Vitest** + **@testing-library/react** (matches Vite toolchain)
- **MSW (Mock Service Worker)** for API mocks

### Setup
```bash
cd frontend
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

Add to `vite.config.js`:
```js
test: {
  environment: 'jsdom',
  globals: true,
  setupFiles: './src/test-setup.js',
}
```

### Sample test
```jsx
// src/components/ProductCard.test.jsx
import { render, screen } from '@testing-library/react';
import ProductCard from './ProductCard';

test('shows out-of-stock label when stock is 0', () => {
  render(<ProductCard product={{ ID: 1, name: 'X', price: 100, stock: 0, category: 'plant' }} />);
  expect(screen.getByText(/out of stock/i)).toBeInTheDocument();
});
```

### Run
```bash
npm run test
```

---

## End-to-end testing (Playwright) — optional but valuable

```bash
npm install -D @playwright/test
npx playwright install
```

`e2e/auth.spec.js`:
```js
import { test, expect } from '@playwright/test';

test('user can sign up and see home', async ({ page }) => {
  await page.goto('http://127.0.0.1:5173');
  await page.getByRole('button', { name: /register/i }).click();
  await page.fill('input[type=email]', 'new@x.com');
  await page.fill('input[type=password]', 'pw1234');
  await page.getByRole('button', { name: /sign up/i }).click();
  await expect(page.getByText(/Bring nature home/i)).toBeVisible();
});
```

---

## Coverage targets

| Area | Target |
|---|---|
| Controllers (auth, products, cart, orders) | 80% |
| Models / migrations | 60% |
| Frontend components | 60% |
| E2E happy paths (signup, buy, admin) | 100% |

---

## CI suggestion (GitHub Actions)

`.github/workflows/ci.yml`:
```yaml
name: ci
on: [push, pull_request]
jobs:
  backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-go@v5
        with: { go-version: '1.21' }
      - run: cd backend && go test ./...
  frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '18' }
      - run: cd frontend && npm ci && npm run build
```

---

## Test data & cleanup

Use a separate test DB:
```bash
TEST_DB=/tmp/test-katherbox.db go test ./...
```

Reset between tests:
```go
db.Exec("DELETE FROM cart_items")
db.Exec("DELETE FROM carts")
```

---

## Pre-release checklist

- [ ] All new controllers have at least one happy-path test
- [ ] CORS test passes
- [ ] Auth tests cover register / login / me / forgot / reset
- [ ] Admin role enforcement test (403 for non-admin)
- [ ] Frontend: ProductCard, CartItem, Login smoke tests
- [ ] E2E: sign up → buy → see order
- [ ] No console errors in browser dev tools
- [ ] Lighthouse score > 80 on Home page