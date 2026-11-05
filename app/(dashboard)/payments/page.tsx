import { Suspense } from "react";

import ModulesPageHeader from "@/components/widgets/dashboard/modules-page-header";
import PaymentsSkeleton from "@/components/widgets/payments/payment-skeleton";
import PaymentsContent from "@/components/widgets/payments/payment-contents";

export default function PaymentsPage() {
  return (
    <div className="space-y-6 p-4">
      <ModulesPageHeader
        title="Manage Payments"
        subtitle="Review bank transfers and manage payment confirmations"
      />

      <Suspense fallback={<PaymentsSkeleton />}>
        <PaymentsContent />
      </Suspense>
    </div>
  );
}