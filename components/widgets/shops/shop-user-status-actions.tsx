// "use client";

// import { useState } from "react";
// import { Loader2, PauseCircle, PlayCircle } from "lucide-react";

// import { Button } from "@/components/ui/button";
// import { useUpdateShopUserStatus } from "@/hooks/useUpdateShopUserStatus";

// interface ShopUserStatusActionsProps {
//   shopId: string;
//   membershipId: string;
//   currentStatus: string;
//   displayName: string;
// }

// export function ShopUserStatusActions({
//   shopId,
//   membershipId,
//   currentStatus,
//   displayName,
// }: ShopUserStatusActionsProps) {
//   const { updateStatus, isPending, error } =
//     useUpdateShopUserStatus(shopId, membershipId);

//   const [actionError, setActionError] = useState<string | null>(null);

//   const isSuspended = currentStatus === "SUSPENDED";

//   async function handleStatusChange() {
//     const nextStatus = isSuspended ? "ACTIVE" : "SUSPENDED";

//     const message = isSuspended
//       ? `Reactivate ${displayName}'s account?`
//       : `Suspend ${displayName}'s access to this shop?`;

//     if (!window.confirm(message)) {
//       return;
//     }

//     setActionError(null);

//     const result = await updateStatus(nextStatus);

//     if (!result.success) {
//       setActionError(result.message ?? "Unable to update user status.");
//     }
//   }

//   return (
//     <div className="space-y-2">
//       <Button
//         type="button"
//         variant="outline"
//         size="sm"
//         disabled={isPending}
//         onClick={handleStatusChange}
//       >
//         {isPending ? (
//           <Loader2 className="mr-2 size-4 animate-spin" />
//         ) : isSuspended ? (
//           <PlayCircle className="mr-2 size-4" />
//         ) : (
//           <PauseCircle className="mr-2 size-4" />
//         )}

//         {isPending
//           ? "Updating..."
//           : isSuspended
//             ? "Reactivate"
//             : "Suspend"}
//       </Button>

//       {(actionError || error) && (
//         <p className="text-xs text-destructive">
//           {actionError || error}
//         </p>
//       )}
//     </div>
//   );
// }


"use client";

import { useState } from "react";
import {
  Loader2,
  PauseCircle,
  PlayCircle,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { useUpdateShopUserStatus } from "@/hooks/useUpdateShopUserStatus";
import { useRemoveShopUser } from "@/hooks/useRemoveShopUser";

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
  const {
    updateStatus,
    isPending: isStatusPending,
    error: statusError,
  } = useUpdateShopUserStatus(shopId, membershipId);

  const {
    removeUser,
    isPending: isRemovePending,
    error: removeError,
  } = useRemoveShopUser(shopId, membershipId);

  const [actionError, setActionError] = useState<string | null>(null);

  const isSuspended = currentStatus === "SUSPENDED";
  const isPending = isStatusPending || isRemovePending;

  async function handleStatusChange() {
    const nextStatus = isSuspended ? "ACTIVE" : "SUSPENDED";

    const message = isSuspended
      ? `Reactivate ${displayName}'s account?`
      : `Suspend ${displayName}'s access to this shop?`;

    if (!window.confirm(message)) return;

    setActionError(null);

    const result = await updateStatus(nextStatus);

    if (!result.success) {
      setActionError(result.message ?? "Unable to update user status.");
    }
  }

  async function handleRemove() {
    const confirmed = window.confirm(
      `Permanently remove ${displayName} from this shop?\n\n` +
        "This action cannot be undone. If this user has an assigned additional seat, that seat will become available again.",
    );

    if (!confirmed) return;

    setActionError(null);

    const result = await removeUser();

    if (!result.success) {
      setActionError(result.message ?? "Unable to remove shop user.");
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isPending}
          onClick={handleStatusChange}
        >
          {isStatusPending ? (
            <Loader2 className="mr-2 size-4 animate-spin" />
          ) : isSuspended ? (
            <PlayCircle className="mr-2 size-4" />
          ) : (
            <PauseCircle className="mr-2 size-4" />
          )}

          {isStatusPending
            ? "Updating..."
            : isSuspended
              ? "Reactivate"
              : "Suspend"}
        </Button>

        <Button
          type="button"
          variant="destructive"
          size="sm"
          disabled={isPending}
          onClick={handleRemove}
        >
          {isRemovePending ? (
            <Loader2 className="mr-2 size-4 animate-spin" />
          ) : (
            <Trash2 className="mr-2 size-4" />
          )}

          {isRemovePending ? "Removing..." : "Remove"}
        </Button>
      </div>

      {(actionError || statusError || removeError) && (
        <p className="text-xs text-destructive">
          {actionError || statusError || removeError}
        </p>
      )}
    </div>
  );
}