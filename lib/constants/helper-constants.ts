import { NavGroup } from "../types/admin";

export const BASICSYSTEMDATA = {
    'appName': 'HELAPOZ ADMIN',
    'appDescription': 'HELAPOZ ADMIN',
    'appKeywords': 'HELAPOZ ADMIN',
}

// Icon values are keys into components/icons.tsx
export const NAV: NavGroup[] = [
  {
    title: "Overview",
    items: [{ href: "/", label: "Dashboard", icon: "grid" }],
  },
  {
    title: "Tenants",
    items: [
      { href: "/shops", label: "Shops", icon: "store" },
      { href: "/administrators", label: "Shop administrators", icon: "shield" },
      { href: "/users", label: "Employees & users", icon: "users" },
    ],
  },
  {
    title: "Revenue",
    items: [
      { href: "/subscriptions", label: "Subscriptions", icon: "repeat" },
      { href: "/payments", label: "Payments & billing", icon: "card", badge: "1" },
      { href: "/receipts", label: "Receipts & templates", icon: "receipt" },
    ],
  },
  {
    title: "Insight",
    items: [
      { href: "/reports", label: "Reports & analytics", icon: "chart" },
      { href: "/notifications", label: "Notifications", icon: "bell", badge: "3" },
    ],
  },
  {
    title: "System",
    items: [
      { href: "/settings", label: "Platform settings", icon: "cog" },
      { href: "/activity-logs", label: "Admin activity logs", icon: "list" },
    ],
  },
];
