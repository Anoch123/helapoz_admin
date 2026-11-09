import { Suspense } from "react";

import ShopDetailsContent from "@/components/widgets/shops/shop-details-content";
import ShopDetailsSkeleton from "@/components/widgets/shops/shop-details-skeleton";

export default function ShopDetailsPage({
  params,
}: {
  params: Promise<{ shopId: string }>;
}) {
  return (
    <Suspense fallback={<ShopDetailsSkeleton />}>
      <ShopDetailsContent params={params} />
    </Suspense>
  );
}