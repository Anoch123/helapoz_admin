import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

export async function confirmPayment({
  paymentId,
  superAdminId,
}: {
  paymentId: string;
  superAdminId: string;
}) {
  const supabase = createAdminClient();

  const { data, error } = await supabase.rpc(
    "confirm_subscription_payment",
    {
      p_payment_id: paymentId,
      p_confirmed_by: superAdminId,
    },
  );

  if (error) {
    console.error("Confirm payment error:", error.message);

    const knownErrors = [
      "PAYMENT_NOT_FOUND",
      "PAYMENT_NOT_PENDING",
      "INVOICE_NOT_FOUND",
      "INVOICE_NOT_PAYABLE",
      "PAYMENT_EXCEEDS_INVOICE_BALANCE",
      "SUBSCRIPTION_NOT_FOUND",
      "SUBSCRIPTION_CANCELLED",
      "SUBSCRIPTION_STATUS_NOT_ELIGIBLE",
      "RENEWAL_BILLING_PERIOD_MISSING"
    ];

    for (const code of knownErrors) {
      if (error.message.includes(code)) {
        throw new Error(code);
      }
    }

    throw new Error("Unable to confirm payment.");
  }

  return data;
}