# Mini ERP / CRM

Lightweight, full-stack ERP/CRM system built with **Node.js + Express + Prisma + PostgreSQL** on the backend and **React + Vite + TypeScript** on the frontend. Covers customer management, product catalog, stock inventory, and sales delivery challans with role-based access control.

### 🌐 Live Application Links

- 🚀 **Frontend App (Vercel)**: [https://mini-erp-crm-portal-zeta.vercel.app](https://mini-erp-crm-portal-zeta.vercel.app)
- ⚡ **Backend API (Render)**: [https://mini-erp-crm-backend-v4j5.onrender.com/api](https://mini-erp-crm-backend-v4j5.onrender.com/api)

---

## Features

- 🔐 **JWT Authentication** with role-based access control (Admin, Sales, Warehouse, Accounts)
- 👥 **Customer CRM** — Create, Edit, View, Follow-up notes, Status tracking
- 📦 **Product Catalog** — SKU, Categories, Pricing, Min-stock threshold, Warehouse location
- 📊 **Inventory** — Real-time Stock IN / OUT with full audit log
- 🧾 **Sales Challans** — Draft → Confirm (triggers stock deduction) → Cancel workflow
- 🛡 **Negative Stock Prevention** — Database-level enforcement
- 🔄 **Dashboard** with live metrics and Refresh button

---

## Project Roadmap

### PHASE 1 — BACKEND

| Step | Description | Status |
|------|-------------|--------|
| 1 | Database + Schema (Prisma + PostgreSQL) | ✅ Done |
| 2 | Express Setup (routes, middleware, error handling) | ✅ Done |
| 3 | Prisma Client configuration | ✅ Done |
| 4 | Authentication (JWT login, token validation) | ✅ Done |
| 5 | Role Middleware (Admin, Sales, Warehouse, Accounts) | ✅ Done |
| 6 | Customer APIs (CRUD + Follow-up notes) | ✅ Done |
| 7 | Product APIs (CRUD + SKU, stock, threshold) | ✅ Done |
| 8 | Stock APIs (IN / OUT + audit log) | ✅ Done |
| 9 | Challan APIs (create, list, get by ID, confirm, cancel) | ✅ Done |
| 10 | Transaction / Stock Confirmation Logic (DB transaction, rollback) | ✅ Done |

---

### PHASE 2 — FRONTEND

| Step | Description | Status |
|------|-------------|--------|
| 11A | Admin Dashboard + Sidebar / Navigation | ✅ Done |
| 11B | Customer CRM (Search, Add, Edit, View, Follow-up) | ✅ Done |
| 11C | Product Management (SKU, Category, Price, Stock, Location) | ✅ Done |
| 11D | Inventory UI (Stock Overview, Table, Movement History) | ✅ Done |
| 11E | Sales Challan UI (List, Create, Confirm, Cancel, Details) | ✅ Done |
| 11F | Real Dashboard Data (Live metrics, Refresh button) | ✅ Done |

---

### PHASE 3 — TESTING

| Step | Description | Status |
|------|-------------|--------|
| 12A | Authentication Testing | ✅ 7/7 Pass |
| 12B | Role/Permission Testing | ✅ 2/2 Pass |
| 12C | Customer CRUD Testing | ✅ 6/6 Pass |
| 12D | Product CRUD Testing | ✅ 2/2 Pass |
| 12E | Inventory Testing | ✅ 7/7 Pass |
| 12F | Challan Workflow Testing | ✅ 4/4 Pass |
| 12G | Transaction/Rollback Testing | ✅ 2/2 Pass |
| 12H | Validation Testing | ✅ 2/2 Pass |
| 12I | Responsive UI Testing | ✅ Done |
| 12J | Final Bug Fixing (Warehouse challan confirm role fixed) | ✅ Done |
| 12K | README + Documentation | ✅ Done |

> **Total: 30/30 automated tests passing** — run with `npx tsx src/tests/system_test.ts`

---

### PHASE 4 — DEPLOYMENT

| Step | Description | Status |
|------|-------------|--------|
| 13 | Deployment + Final Check (Railway / Render / VPS) | ✅ Ready |

> See [DEPLOYMENT.md](./DEPLOYMENT.md) for full deployment instructions.

---

## Prerequisites

- Node.js 18+
- npm or pnpm
- PostgreSQL database

---

## Backend Setup

1. Install dependencies

```bash
cd backend
npm install
```

2. Configure environment — create `backend/.env`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/mini_erp"
JWT_SECRET="your-secret-key"
PORT=5000
```

3. Run migrations & seed database

```bash
cd backend
npx prisma migrate deploy
npx prisma db seed
```

4. Start dev server

```bash
npm run dev
# Backend runs on http://localhost:5000
```

---

## Frontend Setup

1. Install dependencies

```bash
cd frontend
npm install
```

2. Start dev server

```bash
npm run dev
# Frontend runs on http://localhost:5173
```

---

## Test Credentials

Use these pre-seeded accounts (created by `prisma/seed.ts`):

| Role             | Email / Username    | Password       |
| ---------------- | ------------------- | -------------- |
| 👑 **Admin**     | `admin@erp.com`     | `Password@123` |
| 💼 **Sales**     | `sales@erp.com`     | `Password@123` |
| 📦 **Warehouse** | `warehouse@erp.com` | `Password@123` |
| 💰 **Accounts**  | `accounts@erp.com`  | `Password@123` |

---

## API Endpoints

| Method | Route | Description | Roles |
| ------ | ----- | ----------- | ----- |
| POST | `/api/auth/login` | Login, get JWT | All |
| GET | `/api/customers` | List customers | Admin, Sales, Accounts |
| POST | `/api/customers` | Create customer | Admin, Sales |
| PUT | `/api/customers/:id` | Update customer | Admin, Sales |
| DELETE | `/api/customers/:id` | Delete customer | Admin |
| GET | `/api/products` | List products | All |
| POST | `/api/products` | Create product | Admin |
| PUT | `/api/products/:id` | Update product | Admin |
| DELETE | `/api/products/:id` | Delete product | Admin |
| POST | `/api/stock/in` | Add stock | Admin, Warehouse |
| POST | `/api/stock/out` | Deduct stock | Admin, Warehouse |
| GET | `/api/stock/movements` | Stock audit log | Admin, Warehouse |
| GET | `/api/challans` | List challans | Admin, Sales, Accounts, Warehouse |
| POST | `/api/challans` | Create challan (DRAFT) | Admin, Sales |
| POST | `/api/challans/:id/confirm` | Confirm challan → stock OUT | Admin, Sales, Warehouse |
| POST | `/api/challans/:id/cancel` | Cancel draft challan | Admin, Sales |

---

## Project Structure

```
mini-erp-crm/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma    # DB models: User, Customer, Product, StockMovement, Challan
│   │   └── seed.ts          # Seeds test users and sample data
│   └── src/
│       ├── controllers/     # Route handlers
│       ├── services/        # Business logic (stock, challan transactions)
│       ├── routes/          # Express routes + role middleware
│       ├── middleware/       # JWT auth, role guard
│       ├── validators/      # Zod schemas for request validation
│       └── tests/
│           └── system_test.ts  # Automated end-to-end test suite
└── frontend/
    └── src/
        ├── pages/           # Dashboard, Customers, Products, Inventory, Challans
        ├── components/      # Layout, Sidebar, ProtectedRoute
        ├── context/         # Auth context (JWT + user state)
        ├── services/        # API client (axios wrappers)
        └── types/           # TypeScript interfaces
```

---

## Automated Test Suite

Run the full backend test suite (requires backend `npm run dev` running):

```bash
cd backend
npx tsx src/tests/system_test.ts
```

### Test Coverage (30 tests, all ✅)

| # | Test Group | Tests |
|---|------------|-------|
| 12A | **Authentication** | Invalid password → 401, All 4 roles login, No-token → 401 |
| 12B | **Role/Permission** | Sales blocked from Stock IN (403), Warehouse blocked from Customer create (403) |
| 12C | **Customer CRUD** | Create, Fetch by ID, Update, field validation |
| 12D | **Product CRUD** | Create, Duplicate SKU blocked (400) |
| 12E | **Inventory** | Stock IN (+50 units), Stock OUT (-30 units), Excess OUT rejected (409), Audit log |
| 12F | **Challan Workflow** | DRAFT created, Confirm → CONFIRMED, Cancel → CANCELLED |
| 12G | **Transaction Safety** | Stock deducted on confirm, Double-confirm blocked (400) |
| 12H | **Validation** | Invalid email → 400, Negative quantity → 400, cleanup |

### Sample test output:
```
🚀 STARTING FULL ERP/CRM SYSTEM SUITE TEST
==========================================
✅ PASS: Invalid password returns 401 Unauthorized
✅ PASS: Admin login successful (200 OK)
✅ PASS: Admin JWT token generated
✅ PASS: Sales user stock IN rejected with 403 Forbidden
✅ PASS: Customer created successfully (201 Created)
✅ PASS: Stock IN logged successfully (200 OK)
✅ PASS: Current stock updated from 100 to 150
✅ PASS: Challan confirmed successfully (200 OK)
✅ PASS: Product stock deducted from 120 to 100 upon confirmation
✅ PASS: Double confirmation prevented with 400 Bad Request
... (30 total tests)
🎉 ALL AUTOMATED SYSTEM TESTS PASSED CLEANLY!
```

---

## Responsive UI (12I)

The frontend is fully responsive:
- **Sidebar** collapses on narrow viewports
- **Tables** scroll horizontally on mobile
- **Modals** scale with viewport
- Tested on 375px (mobile) and 1536px (desktop) widths

---

## Helpful Commands

```bash
# Backend dev
cd backend && npm run dev

# Frontend dev
cd frontend && npm run dev

# Run automated API tests (backend must be running)
cd backend && npx tsx src/tests/system_test.ts

# Prisma Studio (DB explorer)
cd backend && npx prisma studio

# TypeScript check - no errors
cd backend && npx tsc --noEmit
cd frontend && npx tsc --noEmit
```

---

## Contributing

Feel free to open issues or PRs. Describe setup steps if you change migration or env requirements.

---
Mini ERP/CRM — Built with ❤️ using Node.js, Express, Prisma, React, Vite, TypeScript.
