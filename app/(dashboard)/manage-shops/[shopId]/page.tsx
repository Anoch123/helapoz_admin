import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  Mail,
  MapPin,
  Pencil,
  Phone,
  ShieldCheck,
  UserPlus,
  UserRound,
} from "lucide-react";

import { ShopStatusActions } from "@/components/widgets/shops/shop-status-actions";
import { getShopById } from "@/lib/services/shop.service";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShopStatusBadge } from "@/components/widgets/shops/shop-status-badge";
import { MembershipStatusBadge } from "@/components/widgets/shops/membership-status-badge";
import { requireSuperAdmin } from "@/lib/auth/require-super-admin";
import { Button } from "@/components/ui/button";
import { ShopUserStatusActions } from "@/components/widgets/shops/shop-user-status-actions";

function formatDate(date: string | null) {
  if (!date) return "Never";

  return new Intl.DateTimeFormat("en-LK", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

function DetailItem({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div className="space-y-1">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="font-medium">{value || "—"}</p>
    </div>
  );
}

function AccountCard({
  account,
  shopId,
}: {
  shopId: string;
  account: {
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
}) {
  const isAdmin = account.role === "SHOP_ADMIN";

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
              <UserRound className="size-5" />
            </div>

            <div>
              <CardTitle className="text-base">
                {isAdmin ? "Shop Admin" : "Shop User"}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {account.display_name}
              </p>
            </div>
          </div>

          <MembershipStatusBadge status={account.status} />

          {!isAdmin && (
            <ShopUserStatusActions
              shopId={shopId}
              membershipId={account.id}
              currentStatus={account.status}
              displayName={account.display_name}
            />
          )}

          <Button variant="outline" size="sm">
            <Link
              href={`/manage-shops/${shopId}/users/${account.id}/permissions`}
            >
              <ShieldCheck className="mr-2 size-4" />
              Permissions
            </Link>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="grid gap-5 sm:grid-cols-2">
        <DetailItem label="Full Name" value={account.display_name} />
        <DetailItem label="Email Address" value={account.email} />
        <DetailItem label="Phone Number" value={account.phone} />
        <DetailItem
          label="Email Confirmation"
          value={account.emailConfirmedAt ? "Confirmed" : "Not confirmed"}
        />
        <DetailItem
          label="Account Created"
          value={formatDate(account.created_at)}
        />
        <DetailItem
          label="Last Sign In"
          value={formatDate(account.lastSignInAt)}
        />
      </CardContent>
    </Card>
  );
}

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

  return (
    <div className="space-y-6 p-4">
      {/* Shop heading */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <Link
            href="/manage-shops"
            className="-ml-3 inline-flex h-9 items-center justify-center rounded-md px-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <ArrowLeft className="mr-2 size-4" />
            Back to Shops
          </Link>

          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-semibold tracking-tight">
                {shop.name}
              </h1>

              <ShopStatusBadge status={shop.status} />
            </div>

            <p className="mt-1 text-sm text-muted-foreground">
              Shop Code: <span className="font-medium">{shop.shop_code}</span>
            </p>
          </div>

          <Link
            href={`/manage-shops/${shop.id}/edit`}
            className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-3 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <Pencil className="mr-2 size-4" />
            Edit Shop
          </Link>

          <ShopStatusActions shopId={shop.id} currentStatus={shop.status} />
        </div>
      </div>

      {/* Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <div className="rounded-lg bg-muted p-3">
              <Building2 className="size-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Shop Status</p>
              <p className="font-semibold">{shop.status}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <div className="rounded-lg bg-muted p-3">
              <UserRound className="size-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Shop Accounts</p>
              <p className="font-semibold">{shop.accounts.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <div className="rounded-lg bg-muted p-3">
              <CalendarDays className="size-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Registered On</p>
              <p className="font-semibold">{formatDate(shop.created_at)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Business information */}
      <Card>
        <CardHeader>
          <CardTitle>Business Information</CardTitle>
        </CardHeader>

        <CardContent className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <DetailItem label="Shop Name" value={shop.name} />
          <DetailItem label="Legal Name" value={shop.legal_name} />
          <DetailItem
            label="Registration Number"
            value={shop.business_registration_no}
          />

          <DetailItem label="Contact Email" value={shop.contact_email} />
          <DetailItem label="Contact Phone" value={shop.contact_phone} />
          <DetailItem label="Shop Code" value={shop.shop_code} />

          <div className="space-y-1 sm:col-span-2 lg:col-span-3">
            <p className="text-sm text-muted-foreground">Business Address</p>
            <p className="flex items-start gap-2 font-medium">
              <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              {address || "No address provided"}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Shop Admin */}
      <section className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold">Shop Administrator</h2>
          <p className="text-sm text-muted-foreground">
            The primary administrator for this shop.
          </p>
        </div>

        {adminAccount ? (
          <AccountCard account={adminAccount} shopId={shop.id} />
        ) : (
          <Card>
            <CardContent className="py-6 text-sm text-muted-foreground">
              No Shop Admin membership found.
            </CardContent>
          </Card>
        )}
      </section>

      {/* Shop Users */}
      <section className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold">Shop Users</h2>
          <p className="text-sm text-muted-foreground">
            Staff accounts belonging to this shop.
          </p>
        </div>

        <Button>
          <Link href={`/manage-shops/${shop.id}/users/create`}>
            <UserPlus className="mr-2 size-4" />
            Add Shop User
          </Link>
        </Button>

        {userAccounts.length > 0 ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {userAccounts.map((account) => (
              <AccountCard
                key={account.id}
                account={account}
                shopId={shop.id}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-6 text-sm text-muted-foreground">
              No Shop Users found.
            </CardContent>
          </Card>
        )}
      </section>

      {/* System timestamps */}
      <Card>
        <CardHeader>
          <CardTitle>System Information</CardTitle>
        </CardHeader>

        <CardContent className="grid gap-5 sm:grid-cols-2">
          <DetailItem label="Created At" value={formatDate(shop.created_at)} />
          <DetailItem
            label="Last Updated"
            value={formatDate(shop.updated_at)}
          />
        </CardContent>
      </Card>
    </div>
  );
}

export default function ShopDetailsPage({
  params,
}: {
  params: Promise<{ shopId: string }>;
}) {
  return (
    <Suspense fallback={<div>Loading shop details...</div>}>
      <ShopDetailsContent params={params} />
    </Suspense>
  );
}
