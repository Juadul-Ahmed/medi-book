
import Link from "next/link";

const sections = [
  {
    title: "Doctor applications",
    description: "Review doctor registrations and approve eligible applicants.",
    href: "/admin/doctors",
    action: "Review applications",
  },
  {
    title: "Appointments",
    description: "Manage patient bookings and cancellations.",
    href: "/admin/appointments",
    action: "Manage appointments",
  },
  {
    title: "Patients",
    description: "Access patient management tools.",
    href: "/admin/patients",
    action: "Manage patients",
  },
  {
    title: "Specialties",
    description: "Manage the medical specialties available on MediBook.",
    href: "/admin/specialties",
    action: "Manage specialties",
  },
];

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      <header>
        <p className="text-sm font-semibold tracking-wider text-[#166534]">
          ADMINISTRATION
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-stone-900">
          Dashboard overview
        </h1>
        <p className="mt-2 text-stone-500">
          Manage doctors, patients, and healthcare operations.
        </p>
      </header>

      <section className="grid gap-5 sm:grid-cols-2">
        {sections.map((section) => (
          <article
            key={section.title}
            className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm"
          >
            <h2 className="text-lg font-semibold text-stone-900">
              {section.title}
            </h2>
            <p className="mt-3 text-sm leading-6 text-stone-500">
              {section.description}
            </p>
            <Link
              href={section.href}
              className="mt-5 inline-flex rounded-xl bg-[#166534] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#14532d]"
            >
              {section.action}
            </Link>
          </article>
        ))}
      </section>
    </div>
  );
}
