"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import type {
  SubscriptionPlan,
  SubscriptionPlanPayload,
} from "@/hooks/useSubscriptionPlans";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

type Props = {
  plan: SubscriptionPlan | null;
  isSaving: boolean;
  onSubmit: (payload: SubscriptionPlanPayload) => Promise<boolean>;
  onCancel: () => void;
};

type FormState = {
  planCode: string;
  name: string;
  description: string;
  monthlyPrice: string;
  additionalUserPrice: string;
  includedAdminUsers: string;
  includedShopUsers: string;
  currency: string;
  isActive: boolean;
};

const initialState: FormState = {
  planCode: "",
  name: "",
  description: "",
  monthlyPrice: "1750",
  additionalUserPrice: "1000",
  includedAdminUsers: "1",
  includedShopUsers: "1",
  currency: "LKR",
  isActive: true,
};

/* Shared look: soft rounded fields, indigo focus, no native number spinners. */
const field =
  "h-11 rounded-xl focus-visible:border-indigo-500 focus-visible:ring-4 focus-visible:ring-indigo-500/15 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </h3>
      {children}
    </section>
  );
}

function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export default function SubscriptionPlanForm({
  plan,
  isSaving,
  onSubmit,
  onCancel,
}: Props) {
  const [form, setForm] = useState<FormState>(initialState);

  useEffect(() => {
    if (plan) {
      setForm({
        planCode: plan.plan_code,
        name: plan.name,
        description: plan.description ?? "",
        monthlyPrice: String(plan.monthly_price),
        additionalUserPrice: String(plan.additional_user_price),
        includedAdminUsers: String(plan.included_admin_users),
        includedShopUsers: String(plan.included_shop_users),
        currency: plan.currency,
        isActive: plan.is_active,
      });
    } else {
      setForm(initialState);
    }
  }, [plan]);

  function updateField<K extends keyof FormState>(
    key: K,
    value: FormState[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const payload: SubscriptionPlanPayload = {
      ...(plan ? {} : { planCode: form.planCode.trim() }),
      name: form.name.trim(),
      description: form.description.trim() || null,
      monthlyPrice: Number(form.monthlyPrice),
      additionalUserPrice: Number(form.additionalUserPrice),
      includedAdminUsers: Number(form.includedAdminUsers),
      includedShopUsers: Number(form.includedShopUsers),
      currency: form.currency.trim().toUpperCase(),
      isActive: form.isActive,
    };

    const success = await onSubmit(payload);

    if (success) {
      onCancel();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <Section title="Plan">
        <div className="grid gap-4 sm:grid-cols-2">
          {plan ? (
            <Field label="Plan code" hint="Can’t be changed after creation.">
              <Input
                value={plan.plan_code}
                disabled
                className={`${field} font-mono`}
              />
            </Field>
          ) : (
            <Field label="Plan code" htmlFor="planCode">
              <Input
                id="planCode"
                value={form.planCode}
                onChange={(e) =>
                  updateField("planCode", e.target.value.toUpperCase())
                }
                placeholder="HELPaz_PREMIUM"
                required
                className={`${field} font-mono`}
              />
            </Field>
          )}

          <Field label="Plan name" htmlFor="name">
            <Input
              id="name"
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
              placeholder="Helapoz Premium"
              required
              className={field}
            />
          </Field>
        </div>

        <Field label="Description" htmlFor="description">
          <Textarea
            id="description"
            value={form.description}
            onChange={(e) => updateField("description", e.target.value)}
            placeholder="Describe this subscription plan"
            rows={3}
            className="rounded-xl focus-visible:border-indigo-500 focus-visible:ring-4 focus-visible:ring-indigo-500/15"
          />
        </Field>
      </Section>

      <Section title="Pricing">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Monthly price" htmlFor="monthlyPrice">
            <Input
              id="monthlyPrice"
              type="number"
              min="0"
              step="0.01"
              value={form.monthlyPrice}
              onChange={(e) => updateField("monthlyPrice", e.target.value)}
              required
              className={`${field} tabular-nums`}
            />
          </Field>

          <Field label="Extra user price" htmlFor="additionalUserPrice">
            <Input
              id="additionalUserPrice"
              type="number"
              min="0"
              step="0.01"
              value={form.additionalUserPrice}
              onChange={(e) =>
                updateField("additionalUserPrice", e.target.value)
              }
              required
              className={`${field} tabular-nums`}
            />
          </Field>

          <Field label="Currency" htmlFor="currency">
            <Input
              id="currency"
              maxLength={3}
              value={form.currency}
              onChange={(e) =>
                updateField("currency", e.target.value.toUpperCase())
              }
              required
              className={`${field} font-mono uppercase`}
            />
          </Field>
        </div>
      </Section>

      <Section title="Included users">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Admin users" htmlFor="includedAdminUsers">
            <Input
              id="includedAdminUsers"
              type="number"
              min="1"
              max="1000"
              step="1"
              value={form.includedAdminUsers}
              onChange={(e) =>
                updateField("includedAdminUsers", e.target.value)
              }
              required
              className={`${field} tabular-nums`}
            />
          </Field>

          <Field label="Shop users" htmlFor="includedShopUsers">
            <Input
              id="includedShopUsers"
              type="number"
              min="0"
              max="1000"
              step="1"
              value={form.includedShopUsers}
              onChange={(e) =>
                updateField("includedShopUsers", e.target.value)
              }
              required
              className={`${field} tabular-nums`}
            />
          </Field>
        </div>
      </Section>

      <div className="flex items-center justify-between gap-4 rounded-2xl bg-muted/50 p-4">
        <div>
          <Label htmlFor="isActive">Active plan</Label>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Can be selected for new subscriptions.
          </p>
        </div>

        <Switch
          id="isActive"
          checked={form.isActive}
          onCheckedChange={(checked) => updateField("isActive", checked)}
        />
      </div>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSaving}
          className="h-11 rounded-xl px-5"
        >
          Cancel
        </Button>

        <Button
          type="submit"
          disabled={isSaving}
          className="h-11 rounded-xl bg-indigo-600 px-6 hover:bg-indigo-700"
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Saving
            </>
          ) : plan ? (
            "Save changes"
          ) : (
            "Create plan"
          )}
        </Button>
      </div>
    </form>
  );
}