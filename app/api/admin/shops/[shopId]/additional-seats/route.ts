import { NextRequest, NextResponse } from "next/server";

import { requireSuperAdmin } from "@/lib/auth/require-super-admin";
import { getCurrentAdminProfile } from "@/lib/services/admin-profile.service";
import {
  createAdditionalUserSeatInvoiceSchema,
} from "@/lib/validations/additional-user-seat.validation";
import {
  createAdditionalUserSeatInvoice,
} from "@/lib/services/additional-user-seat.service";

interface RouteContext {
  params: Promise<{
    shopId: string;
  }>;
}

export async function POST(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    await requireSuperAdmin();

    const { shopId } = await params;
    const body = await request.json();

    const validation = createAdditionalUserSeatInvoiceSchema.safeParse({
      ...body,
      shopId,
    });

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed.",
          errors: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const adminProfile = await getCurrentAdminProfile();

    if (!adminProfile) {
      return NextResponse.json(
        {
          success: false,
          message: "Super Admin profile not found.",
        },
        { status: 403 }
      );
    }

    const invoice = await createAdditionalUserSeatInvoice({
      ...validation.data,
      issuedBy: adminProfile.id,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Additional seat invoice created successfully.",
        data: invoice,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create additional seat invoice API error:", error);

    const status =
      typeof error === "object" &&
      error !== null &&
      "status" in error &&
      typeof error.status === "number"
        ? error.status
        : 500;

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Something went wrong.",
      },
      { status }
    );
  }
}