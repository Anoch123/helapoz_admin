
// import "server-only";

// import { createAdminClient } from "@/lib/supabase/admin";

// export class NotificationDetailsServiceError extends Error {
//   constructor(
//     message: string,
//     public readonly code: string,
//   ) {
//     super(message);
//     this.name = "NotificationDetailsServiceError";
//   }
// }

// type GetNotificationDetailsOptions = {
//   notificationId: string;
//   page: number;
//   pageSize: number;
// };

// export async function getNotificationDetails({
//   notificationId,
//   page,
//   pageSize,
// }: GetNotificationDetailsOptions) {
//   const supabase = createAdminClient();

//   const { data: notification, error: notificationError } = await supabase
//     .from("notifications")
//     .select(`
//       id,
//       title,
//       message,
//       category,
//       audience_type,
//       target_shop_id,
//       recipient_role,
//       status,
//       created_by,
//       sent_at,
//       created_at
//     `)
//     .eq("id", notificationId)
//     .maybeSingle();

//   if (notificationError) {
//     throw new NotificationDetailsServiceError(
//       "Unable to retrieve notification.",
//       "NOTIFICATION_DETAILS_FETCH_FAILED",
//     );
//   }

//   if (!notification) {
//     throw new NotificationDetailsServiceError(
//       "Notification not found.",
//       "NOTIFICATION_NOT_FOUND",
//     );
//   }

//   const from = (page - 1) * pageSize;
//   const to = from + pageSize - 1;

//   const {
//     data: recipientRows,
//     error: recipientsError,
//     count,
//   } = await supabase
//     .from("notification_recipients")
//     .select(
//       `
//         id,
//         shop_id,
//         user_id,
//         membership_role,
//         status,
//         delivered_at,
//         read_at
//       `,
//       { count: "exact" },
//     )
//     .eq("notification_id", notificationId)
//     .order("delivered_at", { ascending: false })
//     .range(from, to);

//   if (recipientsError) {
//     throw new NotificationDetailsServiceError(
//       "Unable to retrieve notification recipients.",
//       "NOTIFICATION_RECIPIENTS_FETCH_FAILED",
//     );
//   }

//   const shopIds = [...new Set((recipientRows ?? []).map((row) => row.shop_id))];
//   const userIds = [...new Set((recipientRows ?? []).map((row) => row.user_id))];

//   const [shopsResult, membershipsResult] = await Promise.all([
//     shopIds.length
//       ? supabase
//           .from("shops")
//           .select("id, name, shop_code")
//           .in("id", shopIds)
//       : Promise.resolve({ data: [], error: null }),

//     shopIds.length && userIds.length
//       ? supabase
//           .from("shop_memberships")
//           .select("shop_id, user_id, display_name")
//           .in("shop_id", shopIds)
//           .in("user_id", userIds)
//       : Promise.resolve({ data: [], error: null }),
//   ]);

//   if (shopsResult.error || membershipsResult.error) {
//     throw new NotificationDetailsServiceError(
//       "Unable to retrieve recipient account details.",
//       "NOTIFICATION_RECIPIENT_DETAILS_FETCH_FAILED",
//     );
//   }

//   const shopMap = new Map(
//     (shopsResult.data ?? []).map((shop) => [shop.id, shop]),
//   );

//   const membershipMap = new Map(
//     (membershipsResult.data ?? []).map((membership) => [
//       `${membership.shop_id}:${membership.user_id}`,
//       membership.display_name,
//     ]),
//   );

//   const recipients = (recipientRows ?? []).map((recipient) => {
//     const shop = shopMap.get(recipient.shop_id);

//     return {
//       id: recipient.id,
//       shopId: recipient.shop_id,
//       shopName: shop?.name ?? "Unknown shop",
//       shopCode: shop?.shop_code ?? "—",
//       userId: recipient.user_id,
//       displayName:
//         membershipMap.get(`${recipient.shop_id}:${recipient.user_id}`) ??
//         "Membership no longer available",
//       membershipRole: recipient.membership_role,
//       status: recipient.status,
//       deliveredAt: recipient.delivered_at,
//       readAt: recipient.read_at,
//     };
//   });

//   const readCount = recipients.filter(
//     (recipient) => recipient.status === "READ",
//   ).length;

//   return {
//     notification: {
//       id: notification.id,
//       title: notification.title,
//       message: notification.message,
//       category: notification.category,
//       audienceType: notification.audience_type,
//       targetShopId: notification.target_shop_id,
//       recipientRole: notification.recipient_role,
//       status: notification.status,
//       createdBy: notification.created_by,
//       sentAt: notification.sent_at,
//       createdAt: notification.created_at,
//     },
//     recipients,
//     pagination: {
//       page,
//       pageSize,
//       total: count ?? 0,
//       totalPages: Math.ceil((count ?? 0) / pageSize),
//     },
//     recipientSummary: {
//       total: count ?? 0,
//       read: readCount,
//       unread: (count ?? 0) - readCount,
//     },
//   };
// }


import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

export class NotificationDetailsServiceError extends Error {
  constructor(
    message: string,
    public readonly code: string,
  ) {
    super(message);
    this.name = "NotificationDetailsServiceError";
  }
}

export async function getNotificationDetails(notificationId: string) {
  const supabase = createAdminClient();

  // 1. Get the notification.
  const { data: notification, error: notificationError } = await supabase
    .from("notifications")
    .select(`
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
      created_at
    `)
    .eq("id", notificationId)
    .maybeSingle();

  if (notificationError) {
    throw new NotificationDetailsServiceError(
      "Unable to retrieve notification.",
      "NOTIFICATION_DETAILS_FAILED",
    );
  }

  if (!notification) {
    throw new NotificationDetailsServiceError(
      "Notification not found.",
      "NOTIFICATION_NOT_FOUND",
    );
  }

  // 2. Get all recipients.
  const { data: recipients, error: recipientsError } = await supabase
    .from("notification_recipients")
    .select(`
      id,
      shop_id,
      user_id,
      membership_role,
      status,
      delivered_at,
      read_at
    `)
    .eq("notification_id", notificationId)
    .order("delivered_at", { ascending: false });

  if (recipientsError) {
    throw new NotificationDetailsServiceError(
      "Unable to retrieve notification recipients.",
      "NOTIFICATION_RECIPIENTS_FAILED",
    );
  }

  const recipientRows = recipients ?? [];

  // 3. Retrieve the relevant shops and current memberships.
  const shopIds = [
    ...new Set([
      ...recipientRows.map((recipient) => recipient.shop_id),
      ...(notification.target_shop_id ? [notification.target_shop_id] : []),
    ]),
  ];

  const userIds = [...new Set(recipientRows.map((recipient) => recipient.user_id))];

  const [shopsResult, membershipsResult] = await Promise.all([
    shopIds.length
      ? supabase
          .from("shops")
          .select("id, name, shop_code")
          .in("id", shopIds)
      : Promise.resolve({ data: [], error: null }),

    shopIds.length && userIds.length
      ? supabase
          .from("shop_memberships")
          .select("shop_id, user_id, display_name")
          .in("shop_id", shopIds)
          .in("user_id", userIds)
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (shopsResult.error || membershipsResult.error) {
    throw new NotificationDetailsServiceError(
      "Unable to retrieve recipient shop or account information.",
      "NOTIFICATION_RECIPIENT_DETAILS_FAILED",
    );
  }

  const shopMap = new Map(
    (shopsResult.data ?? []).map((shop) => [shop.id, shop]),
  );

  const membershipMap = new Map(
    (membershipsResult.data ?? []).map((membership) => [
      `${membership.shop_id}:${membership.user_id}`,
      membership,
    ]),
  );

  // 4. Attach shop and account details to recipients.
  const formattedRecipients = recipientRows.map((recipient) => {
    const shop = shopMap.get(recipient.shop_id);

    const membership = membershipMap.get(
      `${recipient.shop_id}:${recipient.user_id}`,
    );

    return {
      id: recipient.id,
      shopId: recipient.shop_id,
      shopName: shop?.name ?? "Unknown shop",
      shopCode: shop?.shop_code ?? "—",
      userId: recipient.user_id,
      displayName: membership?.display_name ?? "Account no longer active",
      membershipRole: recipient.membership_role,
      status: recipient.status,
      deliveredAt: recipient.delivered_at,
      readAt: recipient.read_at,
    };
  });

  const readCount = formattedRecipients.filter(
    (recipient) => recipient.status === "READ",
  ).length;

  const unreadCount = formattedRecipients.length - readCount;

  const targetShop = notification.target_shop_id
    ? shopMap.get(notification.target_shop_id)
    : null;

  return {
    id: notification.id,
    title: notification.title,
    message: notification.message,
    category: notification.category,
    audienceType: notification.audience_type,
    targetShopId: notification.target_shop_id,
    targetShopName: targetShop?.name ?? null,
    targetShopCode: targetShop?.shop_code ?? null,
    recipientRole: notification.recipient_role,
    status: notification.status,
    createdBy: notification.created_by,
    createdAt: notification.created_at,
    sentAt: notification.sent_at,
    recipientCount: formattedRecipients.length,
    readCount,
    unreadCount,
    recipients: formattedRecipients,
  };
}