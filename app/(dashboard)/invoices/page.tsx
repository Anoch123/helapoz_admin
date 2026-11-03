import Link from "next/link";
import { Suspense } from "react";

import { requireSuperAdmin } from "@/lib/auth/require-super-admin";
import { getInvoices } from "@/lib/services/invoice.service";
import { connection } from "next/server";

function formatCurrency(value: number | string) {
  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: 2,
  }).format(Number(value));
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-LK", {
    dateStyle: "medium",
    timeZone: "Asia/Colombo",
  }).format(new Date(value));
}

async function InvoicesContent() {
  await connection();
  await requireSuperAdmin();

  const invoices = await getInvoices();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Invoices</h1>
        <p className="text-sm text-muted-foreground">
          View and manage shop invoices and subscription payments.
        </p>
      </div>

      <div className="overflow-hidden rounded-lg border">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Invoice</th>
                <th className="px-4 py-3 font-medium">Shop</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">Due date</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {invoices.map((invoice) => (
                <tr key={invoice.id}>
                  <td className="px-4 py-3 font-medium">
                    {invoice.invoice_number}
                  </td>

                  <td className="px-4 py-3">
                    {invoice.shop?.name ?? "Unknown shop"}
                    <div className="text-xs text-muted-foreground">
                      {invoice.shop?.shop_code ?? ""}
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    {invoice.invoice_type.replaceAll("_", " ")}
                  </td>

                  <td className="px-4 py-3">
                    {formatCurrency(invoice.total)}
                  </td>

                  <td className="px-4 py-3">
                    {formatDate(invoice.due_at)}
                  </td>

                  <td className="px-4 py-3">
                    <span className="rounded-full bg-muted px-2.5 py-1 text-xs">
                      {invoice.status.replaceAll("_", " ")}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    <Link
                      href={`/invoices/${invoice.id}`}
                      className="font-medium text-primary hover:underline"
                    >
                      View invoice
                    </Link>
                  </td>
                </tr>
              ))}

              {invoices.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-10 text-center text-muted-foreground"
                  >
                    No invoices found.
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

export default function InvoicesPage() {
  return (
    <Suspense fallback={<div>Loading invoices...</div>}>
      <InvoicesContent />
    </Suspense>
  );
}