"use client";

import { useState } from "react";
import { Loader2, PauseCircle, PlayCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useUpdateShopUserStatus } from "@/hooks/useUpdateShopUserStatus";

interface ShopUserStatusActionsProps {
  shopId: string;
  membershipId: string;
  currentStatus: string;
  displayName: string;
}

export function ShopUserStatusActions({
  shopId,
  membershipId,
  currentStatus,
  displayName,
}: ShopUserStatusActionsProps) {
  const { updateStatus, isPending, error } =
    useUpdateShopUserStatus(shopId, membershipId);

  const [actionError, setActionError] = useState<string | null>(null);

  const isSuspended = currentStatus === "SUSPENDED";

  async function handleStatusChange() {
    const nextStatus = isSuspended ? "ACTIVE" : "SUSPENDED";

    const message = isSuspended
      ? `Reactivate ${displayName}'s account?`
      : `Suspend ${displayName}'s access to this shop?`;

    if (!window.confirm(message)) {
      return;
    }

    setActionError(null);

    const result = await updateStatus(nextStatus);

    if (!result.success) {
      setActionError(result.message ?? "Unable to update user status.");
    }
  }

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={isPending}
        onClick={handleStatusChange}
      >
        {isPending ? (
          <Loader2 className="mr-2 size-4 animate-spin" />
        ) : isSuspended ? (
          <PlayCircle className="mr-2 size-4" />
        ) : (
          <PauseCircle className="mr-2 size-4" />
        )}

        {isPending
          ? "Updating..."
          : isSuspended
            ? "Reactivate"
            : "Suspend"}
      </Button>

      {(actionError || error) && (
        <p className="text-xs text-destructive">
          {actionError || error}
        </p>
      )}
    </div>
  );
}