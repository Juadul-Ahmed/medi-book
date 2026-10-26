
"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Button, Card, Chip } from "@heroui/react";

type PatientAppointment = {
  id: string;
  doctorId: string;
  startAt: string;
  endAt: string;
  status: string;
  reason: string | null;
  cancelledAt: string | null;
  doctor: {
    timezone: string;
    user: {
      name: string;
    };
    specialty: {
      name: string;
    };
  };
};

type AppointmentsResponse = {
  appointments: PatientAppointment[];
  error?: string;
};

type ActionResponse = {
  message?: string;
  error?: string;
};

type ChipColor = "default" | "accent" | "success" | "warning" | "danger";

const CANCELLATION_WINDOW_MS = 24 * 60 * 60 * 1000;

function getStatusColor(status: string): ChipColor {
  switch (status) {
    case "PENDING":
      return "warning";
    case "CONFIRMED":
      return "success";
    case "REJECTED":
    case "NO_SHOW":
      return "danger";
    case "COMPLETED":
      return "accent";
    default:
      return "default";
  }
}

function formatDate(value: string, timezone: string) {
  try {
    return new Intl.DateTimeFormat("en", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: timezone || "UTC",
    }).format(new Date(value));
  } catch {
    return new Intl.DateTimeFormat("en", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "UTC",
    }).format(new Date(value));
  }
}

export function MyAppointments() {
  const [appointments, setAppointments] = useState<
    PatientAppointment[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  // Keep the current time in state so render calculations remain pure.
  const [now, setNow] = useState(() => Date.now());

  const fetchAppointments = useCallback(
    async (showLoading = false) => {
      if (showLoading) {
        setRefreshing(true);
      }

      try {
        setError("");

        const response = await fetch("/api/appointments", {
          method: "GET",
          cache: "no-store",
        });

        const data = (await response.json()) as AppointmentsResponse;

        if (
          !response.ok ||
          !("appointments" in data) ||
          !Array.isArray(data.appointments)
        ) {
          throw new Error(
            data.error ?? "Could not load your appointments.",
          );
        }

        setAppointments(data.appointments);
        setNow(Date.now());
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
    },
    [],
  );

  // Defer the initial request until after the effect finishes.
  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchAppointments();
    }, 0);

    return () => clearTimeout(timer);
  }, [fetchAppointments]);

  // Refresh the time periodically so cancellation eligibility stays current.
  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(Date.now());
    }, 30_000);

    return () => window.clearInterval(timer);
  }, []);

  const handleCancel = async (appointmentId: string) => {
    if (cancellingId) {
      return;
    }

    const appointment = appointments.find(
      (item) => item.id === appointmentId,
    );

    if (!appointment) {
      return;
    }

    // Use the state value instead of calling Date.now() here.
    // The server still performs the authoritative time check.
    const timeRemaining =
      new Date(appointment.startAt).getTime() - now;

    if (
      !["PENDING", "CONFIRMED"].includes(appointment.status) ||
      timeRemaining < CANCELLATION_WINDOW_MS
    ) {
      setError(
        "This appointment is no longer eligible for cancellation.",
      );
      return;
    }

    const accepted = window.confirm(
      `Cancel your appointment with Dr. ${appointment.doctor.user.name}?`,
    );

    if (!accepted) {
      return;
    }

    try {
      setCancellingId(appointmentId);
      setError("");
      setSuccess("");

      const response = await fetch(
        `/api/appointments/${encodeURIComponent(appointmentId)}/cancel`,
        {
          method: "POST",
        },
      );

      const data = (await response.json()) as ActionResponse;

      if (!response.ok) {
        throw new Error(
          data.error ?? "Could not cancel this appointment.",
        );
      }

      setSuccess("Your appointment was cancelled successfully.");

      await fetchAppointments();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while cancelling the appointment.",
      );
    } finally {
      setCancellingId(null);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F8FAF8] px-4 py-8 sm:px-6 sm:py-12">
        <div className="mx-auto max-w-4xl space-y-4">
          <div className="h-8 w-60 animate-pulse rounded-lg bg-stone-200" />

          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-48 animate-pulse rounded-2xl border border-stone-200 bg-stone-100"
            />
          ))}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F8FAF8] px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-4xl space-y-6">
        <Link
          href="/doctors"
          className="inline-flex min-h-10 items-center rounded-xl px-3 text-sm font-medium text-green-800 transition hover:bg-green-50"
        >
          ← Find a doctor
        </Link>

        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-green-800">
              YOUR BOOKINGS
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-stone-900">
              My Appointments
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-stone-500">
              View your appointment requests and manage eligible cancellations.
            </p>
          </div>

          <Button
            variant="outline"
            onPress={() => void fetchAppointments(true)}
            isDisabled={refreshing}
          >
            {refreshing ? "Refreshing..." : "Refresh"}
          </Button>
        </div>

        {error && (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
          >
            {error}
          </div>
        )}

        {success && (
          <div
            role="status"
            className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800"
          >
            {success}
          </div>
        )}

        {appointments.length === 0 ? (
          <Card className="border border-dashed border-stone-300 bg-white shadow-sm">
            <Card.Content className="items-center gap-3 px-5 py-14 text-center">
              <h2 className="text-lg font-semibold text-stone-900">
                No appointments yet
              </h2>

              <p className="max-w-md text-sm text-stone-500">
                Browse approved doctors to find a suitable appointment.
              </p>

              <Button
                className="mt-2 bg-green-800 text-white"
                onPress={() => {
                  window.location.href = "/doctors";
                }}
              >
                Find a doctor
              </Button>
            </Card.Content>
          </Card>
        ) : (
          <div className="space-y-4">
            {appointments.map((appointment) => {
              const timezone = appointment.doctor.timezone || "UTC";
              const remaining =
                new Date(appointment.startAt).getTime() - now;

              const cancelEligible =
                ["PENDING", "CONFIRMED"].includes(appointment.status) &&
                remaining >= CANCELLATION_WINDOW_MS;

              const updating = cancellingId === appointment.id;

              return (
                <Card
                  key={appointment.id}
                  className="border border-stone-200 bg-white shadow-sm"
                >
                  <Card.Content className="gap-5 p-5 sm:p-6">
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="break-words text-lg font-semibold text-stone-900">
                            Dr. {appointment.doctor.user.name}
                          </h2>

                          <Chip
                            color={getStatusColor(appointment.status)}
                            variant="soft"
                            size="sm"
                          >
                            {appointment.status.replaceAll("_", " ")}
                          </Chip>
                        </div>

                        <p className="mt-1 text-sm text-stone-500">
                          {appointment.doctor.specialty.name}
                        </p>

                        <div className="mt-4 space-y-2 text-sm text-stone-700">
                          <p>
                            <span className="font-medium">Starts:</span>{" "}
                            {formatDate(appointment.startAt, timezone)}
                          </p>

                          <p>
                            <span className="font-medium">Ends:</span>{" "}
                            {formatDate(appointment.endAt, timezone)}
                          </p>

                          <p className="text-xs text-stone-500">
                            Times shown in {timezone}
                          </p>

                          {appointment.reason && (
                            <p className="break-words">
                              <span className="font-medium">Reason:</span>{" "}
                              {appointment.reason}
                            </p>
                          )}
                        </div>

                        {appointment.status === "PENDING" && (
                          <p className="mt-3 text-sm text-amber-800">
                            Waiting for the doctor to confirm or reject your request.
                          </p>
                        )}

                        {appointment.status === "REJECTED" && (
                          <p className="mt-3 text-sm text-red-700">
                            The doctor rejected this request. You may choose another available appointment.
                          </p>
                        )}

                        {["PENDING", "CONFIRMED"].includes(
                          appointment.status,
                        ) && !cancelEligible && (
                          <p className="mt-3 text-xs text-stone-500">
                            The 24-hour cancellation window has closed.
                          </p>
                        )}
                      </div>

                      <div className="flex shrink-0 flex-col gap-2 sm:items-end">
                        <Button
                          variant="outline"
                          onPress={() => {
                            window.location.href = `/doctors/${appointment.doctorId}`;
                          }}
                          className="w-full sm:w-auto"
                        >
                          View doctor
                        </Button>

                        {cancelEligible && (
                          <Button
                            variant="danger"
                            isDisabled={Boolean(cancellingId)}
                            onPress={() => void handleCancel(appointment.id)}
                            className="w-full sm:w-auto"
                          >
                            {updating
                              ? "Cancelling..."
                              : "Cancel appointment"}
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card.Content>
                </Card>
              );
            })}
          </div>
        )}
      </div> 
    </main>
  );
}
