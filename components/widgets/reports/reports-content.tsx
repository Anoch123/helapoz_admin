"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Activity,
  Building2,
  CalendarRange,
  CreditCard,
  RefreshCw,
  Info,
} from "lucide-react";

import { useReports } from "@/hooks/useReports";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ModulesPageHeader from "../dashboard/modules-page-header";

/* ----------------------------- helpers ----------------------------- */

const currencyFormatter = new Intl.NumberFormat("en-LK", {
  style: "currency",
  currency: "LKR",
  maximumFractionDigits: 0,
});

const formatCurrency = (value: number) => currencyFormatter.format(value);

const compactCurrency = (value: number) =>
  `Rs. ${new Intl.NumberFormat("en-LK", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value)}`;

const colomboToday = () =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Colombo" }).format(
    new Date(),
  );

function daysAgo(days: number) {
  const d = new Date(`${colomboToday()}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString().slice(0, 10);
}

const PRESETS = [
  { key: "7d", label: "7 days", start: () => daysAgo(7) },
  { key: "30d", label: "30 days", start: () => daysAgo(30) },
  { key: "90d", label: "90 days", start: () => daysAgo(90) },
  {
    key: "ytd",
    label: "This year",
    start: () => `${colomboToday().slice(0, 4)}-01-01`,
  },
] as const;

const COLORS = {
  subscription: "#4f46e5",
  seats: "#10b981",
  adjustment: "#f59e0b",
};

const statusColors: Record<string, string> = {
  ACTIVE: "#10b981",
  PENDING_PAYMENT: "#f59e0b",
  PAST_DUE: "#f97316",
  SUSPENDED: "#ef4444",
  CANCELLED: "#94a3b8",
};

/* --------------------------- small pieces -------------------------- */

function ChartTooltip({
  active,
  payload,
  label,
  money = true,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color?: string; fill?: string }>;
  label?: string;
  money?: boolean;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="min-w-[160px] rounded-xl border bg-background/95 p-3 shadow-xl backdrop-blur">
      {label && <p className="mb-2 text-xs font-medium">{label}</p>}
      <div className="space-y-1.5">
        {payload.map((p) => (
          <div
            key={p.name}
            className="flex items-center justify-between gap-4 text-xs"
          >
            <span className="flex items-center gap-2 text-muted-foreground">
              <span
                className="size-2 rounded-full"
                style={{ background: p.color ?? p.fill }}
              />
              {p.name}
            </span>
            <span className="font-semibold tabular-nums">
              {money ? formatCurrency(Number(p.value)) : p.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-muted ${className}`} />;
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed text-sm text-muted-foreground">
      <Info className="size-5 opacity-60" />
      {message}
    </div>
  );
}

/* ------------------------------ page ------------------------------- */

export default function ReportsContent() {
  const {
    reports,
    startDate,
    endDate,
    setStartDate,
    setEndDate,
    isLoading,
    error,
    fetchReports,
  } = useReports();

  const [showCustom, setShowCustom] = useState(false);
  const pendingFetch = useRef(false);

  // Presets set both dates, then fetch once the new state has landed.
  useEffect(() => {
    if (pendingFetch.current) {
      pendingFetch.current = false;
      void fetchReports();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate]);

  const applyPreset = (start: string) => {
    pendingFetch.current = true;
    setStartDate(start);
    setEndDate(colomboToday());
    setShowCustom(false);
  };

  const activePreset = PRESETS.find(
    (p) => p.start() === startDate && endDate === colomboToday(),
  )?.key;

  const summary = reports?.summary;

  const breakdown = useMemo(() => {
    const parts = [
      {
        label: "Subscriptions",
        value: summary?.subscriptionRevenue ?? 0,
        color: COLORS.subscription,
      },
      {
        label: "Additional seats",
        value: summary?.additionalSeatRevenue ?? 0,
        color: COLORS.seats,
      },
      {
        label: "Adjustments",
        value: summary?.adjustmentRevenue ?? 0,
        color: COLORS.adjustment,
      },
    ];
    const total = parts.reduce((s, p) => s + p.value, 0);
    return { parts, total };
  }, [summary]);

  const subscriptionData = Object.entries(
    reports?.subscriptionStatuses ?? {},
  ).map(([name, value]) => ({
    name: name.replaceAll("_", " ").toLowerCase(),
    value: Number(value),
    color: statusColors[name] ?? "#94a3b8",
  }));
  const subscriptionTotal = subscriptionData.reduce((s, d) => s + d.value, 0);

  const stats = [
    {
      title: "Active shops",
      value: summary?.activeShops ?? 0,
      note: `of ${summary?.totalShops ?? 0} registered`,
      icon: Building2,
      tint: "bg-indigo-500/10 text-indigo-600",
    },
    {
      title: "Active subscriptions",
      value: summary?.activeSubscriptions ?? 0,
      note: "Currently running",
      icon: Activity,
      tint: "bg-emerald-500/10 text-emerald-600",
    },
    {
      title: "Pending payments",
      value: summary?.pendingPayments ?? 0,
      note: "Awaiting confirmation",
      icon: CreditCard,
      tint: "bg-amber-500/10 text-amber-600",
    },
  ];

  return (
    <div className="space-y-6 p-4">
      {/* ------------------------------ Header ------------------------------ */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <ModulesPageHeader
          title="Reports & Analytics"
          subtitle="Revenue, shops and subscriptions at a glance"
        />

        <div className="flex flex-wrap items-center gap-2">
          {/* Segmented range switcher */}
          <div className="inline-flex rounded-xl border bg-muted/50 p-1">
            {PRESETS.map((p) => (
              <button
                key={p.key}
                type="button"
                onClick={() => applyPreset(p.start())}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  activePreset === p.key && !showCustom
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {p.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setShowCustom((v) => !v)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                showCustom || !activePreset
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <CalendarRange className="size-4" />
              Custom
            </button>
          </div>

          <Button
            variant="outline"
            size="icon"
            className="rounded-xl"
            onClick={() => void fetchReports()}
            disabled={isLoading}
            aria-label="Refresh reports"
          >
            <RefreshCw className={`size-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Custom range — only when asked for */}
      {showCustom && (
        <div className="flex flex-col gap-3 rounded-2xl border bg-muted/30 p-4 sm:flex-row sm:items-end">
          {[
            {
              id: "startDate",
              label: "From",
              value: startDate,
              max: endDate,
              onChange: setStartDate,
            },
            {
              id: "endDate",
              label: "To",
              value: endDate,
              min: startDate,
              max: colomboToday(),
              onChange: setEndDate,
            },
          ].map((f) => (
            <div key={f.id} className="flex-1 space-y-1.5">
              <label
                htmlFor={f.id}
                className="text-xs font-medium text-muted-foreground"
              >
                {f.label}
              </label>
              <input
                id={f.id}
                type="date"
                value={f.value}
                min={f.min}
                max={f.max}
                onChange={(e) => f.onChange(e.target.value)}
                className="h-10 w-full appearance-none rounded-xl border bg-background px-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15"
              />
            </div>
          ))}
          <Button
            className="h-10 rounded-xl bg-indigo-600 px-6 hover:bg-indigo-700"
            onClick={() => void fetchReports()}
            disabled={isLoading || !startDate || !endDate}
          >
            Apply range
          </Button>
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive"
        >
          {error}
        </div>
      )}

      {/* ------------------------- Hero + KPI column ------------------------- */}
      <div className="grid gap-4 lg:grid-cols-5">
        {/* Revenue hero */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-600 to-violet-700 p-6 text-white shadow-lg lg:col-span-3 lg:p-8">
          <div className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-20 left-1/3 size-56 rounded-full bg-violet-400/20 blur-3xl" />

          <div className="relative">
            <p className="text-sm font-medium text-indigo-100">Total revenue</p>
            {isLoading ? (
              <Skeleton className="mt-3 h-12 w-64 bg-white/20" />
            ) : (
              <p className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">
                {formatCurrency(summary?.totalRevenue ?? 0)}
              </p>
            )}
            <p className="mt-2 text-sm text-indigo-100/80">
              Confirmed payments in the selected period
            </p>

            {/* Proportion bar */}
            <div className="mt-8 flex h-3 w-full overflow-hidden rounded-full bg-white/15">
              {breakdown.total > 0 &&
                breakdown.parts.map((p) => (
                  <div
                    key={p.label}
                    className="h-full first:rounded-l-full last:rounded-r-full"
                    style={{
                      width: `${(p.value / breakdown.total) * 100}%`,
                      background: p.color,
                    }}
                  />
                ))}
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              {breakdown.parts.map((p) => (
                <div key={p.label}>
                  <div className="flex items-center gap-2 text-xs text-indigo-100">
                    <span
                      className="size-2.5 rounded-full ring-2 ring-white/30"
                      style={{ background: p.color }}
                    />
                    {p.label}
                  </div>
                  <p className="mt-1 text-lg font-semibold tabular-nums">
                    {isLoading ? "—" : formatCurrency(p.value)}
                  </p>
                  <p className="text-xs text-indigo-100/70">
                    {breakdown.total > 0
                      ? `${Math.round((p.value / breakdown.total) * 100)}% of total`
                      : "No payments yet"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* KPI stack */}
        <div className="grid gap-4 lg:col-span-2">
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <Card key={s.title} className="rounded-2xl">
                <CardContent className="flex items-center gap-4 p-5">
                  <div className={`rounded-xl p-3 ${s.tint}`}>
                    <Icon className="size-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-muted-foreground">{s.title}</p>
                    {isLoading ? (
                      <Skeleton className="mt-1 h-7 w-16" />
                    ) : (
                      <p className="text-2xl font-semibold tabular-nums tracking-tight">
                        {s.value}
                      </p>
                    )}
                  </div>
                  <p className="hidden text-right text-xs text-muted-foreground sm:block">
                    {s.note}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* ----------------------------- Revenue chart ----------------------------- */}
      <Card className="rounded-3xl">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>Revenue overview</CardTitle>
            <CardDescription>Monthly confirmed revenue by category</CardDescription>
          </div>
          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
            {breakdown.parts.map((p) => (
              <span key={p.label} className="flex items-center gap-2">
                <span
                  className="size-2.5 rounded-full"
                  style={{ background: p.color }}
                />
                {p.label}
              </span>
            ))}
          </div>
        </CardHeader>

        <CardContent>
          <div className="h-[340px] w-full">
            {isLoading ? (
              <Skeleton className="h-full w-full rounded-2xl" />
            ) : (reports?.revenueTrend.length ?? 0) === 0 ? (
              <EmptyState message="No revenue in this period. Try a wider date range." />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={reports?.revenueTrend ?? []}
                  margin={{ top: 10, right: 8, left: 0, bottom: 0 }}
                  barCategoryGap="28%"
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="currentColor"
                    className="text-border"
                  />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 12, fill: "#94a3b8" }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    width={64}
                    tick={{ fontSize: 12, fill: "#94a3b8" }}
                    tickFormatter={(v) => compactCurrency(Number(v))}
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(99,102,241,0.06)" }}
                    content={<ChartTooltip />}
                  />
                  <Bar
                    dataKey="subscription"
                    name="Subscriptions"
                    stackId="revenue"
                    fill={COLORS.subscription}
                  />
                  <Bar
                    dataKey="additionalSeats"
                    name="Additional seats"
                    stackId="revenue"
                    fill={COLORS.seats}
                  />
                  <Bar
                    dataKey="adjustment"
                    name="Adjustments"
                    stackId="revenue"
                    fill={COLORS.adjustment}
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ------------------------ Growth + Subscriptions ------------------------ */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="rounded-3xl">
          <CardHeader>
            <CardTitle>Shop growth</CardTitle>
            <CardDescription>New registrations by month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px] w-full">
              {isLoading ? (
                <Skeleton className="h-full w-full rounded-2xl" />
              ) : (reports?.shopGrowth.length ?? 0) === 0 ? (
                <EmptyState message="No new shops in this period." />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={reports?.shopGrowth ?? []}
                    margin={{ top: 10, right: 8, left: -16, bottom: 0 }}
                    barCategoryGap="35%"
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="currentColor"
                      className="text-border"
                    />
                    <XAxis
                      dataKey="label"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 12, fill: "#94a3b8" }}
                    />
                    <YAxis
                      allowDecimals={false}
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 12, fill: "#94a3b8" }}
                    />
                    <Tooltip
                      cursor={{ fill: "rgba(99,102,241,0.06)" }}
                      content={<ChartTooltip money={false} />}
                    />
                    <Bar
                      dataKey="count"
                      name="New shops"
                      fill={COLORS.subscription}
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl">
          <CardHeader>
            <CardTitle>Subscription status</CardTitle>
            <CardDescription>Current subscriptions grouped by status</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[280px] w-full rounded-2xl" />
            ) : subscriptionData.length === 0 ? (
              <div className="h-[280px]">
                <EmptyState message="No subscriptions yet." />
              </div>
            ) : (
              <div className="grid items-center gap-6 sm:grid-cols-2">
                {/* Donut with total in the centre */}
                <div className="relative mx-auto h-[220px] w-full max-w-[240px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={subscriptionData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={68}
                        outerRadius={100}
                        paddingAngle={3}
                        cornerRadius={6}
                        stroke="none"
                      >
                        {subscriptionData.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<ChartTooltip money={false} />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-semibold tabular-nums">
                      {subscriptionTotal}
                    </span>
                    <span className="text-xs text-muted-foreground">total</span>
                  </div>
                </div>

                {/* Legend with counts */}
                <ul className="space-y-3">
                  {subscriptionData.map((d) => (
                    <li key={d.name} className="flex items-center gap-3 text-sm">
                      <span
                        className="size-2.5 shrink-0 rounded-full"
                        style={{ background: d.color }}
                      />
                      <span className="flex-1 capitalize text-muted-foreground">
                        {d.name}
                      </span>
                      <span className="font-semibold tabular-nums">{d.value}</span>
                      <span className="w-10 text-right text-xs tabular-nums text-muted-foreground">
                        {subscriptionTotal > 0
                          ? `${Math.round((d.value / subscriptionTotal) * 100)}%`
                          : "0%"}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <p className="flex items-center gap-2 text-xs text-muted-foreground">
        <Info className="size-4" />
        Revenue includes confirmed payments only. Dates use Asia/Colombo time.
      </p>
    </div>
  );
}