"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function useUpdateShopUserPermissions(
  shopId: string,
  membershipId: string,
) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function updatePermissions(permissionKeys: string[]) {
    setPending(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/admin/shops/${shopId}/users/${membershipId}/permissions`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ permissionKeys }),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Unable to update permissions.");
      }

      router.refresh();
      return true;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update permissions.",
      );
      return false;
    } finally {
      setPending(false);
    }
  }

  return { updatePermissions, pending, error };
}