import { NavGroup } from "../types/admin";
import {
  Bell,
  ChevronDown,
  ClipboardList,
  Plus,
  Search,
  Settings,
  User,
} from "lucide-react";

export const BASICSYSTEMDATA = {
    'appName': 'HELAPOZ ADMIN',
    'appDescription': 'HELAPOZ ADMIN',
    'appKeywords': 'HELAPOZ ADMIN',
}

// Icon values are keys into components/icons.tsx
export const NAV: NavGroup[] = [
  {
    title: "Overview",
    items: [{ href: "/dashboard", label: "Dashboard", icon: "grid" }],
  },
  {
    title: "Tenants",
    items: [
      { href: "/manage-shops", label: "Manage Shops", icon: "store" },
    ],
  },
  {
    title: "Insight",
    items: [
      { href: "/reports-analytics", label: "Reports & analytics", icon: "chart" },
    ],
  },
  {
    title: "System",
    items: [
      { href: "/helapoz-settings", label: "Platform settings", icon: "cog" },
    ],
  },
  {
    title: "Payment",
    items: [
      { href: "/payments", label: "Manage Payments", icon: "credit-card" },
    ],
  },
  {
    title: "Invoices",
    items: [
      { href: "/invoices", label: "Manage Invoices", icon: "clipboard-list" },
    ],
  },
];

export const APP_HEADER_MENU_ITEMS = [
  { href: "/profile", label: "My profile", icon: User },
  { href: "/helapoz-settings", label: "Platform settings", icon: Settings },
] as const;
