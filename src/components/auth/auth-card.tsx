
import type { ReactNode } from "react";
import Link from "next/link";

type AuthCardProps = {
  title: string;
  description: string;
  children: ReactNode;
  footer: ReactNode;
};

export function AuthCard({
  title,
  description,
  children,
  footer,
}: AuthCardProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-stone-50 px-4 py-10">
      <section className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
        <Link
          href="/"
          className="text-sm font-bold tracking-wide text-rose-800"
        >
          MediBook
        </Link>

        <header className="mt-6">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            {title}
          </h1>

          <p className="mt-2 text-sm leading-6 text-gray-600">
            {description}
          </p>
        </header>

        <div className="mt-6">{children}</div>

        <footer className="mt-6 text-center text-sm text-gray-600">
          {footer}
        </footer>
      </section>
    </main>
  );
}
