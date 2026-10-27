
import Link from "next/link";
import {
  FiArrowRight,
  FiBriefcase,
  FiCalendar,
  FiCheckCircle,
  FiUserCheck,
  FiUsers,
} from "react-icons/fi";
import type { IconType } from "react-icons";

const sections: {
  title: string;
  description: string;
  href: string;
  action: string;
  icon: IconType;
}[] = [
  {
    title: "Doctor applications",
    description: "Review registrations and approve eligible applicants.",
    href: "/admin/doctors",
    action: "Review applications",
    icon: FiUserCheck,
  },
  {
    title: "Appointments",
    description: "Manage patient bookings and cancellations.",
    href: "/admin/appointments",
    action: "Manage appointments",
    icon: FiCalendar,
  },
  {
    title: "Patients",
    description: "Access patient management tools.",
    href: "/admin/patients",
    action: "Manage patients",
    icon: FiUsers,
  },
  {
    title: "Specialties",
    description: "Manage the medical specialties available on MediBook.",
    href: "/admin/specialties",
    action: "Manage specialties",
    icon: FiBriefcase,
  },
];

export function AdminManagement({ specialtyCount }: { specialtyCount: number }) {
  return (
    <section>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-stone-900">Management</h2>
          <p className="mt-1 text-sm text-stone-500">
            Quick access to administrative tools
          </p>
        </div>

        <div className="hidden items-center gap-2 text-sm text-stone-500 sm:flex">
          <FiCheckCircle className="text-[#166534]" />
          {specialtyCount} specialties
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        {sections.map(({ title, description, href, action, icon: Icon }) => (
          <article
            key={title}
            className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm transition hover:border-green-200 hover:shadow-md"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-[#166534]">
              <Icon className="h-5 w-5" />
            </div>

            <h3 className="mt-4 text-lg font-semibold text-stone-900">
              {title}
            </h3>
            <p className="mt-2 text-sm leading-6 text-stone-500">
              {description}
            </p>

            <Link
              href={href}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#166534] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#14532d]"
            >
              {action} <FiArrowRight />
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
