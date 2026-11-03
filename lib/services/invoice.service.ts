import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

type NumericValue = number | string;

export type InvoiceShop = {
  id: string;
  shop_code: string;
  name: string;
  contact_email?: string | null;
  contact_phone?: string | null;
};

export type InvoiceRecord = {
  id: string;
  shop_id: string;
  subscription_id: string | null;
  invoice_number: string;
  invoice_type: string;
  status: string;
  billing_period_start: string | null;
  billing_period_end: string | null;
  subtotal: NumericValue;
  discount: NumericValue;
  total: NumericValue;
  currency: string;
  issued_at: string;
  due_at: string;
  paid_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type InvoiceItem = {
  id: string;
  invoice_id: string;
  item_type: string;
  description: string;
  quantity: NumericValue;
  unit_price: NumericValue;
  line_total: NumericValue;
  created_at: string;
};

export type InvoicePayment = {
  id: string;
  amount: NumericValue;
  payment_method: string;
  status: string;
  transaction_reference: string | null;
  payment_date: string;
  notes: string | null;
  created_at: string;
  confirmed_at: string | null;
};

export type InvoiceListItem = InvoiceRecord & {
  shop: InvoiceShop | null;
};

export type InvoiceDetails = InvoiceRecord & {
  shop: InvoiceShop | null;
  items: InvoiceItem[];
  payments: InvoicePayment[];
  confirmedAmount: number;
  outstandingBalance: number;
};

/* -------------------------------------------------------------------------- */
/* Get all invoices                                                           */
/* -------------------------------------------------------------------------- */

export async function getInvoices(): Promise<InvoiceListItem[]> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("invoices")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    throw new Error(`Failed to fetch invoices: ${error.message}`);
  }

  const invoices = (data ?? []) as InvoiceRecord[];

  if (invoices.length === 0) {
    return [];
  }

  const shopIds = [...new Set(invoices.map((invoice) => invoice.shop_id))];

  const { data: shopsData, error: shopsError } = await supabase
    .from("shops")
    .select("id, shop_code, name")
    .in("id", shopIds);

  if (shopsError) {
    throw new Error(`Failed to fetch invoice shops: ${shopsError.message}`);
  }

  const shops = (shopsData ?? []) as InvoiceShop[];

  const shopMap = new Map<string, InvoiceShop>(
    shops.map((shop) => [shop.id, shop])
  );

  return invoices.map((invoice): InvoiceListItem => ({
    ...invoice,
    shop: shopMap.get(invoice.shop_id) ?? null,
  }));
}

/* -------------------------------------------------------------------------- */
/* Get invoice by ID                                                          */
/* -------------------------------------------------------------------------- */

export async function getInvoiceById(
  invoiceId: string
): Promise<InvoiceDetails | null> {
  const supabase = createAdminClient();

  const { data: invoiceData, error: invoiceError } = await supabase
    .from("invoices")
    .select("*")
    .eq("id", invoiceId)
    .maybeSingle();

  if (invoiceError) {
    throw new Error(`Failed to fetch invoice: ${invoiceError.message}`);
  }

  if (!invoiceData) {
    return null;
  }

  const invoice = invoiceData as InvoiceRecord;

  const [shopResult, itemsResult, paymentsResult] = await Promise.all([
    supabase
      .from("shops")
      .select("id, shop_code, name, contact_email, contact_phone")
      .eq("id", invoice.shop_id)
      .maybeSingle(),

    supabase
      .from("invoice_items")
      .select("*")
      .eq("invoice_id", invoiceId)
      .order("created_at", { ascending: true }),

    supabase
      .from("payments")
      .select(
        `
          id,
          amount,
          payment_method,
          status,
          transaction_reference,
          payment_date,
          notes,
          created_at,
          confirmed_at
        `
      )
      .eq("invoice_id", invoiceId)
      .order("created_at", { ascending: false }),
  ]);

  if (shopResult.error) {
    throw new Error(`Failed to fetch shop: ${shopResult.error.message}`);
  }

  if (itemsResult.error) {
    throw new Error(
      `Failed to fetch invoice items: ${itemsResult.error.message}`
    );
  }

  if (paymentsResult.error) {
    throw new Error(
      `Failed to fetch invoice payments: ${paymentsResult.error.message}`
    );
  }

  const shop = (shopResult.data ?? null) as InvoiceShop | null;

  const items = (itemsResult.data ?? []) as InvoiceItem[];

  const payments = (paymentsResult.data ?? []) as InvoicePayment[];

  // Only confirmed payments reduce the outstanding balance.
  const confirmedAmount = payments.reduce((total, payment) => {
    if (payment.status !== "CONFIRMED") {
      return total;
    }

    return total + Number(payment.amount);
  }, 0);

  const invoiceTotal = Number(invoice.total);

  const outstandingBalance = Math.max(
    0,
    invoiceTotal - confirmedAmount
  );

  return {
    ...invoice,
    shop,
    items,
    payments,
    confirmedAmount,
    outstandingBalance,
  };
}