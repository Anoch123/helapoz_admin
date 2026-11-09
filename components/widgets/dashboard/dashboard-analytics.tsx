"use client";

import { useMemo } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  BadgeCheck,
  CalendarCheck,
  CreditCard,
  Info,
  Store,
  TrendingUp,
  UserPlus,
  Wallet,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { useReports } from "@/hooks/useReports";

/* ----------------------------- helpers ----------------------------- */

const currencyFormatter = new Intl.NumberFormat("en-LK", {
  style: "currency",
  currency: "LKR",
  maximumFractionDigits: 0,
});

const formatCurrency = (amount: number) => currencyFormatter.format(amount);

const compactCurrency = (value: number) =>
  `Rs. ${new Intl.NumberFormat("en-LK", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value)}`;

const percent = (part: number, whole: number) =>
  whole > 0 ? Math.round((part / whole) * 100) : 0;

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

const AT_RISK = ["PENDING_PAYMENT", "PAST_DUE", "SUSPENDED"];

const axisTick = { fontSize: 12, fill: "#94a3b8" };

/* --------------------------- small pieces -------------------------- */

function ChartTooltip({
  active,
  payload,
  label,
  money = true,
}: {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color?: string;
    fill?: string;
    stroke?: string;
  }>;
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
                style={{ background: p.color ?? p.fill ?? p.stroke }}
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
    <div className="flex h-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed text-sm text-muted-foreground">
      <Info className="size-5 opacity-60" />
      {message}
    </div>
  );
}

function Delta({ value }: { value: number | null }) {
  if (value === null) {
    return (
      <span className="rounded-full bg-white/15 px-2.5 py-1 text-xs font-medium">
        No prior month
      </span>
    );
  }
  const Icon = value >= 0 ? ArrowUpRight : ArrowDownRight;
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-xs font-medium">
      <Icon className="size-3.5" />
      {Math.abs(Math.round(value))}% vs previous month
    </span>
  );
}

function Panel({
  title,
  description,
  aside,
  children,
}: {
  title: string;
  description: string;
  aside?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border bg-card p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="font-semibold">{title}</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
        </div>
        {aside}
      </div>
      <div className="mt-6">{children}</div>
    </section>
  );
}

function Insight({
  icon: Icon,
  label,
  value,
  hint,
  tint,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  hint: string;
  tint: string;
}) {
  return (
    <div className="rounded-2xl border bg-card p-5">
      <div className="flex items-center gap-3">
        <div className={`rounded-xl p-2.5 ${tint}`}>
          <Icon className="size-5" />
        </div>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
      <p className="mt-4 text-2xl font-semibold tabular-nums tracking-tight">
        {value}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}

/* ------------------------------ page ------------------------------- */

export default function DashboardAnalytics() {
  const { reports, isLoading, error } = useReports();

  const summary = reports?.summary;
  const revenueData = reports?.revenueTrend ?? [];
  const shopGrowthData = reports?.shopGrowth ?? [];

  /* Everything below is derived from the data the report already returns. */
  const analytics = useMemo(() => {
    const totals = revenueData.map((d) => ({
      label: String(d.label),
      total:
        Number(d.subscription ?? 0) +
        Number(d.additionalSeats ?? 0) +
        Number(d.adjustment ?? 0),
    }));

    const last = totals.at(-1)?.total ?? 0;
    const prev = totals.at(-2)?.total;
    const revenueChange =
      prev !== undefined && prev > 0 ? ((last - prev) / prev) * 100 : null;

    const sum = totals.reduce((s, t) => s + t.total, 0);
    const avgMonthly = totals.length > 0 ? sum / totals.length : 0;
    const best = totals.reduce<{ label: string; total: number } | null>(
      (b, t) => (!b || t.total > b.total ? t : b),
      null,
    );

    let running = 0;
    const growth = shopGrowthData.map((d) => {
      running += Number(d.count ?? 0);
      return {
        label: String(d.label),
        count: Number(d.count ?? 0),
        cumulative: running,
      };
    });

    const parts = [
      {
        label: "Subscriptions",
        value: Number(summary?.subscriptionRevenue ?? 0),
        color: COLORS.subscription,
      },
      {
        label: "Additional seats",
        value: Number(summary?.additionalSeatRevenue ?? 0),
        color: COLORS.seats,
      },
      {
        label: "Adjustments",
        value: Number(summary?.adjustmentRevenue ?? 0),
        color: COLORS.adjustment,
      },
    ];
    const partsTotal = parts.reduce((s, p) => s + p.value, 0);

    return {
      avgMonthly,
      best,
      revenueChange,
      growth,
      newShops: running,
      parts,
      partsTotal,
    };
  }, [revenueData, shopGrowthData, summary]);

  const statuses = Object.entries(reports?.subscriptionStatuses ?? {}).map(
    ([key, count]) => ({
      key,
      name: key.replaceAll("_", " ").toLowerCase(),
      value: Number(count),
      color: statusColors[key] ?? "#94a3b8",
    }),
  );
  const subscriptionTotal = statuses.reduce((s, d) => s + d.value, 0);
  const activeSubs = statuses.find((s) => s.key === "ACTIVE")?.value ?? 0;
  const atRiskItems = statuses.filter((s) => AT_RISK.includes(s.key));
  const atRiskCount = atRiskItems.reduce((s, d) => s + d.value, 0);
  const healthScore = percent(activeSubs, subscriptionTotal);

  const totalShops = Number(summary?.totalShops ?? 0);
  const activeShops = Number(summary?.activeShops ?? 0);
  const totalRevenue = Number(summary?.totalRevenue ?? 0);
  const seatShare = percent(
    Number(summary?.additionalSeatRevenue ?? 0),
    analytics.partsTotal,
  );

  /* ------------------------------ states ------------------------------ */

  if (isLoading) {
    return (
      <div className="space-y-6 p-4" aria-busy="true">
        <div className="grid gap-4 lg:grid-cols-5">
          <Skeleton className="h-52 rounded-3xl lg:col-span-3" />
          <div className="grid gap-4 lg:col-span-2">
            <Skeleton className="h-[76px] rounded-2xl" />
            <Skeleton className="h-[76px] rounded-2xl" />
            <Skeleton className="h-[76px] rounded-2xl" />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-[400px] rounded-3xl" />
        <div className="grid gap-4 xl:grid-cols-2">
          <Skeleton className="h-[360px] rounded-3xl" />
          <Skeleton className="h-[360px] rounded-3xl" />
        </div>
      </div>
    );
  }

  if (error || !reports) {
    return (
      <div className="p-4">
        <div className="flex min-h-48 flex-col items-center justify-center gap-2 rounded-3xl border border-dashed text-center">
          <div className="rounded-2xl bg-indigo-500/10 p-3 text-indigo-600">
            <Activity className="size-6" />
          </div>
          <p className="font-medium">Unable to load dashboard analytics</p>
          <p className="text-sm text-muted-foreground">
            {error || "Please try again later."}
          </p>
        </div>
      </div>
    );
  }

  const stats = [
    {
      title: "Active shops",
      value: activeShops,
      note: `of ${totalShops} · ${percent(activeShops, totalShops)}% activation`,
      icon: BadgeCheck,
      tint: "bg-indigo-500/10 text-indigo-600",
    },
    {
      title: "Active subscriptions",
      value: Number(summary?.activeSubscriptions ?? 0),
      note: "Currently subscribed",
      icon: CreditCard,
      tint: "bg-emerald-500/10 text-emerald-600",
    },
    {
      title: "Pending payments",
      value: Number(summary?.pendingPayments ?? 0),
      note: "Awaiting confirmation",
      icon: Wallet,
      tint: "bg-amber-500/10 text-amber-600",
    },
  ];

  return (
    <div className="space-y-6 p-4">
      {/* ------------------------- Hero + KPI column ------------------------- */}
      <div className="grid gap-4 lg:grid-cols-5">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-600 to-violet-700 p-6 text-white shadow-lg lg:col-span-3 lg:p-8">
          <div className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-20 left-1/3 size-56 rounded-full bg-violet-400/20 blur-3xl" />

          <div className="relative">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-medium text-indigo-100">
                Total revenue
              </p>
              <Delta value={analytics.revenueChange} />
            </div>

            <p className="mt-2 text-4xl font-semibold tabular-nums tracking-tight sm:text-5xl">
              {formatCurrency(totalRevenue)}
            </p>
            <p className="mt-2 text-sm text-indigo-100/80">
              Confirmed payments in the reporting period
            </p>

            <div className="mt-8 flex h-3 w-full overflow-hidden rounded-full bg-white/15">
              {analytics.partsTotal > 0 &&
                analytics.parts.map((p) => (
                  <div
                    key={p.label}
                    className="h-full first:rounded-l-full last:rounded-r-full"
                    style={{
                      width: `${(p.value / analytics.partsTotal) * 100}%`,
                      background: p.color,
                    }}
                  />
                ))}
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              {analytics.parts.map((p) => (
                <div key={p.label}>
                  <div className="flex items-center gap-2 text-xs text-indigo-100">
                    <span
                      className="size-2.5 rounded-full ring-2 ring-white/30"
                      style={{ background: p.color }}
                    />
                    {p.label}
                  </div>
                  <p className="mt-1 text-lg font-semibold tabular-nums">
                    {formatCurrency(p.value)}
                  </p>
                  <p className="text-xs text-indigo-100/70">
                    {analytics.partsTotal > 0
                      ? `${percent(p.value, analytics.partsTotal)}% of total`
                      : "No payments yet"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:col-span-2">
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.title}
                className="flex items-center gap-4 rounded-2xl border bg-card p-5"
              >
                <div className={`rounded-xl p-3 ${s.tint}`}>
                  <Icon className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-muted-foreground">{s.title}</p>
                  <p className="text-2xl font-semibold tabular-nums tracking-tight">
                    {s.value.toLocaleString("en-LK")}
                  </p>
                </div>
                <p className="hidden max-w-[130px] text-right text-xs text-muted-foreground sm:block">
                  {s.note}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ----------------------------- Insights ----------------------------- */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Insight
          icon={TrendingUp}
          label="Avg monthly revenue"
          value={formatCurrency(analytics.avgMonthly)}
          hint={`Across ${revenueData.length} ${
            revenueData.length === 1 ? "month" : "months"
          } in the period`}
          tint="bg-indigo-500/10 text-indigo-600"
        />
        <Insight
          icon={CalendarCheck}
          label="Best month"
          value={analytics.best ? formatCurrency(analytics.best.total) : "—"}
          hint={analytics.best ? analytics.best.label : "No revenue yet"}
          tint="bg-emerald-500/10 text-emerald-600"
        />
        <Insight
          icon={Store}
          label="Revenue per active shop"
          value={formatCurrency(activeShops > 0 ? totalRevenue / activeShops : 0)}
          hint="Period revenue ÷ active shops"
          tint="bg-violet-500/10 text-violet-600"
        />
        <Insight
          icon={UserPlus}
          label="Seat expansion"
          value={`${seatShare}%`}
          hint="Share of revenue from additional seats"
          tint="bg-amber-500/10 text-amber-600"
        />
      </div>

      {/* --------------------------- Revenue chart --------------------------- */}
      <Panel
        title="Revenue overview"
        description="Monthly confirmed revenue by category"
        aside={
          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
            {analytics.parts.map((p) => (
              <span key={p.label} className="flex items-center gap-2">
                <span
                  className="size-2.5 rounded-full"
                  style={{ background: p.color }}
                />
                {p.label}
              </span>
            ))}
          </div>
        }
      >
        <div className="h-[340px] w-full">
          {revenueData.length === 0 ? (
            <EmptyState message="No revenue in this period." />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={revenueData}
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
                  tick={axisTick}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  width={64}
                  tick={axisTick}
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
      </Panel>

      {/* ---------------------- Growth + Subscription health ---------------------- */}
      <div className="grid gap-4 xl:grid-cols-2">
        <Panel
          title="Shop growth"
          description="New registrations per month, with the running total"
          aside={
            <span className="rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-600">
              +{analytics.newShops} in period
            </span>
          }
        >
          <div className="h-[290px] w-full">
            {analytics.growth.length === 0 ? (
              <EmptyState message="No new shops in this period." />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={analytics.growth}
                  margin={{ top: 10, right: 8, left: -16, bottom: 0 }}
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
                    tick={axisTick}
                  />
                  <YAxis
                    allowDecimals={false}
                    tickLine={false}
                    axisLine={false}
                    tick={axisTick}
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
                    barSize={28}
                  />
                  <Line
                    type="monotone"
                    dataKey="cumulative"
                    name="Running total"
                    stroke={COLORS.seats}
                    strokeWidth={2.5}
                    dot={{ r: 3 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </div>
        </Panel>

        <Panel
          title="Subscription health"
          description="Current subscriptions grouped by status"
          aside={
            subscriptionTotal > 0 && (
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  healthScore >= 80
                    ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                    : healthScore >= 50
                      ? "bg-amber-500/10 text-amber-700 dark:text-amber-300"
                      : "bg-red-500/10 text-red-700 dark:text-red-300"
                }`}
              >
                {healthScore}% active
              </span>
            )
          }
        >
          {statuses.length === 0 ? (
            <div className="h-[290px]">
              <EmptyState message="No subscription data available." />
            </div>
          ) : (
            <div className="grid items-center gap-6 sm:grid-cols-2">
              <div className="relative mx-auto h-[220px] w-full max-w-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statuses}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={68}
                      outerRadius={100}
                      paddingAngle={3}
                      cornerRadius={6}
                      stroke="none"
                    >
                      {statuses.map((entry) => (
                        <Cell key={entry.key} fill={entry.color} />
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

              <ul className="space-y-3">
                {statuses.map((d) => (
                  <li key={d.key} className="flex items-center gap-3 text-sm">
                    <span
                      className="size-2.5 shrink-0 rounded-full"
                      style={{ background: d.color }}
                    />
                    <span className="flex-1 capitalize text-muted-foreground">
                      {d.name}
                    </span>
                    <span className="font-semibold tabular-nums">{d.value}</span>
                    <span className="w-10 text-right text-xs tabular-nums text-muted-foreground">
                      {percent(d.value, subscriptionTotal)}%
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Panel>
      </div>

      {/* --------------------------- Needs attention --------------------------- */}
      <section className="rounded-3xl border bg-card p-6">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-amber-500/10 p-2.5 text-amber-600">
            <AlertTriangle className="size-5" />
          </div>
          <div>
            <h2 className="font-semibold">Needs attention</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Items that may be costing you revenue
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-muted/40 p-4">
            <p className="text-sm text-muted-foreground">
              Payments awaiting confirmation
            </p>
            <p className="mt-2 text-2xl font-semibold tabular-nums">
              {Number(summary?.pendingPayments ?? 0)}
            </p>
          </div>

          <div className="rounded-2xl bg-muted/40 p-4">
            <p className="text-sm text-muted-foreground">
              At-risk subscriptions
            </p>
            <p className="mt-2 text-2xl font-semibold tabular-nums">
              {atRiskCount}
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                {percent(atRiskCount, subscriptionTotal)}% of all
              </span>
            </p>
            {atRiskItems.length > 0 && (
              <p className="mt-1 text-xs capitalize text-muted-foreground">
                {atRiskItems.map((i) => `${i.value} ${i.name}`).join(" · ")}
              </p>
            )}
          </div>

          <div className="rounded-2xl bg-muted/40 p-4">
            <p className="text-sm text-muted-foreground">Inactive shops</p>
            <p className="mt-2 text-2xl font-semibold tabular-nums">
              {Math.max(totalShops - activeShops, 0)}
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                {percent(Math.max(totalShops - activeShops, 0), totalShops)}% of
                shops
              </span>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}