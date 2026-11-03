"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type RecordPaymentInput = {
  invoiceId: string;
  amount: number;
  transactionReference: string;
  paymentDate: string;
  notes?: string;
};

export function useRecordPayment() {
  const router = useRouter();

  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function recordPayment(input: RecordPaymentInput) {
    setIsPending(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(input),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Failed to record payment.");
      }

      router.refresh();
      return true;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );

      return false;
    } finally {
      setIsPending(false);
    }
  }

  return {
    recordPayment,
    isPending,
    error,
    clearError: () => setError(null),
  };
}