import Link from "next/link";
import {
  BadgeCheck,
  CalendarDays,
  CircleAlert,
  Clock,
  Mail,
  Phone,
  ShieldCheck,
} from "lucide-react";

import { MembershipStatusBadge } from "@/components/widgets/shops/membership-status-badge";
import { ShopUserStatusActions } from "@/components/widgets/shops/shop-user-status-actions";
import {
  InfoRow,
  formatDateTime,
  initials,
  outlineButton,
} from "./shop-ui";;

/**
 * Admin / user account card.
 * Save as: components/widgets/shops/shop-account-card.tsx
 */

export type ShopAccount = {
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

export default function ShopAccountCard({
  account,
  shopId,
}: {
  account: ShopAccount;
  shopId: string;
}) {
  const isAdmin = account.role === "SHOP_ADMIN";

  return (
    <div className="flex flex-col overflow-hidden rounded-3xl border bg-card">
      <div className="flex items-start gap-4 p-5">
        <div
          className={`flex size-12 shrink-0 items-center justify-center rounded-2xl text-sm font-semibold ${
            isAdmin
              ? "bg-indigo-600 text-white"
              : "bg-indigo-500/10 text-indigo-600"
          }`}
        >
          {initials(account.display_name) || "?"}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate font-semibold">{account.display_name}</h3>
            <MembershipStatusBadge status={account.status} />
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {isAdmin ? "Shop admin" : "Shop user"}
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
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300">
                <span className="size-1.5 rounded-full bg-emerald-500" />
                Confirmed
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-700 dark:text-amber-300">
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