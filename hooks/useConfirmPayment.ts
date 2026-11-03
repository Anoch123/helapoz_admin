"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function useConfirmPayment() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function confirmPayment(paymentId: string) {
    setPending(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/admin/payments/${paymentId}/confirm`,
        { method: "POST" },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Unable to confirm payment.");
      }

      router.refresh();
      return true;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to confirm payment.",
      );
      return false;
    } finally {
      setPending(false);
    }
  }

  return { confirmPayment, pending, error };
}