
import DoctorApplicationCard from "./doctor-application-card";
import type { DoctorApplication } from "./types";

type Props = {
  doctors: DoctorApplication[];
  loading: boolean;
  processingId: string | null;
  onReview: (
    doctorId: string,
    decision: "APPROVED" | "REJECTED"
  ) => void;
};

export default function DoctorApplicationsList({
  doctors,
  loading,
  processingId,
  onReview,
}: Props) {
  if (loading) {
    return (
      <div className="rounded-2xl border bg-white p-10 text-center text-gray-500">
        Loading doctor applications...
      </div>
    );
  }

  if (doctors.length === 0) {
    return (
      <div className="rounded-2xl border bg-white px-6 py-16 text-center">
        <h2 className="text-xl font-semibold">No pending applications</h2>
        <p className="mt-2 text-sm text-gray-500">
          New doctor registrations will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {doctors.map((doctor) => (
        <DoctorApplicationCard
          key={doctor.id}
          doctor={doctor}
          processing={processingId !== null}
          onReview={onReview}
        />
      ))}
    </div>
  );
}
