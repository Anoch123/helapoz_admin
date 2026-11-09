import { z } from "zod";

export const shopBusinessTypes = [
  "RETAIL",
  "RESTAURANT",
  "HARDWARE",
  "CLOTHING",
  "PHARMACY",
  "ELECTRONICS",
  "OTHER",
] as const;

export const shopBusinessTypeSchema = z.enum(shopBusinessTypes);

export type ShopBusinessType = z.infer<
  typeof shopBusinessTypeSchema
>;

export const updateShopSchema = z.object({
  name: z.string().trim().min(2).max(150),
  legalName: z.string().trim().max(150).optional(),
  businessRegistrationNo: z.string().trim().max(100).optional(),
  businessType: shopBusinessTypeSchema,
  contactEmail: z.string().trim().email(),
  contactPhone: z.string().trim().min(7).max(30),

  addressLine1: z.string().trim().min(2).max(200),
  addressLine2: z.string().trim().max(200).optional(),
  city: z.string().trim().min(2).max(100),
  district: z.string().trim().max(100).optional(),
  postalCode: z.string().trim().max(20).optional(),
});

export type UpdateShopInput = z.infer<typeof updateShopSchema>;