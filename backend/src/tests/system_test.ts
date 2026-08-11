import http from "http";

const BASE_URL = "http://localhost:5000/api";

interface TestResponse {
  status: number;
  data: any;
}

async function request(
  method: string,
  path: string,
  body?: any,
  token?: string
): Promise<TestResponse> {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + path);
    const postData = body ? JSON.stringify(body) : "";

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(postData).toString(),
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const req = http.request(
      url,
      {
        method,
        headers,
      },
      (res) => {
        let rawData = "";
        res.on("data", (chunk) => {
          rawData += chunk;
        });
        res.on("end", () => {
          let data: any = rawData;
          try {
            data = JSON.parse(rawData);
          } catch {
            // keep raw string if not JSON
          }
          resolve({ status: res.statusCode || 500, data });
        });
      }
    );

    req.on("error", (e) => {
      reject(e);
    });

    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    throw new Error(`Test assertion failed: ${message}`);
  } else {
    console.log(`✅ PASS: ${message}`);
  }
}

async function runAllTests() {
  console.log("==========================================");
  console.log("🚀 STARTING FULL ERP/CRM SYSTEM SUITE TEST");
  console.log("==========================================\n");

  let adminToken = "";
  let salesToken = "";
  let warehouseToken = "";
  let accountsToken = "";

  // ----------------------------------------------------
  // 12A: AUTHENTICATION TESTING
  // ----------------------------------------------------
  console.log("--- [12A] AUTHENTICATION TESTING ---");

  // 1. Invalid Login
  const badLogin = await request("POST", "/auth/login", {
    email: "admin@erp.com",
    password: "WrongPassword123",
  });
  assert(badLogin.status === 401, "Invalid password returns 401 Unauthorized");

  // 2. Admin Login
  const adminLogin = await request("POST", "/auth/login", {
    email: "admin@erp.com",
    password: "Password@123",
  });
  assert(adminLogin.status === 200, "Admin login successful (200 OK)");
  assert(!!adminLogin.data.data?.token, "Admin JWT token generated");
  adminToken = adminLogin.data.data.token;

  // 3. Sales Login
  const salesLogin = await request("POST", "/auth/login", {
    email: "sales@erp.com",
    password: "Password@123",
  });
  assert(salesLogin.status === 200, "Sales login successful (200 OK)");
  salesToken = salesLogin.data.data.token;

  // 4. Warehouse Login
  const warehouseLogin = await request("POST", "/auth/login", {
    email: "warehouse@erp.com",
    password: "Password@123",
  });
  assert(warehouseLogin.status === 200, "Warehouse login successful (200 OK)");
  warehouseToken = warehouseLogin.data.data.token;

  // 5. Accounts Login
  const accountsLogin = await request("POST", "/auth/login", {
    email: "accounts@erp.com",
    password: "Password@123",
  });
  assert(accountsLogin.status === 200, "Accounts login successful (200 OK)");
  accountsToken = accountsLogin.data.data.token;

  // 6. Access without token
  const noTokenReq = await request("GET", "/customers");
  assert(noTokenReq.status === 401, "Accessing protected route without token returns 401");

  console.log("\n");

  // ----------------------------------------------------
  // 12B: ROLE & PERMISSION TESTING
  // ----------------------------------------------------
  console.log("--- [12B] ROLE & PERMISSION TESTING ---");

  // Sales user trying to record stock IN (should fail with 403)
  const salesStockIn = await request(
    "POST",
    "/stock/in",
    { productId: "some-id", quantity: 10, reason: "Unauthorized test" },
    salesToken
  );
  assert(salesStockIn.status === 403, "Sales user stock IN rejected with 403 Forbidden");

  // Warehouse user trying to create customer (should fail with 403)
  const warehouseCreateCust = await request(
    "POST",
    "/customers",
    { name: "Unauthorized Customer", mobile: "9876543210" },
    warehouseToken
  );
  assert(
    warehouseCreateCust.status === 403,
    "Warehouse user create customer rejected with 403 Forbidden"
  );

  console.log("\n");

  // ----------------------------------------------------
  // 12C: CUSTOMER CRUD TESTING
  // ----------------------------------------------------
  console.log("--- [12C] CUSTOMER CRUD TESTING ---");

  const timestamp = Date.now();
  const testCustomerEmail = `test.cust.${timestamp}@example.com`;

  // Create Customer
  const createCustRes = await request(
    "POST",
    "/customers",
    {
      name: `Test Client ${timestamp}`,
      email: testCustomerEmail,
      mobile: `999${timestamp.toString().slice(-7)}`,
      businessName: "Automated Test Corp",
      gstNumber: "27AAACA12341Z1",
      customerType: "WHOLESALE",
      address: "123 Test Suite Tower",
    },
    adminToken
  );
  assert(createCustRes.status === 201, "Customer created successfully (201 Created)");
  const createdCustomer = createCustRes.data.data;
  assert(!!createdCustomer?.id, "Customer ID returned");

  // Get Customer Details
  const getCustRes = await request("GET", `/customers/${createdCustomer.id}`, undefined, adminToken);
  assert(getCustRes.status === 200, "Fetch customer details returns 200 OK");
  assert(getCustRes.data.data.name === createdCustomer.name, "Customer name matches");

  // Update Customer
  const updateCustRes = await request(
    "PUT",
    `/customers/${createdCustomer.id}`,
    {
      name: `Updated Test Client ${timestamp}`,
      notes: "VIP Client Priority",
    },
    adminToken
  );
  assert(updateCustRes.status === 200, "Customer updated successfully (200 OK)");
  assert(updateCustRes.data.data.name.includes("Updated"), "Updated field reflected");

  console.log("\n");

  // ----------------------------------------------------
  // 12D: PRODUCT CRUD TESTING
  // ----------------------------------------------------
  console.log("--- [12D] PRODUCT CRUD TESTING ---");

  const testSku = `TEST-SKU-${timestamp}`;

  // Create Product
  const createProdRes = await request(
    "POST",
    "/products",
    {
      name: `Test Steel Rod ${timestamp}`,
      sku: testSku,
      category: "Raw Materials",
      unitPrice: 150.50,
      currentStock: 100,
      minimumStock: 20,
      warehouseLocation: "Depot T-1",
    },
    adminToken
  );
  assert(createProdRes.status === 201, "Product created successfully (201 Created)");
  const createdProduct = createProdRes.data.data;

  // Duplicate SKU test
  const dupProdRes = await request(
    "POST",
    "/products",
    {
      name: "Duplicate SKU Product",
      sku: testSku,
      unitPrice: 50,
      currentStock: 10,
    },
    adminToken
  );
  assert(dupProdRes.status === 400, "Duplicate SKU creation rejected with 400 Bad Request");

  console.log("\n");

  // ----------------------------------------------------
  // 12E: INVENTORY TESTING
  // ----------------------------------------------------
  console.log("--- [12E] INVENTORY TESTING ---");

  // Stock IN
  const stockInRes = await request(
    "POST",
    "/stock/in",
    {
      productId: createdProduct.id,
      quantity: 50,
      reason: "Bulk restock batch #1",
    },
    adminToken
  );
  assert(stockInRes.status === 200, "Stock IN logged successfully (200 OK)");
  assert(stockInRes.data.data.product.currentStock === 150, "Current stock updated from 100 to 150");

  // Stock OUT
  const stockOutRes = await request(
    "POST",
    "/stock/out",
    {
      productId: createdProduct.id,
      quantity: 30,
      reason: "Sample dispatch",
    },
    adminToken
  );
  assert(stockOutRes.status === 200, "Stock OUT logged successfully (200 OK)");
  assert(stockOutRes.data.data.product.currentStock === 120, "Current stock updated from 150 to 120");

  // Insufficient Stock OUT test
  const excessStockOutRes = await request(
    "POST",
    "/stock/out",
    {
      productId: createdProduct.id,
      quantity: 5000,
      reason: "Excessive withdrawal",
    },
    adminToken
  );
  assert(
    excessStockOutRes.status === 409 || excessStockOutRes.status === 400,
    "Excessive stock OUT rejected with 409/400 Insufficient stock"
  );

  // Check audit log
  const movementsRes = await request(
    "GET",
    `/stock/movements?productId=${createdProduct.id}`,
    undefined,
    adminToken
  );
  assert(movementsRes.status === 200, "Audit log fetched successfully");
  assert(movementsRes.data.data.length >= 2, "Audit log contains stock IN and OUT entries");

  console.log("\n");

  // ----------------------------------------------------
  // 12F & 12G: CHALLAN WORKFLOW & TRANSACTION / ROLLBACK
  // ----------------------------------------------------
  console.log("--- [12F & 12G] CHALLAN WORKFLOW & TRANSACTION TESTING ---");

  // Create Draft Challan
  const createChallanRes = await request(
    "POST",
    "/challans",
    {
      customerId: createdCustomer.id,
      items: [{ productId: createdProduct.id, quantity: 20 }],
    },
    salesToken
  );
  assert(createChallanRes.status === 201, "Sales Challan created as DRAFT (201 Created)");
  const createdChallan = createChallanRes.data.data;
  assert(createdChallan.status === "DRAFT", "Challan initial status is DRAFT");

  // Confirm Challan (Triggers stock deduction inside DB transaction)
  const confirmChallanRes = await request(
    "POST",
    `/challans/${createdChallan.id}/confirm`,
    {},
    warehouseToken
  );
  if (confirmChallanRes.status !== 200) {
    console.log("DEBUG confirmChallanRes:", confirmChallanRes);
  }
  assert(confirmChallanRes.status === 200, "Challan confirmed successfully (200 OK)");
  assert(confirmChallanRes.data.data.status === "CONFIRMED", "Challan status transitioned to CONFIRMED");

  // Verify stock deduction
  const prodCheckRes = await request("GET", `/products/${createdProduct.id}`, undefined, adminToken);
  assert(prodCheckRes.data.data.currentStock === 100, "Product stock deducted from 120 to 100 upon confirmation");

  // Double confirmation prevention test
  const doubleConfirmRes = await request(
    "POST",
    `/challans/${createdChallan.id}/confirm`,
    {},
    adminToken
  );
  assert(doubleConfirmRes.status === 400, "Double confirmation prevented with 400 Bad Request");

  // Create another draft challan and cancel it
  const draft2 = await request(
    "POST",
    "/challans",
    {
      customerId: createdCustomer.id,
      items: [{ productId: createdProduct.id, quantity: 5 }],
    },
    salesToken
  );
  const cancelRes = await request("POST", `/challans/${draft2.data.data.id}/cancel`, {}, salesToken);
  assert(cancelRes.status === 200, "Draft challan cancelled successfully");
  assert(cancelRes.data.data.status === "CANCELLED", "Challan status transitioned to CANCELLED");

  console.log("\n");

  // ----------------------------------------------------
  // 12H: VALIDATION TESTING
  // ----------------------------------------------------
  console.log("--- [12H] VALIDATION TESTING ---");

  // Invalid email format in customer creation
  const badEmailCust = await request(
    "POST",
    "/customers",
    {
      name: "Bad Email Corp",
      email: "not-an-email-address",
      mobile: "9876543210",
    },
    adminToken
  );
  assert(badEmailCust.status === 400, "Invalid email rejected with 400 Bad Request");

  // Negative quantity in stock IN
  const negativeStockIn = await request(
    "POST",
    "/stock/in",
    {
      productId: createdProduct.id,
      quantity: -10,
    },
    adminToken
  );
  assert(negativeStockIn.status === 400, "Negative quantity rejected with 400 Bad Request");

  // Cleanup test customer & product
  await request("DELETE", `/customers/${createdCustomer.id}`, undefined, adminToken);
  await request("DELETE", `/products/${createdProduct.id}`, undefined, adminToken);

  console.log("\n==========================================");
  console.log("🎉 ALL AUTOMATED SYSTEM TESTS PASSED CLEANLY!");
  console.log("==========================================\n");
}

runAllTests().catch((err) => {
  console.error("💥 SYSTEM TEST RUN FAILED:", err);
  process.exit(1);
});
