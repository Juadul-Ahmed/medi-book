import Link from "next/link";

type SpecialtyOption = {
  id: string;
  name: string;
};

type DoctorFiltersProps = {
  specialties: SpecialtyOption[];
  query: string;
  specialtyId: string;
  minFee: string;
  maxFee: string;
  validFeeRange: boolean;
};

export function DoctorFilters({
  specialties,
  query,
  specialtyId,
  minFee,
  maxFee,
  validFeeRange,
}: DoctorFiltersProps) {
  return (
    <section
      aria-labelledby="doctor-filters-title"
      className="rounded-xl border border-[#E2E9E1] bg-white p-4 sm:p-6"
    >
      <div className="mb-5">
        <h2
          id="doctor-filters-title"
          className="text-lg font-semibold text-[#193B29]"
        >
          Find your specialist
        </h2>
        <p className="mt-1 text-sm text-[#657167]">
          Refine your search by doctor name, specialty, or consultation fee.
        </p>
      </div>

      <form action="/doctors" method="GET">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <label
              htmlFor="doctor-search"
              className="mb-2 block text-sm font-medium text-[#315A3C]"
            >
              Doctor name
            </label>
            <input
              id="doctor-search"
              name="q"
              type="search"
              defaultValue={query}
              maxLength={100}
              placeholder="Search by doctor's name"
              className="min-h-12 w-full rounded-lg border border-[#DCE5DB] bg-[#FBFCFA] px-4 text-sm text-[#193B29] outline-none transition focus:border-[#166534] focus:ring-2 focus:ring-[#166534]/10"
            />
          </div>

          <div>
            <label
              htmlFor="doctor-specialty"
              className="mb-2 block text-sm font-medium text-[#315A3C]"
            >
              Specialty
            </label>
            <select
              id="doctor-specialty"
              name="specialty"
              defaultValue={specialtyId}
              className="min-h-12 w-full rounded-lg border border-[#DCE5DB] bg-[#FBFCFA] px-3 text-sm text-[#193B29] outline-none focus:border-[#166534] focus:ring-2 focus:ring-[#166534]/10"
            >
              <option value="">All specialties</option>
              {specialties.map((specialty) => (
                <option key={specialty.id} value={specialty.id}>
                  {specialty.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="minimum-fee"
                className="mb-2 block text-sm font-medium text-[#315A3C]"
              >
                Min. fee
              </label>
              <input
                id="minimum-fee"
                name="minFee"
                type="number"
                min="0"
                max="99999999"
                step="0.01"
                defaultValue={minFee}
                placeholder="0"
                className="min-h-12 w-full rounded-lg border border-[#DCE5DB] bg-[#FBFCFA] px-3 text-sm text-[#193B29] outline-none focus:border-[#166534] focus:ring-2 focus:ring-[#166534]/10"
              />
            </div>

            <div>
              <label
                htmlFor="maximum-fee"
                className="mb-2 block text-sm font-medium text-[#315A3C]"
              >
                Max. fee
              </label>
              <input
                id="maximum-fee"
                name="maxFee"
                type="number"
                min="0"
                max="99999999"
                step="0.01"
                defaultValue={maxFee}
                placeholder="Any"
                className="min-h-12 w-full rounded-lg border border-[#DCE5DB] bg-[#FBFCFA] px-3 text-sm text-[#193B29] outline-none focus:border-[#166534] focus:ring-2 focus:ring-[#166534]/10"
              />
            </div>
          </div>
        </div>

        {!validFeeRange && (
          <p
            role="alert"
            className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900"
          >
            The minimum fee cannot exceed the maximum fee.
          </p>
        )}

        <div className="mt-5 flex flex-col gap-3 border-t border-[#E8EDE7] pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-[#657167]">
            Only approved doctors appear in the results.
          </p>

          <div className="flex gap-3">
            <Link
              href="/doctors"
              className="inline-flex min-h-11 items-center justify-center rounded-lg border border-[#DCE5DB] px-4 text-sm font-medium text-[#315A3C] transition-colors hover:bg-[#F0F5EF]"
            >
              Clear filters
            </Link>

            <button
              type="submit"
              className="inline-flex min-h-11 items-center justify-center rounded-lg bg-[#166534] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#14532D] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#166534]"
            >
              Search doctors
            </button>
          </div>
        </div>
      </form>
    </section>
  );
}