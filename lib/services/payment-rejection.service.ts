import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

export async function rejectPayment({
  paymentId,
  superAdminId,
  reason,
}: {
  paymentId: string;
  superAdminId: string;
  reason: string;
}) {
  const supabase = createAdminClient();

  const { data: payment, error: paymentError } = await supabase
    .from("payments")
    .select("id, status, notes")
    .eq("id", paymentId)
    .maybeSingle();

  if (paymentError) {
    console.error("Get payment error:", paymentError.message);
    throw new Error("Unable to verify payment.");
  }

  if (!payment) {
    throw new Error("PAYMENT_NOT_FOUND");
  }

  if (payment.status !== "PENDING") {
    throw new Error("PAYMENT_NOT_PENDING");
  }

  const { data, error } = await supabase
    .from("payments")
    .update({
      status: "REJECTED",
      confirmed_by: superAdminId,
      confirmed_at: new Date().toISOString(),
      notes: payment.notes
        ? `${payment.notes}\nRejection reason: ${reason}`
        : `Rejection reason: ${reason}`,
      updated_at: new Date().toISOString(),
    })
    .eq("id", paymentId)
    .eq("status", "PENDING")
    .select("id, status")
    .maybeSingle();

  if (error) {
    console.error("Reject payment error:", error.message);
    throw new Error("Unable to reject payment.");
  }

  if (!data) {
    throw new Error("PAYMENT_NOT_PENDING");
  }

  return data;
}