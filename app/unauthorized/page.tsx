import LogoutButton from "@/components/widgets/auth/logout-button";
import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold">Access Denied</h1>

      <p>Your account does not have permission to access this portal.</p>

      <Link href="/dashboard">Try Again</Link>

      <div className="border-t pt-4">
        <LogoutButton />
      </div>
    </main>
  );
}
