"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function useLogout() {
  const router = useRouter();

  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const logout = async () => {
    try {
      setIsPending(true);
      setError(null);

      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Logout failed.");
      }

      router.replace("/");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setIsPending(false);
    }
  };

  return {
    logout,
    isPending,
    error,
  };
}