import Link from "next/link";
import { ArrowLeft, UserPlus } from "lucide-react";

import { PurchaseAdditionalSeatsForm } from "@/components/forms/purchase-additional-seats-form";

/**
 * Server component — header and form shell for buying extra seats.
 * Save as: components/widgets/shops/purchase-seats-content.tsx
 */
export default async function PurchaseSeatsContent({
  params,
}: {
  params: Promise<{ shopId: string }>;
}) {
  const { shopId } = await params;

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      <Link
        href={`/manage-shops/${shopId}`}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to shop
      </Link>

      <div className="flex items-start gap-4">
        <div className="rounded-2xl bg-indigo-500/10 p-3 text-indigo-600">
          <UserPlus className="size-6" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Purchase additional seats
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Add Shop User seats to this shop.
          </p>
        </div>
      </div>

      <div className="rounded-3xl border bg-card p-6 sm:p-8">
        <PurchaseAdditionalSeatsForm shopId={shopId} />
      </div>
    </div>
  );
}