/**
 * Suspense fallback for the shop details page.
 * Save as: components/widgets/shops/shop-details-skeleton.tsx
 */

function Bar({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-muted ${className}`} />;
}

export default function ShopDetailsSkeleton() {
  return (
    <div
      className="mx-auto w-full max-w-7xl space-y-6 p-4"
      aria-busy="true"
      aria-label="Loading shop"
    >
      <Bar className="h-4 w-20" />
      <Bar className="h-52 rounded-3xl" />
      <div className="flex gap-2">
        <Bar className="h-10 w-28 rounded-xl" />
        <Bar className="h-10 w-36 rounded-xl" />
      </div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <Bar className="h-72 rounded-3xl" />
          <Bar className="h-72 rounded-3xl" />
        </div>
        <div className="space-y-6">
          <Bar className="h-64 rounded-3xl" />
          <Bar className="h-64 rounded-3xl" />
        </div>
      </div>
    </div>
  );
}