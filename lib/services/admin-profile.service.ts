
import "server-only";

import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { connection } from "next/server";

export const getCurrentAdminProfile = cache(async () => {
  await connection();

  const supabase = await createClient();

  // Get authenticated user from Supabase
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/unauthorized");
  }

  // Get the Super Admin profile
  const { data: profile, error: profileError } = await supabase
    .from("super_admin_profiles")
    .select(`
      id,
      full_name,
      phone,
      avatar_url,
      role,
      is_active,
      created_at,
      updated_at
    `)
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    throw new Error("Unable to verify administrator profile.");
  }

  // Verify administrator access
  if (
    !profile ||
    profile.role !== "SUPER_ADMIN" ||
    !profile.is_active
  ) {
    redirect("/unauthorized");
  }

  return {
    ...profile,
    email: user.email ?? null,
  };
});
