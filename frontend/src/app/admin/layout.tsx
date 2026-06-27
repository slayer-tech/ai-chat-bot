"use client";

import { AuthGuard } from "@/components/AuthGuard";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AuthGuard allowedRoles={["superadmin"]}>{children}</AuthGuard>;
}
