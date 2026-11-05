import { z } from "zod";

export const auditLogQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),

  pageSize: z.coerce.number().int().min(1).max(100).default(10),

  source: z
    .enum(["ALL", "SHOP", "ADMIN"])
    .default("ALL"),

  actorType: z
    .enum(["ALL", "SUPER_ADMIN", "SHOP_ADMIN", "SYSTEM"])
    .default("ALL"),

  action: z.string().trim().optional(),

  shopId: z.uuid().optional(),

  startDate: z.iso.date().optional(),

  endDate: z.iso.date().optional(),
}).refine(
  (data) =>
    !data.startDate ||
    !data.endDate ||
    data.startDate <= data.endDate,
  {
    message: "Start date cannot be after end date.",
    path: ["endDate"],
  }
);

export type AuditLogQuery = z.infer<
  typeof auditLogQuerySchema
>;