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
    title: "Payment & Invoices",
    items: [
      { href: "/payments", label: "Manage Payments", icon: "credit-card" },
      { href: "/invoices", label: "Manage Invoices", icon: "clipboard-list" },
    ],
  },
  {
    title: "Subscriptions",
    items: [
      { href: "/subscriptions", label: "Manage Subscriptions", icon: "clipboard-list" },
    ],
  },
  {
    title: "Insight",
    items: [
      { href: "/reports-analytics", label: "Reports & analytics", icon: "chart" },
    ],
  },
];

export const APP_HEADER_MENU_ITEMS = [
  { href: "/profile", label: "My profile", icon: User },
  { href: "/helapoz-settings", label: "Platform settings", icon: Settings },
] as const;
