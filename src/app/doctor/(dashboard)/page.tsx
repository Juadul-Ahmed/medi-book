
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireApprovedDoctor } from "@/lib/server-auth";

export default async function DoctorDashboardPage() {
  const doctor = await requireApprovedDoctor();
  const doctorId = doctor.doctorProfile.id;
  const now = new Date();

  const [upcomingCount, completedCount, appointments] = await Promise.all([
    prisma.appointment.count({
      where: {
        doctorId,
        status: "CONFIRMED",
        startAt: { gte: now },
      },
    }),

    prisma.appointment.count({
      where: {
        doctorId,
        status: "COMPLETED",
      },
    }),

    prisma.appointment.findMany({
      where: {
        doctorId,
        status: "CONFIRMED",
        startAt: { gte: now },
      },
      orderBy: { startAt: "asc" },
      take: 5,
      select: {
        id: true,
        startAt: true,
        patient: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    }),
  ]);

  const timeZone = doctor.doctorProfile.timezone || "UTC";

  return (
    <div className="space-y-8">
      <header>
        <p className="text-sm font-semibold text-green-800">
          DOCTOR WORKSPACE
        </p>

        <h1 className="mt-2 text-3xl font-bold text-stone-900">
          Welcome back, Dr. {doctor.name?.split(" ")[0] || "Doctor"}
        </h1>

        <p className="mt-2 text-stone-500">
          Manage your appointments and practice.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2">
        <Stat title="Upcoming appointments" value={upcomingCount} />
        <Stat title="Completed appointments" value={completedCount} />
      </section>

      <section className="rounded-2xl border border-stone-200 bg-white p-6">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold">
            Upcoming appointments
          </h2>

          <Link
            href="/doctor/appointments"
            className="text-sm font-semibold text-green-800 hover:text-green-900"
          >
            View all →
          </Link>
        </div>

        {appointments.length === 0 ? (
          <p className="mt-6 text-sm text-stone-500">
            No upcoming appointments yet.
          </p>
        ) : (
          <div className="mt-4 divide-y divide-stone-100">
            {appointments.map((appointment) => (
              <article key={appointment.id} className="py-4">
                <p className="font-medium text-stone-900">
                  {appointment.patient.name || "Patient"}
                </p>

                <p className="mt-1 text-sm text-stone-500">
                  {appointment.patient.email}
                </p>

                <p className="mt-2 text-sm text-green-800">
                  {new Intl.DateTimeFormat("en", {
                    dateStyle: "medium",
                    timeStyle: "short",
                    timeZone,
                  }).format(appointment.startAt)}
                </p>
              </article>
            ))}
          </div>
        )}
      </section>

      <Link
        href="/doctor/availability"
        className="inline-flex rounded-xl bg-green-800 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-900"
      >
        Manage availability
      </Link>
    </div>
  );
}

function Stat({
  title,
  value,
}: {
  title: string;
  value: number;
}) {
  return (
    <article className="rounded-2xl border border-stone-200 bg-white p-6">
      <p className="text-sm text-stone-500">{title}</p>

      <p className="mt-3 text-3xl font-bold text-stone-900">
        {value}
      </p>
    </article>
  );
}