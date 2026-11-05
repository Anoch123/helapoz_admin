/**
 * Suspense fallback for the invoices list.
 * Save as: components/widgets/billing/invoices-skeleton.tsx
 */

function Bar({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-muted ${className}`} />;
}

export default function InvoicesSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading invoices">
      <div className="grid gap-4 lg:grid-cols-5">
        <Bar className="h-40 rounded-3xl lg:col-span-3" />
        <div className="grid gap-4 lg:col-span-2">
          <Bar className="h-[76px] rounded-2xl" />
          <Bar className="h-[76px] rounded-2xl" />
        </div>
      </div>

      <div className="divide-y overflow-hidden rounded-3xl border bg-card">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-4">
            <Bar className="h-4 w-28" />
            <Bar className="size-9 rounded-xl" />
            <Bar className="h-4 w-36" />
            <Bar className="ml-auto h-4 w-24" />
            <Bar className="h-6 w-20 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}