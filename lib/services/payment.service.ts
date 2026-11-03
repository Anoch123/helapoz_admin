import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import type { RecordPaymentInput } from "@/lib/validations/payment.validation";

export async function recordPayment({
  invoiceId,
  amount,
  transactionReference,
  paymentDate,
  notes,
  recordedBy,
}: RecordPaymentInput & {
  recordedBy: string;
}) {
  const supabase = createAdminClient();

  const { data: invoice, error: invoiceError } = await supabase
    .from("invoices")
    .select("id, shop_id, invoice_number, total, status")
    .eq("id", invoiceId)
    .maybeSingle();

  if (invoiceError) {
    console.error("Get invoice error:", invoiceError.message);
    throw new Error("Unable to verify invoice.");
  }

  if (!invoice) {
    throw new Error("INVOICE_NOT_FOUND");
  }

  if (!["PENDING", "PARTIALLY_PAID", "OVERDUE"].includes(invoice.status)) {
    throw new Error("INVOICE_NOT_PAYABLE");
  }

  const { data: payments, error: paymentsError } = await supabase
    .from("payments")
    .select("amount")
    .eq("invoice_id", invoiceId)
    .eq("status", "CONFIRMED");

  if (paymentsError) {
    console.error("Get confirmed payments error:", paymentsError.message);
    throw new Error("Unable to calculate invoice balance.");
  }

  const confirmedAmount = (payments ?? []).reduce(
    (total, payment) => total + Number(payment.amount),
    0,
  );

  const outstanding = Number(invoice.total) - confirmedAmount;

  if (outstanding <= 0) {
    throw new Error("INVOICE_ALREADY_PAID");
  }

  if (amount > outstanding) {
    throw new Error("PAYMENT_EXCEEDS_BALANCE");
  }

  // Prevent accidental duplicate references.
  const normalizedReference = transactionReference.trim();

  const { data: duplicate, error: duplicateError } = await supabase
    .from("payments")
    .select("id")
    .eq("payment_method", "BANK_TRANSFER")
    .eq("transaction_reference", normalizedReference)
    .maybeSingle();

  if (duplicateError) {
    console.error("Payment reference lookup error:", duplicateError.message);
    throw new Error("Unable to verify transaction reference.");
  }

  if (duplicate) {
    throw new Error("DUPLICATE_TRANSACTION_REFERENCE");
  }

  const { data: payment, error: paymentError } = await supabase
    .from("payments")
    .insert({
      invoice_id: invoice.id,
      shop_id: invoice.shop_id,
      amount,
      payment_method: "BANK_TRANSFER",
      status: "PENDING",
      transaction_reference: normalizedReference,
      payment_date: paymentDate,
      notes: notes || null,
      recorded_by: recordedBy,
    })
    .select(
      "id, invoice_id, shop_id, amount, payment_method, status, transaction_reference, payment_date, created_at",
    )
    .single();

  if (paymentError) {
    console.error("Record payment error:", paymentError.message);
    throw new Error("Unable to record payment.");
  }

  return {
    payment,
    invoiceNumber: invoice.invoice_number,
    outstandingBeforePayment: outstanding,
  };
}