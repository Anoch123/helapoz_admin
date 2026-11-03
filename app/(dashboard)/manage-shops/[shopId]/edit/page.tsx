import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { requireSuperAdmin } from "@/lib/auth/require-super-admin";
import { getShopById } from "@/lib/services/shop.service";
import { EditShopForm } from "@/components/forms/edit-shop-form";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { connection } from "next/server";

async function EditShopContent({
  params,
}: {
  params: Promise<{ shopId: string }>;
}) {
  const { shopId } = await params;
  await connection();
  await requireSuperAdmin();

  const shop = await getShopById(shopId);

  if (!shop) {
    notFound();
  }

  return (
    <div className="space-y-6 p-4">
      <div className="space-y-3">
        <Link
          href={`/manage-shops/${shop.id}`}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 size-4" />
          Back to Shop
        </Link>

        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Edit Shop
          </h1>

          <p className="text-sm text-muted-foreground">
            Update the business information for {shop.name}.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Shop Details</CardTitle>
        </CardHeader>

        <CardContent>
          <EditShopForm shop={shop} />
        </CardContent>
      </Card>
    </div>
  );
}

export default function EditShopPage({
  params,
}: {
  params: Promise<{ shopId: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="rounded-xl border p-8 text-sm text-muted-foreground">
          Loading shop information...
        </div>
      }
    >
      <EditShopContent params={params} />
    </Suspense>
  );
}