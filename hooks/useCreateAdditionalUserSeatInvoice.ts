"use client";

import { useState } from "react";
import { toast } from "sonner";

interface CreateSeatInvoiceInput {
  shopId: string;
  quantity: number;
  notes?: string;
}

interface CreateSeatInvoiceResponse {
  success: boolean;
  message: string;
  data?: {
    invoiceId: string;
    invoiceNumber: string;
    quantity: number;
    unitPrice: number;
    totalAmount: number;
  };
}

export function useCreateAdditionalUserSeatInvoice(shopId: string) {
  const [isLoading, setIsLoading] = useState(false);

  const createInvoice = async (
    input: Omit<CreateSeatInvoiceInput, "shopId">
  ) => {
    setIsLoading(true);

    try {
      const response = await fetch(
        `/api/admin/shops/${shopId}/additional-seats`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(input),
        }
      );

      const result: CreateSeatInvoiceResponse = await response.json();

      if (!response.ok || !result.success || !result.data) {
        throw new Error(result.message || "Failed to create invoice.");
      }

      toast.success("Seat purchase invoice created successfully.");

      return result.data;
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong."
      );

      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createInvoice,
    isLoading,
  };
}