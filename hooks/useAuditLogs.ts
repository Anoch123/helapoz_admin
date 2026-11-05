"use client";

import { useCallback, useEffect, useState } from "react";

export interface AuditLog {
  id: string;
  source: "SHOP" | "ADMIN";
  shop_id: string | null;
  actor_user_id: string | null;
  actor_type: "SUPER_ADMIN" | "SHOP_ADMIN" | "SYSTEM";
  action: string;
  entity_type: string;
  entity_id: string | null;
  details: Record<string, unknown>;
  created_at: string;
  shop: {
    id: string;
    name: string;
    shop_code: string;
  } | null;
}

interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface AuditLogFilters {
  source: "ALL" | "SHOP" | "ADMIN";
  actorType: "ALL" | "SUPER_ADMIN" | "SHOP_ADMIN" | "SYSTEM";
  action: string;
  shopId: string;
  startDate: string;
  endDate: string;
}

const initialFilters: AuditLogFilters = {
  source: "ALL",
  actorType: "ALL",
  action: "",
  shopId: "",
  startDate: "",
  endDate: "",
};

export function useAuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
  });

  const [filters, setFilters] =
    useState<AuditLogFilters>(initialFilters);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAuditLogs = useCallback(
    async (page = 1) => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          page: String(page),
          pageSize: String(pagination.pageSize),
          source: filters.source,
          actorType: filters.actorType,
        });

        if (filters.action.trim()) {
          params.set("action", filters.action.trim());
        }

        if (filters.shopId) {
          params.set("shopId", filters.shopId);
        }

        if (filters.startDate) {
          params.set("startDate", filters.startDate);
        }

        if (filters.endDate) {
          params.set("endDate", filters.endDate);
        }

        const response = await fetch(
          `/api/admin/audit-logs?${params.toString()}`
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message || "Failed to load audit logs."
          );
        }

        setLogs(result.data.logs);
        setPagination(result.data.pagination);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong."
        );
      } finally {
        setLoading(false);
      }
    },
    [filters, pagination.pageSize]
  );

  useEffect(() => {
    fetchAuditLogs(1);
  }, [fetchAuditLogs]);

  const updateFilter = <K extends keyof AuditLogFilters>(
    key: K,
    value: AuditLogFilters[K]
  ) => {
    setFilters((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  const changePage = (page: number) => {
    fetchAuditLogs(page);
  };

  const changePageSize = (pageSize: number) => {
    setPagination((previous) => ({
      ...previous,
      pageSize,
    }));
  };

  const resetFilters = () => {
    setFilters(initialFilters);
  };

  return {
    logs,
    pagination,
    filters,
    loading,
    error,
    updateFilter,
    changePage,
    changePageSize,
    resetFilters,
    refresh: () => fetchAuditLogs(pagination.page),
  };
}