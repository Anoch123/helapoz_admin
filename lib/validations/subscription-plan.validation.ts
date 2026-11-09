
import { z } from "zod";

const subscriptionPlanFields = {
  planCode: z
    .string()
    .trim()
    .min(3, "Plan code must contain at least 3 characters.")
    .max(50, "Plan code cannot exceed 50 characters.")
    .regex(
      /^[A-Z][A-Z0-9_]*$/,
      "Use uppercase letters, numbers, and underscores.",
    ),

  name: z
    .string()
    .trim()
    .min(2, "Plan name must contain at least 2 characters.")
    .max(100, "Plan name cannot exceed 100 characters."),

  description: z
    .string()
    .trim()
    .max(500, "Description cannot exceed 500 characters.")
    .nullable()
    .optional(),

  monthlyPrice: z.coerce
    .number()
    .finite()
    .min(0, "Monthly price cannot be negative.")
    .max(100000000, "Monthly price is too high."),

  additionalUserPrice: z.coerce
    .number()
    .finite()
    .min(0, "Additional user price cannot be negative.")
    .max(100000000, "Additional user price is too high."),

  includedAdminUsers: z.coerce
    .number()
    .int()
    .min(1, "At least one admin user is required.")
    .max(1000),

  includedShopUsers: z.coerce
    .number()
    .int()
    .min(0, "Included shop users cannot be negative.")
    .max(1000),

  currency: z
    .string()
    .trim()
    .length(3, "Currency must be a 3-letter code.")
    .regex(/^[A-Z]{3}$/, "Use an uppercase currency code."),

  isActive: z.boolean(),
};

export const createSubscriptionPlanSchema = z.object(
  subscriptionPlanFields,
);

export const updateSubscriptionPlanSchema = z.object({
  name: subscriptionPlanFields.name,
  description: subscriptionPlanFields.description,
  monthlyPrice: subscriptionPlanFields.monthlyPrice,
  additionalUserPrice: subscriptionPlanFields.additionalUserPrice,
  includedAdminUsers: subscriptionPlanFields.includedAdminUsers,
  includedShopUsers: subscriptionPlanFields.includedShopUsers,
  currency: subscriptionPlanFields.currency,
  isActive: subscriptionPlanFields.isActive,
});

export type CreateSubscriptionPlanInput = z.infer<
  typeof createSubscriptionPlanSchema
>;

export type UpdateSubscriptionPlanInput = z.infer<
  typeof updateSubscriptionPlanSchema
>;
