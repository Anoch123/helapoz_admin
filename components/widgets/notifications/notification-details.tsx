"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Bell,
  CheckCheck,
  Clock,
  Loader2,
  RefreshCw,
  Users,
} from "lucide-react";

import { useNotificationDetails } from "@/hooks/use-notification-details";

type Props = {
  notificationId: string;
};

function formatDate(value: string | null) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("en-LK", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getCategoryLabel(category: string) {
  return category.replaceAll("_", " ");
}

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
}) {
  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{label}</p>
        <Icon className="size-5 text-muted-foreground" />
      </div>

      <p className="mt-3 text-2xl font-semibold">{value}</p>
    </div>
  );
}

export default function NotificationDetails({
  notificationId,
}: Props) {
  const {
    notification,
    isLoading,
    error,
    refresh,
  } = useNotificationDetails(notificationId);

  if (isLoading) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !notification) {
    return (
      <div className="rounded-xl border p-6">
        <p className="font-medium">Unable to load notification</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {error || "Notification not found."}
        </p>

        <div className="mt-4 flex gap-3">
          <button
            onClick={() => void refresh()}
            className="rounded-md border px-3 py-2 text-sm"
          >
            Try again
          </button>

          <Link
            href="/notifications"
            className="rounded-md px-3 py-2 text-sm"
          >
            Back to notifications
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/notifications"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to notifications
        </Link>

        <button
          onClick={() => void refresh()}
          className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-muted"
        >
          <RefreshCw className="size-4" />
          Refresh
        </button>
      </div>

      {/* Notification information */}
      <div className="rounded-xl border bg-card p-6">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-muted p-3">
            <Bell className="size-5" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
                {getCategoryLabel(notification.category)}
              </span>

              <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-700">
                {notification.status}
              </span>
            </div>

            <h2 className="mt-3 text-xl font-semibold">
              {notification.title}
            </h2>

            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
              {notification.message}
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 border-t pt-5 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-xs text-muted-foreground">Audience</p>
            <p className="mt-1 text-sm font-medium">
              {notification.audienceType === "ALL_SHOPS"
                ? "All active shops"
                : notification.targetShopName || "Specific shop"}
            </p>
            {notification.targetShopCode && (
              <p className="text-xs text-muted-foreground">
                {notification.targetShopCode}
              </p>
            )}
          </div>

          <div>
            <p className="text-xs text-muted-foreground">Recipient role</p>
            <p className="mt-1 text-sm font-medium">
              {notification.recipientRole.replaceAll("_", " ")}
            </p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground">Created at</p>
            <p className="mt-1 text-sm font-medium">
              {formatDate(notification.createdAt)}
            </p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground">Sent at</p>
            <p className="mt-1 text-sm font-medium">
              {formatDate(notification.sentAt)}
            </p>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Total recipients"
          value={notification.recipientCount}
          icon={Users}
        />

        <StatCard
          label="Read"
          value={notification.readCount}
          icon={CheckCheck}
        />

        <StatCard
          label="Unread"
          value={notification.unreadCount}
          icon={Clock}
        />
      </div>

      {/* Recipients */}
      <div className="overflow-hidden rounded-xl border bg-card">
        <div className="border-b p-5">
          <h3 className="font-semibold">Recipients</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Shops and accounts that received this notification.
          </p>
        </div>

        {notification.recipients.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">
            No recipients found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-left text-muted-foreground">
                <tr>
                  <th className="px-5 py-3 font-medium">Shop</th>
                  <th className="px-5 py-3 font-medium">Account</th>
                  <th className="px-5 py-3 font-medium">Role</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Delivered</th>
                  <th className="px-5 py-3 font-medium">Read at</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {notification.recipients.map((recipient) => (
                  <tr key={recipient.id}>
                    <td className="px-5 py-4">
                      <p className="font-medium">{recipient.shopName}</p>
                      <p className="text-xs text-muted-foreground">
                        {recipient.shopCode}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      {recipient.displayName}
                    </td>

                    <td className="px-5 py-4">
                      {recipient.membershipRole.replaceAll("_", " ")}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={
                          recipient.status === "READ"
                            ? "rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-700"
                            : "rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-700"
                        }
                      >
                        {recipient.status}
                      </span>
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-muted-foreground">
                      {formatDate(recipient.deliveredAt)}
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-muted-foreground">
                      {formatDate(recipient.readAt)}
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