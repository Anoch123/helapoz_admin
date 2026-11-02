"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Store,
  ShieldCheck,
  Users,
  Repeat,
  CreditCard,
  Receipt,
  ChartNoAxesCombined,
  Bell,
  Settings,
  ClipboardList,
  ChevronRight,
  Search,
  LogOut,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import { NAV } from "@/lib/constants/helper-constants";
import LogoutButton from "../auth/logout-button";

const ICONS = {
  grid: LayoutDashboard,
  store: Store,
  shield: ShieldCheck,
  users: Users,
  repeat: Repeat,
  card: CreditCard,
  receipt: Receipt,
  chart: ChartNoAxesCombined,
  bell: Bell,
  cog: Settings,
  list: ClipboardList,
} as const;

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (href: string) =>
    href === "/"
      ? pathname === "/"
      : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Sidebar
      collapsible="icon"
      className="relative overflow-hidden border-r border-white/[0.06] bg-[#0B0E17] text-white"
    >

      {/* NAVIGATION */}
      <SidebarContent className="relative z-10 gap-0 px-3 pb-4 pt-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden mt-10">
        {NAV.map((group) => (
          <SidebarGroup key={group.title} className="mb-3 p-0">
            <SidebarGroupLabel className="mb-1.5 flex h-auto items-center gap-2 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
              {group.title}
              <span className="h-px flex-1 bg-gradient-to-r from-white/[0.08] to-transparent" />
            </SidebarGroupLabel>

            <SidebarGroupContent>
              <SidebarMenu className="gap-1">
                {group.items.map((item) => {
                  const Icon =
                    ICONS[item.icon as keyof typeof ICONS] ?? LayoutDashboard;
                  const active = isActive(item.href);

                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        isActive={active}
                        tooltip={item.label}
                        onClick={() => router.push(item.href)}
                        className={`
                          group/item relative h-11 rounded-xl px-2 transition-all duration-200
                          group-data-[collapsible=icon]/sidebar:!p-0
                          group-data-[collapsible=icon]/sidebar:justify-center
                          ${
                            active
                              ? "bg-gradient-to-r from-indigo-500/20 via-violet-500/10 to-transparent text-white ring-1 ring-inset ring-indigo-400/20 hover:from-indigo-500/25 hover:text-white"
                              : "text-slate-400 hover:!bg-white hover:!text-slate-900 hover:shadow-lg hover:shadow-white/10"
                          }
                        `}
                      >
                        {active && (
                          <span className="absolute -left-3 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-gradient-to-b from-indigo-300 to-violet-500 shadow-[0_0_14px_2px_rgba(129,140,248,0.7)]" />
                        )}

                        <span
                          className={`
                            grid h-7 w-7 shrink-0 place-items-center rounded-lg transition-all duration-200
                            ${
                              active
                                ? "bg-gradient-to-br from-indigo-400 to-violet-600 text-white shadow-[0_4px_14px_-2px_rgba(99,102,241,0.7)]"
                                : "bg-white/[0.04] text-slate-400 group-hover/item:bg-indigo-500/10 group-hover/item:text-indigo-600"
                            }
                          `}
                        >
                          <Icon className="h-[15px] w-[15px]" strokeWidth={2} />
                        </span>

                        <span className="flex-1 truncate text-[13px] font-medium tracking-tight">
                          {item.label}
                        </span>

                        {item.badge && (
                          <span
                            className={`
                              relative ml-auto flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold
                              ${
                                active
                                  ? "bg-white text-indigo-600"
                                  : "bg-rose-500/90 text-white shadow-[0_0_12px_rgba(244,63,94,0.45)]"
                              }
                            `}
                          >
                            {item.badge}
                          </span>
                        )}

                        {active && !item.badge && (
                          <ChevronRight className="ml-auto h-3.5 w-3.5 text-indigo-300/70" />
                        )}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      {/* FOOTER */}
      <SidebarFooter className="relative z-10 gap-3 p-3">
        {/* PROFILE */}
        <div
          className={`ml-auto shrink-0 place-items-center rounded-lg text-slate-500 transition-colors hover:bg-rose-500/15 hover:text-rose-300 group-data-[collapsible=icon]/sidebar:hidden`}
        >
          <LogoutButton />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
