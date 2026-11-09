
import { NextRequest, NextResponse } from "next/server";

import { requireSuperAdmin } from "@/lib/auth/require-super-admin";
import {
  createSubscriptionPlanSchema,
} from "@/lib/validations/subscription-plan.validation";
import {
  createSubscriptionPlan,
  getSubscriptionPlans,
} from "@/lib/services/subscription-plan.service";

export async function GET() {
  try {
    await requireSuperAdmin();

    const plans = await getSubscriptionPlans();

    return NextResponse.json({ data: plans });
  } catch (error) {
    console.error("GET subscription plans error:", error);

    return NextResponse.json(
      { error: "Unable to fetch subscription plans." },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireSuperAdmin();

    const body: unknown = await request.json();
    const parsed = createSubscriptionPlanSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Validation failed.",
          issues: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    const plan = await createSubscriptionPlan(parsed.data);

    return NextResponse.json({ data: plan }, { status: 201 });
  } catch (error) {
    console.error("POST subscription plan error:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Unable to create subscription plan.";

    if (message.includes("already exists")) {
      return NextResponse.json({ error: message }, { status: 409 });
    }

    return NextResponse.json(
      { error: "Unable to create subscription plan." },
      { status: 500 },
    );
  }
}
