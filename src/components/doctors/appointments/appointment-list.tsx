
"use client";

import { useState } from "react";

export type DoctorAppointment = {
  id: string;
  startAt: string;
  endAt: string;
  status: string;
  reason: string | null;
  patient: {
    name: string | null;
    email: string;
  };
};

type Props = {
  appointments: DoctorAppointment[];
  timezone: string;
  updatingId: string | null;
  onUpdateStatus: (
    appointmentId: string,
    status: "COMPLETED" | "NO_SHOW",
  ) => void;
};

const statusStyles: Record<string, string> = {
  CONFIRMED: "bg-green-50 text-green-700",
  COMPLETED: "bg-blue-50 text-blue-700",
  CANCELLED: "bg-stone-100 text-stone-600",
  NO_SHOW: "bg-red-50 text-red-700",
};

function formatDate(value: string, timezone: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: timezone,
  }).format(new Date(value));
}

export function AppointmentList({
  appointments,
  timezone,
  updatingId,
  onUpdateStatus,
}: Props) {
  const [now] = useState(() => Date.now());

  if (appointments.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-stone-300 p-10 text-center">
        <h2 className="font-semibold text-stone-800">
          No appointments found
        </h2>

        <p className="mt-2 text-sm text-stone-500">
          Try changing your search or status filter.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {appointments.map((appointment) => {
        const ended =
          new Date(appointment.endAt).getTime() <= now;

        const canUpdate =
          appointment.status === "CONFIRMED" && ended;

        const updating = updatingId === appointment.id;

        return (
          <article
            key={appointment.id}
            className="space-y-4 rounded-2xl border border-stone-200 bg-white p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="truncate font-semibold text-stone-900">
                  {appointment.patient.name || "Patient"}
                </h2>

                <p className="mt-1 break-all text-sm text-stone-500">
                  {appointment.patient.email}
                </p>
              </div>

              <span
                className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                  statusStyles[appointment.status] ??
                  "bg-stone-100 text-stone-600"
                }`}
              >
                {appointment.status.replaceAll("_", " ")}
              </span>
            </div>

            <div className="space-y-2 text-sm">
              <p className="text-stone-700">
                <span className="font-medium">Starts:</span>{" "}
                {formatDate(appointment.startAt, timezone)}
              </p>

              <p className="text-stone-700">
                <span className="font-medium">Ends:</span>{" "}
                {formatDate(appointment.endAt, timezone)}
              </p>

              {appointment.reason && (
                <p className="text-stone-600">
                  <span className="font-medium">Reason:</span>{" "}
                  {appointment.reason}
                </p>
              )}
            </div>

            {canUpdate && (
              <div className="flex flex-wrap gap-2 border-t border-stone-100 pt-4">
                <button
                  type="button"
                  disabled={updating}
                  onClick={() =>
                    onUpdateStatus(appointment.id, "COMPLETED")
                  }
                  className="rounded-lg bg-green-800 px-4 py-2 text-sm font-semibold text-white hover:bg-green-900 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {updating ? "Updating..." : "Complete"}
                </button>

                <button
                  type="button"
                  disabled={updating}
                  onClick={() =>
                    onUpdateStatus(appointment.id, "NO_SHOW")
                  }
                  className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {updating ? "Updating..." : "No-show"}
                </button>
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}
