"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";

export function NavbarWrapper() {
  const pathname = usePathname();

  const isDashboard =
    pathname === "/admin" ||
    pathname.startsWith("/admin/") ||
    pathname === "/doctor/dashboard" ||
    pathname.startsWith("/doctor/dashboard/") ||
    pathname === "/patient/dashboard" ||
    pathname.startsWith("/patient/dashboard/");

  if (isDashboard) {
    return null;
  }

  return <Navbar />;
}