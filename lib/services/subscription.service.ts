import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

export async function getSubscriptions() {
  const supabase = createAdminClient();

  const { data: subscriptions, error } = await supabase
    .from("shop_subscriptions")
    .select(`
      id,
      shop_id,
      plan_id,
      status,
      current_period_start,
      current_period_end,
      next_billing_date,
      grace_period_days,
      suspended_at,
      created_at
    `)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch subscriptions: ${error.message}`);
  }

  if (!subscriptions?.length) return [];

  const shopIds = [...new Set(subscriptions.map((item) => item.shop_id))];
  const planIds = [...new Set(subscriptions.map((item) => item.plan_id))];
  const subscriptionIds = subscriptions.map((item) => item.id);

  const [shopsResult, plansResult, invoicesResult] = await Promise.all([
    supabase
      .from("shops")
      .select("id, shop_code, name, status")
      .in("id", shopIds),

    supabase
      .from("subscription_plans")
      .select("id, name, plan_code, monthly_price, currency")
      .in("id", planIds),

    supabase
      .from("invoices")
      .select("id, subscription_id, invoice_number, total, status, due_at")
      .in("subscription_id", subscriptionIds)
      .eq("invoice_type", "SUBSCRIPTION")
      .in("status", ["PENDING", "PARTIALLY_PAID", "OVERDUE"]),
  ]);

  if (shopsResult.error) {
    throw new Error(`Failed to fetch shops: ${shopsResult.error.message}`);
  }

  if (plansResult.error) {
    throw new Error(`Failed to fetch subscription plans: ${plansResult.error.message}`);
  }

  if (invoicesResult.error) {
    throw new Error(`Failed to fetch subscription invoices: ${invoicesResult.error.message}`);
  }

  const outstandingInvoices = invoicesResult.data ?? [];
  const invoiceIds = outstandingInvoices.map((invoice) => invoice.id);

  const paymentsResult = invoiceIds.length
    ? await supabase
        .from("payments")
        .select("invoice_id, amount, status")
        .in("invoice_id", invoiceIds)
    : { data: [], error: null };

  if (paymentsResult.error) {
    throw new Error(`Failed to fetch invoice payments: ${paymentsResult.error.message}`);
  }

  const shopMap = new Map(
    (shopsResult.data ?? []).map((shop) => [shop.id, shop])
  );

  const planMap = new Map(
    (plansResult.data ?? []).map((plan) => [plan.id, plan])
  );

  const paymentsByInvoice = new Map<string, number>();

  for (const payment of paymentsResult.data ?? []) {
    if (payment.status !== "CONFIRMED") continue;

    const current = paymentsByInvoice.get(payment.invoice_id) ?? 0;

    paymentsByInvoice.set(
      payment.invoice_id,
      current + Number(payment.amount)
    );
  }

  const outstandingBySubscription = new Map<string, number>();

  for (const invoice of outstandingInvoices) {
    const confirmedAmount = paymentsByInvoice.get(invoice.id) ?? 0;
    const balance = Math.max(0, Number(invoice.total) - confirmedAmount);

    const current =
      outstandingBySubscription.get(invoice.subscription_id) ?? 0;

    outstandingBySubscription.set(
      invoice.subscription_id,
      current + balance
    );
  }

  return subscriptions.map((subscription) => ({
    ...subscription,
    shop: shopMap.get(subscription.shop_id) ?? null,
    plan: planMap.get(subscription.plan_id) ?? null,
    outstandingBalance:
      outstandingBySubscription.get(subscription.id) ?? 0,
  }));
}

export async function getSubscriptionById(subscriptionId: string) {
  const supabase = createAdminClient();

  const subscriptions = await getSubscriptions();

  const subscription = subscriptions.find(
    (item) => item.id === subscriptionId
  );

  if (!subscription) return null;

  const { data: invoices, error } = await supabase
    .from("invoices")
    .select("id, invoice_number, invoice_type, status, total, issued_at, due_at, paid_at")
    .eq("subscription_id", subscriptionId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch subscription invoices: ${error.message}`);
  }

  return {
    ...subscription,
    invoices: invoices ?? [],
  };
}