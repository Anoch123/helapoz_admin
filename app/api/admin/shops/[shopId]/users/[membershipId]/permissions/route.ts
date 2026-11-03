import { NextResponse } from "next/server";

import { requireSuperAdmin } from "@/lib/auth/require-super-admin";
import { AuthorizationError } from "@/lib/auth/auth-errors";
import {
  getShopUserPermissions,
  updateShopUserPermissions,
} from "@/lib/services/shop-user-permissions.service";
import { updateShopUserPermissionsSchema } from "@/lib/validations/shop-user-permissions.validation";

type RouteContext = {
  params: Promise<{
    shopId: string;
    membershipId: string;
  }>;
};

function handleError(error: unknown) {
  if (error instanceof AuthorizationError) {
    return NextResponse.json(
      { error: error.message },
      { status: error.statusCode },
    );
  }

  if (error instanceof Error) {
    if (error.message === "MEMBERSHIP_NOT_FOUND") {
      return NextResponse.json(
        { error: "Shop User not found." },
        { status: 404 },
      );
    }

    if (error.message === "INVALID_MEMBERSHIP_ROLE") {
      return NextResponse.json(
        { error: "Permissions can only be managed for Shop Users." },
        { status: 403 },
      );
    }

    if (error.message === "INVALID_PERMISSION_KEYS") {
      return NextResponse.json(
        { error: "One or more selected permissions are invalid." },
        { status: 400 },
      );
    }
  }

  console.error("Shop User permissions API error:", error);

  return NextResponse.json(
    { error: "An unexpected error occurred." },
    { status: 500 },
  );
}

export async function GET(_: Request, { params }: RouteContext) {
  try {
    await requireSuperAdmin();

    const { shopId, membershipId } = await params;
    const data = await getShopUserPermissions(shopId, membershipId);

    return NextResponse.json(data);
  } catch (error) {
    return handleError(error);
  }
}

export async function PUT(request: Request, { params }: RouteContext) {
  try {
    const { user } = await requireSuperAdmin();
    const { shopId, membershipId } = await params;

    const body = await request.json();
    const validation = updateShopUserPermissionsSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Please check the submitted permissions.",
          fieldErrors: validation.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    await updateShopUserPermissions({
      shopId,
      membershipId,
      superAdminId: user.id,
      input: validation.data,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleError(error);
  }
}