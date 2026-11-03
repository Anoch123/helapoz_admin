"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronDown,
  Plus,
} from "lucide-react";

import { APP_HEADER_MENU_ITEMS, BASICSYSTEMDATA, NAV } from "@/lib/constants/helper-constants";
import LogoutButton from "../auth/logout-button";
import { useAdmin } from "@/lib/providers/admin-provider";
import { SidebarTrigger } from "@/components/ui/sidebar";

type AppHeaderProps = {
  onSearch?: () => void;
};

export function AppHeader({ onSearch }: AppHeaderProps) {
  const pathname = usePathname();
  const admin = useAdmin();

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click / Escape / route change
  useEffect(() => {
    if (!menuOpen) return;
    const onDown = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  useEffect(() => setMenuOpen(false), [pathname]);

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b border-slate-200/70 bg-white/70 px-3 backdrop-blur-xl sm:px-5">
      {/* LEFT: sidebar toggle + page context */}
      {/* <SidebarTrigger className="h-9 w-9 shrink-0 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900" />
      <span className="hidden h-5 w-px bg-slate-200 sm:block" /> */}

      <div className="min-w-0 leading-tight">
        <h1 className="truncate text-[15px] font-bold tracking-tight text-slate-900">
          {BASICSYSTEMDATA.appName}
        </h1>
      </div>

      {/* RIGHT */}
      <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
    
        {/* Primary action */}
        <Link
          href="/manage-shops/new"
          className="hidden h-10 items-center gap-1.5 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 px-4 text-[13px] font-semibold text-white shadow-[0_6px_18px_-4px_rgba(99,102,241,0.6)] transition-all hover:-translate-y-px hover:shadow-[0_10px_24px_-4px_rgba(99,102,241,0.7)] sm:flex"
        >
          <Plus className="h-4 w-4" strokeWidth={2.5} />
          New shop
        </Link>

        <span className="mx-0.5 hidden h-6 w-px bg-slate-200 md:block" />

        {/* Profile + dropdown */}
        <div ref={menuRef} className="relative">
          <button
            type="button"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
            className={`flex items-center gap-2.5 rounded-xl py-1 pl-1 pr-2 transition-colors hover:bg-slate-100 ${
              menuOpen ? "bg-slate-100" : ""
            }`}
          >
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-[11px] font-bold text-white shadow-[0_4px_12px_-2px_rgba(99,102,241,0.5)]">
              {admin.full_name
                .split(" ")
                .map((n:any) => n[0])}
            </span>
            <span className="hidden text-left leading-tight md:block">
              <span className="block text-[12px] font-semibold text-slate-900">
                {admin.full_name}
              </span>
            </span>
            <ChevronDown
              className={`hidden h-3.5 w-3.5 text-slate-400 transition-transform duration-200 md:block ${
                menuOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Dropdown panel */}
          <div
            role="menu"
            className={`absolute right-0 top-[calc(100%+8px)] z-50 w-64 origin-top-right overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_20px_50px_-12px_rgba(15,23,42,0.25)] transition-all duration-150 ${
              menuOpen
                ? "visible translate-y-0 scale-100 opacity-100"
                : "invisible -translate-y-1 scale-95 opacity-0"
            }`}
          >
            {/* Identity */}
            <div className="relative overflow-hidden border-b border-slate-100 p-4">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_100%_at_0%_0%,rgba(99,102,241,0.12),transparent)]"
              />
              <div className="relative flex items-center gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-[13px] font-bold text-white shadow-[0_6px_16px_-4px_rgba(99,102,241,0.6)]">
                  {admin.full_name
                    .split(" ")
                    .map((n:any) => n[0])}
                </span>
                <div className="min-w-0 leading-tight">
                  <p className="truncate text-[13px] font-semibold text-slate-900">
                    {admin.full_name}
                  </p>
                  <p className="truncate text-[11px] text-slate-400">
                    {admin.email}
                  </p>
                  <span className="mt-1.5 inline-flex rounded-md bg-indigo-50 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-indigo-600">
                    {admin.role}
                  </span>
                </div>
              </div>
            </div>

            {/* Links */}
            <div className="p-1.5">
              {APP_HEADER_MENU_ITEMS.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  role="menuitem"
                  className="group flex h-10 items-center gap-3 rounded-lg px-3 text-[13px] font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
                >
                  <Icon className="h-4 w-4 text-slate-400 transition-colors group-hover:text-indigo-500" />
                  {label}
                </Link>
              ))}
            </div>

            {/* Sign out */}
            <div className="border-t border-slate-100 p-1.5">
              <div
                role="menuitem"
                className="rounded-lg text-slate-500 transition-colors hover:bg-rose-50 hover:text-rose-600"
              >
                <LogoutButton />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}