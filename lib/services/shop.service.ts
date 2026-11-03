import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

export async function getShops() {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("shops")
    .select(`
      id,
      shop_code,
      name,
      contact_email,
      contact_phone,
      city,
      district,
      status,
      created_at
    `)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("Get shops error:", error.message);
    throw new Error("Unable to load shops.");
  }

  return data ?? [];
}

export async function getShopById(shopId: string) {
  const supabase = createAdminClient();

  // 1. Retrieve the shop.
  const { data: shop, error: shopError } = await supabase
    .from("shops")
    .select(`
      id,
      shop_code,
      name,
      legal_name,
      business_registration_no,
      contact_email,
      contact_phone,
      address_line_1,
      address_line_2,
      city,
      district,
      postal_code,
      country,
      status,
      created_at,
      updated_at
    `)
    .eq("id", shopId)
    .maybeSingle();

  if (shopError) {
    console.error("Get shop details error:", shopError.message);
    throw new Error("Unable to load shop details.");
  }

  if (!shop) return null;

  // 2. Retrieve shop memberships.
  const { data: memberships, error: membershipError } = await supabase
    .from("shop_memberships")
    .select(`
      id,
      user_id,
      display_name,
      phone,
      role,
      status,
      created_at
    `)
    .eq("shop_id", shopId)
    .order("created_at", { ascending: true });

  if (membershipError) {
    console.error("Get shop memberships error:", membershipError.message);
    throw new Error("Unable to load shop accounts.");
  }

  // 3. Retrieve Auth account emails.
  const accounts = await Promise.all(
    (memberships ?? []).map(async (membership) => {
      const { data, error } = await supabase.auth.admin.getUserById(
        membership.user_id,
      );

      if (error) {
        console.error(
          `Unable to retrieve Auth account for membership ${membership.id}.`,
        );
      }

      return {
        ...membership,
        email: data.user?.email ?? null,
        emailConfirmedAt: data.user?.email_confirmed_at ?? null,
        lastSignInAt: data.user?.last_sign_in_at ?? null,
      };
    }),
  );

  return {
    ...shop,
    accounts,
  };
}