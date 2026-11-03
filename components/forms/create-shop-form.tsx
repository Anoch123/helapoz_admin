"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import type { ZodIssue } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { useCreateShop } from "@/hooks/useCreateShop";
import {
  createShopSchema,
  type CreateShopInput,
} from "@/lib/validations/shop.validation";

type FormErrors = Record<string, string>;

const initialValues: CreateShopInput = {
  shop: {
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

function FormField({
  label,
  name,
  value,
  onChange,
  error,
  type = "text",
  required = false,
  placeholder,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div className="space-y-2">
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
        className={error ? "border-destructive focus-visible:ring-destructive" : ""}
      />

      {error && (
        <p id={`${name}-error`} className="text-sm text-destructive">
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
          className={`pr-10 ${
            error ? "border-destructive focus-visible:ring-destructive" : ""
          }`}
          placeholder="Minimum 12 characters"
        />

        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? (
            <EyeOff className="size-4" />
          ) : (
            <Eye className="size-4" />
          )}
        </button>
      </div>

      {error && (
        <p id={`${name}-error`} className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

export function CreateShopForm() {
  const router = useRouter();
  const { createShop, isPending, error: apiError } = useCreateShop();

  const [form, setForm] = useState<CreateShopInput>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [validationMessage, setValidationMessage] = useState<string | null>(
    null,
  );
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [createdShopCode, setCreatedShopCode] = useState<string | null>(null);

  function clearFieldError(path: string) {
    setErrors((current) => {
      if (!current[path]) return current;

      const updated = { ...current };
      delete updated[path];

      return updated;
    });

    setValidationMessage(null);
  }

  function updateShop(
    field: keyof CreateShopInput["shop"],
    value: string,
  ) {
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

  function updateUser(
    field: keyof CreateShopInput["shopUser"],
    value: string,
  ) {
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {/* Shop details */}
      <Card>
        <CardHeader>
          <CardTitle>Shop Details</CardTitle>
          <p className="text-sm text-muted-foreground">
            Enter the business information for this shop.
          </p>
        </CardHeader>

        <CardContent className="grid gap-5 md:grid-cols-2">
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
        </CardContent>
      </Card>

      {/* Shop Admin */}
      <Card>
        <CardHeader>
          <CardTitle>Shop Admin Account</CardTitle>
          <p className="text-sm text-muted-foreground">
            This account will have full administrative access within this shop.
          </p>
        </CardHeader>

        <CardContent className="grid gap-5 md:grid-cols-2">
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
        </CardContent>
      </Card>

      {/* Shop User */}
      <Card>
        <CardHeader>
          <CardTitle>Shop User Account</CardTitle>
          <p className="text-sm text-muted-foreground">
            This account will receive the default Shop User role.
          </p>
        </CardHeader>

        <CardContent className="grid gap-5 md:grid-cols-2">
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
        </CardContent>
      </Card>

      {/* Form feedback */}
      {(validationMessage || apiError) && (
        <p role="alert" className="text-sm text-destructive">
          {validationMessage || apiError}
        </p>
      )}

      {successMessage && (
        <div className="rounded-lg border border-green-600/30 bg-green-600/5 p-4">
          <p className="font-medium text-green-700">{successMessage}</p>

          {createdShopCode && (
            <p className="mt-1 text-sm">
              Generated Shop Code: <strong>{createdShopCode}</strong>
            </p>
          )}
        </div>
      )}

      <div className="flex flex-wrap justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          disabled={isPending}
          onClick={() => router.back()}
        >
          Cancel
        </Button>

        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
          {isPending ? "Creating Shop..." : "Create Shop"}
        </Button>
      </div>
    </form>
  );
}