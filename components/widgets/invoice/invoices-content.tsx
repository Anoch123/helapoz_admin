import Link from "next/link";
import { AlertTriangle, ChevronRight, FileText, Receipt } from "lucide-react";
import { connection } from "next/server";

import { requireSuperAdmin } from "@/lib/auth/require-super-admin";
import { getInvoices } from "@/lib/services/invoice.service";
import { formatCurrency, formatDate, formatStatus, OPEN_STATUSES, StatusPill } from "./invoice-ui";

/**
 * Server component — fetches and renders the invoices list.
 * Save as: components/widgets/billing/invoices-content.tsx
 */
export default async function InvoicesContent() {
  await connection();
  await requireSuperAdmin();

  const invoices = await getInvoices();

  if (invoices.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-3xl border border-dashed p-14 text-center">
        <div className="rounded-2xl bg-indigo-500/10 p-4 text-indigo-600">
          <FileText className="size-7" />
        </div>
        <h2 className="mt-4 font-semibold">No invoices found</h2>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          Invoices appear here once they are generated for shops.
        </p>
      </div>
    );
  }

  const totalValue = invoices.reduce((s, i) => s + Number(i.total ?? 0), 0);
  const open = invoices.filter((i) => OPEN_STATUSES.includes(i.status));
  const overdue = invoices.filter((i) => i.status === "OVERDUE");

  return (
    <div className="space-y-6">
      {/* ------------------------------ Summary ------------------------------ */}
      <div className="grid gap-4 lg:grid-cols-5">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-600 to-violet-700 p-6 text-white shadow-lg lg:col-span-3 lg:p-8">
          <div className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-white/10 blur-2xl" />
          <div className="relative">
            <p className="text-sm font-medium text-indigo-100">
              Total invoiced
            </p>
            <p className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">
              {formatCurrency(totalValue)}
            </p>
            <p className="mt-2 text-sm text-indigo-100/80">
              Across {invoices.length}{" "}
              {invoices.length === 1 ? "invoice" : "invoices"}
            </p>
          </div>
        </div>

        <div className="grid gap-4 lg:col-span-2">
          <div className="flex items-center gap-4 rounded-2xl border bg-card p-5">
            <div className="rounded-xl bg-amber-500/10 p-3 text-amber-600">
              <Receipt className="size-5" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Open invoices</p>
              <p className="text-2xl font-semibold tabular-nums tracking-tight">
                {open.length}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-2xl border bg-card p-5">
            <div className="rounded-xl bg-red-500/10 p-3 text-red-600">
              <AlertTriangle className="size-5" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Overdue</p>
              <p className="text-2xl font-semibold tabular-nums tracking-tight">
                {overdue.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------- Table ------------------------------- */}
      <div className="overflow-hidden rounded-3xl border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40 text-left text-xs text-muted-foreground">
                <th className="px-5 py-3 font-medium">Invoice</th>
                <th className="px-5 py-3 font-medium">Shop</th>
                <th className="px-5 py-3 text-right font-medium">Amount</th>
                <th className="px-5 py-3 font-medium">Due</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>

            <tbody className="divide-y">
              {invoices.map((invoice) => {
                const shopName = invoice.shop?.name ?? "Unknown shop";
                return (
                  <tr
                    key={invoice.id}
                    className="transition-colors hover:bg-muted/30"
                  >
                    <td className="px-5 py-4">
                      <p className="font-mono text-[13px] font-medium">
                        {invoice.invoice_number}
                      </p>
                      <p className="mt-0.5 text-xs capitalize text-muted-foreground">
                        {formatStatus(invoice.invoice_type.toLowerCase())}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-sm font-semibold text-indigo-600">
                          {shopName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium leading-tight">{shopName}</p>
                          <p className="text-xs text-muted-foreground">
                            {invoice.shop?.shop_code ?? ""}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-right font-semibold tabular-nums">
                      {formatCurrency(invoice.total)}
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-muted-foreground">
                      {formatDate(invoice.due_at)}
                    </td>

                    <td className="px-5 py-4">
                      <StatusPill status={invoice.status} />
                    </td>

                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/invoices/${invoice.id}`}
                        className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm font-medium text-indigo-600 transition hover:bg-indigo-500/10"
                      >
                        View
                        <ChevronRight className="size-4" />
                      </Link>
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