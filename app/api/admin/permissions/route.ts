
import { NextRequest, NextResponse } from "next/server";

import { requireSuperAdmin } from "@/lib/auth/require-super-admin";
import { AuthorizationError } from "@/lib/auth/auth-errors";

import {
  getPermissions,
  updatePermissionStatus,
} from "@/lib/services/permission.service";

import {
  updatePermissionStatusSchema,
} from "@/lib/validations/permission.validation";

export async function GET() {
  try {
    await requireSuperAdmin();

    const permissions = await getPermissions();

    return NextResponse.json({
      success: true,
      message: "Permissions retrieved successfully.",
      data: permissions,
    });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: error.statusCode },
      );
    }

    console.error("Get permissions API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load permissions.",
      },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await requireSuperAdmin();

    const body: unknown = await request.json();

    const validation =
      updatePermissionStatusSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Please check the submitted information.",
          errors: {
            fieldErrors: Object.fromEntries(
              validation.error.issues
                .filter((issue) => issue.path.length > 0)
                .map((issue) => [
                  issue.path.join("."),
                  issue.message,
                ]),
            ),
          },
        },
        { status: 400 },
      );
    }

    const permission = await updatePermissionStatus(
      validation.data.permissionKey,
      validation.data.isActive,
    );

    return NextResponse.json({
      success: true,
      message: "Permission status updated successfully.",
      data: permission,
    });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: error.statusCode },
      );
    }

    if (
      error instanceof Error &&
      error.message === "PERMISSION_NOT_FOUND"
    ) {
      return NextResponse.json(
        { success: false, message: "Permission not found." },
        { status: 404 },
      );
    }

    console.error("Update permission API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to update permission status.",
      },
      { status: 500 },
    );
  }
}
