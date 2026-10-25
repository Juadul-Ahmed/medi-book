
"use client";

import { useEffect, useState } from "react";
import { AvailabilityDay } from "./availability-day";
import {
  DAYS,
  type AvailabilityRule,
  type AvailabilityResponse,
} from "./types";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";

export function AvailabilityEditor() {
  const [rules, setRules] = useState<AvailabilityRule[]>([]);
  const [timezone, setTimezone] = useState("UTC");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch("/api/doctor/availability");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Could not load availability.");
        }

        const result: AvailabilityResponse = data;
        setRules(result.rules);
        setTimezone(result.timezone || "UTC");
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Could not load availability.",
        );
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, []);

  function addPeriod(dayOfWeek: number) {
    setRules((current) => [
      ...current,
      { dayOfWeek, startTime: "09:00", endTime: "09:30" },
    ]);
    setError("");
    setSuccess("");
  }

  function changePeriod(
    index: number,
    field: "startTime" | "endTime",
    value: string,
  ) {
    setRules((current) =>
      current.map((rule, i) =>
        i === index ? { ...rule, [field]: value } : rule,
      ),
    );
    setError("");
    setSuccess("");
  }

  function removePeriod(index: number) {
    setRules((current) => current.filter((_, i) => i !== index));
    setError("");
    setSuccess("");
  }

  async function save() {
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const response = await fetch("/api/doctor/availability", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rules }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not save availability.");
      }

      setSuccess(data.message || "Availability saved successfully.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not save availability.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {DAYS.map((day) => (
          <div key={day} className="grid grid-cols-3 gap-3 rounded-xl border p-4">
            <LoadingSkeleton className="h-5 w-20" />
            <LoadingSkeleton className="col-span-2 h-10 w-full" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-stone-200 bg-white p-4">
        <div>
          <p className="font-semibold text-stone-900">Weekly schedule</p>
          <p className="mt-1 text-sm text-stone-500">
            Appointment duration: 30 minutes
          </p>
        </div>
        <p className="text-sm text-stone-500">Time zone: {timezone}</p>
      </div>

      <div className="overflow-hidden rounded-xl border border-stone-200 bg-white">
        <div className="hidden grid-cols-[140px_minmax(0,1fr)] gap-4 border-b bg-stone-50 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-stone-500 sm:grid">
          <span>Day</span>
          <span>Working hours</span>
        </div>

        <div className="divide-y divide-stone-200">
          {DAYS.map((day, dayOfWeek) => (
            <div
              key={day}
              className="grid gap-3 p-4 sm:grid-cols-[140px_minmax(0,1fr)] sm:gap-4 sm:px-5"
            >
              <div className="flex items-center">
                <span className="font-semibold text-stone-900">{day}</span>
              </div>

              <div className="min-w-0">
                <AvailabilityDay
                  day={day}
                  dayOfWeek={dayOfWeek}
                  rules={rules}
                  onAdd={() => addPeriod(dayOfWeek)}
                  onChange={changePeriod}
                  onRemove={removePeriod}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {error && (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      )}
      {success && (
        <p role="status" className="text-sm text-green-700">
          {success}
        </p>
      )}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="rounded-xl bg-green-800 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-900 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save availability"}
        </button>
      </div>
    </div>
  );
}
