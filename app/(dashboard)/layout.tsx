
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppHeader } from "@/components/widgets/dashboard/app-header";
import { AppSidebar } from "@/components/widgets/dashboard/app-sidebar";
import { AdminProvider } from "@/lib/providers/admin-provider";
import DashboardAuthGuard from "@/lib/providers/dashboard-auth-guard";
import { getCurrentAdminProfile } from "@/lib/services/admin-profile.service";
import { Suspense } from "react";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Suspense
      fallback={
        <div className="flex h-dvh items-center justify-center">
          <p className="text-sm text-muted-foreground">
            Loading dashboard...
          </p>
        </div>
      }
    >
      <DashboardContent>
        {children}
      </DashboardContent>
    </Suspense>
  );
}

// This component performs the dynamic data access
async function DashboardContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await getCurrentAdminProfile();

  return (
    <DashboardAuthGuard>
      <AdminProvider admin={admin}>
        <SidebarProvider className="h-dvh min-h-0 overflow-hidden">
          <AppSidebar />

          <main className="flex h-dvh min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
            <AppHeader />
            <SidebarTrigger />
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain">
              {children}
            </div>
          </main>
        </SidebarProvider>
      </AdminProvider>
    </DashboardAuthGuard>
  );
}
