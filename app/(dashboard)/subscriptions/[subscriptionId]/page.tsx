import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { connection } from "next/server";

import { requireSuperAdmin } from "@/lib/auth/require-super-admin";
import { getSubscriptionById } from "@/lib/services/subscription.service";
import { SubscriptionStatusBadge } from "@/components/widgets/billing/subscription-status-badge";

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

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

function humanize(value: string) {
  return value.replaceAll("_", " ");
}

const DAY_MS = 1000 * 60 * 60 * 24;

function getCycle(start: string | null, end: string | null) {
  if (!start || !end) return null;

  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  const now = Date.now();

  if (!Number.isFinite(s) || !Number.isFinite(e) || e <= s) return null;

  const progress = Math.min(100, Math.max(0, ((now - s) / (e - s)) * 100));
  const daysLeft = Math.ceil((e - now) / DAY_MS);

  return { progress, daysLeft };
}

type Tone = "success" | "danger" | "warning" | "neutral";

function invoiceTone(status: string): Tone {
  const s = status.toLowerCase();
  if (s === "paid") return "success";
  if (s.includes("overdue") || s.includes("failed") || s.includes("unpaid"))
    return "danger";
  if (s.includes("partial") || s.includes("pending") || s.includes("issued"))
    return "warning";
  return "neutral";
}

const toneStyles: Record<Tone, string> = {
  success:
    "bg-emerald-500/10 text-emerald-600 ring-emerald-500/20 dark:text-emerald-400",
  danger: "bg-red-500/10 text-red-600 ring-red-500/20 dark:text-red-400",
  warning:
    "bg-amber-500/10 text-amber-600 ring-amber-500/20 dark:text-amber-400",
  neutral: "bg-muted text-muted-foreground ring-border",
};

function InvoiceStatusPill({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium capitalize ring-1 ring-inset ${toneStyles[invoiceTone(status)]}`}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {humanize(status)}
    </span>
  );
}

function Stat({
  label,
  value,
  hint,
  emphasis = false,
}: {
  label: string;
  value: string;
  hint?: string;
  emphasis?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1 bg-background p-5">
      <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <span
        className={`font-semibold tabular-nums tracking-tight ${
          emphasis ? "text-3xl" : "text-2xl"
        }`}
      >
        {value}
      </span>
      {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Content                                                                   */
/* -------------------------------------------------------------------------- */

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
  const shopName = subscription.shop?.name ?? "Unknown shop";
  const outstanding = Number(subscription.outstandingBalance ?? 0);
  const cycle = getCycle(
    subscription.current_period_start,
    subscription.current_period_end,
  );

  const invoices = subscription.invoices;
  const paidCount = invoices.filter(
    (i) => invoiceTone(i.status) === "success",
  ).length;
  const overdueCount = invoices.filter(
    (i) => invoiceTone(i.status) === "danger",
  ).length;

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8">
      {/* Back */}
      <Link
        href="/subscriptions"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <svg
          viewBox="0 0 16 16"
          className="size-3.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M10 3 5 8l5 5" />
        </svg>
        Subscriptions
      </Link>

      {/* Hero */}
      <section className="overflow-hidden rounded-2xl border bg-muted/30">
        <div className="flex flex-wrap items-start justify-between gap-6 p-6 sm:p-8">
          <div className="flex items-center gap-4">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-xl font-semibold text-primary-foreground">
              {shopName.charAt(0).toUpperCase()}
            </div>

            <div className="min-w-0">
              <h1 className="truncate text-2xl font-semibold tracking-tight sm:text-3xl">
                {shopName}
              </h1>
              <div className="mt-1.5 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <span className="rounded-md border bg-background px-2 py-0.5 font-mono text-xs">
                  {subscription.shop?.shop_code ?? "—"}
                </span>
                <span aria-hidden>·</span>
                <span>{subscription.plan?.name ?? "Unknown plan"}</span>
              </div>
            </div>
          </div>

          <SubscriptionStatusBadge status={subscription.status} />
        </div>

        <div className="grid gap-px border-t bg-border sm:grid-cols-3">
          <Stat
            label="Outstanding balance"
            value={formatCurrency(outstanding, currency)}
            hint={
              outstanding > 0
                ? `${overdueCount} overdue invoice${overdueCount === 1 ? "" : "s"}`
                : "All settled"
            }
            emphasis
          />
          <Stat
            label="Monthly price"
            value={formatCurrency(subscription.plan?.monthly_price ?? 0, currency)}
            hint={subscription.plan?.name ?? undefined}
          />
          <Stat
            label="Grace period"
            value={`${subscription.grace_period_days} days`}
            hint="Before suspension"
          />
        </div>
      </section>

      {/* Billing cycle */}
      <section className="rounded-2xl border p-6 sm:p-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold">Billing cycle</h2>
            <p className="text-sm text-muted-foreground">
              {cycle
                ? cycle.daysLeft >= 0
                  ? `${cycle.daysLeft} day${cycle.daysLeft === 1 ? "" : "s"} left in this period`
                  : `Period ended ${Math.abs(cycle.daysLeft)} day${Math.abs(cycle.daysLeft) === 1 ? "" : "s"} ago`
                : "No active billing period"}
            </p>
          </div>

          <div className="text-right">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Next billing
            </p>
            <p className="font-semibold">
              {formatDate(subscription.next_billing_date)}
            </p>
          </div>
        </div>

        <div className="mt-6">
          <div
            className="h-2 w-full overflow-hidden rounded-full bg-muted"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(cycle?.progress ?? 0)}
          >
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${cycle?.progress ?? 0}%` }}
            />
          </div>

          <div className="mt-3 flex justify-between text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Starts</p>
              <p className="font-medium">
                {formatDate(subscription.current_period_start)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Ends</p>
              <p className="font-medium">
                {formatDate(subscription.current_period_end)}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Invoices */}
      <section className="overflow-hidden rounded-2xl border">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b p-5 sm:px-6">
          <div>
            <h2 className="text-base font-semibold">Invoices</h2>
            <p className="text-sm text-muted-foreground">
              Everything billed to this subscription.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-medium">
            <span className="rounded-full bg-muted px-2.5 py-1 text-muted-foreground">
              {invoices.length} total
            </span>
            <span
              className={`rounded-full px-2.5 py-1 ring-1 ring-inset ${toneStyles.success}`}
            >
              {paidCount} paid
            </span>
            {overdueCount > 0 && (
              <span
                className={`rounded-full px-2.5 py-1 ring-1 ring-inset ${toneStyles.danger}`}
              >
                {overdueCount} overdue
              </span>
            )}
          </div>
        </div>

        {invoices.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="font-medium">No invoices yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Invoices will appear here once billing runs.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="px-6 py-3 font-medium">Invoice</th>
                    <th className="px-4 py-3 font-medium">Type</th>
                    <th className="px-4 py-3 font-medium">Issued</th>
                    <th className="px-4 py-3 font-medium">Due</th>
                    <th className="px-4 py-3 text-right font-medium">Amount</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-6 py-3" />
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {invoices.map((invoice) => (
                    <tr
                      key={invoice.id}
                      className="transition-colors hover:bg-muted/40"
                    >
                      <td className="px-6 py-4 font-mono text-[13px] font-medium">
                        {invoice.invoice_number}
                      </td>
                      <td className="px-4 py-4 capitalize text-muted-foreground">
                        {humanize(invoice.invoice_type)}
                      </td>
                      <td className="px-4 py-4 text-muted-foreground">
                        {formatDate(invoice.issued_at)}
                      </td>
                      <td className="px-4 py-4 text-muted-foreground">
                        {formatDate(invoice.due_at)}
                      </td>
                      <td className="px-4 py-4 text-right font-medium tabular-nums">
                        {formatCurrency(invoice.total, currency)}
                      </td>
                      <td className="px-4 py-4">
                        <InvoiceStatusPill status={invoice.status} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/invoices/${invoice.id}`}
                          className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
                        >
                          View
                          <span aria-hidden>→</span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <ul className="divide-y md:hidden">
              {invoices.map((invoice) => (
                <li key={invoice.id}>
                  <Link
                    href={`/invoices/${invoice.id}`}
                    className="block space-y-3 p-5 transition-colors active:bg-muted/50"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-mono text-sm font-medium">
                          {invoice.invoice_number}
                        </p>
                        <p className="text-xs capitalize text-muted-foreground">
                          {humanize(invoice.invoice_type)}
                        </p>
                      </div>
                      <InvoiceStatusPill status={invoice.status} />
                    </div>

                    <div className="flex items-end justify-between">
                      <div className="text-xs text-muted-foreground">
                        <p>Issued {formatDate(invoice.issued_at)}</p>
                        <p>Due {formatDate(invoice.due_at)}</p>
                      </div>
                      <p className="text-lg font-semibold tabular-nums">
                        {formatCurrency(invoice.total, currency)}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                      */
/* -------------------------------------------------------------------------- */

function LoadingState() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-8" aria-busy>
      <div className="h-4 w-28 animate-pulse rounded bg-muted" />
      <div className="h-56 animate-pulse rounded-2xl bg-muted/60" />
      <div className="h-40 animate-pulse rounded-2xl bg-muted/60" />
      <div className="h-72 animate-pulse rounded-2xl bg-muted/60" />
    </div>
  );
}

export default function SubscriptionDetailsPage({
  params,
}: {
  params: Promise<{ subscriptionId: string }>;
}) {
  return (
    <Suspense fallback={<LoadingState />}>
      {params.then(({ subscriptionId }) => (
        <SubscriptionDetailsContent subscriptionId={subscriptionId} />
      ))}
    </Suspense>
  );
}