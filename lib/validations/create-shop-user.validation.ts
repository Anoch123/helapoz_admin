import { z } from "zod";

export const createShopUserSchema = z.object({
  fullName: z.string().trim().min(2, "Full name is required.").max(150),

  email: z
    .string()
    .trim()
    .email("Enter a valid email address.")
    .transform((value) => value.toLowerCase()),

  phone: z.string().trim().min(7, "Enter a valid phone number.").max(30),

  password: z
    .string()
    .min(12, "Password must contain at least 12 characters.")
    .max(72, "Password is too long."),
});

export type CreateShopUserInput = z.infer<typeof createShopUserSchema>;