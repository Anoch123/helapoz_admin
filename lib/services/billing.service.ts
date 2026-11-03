import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

export async function createInitialShopSubscription(shopId: string) {
  const supabase = createAdminClient();

  const { data, error } = await supabase.rpc(
    "create_initial_shop_subscription",
    {
      p_shop_id: shopId,
    },
  );

  if (error) {
    console.error("Initial subscription creation error:", error.message);

    if (error.message.includes("SHOP_NOT_FOUND")) {
      throw new Error("SHOP_NOT_FOUND");
    }

    if (error.message.includes("SUBSCRIPTION_ALREADY_EXISTS")) {
      throw new Error("SUBSCRIPTION_ALREADY_EXISTS");
    }

    if (error.message.includes("ACTIVE_SUBSCRIPTION_PLAN_NOT_FOUND")) {
      throw new Error("ACTIVE_SUBSCRIPTION_PLAN_NOT_FOUND");
    }

    throw new Error("Unable to create initial shop subscription.");
  }

  const result = data?.[0];

  if (!result) {
    throw new Error("Subscription creation returned no result.");
  }

  return {
    subscriptionId: result.subscription_id,
    invoiceId: result.invoice_id,
    invoiceNumber: result.invoice_number,
    invoiceAmount: Number(result.invoice_amount),
  };
}