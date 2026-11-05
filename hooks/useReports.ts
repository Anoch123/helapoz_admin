
"use client";

import { useCallback, useEffect, useState } from "react";

export type ReportsData = {
  summary: {
    totalRevenue: number;
    subscriptionRevenue: number;
    additionalSeatRevenue: number;
    adjustmentRevenue: number;
    activeShops: number;
    totalShops: number;
    activeSubscriptions: number;
    pendingPayments: number;
  };
  revenueTrend: {
    month: string;
    label: string;
    subscription: number;
    additionalSeats: number;
    adjustment: number;
    total: number;
  }[];
  shopGrowth: {
    month: string;
    label: string;
    count: number;
  }[];
  subscriptionStatuses: Record<string, number>;
};

function getColomboDate() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Colombo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function getInitialStartDate() {
  return `${getColomboDate().slice(0, 4)}-01-01`;
}

export function useReports() {
  const [startDate, setStartDate] = useState(getInitialStartDate);
  const [endDate, setEndDate] = useState(getColomboDate);
  const [reports, setReports] = useState<ReportsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        startDate,
        endDate,
      });

      const response = await fetch(
        `/api/admin/reports?${params.toString()}`,
        {
          method: "GET",
          cache: "no-store",
        },
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ?? "Unable to load reports.",
        );
      }

      setReports(result.data);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong while loading reports.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    void fetchReports();
  }, [fetchReports]);

  return {
    reports,
    startDate,
    endDate,
    setStartDate,
    setEndDate,
    isLoading,
    error,
    fetchReports,
  };
}
