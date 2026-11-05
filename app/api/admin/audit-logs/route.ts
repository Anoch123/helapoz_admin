import { NextRequest, NextResponse } from "next/server";

import { requireSuperAdmin } from "@/lib/auth/require-super-admin";

import { getAuditLogs } from "@/lib/services/audit-log.service";
import { auditLogQuerySchema } from "@/lib/validations/audit-log.validation";
import { AuthorizationError } from "@/lib/auth/auth-errors";

export async function GET(request: NextRequest) {
  try {
    await requireSuperAdmin();

    const searchParams = request.nextUrl.searchParams;

    const parsed = auditLogQuerySchema.safeParse({
      page: searchParams.get("page") ?? undefined,
      pageSize: searchParams.get("pageSize") ?? undefined,
      source: searchParams.get("source") ?? undefined,
      actorType: searchParams.get("actorType") ?? undefined,
      action: searchParams.get("action") ?? undefined,
      shopId: searchParams.get("shopId") ?? undefined,
      startDate: searchParams.get("startDate") ?? undefined,
      endDate: searchParams.get("endDate") ?? undefined,
    });

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid audit log filters.",
          errors: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const result = await getAuditLogs(parsed.data);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Audit logs API error:", error);

    if (error instanceof AuthorizationError) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
        }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Unable to retrieve audit logs.",
      },
      { status: 500 }
    );
  }
}