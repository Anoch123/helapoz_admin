import { Suspense } from "react";

import PurchaseSeatsContent from "@/components/widgets/shops/purchase-seats-content";
import PurchaseSeatsSkeleton from "@/components/widgets/shops/purchase-seats-skeleton";

interface PageProps {
  params: Promise<{
    shopId: string;
  }>;
}

export default function PurchaseSeatsPage({ params }: PageProps) {
  return (
    <div className="p-4">
      <Suspense fallback={<PurchaseSeatsSkeleton />}>
        <PurchaseSeatsContent params={params} />
      </Suspense>
    </div>
  );
}