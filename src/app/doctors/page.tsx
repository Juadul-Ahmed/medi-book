import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { DoctorDirectory } from "@/components/doctors/doctor-directory";

export const metadata = {
  title: "Find a Doctor | MediBook",
  description:
    "Find approved doctors, explore medical specialties, and compare consultation fees on MediBook.",
};

export const instant = false;

type DoctorsPageProps = {
  searchParams: Promise<{
    q?: string;
    specialty?: string;
    minFee?: string;
    maxFee?: string;
    page?: string;
  }>;
};

const PAGE_SIZE = 9;

function parseFee(value?: string) {
  if (!value || !/^\d{1,8}(\.\d{1,2})?$/.test(value)) {
    return undefined;
  }

  const amount = Number(value);

  return Number.isFinite(amount) && amount >= 0
    ? amount
    : undefined;
}

function parsePage(value?: string) {
  if (!value || !/^\d+$/.test(value)) return 1;

  const page = Number(value);

  return Number.isSafeInteger(page) && page >= 1 ? page : 1;
}

export default async function DoctorsPage({
  searchParams,
}: DoctorsPageProps) {
  const params = await searchParams;

  const query = (params.q ?? "").trim().slice(0, 100);
  const specialtyId = (params.specialty ?? "").slice(0, 100);
  const minFee = parseFee(params.minFee);
  const maxFee = parseFee(params.maxFee);
  const requestedPage = parsePage(params.page);

  const validFeeRange =
    minFee === undefined ||
    maxFee === undefined ||
    minFee <= maxFee;

  const doctorWhere = {
    approved: true,
    reviewStatus: "APPROVED" as const,
    ...(query
      ? {
          user: {
            name: {
              contains: query,
              mode: "insensitive" as const,
            },
          },
        }
      : {}),
    ...(specialtyId ? { specialtyId } : {}),
    ...(validFeeRange && (minFee !== undefined || maxFee !== undefined)
      ? {
          consultationFee: {
            ...(minFee !== undefined ? { gte: minFee } : {}),
            ...(maxFee !== undefined ? { lte: maxFee } : {}),
          },
        }
      : {}),
  };

  const [specialties, matchingCount] = await Promise.all([
    prisma.specialty.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
      },
    }),
    prisma.doctorProfile.count({
      where: doctorWhere,
    }),
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(matchingCount / PAGE_SIZE),
  );

  const currentPage = Math.min(requestedPage, totalPages);

  const doctors = await prisma.doctorProfile.findMany({
    where: doctorWhere,
    select: {
      id: true,
      bio: true,
      consultationFee: true,
      specialty: {
        select: {
          id: true,
          name: true,
        },
      },
      user: {
        select: {
          name: true,
          image: true,
        },
      },
    },
    orderBy: [
      { user: { name: "asc" } },
      { id: "asc" },
    ],
    skip: (currentPage - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  });

  const selectedSpecialty = specialties.find(
    (specialty) => specialty.id === specialtyId,
  );

  const activeFilters = [
    query ? `Name: "${query}"` : null,
    selectedSpecialty?.name ?? null,
    minFee !== undefined ? `From ${minFee}` : null,
    maxFee !== undefined ? `Up to ${maxFee}` : null,
  ].filter((filter): filter is string => filter !== null);

  function pageHref(page: number) {
    const search = new URLSearchParams();

    if (query) search.set("q", query);
    if (specialtyId) search.set("specialty", specialtyId);
    if (params.minFee) search.set("minFee", params.minFee);
    if (params.maxFee) search.set("maxFee", params.maxFee);

    search.set("page", String(page));

    return `/doctors?${search.toString()}`;
  }

  return (
    <main className="min-h-screen bg-[#F8FAF8]">
      <section className="border-b border-[#E5EBE5] bg-white">
        <div className="mx-auto max-w-[1400px] px-5 py-12 sm:px-8 sm:py-16 lg:px-12">
          <Link
            href="/"
            className="text-sm font-medium text-[#477453] transition-colors hover:text-[#14532D]"
          >
            ← Back to home
          </Link>

          <p className="mt-8 text-sm font-semibold tracking-wide text-[#477453]">
            YOUR CARE STARTS HERE
          </p>

          <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-[-0.05em] text-[#193B29] sm:text-5xl lg:text-6xl">
            Find the right doctor for you.
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-7 text-[#657167] sm:text-lg">
            Explore approved healthcare professionals and find a
            specialist who fits your needs and budget.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-5 py-10 sm:px-8 sm:py-14 lg:px-12">
        <DoctorDirectory
          doctors={doctors.map((doctor) => ({
            ...doctor,
            consultationFee: doctor.consultationFee.toString(),
          }))}
          specialties={specialties}
          query={query}
          specialtyId={specialtyId}
          minFee={params.minFee ?? ""}
          maxFee={params.maxFee ?? ""}
          matchingCount={matchingCount}
          currentPage={currentPage}
          totalPages={totalPages}
          pageHref={pageHref}
          validFeeRange={validFeeRange}
          activeFilters={activeFilters}
        />
      </section>
    </main>
  );
}