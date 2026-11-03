"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface UpdateShopResponse {
  success: boolean;
  message: string;
  errors?: {
    fieldErrors?: Record<string, string>;
  };
}

export function useUpdateShop(shopId: string) {
  const router = useRouter();

  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function updateShop(data: Record<string, string>) {
    setIsPending(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/shops/${shopId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result: UpdateShopResponse = await response.json();

      if (!response.ok || !result.success) {
        return {
          success: false,
          message: result.message,
          fieldErrors: result.errors?.fieldErrors ?? {},
        };
      }

      router.push(`/manage-shops/${shopId}`);
      router.refresh();

      return {
        success: true,
        message: result.message,
        fieldErrors: {},
      };
    } catch {
      const message = "Something went wrong while updating the shop.";
      setError(message);

      return {
        success: false,
        message,
        fieldErrors: {},
      };
    } finally {
      setIsPending(false);
    }
  }

  return {
    updateShop,
    isPending,
    error,
  };
}