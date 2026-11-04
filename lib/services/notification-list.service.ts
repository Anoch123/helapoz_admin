import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

type NotificationListItem = {
  id: string;
  title: string;
  message: string;
  category: string;
  audience_type: string;
  target_shop_id: string | null;
  recipient_role: string;
  status: string;
  created_by: string | null;
  sent_at: string | null;
  created_at: string;
  notification_recipients: {
    count: number;
  }[];
};

type GetNotificationsParams = {
  page: number;
  pageSize: number;
};

export async function getNotifications({
  page,
  pageSize,
}: GetNotificationsParams) {
  const supabase = createAdminClient();

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await supabase
    .from("notifications")
    .select(
      `
        id,
        title,
        message,
        category,
        audience_type,
        target_shop_id,
        recipient_role,
        status,
        created_by,
        sent_at,
        created_at,
        notification_recipients(count)
      `,
      { count: "exact" },
    )
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    console.error("Get notifications error:", error);
    throw new Error("Unable to retrieve notifications.");
  }

  const rows = (data ?? []) as unknown as NotificationListItem[];

  const notifications = rows.map((notification) => ({
    id: notification.id,
    title: notification.title,
    message: notification.message,
    category: notification.category,
    audienceType: notification.audience_type,
    targetShopId: notification.target_shop_id,
    recipientRole: notification.recipient_role,
    status: notification.status,
    createdBy: notification.created_by,
    sentAt: notification.sent_at,
    createdAt: notification.created_at,
    recipientCount:
      notification.notification_recipients?.[0]?.count ?? 0,
  }));

  return {
    notifications,
    pagination: {
      page,
      pageSize,
      total: count ?? 0,
      totalPages: Math.ceil((count ?? 0) / pageSize),
    },
  };
}