
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Card, Chip } from "@heroui/react";
import { formatInTimeZone } from "date-fns-tz";

import { prisma } from "@/lib/prisma";
import { AppointmentBooking } from "@/components/appointments/appointment-booking";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function DoctorProfilePage({ params }: Props) {
  const { id } = await params;

  const doctor = await prisma.doctorProfile.findFirst({
    where: {
      id,
      approved: true,
      reviewStatus: "APPROVED",
    },
    select: {
      bio: true,
      consultationFee: true,
      timezone: true,
      specialty: {
        select: {
          name: true,
          description: true,
        },
      },
      user: {
        select: {
          name: true,
          image: true,
        },
      },
    },
  });

  if (!doctor) {
    notFound();
  }

  const doctorTimezone = doctor.timezone || "UTC";

  const initialDate = formatInTimeZone(
    new Date(),
    doctorTimezone,
    "yyyy-MM-dd",
  );

  return (
    <main className="min-h-screen bg-[#F8FAF8]">
      <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 sm:py-10 lg:px-10">
        <Link
          href="/doctors"
          className="mb-6 inline-flex min-h-10 items-center gap-2 rounded-xl px-3 text-sm font-medium text-[#166534] transition hover:bg-green-50"
        >
          <span aria-hidden="true">←</span>
          Back to doctors
        </Link>

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.85fr)] lg:gap-8">
          {/* Left column: Doctor profile */}
          <section className="min-w-0">
            <Card className="border border-stone-200 bg-white shadow-sm">
              <Card.Content className="gap-7 p-5 sm:gap-8 sm:p-8 lg:p-9">
                {/* Doctor heading */}
                <div className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-center">
                  {doctor.user.image ? (
                    <Image
                      src={doctor.user.image}
                      alt={`Dr. ${doctor.user.name}`}
                      width={112}
                      height={112}
                      className="h-24 w-24 shrink-0 rounded-2xl object-cover ring-1 ring-stone-200 sm:h-28 sm:w-28"
                    />
                  ) : (
                    <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-green-50 text-3xl font-bold text-[#166534] sm:h-28 sm:w-28 sm:text-4xl">
                      {doctor.user.name.charAt(0).toUpperCase()}
                    </div>
                  )}

                  <div className="min-w-0">
                    <Chip color="success" variant="soft">
                      {doctor.specialty.name}
                    </Chip>

                    <h1 className="mt-3 break-words text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl">
                      Dr. {doctor.user.name}
                    </h1>

                    <p className="mt-3 text-xl font-semibold text-[#166534] sm:text-2xl">
                      {Number(doctor.consultationFee).toFixed(2)}
                      <span className="ml-2 text-sm font-normal text-stone-500">
                        Consultation fee
                      </span>
                    </p>
                  </div>
                </div>

                {/* Doctor biography */}
                <div className="border-t border-stone-100 pt-6">
                  <h2 className="text-lg font-semibold text-stone-900">
                    About the doctor
                  </h2>

                  <p className="mt-3 whitespace-pre-line break-words text-sm leading-7 text-stone-600 sm:text-base">
                    {doctor.bio || "No biography has been provided yet."}
                  </p>
                </div>

                {/* Specialty information */}
                {doctor.specialty.description && (
                  <div className="border-t border-stone-100 pt-6">
                    <h2 className="text-lg font-semibold text-stone-900">
                      About this specialty
                    </h2>

                    <p className="mt-3 break-words text-sm leading-7 text-stone-600 sm:text-base">
                      {doctor.specialty.description}
                    </p>
                  </div>
                )}

                {/* Doctor timezone */}
                <div className="flex items-start gap-3 rounded-xl bg-[#F0F5EF] p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-lg text-[#166534]">
                    <span aria-hidden="true">◷</span>
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#193B29]">
                      Doctor&apos;s time zone
                    </p>

                    <p className="mt-1 break-all text-sm text-[#657167]">
                      {doctorTimezone}
                    </p>

                    <p className="mt-1 text-xs leading-5 text-[#657167]">
                      Appointment times are displayed using this time zone.
                    </p>
                  </div>
                </div>

                {/* Booking information */}
                <div className="border-t border-stone-100 pt-6">
                  <h2 className="text-lg font-semibold text-stone-900">
                    Before your appointment
                  </h2>

                  <div className="mt-4 space-y-3 text-sm text-stone-600">
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 text-[#166534]" aria-hidden="true">
                        ✓
                      </span>
                      <p>Each consultation lasts 30 minutes.</p>
                    </div>

                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 text-[#166534]" aria-hidden="true">
                        ✓
                      </span>
                      <p>Successful bookings are confirmed automatically.</p>
                    </div>

                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 text-[#166534]" aria-hidden="true">
                        ✓
                      </span>
                      <p>
                        Cancellations must be made at least 24 hours before
                        the appointment starts.
                      </p>
                    </div>
                  </div>
                </div>
              </Card.Content>
            </Card>
          </section>

          {/* Right column: Appointment booking */}
          <aside className="min-w-0 lg:sticky lg:top-6 lg:self-start">
            <div className="rounded-2xl border border-stone-200 bg-white p-1 shadow-sm sm:p-2">
              <AppointmentBooking
                doctorId={id}
                timezone={doctorTimezone}
                initialDate={initialDate}
              />
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
