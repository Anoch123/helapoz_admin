import { Suspense } from "react";

import ModulesPageHeader from "@/components/widgets/dashboard/modules-page-header";
import { getShops } from "@/lib/services/shop.service";
import CreateNotificationForm from "@/components/widgets/notifications/create-notification-form";

async function CreateNotificationContent() {
  const shops = await getShops();

  const activeShops = shops
    .filter((shop) => shop.status === "ACTIVE")
    .map((shop) => ({
      id: shop.id,
      name: shop.name,
      shop_code: shop.shop_code,
    }));

  return <CreateNotificationForm shops={activeShops} />;
}

export default function CreateNotificationPage() {
  return (
    <div className="space-y-6">
      <main>
        <ModulesPageHeader
          title="Create Notification"
          subtitle="Compose and send an in-app notification to your shops."
        />
      </main>

      <Suspense
        fallback={
          <div className="rounded-xl border p-8 text-sm text-muted-foreground">
            Loading notification form...
          </div>
        }
      >
        <CreateNotificationContent />
      </Suspense>
    </div>
  );
}