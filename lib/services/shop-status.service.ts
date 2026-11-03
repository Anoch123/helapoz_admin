import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import type { UpdateShopStatusInput } from "@/lib/validations/shop-status.validation";

interface UpdateShopStatusParams {
  shopId: string;
  superAdminId: string;
  input: UpdateShopStatusInput;
}

export async function updateShopStatus({
  shopId,
  superAdminId,
  input,
}: UpdateShopStatusParams) {
  const supabase = createAdminClient();

  // 1. Get the current status.
  const { data: shop, error: fetchError } = await supabase
    .from("shops")
    .select("id, name, shop_code, status")
    .eq("id", shopId)
    .maybeSingle();

  if (fetchError) {
    throw new Error("Unable to retrieve shop information.");
  }

  if (!shop) {
    throw new Error("SHOP_NOT_FOUND");
  }

  // 2. Validate the transition.
  if (shop.status === "ARCHIVED") {
    throw new Error("ARCHIVED_SHOP");
  }

  if (shop.status === input.status) {
    throw new Error("STATUS_UNCHANGED");
  }

  // 3. Update the shop.
  const { data: updatedShop, error: updateError } = await supabase
    .from("shops")
    .update({ status: input.status })
    .eq("id", shopId)
    .eq("status", shop.status)
    .select("id, shop_code, name, status, updated_at")
    .maybeSingle();

  if (updateError) {
    throw new Error("Unable to update shop status.");
  }

  if (!updatedShop) {
    throw new Error("STATUS_CONFLICT");
  }

  // 4. Record the status change.
  const { error: auditError } = await supabase
    .from("shop_audit_logs")
    .insert({
      shop_id: shopId,
      actor_user_id: superAdminId,
      actor_type: "SUPER_ADMIN",
      action: "SHOP_STATUS_UPDATED",
      entity_type: "SHOP",
      entity_id: shopId,
      details: {
        previous_status: shop.status,
        new_status: input.status,
      },
    });

  if (auditError) {
    // The status has already changed. Do not pretend the update failed
    // or retry it blindly, because that could create inconsistent history.
    console.error("Shop status audit logging failed.");
    throw new Error("STATUS_UPDATED_AUDIT_FAILED");
  }

  return updatedShop;
}