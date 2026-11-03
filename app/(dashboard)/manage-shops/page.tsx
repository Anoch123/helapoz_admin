import Link from "next/link";
import { Suspense } from "react";
import { getShops } from "@/lib/services/shop.service";
import ModulesPageHeader from "@/components/widgets/dashboard/modules-page-header";

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-LK", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    ACTIVE: "bg-green-100 text-green-700",
    PROVISIONING: "bg-blue-100 text-blue-700",
    SUSPENDED: "bg-yellow-100 text-yellow-700",
    ARCHIVED: "bg-gray-100 text-gray-600",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
        styles[status] ?? "bg-muted text-muted-foreground"
      }`}
    >
      {status}
    </span>
  );
}

async function ShopListContent() {

  const shops = await getShops();

  if (shops.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-10 text-center">
        <h2 className="font-semibold">No shops registered yet</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Create your first shop to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr className="text-left">
              <th className="px-4 py-3 font-medium">Shop</th>
              <th className="px-4 py-3 font-medium">Contact</th>
              <th className="px-4 py-3 font-medium">Location</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Created</th>
              <th className="px-4 py-3 font-medium">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {shops.map((shop) => (
              <tr key={shop.id} className="hover:bg-muted/30">
                <td className="px-4 py-4">
                  <p className="font-medium">{shop.name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {shop.shop_code}
                  </p>
                </td>

                <td className="px-4 py-4">
                  <p>{shop.contact_email}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {shop.contact_phone}
                  </p>
                </td>

                <td className="px-4 py-4">
                  <p>{shop.city}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {shop.district || "—"}
                  </p>
                </td>

                <td className="px-4 py-4">
                  <StatusBadge status={shop.status} />
                </td>

                <td className="px-4 py-4 text-muted-foreground">
                  {formatDate(shop.created_at)}
                </td>

                <td className="px-4 py-4">
                  <Link
                    href={`/manage-shops/${shop.id}`}
                    className="font-medium text-primary hover:underline"
                  >
                    View details
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function ManageShopsPage() {
  return (
    <div className="space-y-6">
      <main>
        <ModulesPageHeader
          title="Manage Shops"
          subtitle="Add, edit, or remove shops here"
        />
      </main>

      <Suspense
        fallback={
          <div className="rounded-xl border p-8 text-sm text-muted-foreground">
            Loading shops...
          </div>
        }
      >
        <ShopListContent />
      </Suspense>
    </div>
  );
}
