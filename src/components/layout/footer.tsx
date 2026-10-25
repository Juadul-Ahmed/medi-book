
import Link from "next/link";

const footerLinks = {
  Explore: [
    { label: "Find Doctors", href: "/doctors" },
    { label: "My Appointments", href: "/appointments" },
  ],
  Company: [
    { label: "About Us", href: "/about" },
    { label: "Contact Us", href: "/contact" },
  ],
  Account: [
    { label: "Sign In", href: "/login" },
    { label: "Create Account", href: "/register" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-[#123D28] text-white">
      <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr]">
          {/* Brand */}
          <div className="max-w-sm">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-2xl font-bold tracking-tight text-white"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-lg text-[#166534]">
                +
              </span>
              MediBook
            </Link>

            <p className="mt-5 text-sm leading-7 text-green-100/80">
              Making healthcare easier to navigate. Discover doctors, explore
              specialties, and manage your appointments in one place.
            </p>

            <p className="mt-5 text-xs leading-5 text-green-100/60">
              Your healthcare journey, organized.
            </p>
          </div>

          {/* Footer link groups */}
          {Object.entries(footerLinks).map(([heading, links]) => (
            <div key={heading}>
              <h3 className="text-sm font-semibold tracking-wide text-white">
                {heading}
              </h3>

              <ul className="mt-5 space-y-3">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-green-100/75 transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-white/15 pt-6 text-xs text-green-100/65 sm:flex-row sm:items-center sm:justify-between">
          <p>
             © 2026 MediBook. All rights reserved.
          </p>

          <p>
            For emergencies, contact your local emergency services.
          </p>
        </div>
      </div>
    </footer>
  );
}
