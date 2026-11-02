"use client";

import { LogOut, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useLogout } from "@/hooks/useLogout";

export default function LogoutButton() {
  const { logout, isPending, error } = useLogout();

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="outline"
        className="w-full justify-start"
        onClick={logout}
        disabled={isPending}
      >
        {isPending ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <LogOut className="mr-2 h-4 w-4" />
        )}

        {isPending ? "Logging out..." : "Logout"}
      </Button>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}