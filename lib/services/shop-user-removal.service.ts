import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

interface RemoveShopUserParams {
  shopId: string;
  membershipId: string;
  superAdminId: string;
}

export async function removeShopUser({
  shopId,
  membershipId,
  superAdminId,
}: RemoveShopUserParams) {
  const supabase = createAdminClient();

  // 1. Release the additional seat and delete the membership atomically.
  const { data, error } = await supabase.rpc(
    "remove_shop_user_and_release_seat",
    {
      p_shop_id: shopId,
      p_membership_id: membershipId,
    },
  );

  if (error || !data?.length) {
    const message = error?.message ?? "";

    if (message.includes("SHOP_USER_NOT_FOUND")) {
      throw new Error("SHOP_USER_NOT_FOUND");
    }

    console.error("Shop user removal RPC failed:", message);
    throw new Error("SHOP_USER_REMOVAL_FAILED");
  }

  const removedUser = data[0];

  // 2. Record the removal.
  const { error: auditError } = await supabase
    .from("shop_audit_logs")
    .insert({
      shop_id: shopId,
      actor_user_id: superAdminId,
      actor_type: "SUPER_ADMIN",
      action: "SHOP_USER_REMOVED",
      entity_type: "SHOP_MEMBERSHIP",
      entity_id: removedUser.removed_membership_id,
      details: {
        user_id: removedUser.user_id,
        display_name: removedUser.display_name,
        seat_id: removedUser.seat_id,
        seat_amount: removedUser.seat_amount,
        seat_released: removedUser.seat_released,
      },
    });

  if (auditError) {
    console.error("Shop user removal audit logging failed:", auditError.message);
  }

  return {
    membershipId: removedUser.removed_membership_id,
    userId: removedUser.user_id,
    displayName: removedUser.display_name,
    seatReleased: removedUser.seat_released,
    seatId: removedUser.seat_id,
  };
}