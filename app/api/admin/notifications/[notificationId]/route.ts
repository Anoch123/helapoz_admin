import { NextResponse } from "next/server";

import { requireSuperAdmin } from "@/lib/auth/require-super-admin";
import { AuthorizationError } from "@/lib/auth/auth-errors";
import {
  getNotificationDetails,
  NotificationDetailsServiceError,
} from "@/lib/services/notification-details.service";

import { z } from "zod";

const notificationIdSchema = z.string().uuid();

type RouteContext = {
  params: Promise<{
    notificationId: string;
  }>;
};

export async function GET(
  _request: Request,
  { params }: RouteContext,
) {
  try {
    await requireSuperAdmin();

    const { notificationId } = await params;

    const validation = notificationIdSchema.safeParse(notificationId);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid notification ID.",
        },
        { status: 400 },
      );
    }

    const notification = await getNotificationDetails(
      validation.data,
    );

    return NextResponse.json({
      success: true,
      data: notification,
    });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
        },
        {
          status: error.message === "Authentication required." ? 401 : 403,
        },
      );
    }

    if (error instanceof NotificationDetailsServiceError) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
        },
        {
          status: error.code === "NOTIFICATION_NOT_FOUND" ? 404 : 500,
        },
      );
    }

    console.error("GET notification details error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "An unexpected error occurred.",
      },
      { status: 500 },
    );
  }
}