import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import type { UpdateShopInput } from "@/lib/validations/update-shop.validation";

interface UpdateShopParams {
  shopId: string;
  superAdminId: string;
  input: UpdateShopInput;
}

export async function updateShop({
  shopId,
  superAdminId,
  input,
}: UpdateShopParams) {
  const supabase = createAdminClient();

  // Check whether the shop exists.
  const { data: existingShop, error: fetchError } = await supabase
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
      business_type
    `)
    .eq("id", shopId)
    .maybeSingle();

  if (fetchError) {
    throw new Error("Unable to retrieve shop information.");
  }

  if (!existingShop) {
    throw new Error("SHOP_NOT_FOUND");
  }

  const updates = {
    name: input.name,
    legal_name: input.legalName || null,
    business_type: input.businessType,
    business_registration_no: input.businessRegistrationNo || null,
    contact_email: input.contactEmail,
    contact_phone: input.contactPhone,
    address_line_1: input.addressLine1,
    address_line_2: input.addressLine2 || null,
    city: input.city,
    district: input.district || null,
    postal_code: input.postalCode || null,
  };

  // Only update the editable business information.
  const { data: updatedShop, error: updateError } = await supabase
    .from("shops")
    .update(updates)
    .eq("id", shopId)
    .select()
    .single();

  if (updateError) {
    console.error("Shop update error:", updateError.message);
    throw new Error("Unable to update shop information.");
  }

  // Record the changes in the audit log.
  const changedFields = Object.keys(updates).filter((key) => {
    const oldValue =
      existingShop[key as keyof typeof existingShop] ?? null;

    const newValue =
      updates[key as keyof typeof updates] ?? null;

    return oldValue !== newValue;
  });

  if (changedFields.length > 0) {
    const { error: auditError } = await supabase
      .from("shop_audit_logs")
      .insert({
        shop_id: shopId,
        actor_user_id: superAdminId,
        actor_type: "SUPER_ADMIN",
        action: "SHOP_DETAILS_UPDATED",
        entity_type: "SHOP",
        entity_id: shopId,
        details: {
          changed_fields: changedFields,
        },
      });

    if (auditError) {
      console.error("Shop update audit logging failed.");
    }
  }

  return updatedShop;
}