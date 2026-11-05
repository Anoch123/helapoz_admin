import { Suspense } from "react";

import ModulesPageHeader from "@/components/widgets/dashboard/modules-page-header";
import InvoicesSkeleton from "@/components/widgets/invoice/invoice-skeleton";
import InvoicesContent from "@/components/widgets/invoice/invoices-content";

export default function InvoicesPage() {
  return (
    <div className="space-y-6 p-4">
      <ModulesPageHeader
        title="Invoices"
        subtitle="Review and manage customer invoices"
      />

      <Suspense fallback={<InvoicesSkeleton />}>
        <InvoicesContent />
      </Suspense>
    </div>
  );
}