import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import type { CreateShopInput } from "@/lib/validations/shop.validation";
import { createInitialShopSubscription } from "@/lib/services/billing.service";

interface ProvisionShopInput {
  input: CreateShopInput;
  superAdminId: string;
}

export async function provisionShop({
  input,
  superAdminId,
}: ProvisionShopInput) {
  const supabase = createAdminClient();

  const createdAuthUserIds: string[] = [];
  let createdShopId: string | null = null;

  try {
    // 1. Create the Shop Admin Auth account.
    const { data: adminResult, error: adminError } =
      await supabase.auth.admin.createUser({
        email: input.shopAdmin.email,
        password: input.shopAdmin.password,
        email_confirm: true,
        user_metadata: {
          full_name: input.shopAdmin.fullName,
        },
      });

    if (adminError || !adminResult.user) {
      throw new Error(
        adminError?.message ?? "Unable to create the Shop Admin account.",
      );
    }

    const shopAdminId = adminResult.user.id;
    createdAuthUserIds.push(shopAdminId);

    // 2. Create the Shop User Auth account.
    const { data: userResult, error: userError } =
      await supabase.auth.admin.createUser({
        email: input.shopUser.email,
        password: input.shopUser.password,
        email_confirm: true,
        user_metadata: {
          full_name: input.shopUser.fullName,
        },
      });

    if (userError || !userResult.user) {
      throw new Error(
        userError?.message ?? "Unable to create the Shop User account.",
      );
    }

    const shopUserId = userResult.user.id;
    createdAuthUserIds.push(shopUserId);

    // 3. Create the shop.
    const { data: shop, error: shopError } = await supabase
      .from("shops")
      .insert({
        name: input.shop.name,
        business_type: input.shop.businessType,
        legal_name: input.shop.legalName || null,
        business_registration_no:
          input.shop.businessRegistrationNo || null,
        contact_email: input.shop.contactEmail,
        contact_phone: input.shop.contactPhone,
        address_line_1: input.shop.addressLine1,
        address_line_2: input.shop.addressLine2 || null,
        city: input.shop.city,
        district: input.shop.district || null,
        postal_code: input.shop.postalCode || null,
        country: "Sri Lanka",
        status: "ACTIVE",
        created_by: superAdminId,
      })
      .select("id, shop_code, name, business_type")
      .single();

    if (shopError || !shop) {
      throw new Error(
        shopError?.message ?? "Unable to create the shop.",
      );
    }

    createdShopId = shop.id;

    // 4. Create both shop memberships.
    const { error: membershipError } = await supabase
      .from("shop_memberships")
      .insert([
        {
          shop_id: shop.id,
          user_id: shopAdminId,
          display_name: input.shopAdmin.fullName,
          phone: input.shopAdmin.phone,
          role: "SHOP_ADMIN",
          status: "ACTIVE",
          created_by: superAdminId,
        },
        {
          shop_id: shop.id,
          user_id: shopUserId,
          display_name: input.shopUser.fullName,
          phone: input.shopUser.phone,
          role: "SHOP_USER",
          status: "ACTIVE",
          created_by: superAdminId,
        },
      ]);

    if (membershipError) {
      throw new Error(
        membershipError.message ?? "Unable to create shop memberships.",
      );
    }

    const subscription = await createInitialShopSubscription(shop.id, input.planId);

    // 5. Record the provisioning event.
    const { error: auditError } = await supabase
      .from("shop_audit_logs")
      .insert({
        shop_id: shop.id,
        actor_user_id: superAdminId,
        actor_type: "SUPER_ADMIN",
        action: "SHOP_CREATED",
        entity_type: "SHOP",
        entity_id: shop.id,
        details: {
          shop_code: shop.shop_code,
          business_type: shop.business_type,
          shop_admin_id: shopAdminId,
          shop_user_id: shopUserId,
        },
      });

    if (auditError) {
      throw new Error("Unable to record the shop creation audit event.");
    }

    return {
      shop: {
        id: shop.id,
        shopCode: shop.shop_code,
        name: shop.name,
        businessType: shop.business_type,
      },
      shopAdmin: {
        id: shopAdminId,
        email: input.shopAdmin.email,
      },
      shopUser: {
        id: shopUserId,
        email: input.shopUser.email,
      },
      subscription,
    };
  } catch (error) {
    // Best-effort cleanup if any provisioning step fails.
    if (createdShopId) {
      const { error: deleteShopError } = await supabase
        .from("shops")
        .delete()
        .eq("id", createdShopId);

      if (deleteShopError) {
        console.error("Shop provisioning cleanup failed.");
      }
    }

    for (const userId of createdAuthUserIds) {
      const { error: deleteUserError } =
        await supabase.auth.admin.deleteUser(userId);

      if (deleteUserError) {
        console.error("Auth user provisioning cleanup failed.");
      }
    }

    throw error;
  }
}