
"use server";

import { redirect } from "next/navigation";

import { loginSchema } from "@/lib/validations/auth.schema";
import { signInWithPassword } from "@/lib/services/auth.service";
import { LoginState } from "@/lib/types/login.type";

export async function loginAction(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  // 1. Validate form data
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  // 2. Return field-level validation errors
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;

    return {
      errors: {
        email: fieldErrors.email,
        password: fieldErrors.password,
      },
    };
  }

  // 3. Authenticate using Supabase
  const result = await signInWithPassword(
    parsed.data.email,
    parsed.data.password
  );

  // 4. Handle authentication failure
  if (!result.success) {
    return {
      error: "Invalid email or password.",
    };
  }

  // 5. Redirect after successful authentication
  redirect("/dashboard");
}
