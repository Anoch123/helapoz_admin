/**
 * Shared helpers for the invoice screens (server-safe, no client hooks).
 * Save as: components/widgets/billing/invoice-ui.tsx
 */

export function formatCurrency(value: number | string) {
  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: 2,
  }).format(Number(value));
}

export function formatDate(value: string | null | undefined) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("en-LK", {
    dateStyle: "medium",
    timeZone: "Asia/Colombo",
  }).format(new Date(value));
}

export function formatStatus(value: string) {
  return value.replaceAll("_", " ");
}

export const OPEN_STATUSES = ["PENDING", "PARTIALLY_PAID", "OVERDUE"];

type Tone = "success" | "danger" | "warning" | "neutral";

function statusTone(status: string): Tone {
  const s = status.toLowerCase();
  if (s === "paid" || s === "confirmed" || s === "completed") return "success";
  if (s.includes("overdue") || s.includes("fail") || s.includes("reject"))
    return "danger";
  if (s.includes("partial") || s.includes("pending")) return "warning";
  return "neutral";
}

const toneStyles: Record<Tone, string> = {
  success:
    "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  danger: "bg-red-500/10 text-red-700 dark:text-red-300",
  warning: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  neutral: "bg-muted text-muted-foreground",
};

export function StatusPill({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium capitalize ${
        toneStyles[statusTone(status)]
      }`}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {formatStatus(status.toLowerCase())}
    </span>
  );
}