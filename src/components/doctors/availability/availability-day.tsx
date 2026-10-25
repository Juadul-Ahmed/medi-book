"use client";

import type { AvailabilityRule } from "./types";

type Props = {
  day: string;
  dayOfWeek: number;
  rules: AvailabilityRule[];
  onAdd: () => void;
  onChange: (index: number, field: "startTime" | "endTime", value: string) => void;
  onRemove: (index: number) => void;
};

export function AvailabilityDay({
  day,
  dayOfWeek,
  rules,
  onAdd,
  onChange,
  onRemove,
}: Props) {
  const periods = rules
    .map((rule, index) => ({ rule, index }))
    .filter(({ rule }) => rule.dayOfWeek === dayOfWeek);

  return (
    <section className="space-y-4 rounded-xl border border-stone-200 bg-white p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-semibold text-stone-900">{day}</h2>

        <button
          type="button"
          onClick={onAdd}
          className="rounded-lg border border-stone-300 px-3 py-2 text-sm font-medium hover:bg-stone-50"
        >
          + Add period
        </button>
      </div>

      {periods.length === 0 ? (
        <p className="text-sm text-stone-500">No working hours set.</p>
      ) : (
        <div className="space-y-3">
          {periods.map(({ rule, index }) => (
            <div
              key={`${dayOfWeek}-${index}`}
              className="grid grid-cols-1 items-end gap-3 sm:grid-cols-[1fr_1fr_auto]"
            >
              <label className="space-y-1">
                <span className="text-xs text-stone-500">Start time</span>
                <input
                  type="time"
                  step={1800}
                  value={rule.startTime}
                  onChange={(event) =>
                    onChange(index, "startTime", event.target.value)
                  }
                  required
                  className="w-full rounded-lg border border-stone-300 px-3 py-2.5"
                />
              </label>

              <label className="space-y-1">
                <span className="text-xs text-stone-500">End time</span>
                <input
                  type="time"
                  step={1800}
                  value={rule.endTime}
                  onChange={(event) =>
                    onChange(index, "endTime", event.target.value)
                  }
                  required
                  className="w-full rounded-lg border border-stone-300 px-3 py-2.5"
                />
              </label>

              <button
                type="button"
                onClick={() => onRemove(index)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-red-700 hover:bg-red-50"
                aria-label={`Remove ${day} period`}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
