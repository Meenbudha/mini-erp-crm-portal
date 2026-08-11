import { Router } from "express";
import { Role } from "../generated/client.js";
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from "../controllers/product.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";

const router = Router();

router.use(requireAuth);

// Add product
router.post(
  "/",
  requireRole(
    Role.ADMIN,
    Role.WAREHOUSE
  ),
  createProduct
);

// List products
router.get(
  "/",
  requireRole(
    Role.ADMIN,
    Role.SALES,
    Role.WAREHOUSE,
    Role.ACCOUNTS
  ),
  getProducts
);

// Product details
router.get(
  "/:id",
  requireRole(
    Role.ADMIN,
    Role.SALES,
    Role.WAREHOUSE,
    Role.ACCOUNTS
  ),
  getProductById
);

// Edit product
router.put(
  "/:id",
  requireRole(
    Role.ADMIN,
    Role.WAREHOUSE
  ),
  updateProduct
);

// Delete product
router.delete(
  "/:id",
  requireRole(Role.ADMIN),
  deleteProduct
);

export default router;