
import { NextRequest, NextResponse } from "next/server";

import { requireSuperAdmin } from "@/lib/auth/require-super-admin";
import { AuthorizationError } from "@/lib/auth/auth-errors";
import { updateShop } from "@/lib/services/update-shop.service";
import { updateShopSchema } from "@/lib/validations/update-shop.validation";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ shopId: string }> },
) {
  try {
    const { user } = await requireSuperAdmin();
    const { shopId } = await params;

    const body: unknown = await request.json();

    const validation = updateShopSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Please check the information you entered.",
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

    const shop = await updateShop({
      shopId,
      superAdminId: user.id,
      input: validation.data,
    });

    return NextResponse.json({
      success: true,
      message: "Shop information updated successfully.",
      data: {
        id: shop.id,
        shopCode: shop.shop_code,
        name: shop.name,
      },
    });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: error.statusCode },
      );
    }

    if (error instanceof Error && error.message === "SHOP_NOT_FOUND") {
      return NextResponse.json(
        { success: false, message: "Shop not found." },
        { status: 404 },
      );
    }

    console.error("Update shop API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to update shop information.",
      },
      { status: 500 },
    );
  }
}
