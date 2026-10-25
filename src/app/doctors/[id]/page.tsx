import Link from "next/link";
import { notFound } from "next/navigation";
import { Button, Card, Chip } from "@heroui/react";
import { prisma } from "@/lib/prisma";

export const instant = false;

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
        select: { name: true, description: true },
      },
      user: {
        select: { name: true, image: true },
      },
    },
  });

  if (!doctor) notFound();

  return (
    <main className="min-h-screen bg-[#F8FAF8] px-5 py-12 sm:px-8">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/doctors"
          className="mb-6 inline-flex min-h-10 items-center rounded-xl px-4 text-sm font-medium text-[#166534] transition hover:bg-green-50"
        >
          ← Back to doctors
        </Link>

        <Card className="border border-stone-200 bg-white shadow-sm">
          <Card.Content className="gap-8 p-6 sm:p-10">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              {doctor.user.image ? (
                <img
                  src={doctor.user.image}
                  alt={`Dr. ${doctor.user.name}`}
                  className="h-24 w-24 rounded-2xl object-cover"
                />
              ) : (
                <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-green-50 text-3xl font-bold text-[#166534]">
                  {doctor.user.name.charAt(0).toUpperCase()}
                </div>
              )}

              <div className="min-w-0">
                <Chip color="success" variant="soft">
                  {doctor.specialty.name}
                </Chip>

                <h1 className="mt-3 text-3xl font-bold tracking-tight text-stone-900">
                  Dr. {doctor.user.name}
                </h1>

                <p className="mt-3 text-xl font-semibold text-[#166534]">
                  {Number(doctor.consultationFee).toFixed(2)}
                  <span className="ml-2 text-sm font-normal text-stone-500">
                    Consultation fee
                  </span>
                </p>
              </div>
            </div>

            <div className="border-t border-stone-100 pt-6">
              <h2 className="text-lg font-semibold text-stone-900">
                About the doctor
              </h2>
              <p className="mt-3 whitespace-pre-line leading-7 text-stone-600">
                {doctor.bio || "No biography has been provided yet."}
              </p>
            </div>

            {doctor.specialty.description && (
              <div>
                <h2 className="text-lg font-semibold text-stone-900">
                  About this specialty
                </h2>
                <p className="mt-3 leading-7 text-stone-600">
                  {doctor.specialty.description}
                </p>
              </div>
            )}

            <div className="rounded-xl bg-[#F0F5EF] p-4">
              <p className="text-sm font-medium text-[#193B29]">
                Doctor's timezone
              </p>
              <p className="mt-1 text-sm text-[#657167]">{doctor.timezone}</p>
            </div>

            <div className="rounded-xl border border-stone-200 p-5">
              <h2 className="font-semibold text-stone-900">
                Book an appointment
              </h2>
              <p className="mt-2 text-sm leading-6 text-stone-500">
                Online booking will be available when the appointment booking
                feature is implemented.
              </p>
              <Button isDisabled className="mt-4 bg-[#166534] text-white">
                Booking coming soon
              </Button>
            </div>
          </Card.Content>
        </Card>
      </div>
    </main>
  );
}
