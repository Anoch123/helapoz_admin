
import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

export async function getPermissions() {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("permissions")
    .select(`
      permission_key,
      name,
      description,
      category,
      active,
      is_active,
      created_at
    `)
    .order("category", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    console.error("Get permissions error:", error.message);
    throw new Error("Unable to load permissions.");
  }

  return data ?? [];
}

export async function updatePermissionStatus(
  permissionKey: string,
  isActive: boolean,
) {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("permissions")
    .update({
      active: isActive,
      is_active: isActive,
    })
    .eq("permission_key", permissionKey)
    .select(`
      permission_key,
      name,
      description,
      category,
      active,
      is_active
    `)
    .maybeSingle();

  if (error) {
    console.error("Update permission status error:", error.message);
    throw new Error("Unable to update permission status.");
  }

  if (!data) {
    throw new Error("PERMISSION_NOT_FOUND");
  }

  return data;
}
