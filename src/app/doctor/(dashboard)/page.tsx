
import Link from "next/link";

const sections = [
  {
    title: "Appointments",
    description: "View and manage your upcoming patient appointments.",
    href: "/doctor/appointments",
    action: "View appointments",
  },
  {
    title: "Availability",
    description: "Configure when patients can book appointments with you.",
    href: "/doctor/availability",
    action: "Manage availability",
  },
  {
    title: "My profile",
    description: "Review your professional information and consultation fee.",
    href: "/doctor/profile",
    action: "View profile",
  },
];

export default function DoctorDashboardPage() {
  return (
    <div className="space-y-8">
      <header>
        <p className="text-sm font-semibold tracking-wider text-[#B52D32]">
          DOCTOR WORKSPACE
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-stone-900">
          Your dashboard
        </h1>
        <p className="mt-2 text-stone-500">
          Manage your schedule and patient appointments.
        </p>
      </header>

      <section className="grid gap-5 lg:grid-cols-3">
        {sections.map((section) => (
          <article
            key={section.title}
            className="flex flex-col rounded-2xl border border-stone-200 bg-white p-6 shadow-sm"
          >
            <h2 className="text-lg font-semibold text-stone-900">
              {section.title}
            </h2>
            <p className="mt-3 flex-1 text-sm leading-6 text-stone-500">
              {section.description}
            </p>
            <Link
              href={section.href}
              className="mt-6 inline-flex w-fit rounded-xl bg-[#B52D32] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#922329]"
            >
              {section.action}
            </Link>
          </article>
        ))}
      </section>
    </div>
  );
}
