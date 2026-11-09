import { z } from "zod";

const passwordSchema = z
  .string()
  .min(12, "Password must contain at least 12 characters.")
  .max(72, "Password is too long.");

export const createShopSchema = z.object({
  planId: z.string().uuid("Please select a valid subscription plan."),
  shop: z.object({
    name: z.string().trim().min(2).max(150),
    legalName: z.string().trim().max(150).optional(),
    businessRegistrationNo: z.string().trim().max(100).optional(),
    contactEmail: z.string().trim().email(),
    contactPhone: z.string().trim().min(7).max(30),
    addressLine1: z.string().trim().min(2).max(200),
    addressLine2: z.string().trim().max(200).optional(),
    city: z.string().trim().min(2).max(100),
    district: z.string().trim().max(100).optional(),
    postalCode: z.string().trim().max(20).optional(),
  }),

  shopAdmin: z.object({
    fullName: z.string().trim().min(2).max(150),
    email: z.string().trim().email(),
    phone: z.string().trim().min(7).max(30),
    password: passwordSchema,
  }),

  shopUser: z.object({
    fullName: z.string().trim().min(2).max(150),
    email: z.string().trim().email(),
    phone: z.string().trim().min(7).max(30),
    password: passwordSchema,
  }),
}).refine(
  (data) =>
    data.shopAdmin.email.toLowerCase() !==
    data.shopUser.email.toLowerCase(),
  {
    message: "Shop Admin and Shop User must have different email addresses.",
    path: ["shopUser", "email"],
  },
);

export type CreateShopInput = z.infer<typeof createShopSchema>;