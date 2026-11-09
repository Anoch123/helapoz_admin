"use client";

import { useState } from "react";
import { Layers, Pencil, Plus, ShieldCheck, UserPlus, Users } from "lucide-react";

import { useSubscriptionPlans } from "@/hooks/useSubscriptionPlans";
import type {
  SubscriptionPlan,
  SubscriptionPlanPayload,
} from "@/hooks/useSubscriptionPlans";

import SubscriptionPlanForm from "@/components/forms/subscription-plan-form";
import ModulesPageHeader from "@/components/widgets/dashboard/modules-page-header";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

function formatPrice(price: number, currency: string) {
  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price);
}

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-muted ${className}`} />;
}

function PlanCard({
  plan,
  onEdit,
}: {
  plan: SubscriptionPlan;
  onEdit: () => void;
}) {
  return (
    <div
      className={`flex flex-col rounded-3xl border bg-card p-6 transition ${
        plan.is_active ? "hover:shadow-lg" : "opacity-70"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-lg font-semibold">{plan.name}</h3>
          <p className="mt-0.5 font-mono text-xs text-muted-foreground">
            {plan.plan_code}
          </p>
        </div>

        <span
          className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
            plan.is_active
              ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
              : "bg-slate-500/10 text-slate-600 dark:text-slate-300"
          }`}
        >
          <span
            className={`size-1.5 rounded-full ${
              plan.is_active ? "bg-emerald-500" : "bg-slate-400"
            }`}
          />
          {plan.is_active ? "Active" : "Inactive"}
        </span>
      </div>

      <div className="mt-6">
        <span className="text-4xl font-semibold tracking-tight tabular-nums">
          {formatPrice(plan.monthly_price, plan.currency)}
        </span>
        <span className="ml-1 text-sm text-muted-foreground">/ month</span>
      </div>

      <ul className="mt-6 space-y-3 border-t pt-5 text-sm">
        <li className="flex items-center gap-3">
          <ShieldCheck className="size-4 text-indigo-600" />
          <span className="flex-1 text-muted-foreground">Admin users</span>
          <span className="font-medium tabular-nums">
            {plan.included_admin_users}
          </span>
        </li>
        <li className="flex items-center gap-3">
          <Users className="size-4 text-indigo-600" />
          <span className="flex-1 text-muted-foreground">Shop users</span>
          <span className="font-medium tabular-nums">
            {plan.included_shop_users}
          </span>
        </li>
        <li className="flex items-center gap-3">
          <UserPlus className="size-4 text-indigo-600" />
          <span className="flex-1 text-muted-foreground">Each extra user</span>
          <span className="font-medium tabular-nums">
            {formatPrice(plan.additional_user_price, plan.currency)}
          </span>
        </li>
      </ul>

      <Button
        variant="outline"
        onClick={onEdit}
        className="mt-6 h-11 rounded-xl"
      >
        <Pencil className="mr-2 size-4" />
        Edit plan
      </Button>
    </div>
  );
}

export default function SubscriptionPlansPage() {
  const { plans, isLoading, isSaving, savePlan } = useSubscriptionPlans();

  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(
    null,
  );
  const [dialogOpen, setDialogOpen] = useState(false);

  function openCreateDialog() {
    setSelectedPlan(null);
    setDialogOpen(true);
  }

  function openEditDialog(plan: SubscriptionPlan) {
    setSelectedPlan(plan);
    setDialogOpen(true);
  }

  async function handleSubmit(payload: SubscriptionPlanPayload) {
    return savePlan(payload, selectedPlan?.id);
  }

  function closeDialog() {
    setDialogOpen(false);
    setSelectedPlan(null);
  }

  const activeCount = plans.filter((p) => p.is_active).length;

  return (
    <div className="space-y-6 p-4">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <ModulesPageHeader
          title="Subscription Plans"
          subtitle="Manage pricing and included user allocations"
        />

        <div className="flex items-center gap-3">
          {!isLoading && plans.length > 0 && (
            <p className="hidden text-sm text-muted-foreground sm:block">
              <span className="font-semibold text-foreground">{activeCount}</span>{" "}
              active of {plans.length}
            </p>
          )}
          <Button
            onClick={openCreateDialog}
            className="h-11 rounded-xl bg-indigo-600 px-5 hover:bg-indigo-700"
          >
            <Plus className="mr-2 size-4" />
            Create plan
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-80 rounded-3xl" />
          ))}
        </div>
      ) : plans.length === 0 ? (
        <div className="flex flex-col items-center rounded-3xl border border-dashed p-14 text-center">
          <div className="rounded-2xl bg-indigo-500/10 p-4 text-indigo-600">
            <Layers className="size-7" />
          </div>
          <h2 className="mt-4 font-semibold">No subscription plans yet</h2>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Create your first plan to start onboarding shops.
          </p>
          <Button
            onClick={openCreateDialog}
            className="mt-6 h-11 rounded-xl bg-indigo-600 px-5 hover:bg-indigo-700"
          >
            <Plus className="mr-2 size-4" />
            Create plan
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              onEdit={() => openEditDialog(plan)}
            />
          ))}

          <button
            type="button"
            onClick={openCreateDialog}
            className="flex min-h-[200px] flex-col items-center justify-center gap-3 rounded-3xl border border-dashed text-muted-foreground transition hover:border-indigo-500 hover:bg-indigo-500/5 hover:text-indigo-600"
          >
            <div className="rounded-2xl bg-muted p-3">
              <Plus className="size-6" />
            </div>
            <span className="text-sm font-medium">New plan</span>
          </button>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto rounded-3xl sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {selectedPlan ? "Edit plan" : "Create plan"}
            </DialogTitle>

            <DialogDescription>
              Set the price, included users and availability.
            </DialogDescription>
          </DialogHeader>

          <SubscriptionPlanForm
            plan={selectedPlan}
            isSaving={isSaving}
            onSubmit={handleSubmit}
            onCancel={closeDialog}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}