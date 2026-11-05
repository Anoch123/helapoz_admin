
import { z } from "zod";

export const reportsQuerySchema = z
  .object({
    startDate: z.iso.date(),
    endDate: z.iso.date(),
  })
  .refine(
    (data) => data.startDate <= data.endDate,
    {
      message: "Start date must be before or equal to end date.",
      path: ["startDate"],
    },
  );
