import { NextRequest, NextResponse } from "next/server";

import { AuthorizationError } from "@/lib/auth/auth-errors";

import {
  sendNotification,
  NotificationServiceError,
} from "@/lib/services/notification.service";
import { createNotificationSchema } from "@/lib/validations/notification.validation";
import { requireSuperAdmin } from "@/lib/auth/require-super-admin";
import { getNotifications } from "@/lib/services/notification-list.service";

export async function POST(request: NextRequest) {
  try {
    // 1. Verify Super Admin
    const { profile } = await requireSuperAdmin();

    // 2. Parse request body
    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid request body.",
        },
        { status: 400 },
      );
    }

    // 3. Validate request
    const validation = createNotificationSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Please check the notification details.",
          errors: validation.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    // 4. Send notification
    // The creator ID comes from the authenticated profile.
    const result = await sendNotification(
      validation.data,
      profile.id,
    );

    // 5. Return success
    return NextResponse.json(
      {
        success: true,
        message: "Notification sent successfully.",
        data: {
          notificationId: result.notificationId,
          recipientCount: result.recipientCount,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof AuthorizationError) {
      const status =
        error.message === "Authentication required." ? 401 : 403;

      return NextResponse.json(
        {
          success: false,
          message: error.message,
        },
        { status },
      );
    }

    if (error instanceof NotificationServiceError) {
      const status =
        error.code === "NO_ELIGIBLE_NOTIFICATION_RECIPIENTS"
          ? 409
          : 400;

      return NextResponse.json(
        {
          success: false,
          message: error.message,
          code: error.code,
        },
        { status },
      );
    }

    console.error("Create notification error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "An unexpected error occurred while sending the notification.",
      },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await requireSuperAdmin();

    const searchParams = request.nextUrl.searchParams;

    const rawPage = Number(searchParams.get("page") ?? "1");
    const rawPageSize = Number(searchParams.get("pageSize") ?? "10");

    const page =
      Number.isInteger(rawPage) && rawPage > 0
        ? rawPage
        : 1;

    const pageSize =
      Number.isInteger(rawPageSize) &&
      rawPageSize > 0 &&
      rawPageSize <= 50
        ? rawPageSize
        : 10;

    const result = await getNotifications({
      page,
      pageSize,
    });

    return NextResponse.json({
      success: true,
      data: result.notifications,
      pagination: result.pagination,
    });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      const status =
        error.message === "Authentication required." ? 401 : 403;

      return NextResponse.json(
        {
          success: false,
          message: error.message,
        },
        { status },
      );
    }

    console.error("Get notifications API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to retrieve notifications.",
      },
      { status: 500 },
    );
  }
}