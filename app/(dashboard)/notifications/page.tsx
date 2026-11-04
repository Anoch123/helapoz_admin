import { Suspense } from "react";

import ModulesPageHeader from "@/components/widgets/dashboard/modules-page-header";
import NotificationList from "@/components/widgets/notifications/notification-list";

export default function NotificationsPage() {
  return (
    <div className="space-y-6">
      <main>
        <ModulesPageHeader
          title="Notifications"
          subtitle="Create and manage notifications sent to Helpaz shops."
        />
      </main>

      <Suspense
        fallback={
          <div className="rounded-xl border p-8 text-sm text-muted-foreground">
            Loading notifications...
          </div>
        }
      >
        <NotificationList />
      </Suspense>
    </div>
  );
}