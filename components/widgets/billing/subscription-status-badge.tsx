import { Badge } from "@/components/ui/badge";

type SubscriptionStatus =
  | "PENDING_PAYMENT"
  | "ACTIVE"
  | "PAST_DUE"
  | "SUSPENDED"
  | "CANCELLED";

const statusStyles: Record<
  SubscriptionStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  PENDING_PAYMENT: "outline",
  ACTIVE: "default",
  PAST_DUE: "secondary",
  SUSPENDED: "destructive",
  CANCELLED: "outline",
};

const statusLabels: Record<SubscriptionStatus, string> = {
  PENDING_PAYMENT: "Pending payment",
  ACTIVE: "Active",
  PAST_DUE: "Past due",
  SUSPENDED: "Suspended",
  CANCELLED: "Cancelled",
};

export function SubscriptionStatusBadge({
  status,
}: {
  status: SubscriptionStatus;
}) {
  return (
    <Badge variant={statusStyles[status]}>
      {statusLabels[status]}
    </Badge>
  );
}