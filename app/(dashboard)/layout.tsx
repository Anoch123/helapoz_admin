import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/widgets/dashboard/app-sidebar";
import DashboardAuthGuard from "@/lib/providers/dashboard-auth-guard";
import { Suspense } from "react";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-sm text-muted-foreground">Loading dashboard...</p>
        </div>
      }
    >
      <DashboardAuthGuard>
        <SidebarProvider>
          <AppSidebar />
          <main className="min-w-0 flex-1">
            <SidebarTrigger />
            {children}
          </main>
        </SidebarProvider>
      </DashboardAuthGuard>
    </Suspense>
  );
}
