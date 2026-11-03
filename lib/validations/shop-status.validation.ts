import { z } from "zod";

export const updateShopStatusSchema = z.object({
  status: z.enum(["ACTIVE", "SUSPENDED", "ARCHIVED"]),
});

export type UpdateShopStatusInput = z.infer<
  typeof updateShopStatusSchema
>;