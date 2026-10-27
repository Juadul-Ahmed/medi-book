
"use client";

import { useCallback, useEffect, useState } from "react";
import { Button, Input } from "@heroui/react";
import {
  FiCalendar,
  FiClock,
  FiCheckCircle,
  FiClipboard,
} from "react-icons/fi";

import { StatCard } from "../components/stat-card";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";

type AppointmentStatus =
  | "PENDING"
  | "CONFIRMED"
  | "REJECTED"
  | "CANCELLED"
  | "COMPLETED"
  | "NO_SHOW";

type StatusFilter = AppointmentStatus | "ALL";

type Appointment = {
  id: string;
  patient: {
    id: string;
    name: string;
    email: string;
  };
  doctor: {
    id: string;
    timezone: string;
    user: {
      id: string;
      name: string;
      email: string;
    };
    specialty: {
      name: string;
    };
  };
  startAt: string;
  endAt: string;
  status: AppointmentStatus;
  reason: string | null;
  cancelledAt: string | null;
  createdAt: string;
};

type AppointmentCounts = {
  total: number;
} & Record<AppointmentStatus, number>;

type ApiResponse = {
  appointments: Appointment[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  counts: AppointmentCounts;
};

type ApiError = {
  error?: string;
};

const statusOptions: { label: string; value: StatusFilter }[] = [
  { label: "All statuses", value: "ALL" },
  { label: "Pending", value: "PENDING" },
  { label: "Confirmed", value: "CONFIRMED" },
  { label: "Rejected", value: "REJECTED" },
  { label: "Cancelled", value: "CANCELLED" },
  { label: "Completed", value: "COMPLETED" },
  { label: "No-show", value: "NO_SHOW" },
];

const statusStyles: Record<AppointmentStatus, string> = {
  PENDING: "bg-amber-50 text-amber-700 ring-amber-200",
  CONFIRMED: "bg-green-50 text-green-700 ring-green-200",
  REJECTED: "bg-red-50 text-red-700 ring-red-200",
  CANCELLED: "bg-gray-100 text-gray-700 ring-gray-200",
  COMPLETED: "bg-blue-50 text-blue-700 ring-blue-200",
  NO_SHOW: "bg-orange-50 text-orange-700 ring-orange-200",
};

function formatDate(value: string, timezone: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Invalid date";
  }

  try {
    return new Intl.DateTimeFormat("en", {
      year: "numeric",
      month: "short",
      day: "numeric",
      timeZone: timezone,
    }).format(date);
  } catch {
    return new Intl.DateTimeFormat("en", {
      year: "numeric",
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    }).format(date);
  }
}

function formatTime(value: string, timezone: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "--:--";
  }

  try {
    return new Intl.DateTimeFormat("en", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: timezone,
    }).format(date);
  } catch {
    return new Intl.DateTimeFormat("en", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "UTC",
    }).format(date);
  }
}

function StatusBadge({ status }: { status: AppointmentStatus }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${statusStyles[status]}`}
    >
      {status.replaceAll("_", " ")}
    </span>
  );
}

function AppointmentsSkeleton() {
  return (
    <div className="space-y-3 p-5">
      {Array.from({ length: 6 }).map((_, index) => (
        <LoadingSkeleton key={index} className="h-14 w-full" />
      ))}
    </div>
  );
}

export function AdminAppointments() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("ALL");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAppointments = useCallback(async (signal?: AbortSignal) => {
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: "20",
      });

      if (search) params.set("search", search);
      if (status !== "ALL") params.set("status", status);

      const response = await fetch(
        `/api/admin/appointments?${params.toString()}`,
        {
          cache: "no-store",
          signal,
        },
      );

      const result = (await response.json()) as ApiResponse | ApiError;

      if (!response.ok) {
        throw new Error(
          "error" in result
            ? result.error || "Unable to load appointments."
            : "Unable to load appointments.",
        );
      }

      if (!signal?.aborted) {
        setData(result as ApiResponse);
        setError("");
      }
    } catch (err) {
      if (signal?.aborted) return;

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while loading appointments.",
      );
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, [page, search, status]);

useEffect(() => {
  const controller = new AbortController();

  async function fetchAppointments() {
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: "20",
      });

      if (search) params.set("search", search);
      if (status !== "ALL") params.set("status", status);

      const response = await fetch(
        `/api/admin/appointments?${params.toString()}`,
        {
          cache: "no-store",
          signal: controller.signal,
        },
      );

      const result = (await response.json()) as ApiResponse | ApiError;

      if (!response.ok) {
        throw new Error(
          ("error" in result && result.error) ||
            "Unable to load appointments.",
        );
      }

      if (!controller.signal.aborted) {
        setData(result as ApiResponse);
        setError("");
      }
    } catch (err) {
      if (controller.signal.aborted) return;

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load appointments.",
      );
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  }

  const timeoutId = setTimeout(() => {
    void fetchAppointments();
  }, 0);

  return () => {
    clearTimeout(timeoutId);
    controller.abort();
  };
}, [page, search, status]);

  function refreshAppointments() {
    setLoading(true);
    void loadAppointments();
  }

  function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextSearch = searchInput.trim();

    if (page !== 1) {
      setPage(1);
    }

    if (search !== nextSearch) {
      setSearch(nextSearch);
    } else if (page === 1) {
      refreshAppointments();
    }
  }

  function handleStatusChange(value: StatusFilter) {
    if (value === status && page === 1) return;

    setPage(1);
    setStatus(value);
  }

  function handlePageChange(nextPage: number) {
    if (
      nextPage < 1 ||
      (data && nextPage > data.pagination.totalPages)
    ) {
      return;
    }

    setPage(nextPage);
    setLoading(true);
  }

  const counts = data?.counts;

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.15em] text-green-700">
            Administration
          </p>

          <h1 className="mt-2 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            Appointments
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Review and monitor appointments across MediBook.
          </p>
        </div>

        <Button
          variant="outline"
          onPress={refreshAppointments}
          isDisabled={loading}
        >
          Refresh
        </Button>
      </header>

      {loading && !data ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <LoadingSkeleton key={index} className="h-28 w-full" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total appointments"
            value={counts?.total ?? 0}
            description="Across all statuses"
            icon={FiCalendar}
          />

          <StatCard
            title="Pending"
            value={counts?.PENDING ?? 0}
            description="Awaiting doctor review"
            icon={FiClock}
          />

          <StatCard
            title="Confirmed"
            value={counts?.CONFIRMED ?? 0}
            description="Scheduled appointments"
            icon={FiCheckCircle}
          />

          <StatCard
            title="Completed"
            value={counts?.COMPLETED ?? 0}
            description="Finished appointments"
            icon={FiClipboard}
          />
        </div>
      )}

      <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
        <form
          onSubmit={handleSearch}
          className="flex flex-col gap-3 md:flex-row md:items-end"
        >
          <div className="flex-1">
            <label
              htmlFor="appointment-search"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Search appointments
            </label>

            <Input
              id="appointment-search"
              aria-label="Search appointments"
              placeholder="Patient or doctor name/email..."
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
            />
          </div>

          <div className="w-full md:w-56">
            <label
              htmlFor="appointment-status"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Filter by status
            </label>

            <select
              id="appointment-status"
              value={status}
              onChange={(event) =>
                handleStatusChange(event.target.value as StatusFilter)
              }
              className="h-10 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none transition focus:border-green-700 focus:ring-2 focus:ring-green-100"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <Button
            type="submit"
            className="bg-green-700 text-white"
            isDisabled={loading}
          >
            Search
          </Button>
        </form>
      </section>

      {error && (
        <div
          role="alert"
          className="flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 sm:flex-row sm:items-center sm:justify-between"
        >
          <p>{error}</p>

          <Button
            variant="outline"
            onPress={refreshAppointments}
            isDisabled={loading}
          >
            Try again
          </Button>
        </div>
      )}

      <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col gap-1 border-b border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-semibold text-gray-900">
            All appointments
          </h2>

          <p className="text-sm text-gray-500">
            {data
              ? `${data.pagination.total} result${data.pagination.total === 1 ? "" : "s"}`
              : "Loading appointments..."}
          </p>
        </div>

        {loading && !data ? (
          <AppointmentsSkeleton />
        ) : error && !data ? (
          <div className="px-5 py-12 text-center">
            <p className="font-medium text-gray-900">
              Appointments could not be loaded.
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Check your connection or try again.
            </p>
          </div>
        ) : !data || data.appointments.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-50 text-xl text-green-700">
              <FiCalendar aria-hidden="true" />
            </div>

            <h3 className="mt-4 font-semibold text-gray-900">
              No appointments found
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Try another search or status filter.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-5 py-3 font-semibold">Patient</th>
                  <th className="px-5 py-3 font-semibold">Doctor</th>
                  <th className="px-5 py-3 font-semibold">Date &amp; time</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold">Booked on</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {data.appointments.map((appointment) => (
                  <tr
                    key={appointment.id}
                    className="hover:bg-gray-50/70"
                  >
                    <td className="px-5 py-4">
                      <p className="font-medium text-gray-900">
                        {appointment.patient.name}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        {appointment.patient.email}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <p className="font-medium text-gray-900">
                        Dr. {appointment.doctor.user.name}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        {appointment.doctor.specialty.name}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <p className="font-medium text-gray-900">
                        {formatDate(
                          appointment.startAt,
                          appointment.doctor.timezone,
                        )}
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        {formatTime(
                          appointment.startAt,
                          appointment.doctor.timezone,
                        )}{" "}
                        –{" "}
                        {formatTime(
                          appointment.endAt,
                          appointment.doctor.timezone,
                        )}
                      </p>

                      <p className="mt-1 text-xs text-gray-400">
                        Doctor&apos;s local time
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <StatusBadge status={appointment.status} />
                    </td>

                    <td className="px-5 py-4 text-gray-500">
                      {formatDate(
                        appointment.createdAt,
                        appointment.doctor.timezone,
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {data && data.pagination.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-100 px-5 py-4">
            <p className="text-sm text-gray-500">
              Page {data.pagination.page} of {data.pagination.totalPages}
            </p>

            <div className="flex gap-2">
              <Button
                variant="outline"
                isDisabled={page <= 1 || loading}
                onPress={() => handlePageChange(page - 1)}
              >
                Previous
              </Button>

              <Button
                variant="outline"
                isDisabled={
                  page >= data.pagination.totalPages || loading
                }
                onPress={() => handlePageChange(page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
