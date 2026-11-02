import "server-only";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { connection } from "next/server";

export async function getCurrentAdminProfile() {
  await connection();

  const supabase = await createClient();

  // 1. Get authenticated user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/unauthorized");
  }

  // 2. Fetch admin profile
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

  // 3. Database error: deny access
  if (profileError) {
    throw new Error("Unable to verify administrator profile.");
  }

  // 4. Validate administrator permissions
  if (
    !profile ||
    profile.role !== "SUPER_ADMIN" ||
    !profile.is_active
  ) {
    // Clear the current Supabase session
    await supabase.auth.signOut({ scope: "local" });

    redirect("/unauthorized");
  }

  // 5. Return verified administrator details
  return {
    ...profile,
    email: user.email ?? null,
  };
}