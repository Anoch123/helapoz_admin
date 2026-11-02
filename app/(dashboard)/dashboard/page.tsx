import LogoutButton from "@/components/widgets/auth/logout-button";
import { AppHeader } from "@/components/widgets/dashboard/app-header";
import { getCurrentAdminProfile } from "@/lib/services/admin-profile.service";
import { redirect } from "next/navigation";
import { Suspense } from "react";

async function DashboardContent() {
  const admin = await getCurrentAdminProfile();

  // Redirect if profile is missing, inactive, or not SUPER_ADMIN
  if (!admin) {
    redirect("/");
  }

  return (
    <div className="flex flex-wrap items-end justify-between gap-3 mt-6 p-4">
      
      {/* <div className="flex min-h-screen flex-col items-center justify-center gap-6 py-10">
      <div className="text-center">
        <h1 className="text-4xl font-bold">
          Welcome, {admin.full_name}!
        </h1>

        <p className="mt-4 text-lg text-muted-foreground">
          You are successfully logged in to Helpoz Admin.
        </p>
      </div>

      <div className="w-full max-w-md rounded-xl border p-6">
        <h2 className="mb-4 text-lg font-semibold">
          Administrator Information
        </h2>

        <div className="space-y-3">
          <div>
            <p className="text-sm text-muted-foreground">Full Name</p>
            <p className="font-medium">{admin.full_name}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Email</p>
            <p className="font-medium">{admin.email}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Role</p>
            <p className="font-medium">{admin.role}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Account Status</p>
            <p className="font-medium">
              {admin.is_active ? "Active" : "Inactive"}
            </p>
          </div>
        </div>
      </div>

      <div className="border-t pt-4">
        <LogoutButton />
      </div>
    </div> */}

    </div>
  );
}

export default function Dashboard() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      }
    >
      <AppHeader />
      <DashboardContent />
    </Suspense>
  );
}