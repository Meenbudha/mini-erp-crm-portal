import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth.middleware.js";
import { createProductSchema, updateProductSchema } from "../validators/product.validator.js";
import * as productService from "../services/product.service.js";
import { getParam } from "../utils/params.js";


// ========================================
// CREATE PRODUCT
// ========================================

export async function createProduct(req: AuthenticatedRequest, res: Response) {
  try {
    const result = createProductSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: result.error.flatten(),
      });
    }

    const existing = await productService.getProducts({ page: 1, limit: 1, search: result.data.sku });
    const skuExists = existing.products.some(
      (p) => p.sku.toLowerCase() === result.data.sku.toLowerCase()
    );

    if (skuExists) {
      return res.status(409).json({ success: false, message: "SKU already exists" });
    }

    const product = await productService.createProduct(result.data);

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product,
    });
  } catch (error) {
    console.error("Create product error:", error);
    return res.status(500).json({ success: false, message: "Failed to create product" });
  }
}


// ========================================
// GET PRODUCTS
// ========================================

export async function getProducts(req: AuthenticatedRequest, res: Response) {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100);
    const search = typeof req.query.search === "string" ? req.query.search.trim() : undefined;
    const category = typeof req.query.category === "string" ? req.query.category.trim() : undefined;
    const lowStock = req.query.lowStock === "true";

    const result = await productService.getProducts({ page, limit, search, category, lowStock });

    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error("Get products error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch products" });
  }
}


// ========================================
// GET PRODUCT BY ID
// ========================================

export async function getProductById(req: AuthenticatedRequest, res: Response) {
  try {
    const productId = getParam(req.params.id);

    if (!productId) {
      return res.status(400).json({ success: false, message: "Product ID is required" });
    }

    const product = await productService.getProductById(productId);

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    return res.status(200).json({ success: true, data: product });
  } catch (error) {
    console.error("Get product error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch product" });
  }
}


// ========================================
// UPDATE PRODUCT
// ========================================

export async function updateProduct(req: AuthenticatedRequest, res: Response) {
  try {
    const productId = getParam(req.params.id);

    if (!productId) {
      return res.status(400).json({ success: false, message: "Product ID is required" });
    }

    const result = updateProductSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: result.error.flatten(),
      });
    }

    const existing = await productService.getProductById(productId);

    if (!existing) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const product = await productService.updateProduct(productId, result.data);

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: product,
    });
  } catch (error) {
    console.error("Update product error:", error);
    return res.status(500).json({ success: false, message: "Failed to update product" });
  }
}


// ========================================
// DELETE PRODUCT
// ========================================

export async function deleteProduct(req: AuthenticatedRequest, res: Response) {
  try {
    const productId = getParam(req.params.id);

    if (!productId) {
      return res.status(400).json({ success: false, message: "Product ID is required" });
    }

    const existing = await productService.getProductById(productId);

    if (!existing) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    await productService.deleteProduct(productId);

    return res.status(200).json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    console.error("Delete product error:", error);
    return res.status(500).json({ success: false, message: "Failed to delete product" });
  }
}