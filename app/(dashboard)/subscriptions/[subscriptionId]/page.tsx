import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { requireSuperAdmin } from "@/lib/auth/require-super-admin";
import {
  getSubscriptionById,
} from "@/lib/services/subscription.service";
import { SubscriptionStatusBadge } from "@/components/widgets/billing/subscription-status-badge";
import { connection } from "next/server";

function formatCurrency(value: number | string, currency = "LKR") {
  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(Number(value));
}

function formatDate(value: string | null) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("en-LK", {
    dateStyle: "medium",
    timeZone: "Asia/Colombo",
  }).format(new Date(value));
}

async function SubscriptionDetailsContent({
  subscriptionId,
}: {
  subscriptionId: string;
}) {
  await connection();  
  await requireSuperAdmin();

  const subscription = await getSubscriptionById(subscriptionId);

  if (!subscription) notFound();

  const currency = subscription.plan?.currency ?? "LKR";

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/subscriptions"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to subscriptions
        </Link>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">
              {subscription.shop?.name ?? "Unknown shop"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {subscription.shop?.shop_code ?? "—"} ·{" "}
              {subscription.plan?.name ?? "Unknown plan"}
            </p>
          </div>

          <SubscriptionStatusBadge status={subscription.status} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Monthly price</p>
          <p className="mt-2 text-xl font-semibold">
            {formatCurrency(subscription.plan?.monthly_price ?? 0, currency)}
          </p>
        </div>

        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Outstanding balance</p>
          <p className="mt-2 text-xl font-semibold">
            {formatCurrency(subscription.outstandingBalance, currency)}
          </p>
        </div>

        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Grace period</p>
          <p className="mt-2 text-xl font-semibold">
            {subscription.grace_period_days} days
          </p>
        </div>

        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Period starts</p>
          <p className="mt-2 font-semibold">
            {formatDate(subscription.current_period_start)}
          </p>
        </div>

        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Period ends</p>
          <p className="mt-2 font-semibold">
            {formatDate(subscription.current_period_end)}
          </p>
        </div>

        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Next billing date</p>
          <p className="mt-2 font-semibold">
            {formatDate(subscription.next_billing_date)}
          </p>
        </div>
      </div>

      <section className="overflow-hidden rounded-lg border">
        <div className="border-b p-4">
          <h2 className="font-semibold">Subscription invoices</h2>
          <p className="text-sm text-muted-foreground">
            All invoices generated for this subscription.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="px-4 py-3">Invoice</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Issued</th>
                <th className="px-4 py-3">Due</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {subscription.invoices.map((invoice) => (
                <tr key={invoice.id}>
                  <td className="px-4 py-3 font-medium">
                    {invoice.invoice_number}
                  </td>
                  <td className="px-4 py-3">
                    {invoice.invoice_type.replaceAll("_", " ")}
                  </td>
                  <td className="px-4 py-3">
                    {formatCurrency(invoice.total, currency)}
                  </td>
                  <td className="px-4 py-3">
                    {formatDate(invoice.issued_at)}
                  </td>
                  <td className="px-4 py-3">
                    {formatDate(invoice.due_at)}
                  </td>
                  <td className="px-4 py-3">
                    {invoice.status.replaceAll("_", " ")}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/dashboard/invoices/${invoice.id}`}
                      className="font-medium text-primary hover:underline"
                    >
                      View invoice
                    </Link>
                  </td>
                </tr>
              ))}

              {subscription.invoices.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                    No invoices found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default function SubscriptionDetailsPage({
  params,
}: {
  params: Promise<{ subscriptionId: string }>;
}) {
  return (
    <Suspense fallback={<div className="rounded-xl border p-8 text-sm text-muted-foreground">Loading subscription...</div>}>
      {params.then(({ subscriptionId }) => (
        <SubscriptionDetailsContent subscriptionId={subscriptionId} />
      ))}
    </Suspense>
  );
}