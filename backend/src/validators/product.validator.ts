import { z } from "zod";

export const createProductSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Product name must be at least 2 characters"),

  sku: z
    .string()
    .trim()
    .min(1, "SKU is required")
    .max(50, "SKU is too long"),

  category: z
    .string()
    .trim()
    .min(1, "Category is required"),

  unitPrice: z
    .coerce
    .number()
    .positive("Unit price must be greater than 0"),

  currentStock: z
    .coerce
    .number()
    .int()
    .min(0, "Stock cannot be negative")
    .default(0),

  minimumStock: z
    .coerce
    .number()
    .int()
    .min(0, "Minimum stock cannot be negative")
    .default(0),

  warehouseLocation: z
    .string()
    .trim()
    .optional(),
});

export const updateProductSchema =
  createProductSchema.partial();