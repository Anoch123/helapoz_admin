import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";

import { requireSuperAdmin } from "@/lib/auth/require-super-admin";
import { getInvoiceById } from "@/lib/services/invoice.service";
import { connection } from "next/server";

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

/* -------------------------------------------------------------------------- */
/* Invoice details                                                            */
/* -------------------------------------------------------------------------- */

async function InvoiceDetailsContent({
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

  return (
    <div className="space-y-6">
      {/* Header */}

      <div>
        <Link
          href="/dashboard/invoices"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to invoices
        </Link>

        <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">
              {invoice.invoice_number}
            </h1>

            <p className="text-sm text-muted-foreground">
              {invoice.shop?.name ?? "Unknown shop"} (
              {invoice.shop?.shop_code ?? "—"})
            </p>
          </div>

          <span className="rounded-full bg-muted px-3 py-1.5 text-sm">
            {formatStatus(invoice.status)}
          </span>
        </div>
      </div>

      {/* Summary cards */}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Invoice total</p>

          <p className="mt-2 text-xl font-semibold">
            {formatCurrency(invoice.total)}
          </p>
        </div>

        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">
            Confirmed payments
          </p>

          <p className="mt-2 text-xl font-semibold">
            {formatCurrency(invoice.confirmedAmount)}
          </p>
        </div>

        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">
            Outstanding balance
          </p>

          <p className="mt-2 text-xl font-semibold">
            {formatCurrency(invoice.outstandingBalance)}
          </p>
        </div>

        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Due date</p>

          <p className="mt-2 text-xl font-semibold">
            {formatDate(invoice.due_at)}
          </p>
        </div>
      </div>

      {/* Invoice information */}

      <section className="rounded-lg border">
        <div className="border-b p-4">
          <h2 className="font-semibold">Invoice information</h2>
        </div>

        <div className="grid gap-4 p-4 sm:grid-cols-2">
          <div>
            <p className="text-sm text-muted-foreground">Invoice number</p>
            <p className="font-medium">{invoice.invoice_number}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Invoice type</p>
            <p className="font-medium">
              {formatStatus(invoice.invoice_type)}
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Issued date</p>
            <p className="font-medium">{formatDate(invoice.issued_at)}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Paid date</p>
            <p className="font-medium">{formatDate(invoice.paid_at)}</p>
          </div>

          {invoice.billing_period_start && (
            <div>
              <p className="text-sm text-muted-foreground">
                Billing period start
              </p>
              <p className="font-medium">
                {formatDate(invoice.billing_period_start)}
              </p>
            </div>
          )}

          {invoice.billing_period_end && (
            <div>
              <p className="text-sm text-muted-foreground">
                Billing period end
              </p>
              <p className="font-medium">
                {formatDate(invoice.billing_period_end)}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Invoice items */}

      <section className="rounded-lg border">
        <div className="border-b p-4">
          <h2 className="font-semibold">Invoice items</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Description</th>
                <th className="px-4 py-3 font-medium">Quantity</th>
                <th className="px-4 py-3 font-medium">Unit price</th>
                <th className="px-4 py-3 font-medium">Total</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {invoice.items.map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-3">
                    {item.description}
                  </td>

                  <td className="px-4 py-3">
                    {item.quantity}
                  </td>

                  <td className="px-4 py-3">
                    {formatCurrency(item.unit_price)}
                  </td>

                  <td className="px-4 py-3">
                    {formatCurrency(item.line_total)}
                  </td>
                </tr>
              ))}

              {invoice.items.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-8 text-center text-muted-foreground"
                  >
                    No invoice items found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="space-y-2 border-t p-4 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatCurrency(invoice.subtotal)}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-muted-foreground">Discount</span>
            <span>{formatCurrency(invoice.discount)}</span>
          </div>

          <div className="flex justify-between border-t pt-3 font-semibold">
            <span>Total</span>
            <span>{formatCurrency(invoice.total)}</span>
          </div>
        </div>
      </section>

      {/* Payment history */}

      <section className="rounded-lg border">
        <div className="border-b p-4">
          <h2 className="font-semibold">Payment history</h2>
        </div>

        {invoice.payments.length === 0 ? (
          <p className="p-4 text-sm text-muted-foreground">
            No payments have been recorded for this invoice.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium">Payment date</th>
                  <th className="px-4 py-3 font-medium">Reference</th>
                  <th className="px-4 py-3 font-medium">Method</th>
                  <th className="px-4 py-3 font-medium">Amount</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {invoice.payments.map((payment) => (
                  <tr key={payment.id}>
                    <td className="px-4 py-3">
                      {formatDate(payment.payment_date)}
                    </td>

                    <td className="px-4 py-3">
                      {payment.transaction_reference ?? "—"}
                    </td>

                    <td className="px-4 py-3">
                      {formatStatus(payment.payment_method)}
                    </td>

                    <td className="px-4 py-3">
                      {formatCurrency(payment.amount)}
                    </td>

                    <td className="px-4 py-3">
                      <span className="rounded-full bg-muted px-2.5 py-1 text-xs">
                        {formatStatus(payment.status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Record payment placeholder */}

      {invoice.outstandingBalance > 0 &&
        ["PENDING", "PARTIALLY_PAID", "OVERDUE"].includes(invoice.status) && (
          <section className="rounded-lg border p-4">
            <h2 className="font-semibold">Record a bank transfer</h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Outstanding balance:{" "}
              <span className="font-medium text-foreground">
                {formatCurrency(invoice.outstandingBalance)}
              </span>
            </p>

            <p className="mt-2 text-sm text-muted-foreground">
              The payment recording form will be added here next.
            </p>
          </section>
        )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Page                                                                       */
/* -------------------------------------------------------------------------- */

export default function InvoiceDetailsPage({
  params,
}: {
  params: Promise<{ invoiceId: string }>;
}) {
  return (
    <Suspense fallback={<div>Loading invoice...</div>}>
      {params.then(({ invoiceId }) => (
        <InvoiceDetailsContent invoiceId={invoiceId} />
      ))}
    </Suspense>
  );
}