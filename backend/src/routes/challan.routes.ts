import { Router } from "express";
import { Role } from "../generated/client.js";

import { create, getAll, getOne, confirm, cancel } from "../controllers/challan.controller.js";

import { requireAuth } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";

const router = Router();

router.use(requireAuth);

// Create challan
router.post(
  "/",
  requireRole(Role.ADMIN, Role.SALES),
  create
);

// List all challans (Admin, Sales, Accounts, Warehouse)
router.get(
  "/",
  requireRole(Role.ADMIN, Role.SALES, Role.ACCOUNTS, Role.WAREHOUSE),
  getAll
);

// Get single challan (Admin, Sales, Accounts, Warehouse)
router.get(
  "/:id",
  requireRole(Role.ADMIN, Role.SALES, Role.ACCOUNTS, Role.WAREHOUSE),
  getOne
);

// Confirm challan (deducts stock - Admin, Sales, Warehouse)
router.post(
  "/:id/confirm",
  requireRole(Role.ADMIN, Role.SALES, Role.WAREHOUSE),
  confirm
);

// Cancel challan (Admin, Sales)
router.post(
  "/:id/cancel",
  requireRole(Role.ADMIN, Role.SALES),
  cancel
);

export default router;