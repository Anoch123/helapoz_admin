import { NextResponse } from "next/server";

import { requireSuperAdmin } from "@/lib/auth/require-super-admin";
import { AuthorizationError } from "@/lib/auth/auth-errors";
import { recordPayment } from "@/lib/services/payment.service";
import { recordPaymentSchema } from "@/lib/validations/payment.validation";

export async function POST(request: Request) {
  try {
    const { user } = await requireSuperAdmin();

    const body = await request.json();
    const validation = recordPaymentSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Please check the payment details.",
          fieldErrors: validation.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const result = await recordPayment({
      ...validation.data,
      recordedBy: user.id,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Payment recorded and awaiting verification.",
        ...result,
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode },
      );
    }

    if (error instanceof Error) {
      const errors: Record<string, { message: string; status: number }> = {
        INVOICE_NOT_FOUND: {
          message: "Invoice not found.",
          status: 404,
        },
        INVOICE_NOT_PAYABLE: {
          message: "This invoice cannot accept payments.",
          status: 409,
        },
        INVOICE_ALREADY_PAID: {
          message: "This invoice has already been fully paid.",
          status: 409,
        },
        PAYMENT_EXCEEDS_BALANCE: {
          message: "Payment amount exceeds the outstanding balance.",
          status: 400,
        },
        DUPLICATE_TRANSACTION_REFERENCE: {
          message: "This bank transaction reference has already been recorded.",
          status: 409,
        },
      };

      const knownError = errors[error.message];

      if (knownError) {
        return NextResponse.json(
          { error: knownError.message },
          { status: knownError.status },
        );
      }
    }

    console.error("Record payment API error:", error);

    return NextResponse.json(
      { error: "Unable to record payment." },
      { status: 500 },
    );
  }
}