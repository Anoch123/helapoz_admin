"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useUpdateShop } from "@/hooks/useUpdateShop";

interface ShopFormValues {
  name: string;
  legalName: string;
  businessRegistrationNo: string;
  contactEmail: string;
  contactPhone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  district: string;
  postalCode: string;
}

interface EditShopFormProps {
  shop: {
    id: string;
    shop_code: string;
    name: string;
    legal_name: string | null;
    business_registration_no: string | null;
    contact_email: string;
    contact_phone: string;
    address_line_1: string;
    address_line_2: string | null;
    city: string;
    district: string | null;
    postal_code: string | null;
  };
}

export function EditShopForm({ shop }: EditShopFormProps) {
  const { updateShop, isPending } = useUpdateShop(shop.id);

  const [form, setForm] = useState<ShopFormValues>({
    name: shop.name,
    legalName: shop.legal_name ?? "",
    businessRegistrationNo: shop.business_registration_no ?? "",
    contactEmail: shop.contact_email,
    contactPhone: shop.contact_phone,
    addressLine1: shop.address_line_1,
    addressLine2: shop.address_line_2 ?? "",
    city: shop.city,
    district: shop.district ?? "",
    postalCode: shop.postal_code ?? "",
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  function handleChange(field: keyof ShopFormValues, value: string) {
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

    const result = await updateShop({ ...form });

    if (!result.success) {
      setFieldErrors(result.fieldErrors);
      setFormError(result.message);
    }
  }

  function FormField({
    label,
    name,
    required = false,
    type = "text",
  }: {
    label: string;
    name: keyof ShopFormValues;
    required?: boolean;
    type?: string;
  }) {
    const id = `shop-${name}`;
    const error = fieldErrors[name];

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
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Shop identity */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Shop Information</h2>
          <p className="text-sm text-muted-foreground">
            Update the basic information of this shop.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <FormField label="Shop Name" name="name" required />
          <FormField label="Legal Name" name="legalName" />

          <FormField
            label="Business Registration Number"
            name="businessRegistrationNo"
          />

          <div className="space-y-2">
            <Label>Shop Code</Label>
            <Input value={shop.shop_code} disabled />
            <p className="text-xs text-muted-foreground">
              Shop codes cannot be changed.
            </p>
          </div>
        </div>
      </section>

      {/* Contact information */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Contact Information</h2>
          <p className="text-sm text-muted-foreground">
            Update the shop's contact details.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <FormField
            label="Contact Email"
            name="contactEmail"
            type="email"
            required
          />

          <FormField
            label="Contact Phone"
            name="contactPhone"
            required
          />
        </div>
      </section>

      {/* Address */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Business Address</h2>
          <p className="text-sm text-muted-foreground">
            Update the registered business address.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <FormField
            label="Address Line 1"
            name="addressLine1"
            required
          />

          <FormField label="Address Line 2" name="addressLine2" />

          <FormField label="City" name="city" required />

          <FormField label="District" name="district" />

          <FormField label="Postal Code" name="postalCode" />
        </div>
      </section>

      {formError && (
        <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3">
          <p className="text-sm text-destructive">{formError}</p>
        </div>
      )}

      <div className="flex flex-wrap justify-end gap-3 border-t pt-5">
        <Link
          href={`/manage-shops/${shop.id}`}
          aria-disabled={isPending}
          tabIndex={isPending ? -1 : undefined}
          onClick={(event) => {
            if (isPending) event.preventDefault();
          }}
          className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 aria-disabled:pointer-events-none aria-disabled:opacity-50"
        >
          Cancel
        </Link>

        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving Changes..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}