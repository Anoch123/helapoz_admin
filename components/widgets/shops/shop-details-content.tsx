import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import {
  ArrowLeft,
  CalendarDays,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Receipt,
  UserPlus,
  Users,
} from "lucide-react";

import { ShopStatusActions } from "@/components/widgets/shops/shop-status-actions";
import { ShopStatusBadge } from "@/components/widgets/shops/shop-status-badge";
import {
  EmptyCard,
  InfoRow,
  SectionHeader,
  formatDate,
  formatDateTime,
  outlineButton,
  primaryButton,
} from "./shop-ui";;
import { getShopById } from "@/lib/services/shop.service";
import { requireSuperAdmin } from "@/lib/auth/require-super-admin";
import ShopAccountCard from "./shop-account-card";

/**
 * Server component — fetches and renders a single shop.
 * Save as: components/widgets/shops/shop-details-content.tsx
 */

function HeroStat({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="p-5 sm:px-6">
      <p className="text-xs text-indigo-100/80">{label}</p>
      <p className="mt-1 text-xl font-semibold tabular-nums capitalize">
        {children}
      </p>
    </div>
  );
}

export default async function ShopDetailsContent({
  params,
}: {
  params: Promise<{ shopId: string }>;
}) {
  await connection();
  await requireSuperAdmin();

  const { shopId } = await params;
  const shop = await getShopById(shopId);

  if (!shop) notFound();

  const adminAccount = shop.accounts.find(
    (account) => account.role === "SHOP_ADMIN",
  );

  const userAccounts = shop.accounts.filter(
    (account) => account.role === "SHOP_USER",
  );

  const address = [
    shop.address_line_1,
    shop.address_line_2,
    shop.city,
    shop.district,
    shop.postal_code,
    shop.country,
  ]
    .filter(Boolean)
    .join(", ");

  const seats = shop.seatSummary;
  const canAddUser = seats.available !== 0;
  const seatTotal = Math.max(seats.totalPurchased, 0);
  const pct = (n: number) =>
    seatTotal > 0 ? Math.min(100, (n / seatTotal) * 100) : 0;

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 p-4">
      <Link
        href="/manage-shops"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Shops
      </Link>

      {/* -------------------------------- Hero -------------------------------- */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-600 to-violet-700 text-white shadow-lg">
        <div className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-white/10 blur-2xl" />

        <div className="relative flex min-w-0 items-center gap-4 p-6 sm:p-8">
          <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-xl font-semibold ring-1 ring-inset ring-white/25">
            {shop.name.charAt(0).toUpperCase()}
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="truncate text-2xl font-semibold tracking-tight sm:text-3xl">
                {shop.name}
              </h1>
              {/* Light chip keeps the status badge readable on the gradient */}
              <span className="rounded-full bg-background p-0.5 text-foreground">
                <ShopStatusBadge status={shop.status} />
              </span>
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-indigo-100">
              <span className="rounded-md bg-white/15 px-2 py-0.5 font-mono text-xs">
                {shop.shop_code}
              </span>
              {shop.legal_name && (
                <>
                  <span aria-hidden>·</span>
                  <span>{shop.legal_name}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="relative grid divide-white/15 border-t border-white/15 sm:grid-cols-2 sm:divide-x lg:grid-cols-4">
          <HeroStat label="Status">
            {shop.status.toLowerCase().replaceAll("_", " ")}
          </HeroStat>
          <HeroStat label="Accounts">{shop.accounts.length}</HeroStat>
          <HeroStat label="Seats available">
            {seats.available} of {seats.totalPurchased}
          </HeroStat>
          <HeroStat label="Registered">{formatDate(shop.created_at)}</HeroStat>
        </div>
      </section>

      {/* ------------------------------- Actions ------------------------------- */}
      <div className="flex flex-wrap items-center gap-2">
        <Link href={`/manage-shops/${shop.id}/edit`} className={outlineButton}>
          <Pencil className="size-4" />
          Edit shop
        </Link>
        <Link
          href={`/manage-shops/${shop.id}/purchase-seats`}
          className={outlineButton}
        >
          <Users className="size-4" />
          Purchase seats
        </Link>
        <ShopStatusActions shopId={shop.id} currentStatus={shop.status} />
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        {/* ------------------------------ Main column ------------------------------ */}
        <div className="space-y-10">
          <section className="space-y-4">
            <SectionHeader
              title="Shop administrator"
              description="The primary administrator for this shop."
            />

            {adminAccount ? (
              <ShopAccountCard account={adminAccount} shopId={shop.id} />
            ) : (
              <EmptyCard>No Shop Admin membership found.</EmptyCard>
            )}
          </section>

          <section className="space-y-4">
            <SectionHeader
              title="Shop users"
              description="Staff accounts belonging to this shop."
              action={
                canAddUser ? (
                  <Link
                    href={`/manage-shops/${shop.id}/users/create`}
                    className={primaryButton}
                  >
                    <UserPlus className="size-4" />
                    Add shop user
                    {typeof seats.available === "number" &&
                      ` (${seats.available} available)`}
                  </Link>
                ) : (
                  <span
                    aria-disabled="true"
                    title="No seats available. Purchase additional seats first."
                    className={`${primaryButton} cursor-not-allowed opacity-50 hover:bg-indigo-600`}
                  >
                    <UserPlus className="size-4" />
                    Add shop user (0 available)
                  </span>
                )
              }
            />

            {seats.available === 0 && (
              <p className="rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                No additional user seats are available. Purchase a seat before
                creating another Shop User.
              </p>
            )}

            {userAccounts.length > 0 ? (
              <div className="grid gap-4 xl:grid-cols-2">
                {userAccounts.map((account) => (
                  <ShopAccountCard
                    key={account.id}
                    account={account}
                    shopId={shop.id}
                  />
                ))}
              </div>
            ) : (
              <EmptyCard>No Shop Users found.</EmptyCard>
            )}
          </section>
        </div>

        {/* -------------------------------- Sidebar -------------------------------- */}
        <aside className="space-y-6 lg:sticky lg:top-4">
          <section className="rounded-3xl border bg-card">
            <div className="border-b p-5">
              <h2 className="font-semibold">Additional user seats</h2>
              <p className="text-sm text-muted-foreground">
                Purchased seats for extra Shop Users.
              </p>
            </div>

            <div className="space-y-5 p-5">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-3xl font-semibold tabular-nums tracking-tight">
                    {seats.totalPurchased}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Total purchased
                  </p>
                </div>
                <Link
                  href={`/manage-shops/${shop.id}/purchase-seats`}
                  className="rounded-lg px-2.5 py-1.5 text-sm font-medium text-indigo-600 transition hover:bg-indigo-500/10"
                >
                  Buy more →
                </Link>
              </div>

              <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-indigo-600"
                  style={{ width: `${pct(seats.assigned)}%` }}
                />
                <div
                  className="h-full bg-emerald-500"
                  style={{ width: `${pct(seats.available)}%` }}
                />
                <div
                  className="h-full bg-red-500/70"
                  style={{ width: `${pct(seats.revoked)}%` }}
                />
              </div>

              <ul className="space-y-2.5 text-sm">
                {[
                  { label: "Assigned", value: seats.assigned, dot: "bg-indigo-600" },
                  { label: "Available", value: seats.available, dot: "bg-emerald-500" },
                  { label: "Revoked", value: seats.revoked, dot: "bg-red-500/70" },
                ].map((s) => (
                  <li key={s.label} className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <span className={`size-2.5 rounded-full ${s.dot}`} />
                      {s.label}
                    </span>
                    <span className="font-medium tabular-nums">{s.value}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section className="rounded-3xl border bg-card">
            <div className="border-b p-5">
              <h2 className="font-semibold">Business information</h2>
            </div>

            <dl className="divide-y px-5">
              <InfoRow label="Shop name" value={shop.name} />
              <InfoRow label="Legal name" value={shop.legal_name} />
              <InfoRow
                label="Registration no."
                value={shop.business_registration_no}
              />
              <InfoRow icon={Mail} label="Email" value={shop.contact_email} />
              <InfoRow icon={Phone} label="Phone" value={shop.contact_phone} />
            </dl>

            <div className="flex items-start gap-3 rounded-b-3xl border-t bg-muted/30 p-5 text-sm">
              <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Business address</p>
                <p className="mt-1 font-medium">
                  {address || "No address provided"}
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border bg-card">
            <div className="border-b p-5">
              <h2 className="flex items-center gap-2 font-semibold">
                <CalendarDays className="size-4 text-muted-foreground" />
                System information
              </h2>
            </div>
            <dl className="divide-y px-5">
              <InfoRow label="Created" value={formatDateTime(shop.created_at)} />
              <InfoRow
                label="Last updated"
                value={formatDateTime(shop.updated_at)}
              />
            </dl>
          </section>
        </aside>
      </div>

      {/* ----------------------------- Pending invoices ----------------------------- */}
      <section className="space-y-4">
        <SectionHeader
          title="Pending invoices"
          description="Invoices awaiting payment from this shop."
        />

        {shop.pendingInvoices.length > 0 ? (
          <div className="overflow-hidden rounded-3xl border bg-card">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40 text-left text-xs text-muted-foreground">
                    <th className="px-5 py-3 font-medium">Invoice</th>
                    <th className="px-5 py-3 font-medium">Type</th>
                    <th className="px-5 py-3 text-right font-medium">Amount</th>
                    <th className="px-5 py-3 font-medium">Issued</th>
                    <th className="px-5 py-3 font-medium">Due</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {shop.pendingInvoices.map((invoice) => (
                    <tr
                      key={invoice.id}
                      className="transition-colors hover:bg-muted/30"
                    >
                      <td className="whitespace-nowrap px-5 py-4 font-mono text-[13px] font-medium">
                        {invoice.invoice_number}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 capitalize text-muted-foreground">
                        {invoice.invoice_type.replaceAll("_", " ").toLowerCase()}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-right font-semibold tabular-nums">
                        {new Intl.NumberFormat("en-LK", {
                          style: "currency",
                          currency: invoice.currency,
                          maximumFractionDigits: 2,
                        }).format(Number(invoice.total))}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-muted-foreground">
                        {formatDate(invoice.issued_at)}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-muted-foreground">
                        {formatDate(invoice.due_at)}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-700 dark:text-amber-300">
                          <span className="size-1.5 rounded-full bg-amber-500" />
                          Pending
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <EmptyCard>
            <div className="flex flex-col items-center gap-2">
              <Receipt className="size-8 text-muted-foreground/50" />
              <p>No pending invoices for this shop.</p>
            </div>
          </EmptyCard>
        )}
      </section>
    </div>
  );
}