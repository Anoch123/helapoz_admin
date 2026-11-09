"use client";
import DashboardAnalytics from "@/components/widgets/dashboard/dashboard-analytics";
import ModulesPageHeader from "@/components/widgets/dashboard/modules-page-header";

export default function Dashboard() {
  return (
    <main>
      <ModulesPageHeader
        title="Dashboard"
        subtitle="Welcome to your dashboard"
        eyebrow="Tenants"
      />

      <DashboardAnalytics />
    </main>
  );
}
