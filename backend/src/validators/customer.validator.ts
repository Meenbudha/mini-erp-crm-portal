import { z } from "zod";

export const createCustomerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Customer name must be at least 2 characters"),

  mobile: z
    .string()
    .trim()
    .min(7, "Invalid mobile number"),

  email: z
    .string()
    .email("Invalid email")
    .optional()
    .or(z.literal("")),

  businessName: z
    .string()
    .trim()
    .optional(),

  gstNumber: z
    .string()
    .trim()
    .optional(),

  customerType: z.enum([
    "RETAIL",
    "WHOLESALE",
    "DISTRIBUTOR",
  ]),

  address: z
    .string()
    .trim()
    .optional(),

  status: z
    .enum(["LEAD", "ACTIVE", "INACTIVE"])
    .default("LEAD"),

  followUpDate: z
    .coerce
    .date()
    .optional(),

  notes: z
    .string()
    .trim()
    .optional(),
});

export const updateCustomerSchema =
  createCustomerSchema.partial();

export const followupSchema = z.object({
  note: z
    .string()
    .trim()
    .min(1, "Follow-up note is required"),

  followUpDate: z
    .coerce
    .date()
    .optional(),
});