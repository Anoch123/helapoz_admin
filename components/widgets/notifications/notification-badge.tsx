/**
 * Shared badges for the notification screens.
 * Save as: components/notifications/notification-badges.tsx
 */

const categoryStyles: Record<string, string> = {
  ANNOUNCEMENT: "bg-sky-500/10 text-sky-700 dark:text-sky-300",
  BILLING: "bg-violet-500/10 text-violet-700 dark:text-violet-300",
  SYSTEM: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
};

const statusStyles: Record<string, { pill: string; dot: string }> = {
  SENT: {
    pill: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    dot: "bg-emerald-500",
  },
  READ: {
    pill: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    dot: "bg-emerald-500",
  },
  DRAFT: {
    pill: "bg-slate-500/10 text-slate-600 dark:text-slate-300",
    dot: "bg-slate-400",
  },
  UNREAD: {
    pill: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
    dot: "bg-amber-500",
  },
};

export const humanize = (value: string) =>
  value
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/^\w/, (c) => c.toUpperCase());

export function CategoryBadge({ category }: { category: string }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
        categoryStyles[category] ?? "bg-muted text-muted-foreground"
      }`}
    >
      {humanize(category)}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const s = statusStyles[status] ?? {
    pill: "bg-muted text-muted-foreground",
    dot: "bg-slate-400",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${s.pill}`}
    >
      <span className={`size-1.5 rounded-full ${s.dot}`} />
      {humanize(status)}
    </span>
  );
}