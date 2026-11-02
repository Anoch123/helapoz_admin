import { getCurrentAdminProfile } from "@/lib/services/admin-profile.service";

export default async function AdminAccountInfo() {
  const admin = await getCurrentAdminProfile();

  if (!admin) {
    return null;
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
        {admin.full_name.charAt(0).toUpperCase()}
      </div>

      <div className="min-w-0">
        <p className="truncate text-sm font-medium">
          {admin.full_name}
        </p>

        <p className="truncate text-xs text-muted-foreground">
          {admin.email}
        </p>

        <p className="text-xs text-muted-foreground">
          {admin.role}
        </p>
      </div>
    </div>
  );
}