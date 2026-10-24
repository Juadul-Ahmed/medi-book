"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setSidebarOpen } from "@/store/store";
import { LogoutButton } from "@/components/layouts/logout-button";
export type DashboardNavItem = {
  label: string;
  href: string;
  icon: string;
};

type DashboardShellProps = {
  role: "Admin" | "Doctor";
  name: string;
  email: string;
  navigation: DashboardNavItem[];
  children: React.ReactNode;
};

export function DashboardShell({
  role,
  name,
  email,
  navigation,
  children,
}: DashboardShellProps) {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const sidebarOpen = useAppSelector((state) => state.ui.sidebarOpen);

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-stone-800">
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => dispatch(setSidebarOpen(false))}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-stone-200 bg-white transition-transform duration-200 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Link
          href={role === "Admin" ? "/admin" : "/doctor"}
          className="flex h-20 items-center gap-3 border-b border-stone-100 px-6"
          onClick={() => dispatch(setSidebarOpen(false))}
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#B52D32] text-lg font-bold text-white">
            M
          </span>
          <span>
            <span className="block text-lg font-bold tracking-tight">
              MediBook
            </span>
            <span className="text-xs text-stone-500">{role} portal</span>
          </span>
        </Link>

        <div className="px-4 pb-2 pt-6">
          <p className="px-3 text-xs font-semibold uppercase tracking-wider text-stone-400">
            Workspace
          </p>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3">
          {navigation.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/admin" &&
                item.href !== "/doctor" &&
                pathname.startsWith(`${item.href}/`));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => dispatch(setSidebarOpen(false))}
                className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                  active
                    ? "bg-[#B52D32]/10 text-[#B52D32]"
                    : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
                }`}
              >
                <span className="w-6 text-center text-base" aria-hidden="true">
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-stone-100 p-4">
          <div className="flex items-center gap-3 rounded-xl bg-stone-50 p-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#B52D32] font-semibold text-white">
              {name.trim().charAt(0).toUpperCase() || role.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{name}</p>
              <p className="truncate text-xs text-stone-500">{role}</p>
            </div>
          </div>
        </div>
      </aside>

      <div className="min-h-screen lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-stone-200 bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Open navigation"
              className="rounded-lg border border-stone-200 px-3 py-2 text-sm hover:bg-stone-50 lg:hidden"
              onClick={() => dispatch(setSidebarOpen(true))}
            >
              ☰
            </button>
            <div>
              <p className="text-sm font-semibold text-stone-800">
                {role} dashboard
              </p>
              <p className="hidden text-xs text-stone-500 sm:block">
                Welcome back, {name}
              </p>
            </div>
          </div>

          <div className="hidden max-w-xs flex-1 px-8 md:block">
            <label className="flex items-center gap-2 rounded-xl border border-stone-200 bg-stone-50 px-3 py-2">
              <span aria-hidden="true" className="text-stone-400">
                ⌕
              </span>
              <input
                type="search"
                placeholder="Search..."
                aria-label="Search dashboard"
                className="w-full bg-transparent text-sm outline-none placeholder:text-stone-400"
              />
            </label>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden max-w-40 truncate text-sm text-stone-600 sm:block">
              {email}
            </span>

            <div
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F9E7E8] text-sm font-bold text-[#B52D32]"
              aria-label={`${name}'s profile`}
            >
              {name.trim().charAt(0).toUpperCase() || role.charAt(0)}
            </div>

            <LogoutButton />
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1600px] p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
