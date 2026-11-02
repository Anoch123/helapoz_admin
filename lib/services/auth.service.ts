
import "server-only";

import { createClient } from "@/lib/supabase/server";

export async function signInWithPassword(
  email: string,
  password: string
) {
  const supabase = await createClient();

  const { data, error } =
    await supabase.auth.signInWithPassword({
      email,
      password,
    });

  if (error || !data.user) {
    return {
      success: false as const,
    };
  }

  return {
    success: true as const,
    user: data.user,
  };
}

export async function signOut() {
  const supabase = await createClient();

  const { error } = await supabase.auth.signOut({
    scope: "local",
  });

  if (error) {
    throw new Error(error.message);
  }

  return { success: true };
}
