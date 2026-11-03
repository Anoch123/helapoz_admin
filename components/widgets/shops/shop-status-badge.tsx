import { Badge } from "@/components/ui/badge";

const statusConfig = {
  ACTIVE: {
    label: "Active",
    className: "border-green-200 bg-green-50 text-green-700",
  },
  PROVISIONING: {
    label: "Provisioning",
    className: "border-blue-200 bg-blue-50 text-blue-700",
  },
  SUSPENDED: {
    label: "Suspended",
    className: "border-yellow-200 bg-yellow-50 text-yellow-700",
  },
  ARCHIVED: {
    label: "Archived",
    className: "border-gray-200 bg-gray-100 text-gray-600",
  },
} as const;

export function ShopStatusBadge({
  status,
}: {
  status: string;
}) {
  const config =
    statusConfig[status as keyof typeof statusConfig];

  return (
    <Badge
      variant="outline"
      className={
        config?.className ?? "border-border bg-muted text-muted-foreground"
      }
    >
      {config?.label ?? status}
    </Badge>
  );
}