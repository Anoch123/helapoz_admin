"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Check, CheckCircle2, Eye, EyeOff, Loader2 } from "lucide-react";
import type { ZodIssue } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useCreateShop } from "@/hooks/useCreateShop";
import {
  createShopSchema,
  ShopBusinessType,
  shopBusinessTypes,
  type CreateShopInput,
} from "@/lib/validations/shop.validation";

import { useSubscriptionPlans } from "@/hooks/useSubscriptionPlans";

type FormErrors = Record<string, string>;

const initialValues: CreateShopInput = {
  planId: "",
  shop: {
    businessType: "" as ShopBusinessType,
    name: "",
    legalName: "",
    businessRegistrationNo: "",
    contactEmail: "",
    contactPhone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    district: "",
    postalCode: "",
  },
  shopAdmin: {
    fullName: "",
    email: "",
    phone: "",
    password: "",
  },
  shopUser: {
    fullName: "",
    email: "",
    phone: "",
    password: "",
  },
};

function getErrorsFromIssues(issues: ZodIssue[]): FormErrors {
  const errors: FormErrors = {};

  for (const issue of issues) {
    const path = issue.path.join(".");

    if (path && !errors[path]) {
      errors[path] = issue.message;
    }
  }

  return errors;
}

const inputBase =
  "h-11 rounded-xl focus-visible:border-indigo-500 focus-visible:ring-4 focus-visible:ring-indigo-500/15";

function inputClass(error?: string, extra = "") {
  return `${inputBase} ${
    error
      ? "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/15"
      : ""
  } ${extra}`;
}

/* ----------------------------- building blocks ----------------------------- */

function Section({
  step,
  title,
  description,
  children,
}: {
  step: number;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border bg-card p-6">
      <div className="flex items-start gap-4">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-indigo-500/10 text-sm font-semibold text-indigo-600">
          {step}
        </div>
        <div>
          <h2 className="font-semibold">{title}</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
        </div>
      </div>

      <div className="mt-6">{children}</div>
    </section>
  );
}

function FormField({
  label,
  name,
  value,
  onChange,
  error,
  type = "text",
  required = false,
  placeholder,
  className = "",
}: {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor={name}>
        {label}
        {required && <span className="text-destructive"> *</span>}
      </Label>

      <Input
        id={name}
        name={name}
        type={type}
        value={value}
        placeholder={placeholder}
        required={required}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : undefined}
        onChange={(event) => onChange(event.target.value)}
        className={inputClass(error)}
      />

      {error && (
        <p id={`${name}-error`} className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

function PasswordField({
  label,
  name,
  value,
  onChange,
  error,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="space-y-2">
      <Label htmlFor={name}>
        {label}
        <span className="text-destructive"> *</span>
      </Label>

      <div className="relative">
        <Input
          id={name}
          name={name}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          minLength={12}
          maxLength={72}
          autoComplete="new-password"
          required
          aria-invalid={!!error}
          aria-describedby={error ? `${name}-error` : undefined}
          className={inputClass(error, "pr-11")}
          placeholder="Minimum 12 characters"
        />

        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          className="absolute right-1.5 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground"
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>

      {error && (
        <p id={`${name}-error`} className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-muted ${className}`} />;
}

/* ---------------------------------- form ---------------------------------- */

export function CreateShopForm() {
  const router = useRouter();
  const { createShop, isPending, error: apiError } = useCreateShop();
  const { plans, isLoading: isPlansLoading } = useSubscriptionPlans();
  const activePlans = plans.filter((plan) => plan.is_active);

  const [form, setForm] = useState<CreateShopInput>(initialValues);
  const businessTypeLabels: Record<ShopBusinessType, string> = {
    RETAIL: "Retail",
    RESTAURANT: "Restaurant",
    HARDWARE: "Hardware",
    CLOTHING: "Clothing & Fashion",
    PHARMACY: "Pharmacy",
    ELECTRONICS: "Electronics",
    OTHER: "Other",
  };
  const [errors, setErrors] = useState<FormErrors>({});
  const [validationMessage, setValidationMessage] = useState<string | null>(
    null,
  );
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [createdShopCode, setCreatedShopCode] = useState<string | null>(null);

  const selectedPlan = activePlans.find((plan) => plan.id === form.planId);

  function clearFieldError(path: string) {
    setErrors((current) => {
      if (!current[path]) return current;

      const updated = { ...current };
      delete updated[path];

      return updated;
    });

    setValidationMessage(null);
  }

  function updateShop(field: keyof CreateShopInput["shop"], value: string) {
    const path = `shop.${field}`;

    setForm((current) => ({
      ...current,
      shop: {
        ...current.shop,
        [field]: value,
      },
    }));

    clearFieldError(path);
  }

  function updateAdmin(
    field: keyof CreateShopInput["shopAdmin"],
    value: string,
  ) {
    const path = `shopAdmin.${field}`;

    setForm((current) => ({
      ...current,
      shopAdmin: {
        ...current.shopAdmin,
        [field]: value,
      },
    }));

    clearFieldError(path);
  }

  function updateUser(field: keyof CreateShopInput["shopUser"], value: string) {
    const path = `shopUser.${field}`;

    setForm((current) => ({
      ...current,
      shopUser: {
        ...current.shopUser,
        [field]: value,
      },
    }));

    clearFieldError(path);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErrors({});
    setValidationMessage(null);
    setSuccessMessage(null);
    setCreatedShopCode(null);

    const validation = createShopSchema.safeParse(form);

    if (!validation.success) {
      setErrors(getErrorsFromIssues(validation.error.issues));
      setValidationMessage("Please correct the highlighted fields.");
      return;
    }

    const result = await createShop(validation.data);

    if (!result.success) {
      const serverErrors: FormErrors = {};
      for (const [field, messages] of Object.entries(result.errors ?? {})) {
        if (messages?.[0]) serverErrors[field] = messages[0];
      }
      setErrors(serverErrors);
      setValidationMessage(result.message ?? "Unable to create shop.");
      return;
    }

    setSuccessMessage("Shop and accounts were created successfully.");
    setCreatedShopCode(result.data?.shop.shopCode ?? null);
    setForm(initialValues);
    setErrors({});
  }

  const money = (value: number, currency: string) =>
    `${currency} ${value.toLocaleString("en-LK")}`;

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="grid gap-6 p-4 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start"
    >
      {/* ------------------------------ Left: inputs ------------------------------ */}
      <div className="space-y-6">
        {/* Plan */}
        <Section
          step={1}
          title="Subscription plan"
          description="Choose the plan this shop will be billed on."
        >
          {isPlansLoading ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <Skeleton className="h-28 rounded-2xl" />
              <Skeleton className="h-28 rounded-2xl" />
            </div>
          ) : activePlans.length === 0 ? (
            <p className="rounded-2xl border border-dashed p-6 text-center text-sm text-muted-foreground">
              No active subscription plans available.
            </p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {activePlans.map((plan) => {
                const active = plan.id === form.planId;
                return (
                  <button
                    key={plan.id}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => {
                      setForm((current) => ({ ...current, planId: plan.id }));
                      clearFieldError("planId");
                    }}
                    className={`relative rounded-2xl border p-4 text-left transition ${
                      active
                        ? "border-indigo-500 bg-indigo-500/5 ring-4 ring-indigo-500/10"
                        : "hover:bg-muted/50"
                    }`}
                  >
                    {active && (
                      <span className="absolute right-3 top-3 flex size-5 items-center justify-center rounded-full bg-indigo-600 text-white">
                        <Check className="size-3" />
                      </span>
                    )}
                    <p className="pr-6 font-medium">{plan.name}</p>
                    <p className="mt-2">
                      <span className="text-2xl font-semibold tabular-nums tracking-tight">
                        {money(plan.monthly_price, plan.currency)}
                      </span>
                      <span className="ml-1 text-xs text-muted-foreground">
                        / month
                      </span>
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {plan.included_admin_users} admin ·{" "}
                      {plan.included_shop_users} shop user
                      {plan.included_shop_users === 1 ? "" : "s"}
                    </p>
                  </button>
                );
              })}
            </div>
          )}

          {errors.planId && (
            <p className="mt-3 text-xs text-destructive">{errors.planId}</p>
          )}
        </Section>

        {/* Shop details */}
        <Section
          step={2}
          title="Shop details"
          description="Business information for this shop."
        >
          <div className="grid gap-5 md:grid-cols-2">
            {/* Business Type */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="businessType">
                Business Type
                <span className="text-destructive"> *</span>
              </Label>

              <select
                id="businessType"
                name="businessType"
                value={form.shop.businessType}
                required
                aria-invalid={!!errors["shop.businessType"]}
                aria-describedby={
                  errors["shop.businessType"] ? "businessType-error" : undefined
                }
                onChange={(event) =>
                  updateShop(
                    "businessType",
                    event.target.value as ShopBusinessType,
                  )
                }
                className={`${inputClass(
                  errors["shop.businessType"],
                )} w-full border bg-background px-3 text-sm`}
              >
                <option value="" disabled>
                  Select business type
                </option>

                {shopBusinessTypes.map((type) => (
                  <option key={type} value={type}>
                    {businessTypeLabels[type]}
                  </option>
                ))}
              </select>

              {errors["shop.businessType"] && (
                <p id="businessType-error" className="text-xs text-destructive">
                  {errors["shop.businessType"]}
                </p>
              )}
            </div>
            <FormField
              label="Shop Name"
              name="shopName"
              value={form.shop.name}
              onChange={(value) => updateShop("name", value)}
              error={errors["shop.name"]}
              required
            />

            <FormField
              label="Legal Business Name"
              name="legalName"
              value={form.shop.legalName ?? ""}
              onChange={(value) => updateShop("legalName", value)}
              error={errors["shop.legalName"]}
            />

            <FormField
              label="Business Registration Number"
              name="businessRegistrationNo"
              value={form.shop.businessRegistrationNo ?? ""}
              onChange={(value) => updateShop("businessRegistrationNo", value)}
              error={errors["shop.businessRegistrationNo"]}
              className="md:col-span-2"
            />

            <FormField
              label="Contact Email"
              name="shopContactEmail"
              type="email"
              value={form.shop.contactEmail}
              onChange={(value) => updateShop("contactEmail", value)}
              error={errors["shop.contactEmail"]}
              required
            />

            <FormField
              label="Contact Phone"
              name="shopContactPhone"
              value={form.shop.contactPhone}
              onChange={(value) => updateShop("contactPhone", value)}
              error={errors["shop.contactPhone"]}
              required
            />
          </div>

          <div className="my-6 border-t" />

          <div className="grid gap-5 md:grid-cols-2">
            <FormField
              label="Address Line 1"
              name="addressLine1"
              value={form.shop.addressLine1}
              onChange={(value) => updateShop("addressLine1", value)}
              error={errors["shop.addressLine1"]}
              required
            />

            <FormField
              label="Address Line 2"
              name="addressLine2"
              value={form.shop.addressLine2 ?? ""}
              onChange={(value) => updateShop("addressLine2", value)}
              error={errors["shop.addressLine2"]}
            />

            <FormField
              label="City"
              name="city"
              value={form.shop.city}
              onChange={(value) => updateShop("city", value)}
              error={errors["shop.city"]}
              required
            />

            <FormField
              label="District"
              name="district"
              value={form.shop.district ?? ""}
              onChange={(value) => updateShop("district", value)}
              error={errors["shop.district"]}
            />

            <FormField
              label="Postal Code"
              name="postalCode"
              value={form.shop.postalCode ?? ""}
              onChange={(value) => updateShop("postalCode", value)}
              error={errors["shop.postalCode"]}
            />
          </div>
        </Section>

        {/* Shop admin */}
        <Section
          step={3}
          title="Shop admin account"
          description="Full administrative access within this shop."
        >
          <div className="grid gap-5 md:grid-cols-2">
            <FormField
              label="Full Name"
              name="adminFullName"
              value={form.shopAdmin.fullName}
              onChange={(value) => updateAdmin("fullName", value)}
              error={errors["shopAdmin.fullName"]}
              required
            />

            <FormField
              label="Email Address"
              name="adminEmail"
              type="email"
              value={form.shopAdmin.email}
              onChange={(value) => updateAdmin("email", value)}
              error={errors["shopAdmin.email"]}
              required
            />

            <FormField
              label="Phone Number"
              name="adminPhone"
              value={form.shopAdmin.phone}
              onChange={(value) => updateAdmin("phone", value)}
              error={errors["shopAdmin.phone"]}
              required
            />

            <PasswordField
              label="Initial Password"
              name="adminPassword"
              value={form.shopAdmin.password}
              onChange={(value) => updateAdmin("password", value)}
              error={errors["shopAdmin.password"]}
            />
          </div>
        </Section>

        {/* Shop user */}
        <Section
          step={4}
          title="Shop user account"
          description="Receives the default Shop User role."
        >
          <div className="grid gap-5 md:grid-cols-2">
            <FormField
              label="Full Name"
              name="userFullName"
              value={form.shopUser.fullName}
              onChange={(value) => updateUser("fullName", value)}
              error={errors["shopUser.fullName"]}
              required
            />

            <FormField
              label="Email Address"
              name="userEmail"
              type="email"
              value={form.shopUser.email}
              onChange={(value) => updateUser("email", value)}
              error={errors["shopUser.email"]}
              required
            />

            <FormField
              label="Phone Number"
              name="userPhone"
              value={form.shopUser.phone}
              onChange={(value) => updateUser("phone", value)}
              error={errors["shopUser.phone"]}
              required
            />

            <PasswordField
              label="Initial Password"
              name="userPassword"
              value={form.shopUser.password}
              onChange={(value) => updateUser("password", value)}
              error={errors["shopUser.password"]}
            />
          </div>
        </Section>
      </div>

      {/* ------------------------- Right: summary + submit ------------------------- */}
      <aside className="space-y-4 lg:sticky lg:top-4">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-600 to-violet-700 p-6 text-white shadow-lg">
          <div className="pointer-events-none absolute -right-12 -top-12 size-48 rounded-full bg-white/10 blur-2xl" />
          <div className="relative">
            <p className="text-sm font-medium text-indigo-100">Selected plan</p>

            {selectedPlan ? (
              <>
                <p className="mt-1 text-lg font-semibold">
                  {selectedPlan.name}
                </p>
                <p className="mt-3">
                  <span className="text-3xl font-semibold tabular-nums tracking-tight">
                    {money(selectedPlan.monthly_price, selectedPlan.currency)}
                  </span>
                  <span className="ml-1 text-sm text-indigo-100">/ month</span>
                </p>

                {selectedPlan.description && (
                  <p className="mt-3 text-sm leading-6 text-indigo-100/80">
                    {selectedPlan.description}
                  </p>
                )}

                <dl className="mt-5 space-y-3 border-t border-white/15 pt-4 text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="text-indigo-100/80">Included</dt>
                    <dd className="text-right font-medium">
                      {selectedPlan.included_admin_users} admin /{" "}
                      {selectedPlan.included_shop_users} shop user
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-indigo-100/80">Extra shop user</dt>
                    <dd className="text-right font-medium">
                      {money(
                        selectedPlan.additional_user_price,
                        selectedPlan.currency,
                      )}
                      <span className="block text-xs font-normal text-indigo-100/70">
                        one-time charge
                      </span>
                    </dd>
                  </div>
                </dl>
              </>
            ) : (
              <p className="mt-2 text-sm text-indigo-100/80">
                Pick a plan to see pricing and what’s included.
              </p>
            )}
          </div>
        </div>

        {(validationMessage || apiError) && (
          <p
            role="alert"
            className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive"
          >
            {validationMessage || apiError}
          </p>
        )}

        {successMessage && (
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4">
            <p className="flex items-center gap-2 font-medium text-emerald-700 dark:text-emerald-300">
              <CheckCircle2 className="size-4" />
              {successMessage}
            </p>

            {createdShopCode && (
              <p className="mt-2 text-sm">
                Shop code:{" "}
                <strong className="rounded-md bg-background px-2 py-0.5 font-mono">
                  {createdShopCode}
                </strong>
              </p>
            )}
          </div>
        )}

        <Button
          type="submit"
          disabled={isPending || isPlansLoading || activePlans.length === 0}
          className="h-12 w-full rounded-xl bg-indigo-600 text-sm font-semibold hover:bg-indigo-700"
        >
          {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
          {isPending ? "Creating shop..." : "Create shop"}
        </Button>

        <Button
          type="button"
          variant="outline"
          disabled={isPending}
          onClick={() => router.back()}
          className="h-11 w-full rounded-xl"
        >
          Cancel
        </Button>
      </aside>
    </form>
  );
}
