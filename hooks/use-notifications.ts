"use client";

import { CreateNotificationInput } from "@/lib/validations/notification.validation";
import { useCallback, useEffect, useState } from "react";

export type NotificationItem = {
  id: string;
  title: string;
  message: string;
  category: string;
  audienceType: string;
  targetShopId: string | null;
  recipientRole: string;
  status: string;
  createdBy: string | null;
  sentAt: string | null;
  createdAt: string;
  recipientCount: number;
};

type Pagination = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data?: T;
  pagination?: Pagination;
  errors?: Record<string, string[] | undefined>;
  code?: string;
};

export function useNotifications(initialPage = 1, pageSize = 10) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: initialPage,
    pageSize,
    total: 0,
    totalPages: 0,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(
    async (page = initialPage) => {
        setIsLoading(true);
        setError(null);

        try {
        const response = await fetch(
            `/api/admin/notifications?page=${page}&pageSize=${pageSize}`,
            {
            method: "GET",
            cache: "no-store",
            },
        );

        const result: ApiResponse<NotificationItem[]> =
            await response.json();

        if (!response.ok || !result.success) {
            throw new Error(
            result.message ?? "Unable to load notifications.",
            );
        }

        setNotifications(result.data ?? []);

        if (result.pagination) {
            setPagination(result.pagination);
        }
        } catch (err) {
        setError(
            err instanceof Error
            ? err.message
            : "Unable to load notifications.",
        );
        } finally {
        setIsLoading(false);
        }
    },
    [pageSize, initialPage],
    );

  const sendNotification = useCallback(
    async (input: CreateNotificationInput) => {
      setIsSending(true);
      setError(null);

      try {
        const response = await fetch("/api/admin/notifications", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(input),
        });

        const result: ApiResponse<{
          notificationId: string;
          recipientCount: number;
        }> = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message ?? "Unable to send notification.",
          );
        }

        await fetchNotifications(1);

        return {
          success: true as const,
          data: result.data,
        };
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Unable to send notification.";

        setError(message);

        return {
          success: false as const,
          message,
        };
      } finally {
        setIsSending(false);
      }
    },
    [fetchNotifications],
  );

  const changePage = useCallback(
    (page: number) => {
      if (
        page < 1 ||
        (pagination.totalPages > 0 && page > pagination.totalPages)
      ) {
        return;
      }

      fetchNotifications(page);
    },
    [fetchNotifications, pagination.totalPages],
  );

  const refresh = useCallback(() => {
    return fetchNotifications(pagination.page);
  }, [fetchNotifications, pagination.page]);

  useEffect(() => {
    void fetchNotifications(initialPage);
  }, [fetchNotifications, initialPage]);

  return {
    notifications,
    pagination,
    isLoading,
    isSending,
    error,
    fetchNotifications,
    sendNotification,
    changePage,
    refresh,
  };
}