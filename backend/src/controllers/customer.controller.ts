import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth.middleware.js";

import {
  createCustomerSchema,
  updateCustomerSchema,
  followupSchema,
} from "../validators/customer.validator.js";

import * as customerService from "../services/customer.service.js";


// ========================================
// CREATE CUSTOMER
// ========================================

export async function createCustomer(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const result = createCustomerSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: result.error.flatten(),
      });
    }

    const customer = await customerService.createCustomer(
      result.data
    );

    return res.status(201).json({
      success: true,
      message: "Customer created successfully",
      data: customer,
    });

  } catch (error) {
    console.error("Create customer error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create customer",
    });
  }
}


// ========================================
// GET CUSTOMERS
// ========================================

export async function getCustomers(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const page = Math.max(
      Number(req.query.page) || 1,
      1
    );

    const limit = Math.min(
      Math.max(
        Number(req.query.limit) || 10,
        1
      ),
      100
    );

    const search =
      typeof req.query.search === "string"
        ? req.query.search.trim()
        : undefined;

    const status =
      typeof req.query.status === "string"
        ? req.query.status as
            | "LEAD"
            | "ACTIVE"
            | "INACTIVE"
        : undefined;

    const customerType =
      typeof req.query.customerType === "string"
        ? req.query.customerType as
            | "RETAIL"
            | "WHOLESALE"
            | "DISTRIBUTOR"
        : undefined;

    const result =
      await customerService.getCustomers({
        page,
        limit,
        search,
        status,
        customerType,
      });

    return res.status(200).json({
      success: true,
      data: result,
    });

  } catch (error) {
    console.error("Get customers error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch customers",
    });
  }
}


// ========================================
// GET CUSTOMER BY ID
// ========================================

export async function getCustomerById(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const customerId = Array.isArray(req.params.id)
  ? req.params.id[0]
  : req.params.id;

if (!customerId) {
  return res.status(400).json({
    success: false,
    message: "Customer ID is required",
  });
}

    const customer =
      await customerService.getCustomerById(
        customerId
      );

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: customer,
    });

  } catch (error) {
    console.error("Get customer error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch customer",
    });
  }
}


// ========================================
// UPDATE CUSTOMER
// ========================================

export async function updateCustomer(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const customerId = Array.isArray(req.params.id)
  ? req.params.id[0]
  : req.params.id;

    if (!customerId) {
      return res.status(400).json({
        success: false,
        message: "Customer ID is required",
      });
    }

    const result =
      updateCustomerSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: result.error.flatten(),
      });
    }

    const existing =
      await customerService.getCustomerById(
        customerId
      );

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    const customer =
      await customerService.updateCustomer(
        customerId,
        result.data
      );

    return res.status(200).json({
      success: true,
      message: "Customer updated successfully",
      data: customer,
    });

  } catch (error) {
    console.error("Update customer error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update customer",
    });
  }
}


// ========================================
// DELETE CUSTOMER
// ========================================

export async function deleteCustomer(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const customerId = Array.isArray(req.params.id)
  ? req.params.id[0]
  : req.params.id;

    if (!customerId) {
      return res.status(400).json({
        success: false,
        message: "Customer ID is required",
      });
    }

    const existing =
      await customerService.getCustomerById(
        customerId
      );

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    await customerService.deleteCustomer(
      customerId
    );

    return res.status(200).json({
      success: true,
      message: "Customer deleted successfully",
    });

  } catch (error) {
    console.error("Delete customer error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete customer",
    });
  }
}


// ========================================
// ADD FOLLOW-UP
// ========================================

export async function addFollowup(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const customerId = Array.isArray(req.params.id)
  ? req.params.id[0]
  : req.params.id;
  
    if (!customerId) {
      return res.status(400).json({
        success: false,
        message: "Customer ID is required",
      });
    }

    const result =
      followupSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: result.error.flatten(),
      });
    }

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const customer =
      await customerService.getCustomerById(
        customerId
      );

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    const followup =
      await customerService.addFollowup(
        customerId,
        req.user.userId,
        result.data
      );

    return res.status(201).json({
      success: true,
      message: "Follow-up added successfully",
      data: followup,
    });

  } catch (error) {
    console.error("Add follow-up error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to add follow-up",
    });
  }
}