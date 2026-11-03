import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import type { UpdateShopUserStatusInput } from "@/lib/validations/shop-user-status.validation";

interface UpdateShopUserStatusParams {
  shopId: string;
  membershipId: string;
  superAdminId: string;
  input: UpdateShopUserStatusInput;
}

export async function updateShopUserStatus({
  shopId,
  membershipId,
  superAdminId,
  input,
}: UpdateShopUserStatusParams) {
  const supabase = createAdminClient();

  // 1. Find the membership and verify it belongs to this shop.
  const { data: membership, error: fetchError } = await supabase
    .from("shop_memberships")
    .select("id, shop_id, user_id, display_name, role, status")
    .eq("id", membershipId)
    .eq("shop_id", shopId)
    .maybeSingle();

  if (fetchError) {
    throw new Error("Unable to retrieve membership information.");
  }

  if (!membership) {
    throw new Error("MEMBERSHIP_NOT_FOUND");
  }

  // Only Shop Users can be managed through this endpoint.
  if (membership.role !== "SHOP_USER") {
    throw new Error("INVALID_MEMBERSHIP_ROLE");
  }

  if (membership.status === input.status) {
    throw new Error("STATUS_UNCHANGED");
  }

  // 2. Update with a conditional status check to avoid race conditions.
  const { data: updatedMembership, error: updateError } = await supabase
    .from("shop_memberships")
    .update({ status: input.status })
    .eq("id", membershipId)
    .eq("shop_id", shopId)
    .eq("status", membership.status)
    .select("id, shop_id, user_id, display_name, role, status, updated_at")
    .maybeSingle();

  if (updateError) {
    console.error("Shop user status update failed:", updateError.message);
    throw new Error("Unable to update user status.");
  }

  if (!updatedMembership) {
    throw new Error("STATUS_CONFLICT");
  }

  // 3. Record the change.
  const { error: auditError } = await supabase
    .from("shop_audit_logs")
    .insert({
      shop_id: shopId,
      actor_user_id: superAdminId,
      actor_type: "SUPER_ADMIN",
      action: "SHOP_USER_STATUS_UPDATED",
      entity_type: "SHOP_MEMBERSHIP",
      entity_id: membershipId,
      details: {
        user_id: membership.user_id,
        display_name: membership.display_name,
        previous_status: membership.status,
        new_status: input.status,
      },
    });

  if (auditError) {
    console.error("Shop user status audit logging failed:", auditError.message);
    throw new Error("STATUS_UPDATED_AUDIT_FAILED");
  }

  return updatedMembership;
}