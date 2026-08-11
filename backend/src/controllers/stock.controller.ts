import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth.middleware.js";
import { stockMovementSchema } from "../validators/stock.validator.js";
import * as stockService from "../services/stock.service.js";


// ========================================
// STOCK IN
// ========================================

export async function stockIn(req: AuthenticatedRequest, res: Response) {
  try {
    const result = stockMovementSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: result.error.flatten(),
      });
    }

    const data = await stockService.stockIn(
      result.data.productId,
      result.data.quantity,
      result.data.reason,
      req.user!.userId
    );

    return res.status(200).json({
      success: true,
      message: "Stock added successfully",
      data,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "PRODUCT_NOT_FOUND") {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    console.error("Stock IN error:", error);
    return res.status(500).json({ success: false, message: "Failed to add stock" });
  }
}


// ========================================
// STOCK OUT
// ========================================

export async function stockOut(req: AuthenticatedRequest, res: Response) {
  try {
    const result = stockMovementSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: result.error.flatten(),
      });
    }

    const data = await stockService.stockOut(
      result.data.productId,
      result.data.quantity,
      result.data.reason,
      req.user!.userId
    );

    return res.status(200).json({
      success: true,
      message: "Stock removed successfully",
      data,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "PRODUCT_NOT_FOUND") {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    if (error instanceof Error && error.message === "INSUFFICIENT_STOCK") {
      return res.status(409).json({ success: false, message: "Insufficient stock" });
    }

    console.error("Stock OUT error:", error);
    return res.status(500).json({ success: false, message: "Failed to remove stock" });
  }
}


// ========================================
// GET STOCK MOVEMENTS
// ========================================

export async function getStockMovements(req: AuthenticatedRequest, res: Response) {
  try {
    const productId =
      typeof req.query.productId === "string" ? req.query.productId.trim() : undefined;

    const movements = await stockService.getStockMovements(productId);

    return res.status(200).json({ success: true, data: movements });
  } catch (error) {
    console.error("Get stock movements error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch stock movements" });
  }
}