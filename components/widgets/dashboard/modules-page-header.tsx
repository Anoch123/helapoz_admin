import type { ReactNode } from "react";

import { ModulePageHeaderProps } from "@/lib/types/admin";

export default function ModulesPageHeader({
  title,
  subtitle,
  eyebrow,
  actions,
}: ModulePageHeaderProps) {
  return (
    <div className="relative flex flex-col gap-4 border-b border-slate-200/80 px-4 pb-6 pt-4 sm:flex-row sm:items-end sm:justify-between sm:px-6">
      {/* Ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-10 left-0 h-32 w-72 bg-[radial-gradient(60%_100%_at_0%_0%,rgba(99,102,241,0.10),transparent)]"
      />

      <div className="relative flex min-w-0 items-stretch gap-4">
        {/* Accent bar */}
        <span className="w-1 shrink-0 rounded-full bg-gradient-to-b from-indigo-400 to-violet-600 shadow-[0_0_14px_1px_rgba(129,140,248,0.45)]" />

        <div className="min-w-0">
          {eyebrow && (
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-indigo-500">
              {eyebrow}
            </p>
          )}

          <h1 className="truncate text-3xl font-bold tracking-tight text-slate-900 sm:text-[32px]">
            {title}
          </h1>

          {subtitle && (
            <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-slate-500">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {actions && (
        <div className="relative flex shrink-0 items-center gap-2 sm:gap-3">
          {actions}
        </div>
      )}
    </div>
  );
}