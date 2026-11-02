"use client";

import LoginForm from "@/components/forms/login-form";
import { BASICSYSTEMDATA } from "@/lib/constants/helper-constants";

export default function AdminLogin() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="flex w-full max-w-sm flex-col items-center gap-8">
        <h2 className="text-2xl font-bold tracking-[0.3em]">{BASICSYSTEMDATA.appName}</h2>
        <LoginForm />
      </div>
    </div>
  );
}