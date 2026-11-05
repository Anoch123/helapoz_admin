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
    items: [
      {
        href: "/dashboard",
        label: "Dashboard",
        icon: "grid",
      },
    ],
  },
  {
    title: "Business Management",
    items: [
      {
        href: "/manage-shops",
        label: "Manage Shops",
        icon: "store",
      },
    ],
  },
  {
    title: "Billing & Finance",
    items: [
      {
        href: "/subscriptions",
        label: "Subscriptions",
        icon: "repeat",
      },
      {
        href: "/invoices",
        label: "Invoices",
        icon: "clipboard-list",
      },
      {
        href: "/payments",
        label: "Payments",
        icon: "credit-card",
      },
    ],
  },
  {
    title: "Communication",
    items: [
      {
        href: "/notifications",
        label: "Notifications",
        icon: "bell",
      },
    ],
  },
  {
    title: "Analytics",
    items: [
      {
        href: "/reports-analytics",
        label: "Reports & Analytics",
        icon: "chart",
      },
    ],
  },
  {
    title: "Audits",
    items: [
      {
        href: "/audit-logs",
        label: "Audit Logs",
        icon: "scroll-text",
      },
    ],
  },
];

export const APP_HEADER_MENU_ITEMS = [
  { href: "/profile", label: "My profile", icon: User },
  { href: "/helapoz-settings", label: "Platform settings", icon: Settings },
] as const;
