import { z } from "zod";

export const createChallanSchema = z.object({
  customerId: z.string().uuid(),

  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        quantity: z.number().int().positive(),
      })
    )
    .min(1, "At least one product is required"),
});

export const updateChallanSchema = z.object({
  customerId: z.string().uuid().optional(),

  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        quantity: z.number().int().positive(),
      })
    )
    .min(1)
    .optional(),
});