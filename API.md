# API Documentation - Mini ERP + CRM

Base URL (local): `http://localhost:5000/api`
Base URL (production): `https://mini-erp-crm-backend-v4j5.onrender.com/api`

---

## Contents

- [Response Envelope](#response-envelope)
- [Authentication Header](#authentication-header)
- [Error Codes Reference](#error-codes-reference)
- [Auth](#1-auth)
- [Customers](#2-customers)
- [Products](#3-products)
- [Stock / Inventory](#4-stock--inventory)
- [Sales Challans](#5-sales-challans)

---

## Response Envelope

Every response — success or failure — follows this shape:

```json
{
  "success": true | false,
  "message": "Human-readable message",
  "data": { ... }
}
```

On validation errors, an additional `errors` field is included:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "fieldErrors": { "email": ["Invalid email"] },
    "formErrors": []
  }
}
```

---

## Authentication Header

All endpoints except `POST /auth/login` require a Bearer token:

```
Authorization: Bearer <JWT_TOKEN>
```

Tokens are obtained from the login response. They do not expire in the current implementation (no `expiresIn` set in JWT options).

---

## Error Codes Reference

| HTTP Status | Meaning |
|-------------|---------|
| `200` | OK - request succeeded |
| `201` | Created - resource created successfully |
| `400` | Bad Request - validation failed or invalid state |
| `401` | Unauthorized - missing or invalid JWT token |
| `403` | Forbidden - authenticated but insufficient role |
| `404` | Not Found - resource does not exist |
| `409` | Conflict - business rule violation (duplicate SKU, insufficient stock) |
| `500` | Internal Server Error - unexpected server-side failure |

---

## 1. Auth

### POST /auth/login

Login with email and password. Returns a JWT token and user details.

**Auth required:** No

**Request body:**

| Field | Type | Required | Validation |
|-------|------|:--------:|-----------|
| `email` | string | Yes | Must be a valid email address |
| `password` | string | Yes | Any non-empty string |

```json
{
  "email": "admin@erp.com",
  "password": "Password@123"
}
```

**Response 200 - Success:**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Admin User",
      "email": "admin@erp.com",
      "role": "ADMIN"
    }
  }
}
```

**Response 400 - Validation failed:**
```json
{ "success": false, "message": "Validation failed", "errors": { ... } }
```

**Response 401 - Wrong credentials:**
```json
{ "success": false, "message": "Invalid email or password" }
```

---

## 2. Customers

### GET /customers

List customers with optional search, filtering, and pagination.

**Auth required:** Yes
**Roles:** Admin, Sales, Accounts

**Query parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | `1` | Page number (min: 1) |
| `limit` | number | `10` | Records per page (min: 1, max: 100) |
| `search` | string | - | Searches across name, mobile, email, businessName |
| `status` | string | - | Filter by status: `LEAD`, `ACTIVE`, `INACTIVE` |
| `customerType` | string | - | Filter by type: `RETAIL`, `WHOLESALE`, `DISTRIBUTOR` |

**Example request:**
```
GET /customers?search=Ravi&status=ACTIVE&page=1&limit=20
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "customers": [
      {
        "id": "uuid",
        "name": "Ravi Sharma",
        "mobile": "9876543210",
        "email": "ravi@example.com",
        "businessName": "Ravi Enterprises",
        "gstNumber": "29AABCU9603R1ZX",
        "customerType": "RETAIL",
        "address": "123 MG Road, Bangalore",
        "status": "ACTIVE",
        "followUpDate": "2026-09-01T00:00:00.000Z",
        "notes": "Interested in bulk order",
        "createdAt": "2026-08-01T10:00:00.000Z",
        "updatedAt": "2026-08-10T12:00:00.000Z"
      }
    ],
    "total": 42,
    "page": 1,
    "limit": 20
  }
}
```

---

### GET /customers/:id

Get a single customer by UUID, including all follow-up notes.

**Auth required:** Yes
**Roles:** Admin, Sales, Accounts

**Path parameter:** `id` - Customer UUID

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Ravi Sharma",
    "mobile": "9876543210",
    "email": "ravi@example.com",
    "businessName": "Ravi Enterprises",
    "gstNumber": "29AABCU9603R1ZX",
    "customerType": "RETAIL",
    "address": "123 MG Road, Bangalore",
    "status": "ACTIVE",
    "followUpDate": "2026-09-01T00:00:00.000Z",
    "notes": "Interested in bulk order",
    "followups": [
      {
        "id": "uuid",
        "note": "Called and discussed pricing",
        "followUpDate": "2026-09-01T00:00:00.000Z",
        "createdAt": "2026-08-10T12:00:00.000Z",
        "createdBy": "uuid"
      }
    ],
    "createdAt": "2026-08-01T10:00:00.000Z",
    "updatedAt": "2026-08-10T12:00:00.000Z"
  }
}
```

**Response 404:**
```json
{ "success": false, "message": "Customer not found" }
```

---

### POST /customers

Create a new customer.

**Auth required:** Yes
**Roles:** Admin, Sales

**Request body:**

| Field | Type | Required | Validation |
|-------|------|:--------:|-----------|
| `name` | string | Yes | Min 2 characters |
| `mobile` | string | Yes | Min 7 characters |
| `email` | string | No | Valid email format |
| `businessName` | string | No | - |
| `gstNumber` | string | No | - |
| `customerType` | string | Yes | `RETAIL`, `WHOLESALE`, or `DISTRIBUTOR` |
| `address` | string | No | - |
| `status` | string | No | `LEAD` (default), `ACTIVE`, `INACTIVE` |
| `followUpDate` | string (ISO date) | No | - |
| `notes` | string | No | - |

```json
{
  "name": "Ravi Sharma",
  "mobile": "9876543210",
  "email": "ravi@example.com",
  "businessName": "Ravi Enterprises",
  "customerType": "RETAIL",
  "status": "LEAD"
}
```

**Response 201:**
```json
{
  "success": true,
  "message": "Customer created successfully",
  "data": { ... }
}
```

**Response 400 - Validation failed:**
```json
{ "success": false, "message": "Validation failed", "errors": { ... } }
```

---

### PUT /customers/:id

Update an existing customer. All fields are optional (partial update).

**Auth required:** Yes
**Roles:** Admin, Sales

**Path parameter:** `id` - Customer UUID

**Request body:** Any subset of the `POST /customers` fields.

```json
{
  "status": "ACTIVE",
  "followUpDate": "2026-09-01"
}
```

**Response 200:**
```json
{
  "success": true,
  "message": "Customer updated successfully",
  "data": { ... }
}
```

**Response 404:**
```json
{ "success": false, "message": "Customer not found" }
```

---

### DELETE /customers/:id

Permanently delete a customer. Cascades to follow-up notes.

**Auth required:** Yes
**Roles:** Admin only

**Path parameter:** `id` - Customer UUID

**Response 200:**
```json
{ "success": true, "message": "Customer deleted successfully" }
```

**Response 404:**
```json
{ "success": false, "message": "Customer not found" }
```

---

### POST /customers/:id/followups

Add a follow-up note to a customer.

**Auth required:** Yes
**Roles:** Admin, Sales

**Path parameter:** `id` - Customer UUID

**Request body:**

| Field | Type | Required | Validation |
|-------|------|:--------:|-----------|
| `note` | string | Yes | Min 1 character |
| `followUpDate` | string (ISO date) | No | - |

```json
{
  "note": "Discussed pricing. Customer interested in 200 units.",
  "followUpDate": "2026-09-01"
}
```

**Response 201:**
```json
{
  "success": true,
  "message": "Follow-up added successfully",
  "data": {
    "id": "uuid",
    "customerId": "uuid",
    "note": "Discussed pricing. Customer interested in 200 units.",
    "followUpDate": "2026-09-01T00:00:00.000Z",
    "createdBy": "uuid",
    "createdAt": "2026-08-12T06:00:00.000Z"
  }
}
```

---

## 3. Products

### GET /products

List products with optional search, category filter, and low-stock filter.

**Auth required:** Yes
**Roles:** Admin, Sales, Warehouse, Accounts

**Query parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | `1` | Page number |
| `limit` | number | `10` | Records per page (max: 100) |
| `search` | string | - | Search by product name or SKU |
| `category` | string | - | Filter by category |
| `lowStock` | boolean | `false` | If `true`, returns only products where `currentStock <= minimumStock` |

**Example request:**
```
GET /products?category=Electronics&lowStock=true
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": "uuid",
        "name": "Wireless Keyboard",
        "sku": "WK-2024-BLK",
        "category": "Electronics",
        "unitPrice": "1250.00",
        "currentStock": 5,
        "minimumStock": 10,
        "warehouseLocation": "A-12",
        "createdAt": "2026-08-01T10:00:00.000Z",
        "updatedAt": "2026-08-10T12:00:00.000Z"
      }
    ],
    "total": 3,
    "page": 1,
    "limit": 10
  }
}
```

---

### GET /products/:id

Get a single product by UUID.

**Auth required:** Yes
**Roles:** Admin, Sales, Warehouse, Accounts

**Path parameter:** `id` - Product UUID

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Wireless Keyboard",
    "sku": "WK-2024-BLK",
    "category": "Electronics",
    "unitPrice": "1250.00",
    "currentStock": 120,
    "minimumStock": 10,
    "warehouseLocation": "A-12",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

**Response 404:**
```json
{ "success": false, "message": "Product not found" }
```

---

### POST /products

Create a new product. SKU must be unique.

**Auth required:** Yes
**Roles:** Admin, Warehouse

**Request body:**

| Field | Type | Required | Validation |
|-------|------|:--------:|-----------|
| `name` | string | Yes | Min 2 characters |
| `sku` | string | Yes | Min 1, max 50 characters; must be unique |
| `category` | string | Yes | Min 1 character |
| `unitPrice` | number | Yes | Must be greater than 0 |
| `currentStock` | number | No | Integer >= 0 (default: 0) |
| `minimumStock` | number | No | Integer >= 0 (default: 0) |
| `warehouseLocation` | string | No | Bin / shelf code |

```json
{
  "name": "Wireless Keyboard",
  "sku": "WK-2024-BLK",
  "category": "Electronics",
  "unitPrice": 1250,
  "currentStock": 100,
  "minimumStock": 10,
  "warehouseLocation": "A-12"
}
```

**Response 201:**
```json
{
  "success": true,
  "message": "Product created successfully",
  "data": { ... }
}
```

**Response 409 - Duplicate SKU:**
```json
{ "success": false, "message": "SKU already exists" }
```

---

### PUT /products/:id

Update an existing product. All fields are optional.

**Auth required:** Yes
**Roles:** Admin, Warehouse

**Path parameter:** `id` - Product UUID

**Request body:** Any subset of `POST /products` fields.

```json
{ "unitPrice": 1400, "warehouseLocation": "B-05" }
```

**Response 200:**
```json
{
  "success": true,
  "message": "Product updated successfully",
  "data": { ... }
}
```

---

### DELETE /products/:id

Permanently delete a product.

**Auth required:** Yes
**Roles:** Admin only

**Path parameter:** `id` - Product UUID

**Response 200:**
```json
{ "success": true, "message": "Product deleted successfully" }
```

---

## 4. Stock / Inventory

### POST /stock/in

Add stock to a product (Stock IN). Records a `StockMovement` with type `IN` and increments `currentStock`.

**Auth required:** Yes
**Roles:** Admin, Warehouse

**Request body:**

| Field | Type | Required | Validation |
|-------|------|:--------:|-----------|
| `productId` | string (UUID) | Yes | Must reference an existing product |
| `quantity` | number | Yes | Integer >= 1 |
| `reason` | string | Yes | Min 1 character (audit trail note) |

```json
{
  "productId": "550e8400-e29b-41d4-a716-446655440001",
  "quantity": 50,
  "reason": "Purchase order #PO-2026-0412"
}
```

**Response 200:**
```json
{
  "success": true,
  "message": "Stock added successfully",
  "data": {
    "movement": {
      "id": "uuid",
      "productId": "uuid",
      "quantity": 50,
      "movementType": "IN",
      "reason": "Purchase order #PO-2026-0412",
      "createdBy": "uuid",
      "createdAt": "2026-08-12T06:00:00.000Z"
    },
    "product": {
      "id": "uuid",
      "name": "Wireless Keyboard",
      "currentStock": 150
    }
  }
}
```

**Response 404 - Product not found:**
```json
{ "success": false, "message": "Product not found" }
```

---

### POST /stock/out

Deduct stock from a product (Stock OUT). Records a `StockMovement` with type `OUT` and decrements `currentStock`.

**Business rule:** Will be rejected if `currentStock - quantity < 0`.

**Auth required:** Yes
**Roles:** Admin, Warehouse

**Request body:** Same structure as `POST /stock/in`.

```json
{
  "productId": "550e8400-e29b-41d4-a716-446655440001",
  "quantity": 30,
  "reason": "Manual adjustment - damaged goods"
}
```

**Response 200:**
```json
{
  "success": true,
  "message": "Stock removed successfully",
  "data": {
    "movement": {
      "id": "uuid",
      "productId": "uuid",
      "quantity": 30,
      "movementType": "OUT",
      "reason": "Manual adjustment - damaged goods",
      "createdBy": "uuid",
      "createdAt": "2026-08-12T06:00:00.000Z"
    },
    "product": {
      "id": "uuid",
      "name": "Wireless Keyboard",
      "currentStock": 120
    }
  }
}
```

**Response 409 - Insufficient stock:**
```json
{ "success": false, "message": "Insufficient stock" }
```

**Response 404 - Product not found:**
```json
{ "success": false, "message": "Product not found" }
```

---

### GET /stock/movements

Retrieve the full stock movement audit log. Optionally filter by product.

**Auth required:** Yes
**Roles:** Admin, Warehouse, Accounts

**Query parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `productId` | string (UUID) | Optional - filter movements for a specific product |

**Example request:**
```
GET /stock/movements?productId=550e8400-e29b-41d4-a716-446655440001
```

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "productId": "uuid",
      "quantity": 50,
      "movementType": "IN",
      "reason": "Purchase order #PO-2026-0412",
      "createdBy": "uuid",
      "createdAt": "2026-08-12T06:00:00.000Z",
      "product": {
        "id": "uuid",
        "name": "Wireless Keyboard",
        "sku": "WK-2024-BLK"
      },
      "user": {
        "id": "uuid",
        "name": "Warehouse User"
      }
    }
  ]
}
```

---

## 5. Sales Challans

### GET /challans

List all challans.

**Auth required:** Yes
**Roles:** Admin, Sales, Warehouse, Accounts

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "challanNumber": "CHLN-1723449600000",
      "customerId": "uuid",
      "totalQuantity": 15,
      "status": "DRAFT",
      "createdBy": "uuid",
      "createdAt": "2026-08-12T06:00:00.000Z",
      "updatedAt": "2026-08-12T06:00:00.000Z",
      "customer": {
        "id": "uuid",
        "name": "Ravi Sharma"
      },
      "items": [
        {
          "id": "uuid",
          "productId": "uuid",
          "productName": "Wireless Keyboard",
          "productSku": "WK-2024-BLK",
          "unitPrice": "1250.00",
          "quantity": 15
        }
      ]
    }
  ]
}
```

---

### GET /challans/:id

Get a single challan by UUID with full item details.

**Auth required:** Yes
**Roles:** Admin, Sales, Warehouse, Accounts

**Path parameter:** `id` - Challan UUID

**Response 200:** Same shape as a single item from `GET /challans`.

**Response 404:**
```json
{ "success": false, "message": "Challan not found" }
```

---

### POST /challans

Create a new challan in `DRAFT` status. Stock is NOT deducted at this stage.

**Auth required:** Yes
**Roles:** Admin, Sales

**Request body:**

| Field | Type | Required | Validation |
|-------|------|:--------:|-----------|
| `customerId` | string (UUID) | Yes | Must reference an existing customer |
| `items` | array | Yes | At least 1 item required |
| `items[].productId` | string (UUID) | Yes | Must reference an existing product |
| `items[].quantity` | number | Yes | Integer >= 1 |

```json
{
  "customerId": "550e8400-e29b-41d4-a716-446655440010",
  "items": [
    { "productId": "550e8400-e29b-41d4-a716-446655440001", "quantity": 10 },
    { "productId": "550e8400-e29b-41d4-a716-446655440002", "quantity": 5 }
  ]
}
```

**Response 201:**
```json
{
  "success": true,
  "message": "Challan created successfully",
  "data": {
    "id": "uuid",
    "challanNumber": "CHLN-1723449600000",
    "customerId": "uuid",
    "totalQuantity": 15,
    "status": "DRAFT",
    "createdBy": "uuid",
    "createdAt": "...",
    "items": [ ... ]
  }
}
```

**Response 404 - Customer not found:**
```json
{ "success": false, "message": "Customer not found" }
```

**Response 404 - Product not found:**
```json
{ "success": false, "message": "One or more products not found" }
```

---

### POST /challans/:id/confirm

Confirm a DRAFT challan. This runs an **atomic Prisma transaction** that:
1. Verifies the challan is in `DRAFT` status
2. Checks stock sufficiency for every item
3. Deducts stock from all products
4. Creates `StockMovement` records (type `OUT`) for each item
5. Sets challan status to `CONFIRMED`

If any step fails, the entire transaction is rolled back.

**Auth required:** Yes
**Roles:** Admin, Sales, Warehouse

**Path parameter:** `id` - Challan UUID

**Request body:** None

**Response 200:**
```json
{
  "success": true,
  "message": "Challan confirmed successfully",
  "data": {
    "id": "uuid",
    "challanNumber": "CHLN-1723449600000",
    "status": "CONFIRMED",
    ...
  }
}
```

**Response 400 - Already confirmed or cancelled:**
```json
{ "success": false, "message": "Only draft challans can be confirmed" }
```

**Response 409 - Insufficient stock for a product:**
```json
{
  "success": false,
  "message": "Insufficient stock for Wireless Keyboard",
  "stock": {
    "available": 3,
    "required": 10
  }
}
```

**Response 404:**
```json
{ "success": false, "message": "Challan not found" }
```

---

### POST /challans/:id/cancel

Cancel a DRAFT challan. Only DRAFT challans can be cancelled. Does not affect stock.

**Auth required:** Yes
**Roles:** Admin, Sales

**Path parameter:** `id` - Challan UUID

**Request body:** None

**Response 200:**
```json
{
  "success": true,
  "message": "Challan cancelled successfully",
  "data": {
    "id": "uuid",
    "challanNumber": "CHLN-1723449600000",
    "status": "CANCELLED",
    ...
  }
}
```

**Response 400 - Cannot cancel a confirmed challan:**
```json
{ "success": false, "message": "Only draft challans can be cancelled" }
```

**Response 404:**
```json
{ "success": false, "message": "Challan not found" }
```

---

## Quick Reference - All Endpoints

| Method | Route | Description | Roles |
|--------|-------|-------------|-------|
| `POST` | `/auth/login` | Login - get JWT | Public |
| `GET` | `/customers` | List customers (paginated, filterable) | Admin, Sales, Accounts |
| `GET` | `/customers/:id` | Get customer + followups | Admin, Sales, Accounts |
| `POST` | `/customers` | Create customer | Admin, Sales |
| `PUT` | `/customers/:id` | Update customer (partial) | Admin, Sales |
| `DELETE` | `/customers/:id` | Delete customer | Admin |
| `POST` | `/customers/:id/followups` | Add follow-up note | Admin, Sales |
| `GET` | `/products` | List products (paginated, filterable) | All |
| `GET` | `/products/:id` | Get product | All |
| `POST` | `/products` | Create product | Admin, Warehouse |
| `PUT` | `/products/:id` | Update product (partial) | Admin, Warehouse |
| `DELETE` | `/products/:id` | Delete product | Admin |
| `POST` | `/stock/in` | Stock IN - add stock | Admin, Warehouse |
| `POST` | `/stock/out` | Stock OUT - deduct stock | Admin, Warehouse |
| `GET` | `/stock/movements` | Stock audit log | Admin, Warehouse, Accounts |
| `GET` | `/challans` | List all challans | Admin, Sales, Warehouse, Accounts |
| `GET` | `/challans/:id` | Get challan detail | Admin, Sales, Warehouse, Accounts |
| `POST` | `/challans` | Create DRAFT challan | Admin, Sales |
| `POST` | `/challans/:id/confirm` | Confirm challan (atomic stock deduction) | Admin, Sales, Warehouse |
| `POST` | `/challans/:id/cancel` | Cancel DRAFT challan | Admin, Sales |

---

## Testing the API

### With curl

**Step 1 - Login:**
```bash
curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@erp.com","password":"Password@123"}' \
  | python -m json.tool
```

Copy the `token` value from the response, then use it as:

```bash
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Step 2 - Use any protected endpoint:**
```bash
# List customers
curl http://localhost:5000/api/customers \
  -H "Authorization: Bearer $TOKEN"

# Create product
curl -X POST http://localhost:5000/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"Widget A","sku":"WGT-A-001","category":"Parts","unitPrice":99.50}'

# Stock IN
curl -X POST http://localhost:5000/api/stock/in \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"productId":"<uuid>","quantity":100,"reason":"Initial stock"}'

# Create challan
curl -X POST http://localhost:5000/api/challans \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"customerId":"<uuid>","items":[{"productId":"<uuid>","quantity":5}]}'

# Confirm challan
curl -X POST http://localhost:5000/api/challans/<id>/confirm \
  -H "Authorization: Bearer $TOKEN"
```

### With the automated test suite

The full suite of 30 integration tests covers all endpoints above:

```bash
cd backend
npm run dev          # must be running on port 5000
npx tsx src/tests/system_test.ts
```

---

Mini ERP/CRM API - Node.js + Express + Prisma + PostgreSQL
