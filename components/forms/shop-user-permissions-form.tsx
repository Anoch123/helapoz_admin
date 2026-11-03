"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useUpdateShopUserPermissions } from "@/hooks/useUpdateShopUserPermissions";

type Permission = {
  permission_key: string;
  name: string;
  description: string | null;
  category: string;
};

type Props = {
  shopId: string;
  membershipId: string;
  displayName: string;
  permissions: Permission[];
  assignedPermissionKeys: string[];
};

export function ShopUserPermissionsForm({
  shopId,
  membershipId,
  displayName,
  permissions,
  assignedPermissionKeys,
}: Props) {
  const router = useRouter();

  const [selected, setSelected] = useState<string[]>(
    assignedPermissionKeys,
  );

  const {
    updatePermissions,
    pending,
    error,
  } = useUpdateShopUserPermissions(shopId, membershipId);

  const groupedPermissions = useMemo(() => {
    return permissions.reduce<Record<string, Permission[]>>(
      (groups, permission) => {
        const category = permission.category || "Other";
        groups[category] ??= [];
        groups[category].push(permission);
        return groups;
      },
      {},
    );
  }, [permissions]);

  function togglePermission(permissionKey: string, checked: boolean) {
    setSelected((current) =>
      checked
        ? [...current, permissionKey]
        : current.filter((key) => key !== permissionKey),
    );
  }

  function toggleCategory(
    categoryPermissions: Permission[],
    checked: boolean,
  ) {
    const categoryKeys = categoryPermissions.map(
      (permission) => permission.permission_key,
    );

    setSelected((current) => {
      if (checked) {
        return Array.from(new Set([...current, ...categoryKeys]));
      }

      return current.filter((key) => !categoryKeys.includes(key));
    });
  }

  async function handleSave() {
    const success = await updatePermissions(selected);

    if (success) {
      router.push(`/manage-shops/${shopId}`);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border p-4">
        <p className="font-medium">{displayName}</p>
        <p className="text-sm text-muted-foreground">
          Select the POS permissions this Shop User should have.
        </p>
      </div>

      {Object.entries(groupedPermissions).map(
        ([category, categoryPermissions]) => {
          const categoryKeys = categoryPermissions.map(
            (permission) => permission.permission_key,
          );

          const allSelected = categoryKeys.every((key) =>
            selected.includes(key),
          );

          return (
            <section key={category} className="rounded-lg border">
              <div className="flex items-center justify-between border-b p-4">
                <h2 className="font-semibold">{category}</h2>

                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={(event) =>
                      toggleCategory(
                        categoryPermissions,
                        event.target.checked,
                      )
                    }
                  />
                  Select all
                </label>
              </div>

              <div className="grid gap-4 p-4 sm:grid-cols-2">
                {categoryPermissions.map((permission) => (
                  <label
                    key={permission.permission_key}
                    className="flex cursor-pointer items-start gap-3"
                  >
                    <input
                      type="checkbox"
                      className="mt-1"
                      checked={selected.includes(
                        permission.permission_key,
                      )}
                      onChange={(event) =>
                        togglePermission(
                          permission.permission_key,
                          event.target.checked,
                        )
                      }
                    />

                    <span className="space-y-1">
                      <span className="block text-sm font-medium">
                        {permission.name}
                      </span>

                      {permission.description && (
                        <span className="block text-sm text-muted-foreground">
                          {permission.description}
                        </span>
                      )}

                      <span className="block font-mono text-xs text-muted-foreground">
                        {permission.permission_key}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            </section>
          );
        },
      )}

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          disabled={pending}
          onClick={() => router.push(`/manage-shops/${shopId}`)}
        >
          Cancel
        </Button>

        <Button
          type="button"
          disabled={pending}
          onClick={handleSave}
        >
          {pending ? (
            <Loader2 className="mr-2 size-4 animate-spin" />
          ) : (
            <Save className="mr-2 size-4" />
          )}
          Save permissions
        </Button>
      </div>
    </div>
  );
}