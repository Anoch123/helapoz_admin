import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { CreateNotificationInput } from "../validations/notification.validation";

type SendNotificationResult = {
  notificationId: string;
  recipientCount: number;
};

export class NotificationServiceError extends Error {
  constructor(
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "NotificationServiceError";
  }
}

function mapNotificationError(errorMessage: string): NotificationServiceError {
  if (errorMessage.includes("NOTIFICATION_TITLE_REQUIRED")) {
    return new NotificationServiceError(
      "NOTIFICATION_TITLE_REQUIRED",
      "Notification title is required.",
    );
  }

  if (errorMessage.includes("NOTIFICATION_MESSAGE_REQUIRED")) {
    return new NotificationServiceError(
      "NOTIFICATION_MESSAGE_REQUIRED",
      "Notification message is required.",
    );
  }

  if (errorMessage.includes("INVALID_NOTIFICATION_CATEGORY")) {
    return new NotificationServiceError(
      "INVALID_NOTIFICATION_CATEGORY",
      "Invalid notification category.",
    );
  }

  if (errorMessage.includes("INVALID_NOTIFICATION_AUDIENCE")) {
    return new NotificationServiceError(
      "INVALID_NOTIFICATION_AUDIENCE",
      "Invalid notification audience.",
    );
  }

  if (errorMessage.includes("INVALID_NOTIFICATION_RECIPIENT_ROLE")) {
    return new NotificationServiceError(
      "INVALID_NOTIFICATION_RECIPIENT_ROLE",
      "Invalid recipient role.",
    );
  }

  if (errorMessage.includes("SPECIFIC_SHOP_REQUIRED")) {
    return new NotificationServiceError(
      "SPECIFIC_SHOP_REQUIRED",
      "Please select a shop.",
    );
  }

  if (errorMessage.includes("NO_ELIGIBLE_NOTIFICATION_RECIPIENTS")) {
    return new NotificationServiceError(
      "NO_ELIGIBLE_NOTIFICATION_RECIPIENTS",
      "There are no active recipients matching this notification.",
    );
  }

  return new NotificationServiceError(
    "NOTIFICATION_SEND_FAILED",
    "Unable to send the notification. Please try again.",
  );
}

export async function sendNotification(
  input: CreateNotificationInput,
  createdBy: string,
): Promise<SendNotificationResult> {
  const supabase = createAdminClient();

  const { data, error } = await supabase.rpc("send_notification", {
    p_title: input.title,
    p_message: input.message,
    p_category: input.category,
    p_audience_type: input.audienceType,
    p_target_shop_id: input.targetShopId,
    p_recipient_role: input.recipientRole,
    p_created_by: createdBy,
  });

  if (error) {
    throw mapNotificationError(error.message);
  }

  const result = data?.[0];

  if (!result?.notification_id) {
    throw new NotificationServiceError(
      "NOTIFICATION_RESULT_MISSING",
      "The notification was processed, but its result could not be retrieved.",
    );
  }

  return {
    notificationId: result.notification_id,
    recipientCount: result.recipient_count,
  };
}