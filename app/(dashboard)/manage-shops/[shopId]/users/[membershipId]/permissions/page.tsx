import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { requireSuperAdmin } from "@/lib/auth/require-super-admin";
import { getShopUserPermissions } from "@/lib/services/shop-user-permissions.service";
import { ShopUserPermissionsForm } from "@/components/forms/shop-user-permissions-form";
import { Button } from "@/components/ui/button";
import { connection } from "next/server";

type PageProps = {
  params: Promise<{
    shopId: string;
    membershipId: string;
  }>;
};

async function PermissionsContent({
  shopId,
  membershipId,
}: {
  shopId: string;
  membershipId: string;
}) {
  await connection();
  await requireSuperAdmin();

  let data;

  try {
    data = await getShopUserPermissions(shopId, membershipId);
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "MEMBERSHIP_NOT_FOUND"
    ) {
      notFound();
    }

    if (
      error instanceof Error &&
      error.message === "INVALID_MEMBERSHIP_ROLE"
    ) {
      notFound();
    }

    throw error;
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <div className="space-y-2">
        <Button variant="outline" size="sm">
          <Link href={`/manage-shops/${shopId}`}>
            Back to shop
          </Link>
        </Button>

        <div>
          <h1 className="text-2xl font-semibold">
            Manage Shop User Permissions
          </h1>
          <p className="text-sm text-muted-foreground">
            Grant or revoke permissions for this Shop User.
          </p>
        </div>
      </div>

      <ShopUserPermissionsForm
        shopId={shopId}
        membershipId={membershipId}
        displayName={data.membership.display_name}
        permissions={data.permissions}
        assignedPermissionKeys={data.assignedPermissionKeys}
      />
    </div>
  );
}

export default function ShopUserPermissionsPage({
  params,
}: PageProps) {
  return (
    <Suspense fallback={<div>Loading permissions...</div>}>
      {params.then(({ shopId, membershipId }) => (
        <PermissionsContent
          shopId={shopId}
          membershipId={membershipId}
        />
      ))}
    </Suspense>
  );
}