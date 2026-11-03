"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export type ShopStatus = "ACTIVE" | "SUSPENDED" | "ARCHIVED";

interface UpdateStatusResponse {
  success: boolean;
  message: string;
}

export function useUpdateShopStatus(shopId: string) {
  const router = useRouter();

  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function updateStatus(status: ShopStatus) {
    setIsPending(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/admin/shops/${shopId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        },
      );

      const result: UpdateStatusResponse = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to update shop status.");
      }

      router.refresh();

      return { success: true };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Something went wrong.";

      setError(message);

      return { success: false, message };
    } finally {
      setIsPending(false);
    }
  }

  return {
    updateStatus,
    isPending,
    error,
  };
}