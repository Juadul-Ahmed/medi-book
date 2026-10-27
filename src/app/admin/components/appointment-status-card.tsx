
import { FiCalendar } from "react-icons/fi";
import type { AppointmentStatus } from "@/generated/prisma/client";

const statuses: {
  status: AppointmentStatus;
  label: string;
}[] = [
  { status: "PENDING", label: "Pending" },
  { status: "CONFIRMED", label: "Confirmed" },
  { status: "REJECTED", label: "Rejected" },
  { status: "CANCELLED", label: "Cancelled" },
  { status: "COMPLETED", label: "Completed" },
  { status: "NO_SHOW", label: "No-show" },
];

type Props = {
  total: number;
  counts: Partial<Record<AppointmentStatus, number>>;
};

export function AppointmentStatusCard({ total, counts }: Props) {
  return (
    <article className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-stone-900">
            Appointment status
          </h2>
          <p className="mt-1 text-sm text-stone-500">
            Breakdown of all bookings
          </p>
        </div>
        <FiCalendar className="h-5 w-5 text-[#166534]" />
      </div>

      <div className="mt-6 space-y-4">
        {statuses.map(({ status, label }) => {
          const count = counts[status] ?? 0;
          const percentage =
            total === 0 ? 0 : Math.round((count / total) * 100);

          return (
            <div key={status}>
              <div className="mb-2 flex justify-between gap-3">
                <span className="text-sm font-medium text-stone-700">
                  {label}
                </span>
                <span className="text-sm font-semibold text-stone-900">
                  {count.toLocaleString()}
                </span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-stone-100">
                <div
                  className="h-full rounded-full bg-[#15803D]"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </article>
  );
}
