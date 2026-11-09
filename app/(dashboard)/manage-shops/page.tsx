import { Suspense } from "react";

import ModulesPageHeader from "@/components/widgets/dashboard/modules-page-header";
import ShopListSkeleton from "@/components/widgets/shops/shop-list-skeleton";
import ShopListContent from "@/components/widgets/shops/shop-list-content";

export default function ManageShopsPage() {
  return (
    <div className="space-y-6 p-4">
      <ModulesPageHeader
        title="Manage Shops"
        subtitle="Add, edit, or remove shops here"
      />

      <Suspense fallback={<ShopListSkeleton />}>
        <ShopListContent />
      </Suspense>
    </div>
  );
}