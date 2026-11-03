"use client";

import { useState } from "react";
import { Loader2, PauseCircle, PlayCircle, Archive } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useUpdateShopStatus, type ShopStatus } from "@/hooks/useUpdateShopStatus";
import { BASICSYSTEMDATA } from "@/lib/constants/helper-constants";

interface ShopStatusActionsProps {
  shopId: string;
  currentStatus: string;
}

export function ShopStatusActions({
  shopId,
  currentStatus,
}: ShopStatusActionsProps) {
  const { updateStatus, isPending, error } = useUpdateShopStatus(shopId);
  const [actionError, setActionError] = useState<string | null>(null);

  async function handleStatusChange(
    status: ShopStatus,
    confirmationMessage: string,
  ) {
    if (!window.confirm(confirmationMessage)) return;

    setActionError(null);

    const result = await updateStatus(status);

    if (!result.success) {
      setActionError(result.message ?? "Unable to update shop status.");
    }
  }

  if (currentStatus === "ARCHIVED") {
    return (
      <p className="text-sm text-muted-foreground">
        This shop has been archived. No further status changes are available.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {currentStatus !== "ACTIVE" && (
          <Button
            size="sm"
            disabled={isPending}
            onClick={() =>
              handleStatusChange(
                "ACTIVE",
                "Are you sure you want to activate this shop?",
              )
            }
          >
            {isPending ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <PlayCircle className="mr-2 size-4" />
            )}
            Activate Shop
          </Button>
        )}

        {currentStatus === "ACTIVE" && (
          <Button
            size="sm"
            variant="outline"
            disabled={isPending}
            onClick={() =>
              handleStatusChange(
                "SUSPENDED",
                `Suspending this shop will prevent it from using ${BASICSYSTEMDATA.appName} POS once POS access enforcement is implemented. Continue?`,
              )
            }
          >
            {isPending ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <PauseCircle className="mr-2 size-4" />
            )}
            Suspend Shop
          </Button>
        )}

        <Button
          size="sm"
          variant="destructive"
          disabled={isPending}
          onClick={() =>
            handleStatusChange(
              "ARCHIVED",
              "Are you sure you want to archive this shop? This action cannot be undone through the status controls.",
            )
          }
        >
          <Archive className="mr-2 size-4" />
          Archive Shop
        </Button>
      </div>

      {(error || actionError) && (
        <p role="alert" className="text-sm text-destructive">
          {actionError || error}
        </p>
      )}
    </div>
  );
}