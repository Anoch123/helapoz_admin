import { NextResponse } from "next/server";

import { requireSuperAdmin } from "@/lib/auth/require-super-admin";
import { AuthorizationError } from "@/lib/auth/auth-errors";
import { removeShopUser } from "@/lib/services/shop-user-removal.service";

export async function DELETE(
  _request: Request,
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

    const result = await removeShopUser({
      shopId,
      membershipId,
      superAdminId: user.id,
    });

    return NextResponse.json({
      success: true,
      message: result.seatReleased
        ? "Shop user removed and additional seat released successfully."
        : "Shop user removed successfully.",
      data: result,
    });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: error.statusCode },
      );
    }

    if (error instanceof Error && error.message === "SHOP_USER_NOT_FOUND") {
      return NextResponse.json(
        { success: false, message: "Shop user not found." },
        { status: 404 },
      );
    }

    console.error("Remove shop user API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to remove the shop user.",
      },
      { status: 500 },
    );
  }
}
