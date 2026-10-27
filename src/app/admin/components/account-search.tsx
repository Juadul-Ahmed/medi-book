
"use client";

type AccountSearchProps = {
  search: string;
  role: string;
  onSearchChange: (value: string) => void;
  onRoleChange: (value: string) => void;
};

export function AccountSearch({
  search,
  role,
  onSearchChange,
  onRoleChange,
}: AccountSearchProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <input
        type="search"
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="Search by name or email..."
        aria-label="Search accounts"
        className="min-w-0 flex-1 rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#15803D] focus:ring-2 focus:ring-green-100"
      />

      <select
        value={role}
        onChange={(event) => onRoleChange(event.target.value)}
        aria-label="Filter accounts by role"
        className="rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#15803D] focus:ring-2 focus:ring-green-100"
      >
        <option value="ALL">All accounts</option>
        <option value="PATIENT">Patients</option>
        <option value="DOCTOR">Doctors</option>
      </select>
    </div>
  );
}
