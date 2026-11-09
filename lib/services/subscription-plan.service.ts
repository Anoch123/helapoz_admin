
import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import type {
  CreateSubscriptionPlanInput,
  UpdateSubscriptionPlanInput,
} from "@/lib/validations/subscription-plan.validation";

export async function getSubscriptionPlans() {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("subscription_plans")
    .select(
      `
        id,
        plan_code,
        name,
        description,
        monthly_price,
        additional_user_price,
        included_admin_users,
        included_shop_users,
        currency,
        is_active,
        created_at,
        updated_at
      `,
    )
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error("Unable to fetch subscription plans.");
  }

  return data;
}

export async function getSubscriptionPlanById(planId: string) {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("subscription_plans")
    .select(
      `
        id,
        plan_code,
        name,
        description,
        monthly_price,
        additional_user_price,
        included_admin_users,
        included_shop_users,
        currency,
        is_active,
        created_at,
        updated_at
      `,
    )
    .eq("id", planId)
    .maybeSingle();

  if (error) {
    throw new Error("Unable to fetch the subscription plan.");
  }

  return data;
}

export async function createSubscriptionPlan(
  input: CreateSubscriptionPlanInput,
) {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("subscription_plans")
    .insert({
      plan_code: input.planCode,
      name: input.name,
      description: input.description ?? null,
      monthly_price: input.monthlyPrice,
      additional_user_price: input.additionalUserPrice,
      included_admin_users: input.includedAdminUsers,
      included_shop_users: input.includedShopUsers,
      currency: input.currency,
      is_active: input.isActive,
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new Error("A subscription plan with this code already exists.");
    }

    throw new Error("Unable to create the subscription plan.");
  }

  return data;
}

export async function updateSubscriptionPlan(
  planId: string,
  input: UpdateSubscriptionPlanInput,
) {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("subscription_plans")
    .update({
      name: input.name,
      description: input.description ?? null,
      monthly_price: input.monthlyPrice,
      additional_user_price: input.additionalUserPrice,
      included_admin_users: input.includedAdminUsers,
      included_shop_users: input.includedShopUsers,
      currency: input.currency,
      is_active: input.isActive,
      updated_at: new Date().toISOString(),
    })
    .eq("id", planId)
    .select()
    .maybeSingle();

  if (error) {
    throw new Error("Unable to update the subscription plan.");
  }

  if (!data) {
    throw new Error("SUBSCRIPTION_PLAN_NOT_FOUND");
  }

  return data;
}
