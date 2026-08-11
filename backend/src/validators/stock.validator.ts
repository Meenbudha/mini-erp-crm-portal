import { z } from "zod";

export const stockMovementSchema = z.object({
  productId: z
    .string()
    .uuid("Invalid product ID"),

  quantity: z
    .coerce
    .number()
    .int()
    .positive("Quantity must be greater than 0"),

  reason: z
    .string()
    .trim()
    .min(2, "Reason is required"),
});