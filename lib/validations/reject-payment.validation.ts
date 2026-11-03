import { z } from "zod";

export const rejectPaymentSchema = z.object({
  reason: z.string().trim().min(5).max(500),
});