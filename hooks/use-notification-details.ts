"use client";

import { useCallback, useEffect, useState } from "react";

export type NotificationRecipient = {
  id: string;
  shopId: string;
  shopName: string;
  shopCode: string;
  userId: string;
  displayName: string;
  membershipRole: "SHOP_ADMIN" | "SHOP_USER";
  status: "READ" | "UNREAD";
  deliveredAt: string;
  readAt: string | null;
};

export type NotificationDetailsData = {
  id: string;
  title: string;
  message: string;
  category: string;
  audienceType: string;
  targetShopId: string | null;
  targetShopName: string | null;
  targetShopCode: string | null;
  recipientRole: string;
  status: string;
  createdBy: string | null;
  createdAt: string;
  sentAt: string | null;
  recipientCount: number;
  readCount: number;
  unreadCount: number;
  recipients: NotificationRecipient[];
};

export function useNotificationDetails(notificationId: string) {
  const [notification, setNotification] =
    useState<NotificationDetailsData | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDetails = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/admin/notifications/${notificationId}`,
        { cache: "no-store" },
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Unable to load notification details.",
        );
      }

      setNotification(result.data);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [notificationId]);

  useEffect(() => {
    void fetchDetails();
  }, [fetchDetails]);

  return {
    notification,
    isLoading,
    error,
    refresh: fetchDetails,
  };
}