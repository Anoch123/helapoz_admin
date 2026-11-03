import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";

import { requireSuperAdmin } from "@/lib/auth/require-super-admin";
import { getShopById } from "@/lib/services/shop.service";

import { CreateShopUserForm } from "@/components/forms/create-shop-user-form";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { connection } from "next/server";

async function CreateShopUserContent({
  shopId,
}: {
  shopId: string;
}) {
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
            Add Shop User
          </h1>

          <p className="text-sm text-muted-foreground">
            Create an additional staff account for this shop.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>New User Account</CardTitle>
        </CardHeader>

        <CardContent>
          <CreateShopUserForm
            shopId={shop.id}
            shopName={shop.name}
            shopCode={shop.shop_code}
          />
        </CardContent>
      </Card>
    </div>
  );
}

export default function CreateShopUserPage({
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
      {params.then(({ shopId }) => (
        <CreateShopUserContent shopId={shopId} />
      ))}
    </Suspense>
  );
}