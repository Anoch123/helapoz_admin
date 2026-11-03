import { Badge } from "@/components/ui/badge";

type PaymentStatus =
  | "PENDING"
  | "CONFIRMED"
  | "REJECTED"
  | "REFUNDED";

const statusConfig: Record<
  PaymentStatus,
  { label: string; className: string }
> = {
  PENDING: {
    label: "Pending verification",
    className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
  },
  CONFIRMED: {
    label: "Confirmed",
    className: "bg-green-100 text-green-800 hover:bg-green-100",
  },
  REJECTED: {
    label: "Rejected",
    className: "bg-red-100 text-red-800 hover:bg-red-100",
  },
  REFUNDED: {
    label: "Refunded",
    className: "bg-gray-100 text-gray-800 hover:bg-gray-100",
  },
};

export function PaymentStatusBadge({
  status,
}: {
  status: PaymentStatus;
}) {
  const config = statusConfig[status];

  return (
    <Badge className={config.className}>
      {config.label}
    </Badge>
  );
}