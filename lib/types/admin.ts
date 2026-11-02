export type PlatformRole = "SUPER_ADMIN" | "SHOP_ADMIN" | "SHOP_USER";

export interface AdminProfile {
  id: string;
  name: string;
  email: string;
  role: PlatformRole;
  avatarUrl?: string | null;
}

export const ROLE_LABELS: Record<PlatformRole, string> = {
  SUPER_ADMIN: "Super Admin",
  SHOP_ADMIN: "Shop Admin",
  SHOP_USER: "Shop User",
};


export type NavItem = { href: string; label: string; icon: string; badge?: string };
export type NavGroup = { title: string; items: NavItem[] };