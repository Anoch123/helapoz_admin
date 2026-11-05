"use client";

import { useEffect, useRef, useState } from "react";
import {
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Globe,
  Info,
  RefreshCw,
  Search,
  ShieldCheck,
  X,
} from "lucide-react";

import { useAuditLogs } from "@/hooks/useAuditLogs";

/* ----------------------------- helpers ----------------------------- */

function formatDate(date: string) {
  const d = new Date(date);
  return {
    day: new Intl.DateTimeFormat("en-LK", {
      dateStyle: "medium",
      timeZone: "Asia/Colombo",
    }).format(d),
    time: new Intl.DateTimeFormat("en-LK", {
      timeStyle: "short",
      timeZone: "Asia/Colombo",
    }).format(d),
  };
}

function formatAction(action: string) {
  return action
    .toLowerCase()
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function humanize(value: string) {
  return value
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/^\w/, (c) => c.toUpperCase());
}

const colomboToday = () =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Colombo" }).format(
    new Date(),
  );

function daysAgo(days: number) {
  const d = new Date(`${colomboToday()}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString().slice(0, 10);
}

function actionTone(action: string) {
  const a = action.toUpperCase();
  if (/(DELETE|REMOVE|SUSPEND|CANCEL|REJECT|DISABLE)/.test(a))
    return "bg-red-500";
  if (/(CREATE|ADD|APPROVE|CONFIRM|ACTIVATE|ENABLE|REGISTER)/.test(a))
    return "bg-emerald-500";
  if (/(UPDATE|EDIT|CHANGE|ADJUST|RENEW)/.test(a)) return "bg-amber-500";
  return "bg-indigo-500";
}

const actorStyles: Record<string, string> = {
  SUPER_ADMIN: "bg-violet-500/10 text-violet-700 dark:text-violet-300",
  SHOP_ADMIN: "bg-sky-500/10 text-sky-700 dark:text-sky-300",
  SYSTEM: "bg-slate-500/10 text-slate-600 dark:text-slate-300",
};

const SOURCES = [
  { value: "ALL", label: "All" },
  { value: "SHOP", label: "Shop" },
  { value: "ADMIN", label: "Super admin" },
] as const;

const ACTORS = [
  { value: "ALL", label: "All actors" },
  { value: "SUPER_ADMIN", label: "Super admin" },
  { value: "SHOP_ADMIN", label: "Shop admin" },
  { value: "SYSTEM", label: "System" },
];

const DATE_PRESETS = [
  { key: "today", label: "Today", start: () => colomboToday() },
  { key: "7d", label: "7 days", start: () => daysAgo(7) },
  { key: "30d", label: "30 days", start: () => daysAgo(30) },
] as const;

/* --------------------------- small pieces -------------------------- */

function Dropdown({
  value,
  options,
  onChange,
  label,
}: {
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  label: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = options.find((o) => o.value === value) ?? options[0];

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex h-10 w-full items-center justify-between gap-2 rounded-xl border bg-background px-3 text-sm outline-none transition hover:bg-muted/50 focus-visible:ring-4 focus-visible:ring-indigo-500/15"
      >
        <span className={value === "ALL" ? "text-muted-foreground" : ""}>
          {current.label}
        </span>
        <ChevronDown
          className={`size-4 text-muted-foreground transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute z-20 mt-2 w-full min-w-[180px] overflow-hidden rounded-xl border bg-background p-1 shadow-xl"
        >
          {options.map((o) => (
            <li key={o.value}>
              <button
                type="button"
                role="option"
                aria-selected={o.value === value}
                onClick={() => {
                  onChange(o.value);
                  setOpen(false);
                }}
                className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition hover:bg-muted"
              >
                {o.label}
                {o.value === value && (
                  <Check className="size-4 text-indigo-600" />
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-muted ${className}`} />;
}

const inputClass =
  "h-10 w-full rounded-xl border bg-background px-3 text-sm outline-none transition placeholder:text-muted-foreground focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15";

/* ------------------------------ page ------------------------------- */

export default function AuditLogsContent() {
  const {
    logs,
    pagination,
    filters,
    loading,
    error,
    updateFilter,
    changePage,
    resetFilters,
    refresh,
  } = useAuditLogs();

  const [showDates, setShowDates] = useState(false);

  const activeFilters = [
    filters.source !== "ALL",
    filters.actorType !== "ALL",
    !!filters.action,
    !!filters.shopId,
    !!filters.startDate,
    !!filters.endDate,
  ].filter(Boolean).length;

  const activeDatePreset = DATE_PRESETS.find(
    (p) => filters.startDate === p.start() && filters.endDate === colomboToday(),
  )?.key;

  const applyDatePreset = (start: string) => {
    updateFilter("startDate", start);
    updateFilter("endDate", colomboToday());
    setShowDates(false);
  };

  const totalPages = Math.max(pagination.totalPages, 1);

  return (
    <div className="space-y-6 p-4">
      {/* ------------------------------ Summary ------------------------------ */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-600 to-violet-700 p-6 text-white shadow-lg lg:p-8">
        <div className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-white/10 blur-2xl" />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-medium text-indigo-100">
              <ShieldCheck className="size-4" />
              Audit trail
            </div>
            {loading ? (
              <Skeleton className="mt-3 h-12 w-40 bg-white/20" />
            ) : (
              <p className="mt-2 text-4xl font-semibold tabular-nums tracking-tight sm:text-5xl">
                {pagination.total.toLocaleString("en-LK")}
              </p>
            )}
            <p className="mt-2 text-sm text-indigo-100/80">
              Records{activeFilters > 0 ? " matching your filters" : " across Helpaz"}
            </p>
          </div>

          <div className="flex gap-6 text-sm">
            <div>
              <p className="text-indigo-100/70">On this page</p>
              <p className="mt-1 text-xl font-semibold tabular-nums">
                {loading ? "—" : logs.length}
              </p>
            </div>
            <div>
              <p className="text-indigo-100/70">Page</p>
              <p className="mt-1 text-xl font-semibold tabular-nums">
                {pagination.page}
                <span className="text-indigo-100/60"> / {totalPages}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------ Filters ------------------------------ */}
      <div className="space-y-4 rounded-3xl border bg-card p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Source segmented control */}
          <div className="inline-flex rounded-xl border bg-muted/50 p-1">
            {SOURCES.map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={() =>
                  updateFilter("source", s.value as typeof filters.source)
                }
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  filters.source === s.value
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Date presets */}
          <div className="inline-flex rounded-xl border bg-muted/50 p-1">
            {DATE_PRESETS.map((p) => (
              <button
                key={p.key}
                type="button"
                onClick={() => applyDatePreset(p.start())}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  activeDatePreset === p.key && !showDates
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {p.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setShowDates((v) => !v)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                showDates ||
                (!activeDatePreset && (filters.startDate || filters.endDate))
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Custom
            </button>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Dropdown
            label="Actor"
            value={filters.actorType}
            options={ACTORS}
            onChange={(v) =>
              updateFilter("actorType", v as typeof filters.actorType)
            }
          />

          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-3 size-4 text-muted-foreground" />
            <input
              value={filters.action}
              onChange={(e) => updateFilter("action", e.target.value)}
              placeholder="Search actions"
              className={`${inputClass} pl-9`}
            />
          </div>

          <input
            value={filters.shopId}
            onChange={(e) => updateFilter("shopId", e.target.value)}
            placeholder="Shop ID"
            className={inputClass}
          />
        </div>

        {showDates && (
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                From
              </label>
              <input
                type="date"
                value={filters.startDate}
                max={filters.endDate || undefined}
                onChange={(e) => updateFilter("startDate", e.target.value)}
                className={inputClass}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                To
              </label>
              <input
                type="date"
                value={filters.endDate}
                min={filters.startDate || undefined}
                onChange={(e) => updateFilter("endDate", e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
        )}

        {activeFilters > 0 && (
          <div className="flex items-center justify-between border-t pt-4">
            <p className="text-sm text-muted-foreground">
              {activeFilters} {activeFilters === 1 ? "filter" : "filters"} applied
            </p>
            <button
              type="button"
              onClick={() => {
                resetFilters();
                setShowDates(false);
              }}
              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-indigo-600 transition hover:bg-indigo-500/10"
            >
              <X className="size-4" />
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* ------------------------------- Table ------------------------------- */}
      <div className="overflow-hidden rounded-3xl border bg-card">
        <div className="flex items-center justify-between gap-3 border-b p-5">
          <div>
            <h2 className="font-semibold">Audit history</h2>
            <p className="text-sm text-muted-foreground">
              Newest activity first
            </p>
          </div>
          <button
            type="button"
            onClick={refresh}
            disabled={loading}
            aria-label="Refresh audit logs"
            className="inline-flex size-10 items-center justify-center rounded-xl border transition hover:bg-muted disabled:opacity-50"
          >
            <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {error && (
          <div
            role="alert"
            className="m-5 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive"
          >
            {error}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b bg-muted/40 text-xs text-muted-foreground">
                <th className="px-5 py-3 font-medium">Activity</th>
                <th className="px-5 py-3 font-medium">Actor</th>
                <th className="px-5 py-3 font-medium">Shop</th>
                <th className="px-5 py-3 font-medium">When</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-5 py-4">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="mt-2 h-3 w-24" />
                    </td>
                    <td className="px-5 py-4">
                      <Skeleton className="h-6 w-24 rounded-full" />
                    </td>
                    <td className="px-5 py-4">
                      <Skeleton className="h-4 w-28" />
                    </td>
                    <td className="px-5 py-4">
                      <Skeleton className="h-4 w-24" />
                    </td>
                  </tr>
                ))
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-16">
                    <div className="flex flex-col items-center gap-2 text-center text-muted-foreground">
                      <Info className="size-6 opacity-60" />
                      <p className="font-medium text-foreground">
                        No audit records found
                      </p>
                      <p className="text-sm">
                        Try removing a filter or widening the date range.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const when = formatDate(log.created_at);
                  return (
                    <tr
                      key={`${log.source}-${log.id}`}
                      className="transition-colors hover:bg-muted/30"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-start gap-3">
                          <span
                            className={`mt-1.5 size-2.5 shrink-0 rounded-full ${actionTone(
                              log.action,
                            )}`}
                          />
                          <div>
                            <p className="font-medium">
                              {formatAction(log.action)}
                            </p>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              {humanize(log.entity_type)} ·{" "}
                              {log.source === "SHOP" ? "Shop" : "Super admin"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                            actorStyles[log.actor_type] ??
                            "bg-muted text-muted-foreground"
                          }`}
                        >
                          {humanize(log.actor_type)}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        {log.shop ? (
                          <div className="flex items-center gap-3">
                            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-xs font-semibold text-indigo-600">
                              {log.shop.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium leading-tight">
                                {log.shop.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {log.shop.shop_code}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-2 text-muted-foreground">
                            <Globe className="size-4" />
                            Global
                          </span>
                        )}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4">
                        <p>{when.day}</p>
                        <p className="text-xs text-muted-foreground">
                          {when.time}
                        </p>
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
            Showing {logs.length} of {pagination.total.toLocaleString("en-LK")}
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => changePage(pagination.page - 1)}
              disabled={loading || pagination.page <= 1}
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
              disabled={loading || pagination.page >= pagination.totalPages}
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