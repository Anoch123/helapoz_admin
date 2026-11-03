import { NextRequest, NextResponse } from "next/server";

import { requireSuperAdmin } from "@/lib/auth/require-super-admin";
import { AuthorizationError } from "@/lib/auth/auth-errors";
import { provisionShop } from "@/lib/services/shop-provisioning.service";
import { createShopSchema } from "@/lib/validations/shop.validation";
import { updateShopSchema } from "@/lib/validations/update-shop.validation";
import { updateShop } from "@/lib/services/update-shop.service";

export async function POST(request: NextRequest) {
  try {
    // 1. Verify Super Admin authorization.
    const { user } = await requireSuperAdmin();

    // 2. Read and validate request data.
    const body: unknown = await request.json();

    const validation = createShopSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Please check the submitted shop details.",
          errors: {
            fieldErrors: Object.fromEntries(
                validation.error.issues
                .filter((issue) => issue.path.length > 0)
                .map((issue) => [issue.path.join("."), issue.message]),
            ),
          },
        },
        { status: 400 },
      );
    }

    // 3. Provision the shop and its accounts.
    const result = await provisionShop({
      input: validation.data,
      superAdminId: user.id,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Shop and accounts created successfully.",
        data: result,
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
        },
        { status: error.statusCode },
      );
    }

    // Do not log request bodies or passwords.
    console.error("Create shop API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to create the shop. Please try again.",
      },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ shopId: string }> },
) {
  try {
    const { user } = await requireSuperAdmin();
    const { shopId } = await params;

    const body = await request.json();

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