"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";

export function NavbarWrapper() {
  const pathname = usePathname();

  const isDashboard =
    pathname === "/admin" ||
    pathname.startsWith("/admin/") ||
    pathname === "/doctor" ||
    pathname.startsWith("/doctor/");

  if (isDashboard) {
    return null;
  }

  return <Navbar />;
}