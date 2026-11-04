import { Suspense } from "react";
import Link from "next/link";

import { PurchaseAdditionalSeatsForm } from "@/components/forms/purchase-additional-seats-form";
import { Button } from "@/components/ui/button";

interface PageProps {
  params: Promise<{
    shopId: string;
  }>;
}

async function PurchaseSeatsContent({
  params,
}: PageProps) {
  const { shopId } = await params;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="space-y-2">
        <Button variant="ghost">
          <Link href={`/manage-shops/${shopId}`}>
            Back to Shop
          </Link>
        </Button>

        <h1 className="text-2xl font-semibold">
          Purchase Additional Seats
        </h1>

        <p className="text-muted-foreground">
          Purchase additional Shop User seats for this shop.
        </p>
      </div>

      <div className="rounded-xl border bg-card p-6">
        <PurchaseAdditionalSeatsForm shopId={shopId} />
      </div>
    </div>
  );
}

export default function PurchaseSeatsPage(props: PageProps) {
  return (
    <Suspense fallback={<div>Loading purchase form...</div>}>
      <PurchaseSeatsContent params={props.params} />
    </Suspense>
  );
}