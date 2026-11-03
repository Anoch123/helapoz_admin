import { z } from "zod";

export const updateShopUserStatusSchema = z.object({
  status: z.enum(["ACTIVE", "SUSPENDED"]),
});

export type UpdateShopUserStatusInput = z.infer<
  typeof updateShopUserStatusSchema
>;