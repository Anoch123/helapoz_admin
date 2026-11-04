import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { connection } from "next/server";

import { requireSuperAdmin } from "@/lib/auth/require-super-admin";
import { getInvoiceById } from "@/lib/services/invoice.service";
import { RecordPaymentForm } from "@/components/forms/record-payment-form";

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function formatCurrency(value: number | string) {
  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
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

function formatStatus(value: string) {
  return value.replaceAll("_", " ");
}

type Tone = "success" | "danger" | "warning" | "neutral";

function statusTone(status: string): Tone {
  const s = status.toLowerCase();
  if (s === "paid" || s === "confirmed" || s === "completed") return "success";
  if (s.includes("overdue") || s.includes("fail") || s.includes("reject"))
    return "danger";
  if (s.includes("partial") || s.includes("pending")) return "warning";
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

function StatusPill({
  status,
  size = "sm",
}: {
  status: string;
  size?: "sm" | "md";
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium capitalize ring-1 ring-inset ${
        toneStyles[statusTone(status)]
      } ${size === "md" ? "px-3 py-1.5 text-sm" : "px-2.5 py-1 text-xs"}`}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {formatStatus(status.toLowerCase())}
    </span>
  );
}

function Stat({
  label,
  value,
  hint,
  valueClassName = "",
}: {
  label: string;
  value: string;
  hint?: string;
  valueClassName?: string;
}) {
  return (
    <div className="flex flex-col gap-1 bg-background p-5">
      <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <span
        className={`text-2xl font-semibold tabular-nums tracking-tight ${valueClassName}`}
      >
        {value}
      </span>
      {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
    </div>
  );
}

function DetailRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 text-sm">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium capitalize">{children}</dd>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Invoice details                                                            */
/* -------------------------------------------------------------------------- */

async function InvoiceDetailsContent({ invoiceId }: { invoiceId: string }) {
  await connection();
  await requireSuperAdmin();

  const invoice = await getInvoiceById(invoiceId);

  if (!invoice) {
    notFound();
  }

  const total = Number(invoice.total ?? 0);
  const confirmed = Number(invoice.confirmedAmount ?? 0);
  const outstanding = Number(invoice.outstandingBalance ?? 0);
  const paidPercent =
    total > 0 ? Math.min(100, Math.max(0, (confirmed / total) * 100)) : 0;

  const isPastDue =
    outstanding > 0 && invoice.due_at
      ? new Date(invoice.due_at).getTime() < Date.now()
      : false;

  const canRecordPayment =
    outstanding > 0 &&
    ["PENDING", "PARTIALLY_PAID", "OVERDUE"].includes(invoice.status);

  const hasPeriod = invoice.billing_period_start || invoice.billing_period_end;

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8">
      {/* Back */}
      <Link
        href="/invoices"
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
        Invoices
      </Link>

      {/* Hero */}
      <section className="overflow-hidden rounded-2xl border bg-muted/30">
        <div className="space-y-6 p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Invoice
              </p>
              <h1 className="mt-1 font-mono text-2xl font-semibold tracking-tight sm:text-3xl">
                {invoice.invoice_number}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <span>{invoice.shop?.name ?? "Unknown shop"}</span>
                <span className="rounded-md border bg-background px-2 py-0.5 font-mono text-xs">
                  {invoice.shop?.shop_code ?? "—"}
                </span>
              </div>
            </div>

            <StatusPill status={invoice.status} size="md" />
          </div>

          {/* Payment progress */}
          <div>
            <div className="flex items-end justify-between text-sm">
              <span className="text-muted-foreground">
                {formatCurrency(confirmed)} of {formatCurrency(total)} paid
              </span>
              <span className="font-semibold tabular-nums">
                {Math.round(paidPercent)}%
              </span>
            </div>

            <div
              className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(paidPercent)}
            >
              <div
                className="h-full rounded-full bg-emerald-500 transition-all"
                style={{ width: `${paidPercent}%` }}
              />
            </div>
          </div>
        </div>

        <div className="grid gap-px border-t bg-border sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Invoice total" value={formatCurrency(total)} />
          <Stat
            label="Confirmed"
            value={formatCurrency(confirmed)}
            valueClassName="text-emerald-600 dark:text-emerald-400"
          />
          <Stat
            label="Outstanding"
            value={formatCurrency(outstanding)}
            valueClassName={
              outstanding > 0 ? "text-red-600 dark:text-red-400" : ""
            }
            hint={outstanding > 0 ? "Awaiting payment" : "Fully settled"}
          />
          <Stat
            label="Due date"
            value={formatDate(invoice.due_at)}
            valueClassName={
              isPastDue ? "text-red-600 dark:text-red-400" : ""
            }
            hint={isPastDue ? "Past due" : undefined}
          />
        </div>
      </section>

      {/* Body */}
      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        {/* Main column */}
        <div className="space-y-8">
          {/* Items */}
          <section className="overflow-hidden rounded-2xl border">
            <div className="border-b p-5 sm:px-6">
              <h2 className="text-base font-semibold">Invoice items</h2>
            </div>

            {invoice.items.length === 0 ? (
              <p className="px-6 py-12 text-center text-sm text-muted-foreground">
                No invoice items found.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
                      <th className="px-6 py-3 font-medium">Description</th>
                      <th className="px-4 py-3 text-right font-medium">Qty</th>
                      <th className="px-4 py-3 text-right font-medium">
                        Unit price
                      </th>
                      <th className="px-6 py-3 text-right font-medium">
                        Total
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y">
                    {invoice.items.map((item) => (
                      <tr key={item.id}>
                        <td className="px-6 py-4 font-medium">
                          {item.description}
                        </td>
                        <td className="px-4 py-4 text-right tabular-nums text-muted-foreground">
                          {item.quantity}
                        </td>
                        <td className="px-4 py-4 text-right tabular-nums text-muted-foreground">
                          {formatCurrency(item.unit_price)}
                        </td>
                        <td className="px-6 py-4 text-right font-medium tabular-nums">
                          {formatCurrency(item.line_total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <dl className="ml-auto w-full space-y-2 border-t bg-muted/30 p-5 text-sm sm:w-80 sm:border-l sm:px-6">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd className="tabular-nums">
                  {formatCurrency(invoice.subtotal)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Discount</dt>
                <dd className="tabular-nums">
                  {formatCurrency(invoice.discount)}
                </dd>
              </div>
              <div className="flex justify-between border-t pt-3 text-base font-semibold">
                <dt>Total</dt>
                <dd className="tabular-nums">{formatCurrency(invoice.total)}</dd>
              </div>
            </dl>
          </section>

          {/* Payments */}
          <section className="overflow-hidden rounded-2xl border">
            <div className="flex items-center justify-between border-b p-5 sm:px-6">
              <h2 className="text-base font-semibold">Payment history</h2>
              <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                {invoice.payments.length}
              </span>
            </div>

            {invoice.payments.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <p className="font-medium">No payments yet</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  No payments have been recorded for this invoice.
                </p>
              </div>
            ) : (
              <>
                {/* Desktop */}
                <div className="hidden overflow-x-auto md:block">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
                        <th className="px-6 py-3 font-medium">Date</th>
                        <th className="px-4 py-3 font-medium">Reference</th>
                        <th className="px-4 py-3 font-medium">Method</th>
                        <th className="px-4 py-3 text-right font-medium">
                          Amount
                        </th>
                        <th className="px-6 py-3 font-medium">Status</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y">
                      {invoice.payments.map((payment) => (
                        <tr
                          key={payment.id}
                          className="transition-colors hover:bg-muted/40"
                        >
                          <td className="px-6 py-4 text-muted-foreground">
                            {formatDate(payment.payment_date)}
                          </td>
                          <td className="px-4 py-4 font-mono text-[13px]">
                            {payment.transaction_reference ?? "—"}
                          </td>
                          <td className="px-4 py-4 capitalize text-muted-foreground">
                            {formatStatus(payment.payment_method)}
                          </td>
                          <td className="px-4 py-4 text-right font-medium tabular-nums">
                            {formatCurrency(payment.amount)}
                          </td>
                          <td className="px-6 py-4">
                            <StatusPill status={payment.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile */}
                <ul className="divide-y md:hidden">
                  {invoice.payments.map((payment) => (
                    <li key={payment.id} className="space-y-3 p-5">
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-lg font-semibold tabular-nums">
                          {formatCurrency(payment.amount)}
                        </p>
                        <StatusPill status={payment.status} />
                      </div>
                      <div className="space-y-0.5 text-xs text-muted-foreground">
                        <p>
                          {formatDate(payment.payment_date)} ·{" "}
                          <span className="capitalize">
                            {formatStatus(payment.payment_method)}
                          </span>
                        </p>
                        <p className="font-mono">
                          {payment.transaction_reference ?? "—"}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </section>
        </div>

        {/* Sidebar */}
        <aside className="space-y-8 lg:sticky lg:top-6">
          {canRecordPayment && (
            <section className="rounded-2xl border bg-muted/30 p-5 sm:p-6">
              <h2 className="text-base font-semibold">Record a bank transfer</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Record the payment received from this shop. It stays pending
                until confirmed.
              </p>

              <div className="mt-5">
                <RecordPaymentForm
                  invoiceId={invoice.id}
                  outstandingBalance={invoice.outstandingBalance}
                />
              </div>
            </section>
          )}

          <section className="rounded-2xl border">
            <div className="border-b p-5 sm:px-6">
              <h2 className="text-base font-semibold">Details</h2>
            </div>

            <dl className="divide-y px-5 sm:px-6">
              <DetailRow label="Invoice number">
                <span className="font-mono normal-case">
                  {invoice.invoice_number}
                </span>
              </DetailRow>
              <DetailRow label="Type">
                {formatStatus(invoice.invoice_type)}
              </DetailRow>
              <DetailRow label="Issued">{formatDate(invoice.issued_at)}</DetailRow>
              <DetailRow label="Paid">{formatDate(invoice.paid_at)}</DetailRow>
              {hasPeriod && (
                <>
                  {invoice.billing_period_start && (
                    <DetailRow label="Period start">
                      {formatDate(invoice.billing_period_start)}
                    </DetailRow>
                  )}
                  {invoice.billing_period_end && (
                    <DetailRow label="Period end">
                      {formatDate(invoice.billing_period_end)}
                    </DetailRow>
                  )}
                </>
              )}
            </dl>
          </section>
        </aside>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Page                                                                       */
/* -------------------------------------------------------------------------- */

function LoadingState() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-8" aria-busy>
      <div className="h-4 w-24 animate-pulse rounded bg-muted" />
      <div className="h-64 animate-pulse rounded-2xl bg-muted/60" />
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="h-96 animate-pulse rounded-2xl bg-muted/60" />
        <div className="h-72 animate-pulse rounded-2xl bg-muted/60" />
      </div>
    </div>
  );
}

export default function InvoiceDetailsPage({
  params,
}: {
  params: Promise<{ invoiceId: string }>;
}) {
  return (
    <Suspense fallback={<LoadingState />}>
      {params.then(({ invoiceId }) => (
        <InvoiceDetailsContent invoiceId={invoiceId} />
      ))}
    </Suspense>
  );
}