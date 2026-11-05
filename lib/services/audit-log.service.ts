
import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { AuditLogQuery } from "../validations/audit-log.validation";

export type AuditLogFilters = {
  page?: number;
  pageSize?: number;
  shopId?: string;
  actorType?: string;
  action?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
};

function getColomboDateStart(date: string) {
  return new Date(`${date}T00:00:00+05:30`).toISOString();
}

function getNextDate(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  const next = new Date(Date.UTC(year, month - 1, day + 1));

  return [
    next.getUTCFullYear(),
    String(next.getUTCMonth() + 1).padStart(2, "0"),
    String(next.getUTCDate()).padStart(2, "0"),
  ].join("-");
}

export async function getAuditLogs(filters: AuditLogQuery) {
  const supabase = createAdminClient();

  const {
    page,
    pageSize,
    source,
    actorType,
    action,
    shopId,
    startDate,
    endDate,
  } = filters;

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("audit_log_entries")
    .select("*", { count: "exact" });

  if (source !== "ALL") {
    query = query.eq("source", source);
  }

  if (actorType !== "ALL") {
    query = query.eq("actor_type", actorType);
  }

  if (action) {
    query = query.ilike("action", `%${action}%`);
  }

  if (shopId) {
    query = query.eq("shop_id", shopId);
  }

  if (startDate) {
    query = query.gte(
      "created_at",
      `${startDate}T00:00:00+05:30`
    );
  }

  if (endDate) {
    query = query.lt(
      "created_at",
      `${endDate}T00:00:00+05:30`.replace(
        "T00:00:00",
        "T00:00:00"
      )
    );

    // Include the complete selected end date.
    const nextDay = new Date(`${endDate}T00:00:00+05:30`);
    nextDay.setDate(nextDay.getDate() + 1);

    query = query.lt("created_at", nextDay.toISOString());
  }

  const {
    data,
    error,
    count,
  } = await query
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    console.error("Failed to fetch audit logs:", error);
    throw new Error("Unable to fetch audit logs.");
  }

  const logs = data ?? [];

  const shopIds = [
    ...new Set(
      logs
        .map((log) => log.shop_id)
        .filter((id): id is string => Boolean(id))
    ),
  ];

  let shops: { id: string; name: string; shop_code: string }[] = [];

  if (shopIds.length > 0) {
    const { data: shopData, error: shopError } = await supabase
      .from("shops")
      .select("id, name, shop_code")
      .in("id", shopIds);

    if (shopError) {
      console.error("Failed to fetch audit log shops:", shopError);
      throw new Error("Unable to fetch audit log shop information.");
    }

    shops = shopData ?? [];
  }

  const shopMap = new Map(
    shops.map((shop) => [shop.id, shop])
  );

  const enrichedLogs = logs.map((log) => ({
    ...log,
    shop: log.shop_id
      ? shopMap.get(log.shop_id) ?? null
      : null,
  }));

  return {
    logs: enrichedLogs,
    pagination: {
      page,
      pageSize,
      total: count ?? 0,
      totalPages: Math.ceil((count ?? 0) / pageSize),
    },
  };
}