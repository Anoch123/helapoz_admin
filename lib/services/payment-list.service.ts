import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

export async function getPayments() {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("payments")
    .select(`
      id,
      amount,
      payment_method,
      status,
      transaction_reference,
      payment_date,
      created_at,
      invoice:invoices!payments_invoice_id_fkey (
        id,
        invoice_number,
        invoice_type,
        status,
        total
      ),
      shop:shops!payments_shop_id_fkey (
        id,
        shop_code,
        name
      )
    `)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    console.error("Get payments error:", error.message);
    throw new Error("Unable to load payments.");
  }

  return data ?? [];
}