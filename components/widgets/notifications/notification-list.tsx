"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Plus, Search, RefreshCw } from "lucide-react";

import { useNotifications } from "@/hooks/use-notifications";

function CategoryBadge({ category }: { category: string }) {
  const styles: Record<string, string> = {
    ANNOUNCEMENT: "bg-blue-100 text-blue-700",
    BILLING: "bg-purple-100 text-purple-700",
    SYSTEM: "bg-orange-100 text-orange-700",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
        styles[category] ?? "bg-muted text-muted-foreground"
      }`}
    >
      {category}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    SENT: "bg-green-100 text-green-700",
    DRAFT: "bg-gray-100 text-gray-600",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
        styles[status] ?? "bg-muted text-muted-foreground"
      }`}
    >
      {status}
    </span>
  );
}

function formatDate(date: string | null) {
  if (!date) return "—";

  return new Intl.DateTimeFormat("en-LK", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export default function NotificationList() {
  const { notifications, pagination, isLoading, error, changePage, refresh } =
    useNotifications();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ALL");

  const filteredNotifications = useMemo(() => {
    return notifications.filter((notification) => {
      const searchMatch =
        notification.title.toLowerCase().includes(search.toLowerCase()) ||
        notification.message.toLowerCase().includes(search.toLowerCase());

      const categoryMatch =
        category === "ALL" || notification.category === category;

      return searchMatch && categoryMatch;
    });
  }, [notifications, search, category]);

  return (
    <div className="space-y-5">
      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border p-5">
          <p className="text-sm text-muted-foreground">Total Notifications</p>
          <p className="mt-2 text-2xl font-semibold">{pagination.total}</p>
        </div>

        <div className="rounded-xl border p-5">
          <p className="text-sm text-muted-foreground">Current Page</p>
          <p className="mt-2 text-2xl font-semibold">
            {pagination.totalPages === 0
              ? "0"
              : `${pagination.page} / ${pagination.totalPages}`}
          </p>
        </div>
      </div>

      {/* Filters and actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search notifications..."
              className="h-10 w-full rounded-lg border bg-background pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring sm:w-64"
            />
          </div>

          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="h-10 rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="ALL">All categories</option>
            <option value="ANNOUNCEMENT">Announcement</option>
            <option value="BILLING">Billing</option>
            <option value="SYSTEM">System</option>
          </select>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => void refresh()}
            disabled={isLoading}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border px-3 text-sm font-medium hover:bg-muted disabled:opacity-50"
          >
            <RefreshCw
              className={`size-4 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </button>

          <Link
            href="/notifications/create"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            <Plus className="size-4" />
            Create Notification
          </Link>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-xl border">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr className="text-left">
                <th className="px-4 py-3 font-medium">Notification</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Audience</th>
                <th className="px-4 py-3 font-medium">Recipients</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Sent At</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-12 text-center text-muted-foreground"
                  >
                    Loading notifications...
                  </td>
                </tr>
              ) : filteredNotifications.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <p className="font-medium">No notifications found</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Try changing your search or category filter.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredNotifications.map((notification) => (
                  <tr key={notification.id} className="hover:bg-muted/30">
                    <td className="max-w-xs px-4 py-4">
                      <p className="font-medium">{notification.title}</p>
                      <p className="mt-1 truncate text-xs text-muted-foreground">
                        {notification.message}
                      </p>
                    </td>

                    <td className="px-4 py-4">
                      <CategoryBadge category={notification.category} />
                    </td>

                    <td className="px-4 py-4">
                      <p className="font-medium">
                        {notification.audienceType === "ALL_SHOPS"
                          ? "All Shops"
                          : "Specific Shop"}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {notification.recipientRole === "ALL"
                          ? "All Members"
                          : notification.recipientRole === "SHOP_ADMIN"
                            ? "Shop Admins"
                            : "Shop Users"}
                      </p>
                    </td>

                    <td className="px-4 py-4">{notification.recipientCount}</td>

                    <td className="px-4 py-4">
                      <StatusBadge status={notification.status} />
                    </td>

                    <td className="whitespace-nowrap px-4 py-4 text-muted-foreground">
                      {formatDate(notification.sentAt)}
                    </td>

                    <td className="px-4 py-4">
                      <Link
                        href={`/notifications/${notification.id}`}
                        className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                      >
                        View details
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {filteredNotifications.length} of {pagination.total}{" "}
          notifications
        </p>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => changePage(pagination.page - 1)}
            disabled={isLoading || pagination.page <= 1}
            className="rounded-lg border px-3 py-2 text-sm hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>

          <span className="px-2 text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages || 1}
          </span>

          <button
            type="button"
            onClick={() => changePage(pagination.page + 1)}
            disabled={isLoading || pagination.page >= pagination.totalPages}
            className="rounded-lg border px-3 py-2 text-sm hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
