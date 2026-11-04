
// import "server-only";

// import { createAdminClient } from "@/lib/supabase/admin";

// export interface ShopUserSeatSummary {
//   totalPurchased: number;
//   available: number;
//   assigned: number;
//   revoked: number;
// }

// export async function getShopUserSeatSummary(
//   shopId: string,
// ): Promise<ShopUserSeatSummary> {
//   const supabase = createAdminClient();

//   const [availableResult, assignedResult, revokedResult] =
//     await Promise.all([
//       supabase
//         .from("shop_user_seats")
//         .select("id", { count: "exact", head: true })
//         .eq("shop_id", shopId)
//         .eq("status", "AVAILABLE"),

//       supabase
//         .from("shop_user_seats")
//         .select("id", { count: "exact", head: true })
//         .eq("shop_id", shopId)
//         .eq("status", "ASSIGNED"),

//       supabase
//         .from("shop_user_seats")
//         .select("id", { count: "exact", head: true })
//         .eq("shop_id", shopId)
//         .eq("status", "REVOKED"),
//     ]);

//   if (
//     availableResult.error ||
//     assignedResult.error ||
//     revokedResult.error
//   ) {
//     console.error("Seat summary retrieval failed:", {
//       available: availableResult.error?.message,
//       assigned: assignedResult.error?.message,
//       revoked: revokedResult.error?.message,
//     });

//     throw new Error("Unable to retrieve user seat information.");
//   }

//   const available = availableResult.count ?? 0;
//   const assigned = assignedResult.count ?? 0;
//   const revoked = revokedResult.count ?? 0;

//   return {
//     totalPurchased: available + assigned + revoked,
//     available,
//     assigned,
//     revoked,
//   };
// }


import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

export interface ShopUserSeatSummary {
  totalPurchased: number;
  available: number;
  assigned: number;
  revoked: number;
}

export async function getShopUserSeatSummary(
  shopId: string,
): Promise<ShopUserSeatSummary> {
  const supabase = createAdminClient();

  const getSeatCount = (status: "AVAILABLE" | "ASSIGNED" | "REVOKED") =>
    supabase
      .from("shop_user_seats")
      .select("id, invoices!inner(id)", {
        count: "exact",
        head: true,
      })
      .eq("shop_id", shopId)
      .eq("status", status)
      .eq("invoices.status", "PAID")
      .eq("invoices.invoice_type", "ADDITIONAL_USERS");

  const [availableResult, assignedResult, revokedResult] =
    await Promise.all([
      getSeatCount("AVAILABLE"),
      getSeatCount("ASSIGNED"),
      getSeatCount("REVOKED"),
    ]);

  if (
    availableResult.error ||
    assignedResult.error ||
    revokedResult.error
  ) {
    console.error("Seat summary retrieval failed:", {
      available: availableResult.error?.message,
      assigned: assignedResult.error?.message,
      revoked: revokedResult.error?.message,
    });

    throw new Error("Unable to retrieve user seat information.");
  }

  const available = availableResult.count ?? 0;
  const assigned = assignedResult.count ?? 0;
  const revoked = revokedResult.count ?? 0;

  return {
    totalPurchased: available + assigned + revoked,
    available,
    assigned,
    revoked,
  };
}
