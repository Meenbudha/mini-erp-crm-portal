import { Router } from "express";
import { Role } from "../generated/client.js";
import {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
  addFollowup,
} from "../controllers/customer.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";

const router = Router();

router.use(requireAuth);

// Create
router.post(
  "/",
  requireRole(Role.ADMIN, Role.SALES),
  createCustomer
);

// List/search
router.get(
  "/",
  requireRole(
    Role.ADMIN,
    Role.SALES,
    Role.ACCOUNTS
  ),
  getCustomers
);

// Detail
router.get(
  "/:id",
  requireRole(
    Role.ADMIN,
    Role.SALES,
    Role.ACCOUNTS
  ),
  getCustomerById
);

// Update
router.put(
  "/:id",
  requireRole(Role.ADMIN, Role.SALES),
  updateCustomer
);

// Delete
router.delete(
  "/:id",
  requireRole(Role.ADMIN),
  deleteCustomer
);

// Follow-up
router.post(
  "/:id/followups",
  requireRole(Role.ADMIN, Role.SALES),
  addFollowup
);

export default router;