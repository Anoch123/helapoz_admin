/**
 * Suspense fallback for the shop list.
 * Save as: components/widgets/shops/shop-list-skeleton.tsx
 */

function Bar({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-muted ${className}`} />;
}

export default function ShopListSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading shops">
      <div className="grid gap-4 lg:grid-cols-5">
        <Bar className="h-36 rounded-3xl lg:col-span-2" />
        <div className="grid gap-4 sm:grid-cols-3 lg:col-span-3">
          <Bar className="h-36 rounded-2xl" />
          <Bar className="h-36 rounded-2xl" />
          <Bar className="h-36 rounded-2xl" />
        </div>
      </div>

      <div className="divide-y overflow-hidden rounded-3xl border bg-card">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-4">
            <Bar className="size-9 rounded-xl" />
            <Bar className="h-4 w-36" />
            <Bar className="h-4 w-44" />
            <Bar className="ml-auto h-6 w-20 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}