import { connection } from "next/server";
import { requireAuth } from "@/lib/auth/require-auth";

interface DashboardAuthGuardProps {
  children: React.ReactNode;
}

export default async function DashboardAuthGuard({
  children,
}: DashboardAuthGuardProps) {
  await connection();
  await requireAuth();

  return <>{children}</>;
}