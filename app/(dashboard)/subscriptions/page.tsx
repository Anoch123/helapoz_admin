import Link from "next/link";
import { Suspense } from "react";

import { requireSuperAdmin } from "@/lib/auth/require-super-admin";
import { getSubscriptions } from "@/lib/services/subscription.service";
import { SubscriptionStatusBadge } from "@/components/widgets/billing/subscription-status-badge";
import { connection } from "next/server";
import ModulesPageHeader from "@/components/widgets/dashboard/modules-page-header";

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

async function SubscriptionsContent() {
  await connection();
  await requireSuperAdmin();

  const subscriptions = await getSubscriptions();

  const counts = {
    total: subscriptions.length,
    active: subscriptions.filter((item) => item.status === "ACTIVE").length,
    pending: subscriptions.filter((item) => item.status === "PENDING_PAYMENT")
      .length,
    pastDue: subscriptions.filter((item) => item.status === "PAST_DUE").length,
    suspended: subscriptions.filter((item) => item.status === "SUSPENDED")
      .length,
  };

  return (
    <div className="space-y-6">

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Total</p>
          <p className="mt-2 text-2xl font-semibold">{counts.total}</p>
        </div>

        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Active</p>
          <p className="mt-2 text-2xl font-semibold">{counts.active}</p>
        </div>

        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Awaiting payment</p>
          <p className="mt-2 text-2xl font-semibold">{counts.pending}</p>
        </div>

        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Past due</p>
          <p className="mt-2 text-2xl font-semibold">{counts.pastDue}</p>
        </div>

        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Suspended</p>
          <p className="mt-2 text-2xl font-semibold">{counts.suspended}</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Shop</th>
                <th className="px-4 py-3 font-medium">Plan</th>
                <th className="px-4 py-3 font-medium">Monthly price</th>
                <th className="px-4 py-3 font-medium">Period ends</th>
                <th className="px-4 py-3 font-medium">Next billing</th>
                <th className="px-4 py-3 font-medium">Outstanding</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {subscriptions.map((subscription) => (
                <tr key={subscription.id}>
                  <td className="px-4 py-3">
                    <p className="font-medium">
                      {subscription.shop?.name ?? "Unknown shop"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {subscription.shop?.shop_code ?? "—"}
                    </p>
                  </td>

                  <td className="px-4 py-3">
                    {subscription.plan?.name ?? "Unknown plan"}
                  </td>

                  <td className="px-4 py-3">
                    {formatCurrency(
                      subscription.plan?.monthly_price ?? 0,
                      subscription.plan?.currency ?? "LKR",
                    )}
                  </td>

                  <td className="px-4 py-3">
                    {formatDate(subscription.current_period_end)}
                  </td>

                  <td className="px-4 py-3">
                    {formatDate(subscription.next_billing_date)}
                  </td>

                  <td className="px-4 py-3 font-medium">
                    {formatCurrency(
                      subscription.outstandingBalance,
                      subscription.plan?.currency ?? "LKR",
                    )}
                  </td>

                  <td className="px-4 py-3">
                    <SubscriptionStatusBadge status={subscription.status} />
                  </td>

                  <td className="px-4 py-3">
                    <Link
                      href={`/subscriptions/${subscription.id}`}
                      className="font-medium text-primary hover:underline"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}

              {subscriptions.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-10 text-center text-muted-foreground"
                  >
                    No subscriptions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function SubscriptionsPage() {
  return (
    <div className="space-y-6">
      <main>
        <ModulesPageHeader
          title="Subscriptions"
          subtitle="Review and manage customer subscriptions"
        />
      </main>

      <Suspense fallback={<div className="rounded-xl border p-8 text-sm text-muted-foreground">Loading subscriptions...</div>}>
        <SubscriptionsContent />
      </Suspense>
    </div>
  );
}
