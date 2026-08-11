import { Router } from "express";
import { Role } from "../generated/client.js";

import {
  stockIn,
  stockOut,
  getStockMovements,
} from "../controllers/stock.controller.js";

import { requireAuth } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";

const router = Router();

router.use(requireAuth);

// Stock IN
router.post(
  "/in",
  requireRole(
    Role.ADMIN,
    Role.WAREHOUSE
  ),
  stockIn
);

// Stock OUT
router.post(
  "/out",
  requireRole(
    Role.ADMIN,
    Role.WAREHOUSE
  ),
  stockOut
);

// View movement history
router.get(
  "/movements",
  requireRole(
    Role.ADMIN,
    Role.WAREHOUSE,
    Role.ACCOUNTS
  ),
  getStockMovements
);

export default router;