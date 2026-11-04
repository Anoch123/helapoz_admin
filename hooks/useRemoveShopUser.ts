"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface RemoveShopUserResponse {
  success: boolean;
  message: string;
}

export function useRemoveShopUser(
  shopId: string,
  membershipId: string,
) {
  const router = useRouter();

  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function removeUser() {
    setIsPending(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/admin/shops/${shopId}/users/${membershipId}`,
        {
          method: "DELETE",
        },
      );

      const result: RemoveShopUserResponse = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to remove shop user.");
      }

      router.refresh();

      return { success: true, message: result.message };
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong.";

      setError(message);

      return {
        success: false,
        message,
      };
    } finally {
      setIsPending(false);
    }
  }

  return {
    removeUser,
    isPending,
    error,
  };
}