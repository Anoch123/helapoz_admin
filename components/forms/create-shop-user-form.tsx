"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useCreateShopUser } from "@/hooks/useCreateShopUser";

interface CreateShopUserFormProps {
  shopId: string;
  shopName: string;
  shopCode: string;
}

interface FormValues {
  fullName: string;
  email: string;
  phone: string;
  password: string;
}

export function CreateShopUserForm({
  shopId,
  shopName,
  shopCode,
}: CreateShopUserFormProps) {
  const { createUser, isPending } = useCreateShopUser(shopId);

  const [form, setForm] = useState<FormValues>({
    fullName: "",
    email: "",
    phone: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  function handleChange(field: keyof FormValues, value: string) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));

    setFieldErrors((previous) => ({
      ...previous,
      [field]: "",
    }));

    setFormError(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setFieldErrors({});
    setFormError(null);

    const result = await createUser(form);

    if (!result.success) {
      setFieldErrors(result.fieldErrors);
      setFormError(result.message);
    }
  }

  function renderField({
    label,
    name,
    required = false,
    type = "text",
    autoComplete,
  }: {
    label: string;
    name: keyof FormValues;
    required?: boolean;
    type?: string;
    autoComplete?: string;
  }) {
    const error = fieldErrors[name];
    const id = `shop-user-${name}`;

    return (
      <div className="space-y-2">
        <Label htmlFor={id}>
          {label}
          {required && <span className="ml-1 text-destructive">*</span>}
        </Label>

        <Input
          id={id}
          type={type}
          value={form[name]}
          onChange={(event) => handleChange(name, event.target.value)}
          autoComplete={autoComplete}
          aria-invalid={Boolean(error)}
          disabled={isPending}
        />

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-lg border bg-muted/30 p-4">
        <p className="text-sm text-muted-foreground">Creating an account for</p>
        <p className="font-semibold">{shopName}</p>
        <p className="text-sm text-muted-foreground">
          Shop Code: {shopCode}
        </p>
      </div>

      <section className="space-y-4">
        <div>
          <h2 className="font-semibold">User Information</h2>
          <p className="text-sm text-muted-foreground">
            Enter the staff member&apos;s account details.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          {renderField({
            label: "Full Name",
            name: "fullName",
            required: true,
            autoComplete: "name"
          })}

          {renderField({
            label: "Email Address",
            name: "email",
            type: "email",
            required: true,
            autoComplete: "email"
          })}

          {renderField({
            label: "Phone Number",
            name: "phone",
            required: true,
            autoComplete: "tel"
          })}

          <div className="space-y-2">
            <Label htmlFor="shop-user-password">
              Initial Password
              <span className="ml-1 text-destructive">*</span>
            </Label>

            <div className="relative">
              <Input
                id="shop-user-password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(event) =>
                  handleChange("password", event.target.value)
                }
                autoComplete="new-password"
                aria-invalid={Boolean(fieldErrors.password)}
                disabled={isPending}
                className="pr-10"
              />

              <button
                type="button"
                onClick={() => setShowPassword((previous) => !previous)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>

            {fieldErrors.password && (
              <p className="text-sm text-destructive">
                {fieldErrors.password}
              </p>
            )}

            <p className="text-xs text-muted-foreground">
              Use at least 12 characters. This password will not be sent by email.
            </p>
          </div>
        </div>
      </section>

      <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-4">
        <p className="text-sm font-medium">Account permissions</p>
        <p className="mt-1 text-sm text-muted-foreground">
          This account will be created as a Shop User. It will not receive
          POS permissions until they are assigned separately.
        </p>
      </div>

      {formError && (
        <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3">
          <p className="text-sm text-destructive">{formError}</p>
        </div>
      )}

      <div className="flex flex-wrap justify-end gap-3 border-t pt-5">
        <Button variant="outline" disabled={isPending}>
          <Link href={`/manage-shops/${shopId}`}>
            Cancel
          </Link>
        </Button>

        <Button type="submit" disabled={isPending}>
          {isPending ? "Creating Account..." : "Create Shop User"}
        </Button>
      </div>
    </form>
  );
}