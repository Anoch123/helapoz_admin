"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Send } from "lucide-react";

import { useNotifications } from "@/hooks/use-notifications";
import { CreateNotificationInput, createNotificationSchema } from "@/lib/validations/notification.validation";

type ShopOption = {
  id: string;
  name: string;
  shop_code: string;
};

const initialForm: CreateNotificationInput = {
  title: "",
  message: "",
  category: "ANNOUNCEMENT",
  audienceType: "ALL_SHOPS",
  targetShopId: null,
  recipientRole: "ALL",
};

export default function CreateNotificationForm({
  shops,
}: {
  shops: ShopOption[];
}) {
  const router = useRouter();

  const { sendNotification, isSending, error } = useNotifications();

  const [form, setForm] = useState<CreateNotificationInput>(initialForm);
  const [fieldErrors, setFieldErrors] = useState<
    Record<string, string>
  >({});

  function updateField<K extends keyof CreateNotificationInput>(
    field: K,
    value: CreateNotificationInput[K],
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setFieldErrors((current) => ({
      ...current,
      [field]: "",
    }));
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setFieldErrors({});

    const validation = createNotificationSchema.safeParse(form);

    if (!validation.success) {
      const errors: Record<string, string> = {};

      validation.error.issues.forEach((issue) => {
        const field = issue.path[0];

        if (field && !errors[String(field)]) {
          errors[String(field)] = issue.message;
        }
      });

      setFieldErrors(errors);
      return;
    }

    const confirmed = window.confirm(
      `Send this notification to ${
        form.audienceType === "ALL_SHOPS"
          ? "all eligible shops"
          : "the selected shop"
      }? This action cannot be undone.`,
    );

    if (!confirmed) return;

    const result = await sendNotification(validation.data);

    if (result.success) {
      router.push("/notifications");
      router.refresh();
    }
  }

  const inputClass =
    "h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none transition focus:ring-2 focus:ring-ring";

  const labelClass = "mb-2 block text-sm font-medium";

  const errorClass = "mt-1 text-xs text-red-600";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/notifications"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to notifications
        </Link>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Notification content */}
      <section className="space-y-5 rounded-xl border p-5 sm:p-6">
        <div>
          <h2 className="font-semibold">Notification Details</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Enter the message that will be delivered to shop accounts.
          </p>
        </div>

        <div>
          <label htmlFor="title" className={labelClass}>
            Notification Title
          </label>

          <input
            id="title"
            value={form.title}
            onChange={(event) =>
              updateField("title", event.target.value)
            }
            maxLength={150}
            placeholder="Enter notification title"
            className={inputClass}
            disabled={isSending}
          />

          {fieldErrors.title && (
            <p className={errorClass}>{fieldErrors.title}</p>
          )}

          <p className="mt-1 text-right text-xs text-muted-foreground">
            {form.title.length}/150
          </p>
        </div>

        <div>
          <label htmlFor="message" className={labelClass}>
            Message
          </label>

          <textarea
            id="message"
            value={form.message}
            onChange={(event) =>
              updateField("message", event.target.value)
            }
            maxLength={5000}
            rows={6}
            placeholder="Write your notification message..."
            className="w-full resize-y rounded-lg border bg-background px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            disabled={isSending}
          />

          {fieldErrors.message && (
            <p className={errorClass}>{fieldErrors.message}</p>
          )}

          <p className="mt-1 text-right text-xs text-muted-foreground">
            {form.message.length}/5000
          </p>
        </div>

        <div>
          <label htmlFor="category" className={labelClass}>
            Category
          </label>

          <select
            id="category"
            value={form.category}
            onChange={(event) =>
              updateField(
                "category",
                event.target.value as CreateNotificationInput["category"],
              )
            }
            className={inputClass}
            disabled={isSending}
          >
            <option value="ANNOUNCEMENT">Announcement</option>
            <option value="BILLING">Billing</option>
            <option value="SYSTEM">System</option>
          </select>
        </div>
      </section>

      {/* Audience */}
      <section className="space-y-5 rounded-xl border p-5 sm:p-6">
        <div>
          <h2 className="font-semibold">Recipient Targeting</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Choose which shops and account types should receive this notification.
          </p>
        </div>

        <div>
          <label htmlFor="audience" className={labelClass}>
            Shop Audience
          </label>

          <select
            id="audience"
            value={form.audienceType}
            onChange={(event) => {
              const audienceType =
                event.target.value as CreateNotificationInput["audienceType"];

              setForm((current) => ({
                ...current,
                audienceType,
                targetShopId: null,
              }));

              setFieldErrors((current) => ({
                ...current,
                targetShopId: "",
              }));
            }}
            className={inputClass}
            disabled={isSending}
          >
            <option value="ALL_SHOPS">All Active Shops</option>
            <option value="SPECIFIC_SHOP">Specific Shop</option>
          </select>
        </div>

        {form.audienceType === "SPECIFIC_SHOP" && (
          <div>
            <label htmlFor="shop" className={labelClass}>
              Select Shop
            </label>

            <select
              id="shop"
              value={form.targetShopId ?? ""}
              onChange={(event) =>
                updateField(
                  "targetShopId",
                  event.target.value || null,
                )
              }
              className={inputClass}
              disabled={isSending}
            >
              <option value="">Choose a shop</option>

              {shops.map((shop) => (
                <option key={shop.id} value={shop.id}>
                  {shop.name} ({shop.shop_code})
                </option>
              ))}
            </select>

            {shops.length === 0 && (
              <p className="mt-1 text-xs text-muted-foreground">
                No active shops are currently available.
              </p>
            )}

            {fieldErrors.targetShopId && (
              <p className={errorClass}>
                {fieldErrors.targetShopId}
              </p>
            )}
          </div>
        )}

        <div>
          <label htmlFor="recipientRole" className={labelClass}>
            Recipient Account Type
          </label>

          <select
            id="recipientRole"
            value={form.recipientRole}
            onChange={(event) =>
              updateField(
                "recipientRole",
                event.target.value as CreateNotificationInput["recipientRole"],
              )
            }
            className={inputClass}
            disabled={isSending}
          >
            <option value="ALL">All Members</option>
            <option value="SHOP_ADMIN">Shop Admins Only</option>
            <option value="SHOP_USER">Shop Users Only</option>
          </select>
        </div>

        <div className="rounded-lg bg-muted/50 p-4">
          <p className="text-sm font-medium">Targeting Summary</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {form.audienceType === "ALL_SHOPS"
              ? "All active shops"
              : shops.find((shop) => shop.id === form.targetShopId)?.name ??
                "Select a shop"}
            {" · "}
            {form.recipientRole === "ALL"
              ? "All members"
              : form.recipientRole === "SHOP_ADMIN"
                ? "Shop Admins"
                : "Shop Users"}
          </p>
        </div>
      </section>

      {/* Actions */}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link
          href="/notifications"
          className="inline-flex h-11 items-center justify-center rounded-lg border px-5 text-sm font-medium hover:bg-muted"
        >
          Cancel
        </Link>

        <button
          type="submit"
          disabled={
            isSending ||
            (form.audienceType === "SPECIFIC_SHOP" &&
              shops.length === 0)
          }
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="size-4" />
              Send Notification
            </>
          )}
        </button>
      </div>
    </form>
  );
}