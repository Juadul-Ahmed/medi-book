
"use client";

import { useCallback, useEffect, useState } from "react";

type AvailableSlot = {
  startAt: string;
  endAt: string;
  localTime: string;
};

type SlotsResponse =
  | {
      date: string;
      timezone: string;
      slots: AvailableSlot[];
    }
  | {
      error?: string;
    };

type BookingResponse =
  | {
      message?: string;
      appointment: {
        id: string;
        startAt: string;
        endAt: string;
        status: string;
      };
    }
  | {
      error?: string;
    };

type Confirmation = {
  id: string;
  date: string;
  time: string;
};

type AppointmentBookingProps = {
  doctorId: string;
  timezone: string;
  initialDate: string;
};

export function AppointmentBooking({
  doctorId,
  timezone,
  initialDate,
}: AppointmentBookingProps) {
  const [date, setDate] = useState(initialDate);
  const [slots, setSlots] = useState<AvailableSlot[]>([]);
  const [selectedStartAt, setSelectedStartAt] = useState("");
  const [reason, setReason] = useState("");

  const [loadingSlots, setLoadingSlots] = useState(true);
  const [booking, setBooking] = useState(false);
  const [slotsError, setSlotsError] = useState("");
  const [bookingError, setBookingError] = useState("");
  const [confirmation, setConfirmation] =
    useState<Confirmation | null>(null);

  const loadSlots = useCallback(
    async (signal?: AbortSignal) => {
      try {
        const response = await fetch(
          `/api/doctors/${encodeURIComponent(doctorId)}/slots?date=${encodeURIComponent(date)}`,
          {
            method: "GET",
            cache: "no-store",
            signal,
          },
        );

        const data = (await response.json()) as SlotsResponse;

        if (
          !response.ok ||
          !("slots" in data) ||
          !Array.isArray(data.slots)
        ) {
          throw new Error(
            "error" in data && data.error
              ? data.error
              : "Could not load available appointment times.",
          );
        }

        setSlots(data.slots);
        setSlotsError("");
        setSelectedStartAt((current) =>
          data.slots.some((slot) => slot.startAt === current)
            ? current
            : "",
        );
      } catch (error) {
        if (signal?.aborted) {
          return;
        }

        setSlots([]);
        setSelectedStartAt("");
        setSlotsError(
          error instanceof Error
            ? error.message
            : "Could not load appointment times.",
        );
      } finally {
        if (!signal?.aborted) {
          setLoadingSlots(false);
        }
      }
    },
    [doctorId, date],
  );

  useEffect(() => {
    const controller = new AbortController();

    // Defer loading until after the effect finishes.
    const timer = setTimeout(() => {
      void loadSlots(controller.signal);
    }, 0);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [loadSlots]);

  const handleDateChange = (value: string) => {
    setDate(value);
    setSelectedStartAt("");
    setConfirmation(null);
    setBookingError("");
    setSlotsError("");
    setLoadingSlots(true);
  };

  const handleBooking = async () => {
    const selectedSlot = slots.find(
      (slot) => slot.startAt === selectedStartAt,
    );

    if (!selectedSlot || booking || loadingSlots) {
      return;
    }

    try {
      setBooking(true);
      setBookingError("");
      setConfirmation(null);

      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          doctorId,
          startAt: selectedSlot.startAt,
          reason: reason.trim(),
        }),
      });

      const data = (await response.json()) as BookingResponse;

      if (!response.ok || !("appointment" in data)) {
        throw new Error(
          "error" in data && data.error
            ? data.error
            : "Booking failed. Please try again.",
        );
      }

      setConfirmation({
        id: data.appointment.id,
        date,
        time: selectedSlot.localTime,
      });

      setSelectedStartAt("");
      setReason("");

      // Refresh availability after the successful booking.
      setLoadingSlots(true);
      await loadSlots();
    } catch (error) {
      setBookingError(
        error instanceof Error
          ? error.message
          : "Could not complete your booking.",
      );
    } finally {
      setBooking(false);
    }
  };

  return (
    <section className="rounded-xl border border-stone-200 bg-white p-5">
      <h2 className="font-semibold text-stone-900">
        Book an appointment
      </h2>

      <p className="mt-2 text-sm leading-6 text-stone-500">
        Choose an available date and a 30-minute time slot.
        Times are shown in the doctor&apos;s time zone ({timezone}).
      </p>

      {confirmation && (
        <div
          role="status"
          className="mt-4 rounded-xl border border-green-200 bg-green-50 p-4"
        >
          <p className="font-semibold text-green-900">
            Appointment request submitted!
          </p>

          <p className="mt-1 text-sm text-green-800">
            {confirmation.date} at {confirmation.time} ({timezone})
          </p>

          <p className="mt-1 text-xs text-green-800">
            Confirmation ID: {confirmation.id}
          </p>
        </div>
      )}

      <div className="mt-5 space-y-4">
        <div>
          <label
            htmlFor="appointment-date"
            className="mb-2 block text-sm font-medium text-stone-700"
          >
            Appointment date
          </label>

          <input
            id="appointment-date"
            type="date"
            value={date}
            min={initialDate}
            disabled={booking}
            onChange={(event) => handleDateChange(event.target.value)}
            className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-sm text-stone-900 outline-none focus:border-green-800 focus:ring-2 focus:ring-green-800/10 disabled:opacity-60"
          />
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-stone-700">
            Available times
          </p>

          {loadingSlots ? (
            <p className="text-sm text-stone-500">
              Loading available times...
            </p>
          ) : slotsError ? (
            <div className="space-y-2">
              <p role="alert" className="text-sm text-red-700">
                {slotsError}
              </p>

              <button
                type="button"
                className="text-sm font-semibold text-green-800 underline"
                onClick={() => {
                  setSlotsError("");
                  setLoadingSlots(true);
                  void loadSlots();
                }}
              >
                Try again
              </button>
            </div>
          ) : slots.length === 0 ? (
            <p className="rounded-xl bg-stone-50 p-4 text-sm text-stone-500">
              No available appointments for this date. Please choose
              another date.
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {slots.map((slot) => {
                const selected = selectedStartAt === slot.startAt;

                return (
                  <button
                    key={slot.startAt}
                    type="button"
                    aria-pressed={selected}
                    disabled={booking}
                    onClick={() => {
                      setSelectedStartAt(slot.startAt);
                      setBookingError("");
                    }}
                    className={`rounded-lg border px-2 py-2.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${
                      selected
                        ? "border-green-800 bg-green-800 text-white"
                        : "border-stone-300 bg-white text-stone-700 hover:border-green-800 hover:bg-green-50"
                    }`}
                  >
                    {slot.localTime}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div>
          <label
            htmlFor="appointment-reason"
            className="mb-2 block text-sm font-medium text-stone-700"
          >
            Reason for visit (optional)
          </label>

          <textarea
            id="appointment-reason"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            maxLength={1000}
            rows={3}
            disabled={booking}
            placeholder="Briefly describe your reason for visiting..."
            className="w-full resize-y rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-sm text-stone-900 outline-none placeholder:text-stone-400 focus:border-green-800 focus:ring-2 focus:ring-green-800/10 disabled:opacity-60"
          />

          <p className="mt-1 text-right text-xs text-stone-400">
            {reason.length}/1000
          </p>
        </div>

        {bookingError && (
          <p role="alert" className="text-sm text-red-700">
            {bookingError}
          </p>
        )}

        <button
          type="button"
          onClick={() => void handleBooking()}
          disabled={
            booking ||
            loadingSlots ||
            !selectedStartAt ||
            !!slotsError
          }
          className="w-full rounded-xl bg-green-800 px-4 py-3 text-sm font-semibold text-white transition hover:bg-green-900 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {booking ? "Booking appointment..." : "Confirm appointment"}
        </button>

        <p className="text-xs leading-5 text-stone-500">
          Your booking will be confirmed automatically once the server
          successfully creates the appointment.
        </p>
      </div>
    </section>
  );
}
