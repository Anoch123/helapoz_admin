/**
 * Suspense fallback for the payments page.
 * Save as: components/widgets/billing/payments-skeleton.tsx
 */

function Bar({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-muted ${className}`} />;
}

export default function PaymentsSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading payments">
      <div className="grid gap-4 lg:grid-cols-5">
        <Bar className="h-40 rounded-3xl lg:col-span-3" />
        <div className="grid gap-4 lg:col-span-2">
          <Bar className="h-[76px] rounded-2xl" />
          <Bar className="h-[76px] rounded-2xl" />
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border bg-card">
        <div className="border-b p-5">
          <Bar className="h-4 w-32" />
          <Bar className="mt-2 h-3 w-52" />
        </div>
        <div className="divide-y">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-4">
              <Bar className="size-9 rounded-xl" />
              <Bar className="h-4 w-40" />
              <Bar className="ml-auto h-4 w-24" />
              <Bar className="h-6 w-20 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}