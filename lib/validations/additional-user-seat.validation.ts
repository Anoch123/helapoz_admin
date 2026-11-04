import { z } from "zod";

export const createAdditionalUserSeatInvoiceSchema = z.object({
  shopId: z.string().uuid("Invalid shop ID"),

  quantity: z.coerce
    .number()
    .int("Quantity must be a whole number")
    .min(1, "Purchase at least one seat")
    .max(100, "You can purchase a maximum of 100 seats at once"),

  notes: z
    .string()
    .trim()
    .max(500, "Notes cannot exceed 500 characters")
    .optional(),
});

export type CreateAdditionalUserSeatInvoiceInput = z.infer<
  typeof createAdditionalUserSeatInvoiceSchema
>;