
"use client";

import { useActionState, useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { loginAction } from "@/hooks/useLogin";

import { LoginState } from "@/lib/types/login.type";

const initialState: LoginState = {};

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);

  const [state, formAction, isPending] = useActionState(
    loginAction,
    initialState
  );

  return (
    <form
      action={formAction}
      noValidate
      className="flex w-full flex-col gap-5"
    >
      {/* Email */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Email</Label>

        <Input
          id="email"
          name="email"
          type="email"
          placeholder="admin@helapoz.com"
          autoComplete="email"
          required
          aria-invalid={!!state.errors?.email?.length}
          aria-describedby={
            state.errors?.email?.length
              ? "email-error"
              : undefined
          }
          className="h-11"
        />

        {state.errors?.email?.[0] && (
          <p
            id="email-error"
            role="alert"
            className="text-sm text-destructive"
          >
            {state.errors.email[0]}
          </p>
        )}
      </div>

      {/* Password */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="password">Password</Label>

        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            autoComplete="current-password"
            required
            aria-invalid={!!state.errors?.password?.length}
            aria-describedby={
              state.errors?.password?.length
                ? "password-error"
                : undefined
            }
            className="h-11 pr-11"
          />

          <button
            type="button"
            onClick={() =>
              setShowPassword((previous) => !previous)
            }
            className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
            aria-label={
              showPassword ? "Hide password" : "Show password"
            }
          >
            {showPassword ? (
              <EyeOff className="size-4" />
            ) : (
              <Eye className="size-4" />
            )}
          </button>
        </div>

        {state.errors?.password?.[0] && (
          <p
            id="password-error"
            role="alert"
            className="text-sm text-destructive"
          >
            {state.errors.password[0]}
          </p>
        )}
      </div>

      {/* Authentication Error */}
      {state.error && (
        <p
          role="alert"
          className="text-sm text-destructive"
        >
          {state.error}
        </p>
      )}

      {/* Submit */}
      <Button
        type="submit"
        size="lg"
        className="h-11 w-full"
        disabled={isPending}
      >
        {isPending && (
          <Loader2 className="size-4 animate-spin" />
        )}

        {isPending ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  );
}
