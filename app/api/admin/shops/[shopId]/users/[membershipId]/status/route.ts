import { NextRequest, NextResponse } from "next/server";

import { requireSuperAdmin } from "@/lib/auth/require-super-admin";
import { AuthorizationError } from "@/lib/auth/auth-errors";

import { updateShopUserStatusSchema } from "@/lib/validations/shop-user-status.validation";
import { updateShopUserStatus } from "@/lib/services/shop-user-status.service";

export async function PATCH(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      shopId: string;
      membershipId: string;
    }>;
  },
) {
  try {
    const { user } = await requireSuperAdmin();

    const { shopId, membershipId } = await params;

    const body = await request.json();

    const validation = updateShopUserStatusSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid user status.",
          errors: {
            fieldErrors: Object.fromEntries(
              validation.error.issues.map((issue) => [
                issue.path.join("."),
                issue.message,
              ]),
            ),
          },
        },
        { status: 400 },
      );
    }

    const membership = await updateShopUserStatus({
      shopId,
      membershipId,
      superAdminId: user.id,
      input: validation.data,
    });

    return NextResponse.json({
      success: true,
      message: "Shop user status updated successfully.",
      data: {
        id: membership.id,
        status: membership.status,
      },
    });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: error.statusCode },
      );
    }

    if (error instanceof Error) {
      const knownErrors: Record<
        string,
        { message: string; status: number }
      > = {
        MEMBERSHIP_NOT_FOUND: {
          message: "Shop user membership not found.",
          status: 404,
        },
        INVALID_MEMBERSHIP_ROLE: {
          message: "Only Shop User accounts can be managed here.",
          status: 403,
        },
        STATUS_UNCHANGED: {
          message: "The user already has this status.",
          status: 409,
        },
        STATUS_CONFLICT: {
          message: "The membership was changed by another request. Refresh and try again.",
          status: 409,
        },
        STATUS_UPDATED_AUDIT_FAILED: {
          message: "The user status changed, but audit logging failed.",
          status: 500,
        },
      };

      const knownError = knownErrors[error.message];

      if (knownError) {
        return NextResponse.json(
          {
            success: false,
            message: knownError.message,
          },
          { status: knownError.status },
        );
      }
    }

    console.error("Update shop user status API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to update the shop user status.",
      },
      { status: 500 },
    );
  }
}