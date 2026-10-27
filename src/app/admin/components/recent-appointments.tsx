
import Link from "next/link";
import { FiArrowRight, FiCalendar } from "react-icons/fi";
import type { AppointmentStatus } from "@/generated/prisma/client";

export type RecentAppointment = {
  id: string;
  startAt: Date;
  status: AppointmentStatus;
  patient: { name: string; email: string };
  doctor: {
    user: { name: string };
    specialty: { name: string };
  };
};

export function RecentAppointments({
  appointments,
}: {
  appointments: RecentAppointment[];
}) {
  return (
    <article className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-stone-900">
            Recent appointments
          </h2>
          <p className="mt-1 text-sm text-stone-500">
            Latest appointments created
          </p>
        </div>

        <Link
          href="/admin/appointments"
          className="inline-flex items-center gap-1 text-sm font-semibold text-[#166534] hover:underline"
        >
          View all <FiArrowRight />
        </Link>
      </div>

      {appointments.length === 0 ? (
        <div className="py-12 text-center">
          <FiCalendar className="mx-auto h-8 w-8 text-stone-300" />
          <p className="mt-3 text-sm font-medium text-stone-700">
            No appointments yet
          </p>
          <p className="mt-1 text-sm text-stone-500">
            New appointments will appear here.
          </p>
        </div>
      ) : (
        <div className="mt-5 divide-y divide-stone-100">
          {appointments.map((appointment) => (
            <div
              key={appointment.id}
              className="flex items-start justify-between gap-4 py-4 first:pt-0 last:pb-0"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-stone-900">
                  {appointment.patient.name}
                </p>
                <p className="mt-1 truncate text-xs text-stone-500">
                  Dr. {appointment.doctor.user.name} ·{" "}
                  {appointment.doctor.specialty.name}
                </p>
                <p className="mt-1 text-xs text-stone-500">
                  {new Intl.DateTimeFormat("en", {
                    dateStyle: "medium",
                    timeStyle: "short",
                    timeZone: "UTC",
                  }).format(appointment.startAt)}{" "}
                  UTC
                </p>
              </div>

              <span className="shrink-0 rounded-full bg-stone-100 px-2.5 py-1 text-xs font-medium text-stone-700">
                {appointment.status.replace("_", " ")}
              </span>
            </div>
          ))}
        </div>
      )}
    </article>
  );
}
