"use client";

export type AppointmentStatusFilter =
  | "ALL"
  | "PENDING"
  | "CONFIRMED"
  | "REJECTED"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_SHOW";

type Props = {
  search: string;
  statusFilter: AppointmentStatusFilter;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: AppointmentStatusFilter) => void;
  onRefresh: () => void;
};

export function AppointmentFilter({
  search,
  statusFilter,
  onSearchChange,
  onStatusChange,
  onRefresh,
}: Props) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <div className="flex-1">
        <label htmlFor="appointment-search" className="sr-only">
          Search appointments
        </label>

        <input
          id="appointment-search"
          type="search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search patient, email, or reason..."
          className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-green-800 focus:ring-2 focus:ring-green-800/10"
        />
      </div>

      <div>
        <label htmlFor="appointment-status" className="sr-only">
          Filter by status
        </label>

        <select
          id="appointment-status"
          value={statusFilter}
          onChange={(event) =>
            onStatusChange(event.target.value as AppointmentStatusFilter)
          }
          className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm outline-none focus:border-green-800 sm:w-48"
        >
          <option value="ALL">All statuses</option>
          <option value="PENDING">Pending approval</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="REJECTED">Rejected</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
          <option value="NO_SHOW">No-show</option>
        </select>
      </div>

      <button
        type="button"
        onClick={onRefresh}
        className="rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm font-semibold text-stone-700 transition hover:bg-stone-50"
      >
        Refresh
      </button>
    </div>
  );
}
