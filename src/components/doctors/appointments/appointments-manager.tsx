
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AppointmentList,
  type DoctorAppointment,
} from "@/components/doctors/appointments/appointment-list";
import {
  AppointmentFilter,
  type AppointmentStatusFilter,
} from "@/components/doctors/appointments/appointment-filter";

type AppointmentsResponse = {
  appointments: DoctorAppointment[];
  timezone: string;
};

type ApiErrorResponse = {
  error?: string;
  message?: string;
};

function getErrorMessage(
  data: AppointmentsResponse | ApiErrorResponse,
  fallback: string,
) {
  if ("error" in data && data.error) {
    return data.error;
  }

  if ("message" in data && data.message) {
    return data.message;
  }

  return fallback;
}

export function AppointmentsManager() {
  const [appointments, setAppointments] = useState<DoctorAppointment[]>([]);
  const [timezone, setTimezone] = useState("UTC");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<AppointmentStatusFilter>("ALL");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchAppointments = useCallback(async (showLoading = false) => {
    if (showLoading) {
      setRefreshing(true);
    }

    try {
      setError("");

      const response = await fetch("/api/doctor/appointments", {
        method: "GET",
        cache: "no-store",
      });

      const data = (await response.json()) as
        | AppointmentsResponse
        | ApiErrorResponse;

      if (!response.ok) {
        throw new Error(
          getErrorMessage(data, "Failed to load appointments."),
        );
      }

      if (
        !("appointments" in data) ||
        !Array.isArray(data.appointments)
      ) {
        throw new Error("The server returned an invalid appointments response.");
      }

      setAppointments(data.appointments);
      setTimezone(data.timezone || "UTC");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while loading appointments.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchAppointments();
    }, 0);

    return () => clearTimeout(timer);
  }, [fetchAppointments]);

  const filteredAppointments = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return appointments.filter((appointment) => {
      const matchesSearch =
        !normalizedSearch ||
        (appointment.patient.name ?? "")
          .toLowerCase()
          .includes(normalizedSearch) ||
        appointment.patient.email
          .toLowerCase()
          .includes(normalizedSearch) ||
        (appointment.reason ?? "")
          .toLowerCase()
          .includes(normalizedSearch);

      const matchesStatus =
        statusFilter === "ALL" ||
        appointment.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [appointments, search, statusFilter]);

  const handleUpdateStatus = async (
    appointmentId: string,
    status: "COMPLETED" | "NO_SHOW",
  ) => {
    try {
      setUpdatingId(appointmentId);
      setError("");

      const response = await fetch("/api/doctor/appointments", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          appointmentId,
          status,
        }),
      });

      const data = (await response.json()) as ApiErrorResponse;

      if (!response.ok) {
        throw new Error(
          getErrorMessage(data, "Failed to update appointment status."),
        );
      }

      await fetchAppointments();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while updating the appointment.",
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const confirmedCount = appointments.filter(
    (appointment) => appointment.status === "CONFIRMED",
  ).length;

  const completedCount = appointments.filter(
    (appointment) => appointment.status === "COMPLETED",
  ).length;

  const noShowCount = appointments.filter(
    (appointment) => appointment.status === "NO_SHOW",
  ).length;

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="h-8 w-64 animate-pulse rounded-lg bg-stone-200" />

        <div className="grid gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-24 animate-pulse rounded-2xl bg-stone-100"
            />
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-52 animate-pulse rounded-2xl border border-stone-200 bg-stone-50"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-stone-900">
          Appointments
        </h1>

        <p className="mt-1 text-sm text-stone-500">
          Review your patients and manage completed appointments.
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          <p>{error}</p>

          <button
            type="button"
            onClick={() => void fetchAppointments(true)}
            disabled={refreshing}
            className="font-semibold underline underline-offset-2 disabled:opacity-50"
          >
            Retry
          </button>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-stone-200 bg-white p-5">
          <p className="text-sm text-stone-500">Confirmed</p>
          <p className="mt-2 text-3xl font-bold text-green-800">
            {confirmedCount}
          </p>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-5">
          <p className="text-sm text-stone-500">Completed</p>
          <p className="mt-2 text-3xl font-bold text-blue-700">
            {completedCount}
          </p>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-5">
          <p className="text-sm text-stone-500">No-show</p>
          <p className="mt-2 text-3xl font-bold text-red-700">
            {noShowCount}
          </p>
        </div>
      </div>

      <AppointmentFilter
        search={search}
        statusFilter={statusFilter}
        onSearchChange={setSearch}
        onStatusChange={setStatusFilter}
        onRefresh={() => void fetchAppointments(true)}
      />

      <p className="text-sm text-stone-500">
        Showing {filteredAppointments.length} of {appointments.length}{" "}
        appointments · Times shown in {timezone}
      </p>

      <AppointmentList
        appointments={filteredAppointments}
        timezone={timezone}
        updatingId={updatingId}
        onUpdateStatus={handleUpdateStatus}
      />
    </div>
  );
}
