
import {
  FiActivity,
  FiCalendar,
  FiClock,
  FiUserCheck,
  FiUsers,
} from "react-icons/fi";
import { prisma } from "@/lib/prisma";
import type { AppointmentStatus } from "@/generated/prisma/client";
import { StatCard } from "./components/stat-card";
import { AppointmentStatusCard } from "./components/appointment-status-card";
import { RecentAppointments } from "./components/recent-appointments";
import { AdminManagement } from "./components/admin-management";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [
    patientCount,
    doctorCount,
    approvedDoctorCount,
    pendingDoctorCount,
    specialtyCount,
    appointmentCount,
    appointmentGroups,
    recentAppointments,
  ] = await Promise.all([
    prisma.user.count({ where: { role: "PATIENT" } }),
    prisma.user.count({ where: { role: "DOCTOR" } }),
    prisma.doctorProfile.count({
      where: { reviewStatus: "APPROVED", approved: true },
    }),
    prisma.doctorProfile.count({ where: { reviewStatus: "PENDING" } }),
    prisma.specialty.count(),
    prisma.appointment.count(),
    prisma.appointment.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
    prisma.appointment.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        startAt: true,
        status: true,
        patient: { select: { name: true, email: true } },
        doctor: {
          select: {
            user: { select: { name: true } },
            specialty: { select: { name: true } },
          },
        },
      },
    }),
  ]);

  const statusCounts: Partial<Record<AppointmentStatus, number>> = {};

  for (const item of appointmentGroups) {
    statusCounts[item.status] = item._count._all;
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold tracking-wider text-[#166534]">
            ADMINISTRATION
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-stone-900">
            Dashboard overview
          </h1>
          <p className="mt-2 text-stone-500">
            Monitor MediBook accounts, doctor approvals, and appointments.
          </p>
        </div>

        <div className="inline-flex w-fit items-center gap-2 rounded-full bg-green-50 px-3 py-2 text-sm font-medium text-[#166534]">
          <FiActivity />
          Live database statistics
        </div>
      </header>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-stone-900">
          Platform overview
        </h2>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Patients"
            value={patientCount}
            description="Registered patient accounts"
            icon={FiUsers}
          />
          <StatCard
            title="Doctors"
            value={doctorCount}
            description={`${approvedDoctorCount} approved`}
            icon={FiUserCheck}
          />
          <StatCard
            title="Pending applications"
            value={pendingDoctorCount}
            description="Doctor profiles awaiting review"
            icon={FiClock}
          />
          <StatCard
            title="Appointments"
            value={appointmentCount}
            description="Across all statuses"
            icon={FiCalendar}
          />
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <AppointmentStatusCard
          total={appointmentCount}
          counts={statusCounts}
        />
        <RecentAppointments appointments={recentAppointments} />
      </section>

      <AdminManagement specialtyCount={specialtyCount} />
    </div>
  );
}
