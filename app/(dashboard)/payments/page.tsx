import { Suspense } from "react";
import Link from "next/link";
import { CreditCard } from "lucide-react";

import { requireSuperAdmin } from "@/lib/auth/require-super-admin";
import { getPayments } from "@/lib/services/payment-list.service";
import { PaymentStatusBadge } from "@/components/widgets/billing/payment-status-badge";
import { ConfirmPaymentButton } from "@/components/widgets/billing/confirm-payment-button";
import { connection } from "next/server";
import ModulesPageHeader from "@/components/widgets/dashboard/modules-page-header";

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

async function PaymentsContent() {
  await connection();
  await requireSuperAdmin();

  const payments = await getPayments();

  return (
    <div className="space-y-6">
      {payments.length === 0 ? (
        <div className="rounded-lg border p-10 text-center">
          <CreditCard className="mx-auto mb-3 size-8 text-muted-foreground" />
          <h2 className="font-medium">No payments recorded</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Payments will appear here when they are recorded against invoices.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="p-3 font-medium">Payment</th>
                <th className="p-3 font-medium">Shop</th>
                <th className="p-3 font-medium">Invoice</th>
                <th className="p-3 font-medium">Amount</th>
                <th className="p-3 font-medium">Reference</th>
                <th className="p-3 font-medium">Payment date</th>
                <th className="p-3 font-medium">Status</th>
                <th className="p-3 font-medium">Action</th>
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

                return (
                  <tr key={payment.id}>
                    <td className="p-3 font-mono text-xs">
                      {payment.id.slice(0, 8)}
                    </td>

                    <td className="p-3">
                      <div className="font-medium">
                        {shop?.name ?? "Unknown shop"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {shop?.shop_code ?? "—"}
                      </div>
                    </td>

                    <td className="p-3">{invoice?.invoice_number ?? "—"}</td>

                    <td className="p-3 font-medium">
                      {formatCurrency(payment.amount)}
                    </td>

                    <td className="p-3">
                      {payment.transaction_reference ?? "—"}
                    </td>

                    <td className="p-3">{formatDate(payment.payment_date)}</td>

                    <td className="p-3">
                      <PaymentStatusBadge status={payment.status} />
                    </td>

                    <td className="p-3">
                      {payment.status === "PENDING" ? (
                        <ConfirmPaymentButton paymentId={payment.id} />
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          No action
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function PaymentsPage() {
  return (
    <div className="space-y-6">
      <main>
        <ModulesPageHeader
          title="Manage Payments"
          subtitle="Review bank transfers and manage payment confirmations"
        />
      </main>

      <Suspense fallback={<div className="rounded-xl border p-8 text-sm text-muted-foreground">Loading payments...</div>}>
        <PaymentsContent />
      </Suspense>
    </div>
  );
}
