import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import {
  ArrowLeft,
  BadgeCheck,
  Building2,
  CalendarDays,
  CircleAlert,
  Clock,
  Mail,
  MapPin,
  Pencil,
  Phone,
  ShieldCheck,
  UserPlus,
  Users,
} from "lucide-react";

import { ShopStatusActions } from "@/components/widgets/shops/shop-status-actions";
import { ShopStatusBadge } from "@/components/widgets/shops/shop-status-badge";
import { MembershipStatusBadge } from "@/components/widgets/shops/membership-status-badge";
import { ShopUserStatusActions } from "@/components/widgets/shops/shop-user-status-actions";
import { getShopById } from "@/lib/services/shop.service";
import { requireSuperAdmin } from "@/lib/auth/require-super-admin";

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function formatDateTime(date: string | null) {
  if (!date) return "Never";

  return new Intl.DateTimeFormat("en-LK", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Colombo",
  }).format(new Date(date));
}

function formatDate(date: string | null) {
  if (!date) return "—";

  return new Intl.DateTimeFormat("en-LK", {
    dateStyle: "medium",
    timeZone: "Asia/Colombo",
  }).format(new Date(date));
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

const outlineButton =
  "inline-flex h-9 items-center justify-center gap-2 rounded-md border border-input bg-background px-3 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground";

const primaryButton =
  "inline-flex h-9 items-center justify-center gap-2 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90";

function SectionHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 bg-background p-5">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
        <Icon className="size-5" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <div className="truncate font-semibold">{children}</div>
      </div>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div className="flex items-start justify-between gap-6 py-3 text-sm">
      <dt className="flex shrink-0 items-center gap-2 text-muted-foreground">
        {Icon && <Icon className="size-4" />}
        {label}
      </dt>
      <dd className="break-words text-right font-medium">{value || "—"}</dd>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Account card                                                               */
/* -------------------------------------------------------------------------- */

type Account = {
  id: string;
  user_id: string;
  display_name: string;
  phone: string | null;
  email: string | null;
  role: string;
  status: string;
  emailConfirmedAt: string | null;
  lastSignInAt: string | null;
  created_at: string;
};

function AccountCard({
  account,
  shopId,
}: {
  account: Account;
  shopId: string;
}) {
  const isAdmin = account.role === "SHOP_ADMIN";

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border">
      <div className="flex items-start gap-4 p-5">
        <div
          className={`flex size-12 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
            isAdmin
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-foreground"
          }`}
        >
          {initials(account.display_name) || "?"}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate font-semibold">{account.display_name}</h3>
            <MembershipStatusBadge status={account.status} />
          </div>
          <p className="mt-0.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {isAdmin ? "Shop Admin" : "Shop User"}
          </p>
        </div>
      </div>

      <dl className="divide-y border-t px-5">
        <InfoRow icon={Mail} label="Email" value={account.email} />
        <InfoRow icon={Phone} label="Phone" value={account.phone} />
        <div className="flex items-center justify-between gap-6 py-3 text-sm">
          <dt className="flex items-center gap-2 text-muted-foreground">
            <BadgeCheck className="size-4" />
            Email status
          </dt>
          <dd>
            {account.emailConfirmedAt ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-600 ring-1 ring-inset ring-emerald-500/20 dark:text-emerald-400">
                Confirmed
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-600 ring-1 ring-inset ring-amber-500/20 dark:text-amber-400">
                <CircleAlert className="size-3" />
                Not confirmed
              </span>
            )}
          </dd>
        </div>
        <InfoRow
          icon={Clock}
          label="Last sign in"
          value={formatDateTime(account.lastSignInAt)}
        />
        <InfoRow
          icon={CalendarDays}
          label="Created"
          value={formatDateTime(account.created_at)}
        />
      </dl>

      <div className="mt-auto flex flex-wrap items-center gap-2 border-t bg-muted/30 p-4">
        <Link
          href={`/manage-shops/${shopId}/users/${account.id}/permissions`}
          className={outlineButton}
        >
          <ShieldCheck className="size-4" />
          Permissions
        </Link>

        {!isAdmin && (
          <ShopUserStatusActions
            shopId={shopId}
            membershipId={account.id}
            currentStatus={account.status}
            displayName={account.display_name}
          />
        )}
      </div>
    </div>
  );
}

function EmptyCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed px-6 py-10 text-center text-sm text-muted-foreground">
      {children}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Page content                                                               */
/* -------------------------------------------------------------------------- */

async function ShopDetailsContent({
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
    <div className="mx-auto w-full max-w-7xl space-y-8 p-4">
      {/* Back */}
      <Link
        href="/manage-shops"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" />
        Shops
      </Link>

      {/* Hero */}
      <section className="overflow-hidden rounded-2xl border bg-muted/30">
        <div className="flex flex-wrap items-start justify-between gap-6 p-6 sm:p-8">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-xl font-semibold text-primary-foreground">
              {shop.name.charAt(0).toUpperCase()}
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="truncate text-2xl font-semibold tracking-tight sm:text-3xl">
                  {shop.name}
                </h1>
                <ShopStatusBadge status={shop.status} />
              </div>

              <div className="mt-1.5 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <span className="rounded-md border bg-background px-2 py-0.5 font-mono text-xs">
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

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/manage-shops/${shop.id}/edit`}
              className={outlineButton}
            >
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
        </div>

        <div className="grid gap-px border-t bg-border sm:grid-cols-2 lg:grid-cols-4">
          <Stat icon={Building2} label="Status">
            <span className="capitalize">
              {shop.status.toLowerCase().replaceAll("_", " ")}
            </span>
          </Stat>
          <Stat icon={Users} label="Accounts">
            {shop.accounts.length}
          </Stat>
          <Stat icon={UserPlus} label="Seats available">
            {seats.available} of {seats.totalPurchased}
          </Stat>
          <Stat icon={CalendarDays} label="Registered">
            {formatDate(shop.created_at)}
          </Stat>
        </div>
      </section>

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        {/* Main column */}
        <div className="space-y-10">
          {/* Admin */}
          <section className="space-y-4">
            <SectionHeader
              title="Shop administrator"
              description="The primary administrator for this shop."
            />

            {adminAccount ? (
              <AccountCard account={adminAccount} shopId={shop.id} />
            ) : (
              <EmptyCard>No Shop Admin membership found.</EmptyCard>
            )}
          </section>

          {/* Users */}
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
                    className={`${primaryButton} cursor-not-allowed opacity-50 hover:bg-primary`}
                  >
                    <UserPlus className="size-4" />
                    Add shop user (0 available)
                  </span>
                )
              }
            />

            {shop.seatSummary.available === 0 && (
              <p className="text-sm text-red-500">
                No additional user seats are available. Purchase a seat before
                creating another Shop User.
              </p>
            )}

            {userAccounts.length > 0 ? (
              <div className="grid gap-4 xl:grid-cols-2">
                {userAccounts.map((account) => (
                  <AccountCard
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

        {/* Sidebar */}
        <aside className="space-y-6 lg:sticky lg:top-6">
          {/* Seats */}
          <section className="rounded-2xl border">
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
                  className="text-sm font-medium text-primary hover:underline"
                >
                  Buy more →
                </Link>
              </div>

              <div className="flex h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-primary"
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
                <li className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <span className="size-2.5 rounded-full bg-primary" />
                    Assigned
                  </span>
                  <span className="font-medium tabular-nums">
                    {seats.assigned}
                  </span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <span className="size-2.5 rounded-full bg-emerald-500" />
                    Available
                  </span>
                  <span className="font-medium tabular-nums">
                    {seats.available}
                  </span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <span className="size-2.5 rounded-full bg-red-500/70" />
                    Revoked
                  </span>
                  <span className="font-medium tabular-nums">
                    {seats.revoked}
                  </span>
                </li>
              </ul>
            </div>
          </section>

          {/* Business info */}
          <section className="rounded-2xl border">
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

            <div className="flex items-start gap-3 border-t bg-muted/30 p-5 text-sm">
              <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Business address
                </p>
                <p className="mt-1 font-medium">
                  {address || "No address provided"}
                </p>
              </div>
            </div>
          </section>

          {/* System */}
          <section className="rounded-2xl border">
            <div className="border-b p-5">
              <h2 className="font-semibold">System information</h2>
            </div>
            <dl className="divide-y px-5">
              <InfoRow
                label="Created"
                value={formatDateTime(shop.created_at)}
              />
              <InfoRow
                label="Last updated"
                value={formatDateTime(shop.updated_at)}
              />
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
    <div className="mx-auto w-full max-w-7xl space-y-8 p-4" aria-busy>
      <div className="h-4 w-20 animate-pulse rounded bg-muted" />
      <div className="h-56 animate-pulse rounded-2xl bg-muted/60" />
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="h-96 animate-pulse rounded-2xl bg-muted/60" />
        <div className="h-96 animate-pulse rounded-2xl bg-muted/60" />
      </div>
    </div>
  );
}

export default function ShopDetailsPage({
  params,
}: {
  params: Promise<{ shopId: string }>;
}) {
  return (
    <Suspense fallback={<LoadingState />}>
      <ShopDetailsContent params={params} />
    </Suspense>
  );
}
