
import { NextRequest, NextResponse } from "next/server";

import { requireSuperAdmin } from "@/lib/auth/require-super-admin";
import {
  updateSubscriptionPlanSchema,
} from "@/lib/validations/subscription-plan.validation";
import {
  updateSubscriptionPlan,
} from "@/lib/services/subscription-plan.service";

type RouteContext = {
  params: Promise<{ planId: string }>;
};

export async function PATCH(
  request: NextRequest,
  { params }: RouteContext,
) {
  try {
    await requireSuperAdmin();

    const { planId } = await params;
    const body: unknown = await request.json();

    const parsed = updateSubscriptionPlanSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Validation failed.",
          issues: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    const plan = await updateSubscriptionPlan(planId, parsed.data);

    return NextResponse.json({ data: plan });
  } catch (error) {
    console.error("PATCH subscription plan error:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Unable to update subscription plan.";

    if (message === "SUBSCRIPTION_PLAN_NOT_FOUND") {
      return NextResponse.json(
        { error: "Subscription plan not found." },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { error: "Unable to update subscription plan." },
      { status: 500 },
    );
  }
}
