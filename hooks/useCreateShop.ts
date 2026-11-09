"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { CreateShopInput, ShopBusinessType } from "@/lib/validations/shop.validation";

interface CreateShopResponse {
  success: boolean;
  message: string;
  errors?: {
    fieldErrors?: Record<string, string[] | undefined>;
  };
  data?: {
    shop: {
      id: string;
      shopCode: string;
      name: string;
      businessType: ShopBusinessType;
    };
    shopAdmin: {
      id: string;
      email: string;
    };
    shopUser: {
      id: string;
      email: string;
    };
  };
}

export function useCreateShop() {
  const router = useRouter();

  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function createShop(input: CreateShopInput) {
    setIsPending(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/shops", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(input),
      });

      const data: CreateShopResponse = await response.json();

      if (!response.ok || !data.success || !data.data) {
        return {
          success: false,
          message: data.message || "Unable to create shop.",
          errors: data.errors?.fieldErrors ?? {},
        };
      }

      router.refresh();

      return {
        success: true,
        data: data.data,
        errors: {},
      };
    } catch {
      setError("Something went wrong. Please try again.");

      return {
        success: false,
        message: "Something went wrong. Please try again.",
        errors: {},
      };
    } finally {
      setIsPending(false);
    }
  }

  return {
    createShop,
    isPending,
    error,
  };
}