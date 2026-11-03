import "server-only";

import { createClient } from "@/lib/supabase/server";
import { AuthorizationError } from "@/lib/auth/auth-errors";

export async function requireSuperAdmin() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new AuthorizationError(
      "Authentication required.",
      401,
    );
  }

  const { data: profile, error: profileError } = await supabase
    .from("super_admin_profiles")
    .select("id, full_name, role, is_active")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    throw new Error("Unable to verify administrator access.");
  }

  if (
    !profile ||
    profile.role !== "SUPER_ADMIN" ||
    !profile.is_active
  ) {
    throw new AuthorizationError(
      "You do not have permission to perform this operation.",
      403,
    );
  }

  return {
    user,
    profile,
  };
}