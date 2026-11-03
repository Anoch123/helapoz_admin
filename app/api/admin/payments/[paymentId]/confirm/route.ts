import { NextResponse } from "next/server";

import { requireSuperAdmin } from "@/lib/auth/require-super-admin";
import { AuthorizationError } from "@/lib/auth/auth-errors";
import { confirmPayment } from "@/lib/services/payment-confirmation.service";

type RouteContext = {
  params: Promise<{ paymentId: string }>;
};

export async function POST(
  _: Request,
  { params }: RouteContext,
) {
  try {
    const { user } = await requireSuperAdmin();
    const { paymentId } = await params;

    const result = await confirmPayment({
      paymentId,
      superAdminId: user.id,
    });

    return NextResponse.json({
      success: true,
      message: "Payment confirmed successfully.",
      result,
    });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode },
      );
    }

    if (error instanceof Error) {
      const errorStatuses: Record<string, number> = {
        PAYMENT_NOT_FOUND: 404,
        PAYMENT_NOT_PENDING: 409,
        INVOICE_NOT_FOUND: 404,
        INVOICE_NOT_PAYABLE: 409,
        PAYMENT_EXCEEDS_INVOICE_BALANCE: 409,
        SUBSCRIPTION_NOT_FOUND: 409,
      };

      const status = errorStatuses[error.message];

      if (status) {
        return NextResponse.json(
          { error: error.message },
          { status },
        );
      }
    }

    console.error("Confirm payment API error:", error);

    return NextResponse.json(
      { error: "Unable to confirm payment." },
      { status: 500 },
    );
  }
}