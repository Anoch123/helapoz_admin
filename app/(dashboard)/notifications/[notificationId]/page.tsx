import { Suspense } from "react";

import ModulesPageHeader from "@/components/widgets/dashboard/modules-page-header";
import NotificationDetails from "@/components/widgets/notifications/notification-details";

type Props = {
  params: Promise<{
    notificationId: string;
  }>;
};

export default function NotificationDetailsPage({
  params,
}: Props) {
  return (
    <>
      <ModulesPageHeader
        title="Notification Details"
        subtitle="View notification information and recipient activity."
      />

      <Suspense
        fallback={
          <div className="min-h-64 animate-pulse rounded-xl border bg-muted/30" />
        }
      >
        <NotificationDetailsContent params={params} />
      </Suspense>
    </>
  );
}

async function NotificationDetailsContent({ params }: Props) {
  const { notificationId } = await params;

  return <NotificationDetails notificationId={notificationId} />;
}