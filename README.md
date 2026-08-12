# Mini ERP + CRM Operations Portal

Lightweight, full-stack ERP/CRM system built with **Node.js + Express + Prisma + PostgreSQL** on the backend and **React + Vite + TypeScript** on the frontend. Covers customer management, product catalog, real-time stock inventory, and sales delivery challans â€” all with role-based access control.

---

## Live Demo

| Service | URL |
|---------|-----|
| ðŸš€ Frontend (Vercel) | [https://mini-erp-crm-portal-zeta.vercel.app](https://mini-erp-crm-portal-zeta.vercel.app) |
| âš¡ Backend API (Render) | [https://mini-erp-crm-backend-v4j5.onrender.com/api](https://mini-erp-crm-backend-v4j5.onrender.com/api) |

---

## Test Credentials

Use these pre-seeded accounts (created by `prisma/seed.ts`):

| Role | Email | Password |
|------|-------|----------|
| ðŸ‘‘ Admin | `admin@erp.com` | `Password@123` |
| ðŸ’¼ Sales | `sales@erp.com` | `Password@123` |
| ðŸ“¦ Warehouse | `warehouse@erp.com` | `Password@123` |
| ðŸ’° Accounts | `accounts@erp.com` | `Password@123` |

---

## Project Overview

Mini ERP + CRM is a business operations portal designed for small-to-medium businesses. It combines a CRM (customer relationship management) module with an ERP (enterprise resource planning) inventory and challan system. The platform supports four distinct user roles, each with carefully scoped access to the right data and actions.

The system enforces **negative stock prevention at the service layer**, uses **Prisma transactions** for atomic challan confirmation, and includes a **30-test automated backend test suite** covering all major workflows end-to-end.

---

## Features

- ðŸ” **JWT Authentication** â€” Secure login with token-based session management
- ðŸ‘¥ **Customer CRM** â€” Create, Edit, View, Follow-up notes, status tracking (LEAD â†’ ACTIVE â†’ INACTIVE)
- ðŸ“¦ **Product Catalog** â€” SKU, Categories, Pricing, Min-stock threshold, Warehouse bin location
- ðŸ“Š **Inventory** â€” Real-time Stock IN / OUT with full audit log and movement history
- ðŸ§¾ **Sales Challans** â€” Full DRAFT â†’ CONFIRM (triggers stock deduction) â†’ CANCEL workflow
- ðŸ›¡ **Negative Stock Prevention** â€” Enforced at service layer; excess OUT rejected with `409 Conflict`
- ðŸ”„ **Live Dashboard** â€” Real-time metrics (customers, products, low stock alerts) with Refresh
- ðŸ§ª **Automated Test Suite** â€” 30/30 backend integration tests covering all API flows
- ðŸ“± **Responsive UI** â€” Mobile-first design, collapsible sidebar, horizontal table scroll on small screens

---

## Tech Stack

### Backend
| Technology | Purpose |
|-----------|---------|
| Node.js + Express 5 | HTTP server and REST API |
| TypeScript | Type safety across the entire backend |
| Prisma ORM | Database modelling, migrations, query builder |
| PostgreSQL | Relational database |
| JWT (jsonwebtoken) | Stateless authentication |
| bcrypt | Password hashing |
| Zod | Request body validation schemas |
| tsx | TypeScript dev runner (hot reload) |

### Frontend
| Technology | Purpose |
|-----------|---------|
| React 19 + Vite 8 | SPA framework and dev build tool |
| TypeScript | Type-safe components and API calls |
| React Router v7 | Client-side routing and protected routes |
| Axios | HTTP client with JWT Bearer interceptor |
| Vitest + Testing Library | Unit / component testing |
| Vanilla CSS | Custom design system, dark glassmorphism UI |

---

## Architecture

```
React + TypeScript (Vite)
        â”‚
        â”‚  REST API  (Axios + JWT Bearer token)
        â–¼
Node.js + Express + TypeScript
        â”‚
        â”œâ”€â”€ requireAuth     (JWT validation middleware)
        â”œâ”€â”€ requireRole     (role-based guard middleware)
        â”œâ”€â”€ Zod Validators  (request body validation)
        â””â”€â”€ Controllers â†’ Services (business logic)
                â”‚
                â–¼
            Prisma ORM
                â”‚
                â–¼
          PostgreSQL Database
```

### Request Flow
1. React page calls API via `services/api.ts` (Axios instance with JWT header)
2. `requireAuth` middleware validates the Bearer token
3. `requireRole` middleware checks the user's role against allowed roles
4. Zod validator rejects malformed request bodies early (`400`)
5. Controller delegates to service layer; service executes Prisma queries / transactions
6. Response returned as `{ success, data }` or `{ success, error }` JSON envelope

---

## Database Design

### Entity Relationship Overview

```
User â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€ StockMovement
              â”œâ”€â”€â”€â”€ CustomerFollowup
              â””â”€â”€â”€â”€ Challan

Customer â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€ CustomerFollowup
              â””â”€â”€â”€â”€ Challan

Product â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€ StockMovement
              â””â”€â”€â”€â”€ ChallanItem

Challan â”€â”€â”€â”€â”€â”€â””â”€â”€â”€â”€ ChallanItem
```

### Models

#### `User`
| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | Primary key |
| `name` | String | Display name |
| `email` | String (unique) | Login identifier |
| `passwordHash` | String | bcrypt hash |
| `role` | Enum | `ADMIN \| SALES \| WAREHOUSE \| ACCOUNTS` |

#### `Customer`
| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | Primary key |
| `name` | String | Contact name |
| `mobile` | String | Phone number |
| `email` | String? | Optional |
| `businessName` | String? | Company name |
| `gstNumber` | String? | GST registration |
| `customerType` | Enum | `RETAIL \| WHOLESALE \| DISTRIBUTOR` |
| `status` | Enum | `LEAD \| ACTIVE \| INACTIVE` |
| `followUpDate` | DateTime? | Next follow-up reminder |
| `notes` | String? | Free-text notes |

#### `Product`
| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | Primary key |
| `name` | String | Product name |
| `sku` | String (unique) | Stock Keeping Unit |
| `category` | String | Product category |
| `unitPrice` | Decimal(12,2) | Selling price |
| `currentStock` | Int | Live stock level |
| `minimumStock` | Int | Low-stock threshold |
| `warehouseLocation` | String? | Bin / shelf location |

#### `StockMovement`
| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | Primary key |
| `productId` | FK â†’ Product | |
| `quantity` | Int | Units moved |
| `movementType` | Enum | `IN \| OUT` |
| `reason` | String | Free-text audit note |
| `createdBy` | FK â†’ User | Who recorded it |

#### `Challan`
| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | Primary key |
| `challanNumber` | String (unique) | Auto-generated reference |
| `customerId` | FK â†’ Customer | |
| `totalQuantity` | Int | Sum of all items |
| `status` | Enum | `DRAFT \| CONFIRMED \| CANCELLED` |
| `createdBy` | FK â†’ User | |

#### `ChallanItem` *(product snapshot)*
| Field | Type | Notes |
|-------|------|-------|
| `challanId` | FK â†’ Challan | |
| `productId` | FK â†’ Product | |
| `productName` | String | Snapshot at time of creation |
| `productSku` | String | Snapshot |
| `unitPrice` | Decimal(12,2) | Snapshot |
| `quantity` | Int | Units ordered |

> **Note:** ChallanItem stores a product snapshot so historical challans remain accurate even if the product record is later updated.

---

## Role-Based Access

| Action | Admin | Sales | Warehouse | Accounts |
|--------|:-----:|:-----:|:---------:|:--------:|
| Login | âœ… | âœ… | âœ… | âœ… |
| View Dashboard | âœ… | âœ… | âœ… | âœ… |
| View Customers | âœ… | âœ… | âŒ | âœ… |
| Create / Edit Customer | âœ… | âœ… | âŒ | âŒ |
| Delete Customer | âœ… | âŒ | âŒ | âŒ |
| Add Follow-up Note | âœ… | âœ… | âŒ | âŒ |
| View Products | âœ… | âœ… | âœ… | âœ… |
| Create / Edit Product | âœ… | âŒ | âœ… | âŒ |
| Delete Product | âœ… | âŒ | âŒ | âŒ |
| Stock IN | âœ… | âŒ | âœ… | âŒ |
| Stock OUT | âœ… | âŒ | âœ… | âŒ |
| View Stock Movements | âœ… | âŒ | âœ… | âœ… |
| View Challans | âœ… | âœ… | âœ… | âœ… |
| Create Challan (DRAFT) | âœ… | âœ… | âŒ | âŒ |
| Confirm Challan â†’ stock OUT | âœ… | âœ… | âœ… | âŒ |
| Cancel Challan | âœ… | âœ… | âŒ | âŒ |

---

## API Documentation

All responses follow the envelope pattern:
```json
{ "success": true,  "data": { ... } }
{ "success": false, "error": "message" }
```

All routes (except `/api/auth/login`) require:
```
Authorization: Bearer <JWT_TOKEN>
```

### Authentication

| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| `POST` | `/api/auth/login` | Login â€” returns JWT + user info | Public |

**Request body:**
```json
{ "email": "admin@erp.com", "password": "Password@123" }
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI...",
    "user": { "id": "...", "name": "Admin User", "email": "admin@erp.com", "role": "ADMIN" }
  }
}
```

---

### Customers

| Method | Route | Description | Roles |
|--------|-------|-------------|-------|
| `GET` | `/api/customers` | List / search customers | Admin, Sales, Accounts |
| `GET` | `/api/customers/:id` | Get customer detail + followups | Admin, Sales, Accounts |
| `POST` | `/api/customers` | Create customer | Admin, Sales |
| `PUT` | `/api/customers/:id` | Update customer | Admin, Sales |
| `DELETE` | `/api/customers/:id` | Delete customer | Admin |
| `POST` | `/api/customers/:id/followups` | Add follow-up note | Admin, Sales |

**Query params (GET /customers):** `?search=<name>&status=ACTIVE&type=RETAIL`

---

### Products

| Method | Route | Description | Roles |
|--------|-------|-------------|-------|
| `GET` | `/api/products` | List products | All |
| `GET` | `/api/products/:id` | Product detail | All |
| `POST` | `/api/products` | Create product | Admin, Warehouse |
| `PUT` | `/api/products/:id` | Update product | Admin, Warehouse |
| `DELETE` | `/api/products/:id` | Delete product | Admin |

---

### Stock / Inventory

| Method | Route | Description | Roles |
|--------|-------|-------------|-------|
| `POST` | `/api/stock/in` | Add stock (Stock IN) | Admin, Warehouse |
| `POST` | `/api/stock/out` | Deduct stock (Stock OUT) | Admin, Warehouse |
| `GET` | `/api/stock/movements` | Full audit log | Admin, Warehouse, Accounts |

**Stock IN/OUT request body:**
```json
{ "productId": "uuid", "quantity": 50, "reason": "Purchase order #123" }
```

---

### Sales Challans

| Method | Route | Description | Roles |
|--------|-------|-------------|-------|
| `GET` | `/api/challans` | List all challans | Admin, Sales, Warehouse, Accounts |
| `GET` | `/api/challans/:id` | Challan detail + items | Admin, Sales, Warehouse, Accounts |
| `POST` | `/api/challans` | Create DRAFT challan | Admin, Sales |
| `POST` | `/api/challans/:id/confirm` | Confirm â†’ deducts stock (atomic) | Admin, Sales, Warehouse |
| `POST` | `/api/challans/:id/cancel` | Cancel DRAFT challan | Admin, Sales |

**Create challan request body:**
```json
{
  "customerId": "uuid",
  "items": [
    { "productId": "uuid", "quantity": 10 }
  ]
}
```

---

## Local Setup

### Prerequisites
- Node.js 18+
- npm or pnpm
- PostgreSQL 14+ (local or cloud)

### 1. Clone the repo
```bash
git clone https://github.com/Meenbudha/mini-erp-crm-portal.git
cd mini-erp-crm
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create `backend/.env`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/mini_erp"
JWT_SECRET="your-super-secret-key-minimum-32-chars"
PORT=5000
NODE_ENV=development
```

Run migrations and seed the database:
```bash
npx prisma migrate deploy
npx prisma db seed
```

Start the dev server:
```bash
npm run dev
# Backend runs on http://localhost:5000
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```

Create `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

Start the dev server:
```bash
npm run dev
# Frontend runs on http://localhost:5173
```

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Description |
|----------|:--------:|-------------|
| `DATABASE_URL` | âœ… | PostgreSQL connection string |
| `JWT_SECRET` | âœ… | Token signing secret (min 32 chars) |
| `PORT` | âœ… | Server port (default: `5000`) |
| `NODE_ENV` | Optional | `development` or `production` |

### Frontend (`frontend/.env`)

| Variable | Required | Description |
|----------|:--------:|-------------|
| `VITE_API_URL` | âœ… | Full URL to backend API root (e.g. `http://localhost:5000/api`) |

---

## Deployment

Supports three deployment targets. See **[DEPLOYMENT.md](./DEPLOYMENT.md)** for full step-by-step instructions.

| Option | Platform | Notes |
|--------|----------|-------|
| A | Railway.app | Recommended â€” managed PostgreSQL, single platform |
| B | Render.com (backend) + Vercel (frontend) | Current live setup |
| C | VPS / Ubuntu with PM2 + Nginx | Self-hosted, production-grade |

**Pre-deployment checklist:**
```
[ ] Strong JWT_SECRET set (not the dev default)
[ ] DATABASE_URL points to production database
[ ] NODE_ENV=production set on backend
[ ] VITE_API_URL set to production backend URL
[ ] npx prisma migrate deploy run on prod DB
[ ] npx prisma db seed run (creates admin users)
[ ] Both tsc --noEmit checks pass with 0 errors
[ ] CORS configured to allow frontend domain
[ ] HTTPS enabled
```

---

## Postman Collection

You can test the API manually using Postman or any HTTP client.

**Base URL:** `http://localhost:5000/api`

**Quick setup:**
1. `POST /api/auth/login` â†’ copy the `token` from the response
2. Add `Authorization: Bearer <token>` header on all subsequent requests
3. Use the [API Documentation](#api-documentation) tables above for routes and request bodies

**Example: Login and get token**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@erp.com","password":"Password@123"}'
```

**Example: Create a customer**
```bash
curl -X POST http://localhost:5000/api/customers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{
    "name": "Ravi Sharma",
    "mobile": "9876543210",
    "email": "ravi@example.com",
    "customerType": "RETAIL",
    "status": "LEAD"
  }'
```

**Example: Stock IN**
```bash
curl -X POST http://localhost:5000/api/stock/in \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"productId":"<uuid>","quantity":50,"reason":"Purchase order #101"}'
```

---

## Business Logic

### Challan Confirmation (Atomic Transaction)
When a challan is confirmed, the backend executes a **Prisma transaction** that:
1. Verifies the challan is in `DRAFT` status â€” rejects with `400` if already confirmed/cancelled
2. For each item in the challan, checks that `currentStock >= quantity`
3. If any product has insufficient stock â†’ the entire transaction is rolled back (`409 Conflict`)
4. If all checks pass â†’ deducts stock from all products and creates `StockMovement` records (type `OUT`) atomically
5. Updates challan status to `CONFIRMED`

### Negative Stock Prevention
Stock `OUT` operations (both manual and via challan confirmation) enforce:
```
currentStock - quantity >= 0
```
This is validated in the service layer before any Prisma update. A `409 Conflict` is returned with `"Insufficient stock"` if violated.

### Role Guard
`requireRole(...roles)` middleware compares `req.user.role` (decoded from JWT) against the allowed roles array. Any mismatch returns `403 Forbidden` before the controller is reached.

### ChallanItem Snapshot
When a challan is created, `productName`, `productSku`, and `unitPrice` are copied from the product at that moment into the `ChallanItem` record. This ensures challan history remains accurate even if the product record is later updated or the price changes.

---

## Assumptions

- One user account per role is sufficient for demo purposes; the system supports unlimited users per role.
- `challanNumber` is generated as a unique string at creation time; no configurable prefix or sequential numbering is needed.
- GST number and business name are optional fields; no GST computation or tax calculation is implemented.
- All monetary values are stored as `Decimal(12, 2)` â€” sufficient for most currencies and quantity ranges.
- Frontend environment assumes a single `VITE_API_URL`; multi-tenant or multi-region setups are out of scope.
- Password policy (`Password@123` minimum complexity) is enforced only at seed level; no self-registration UI is provided.

---

## Known Limitations

- PDF invoice export is not implemented.
- Product image upload is not implemented.
- Docker / `docker-compose` configuration is not included.
- GitHub Actions CI/CD pipeline is not configured.
- Advanced reporting, charts, and analytics are outside the current scope.
- No email notifications for follow-up reminders or low-stock alerts.
- No pagination on stock movement audit log (returns all records).

---

## Project Structure

```
mini-erp-crm/
â”œâ”€â”€ backend/
â”‚   â”œâ”€â”€ prisma/
â”‚   â”‚   â”œâ”€â”€ schema.prisma       # DB models: User, Customer, Product, StockMovement, Challan, ChallanItem
â”‚   â”‚   â””â”€â”€ seed.ts             # Seeds 4 test users (Admin, Sales, Warehouse, Accounts)
â”‚   â””â”€â”€ src/
â”‚       â”œâ”€â”€ app.ts              # Express app, CORS, route mounting
â”‚       â”œâ”€â”€ server.ts           # HTTP server entry point
â”‚       â”œâ”€â”€ config/             # Prisma client singleton
â”‚       â”œâ”€â”€ controllers/        # Route handlers (auth, customer, product, stock, challan)
â”‚       â”œâ”€â”€ services/           # Business logic (stock deduction, challan transactions)
â”‚       â”œâ”€â”€ routes/             # Express routers + role middleware binding
â”‚       â”œâ”€â”€ middleware/         # requireAuth (JWT), requireRole (RBAC)
â”‚       â”œâ”€â”€ validators/         # Zod schemas for request body validation
â”‚       â”œâ”€â”€ types/              # TypeScript interfaces and Express augmentations
â”‚       â””â”€â”€ tests/
â”‚           â””â”€â”€ system_test.ts  # 30-test automated end-to-end suite
â””â”€â”€ frontend/
    â””â”€â”€ src/
        â”œâ”€â”€ App.tsx             # Router setup, ProtectedRoute
        â”œâ”€â”€ pages/              # Dashboard, Login, Customers, Products, Inventory, Challans, Settings
        â”œâ”€â”€ components/         # Sidebar, Layout, ProtectedRoute, Loading
        â”œâ”€â”€ context/            # AuthContext (JWT decode, user state, login/logout)
        â”œâ”€â”€ services/           # Axios API client with JWT interceptor
        â”œâ”€â”€ types/              # TypeScript interfaces (Customer, Product, Challan, etc.)
        â””â”€â”€ tests/              # Vitest + Testing Library component tests
```

---

## Automated Test Suite

Run the full backend integration test suite (requires backend `npm run dev` running on port 5000):

```bash
cd backend
npx tsx src/tests/system_test.ts
```

> **Total: 30/30 automated tests passing**

| # | Test Group | Tests |
|---|------------|-------|
| 12A | **Authentication (7)** | Invalid password â†’ 401, All 4 roles login, No-token â†’ 401 |
| 12B | **Role/Permission (2)** | Sales blocked from Stock IN (403), Warehouse blocked from Customer create (403) |
| 12C | **Customer CRUD (6)** | Create, Fetch by ID, Update, field validation |
| 12D | **Product CRUD (2)** | Create, Duplicate SKU blocked (400) |
| 12E | **Inventory (7)** | Stock IN (+50 units), Stock OUT (-30 units), Excess OUT rejected (409), Audit log |
| 12F | **Challan Workflow (4)** | DRAFT created, Confirm â†’ CONFIRMED, Cancel â†’ CANCELLED |
| 12G | **Transaction Safety (2)** | Stock deducted on confirm, Double-confirm blocked (400) |
| 12H | **Validation (2)** | Invalid email â†’ 400, Negative quantity â†’ 400 |

---

## Helpful Commands

```bash
# Backend dev server
cd backend && npm run dev

# Frontend dev server
cd frontend && npm run dev

# Run automated API integration tests (backend must be running)
cd backend && npx tsx src/tests/system_test.ts

# Run frontend unit / component tests
cd frontend && npm test

# TypeScript type checks (0 errors expected)
cd backend && npx tsc --noEmit
cd frontend && npx tsc --noEmit

# Prisma Studio â€” GUI database explorer
cd backend && npx prisma studio

# Generate Prisma client after schema changes
cd backend && npx prisma generate

# Apply migrations to production DB
cd backend && npx prisma migrate deploy
```

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit with a descriptive message
4. Open a PR â€” describe any migration or `.env` changes

---

Mini ERP/CRM â€” Built with â¤ï¸ using Node.js, Express, Prisma, React, Vite, TypeScript.
