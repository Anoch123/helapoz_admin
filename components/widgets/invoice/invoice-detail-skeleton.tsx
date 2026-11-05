/**
 * Suspense fallback for the invoice details page.
 * Save as: components/widgets/billing/invoice-details-skeleton.tsx
 */

function Bar({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-muted ${className}`} />;
}

export default function InvoiceDetailsSkeleton() {
  return (
    <div
      className="mx-auto w-full max-w-6xl space-y-6"
      aria-busy="true"
      aria-label="Loading invoice"
    >
      <Bar className="h-4 w-24" />
      <Bar className="h-64 rounded-3xl" />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          <Bar className="h-72 rounded-3xl" />
          <Bar className="h-56 rounded-3xl" />
        </div>
        <Bar className="h-80 rounded-3xl" />
      </div>
    </div>
  );
}