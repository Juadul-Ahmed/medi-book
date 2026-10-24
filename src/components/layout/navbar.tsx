
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@heroui/react";
import { signOut, useSession } from "@/lib/auth-client";

const navigationItems = [
  { label: "Home", href: "/" },
  { label: "Find Doctors", href: "/doctors" },
  { label: "My Appointments", href: "/appointments" },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, isPending } = useSession();

  async function handleSignOut() {
    const result = await signOut();

    if (result.error) return;

    router.replace("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-50 border-b border-stone-200 bg-white/95 backdrop-blur">
      <nav
        aria-label="Main navigation"
        className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-5 sm:px-8"
      >
        {/* Brand */}
        <Link
          href="/"
          className="shrink-0 text-xl font-bold tracking-tight text-rose-800"
        >
          MediBook
        </Link>

        {/* Desktop navigation */}
        <div className="hidden items-center gap-1 md:flex">
          {navigationItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname === item.href ||
                  pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-rose-50 text-rose-800"
                    : "text-stone-600 hover:bg-stone-100 hover:text-stone-950"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* Authentication actions */}
        <div className="flex shrink-0 items-center gap-2">
          {isPending ? (
            <span className="text-sm text-stone-500">Loading...</span>
          ) : session?.user ? (
            <>
              <span className="hidden max-w-32 truncate text-sm font-medium text-stone-700 lg:inline">
                {session.user.name}
              </span>

              <Button
                variant="outline"
                onPress={handleSignOut}
                className="border-stone-300 text-stone-700"
              >
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                onPress={() => router.push("/login")}
                className="border-stone-300 text-stone-700"
              >
                Sign in
              </Button>

              <Button
                onPress={() => router.push("/register")}
                className="bg-rose-800 font-medium text-white hover:bg-rose-900"
              >
                Register
              </Button>
            </>
          )}
        </div>
      </nav>

      {/* Mobile navigation */}
      <div className="flex gap-2 overflow-x-auto border-t border-stone-100 px-5 py-2 md:hidden">
        {navigationItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname === item.href ||
                pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={`shrink-0 rounded-lg px-3 py-2 text-sm font-medium ${
                isActive
                  ? "bg-rose-50 text-rose-800"
                  : "text-stone-600 hover:bg-stone-100"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </header>
  );
}
