import { z } from "zod";

export const notificationCategorySchema = z.enum([
  "ANNOUNCEMENT",
  "BILLING",
  "SYSTEM",
]);

export const notificationAudienceSchema = z.enum([
  "ALL_SHOPS",
  "SPECIFIC_SHOP",
]);

export const notificationRecipientRoleSchema = z.enum([
  "ALL",
  "SHOP_ADMIN",
  "SHOP_USER",
]);

export const createNotificationSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "Title is required.")
      .max(150, "Title must be 150 characters or fewer."),

    message: z
      .string()
      .trim()
      .min(1, "Message is required.")
      .max(5000, "Message must be 5000 characters or fewer."),

    category: notificationCategorySchema,

    audienceType: notificationAudienceSchema,

    targetShopId: z.string().uuid().nullable(),

    recipientRole: notificationRecipientRoleSchema,
  })
  .superRefine((data, ctx) => {
    if (
      data.audienceType === "ALL_SHOPS" &&
      data.targetShopId !== null
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["targetShopId"],
        message: "Target shop must be empty when sending to all shops.",
      });
    }

    if (
      data.audienceType === "SPECIFIC_SHOP" &&
      data.targetShopId === null
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["targetShopId"],
        message: "Please select a shop.",
      });
    }
  });

export type CreateNotificationInput = z.infer<
  typeof createNotificationSchema
>;