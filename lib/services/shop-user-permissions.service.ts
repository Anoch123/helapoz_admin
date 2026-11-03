import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import type { UpdateShopUserPermissionsInput } from "@/lib/validations/shop-user-permissions.validation";

export async function getShopUserPermissions(
  shopId: string,
  membershipId: string,
) {
  const supabase = createAdminClient();

  const { data: membership, error: membershipError } = await supabase
    .from("shop_memberships")
    .select("id, shop_id, user_id, display_name, role, status")
    .eq("id", membershipId)
    .eq("shop_id", shopId)
    .maybeSingle();

  if (membershipError) {
    console.error("Get membership error:", membershipError.message);
    throw new Error("Unable to load Shop User.");
  }

  if (!membership) {
    throw new Error("MEMBERSHIP_NOT_FOUND");
  }

  if (membership.role !== "SHOP_USER") {
    throw new Error("INVALID_MEMBERSHIP_ROLE");
  }

  const [
    { data: permissions, error: permissionsError },
    { data: assigned, error: assignedError },
  ] = await Promise.all([
    supabase
      .from("permissions")
      .select("permission_key, name, description, category")
      .eq("active", true)
      .order("category")
      .order("name"),

    supabase
      .from("shop_user_permissions")
      .select("permission_key")
      .eq("shop_id", shopId)
      .eq("user_id", membership.user_id),
  ]);

  if (permissionsError || assignedError) {
    console.error(
      "Get Shop User permissions error:",
      permissionsError?.message ?? assignedError?.message,
    );
    throw new Error("Unable to load permissions.");
  }

  return {
    membership,
    permissions: permissions ?? [],
    assignedPermissionKeys: (assigned ?? []).map(
      (permission) => permission.permission_key,
    ),
  };
}

export async function updateShopUserPermissions({
  shopId,
  membershipId,
  superAdminId,
  input,
}: {
  shopId: string;
  membershipId: string;
  superAdminId: string;
  input: UpdateShopUserPermissionsInput;
}) {
  const supabase = createAdminClient();

  const { data: membership, error: membershipError } = await supabase
    .from("shop_memberships")
    .select("id, user_id, role")
    .eq("id", membershipId)
    .eq("shop_id", shopId)
    .maybeSingle();

  if (membershipError) {
    console.error("Get membership error:", membershipError.message);
    throw new Error("Unable to verify Shop User.");
  }

  if (!membership) {
    throw new Error("MEMBERSHIP_NOT_FOUND");
  }

  if (membership.role !== "SHOP_USER") {
    throw new Error("INVALID_MEMBERSHIP_ROLE");
  }

  const { error } = await supabase.rpc("set_shop_user_permissions", {
    p_shop_id: shopId,
    p_user_id: membership.user_id,
    p_permission_keys: input.permissionKeys,
    p_granted_by: superAdminId,
  });

  if (error) {
    console.error("Update permissions error:", error.message);

    if (error.message.includes("INVALID_PERMISSION_KEYS")) {
      throw new Error("INVALID_PERMISSION_KEYS");
    }

    if (error.message.includes("MEMBERSHIP_NOT_FOUND")) {
      throw new Error("MEMBERSHIP_NOT_FOUND");
    }

    if (error.message.includes("INVALID_MEMBERSHIP_ROLE")) {
      throw new Error("INVALID_MEMBERSHIP_ROLE");
    }

    throw new Error("Unable to update permissions.");
  }

  return { success: true };
}