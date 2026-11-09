
"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

export type SubscriptionPlan = {
  id: string;
  plan_code: string;
  name: string;
  description: string | null;
  monthly_price: number;
  additional_user_price: number;
  included_admin_users: number;
  included_shop_users: number;
  currency: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type SubscriptionPlanPayload = {
  planCode?: string;
  name: string;
  description: string | null;
  monthlyPrice: number;
  additionalUserPrice: number;
  includedAdminUsers: number;
  includedShopUsers: number;
  currency: string;
  isActive: boolean;
};

export function useSubscriptionPlans() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchPlans = useCallback(async () => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/admin/subscription-plans", {
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Unable to fetch plans.");
      }

      setPlans(result.data);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to fetch subscription plans.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchPlans();
  }, [fetchPlans]);

  const savePlan = async (
    payload: SubscriptionPlanPayload,
    planId?: string,
  ) => {
    setIsSaving(true);

    try {
      const response = await fetch(
        planId
          ? `/api/admin/subscription-plans/${planId}`
          : "/api/admin/subscription-plans",
        {
          method: planId ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Unable to save subscription plan.");
      }

      toast.success(
        planId
          ? "Subscription plan updated successfully."
          : "Subscription plan created successfully.",
      );

      await fetchPlans();

      return true;
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to save subscription plan.",
      );

      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    plans,
    isLoading,
    isSaving,
    fetchPlans,
    savePlan,
  };
}
