import { NextRequest, NextResponse } from "next/server";

import { requireSuperAdmin } from "@/lib/auth/require-super-admin";
import { AuthorizationError } from "@/lib/auth/auth-errors";
import { updateShopStatus } from "@/lib/services/shop-status.service";
import { updateShopStatusSchema } from "@/lib/validations/shop-status.validation";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ shopId: string }> },
) {
  try {
    const { user } = await requireSuperAdmin();
    const { shopId } = await params;

    const body: unknown = await request.json();
    const validation = updateShopStatusSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid shop status.",
          errors: validation.error.flatten(),
        },
        { status: 400 },
      );
    }

    const shop = await updateShopStatus({
      shopId,
      superAdminId: user.id,
      input: validation.data,
    });

    return NextResponse.json({
      success: true,
      message: "Shop status updated successfully.",
      data: shop,
    });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: error.statusCode },
      );
    }

    const message =
      error instanceof Error ? error.message : "Unable to update shop status.";

    const knownErrors: Record<string, { message: string; status: number }> = {
      SHOP_NOT_FOUND: { message: "Shop not found.", status: 404 },
      ARCHIVED_SHOP: {
        message: "Archived shops cannot be changed.",
        status: 409,
      },
      STATUS_UNCHANGED: {
        message: "The shop already has this status.",
        status: 409,
      },
      STATUS_CONFLICT: {
        message: "The shop was changed by another request. Refresh and try again.",
        status: 409,
      },
      STATUS_UPDATED_AUDIT_FAILED: {
        message: "The status changed, but its audit record could not be saved. Contact support.",
        status: 500,
      },
    };

    const knownError = knownErrors[message];

    if (knownError) {
      return NextResponse.json(
        { success: false, message: knownError.message },
        { status: knownError.status },
      );
    }

    console.error("Update shop status API error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to update shop status." },
      { status: 500 },
    );
  }
}