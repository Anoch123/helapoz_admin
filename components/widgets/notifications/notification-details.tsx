"use client";

import Link from "next/link";
import {
  ArrowLeft,
  CheckCheck,
  Clock,
  Globe,
  RefreshCw,
  Store,
  Users,
} from "lucide-react";

import { useNotificationDetails } from "@/hooks/use-notification-details";
import { CategoryBadge, humanize, StatusBadge } from "./notification-badge";

type Props = {
  notificationId: string;
};

function formatDate(value: string | null) {
  if (!value) return null;
  return new Intl.DateTimeFormat("en-LK", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-muted ${className}`} />;
}

function Meta({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="mt-1 text-sm font-medium">{children}</div>
    </div>
  );
}

export default function NotificationDetails({ notificationId }: Props) {
  const { notification, isLoading, error, refresh } =
    useNotificationDetails(notificationId);

  if (isLoading) {
    return (
      <div className="space-y-6 p-4">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-56 w-full rounded-3xl" />
        <Skeleton className="h-40 w-full rounded-3xl" />
        <Skeleton className="h-72 w-full rounded-3xl" />
      </div>
    );
  }

  if (error || !notification) {
    return (
      <div className="p-4">
        <div className="rounded-3xl border bg-card p-8 text-center">
          <p className="text-lg font-semibold">Unable to load notification</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {error || "Notification not found."}
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <button
              onClick={() => void refresh()}
              className="h-10 rounded-xl bg-indigo-600 px-5 text-sm font-medium text-white transition hover:bg-indigo-700"
            >
              Try again
            </button>
            <Link
              href="/notifications"
              className="inline-flex h-10 items-center rounded-xl border px-5 text-sm font-medium transition hover:bg-muted"
            >
              Back to notifications
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const total = notification.recipientCount;
  const readRate = total > 0 ? Math.round((notification.readCount / total) * 100) : 0;

  return (
    <div className="space-y-6 p-4">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/notifications"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Notifications
        </Link>

        <button
          onClick={() => void refresh()}
          aria-label="Refresh"
          className="inline-flex size-10 items-center justify-center rounded-xl border transition hover:bg-muted"
        >
          <RefreshCw className="size-4" />
        </button>
      </div>

      {/* Message */}
      <div className="rounded-3xl border bg-card p-6 lg:p-8">
        <div className="flex flex-wrap items-center gap-2">
          <CategoryBadge category={notification.category} />
          <StatusBadge status={notification.status} />
        </div>

        <h2 className="mt-4 text-2xl font-semibold tracking-tight">
          {notification.title}
        </h2>

        <p className="mt-3 max-w-prose whitespace-pre-wrap text-sm leading-7 text-muted-foreground">
          {notification.message}
        </p>

        <div className="mt-8 grid gap-5 border-t pt-6 sm:grid-cols-2 lg:grid-cols-4">
          <Meta label="Audience">
            {notification.audienceType === "ALL_SHOPS" ? (
              <span className="inline-flex items-center gap-2">
                <Globe className="size-4 text-muted-foreground" />
                All active shops
              </span>
            ) : (
              <span className="inline-flex items-center gap-2">
                <Store className="size-4 text-muted-foreground" />
                {notification.targetShopName || "Specific shop"}
              </span>
            )}
            {notification.targetShopCode && (
              <p className="mt-0.5 text-xs font-normal text-muted-foreground">
                {notification.targetShopCode}
              </p>
            )}
          </Meta>

          <Meta label="Recipient role">{humanize(notification.recipientRole)}</Meta>
          <Meta label="Created">{formatDate(notification.createdAt) ?? "—"}</Meta>
          <Meta label="Sent">{formatDate(notification.sentAt) ?? "Not sent"}</Meta>
        </div>
      </div>

      {/* Engagement */}
      <div className="rounded-3xl border bg-card p-6 lg:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:gap-12">
          <div className="lg:w-56">
            <p className="text-sm text-muted-foreground">Read rate</p>
            <p className="mt-1 text-5xl font-semibold tabular-nums tracking-tight">
              {readRate}
              <span className="text-2xl text-muted-foreground">%</span>
            </p>
          </div>

          <div className="flex-1 space-y-5">
            <div className="flex h-3 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all"
                style={{ width: `${readRate}%` }}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {[
                {
                  label: "Recipients",
                  value: notification.recipientCount,
                  icon: Users,
                  tint: "bg-indigo-500/10 text-indigo-600",
                },
                {
                  label: "Read",
                  value: notification.readCount,
                  icon: CheckCheck,
                  tint: "bg-emerald-500/10 text-emerald-600",
                },
                {
                  label: "Unread",
                  value: notification.unreadCount,
                  icon: Clock,
                  tint: "bg-amber-500/10 text-amber-600",
                },
              ].map((s) => {
                const Icon = s.icon;
                return (
                  <div key={s.label} className="flex items-center gap-3">
                    <div className={`rounded-xl p-2.5 ${s.tint}`}>
                      <Icon className="size-5" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{s.label}</p>
                      <p className="text-xl font-semibold tabular-nums">
                        {s.value}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Recipients */}
      <div className="overflow-hidden rounded-3xl border bg-card">
        <div className="border-b p-5">
          <h3 className="font-semibold">Recipients</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Shops and accounts that received this notification
          </p>
        </div>

        {notification.recipients.length === 0 ? (
          <div className="p-12 text-center text-sm text-muted-foreground">
            No recipients found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40 text-left text-xs text-muted-foreground">
                  <th className="px-5 py-3 font-medium">Shop</th>
                  <th className="px-5 py-3 font-medium">Account</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Delivered</th>
                  <th className="px-5 py-3 font-medium">Read</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {notification.recipients.map((r) => (
                  <tr key={r.id} className="transition-colors hover:bg-muted/30">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-xs font-semibold text-indigo-600">
                          {r.shopName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium leading-tight">{r.shopName}</p>
                          <p className="text-xs text-muted-foreground">
                            {r.shopCode}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <p>{r.displayName}</p>
                      <p className="text-xs text-muted-foreground">
                        {humanize(r.membershipRole)}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <StatusBadge status={r.status} />
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-muted-foreground">
                      {formatDate(r.deliveredAt) ?? "—"}
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-muted-foreground">
                      {formatDate(r.readAt) ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}