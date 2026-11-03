"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function useRejectPayment() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function rejectPayment(paymentId: string, reason: string) {
    setPending(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/admin/payments/${paymentId}/reject`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reason }),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Unable to reject payment.");
      }

      router.refresh();
      return true;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to reject payment.",
      );
      return false;
    } finally {
      setPending(false);
    }
  }

  return { rejectPayment, pending, error };
}