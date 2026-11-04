import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

interface CreateSeatInvoiceParams {
  shopId: string;
  quantity: number;
  issuedBy: string;
  notes?: string;
}

export async function createAdditionalUserSeatInvoice(
  params: CreateSeatInvoiceParams
) {
  const supabase = createAdminClient();

  const { data, error } = await supabase.rpc(
    "create_additional_user_seat_invoice",
    {
      p_shop_id: params.shopId,
      p_quantity: params.quantity,
      p_issued_by: params.issuedBy,
      p_notes: params.notes ?? null,
    }
  );

  if (error) {
    console.error("Additional seat invoice creation failed:", error);

    const knownErrors: Record<string, string> = {
      SHOP_NOT_FOUND: "Shop not found.",
      SHOP_ARCHIVED: "Cannot purchase seats for an archived shop.",
      INVALID_QUANTITY: "Invalid seat quantity.",
      SUBSCRIPTION_PLAN_NOT_FOUND:
        "The active subscription plan could not be found.",
    };

    const message =
      Object.entries(knownErrors).find(([key]) =>
        error.message.includes(key)
      )?.[1] ?? "Unable to create the additional seat invoice.";

    throw new Error(message);
  }

  const invoice = Array.isArray(data) ? data[0] : data;

  if (!invoice) {
    throw new Error("Invoice creation returned no result.");
  }

  return {
    invoiceId: invoice.invoice_id,
    invoiceNumber: invoice.invoice_number,
    quantity: invoice.quantity,
    unitPrice: Number(invoice.unit_price),
    totalAmount: Number(invoice.total_amount),
  };
}