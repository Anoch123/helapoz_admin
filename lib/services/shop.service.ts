import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { getShopUserSeatSummary } from "@/lib/services/shop-user-seat.service";

export async function getShops() {
  const supabase = createAdminClient();

  const { data: shops, error } = await supabase
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

  if (!shops || shops.length === 0) return [];

  const shopIds = shops.map((shop) => shop.id);

  const { data: invoices, error: invoiceError } = await supabase
    .from("invoices")
    .select("shop_id")
    .in("shop_id", shopIds)
    .eq("status", "PENDING");

  if (invoiceError) {
    console.error("Get pending invoice counts error:", invoiceError.message);
    throw new Error("Unable to load pending invoice counts.");
  }

  const pendingInvoiceCounts = new Map<string, number>();

  for (const invoice of invoices ?? []) {
    pendingInvoiceCounts.set(
      invoice.shop_id,
      (pendingInvoiceCounts.get(invoice.shop_id) ?? 0) + 1,
    );
  }

  return shops.map((shop) => ({
    ...shop,
    pendingInvoiceCount: pendingInvoiceCounts.get(shop.id) ?? 0,
  }));
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

  // 4. Retrieve pending invoices.
  const { data: pendingInvoices, error: invoiceError } = await supabase
    .from("invoices")
    .select(`
      id,
      invoice_number,
      invoice_type,
      status,
      total,
      currency,
      issued_at,
      due_at
    `)
    .eq("shop_id", shopId)
    .eq("status", "PENDING")
    .order("issued_at", { ascending: false });

  if (invoiceError) {
    console.error("Get shop pending invoices error:", invoiceError.message);
    throw new Error("Unable to load shop pending invoices.");
  }

  const seatSummary = await getShopUserSeatSummary(shopId);

  return {
    ...shop,
    accounts,
    seatSummary,
    pendingInvoices: pendingInvoices ?? [],
  };
}