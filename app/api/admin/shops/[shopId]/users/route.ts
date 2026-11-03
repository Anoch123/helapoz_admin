import { NextRequest, NextResponse } from "next/server";

import { requireSuperAdmin } from "@/lib/auth/require-super-admin";
import { AuthorizationError } from "@/lib/auth/auth-errors";
import { createShopUserSchema } from "@/lib/validations/create-shop-user.validation";
import { createShopUser } from "@/lib/services/shop-user.service";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ shopId: string }> },
) {
  try {
    const { user } = await requireSuperAdmin();
    const { shopId } = await params;

    const body = await request.json();

    const validation = createShopUserSchema.safeParse(body);

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

    const result = await createShopUser({
      shopId,
      superAdminId: user.id,
      input: validation.data,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Shop user created successfully.",
        data: result,
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: error.statusCode },
      );
    }

    if (error instanceof Error) {
      const knownErrors: Record<string, { message: string; status: number }> = {
        SHOP_NOT_FOUND: {
          message: "Shop not found.",
          status: 404,
        },
        SHOP_NOT_ACTIVE: {
          message: "Users can only be added to active shops.",
          status: 409,
        },
        EMAIL_ALREADY_REGISTERED: {
          message: "This email address is already registered.",
          status: 409,
        },
      };

      const knownError = knownErrors[error.message];

      if (knownError) {
        return NextResponse.json(
          { success: false, message: knownError.message },
          { status: knownError.status },
        );
      }
    }

    console.error("Create shop user API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to create the shop user.",
      },
      { status: 500 },
    );
  }
}