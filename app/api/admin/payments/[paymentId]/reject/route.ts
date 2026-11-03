import { NextResponse } from "next/server";

import { requireSuperAdmin } from "@/lib/auth/require-super-admin";
import { AuthorizationError } from "@/lib/auth/auth-errors";
import { rejectPayment } from "@/lib/services/payment-rejection.service";
import { rejectPaymentSchema } from "@/lib/validations/reject-payment.validation";

type RouteContext = {
  params: Promise<{ paymentId: string }>;
};

export async function POST(
  request: Request,
  { params }: RouteContext,
) {
  try {
    const { user } = await requireSuperAdmin();
    const { paymentId } = await params;

    const validation = rejectPaymentSchema.safeParse(
      await request.json(),
    );

    if (!validation.success) {
      return NextResponse.json(
        { error: "A valid rejection reason is required." },
        { status: 400 },
      );
    }

    const result = await rejectPayment({
      paymentId,
      superAdminId: user.id,
      reason: validation.data.reason,
    });

    return NextResponse.json({
      success: true,
      message: "Payment rejected.",
      payment: result,
    });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode },
      );
    }

    if (error instanceof Error) {
      if (error.message === "PAYMENT_NOT_FOUND") {
        return NextResponse.json(
          { error: "Payment not found." },
          { status: 404 },
        );
      }

      if (error.message === "PAYMENT_NOT_PENDING") {
        return NextResponse.json(
          { error: "Only pending payments can be rejected." },
          { status: 409 },
        );
      }
    }

    console.error("Reject payment API error:", error);

    return NextResponse.json(
      { error: "Unable to reject payment." },
      { status: 500 },
    );
  }
}