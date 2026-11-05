"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Globe, Loader2, Send, Store } from "lucide-react";

import { useNotifications } from "@/hooks/use-notifications";
import {
  CreateNotificationInput,
  createNotificationSchema,
} from "@/lib/validations/notification.validation";
import { CustomSelect } from "./custom-select";
import { CategoryBadge } from "./notification-badge";

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

const CATEGORIES = [
  { value: "ANNOUNCEMENT", label: "Announcement" },
  { value: "BILLING", label: "Billing" },
  { value: "SYSTEM", label: "System" },
] as const;

const ROLES = [
  { value: "ALL", label: "All members" },
  { value: "SHOP_ADMIN", label: "Shop admins" },
  { value: "SHOP_USER", label: "Shop users" },
] as const;

const inputClass =
  "w-full rounded-xl border bg-background px-3 text-sm outline-none transition placeholder:text-muted-foreground focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15 disabled:opacity-50";

function Segmented<T extends string>({
  value,
  options,
  onChange,
  disabled,
}: {
  value: T;
  options: readonly { value: T; label: string }[];
  onChange: (value: T) => void;
  disabled?: boolean;
}) {
  return (
    <div className="inline-flex w-full rounded-xl border bg-muted/50 p-1 sm:w-auto">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          disabled={disabled}
          onClick={() => onChange(o.value)}
          className={`flex-1 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-colors sm:flex-none ${
            value === o.value
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Field({
  label,
  htmlFor,
  counter,
  error,
  children,
}: {
  label: string;
  htmlFor?: string;
  counter?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label htmlFor={htmlFor} className="text-sm font-medium">
          {label}
        </label>
        {counter && (
          <span className="text-xs tabular-nums text-muted-foreground">
            {counter}
          </span>
        )}
      </div>
      {children}
      {error && <p className="mt-1.5 text-xs text-destructive">{error}</p>}
    </div>
  );
}

export default function CreateNotificationForm({
  shops,
}: {
  shops: ShopOption[];
}) {
  const router = useRouter();
  const { sendNotification, isSending, error } = useNotifications();

  const [form, setForm] = useState<CreateNotificationInput>(initialForm);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [pending, setPending] = useState<CreateNotificationInput | null>(null);

  // Close the confirm dialog with Escape (unless a send is in progress).
  useEffect(() => {
    if (!pending) return;
    const onKey = (e: KeyboardEvent) =>
      e.key === "Escape" && !isSending && setPending(null);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [pending, isSending]);

  function updateField<K extends keyof CreateNotificationInput>(
    field: K,
    value: CreateNotificationInput[K],
  ) {
    setForm((c) => ({ ...c, [field]: value }));
    setFieldErrors((c) => ({ ...c, [field]: "" }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
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

    setPending(validation.data);
  }

  async function confirmSend() {
    if (!pending) return;
    const result = await sendNotification(pending);
    if (result.success) {
      router.push("/notifications");
      router.refresh();
    } else {
      setPending(null);
    }
  }

  const selectedShop = shops.find((s) => s.id === form.targetShopId);
  const audienceLabel =
    form.audienceType === "ALL_SHOPS"
      ? "All active shops"
      : (selectedShop?.name ?? "No shop selected");
  const roleLabel = ROLES.find((r) => r.value === form.recipientRole)?.label;

  const cannotSend =
    isSending || (form.audienceType === "SPECIFIC_SHOP" && shops.length === 0);

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-4">
      <Link
        href="/notifications"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Notifications
      </Link>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive"
        >
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_340px] lg:items-start">
        {/* ------------------------------ Left: inputs ------------------------------ */}
        <div className="space-y-6">
          {/* Message */}
          <section className="space-y-5 rounded-3xl border bg-card p-6">
            <div>
              <h2 className="font-semibold">Message</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                What shop accounts will read.
              </p>
            </div>

            <Field label="Category">
              <Segmented
                value={form.category}
                options={CATEGORIES}
                onChange={(v) => updateField("category", v)}
                disabled={isSending}
              />
            </Field>

            <Field
              label="Title"
              htmlFor="title"
              counter={`${form.title.length}/150`}
              error={fieldErrors.title}
            >
              <input
                id="title"
                value={form.title}
                onChange={(e) => updateField("title", e.target.value)}
                maxLength={150}
                placeholder="e.g. Scheduled maintenance on Sunday"
                className={`${inputClass} h-11`}
                disabled={isSending}
              />
            </Field>

            <Field
              label="Body"
              htmlFor="message"
              counter={`${form.message.length}/5000`}
              error={fieldErrors.message}
            >
              <textarea
                id="message"
                value={form.message}
                onChange={(e) => updateField("message", e.target.value)}
                maxLength={5000}
                rows={8}
                placeholder="Write the notification message"
                className={`${inputClass} resize-y py-3 leading-6`}
                disabled={isSending}
              />
            </Field>
          </section>

          {/* Audience */}
          <section className="space-y-5 rounded-3xl border bg-card p-6">
            <div>
              <h2 className="font-semibold">Recipients</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Choose which shops and accounts receive it.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {[
                {
                  value: "ALL_SHOPS" as const,
                  title: "All active shops",
                  hint: "Every shop currently active",
                  icon: Globe,
                },
                {
                  value: "SPECIFIC_SHOP" as const,
                  title: "One shop",
                  hint: "Pick a single shop",
                  icon: Store,
                },
              ].map((o) => {
                const Icon = o.icon;
                const active = form.audienceType === o.value;
                return (
                  <button
                    key={o.value}
                    type="button"
                    disabled={isSending}
                    onClick={() => {
                      setForm((c) => ({
                        ...c,
                        audienceType: o.value,
                        targetShopId: null,
                      }));
                      setFieldErrors((c) => ({ ...c, targetShopId: "" }));
                    }}
                    className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition ${
                      active
                        ? "border-indigo-500 bg-indigo-500/5 ring-4 ring-indigo-500/10"
                        : "hover:bg-muted/50"
                    }`}
                  >
                    <div
                      className={`rounded-xl p-2.5 ${
                        active
                          ? "bg-indigo-600 text-white"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <Icon className="size-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{o.title}</p>
                      <p className="text-xs text-muted-foreground">{o.hint}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            {form.audienceType === "SPECIFIC_SHOP" && (
              <Field
                label="Shop"
                htmlFor="shop"
                error={fieldErrors.targetShopId}
              >
                <CustomSelect
                  id="shop"
                  value={form.targetShopId ?? ""}
                  onChange={(v) => updateField("targetShopId", v || null)}
                  options={shops.map((s) => ({
                    value: s.id,
                    label: s.name,
                    description: s.shop_code,
                  }))}
                  placeholder="Choose a shop"
                  disabled={isSending}
                />
                {shops.length === 0 && (
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    No active shops are available.
                  </p>
                )}
              </Field>
            )}

            <Field label="Send to">
              <Segmented
                value={form.recipientRole}
                options={ROLES}
                onChange={(v) => updateField("recipientRole", v)}
                disabled={isSending}
              />
            </Field>
          </section>
        </div>

        {/* ---------------------- Right: live preview + send ---------------------- */}
        <aside className="space-y-4 lg:sticky lg:top-4">
          <div className="rounded-3xl border bg-card p-6">
            <p className="text-xs font-medium text-muted-foreground">Preview</p>

            <div className="mt-4 rounded-2xl border bg-muted/30 p-4">
              <CategoryBadge category={form.category} />
              <p
                className={`mt-3 font-semibold leading-snug ${
                  form.title ? "" : "text-muted-foreground"
                }`}
              >
                {form.title || "Notification title"}
              </p>
              <p
                className={`mt-1.5 line-clamp-5 whitespace-pre-wrap text-sm leading-6 ${
                  form.message ? "text-muted-foreground" : "text-muted-foreground/60"
                }`}
              >
                {form.message || "Your message will appear here."}
              </p>
            </div>

            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex items-start justify-between gap-4">
                <dt className="text-muted-foreground">Shops</dt>
                <dd className="text-right font-medium">{audienceLabel}</dd>
              </div>
              <div className="flex items-start justify-between gap-4">
                <dt className="text-muted-foreground">Accounts</dt>
                <dd className="text-right font-medium">{roleLabel}</dd>
              </div>
            </dl>
          </div>

          <button
            type="submit"
            disabled={cannotSend}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Send className="size-4" />
            Review and send
          </button>

          <Link
            href="/notifications"
            className="inline-flex h-11 w-full items-center justify-center rounded-xl border text-sm font-medium transition hover:bg-muted"
          >
            Cancel
          </Link>
        </aside>
      </div>

      {/* ----------------------------- Confirm dialog ----------------------------- */}
      {pending && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !isSending) setPending(null);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            className="w-full max-w-md rounded-3xl border bg-background p-6 shadow-2xl"
          >
            <h3 id="confirm-title" className="text-lg font-semibold">
              Send this notification?
            </h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              It will go to{" "}
              <span className="font-medium text-foreground">
                {audienceLabel.toLowerCase()}
              </span>{" "}
              ({roleLabel?.toLowerCase()}). This can’t be undone.
            </p>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setPending(null)}
                disabled={isSending}
                className="h-11 rounded-xl border px-5 text-sm font-medium transition hover:bg-muted disabled:opacity-50"
              >
                Keep editing
              </button>
              <button
                type="button"
                onClick={() => void confirmSend()}
                disabled={isSending}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
              >
                {isSending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Sending
                  </>
                ) : (
                  <>
                    <Send className="size-4" />
                    Send now
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}