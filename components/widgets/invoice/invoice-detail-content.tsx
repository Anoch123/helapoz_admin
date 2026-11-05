import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { ArrowLeft } from "lucide-react";

import { requireSuperAdmin } from "@/lib/auth/require-super-admin";
import { getInvoiceById } from "@/lib/services/invoice.service";
import { RecordPaymentForm } from "@/components/forms/record-payment-form";
import {
  OPEN_STATUSES,
  StatusPill,
  formatCurrency,
  formatDate,
  formatStatus,
} from "./invoice-ui";

/**
 * Server component — fetches and renders a single invoice.
 * Save as: components/widgets/billing/invoice-details-content.tsx
 */

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

function HeroStat({
  label,
  value,
  hint,
  tone = "",
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: string;
}) {
  return (
    <div className="p-5 sm:px-6">
      <p className="text-xs text-indigo-100/80">{label}</p>
      <p className={`mt-1 text-xl font-semibold tabular-nums ${tone}`}>
        {value}
      </p>
      {hint && <p className="mt-0.5 text-xs text-indigo-100/70">{hint}</p>}
    </div>
  );
}

export default async function InvoiceDetailsContent({
  invoiceId,
}: {
  invoiceId: string;
}) {
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
    outstanding > 0 && OPEN_STATUSES.includes(invoice.status);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <Link
        href="/invoices"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Invoices
      </Link>

      {/* -------------------------------- Hero -------------------------------- */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-600 to-violet-700 text-white shadow-lg">
        <div className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-white/10 blur-2xl" />

        <div className="relative space-y-6 p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-sm font-medium text-indigo-100">Invoice</p>
              <h1 className="mt-1 font-mono text-2xl font-semibold tracking-tight sm:text-3xl">
                {invoice.invoice_number}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-indigo-100">
                <span>{invoice.shop?.name ?? "Unknown shop"}</span>
                <span className="rounded-md bg-white/15 px-2 py-0.5 font-mono text-xs">
                  {invoice.shop?.shop_code ?? "—"}
                </span>
              </div>
            </div>

            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-sm font-medium capitalize ring-1 ring-inset ring-white/25">
              <span className="size-1.5 rounded-full bg-current" />
              {formatStatus(invoice.status.toLowerCase())}
            </span>
          </div>

          <div>
            <div className="flex items-end justify-between text-sm">
              <span className="text-indigo-100">
                {formatCurrency(confirmed)} of {formatCurrency(total)} paid
              </span>
              <span className="font-semibold tabular-nums">
                {Math.round(paidPercent)}%
              </span>
            </div>

            <div
              className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-white/20"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(paidPercent)}
            >
              <div
                className="h-full rounded-full bg-emerald-400 transition-all"
                style={{ width: `${paidPercent}%` }}
              />
            </div>
          </div>
        </div>

        <div className="relative grid divide-white/15 border-t border-white/15 sm:grid-cols-2 sm:divide-x lg:grid-cols-4">
          <HeroStat label="Invoice total" value={formatCurrency(total)} />
          <HeroStat label="Confirmed" value={formatCurrency(confirmed)} />
          <HeroStat
            label="Outstanding"
            value={formatCurrency(outstanding)}
            hint={outstanding > 0 ? "Awaiting payment" : "Fully settled"}
          />
          <HeroStat
            label="Due date"
            value={formatDate(invoice.due_at)}
            hint={isPastDue ? "Past due" : undefined}
            tone={isPastDue ? "text-amber-200" : ""}
          />
        </div>
      </section>

      {/* -------------------------------- Body -------------------------------- */}
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          {/* Items */}
          <section className="overflow-hidden rounded-3xl border bg-card">
            <div className="border-b p-5 sm:px-6">
              <h2 className="font-semibold">Invoice items</h2>
            </div>

            {invoice.items.length === 0 ? (
              <p className="px-6 py-12 text-center text-sm text-muted-foreground">
                No invoice items found.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/40 text-left text-xs text-muted-foreground">
                      <th className="px-6 py-3 font-medium">Description</th>
                      <th className="px-4 py-3 text-right font-medium">Qty</th>
                      <th className="px-4 py-3 text-right font-medium">
                        Unit price
                      </th>
                      <th className="px-6 py-3 text-right font-medium">Total</th>
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

            <dl className="ml-auto w-full space-y-2 border-t bg-muted/30 p-5 text-sm sm:w-80 sm:px-6">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd className="tabular-nums">{formatCurrency(invoice.subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Discount</dt>
                <dd className="tabular-nums">{formatCurrency(invoice.discount)}</dd>
              </div>
              <div className="flex justify-between border-t pt-3 text-base font-semibold">
                <dt>Total</dt>
                <dd className="tabular-nums">{formatCurrency(invoice.total)}</dd>
              </div>
            </dl>
          </section>

          {/* Payments */}
          <section className="overflow-hidden rounded-3xl border bg-card">
            <div className="flex items-center justify-between border-b p-5 sm:px-6">
              <h2 className="font-semibold">Payment history</h2>
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
                      <tr className="border-b bg-muted/40 text-left text-xs text-muted-foreground">
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
                          className="transition-colors hover:bg-muted/30"
                        >
                          <td className="px-6 py-4 text-muted-foreground">
                            {formatDate(payment.payment_date)}
                          </td>
                          <td className="px-4 py-4 font-mono text-[13px]">
                            {payment.transaction_reference ?? "—"}
                          </td>
                          <td className="px-4 py-4 capitalize text-muted-foreground">
                            {formatStatus(payment.payment_method.toLowerCase())}
                          </td>
                          <td className="px-4 py-4 text-right font-semibold tabular-nums">
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
                            {formatStatus(payment.payment_method.toLowerCase())}
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
        <aside className="space-y-6 lg:sticky lg:top-4">
          {canRecordPayment && (
            <section className="rounded-3xl border border-indigo-500/30 bg-indigo-500/[0.04] p-5 sm:p-6">
              <h2 className="font-semibold">Record a bank transfer</h2>
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

          <section className="rounded-3xl border bg-card">
            <div className="border-b p-5 sm:px-6">
              <h2 className="font-semibold">Details</h2>
            </div>

            <dl className="divide-y px-5 sm:px-6">
              <DetailRow label="Invoice number">
                <span className="font-mono normal-case">
                  {invoice.invoice_number}
                </span>
              </DetailRow>
              <DetailRow label="Type">
                {formatStatus(invoice.invoice_type.toLowerCase())}
              </DetailRow>
              <DetailRow label="Issued">{formatDate(invoice.issued_at)}</DetailRow>
              <DetailRow label="Paid">{formatDate(invoice.paid_at)}</DetailRow>
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
            </dl>
          </section>
        </aside>
      </div>
    </div>
  );
}