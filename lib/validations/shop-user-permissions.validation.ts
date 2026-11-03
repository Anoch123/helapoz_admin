import { z } from "zod";

export const updateShopUserPermissionsSchema = z.object({
  permissionKeys: z
    .array(z.string().trim().min(1).max(100))
    .max(100)
    .refine(
      (keys) => new Set(keys).size === keys.length,
      "Duplicate permissions are not allowed.",
    ),
});

export type UpdateShopUserPermissionsInput = z.infer<
  typeof updateShopUserPermissionsSchema
>;