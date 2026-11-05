
import { NextRequest, NextResponse } from "next/server";

import { requireSuperAdmin } from "@/lib/auth/require-super-admin";
import { getReports } from "@/lib/services/reports.service";
import { reportsQuerySchema } from "@/lib/validations/reports.validation";

export async function GET(request: NextRequest) {
  try {
    await requireSuperAdmin();

    const searchParams = request.nextUrl.searchParams;

    const validation = reportsQuerySchema.safeParse({
      startDate: searchParams.get("startDate"),
      endDate: searchParams.get("endDate"),
    });

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid report date range.",
          errors: validation.error.flatten(),
        },
        { status: 400 },
      );
    }

    const reports = await getReports(
      validation.data.startDate,
      validation.data.endDate,
    );

    return NextResponse.json({
      success: true,
      data: reports,
    });
  } catch (error) {
    console.error("Reports API error:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Unable to generate reports.";

    const status =
      message.includes("Unauthorized") ? 401 :
      message.includes("Forbidden") ? 403 : 500;

    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status },
    );
  }
}
