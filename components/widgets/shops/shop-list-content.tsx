import Link from "next/link";
import { ChevronRight, MapPin, Receipt, Store } from "lucide-react";

import { getShops } from "@/lib/services/shop.service";

/**
 * Server component — fetches and renders the shop list.
 * Save as: components/widgets/shops/shop-list-content.tsx
 */

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-LK", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

const statusStyles: Record<string, { pill: string; dot: string }> = {
  ACTIVE: {
    pill: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    dot: "bg-emerald-500",
  },
  PROVISIONING: {
    pill: "bg-sky-500/10 text-sky-700 dark:text-sky-300",
    dot: "bg-sky-500",
  },
  SUSPENDED: {
    pill: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
    dot: "bg-amber-500",
  },
  ARCHIVED: {
    pill: "bg-slate-500/10 text-slate-600 dark:text-slate-300",
    dot: "bg-slate-400",
  },
};

function StatusBadge({ status }: { status: string }) {
  const s = statusStyles[status] ?? {
    pill: "bg-muted text-muted-foreground",
    dot: "bg-slate-400",
  };
  const label = status.charAt(0) + status.slice(1).toLowerCase();

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${s.pill}`}
    >
      <span className={`size-1.5 rounded-full ${s.dot}`} />
      {label}
    </span>
  );
}

export default async function ShopListContent() {
  const shops = await getShops();

  if (shops.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-3xl border border-dashed p-14 text-center">
        <div className="rounded-2xl bg-indigo-500/10 p-4 text-indigo-600">
          <Store className="size-7" />
        </div>
        <h2 className="mt-4 font-semibold">No shops registered yet</h2>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          Create your first shop to get started.
        </p>
      </div>
    );
  }

  const active = shops.filter((s) => s.status === "ACTIVE").length;
  const provisioning = shops.filter((s) => s.status === "PROVISIONING").length;
  const suspended = shops.filter((s) => s.status === "SUSPENDED").length;

  return (
    <div className="space-y-6">
      {/* ------------------------------ Summary ------------------------------ */}
      <div className="grid gap-4 lg:grid-cols-5">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-600 to-violet-700 p-6 text-white shadow-lg lg:col-span-2 lg:p-8">
          <div className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-white/10 blur-2xl" />
          <div className="relative">
            <p className="text-sm font-medium text-indigo-100">
              Registered shops
            </p>
            <p className="mt-2 text-4xl font-semibold tabular-nums tracking-tight sm:text-5xl">
              {shops.length}
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3 lg:col-span-3">
          {[
            { label: "Active", value: active, dot: "bg-emerald-500" },
            { label: "Provisioning", value: provisioning, dot: "bg-sky-500" },
            { label: "Suspended", value: suspended, dot: "bg-amber-500" },
          ].map((s) => (
            <div
              key={s.label}
              className="flex flex-col justify-between rounded-2xl border bg-card p-5"
            >
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className={`size-2 rounded-full ${s.dot}`} />
                {s.label}
              </p>
              <p className="mt-3 text-3xl font-semibold tabular-nums tracking-tight">
                {s.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ------------------------------- Table ------------------------------- */}
      <div className="overflow-hidden rounded-3xl border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40 text-left text-xs text-muted-foreground">
                <th className="px-5 py-3 font-medium">Shop</th>
                <th className="px-5 py-3 font-medium">Contact</th>
                <th className="px-5 py-3 font-medium">Location</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Pending Invoices</th>
                <th className="px-5 py-3 font-medium">Created</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>

            <tbody className="divide-y">
              {shops.map((shop) => (
                <tr
                  key={shop.id}
                  className="transition-colors hover:bg-muted/30"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-sm font-semibold text-indigo-600">
                        {shop.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium leading-tight">{shop.name}</p>
                        <p className="font-mono text-xs text-muted-foreground">
                          {shop.shop_code}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <p>{shop.contact_email}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {shop.contact_phone}
                    </p>
                  </td>

                  <td className="px-5 py-4">
                    <p className="inline-flex items-center gap-1.5">
                      <MapPin className="size-3.5 text-muted-foreground" />
                      {shop.city}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {shop.district || "—"}
                    </p>
                  </td>

                  <td className="px-5 py-4">
                    <StatusBadge status={shop.status} />
                  </td>

                  <td className="px-5 py-4">
                    {shop.pendingInvoiceCount > 0 ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-600 ring-1 ring-inset ring-amber-500/20 dark:text-amber-400">
                        <Receipt className="size-3.5" />
                        {shop.pendingInvoiceCount} pending
                        </span>
                    ) : (
                        <span className="text-sm text-muted-foreground">
                        No pending invoices
                        </span>
                    )}
                  </td>

                  <td className="whitespace-nowrap px-5 py-4 text-muted-foreground">
                    {formatDate(shop.created_at)}
                  </td>

                  <td className="px-5 py-4 text-right">
                    <Link
                      href={`/manage-shops/${shop.id}`}
                      className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm font-medium text-indigo-600 transition hover:bg-indigo-500/10"
                    >
                      View
                      <ChevronRight className="size-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}