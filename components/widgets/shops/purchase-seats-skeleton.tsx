/**
 * Suspense fallback for the purchase seats page.
 * Save as: components/widgets/shops/purchase-seats-skeleton.tsx
 */

function Bar({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-muted ${className}`} />;
}

export default function PurchaseSeatsSkeleton() {
  return (
    <div
      className="mx-auto w-full max-w-2xl space-y-6"
      aria-busy="true"
      aria-label="Loading purchase form"
    >
      <Bar className="h-4 w-28" />
      <div className="flex items-start gap-4">
        <Bar className="size-12 rounded-2xl" />
        <div className="space-y-2">
          <Bar className="h-6 w-64" />
          <Bar className="h-4 w-48" />
        </div>
      </div>
      <Bar className="h-72 rounded-3xl" />
    </div>
  );
}