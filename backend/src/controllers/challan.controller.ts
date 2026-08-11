import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth.middleware.js";
import { createChallan, getChallans, getChallanById, confirmChallan, cancelChallan } from "../services/challan.service.js";
import { createChallanSchema } from "../validators/challan.validator.js";
import { getParam } from "../utils/params.js";


// ========================================
// CREATE CHALLAN
// ========================================

export async function create(req: AuthenticatedRequest, res: Response) {
  try {
    const validation = createChallanSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.error.flatten(),
      });
    }

    const userId = req.user!.userId;

    const challan = await createChallan(
      validation.data.customerId,
      validation.data.items,
      userId
    );

    return res.status(201).json({
      success: true,
      message: "Challan created successfully",
      data: challan,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "CUSTOMER_NOT_FOUND") {
      return res.status(404).json({ success: false, message: "Customer not found" });
    }

    if (error instanceof Error && error.message === "PRODUCT_NOT_FOUND") {
      return res.status(404).json({ success: false, message: "One or more products not found" });
    }

    console.error("Create challan error:", error);
    return res.status(500).json({ success: false, message: "Failed to create challan" });
  }
}


// ========================================
// GET ALL CHALLANS
// ========================================

export async function getAll(_req: AuthenticatedRequest, res: Response) {
  try {
    const challans = await getChallans();

    return res.status(200).json({ success: true, data: challans });
  } catch (error) {
    console.error("Get challans error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch challans" });
  }
}


// ========================================
// GET CHALLAN BY ID
// ========================================

export async function getOne(req: AuthenticatedRequest, res: Response) {
  try {
    const challanId = getParam(req.params.id);
    if (!challanId) {
      return res.status(400).json({ success: false, message: "Challan ID is required" });
    }

    const challan = await getChallanById(challanId);

    return res.status(200).json({ success: true, data: challan });
  } catch (error) {
    if (error instanceof Error && error.message === "CHALLAN_NOT_FOUND") {
      return res.status(404).json({ success: false, message: "Challan not found" });
    }

    console.error("Get challan error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch challan" });
  }
}


// ========================================
// CONFIRM CHALLAN
// ========================================

export async function confirm(req: AuthenticatedRequest, res: Response) {
  try {
    const challanId = getParam(req.params.id);
    if (!challanId) {
      return res.status(400).json({ success: false, message: "Challan ID is required" });
    }

    const userId = req.user!.userId;

    const challan = await confirmChallan(challanId, userId);

    return res.status(200).json({
      success: true,
      message: "Challan confirmed successfully",
      data: challan,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "CHALLAN_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Challan not found",
      });
    }

    if (error instanceof Error && error.message === "CHALLAN_NOT_DRAFT") {
      return res.status(400).json({
        success: false,
        message: "Only draft challans can be confirmed",
      });
    }

    if (error instanceof Error && error.message === "PRODUCT_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (error instanceof Error && error.message === "NEGATIVE_STOCK") {
      return res.status(409).json({
        success: false,
        message: "Stock cannot become negative",
      });
    }

    if (error instanceof Error && error.message.startsWith("INSUFFICIENT_STOCK:")) {
      const [, productName, available, required] = error.message.split(":");

      return res.status(409).json({
        success: false,
        message: `Insufficient stock for ${productName}`,
        stock: {
          available: Number(available),
          required: Number(required),
        },
      });
    }

    console.error("Confirm challan error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to confirm challan",
    });
  }
}


// ========================================
// CANCEL CHALLAN
// ========================================

export async function cancel(req: AuthenticatedRequest, res: Response) {
  try {
    const challanId = getParam(req.params.id);
    if (!challanId) {
      return res.status(400).json({ success: false, message: "Challan ID is required" });
    }

    const challan = await cancelChallan(challanId);

    return res.status(200).json({
      success: true,
      message: "Challan cancelled successfully",
      data: challan,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "CHALLAN_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Challan not found",
      });
    }

    if (error instanceof Error && error.message === "CHALLAN_CANNOT_BE_CANCELLED") {
      return res.status(400).json({
        success: false,
        message: "Only draft challans can be cancelled",
      });
    }

    console.error("Cancel challan error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to cancel challan",
    });
  }
}