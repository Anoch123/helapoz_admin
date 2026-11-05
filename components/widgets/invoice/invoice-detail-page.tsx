import { Suspense } from "react";
import InvoiceDetailsSkeleton from "./invoice-detail-skeleton";
import InvoiceDetailsContent from "./invoice-detail-content";


export default function InvoiceDetailsPage({
  params,
}: {
  params: Promise<{ invoiceId: string }>;
}) {
  return (
    <div className="p-4">
      <Suspense fallback={<InvoiceDetailsSkeleton />}>
        {params.then(({ invoiceId }) => (
          <InvoiceDetailsContent invoiceId={invoiceId} />
        ))}
      </Suspense>
    </div>
  );
}