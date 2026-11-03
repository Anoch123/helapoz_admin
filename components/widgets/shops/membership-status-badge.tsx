import { Badge } from "@/components/ui/badge";

export function MembershipStatusBadge({
  status,
}: {
  status: string;
}) {
  const isActive = status === "ACTIVE";

  return (
    <Badge
      variant="outline"
      className={
        isActive
          ? "border-green-200 bg-green-50 text-green-700"
          : "border-yellow-200 bg-yellow-50 text-yellow-700"
      }
    >
      {isActive ? "Active" : status}
    </Badge>
  );
}