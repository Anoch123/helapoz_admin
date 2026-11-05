"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  BellRing,
  ChevronLeft,
  ChevronRight,
  Info,
  Plus,
  RefreshCw,
  Search,
  Users,
} from "lucide-react";

import { useNotifications } from "@/hooks/use-notifications";
import { CategoryBadge, StatusBadge } from "./notification-badge";

function formatDate(date: string | null) {
  if (!date) return null;
  const d = new Date(date);
  return {
    day: new Intl.DateTimeFormat("en-LK", { dateStyle: "medium" }).format(d),
    time: new Intl.DateTimeFormat("en-LK", { timeStyle: "short" }).format(d),
  };
}

const CATEGORIES = [
  { value: "ALL", label: "All" },
  { value: "ANNOUNCEMENT", label: "Announcements" },
  { value: "BILLING", label: "Billing" },
  { value: "SYSTEM", label: "System" },
];

const roleLabel = (role: string) =>
  role === "ALL" ? "All members" : role === "SHOP_ADMIN" ? "Shop admins" : "Shop users";

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-muted ${className}`} />;
}

export default function NotificationList() {
  const { notifications, pagination, isLoading, error, changePage, refresh } =
    useNotifications();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ALL");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return notifications.filter((n) => {
      const searchMatch =
        !q ||
        n.title.toLowerCase().includes(q) ||
        n.message.toLowerCase().includes(q);
      const categoryMatch = category === "ALL" || n.category === category;
      return searchMatch && categoryMatch;
    });
  }, [notifications, search, category]);

  const totalPages = Math.max(pagination.totalPages, 1);

  return (
    <div className="space-y-6 p-4">
      {/* ------------------------------ Summary ------------------------------ */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-600 to-violet-700 p-6 text-white shadow-lg lg:p-8">
        <div className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-white/10 blur-2xl" />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-medium text-indigo-100">
              <BellRing className="size-4" />
              Notifications sent to shops
            </div>
            {isLoading ? (
              <Skeleton className="mt-3 h-12 w-32 bg-white/20" />
            ) : (
              <p className="mt-2 text-4xl font-semibold tabular-nums tracking-tight sm:text-5xl">
                {pagination.total.toLocaleString("en-LK")}
              </p>
            )}
          </div>

          <Link
            href="/notifications/create"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-semibold text-indigo-700 shadow-sm transition hover:bg-indigo-50"
          >
            <Plus className="size-4" />
            New notification
          </Link>
        </div>
      </div>

      {/* ------------------------------ Toolbar ------------------------------ */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="inline-flex w-fit max-w-full overflow-x-auto rounded-xl border bg-muted/50 p-1">
          {CATEGORIES.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => setCategory(c.value)}
              className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                category === c.value
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1 lg:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title or message"
              className="h-10 w-full rounded-xl border bg-background pl-9 pr-3 text-sm outline-none transition placeholder:text-muted-foreground focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15"
            />
          </div>

          <button
            type="button"
            onClick={() => void refresh()}
            disabled={isLoading}
            aria-label="Refresh notifications"
            className="inline-flex size-10 items-center justify-center rounded-xl border transition hover:bg-muted disabled:opacity-50"
          >
            <RefreshCw className={`size-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive"
        >
          {error}
        </div>
      )}

      {/* ------------------------------- Table ------------------------------- */}
      <div className="overflow-hidden rounded-3xl border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40 text-left text-xs text-muted-foreground">
                <th className="px-5 py-3 font-medium">Notification</th>
                <th className="px-5 py-3 font-medium">Audience</th>
                <th className="px-5 py-3 font-medium">Recipients</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Sent</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>

            <tbody className="divide-y">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-5 py-4">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="mt-2 h-3 w-64" />
                    </td>
                    <td className="px-5 py-4">
                      <Skeleton className="h-4 w-24" />
                    </td>
                    <td className="px-5 py-4">
                      <Skeleton className="h-4 w-10" />
                    </td>
                    <td className="px-5 py-4">
                      <Skeleton className="h-6 w-16 rounded-full" />
                    </td>
                    <td className="px-5 py-4">
                      <Skeleton className="h-4 w-24" />
                    </td>
                    <td />
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-16">
                    <div className="flex flex-col items-center gap-2 text-center text-muted-foreground">
                      <Info className="size-6 opacity-60" />
                      <p className="font-medium text-foreground">
                        No notifications found
                      </p>
                      <p className="text-sm">
                        Try a different search or category.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((n) => {
                  const sent = formatDate(n.sentAt);
                  return (
                    <tr
                      key={n.id}
                      className="transition-colors hover:bg-muted/30"
                    >
                      <td className="max-w-sm px-5 py-4">
                        <div className="flex items-center gap-2">
                          <p className="truncate font-medium">{n.title}</p>
                          <CategoryBadge category={n.category} />
                        </div>
                        <p className="mt-1 truncate text-xs text-muted-foreground">
                          {n.message}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <p className="font-medium">
                          {n.audienceType === "ALL_SHOPS"
                            ? "All shops"
                            : "Specific shop"}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {roleLabel(n.recipientRole)}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1.5 tabular-nums">
                          <Users className="size-4 text-muted-foreground" />
                          {n.recipientCount}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <StatusBadge status={n.status} />
                      </td>

                      <td className="whitespace-nowrap px-5 py-4">
                        {sent ? (
                          <>
                            <p>{sent.day}</p>
                            <p className="text-xs text-muted-foreground">
                              {sent.time}
                            </p>
                          </>
                        ) : (
                          <span className="text-muted-foreground">Not sent</span>
                        )}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <Link
                          href={`/notifications/${n.id}`}
                          className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm font-medium text-indigo-600 transition hover:bg-indigo-500/10"
                        >
                          View
                          <ChevronRight className="size-4" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t p-5">
          <p className="text-sm text-muted-foreground">
            Showing {filtered.length} of {pagination.total.toLocaleString("en-LK")}
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => changePage(pagination.page - 1)}
              disabled={isLoading || pagination.page <= 1}
              className="inline-flex h-10 items-center gap-1 rounded-xl border px-3 text-sm transition hover:bg-muted disabled:opacity-40 disabled:hover:bg-transparent"
            >
              <ChevronLeft className="size-4" />
              Previous
            </button>

            <span className="min-w-[64px] text-center text-sm tabular-nums text-muted-foreground">
              {pagination.page} / {totalPages}
            </span>

            <button
              type="button"
              onClick={() => changePage(pagination.page + 1)}
              disabled={isLoading || pagination.page >= pagination.totalPages}
              className="inline-flex h-10 items-center gap-1 rounded-xl border px-3 text-sm transition hover:bg-muted disabled:opacity-40 disabled:hover:bg-transparent"
            >
              Next
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}