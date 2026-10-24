
"use client";

import type { DoctorApplication } from "./types";

type Props = {
  doctor: DoctorApplication;
  processing: boolean;
  onReview: (
    doctorId: string,
    decision: "APPROVED" | "REJECTED"
  ) => void;
};

export default function DoctorApplicationCard({
  doctor,
  processing,
  onReview,
}: Props) {
  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
      <div className="flex flex-col justify-between gap-4 sm:flex-row">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-xl font-bold">{doctor.user.name}</h2>
            <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
              Pending
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-500">{doctor.user.email}</p>
          <p className="mt-3 text-sm font-medium text-[#B52D32]">
            {doctor.specialty.name}
          </p>
        </div>

        <div className="sm:text-right">
          <p className="text-sm text-gray-500">Consultation fee</p>
          <p className="mt-1 text-2xl font-bold">
            {doctor.consultationFee}
          </p>
        </div>
      </div>

      <div className="my-5 grid gap-4 border-y border-gray-100 py-5 sm:grid-cols-2">
        <Detail label="License number" value={doctor.licenseNumber} />
        <Detail label="Time zone" value={doctor.timezone} />
        <Detail
          label="Application date"
          value={new Date(doctor.createdAt).toLocaleDateString()}
        />
        <Detail label="Doctor profile ID" value={doctor.id} />
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
          Professional biography
        </p>
        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-700">
          {doctor.bio || "No biography provided."}
        </p>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={() => onReview(doctor.id, "REJECTED")}
          disabled={processing}
          className="rounded-xl border border-red-200 px-5 py-3 text-sm font-semibold text-[#B52D32] hover:bg-red-50 disabled:opacity-50"
        >
          Reject
        </button>

        <button
          type="button"
          onClick={() => onReview(doctor.id, "APPROVED")}
          disabled={processing}
          className="rounded-xl bg-[#B52D32] px-5 py-3 text-sm font-semibold text-white hover:bg-[#942329] disabled:opacity-50"
        >
          Approve doctor
        </button>
      </div>
    </article>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        {label}
      </p>
      <p className="mt-1 break-all text-sm font-medium">{value}</p>
    </div>
  );
}
