
import { z } from "zod";

export const updatePermissionStatusSchema = z.object({
  permissionKey: z
    .string()
    .trim()
    .min(1, "Permission key is required."),

  isActive: z.boolean({
    error: "Please provide a valid permission status.",
  }),
});

export type UpdatePermissionStatusInput = z.infer<
  typeof updatePermissionStatusSchema
>;
