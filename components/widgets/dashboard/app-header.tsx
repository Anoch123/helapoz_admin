"use client";

import { Plus } from "lucide-react";

import { BASICSYSTEMDATA } from "@/lib/constants/helper-constants";

export function AppHeader() {

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b border-slate-200/80 bg-white/80 px-4 backdrop-blur-xl sm:px-6">

      <div className="min-w-0 leading-tight">
        <h1 className="truncate text-[15px] font-bold tracking-tight text-slate-900">
          {BASICSYSTEMDATA.appName}
        </h1>
      </div>

      {/* RIGHT */}
      <div className="ml-auto flex items-center gap-2 sm:gap-3">

        {/* Primary action */}
        <button
          type="button"
          className="hidden h-10 items-center gap-1.5 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 px-4 text-[13px] font-semibold text-white shadow-[0_6px_18px_-4px_rgba(99,102,241,0.6)] transition-transform hover:-translate-y-px sm:flex"
        >
          <Plus className="h-4 w-4" />
          New shop
        </button>

        {/* Profile */}
        <div className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white py-1 pl-1 pr-3 transition-colors hover:bg-slate-50">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-[11px] font-bold text-white">
            SA
          </div>
          <div className="hidden leading-tight md:block">
            <p className="text-[12px] font-semibold text-slate-900">
              Super Admin
            </p>
            <p className="text-[10px] text-slate-400">owner@pulsepos.io</p>
          </div>
        </div>
      </div>
    </header>
  );
}