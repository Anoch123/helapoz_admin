import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import type { CreateShopUserInput } from "@/lib/validations/create-shop-user.validation";

interface CreateShopUserParams {
  shopId: string;
  superAdminId: string;
  input: CreateShopUserInput;
}

export async function createShopUser({
  shopId,
  superAdminId,
  input,
}: CreateShopUserParams) {
  const supabase = createAdminClient();

  // 1. Verify the shop exists and is active.
  const { data: shop, error: shopError } = await supabase
    .from("shops")
    .select("id, name, shop_code, status")
    .eq("id", shopId)
    .maybeSingle();

  if (shopError) {
    throw new Error("Unable to retrieve shop information.");
  }

  if (!shop) {
    throw new Error("SHOP_NOT_FOUND");
  }

  if (shop.status !== "ACTIVE") {
    throw new Error("SHOP_NOT_ACTIVE");
  }

  // 2. Create the Supabase Auth account.
  const { data: authData, error: authError } =
    await supabase.auth.admin.createUser({
      email: input.email,
      password: input.password,
      email_confirm: true,
      user_metadata: {
        full_name: input.fullName,
      },
    });

  if (authError || !authData.user) {
    if (
      authError?.message.toLowerCase().includes("already") ||
      authError?.message.toLowerCase().includes("registered")
    ) {
      throw new Error("EMAIL_ALREADY_REGISTERED");
    }

    console.error("Shop user Auth creation failed:", authError?.message);
    throw new Error("Unable to create the user account.");
  }

  const userId = authData.user.id;

  // 3. Create the shop membership.
  const { data: membership, error: membershipError } = await supabase
    .from("shop_memberships")
    .insert({
      shop_id: shopId,
      user_id: userId,
      display_name: input.fullName,
      phone: input.phone,
      role: "SHOP_USER",
      status: "ACTIVE",
      created_by: superAdminId,
    })
    .select("id, shop_id, user_id, display_name, role, status, created_at")
    .single();

  if (membershipError || !membership) {
    // Only delete the Auth user created by this operation.
    // Never delete an existing account belonging to another shop.
    const { error: cleanupError } =
      await supabase.auth.admin.deleteUser(userId);

    if (cleanupError) {
      console.error(
        "Failed to clean up newly created Auth user:",
        cleanupError.message,
      );
    }

    console.error("Shop membership creation failed:", membershipError?.message);
    throw new Error("Unable to create the shop membership.");
  }

  // 4. Write the audit log.
  const { error: auditError } = await supabase
    .from("shop_audit_logs")
    .insert({
      shop_id: shopId,
      actor_user_id: superAdminId,
      actor_type: "SUPER_ADMIN",
      action: "SHOP_USER_CREATED",
      entity_type: "SHOP_MEMBERSHIP",
      entity_id: membership.id,
      details: {
        user_id: userId,
        email: input.email,
        display_name: input.fullName,
        role: "SHOP_USER",
      },
    });

  if (auditError) {
    // The account has already been created. Do not report a failed
    // creation that could cause the operator to retry and duplicate work.
    console.error("Shop user audit logging failed:", auditError.message);
  }

  // Never return the password.
  return {
    id: membership.id,
    userId: membership.user_id,
    displayName: membership.display_name,
    email: authData.user.email,
    role: membership.role,
    status: membership.status,
    createdAt: membership.created_at,
    shopCode: shop.shop_code,
    shopName: shop.name,
  };
}