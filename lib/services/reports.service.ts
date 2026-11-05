
import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

type InvoiceType =
  | "SUBSCRIPTION"
  | "ADDITIONAL_USERS"
  | "ADJUSTMENT";

type RevenuePayment = {
  amount: number | string;
  confirmed_at: string;
  invoice: {
    invoice_type: InvoiceType;
  } | {
    invoice_type: InvoiceType;
  }[];
};

function getMonthKey(date: string) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Colombo",
    year: "numeric",
    month: "2-digit",
  }).format(new Date(date));
}

function getMonthLabel(month: string) {
  const [year, monthNumber] = month.split("-").map(Number);

  return new Intl.DateTimeFormat("en-LK", {
    month: "short",
    year: "numeric",
    timeZone: "Asia/Colombo",
  }).format(new Date(Date.UTC(year, monthNumber - 1, 1)));
}

function getColomboDateStart(date: string) {
  return new Date(`${date}T00:00:00+05:30`).toISOString();
}

function getNextDate(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  const next = new Date(Date.UTC(year, month - 1, day + 1));

  return [
    next.getUTCFullYear(),
    String(next.getUTCMonth() + 1).padStart(2, "0"),
    String(next.getUTCDate()).padStart(2, "0"),
  ].join("-");
}

export async function getReports(startDate: string, endDate: string) {
  const supabase = createAdminClient();

  const start = getColomboDateStart(startDate);
  const end = getColomboDateStart(getNextDate(endDate));

  const [
    activeShopsResult,
    totalShopsResult,
    activeSubscriptionsResult,
    pendingPaymentsResult,
    confirmedPaymentsResult,
    shopsGrowthResult,
    subscriptionStatusesResult,
  ] = await Promise.all([
    supabase
      .from("shops")
      .select("id", { count: "exact", head: true })
      .eq("status", "ACTIVE"),

    supabase
      .from("shops")
      .select("id", { count: "exact", head: true }),

    supabase
      .from("shop_subscriptions")
      .select("id", { count: "exact", head: true })
      .eq("status", "ACTIVE"),

    supabase
      .from("payments")
      .select("id", { count: "exact", head: true })
      .eq("status", "PENDING"),

    supabase
      .from("payments")
      .select(`
        amount,
        confirmed_at,
        invoice:invoices!inner(invoice_type)
      `)
      .eq("status", "CONFIRMED")
      .gte("confirmed_at", start)
      .lt("confirmed_at", end)
      .order("confirmed_at", { ascending: true }),

    supabase
      .from("shops")
      .select("created_at")
      .gte("created_at", start)
      .lt("created_at", end)
      .order("created_at", { ascending: true }),

    supabase
      .from("shop_subscriptions")
      .select("status"),
  ]);

  const results = [
    activeShopsResult,
    totalShopsResult,
    activeSubscriptionsResult,
    pendingPaymentsResult,
    confirmedPaymentsResult,
    shopsGrowthResult,
    subscriptionStatusesResult,
  ];

  const failedQuery = results.find((result) => result.error);

  if (failedQuery?.error) {
    throw new Error(`Unable to generate reports: ${failedQuery.error.message}`);
  }

  const payments = (confirmedPaymentsResult.data ?? []) as unknown as RevenuePayment[];

  let subscriptionRevenue = 0;
  let additionalSeatRevenue = 0;
  let adjustmentRevenue = 0;

  const monthlyRevenue = new Map<string, {
    subscription: number;
    additionalSeats: number;
    adjustment: number;
    total: number;
  }>();

  for (const payment of payments) {
    const amount = Number(payment.amount);
    const invoice = Array.isArray(payment.invoice)
      ? payment.invoice[0]
      : payment.invoice;

    if (!invoice) continue;

    const month = getMonthKey(payment.confirmed_at);

    const current = monthlyRevenue.get(month) ?? {
      subscription: 0,
      additionalSeats: 0,
      adjustment: 0,
      total: 0,
    };

    if (invoice.invoice_type === "SUBSCRIPTION") {
      subscriptionRevenue += amount;
      current.subscription += amount;
    } else if (invoice.invoice_type === "ADDITIONAL_USERS") {
      additionalSeatRevenue += amount;
      current.additionalSeats += amount;
    } else if (invoice.invoice_type === "ADJUSTMENT") {
      adjustmentRevenue += amount;
      current.adjustment += amount;
    }

    current.total += amount;
    monthlyRevenue.set(month, current);
  }

  const shopGrowth = new Map<string, number>();

  for (const shop of shopsGrowthResult.data ?? []) {
    const month = getMonthKey(shop.created_at);
    shopGrowth.set(month, (shopGrowth.get(month) ?? 0) + 1);
  }

  const subscriptionStatuses = (subscriptionStatusesResult.data ?? []).reduce(
    (acc, subscription) => {
      const status = subscription.status as string;
      acc[status] = (acc[status] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const months = Array.from(monthlyRevenue.keys()).sort();

  return {
    summary: {
      totalRevenue:
        subscriptionRevenue + additionalSeatRevenue + adjustmentRevenue,
      subscriptionRevenue,
      additionalSeatRevenue,
      adjustmentRevenue,
      activeShops: activeShopsResult.count ?? 0,
      totalShops: totalShopsResult.count ?? 0,
      activeSubscriptions: activeSubscriptionsResult.count ?? 0,
      pendingPayments: pendingPaymentsResult.count ?? 0,
    },

    revenueTrend: months.map((month) => {
      const revenue = monthlyRevenue.get(month)!;

      return {
        month,
        label: getMonthLabel(month),
        ...revenue,
      };
    }),

    shopGrowth: Array.from(shopGrowth.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, count]) => ({
        month,
        label: getMonthLabel(month),
        count,
      })),

    subscriptionStatuses,
  };
}
