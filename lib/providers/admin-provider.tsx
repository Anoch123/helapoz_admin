
"use client";

import {
  createContext,
  useContext,
} from "react";
import { getCurrentAdminProfile } from "../services/admin-profile.service";

type Admin = Awaited<
  ReturnType<typeof getCurrentAdminProfile>
>;

const AdminContext = createContext<Admin | null>(null);

export function AdminProvider({
  admin,
  children,
}: {
  admin: Admin;
  children: React.ReactNode;
}) {
  return (
    <AdminContext.Provider value={admin}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const admin = useContext(AdminContext);

  if (!admin) {
    throw new Error(
      "useAdmin must be used within AdminProvider"
    );
  }

  return admin;
}
