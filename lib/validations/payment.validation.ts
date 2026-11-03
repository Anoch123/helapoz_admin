import { z } from "zod";

export const recordPaymentSchema = z.object({
  invoiceId: z.string().uuid("Invalid invoice."),
  amount: z.coerce
    .number()
    .positive("Payment amount must be greater than zero.")
    .max(100000000, "Payment amount is too large."),
  transactionReference: z
    .string()
    .trim()
    .min(3, "Enter the bank transaction reference.")
    .max(150, "Transaction reference is too long."),
  paymentDate: z.iso.date("Enter a valid payment date."),
  notes: z.string().trim().max(500).optional(),
});

export type RecordPaymentInput = z.infer<
  typeof recordPaymentSchema
>;