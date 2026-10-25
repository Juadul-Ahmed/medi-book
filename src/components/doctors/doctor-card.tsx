
import Image from "next/image";
import Link from "next/link";

type DoctorCardProps = {
  id: string;
  name: string;
  image: string | null;
  specialty: string;
  bio: string | null;
  consultationFee: string;
};

export function DoctorCard({
  id,
  name,
  image,
  specialty,
  bio,
  consultationFee,
}: DoctorCardProps) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-[#E2E9E1] bg-white transition duration-300 hover:-translate-y-1 hover:border-[#B8CDBB] hover:shadow-lg hover:shadow-[#193B29]/5">
      <div className="relative flex h-56 items-center justify-center overflow-hidden bg-[#EDF2EB]">
        {image ? (
          <Image
            src={image}
            alt={name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div
            aria-hidden="true"
            className="flex h-24 w-24 items-center justify-center rounded-full bg-[#DCE8DC] text-3xl font-semibold text-[#315A3C]"
          >
            {name
              .trim()
              .split(/\s+/)
              .slice(0, 2)
              .map((part) => part[0])
              .join("")
              .toUpperCase()}
          </div>
        )}

        <span className="absolute bottom-3 left-3 rounded-full border border-white/70 bg-white/95 px-3 py-1 text-xs font-medium text-[#315A3C]">
          Verified doctor
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <p className="text-sm font-medium text-[#477453]">
          {specialty}
        </p>

        <h2 className="mt-2 text-xl font-semibold tracking-tight text-[#193B29]">
          {name}
        </h2>

        <p className="mt-3 line-clamp-3 min-h-[4.5rem] text-sm leading-6 text-[#657167]">
          {bio?.trim() ||
            "View this doctor's profile to learn more about their practice."}
        </p>

        <div className="mt-6 flex items-end justify-between gap-3 border-t border-[#E8EDE7] pt-5">
          <div>
            <p className="text-xs text-[#758075]">
              Consultation fee
            </p>
            <p className="mt-1 text-lg font-semibold text-[#193B29]">
              {Number(consultationFee).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>

          <Link
            href={`/doctors/${id}`}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#166534] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#14532D] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#166534]"
          >
            View profile
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </article>
  );
}
