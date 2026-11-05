import { CreditCard, Clock, Receipt } from "lucide-react";
import { connection } from "next/server";

import { requireSuperAdmin } from "@/lib/auth/require-super-admin";
import { getPayments } from "@/lib/services/payment-list.service";
import { PaymentStatusBadge } from "@/components/widgets/billing/payment-status-badge";
import { ConfirmPaymentButton } from "@/components/widgets/billing/confirm-payment-button";

/**
 * Server component — fetches and renders the payments list.
 * Save as: components/widgets/billing/payments-content.tsx
 */

function formatCurrency(amount: number | string) {
  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: 2,
  }).format(Number(amount));
}

function formatDate(value: string | null) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("en-LK", {
    dateStyle: "medium",
    timeZone: "Asia/Colombo",
  }).format(new Date(value));
}

export default async function PaymentsContent() {
  await connection();
  await requireSuperAdmin();

  const payments = await getPayments();

  if (payments.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-3xl border border-dashed p-14 text-center">
        <div className="rounded-2xl bg-indigo-500/10 p-4 text-indigo-600">
          <CreditCard className="size-7" />
        </div>
        <h2 className="mt-4 font-semibold">No payments recorded</h2>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          Payments appear here once they are recorded against invoices.
        </p>
      </div>
    );
  }

  const pending = payments.filter((p) => p.status === "PENDING");
  const pendingAmount = pending.reduce((sum, p) => sum + Number(p.amount), 0);
  const totalAmount = payments.reduce((sum, p) => sum + Number(p.amount), 0);

  return (
    <div className="space-y-6">
      {/* ------------------------------ Summary ------------------------------ */}
      <div className="grid gap-4 lg:grid-cols-5">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-600 to-violet-700 p-6 text-white shadow-lg lg:col-span-3 lg:p-8">
          <div className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-white/10 blur-2xl" />
          <div className="relative">
            <p className="text-sm font-medium text-indigo-100">
              Total payment value
            </p>
            <p className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">
              {formatCurrency(totalAmount)}
            </p>
            <p className="mt-2 text-sm text-indigo-100/80">
              Across {payments.length}{" "}
              {payments.length === 1 ? "payment" : "payments"}
            </p>
          </div>
        </div>

        <div className="grid gap-4 lg:col-span-2">
          <div className="flex items-center gap-4 rounded-2xl border bg-card p-5">
            <div className="rounded-xl bg-amber-500/10 p-3 text-amber-600">
              <Clock className="size-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-muted-foreground">Awaiting confirmation</p>
              <p className="text-2xl font-semibold tabular-nums tracking-tight">
                {pending.length}
              </p>
            </div>
            <p className="text-right text-sm font-medium tabular-nums">
              {formatCurrency(pendingAmount)}
            </p>
          </div>

          <div className="flex items-center gap-4 rounded-2xl border bg-card p-5">
            <div className="rounded-xl bg-emerald-500/10 p-3 text-emerald-600">
              <Receipt className="size-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-muted-foreground">Reviewed</p>
              <p className="text-2xl font-semibold tabular-nums tracking-tight">
                {payments.length - pending.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------- Table ------------------------------- */}
      <div className="overflow-hidden rounded-3xl border bg-card">
        <div className="border-b p-5">
          <h2 className="font-semibold">All payments</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Pending bank transfers are highlighted
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40 text-left text-xs text-muted-foreground">
                <th className="px-5 py-3 font-medium">Shop</th>
                <th className="px-5 py-3 font-medium">Invoice</th>
                <th className="px-5 py-3 text-right font-medium">Amount</th>
                <th className="px-5 py-3 font-medium">Reference</th>
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 text-right font-medium">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {payments.map((payment) => {
                const shop = Array.isArray(payment.shop)
                  ? payment.shop[0]
                  : payment.shop;

                const invoice = Array.isArray(payment.invoice)
                  ? payment.invoice[0]
                  : payment.invoice;

                const isPending = payment.status === "PENDING";
                const shopName = shop?.name ?? "Unknown shop";

                return (
                  <tr
                    key={payment.id}
                    className={`transition-colors hover:bg-muted/30 ${
                      isPending ? "bg-amber-500/[0.04]" : ""
                    }`}
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-sm font-semibold text-indigo-600">
                          {shopName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium leading-tight">{shopName}</p>
                          <p className="text-xs text-muted-foreground">
                            {shop?.shop_code ?? "—"}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      {invoice?.invoice_number ?? "—"}
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-right font-semibold tabular-nums">
                      {formatCurrency(payment.amount)}
                    </td>

                    <td className="px-5 py-4">
                      <p>{payment.transaction_reference ?? "—"}</p>
                      <p className="font-mono text-xs text-muted-foreground">
                        #{payment.id.slice(0, 8)}
                      </p>
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-muted-foreground">
                      {formatDate(payment.payment_date)}
                    </td>

                    <td className="px-5 py-4">
                      <PaymentStatusBadge status={payment.status} />
                    </td>

                    <td className="px-5 py-4 text-right">
                      {isPending ? (
                        <ConfirmPaymentButton paymentId={payment.id} />
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}