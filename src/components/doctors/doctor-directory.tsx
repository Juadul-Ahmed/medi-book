import Link from "next/link";
import { DoctorCard } from "@/components/doctors/doctor-card";
import { DoctorFilters } from "@/components/doctors/doctor-filters";
type SpecialtyOption = {
  id: string;
  name: string;
};

type Doctor = {
  id: string;
  bio: string | null;
  consultationFee: string;
  specialty: {
    id: string;
    name: string;
  };
  user: {
    name: string;
    image: string | null;
  };
};

type DoctorDirectoryProps = {
  doctors: Doctor[];
  specialties: SpecialtyOption[];
  query: string;
  specialtyId: string;
  minFee: string;
  maxFee: string;
  matchingCount: number;
  currentPage: number;
  totalPages: number;
  pageHref: (page: number) => string;
  validFeeRange: boolean;
  activeFilters: string[];
};

export function DoctorDirectory({
  doctors,
  specialties,
  query,
  specialtyId,
  minFee,
  maxFee,
  matchingCount,
  currentPage,
  totalPages,
  pageHref,
  validFeeRange,
  activeFilters,
}: DoctorDirectoryProps) {
  return (
    <div>
      <DoctorFilters
        specialties={specialties}
        query={query}
        specialtyId={specialtyId}
        minFee={minFee}
        maxFee={maxFee}
        validFeeRange={validFeeRange}
      />

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-[#193B29]">
            Available doctors
          </h2>
          <p className="mt-1 text-sm text-[#657167]">
            {matchingCount} {matchingCount === 1 ? "doctor" : "doctors"} found
          </p>
        </div>

        {activeFilters.length > 0 && (
          <p className="text-sm text-[#657167]">
            Filters: {activeFilters.join(" · ")}
          </p>
        )}
      </div>

      {!validFeeRange && (
        <p
          role="alert"
          className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"
        >
          The minimum fee cannot exceed the maximum fee. Please adjust your
          filters.
        </p>
      )}

      {validFeeRange && doctors.length > 0 ? (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {doctors.map((doctor) => (
            <DoctorCard
              key={doctor.id}
              id={doctor.id}
              name={doctor.user.name}
              image={doctor.user.image}
              specialty={doctor.specialty.name}
              bio={doctor.bio}
              consultationFee={doctor.consultationFee}
            />
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-xl border border-dashed border-[#C8D8C8] bg-white px-6 py-16 text-center">
          <h3 className="text-lg font-semibold text-[#193B29]">
            No doctors found
          </h3>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#657167]">
            {validFeeRange
              ? "Try another name, select a different specialty, or adjust your consultation fee range."
              : "Please enter a valid consultation fee range."}
          </p>
          <Link
            href="/doctors"
            className="mt-5 inline-flex min-h-11 items-center justify-center rounded-lg bg-[#166534] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#14532D]"
          >
            Reset search
          </Link>
        </div>
      )}

      {validFeeRange && totalPages > 1 && (
        <nav
          aria-label="Doctor directory pages"
          className="mt-10 flex flex-wrap items-center justify-center gap-2"
        >
          <Link
            aria-disabled={currentPage <= 1}
            tabIndex={currentPage <= 1 ? -1 : undefined}
            href={pageHref(Math.max(1, currentPage - 1))}
            className={`inline-flex min-h-10 items-center rounded-lg border px-3 text-sm font-medium ${
              currentPage <= 1
                ? "pointer-events-none border-[#E5EBE5] text-[#A0AAA0]"
                : "border-[#DCE5DB] text-[#315A3C] hover:bg-white"
            }`}
          >
            Previous
          </Link>

          <span className="px-3 text-sm text-[#657167]">
            Page {currentPage} of {totalPages}
          </span>

          <Link
            aria-disabled={currentPage >= totalPages}
            tabIndex={currentPage >= totalPages ? -1 : undefined}
            href={pageHref(Math.min(totalPages, currentPage + 1))}
            className={`inline-flex min-h-10 items-center rounded-lg border px-3 text-sm font-medium ${
              currentPage >= totalPages
                ? "pointer-events-none border-[#E5EBE5] text-[#A0AAA0]"
                : "border-[#DCE5DB] text-[#315A3C] hover:bg-white"
            }`}
          >
            Next
          </Link>
        </nav>
      )}
    </div>
  );
}
