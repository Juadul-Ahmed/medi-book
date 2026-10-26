"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@heroui/react";
import { signOut, useSession } from "@/lib/auth-client";
import { NotificationBell } from "@/components/notifications/notification-bell";
const publicNavigation = [
  { label: "Home", href: "/" },
  { label: "Find Doctors", href: "/doctors" },
  { label: "About Us", href: "/about" },
  { label: "Contact Us", href: "/contact" },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, isPending } = useSession();

  const user = isPending ? undefined : session?.user;
  const role = user?.role;

  const extraNavigation = !user
    ? []
    : role === "ADMIN"
      ? [
          { label: "Admin Dashboard", href: "/admin" },
          { label: "Manage Appointments", href: "/admin/appointments" },
        ]
      : role === "DOCTOR"
        ? [
            { label: "Doctor Dashboard", href: "/doctor" },
            { label: "Appointments", href: "/doctor/appointments" },
          ]
        : [
            { label: "My Appointments", href: "/appointments" },
            { label: "Book Appointment", href: "/doctors" },
          ];

  const navigation = [...publicNavigation, ...extraNavigation];

  function isActive(href: string) {
    return href === "/"
      ? pathname === "/"
      : pathname === href || pathname.startsWith(`${href}/`);
  }

  async function handleSignOut() {
    const result = await signOut();

    if (result.error) {
      return;
    }

    router.replace("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-50 border-b border-[#E2E8E3] bg-white/95 backdrop-blur">
      <nav
        aria-label="Main navigation"
        className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-4 px-5 sm:px-8"
      >
        {/* Brand */}
        <Link
          href="/"
          className="shrink-0 text-xl font-bold tracking-tight text-[#166534] transition-colors hover:text-[#15803D]"
        >
          MediBook
        </Link>

        {/* Desktop navigation */}
        <div className="hidden items-center gap-1 md:flex">
          {navigation.map((item) => (
            <Link
              key={`${item.label}-${item.href}`}
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive(item.href)
                  ? "bg-[#DCFCE7] text-[#166534]"
                  : "text-[#647067] hover:bg-[#F0F7F1] hover:text-[#14532D]"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Authentication actions */}
        <div className="flex shrink-0 items-center gap-2">
          {isPending ? (
            <div
              aria-label="Loading account"
              className="h-9 w-24 animate-pulse rounded-lg bg-[#F0F7F1]"
            />
          ) : user ? (
            <>
              <NotificationBell role={role} />

              <span className="hidden max-w-32 truncate text-sm font-medium text-[#1C2921] lg:inline">
                {user.name}
              </span>

              <Button
                variant="outline"
                onPress={handleSignOut}
                className="border-[#D1DCCF] bg-white text-[#166534] hover:bg-[#F0F7F1]"
              >
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                onPress={() => router.push("/login")}
                className="border-[#D1DCCF] bg-white text-[#166534] hover:bg-[#F0F7F1]"
              >
                Sign In
              </Button>

              <Button
                onPress={() => router.push("/register")}
                className="bg-[#166534] font-medium text-white hover:bg-[#14532D]"
              >
                Register
              </Button>
            </>
          )}
        </div>
      </nav>

      {/* Mobile navigation */}
      <div className="flex gap-2 overflow-x-auto border-t border-[#E2E8E3] bg-[#F8FAF8] px-5 py-2 md:hidden">
        {navigation.map((item) => (
          <Link
            key={`${item.label}-${item.href}`}
            href={item.href}
            aria-current={isActive(item.href) ? "page" : undefined}
            className={`shrink-0 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              isActive(item.href)
                ? "bg-[#DCFCE7] text-[#166534]"
                : "text-[#647067] hover:bg-[#EAF3EB]"
            }`}
          >
            {item.label}
          </Link>
        ))}

        {!isPending && !user && (
          <>
            <Link
              href="/login"
              className="shrink-0 rounded-lg px-3 py-2 text-sm font-semibold text-[#166534]"
            >
              Sign In
            </Link>

            <Link
              href="/register"
              className="shrink-0 rounded-lg bg-[#166534] px-3 py-2 text-sm font-semibold text-white"
            >
              Register
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
