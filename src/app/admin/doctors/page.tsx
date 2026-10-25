
"use client";

import { useCallback, useEffect, useState } from "react";
import DoctorApplicationsHeader from "@/components/admin/doctors/doctor-applications-header";
import DoctorApplicationsList from "@/components/admin/doctors/doctor-applications-list";
import type { DoctorApplication } from "@/components/admin/doctors/types";

export default function AdminDoctorsPage() {
  const [doctors, setDoctors] = useState<DoctorApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);

  const loadDoctors = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/doctors", {
        cache: "no-store",
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.error ?? "Unable to load applications.");
      setDoctors(data.doctors);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const response = await fetch("/api/admin/doctors", { cache: "no-store" });
        const data = await response.json();

        if (!response.ok) throw new Error(data.error ?? "Unable to load applications.");
        if (!cancelled) setDoctors(data.doctors);
      } catch (error) {
        if (!cancelled) {
          setError(error instanceof Error ? error.message : "Something went wrong.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => { cancelled = true; };
  }, []);

  async function reviewDoctor(
    doctorId: string,
    decision: "APPROVED" | "REJECTED"
  ) {
    const action = decision === "APPROVED" ? "approve" : "reject";
    if (!window.confirm(`Are you sure you want to ${action} this application?`)) return;

    setProcessingId(doctorId);
    setError("");
    setMessage("");

    try {
      const response = await fetch(`/api/admin/doctors/${doctorId}/review`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision }),
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.error ?? "Unable to review application.");

      setMessage(data.message);
      setDoctors((current) => current.filter((doctor) => doctor.id !== doctorId));
    } catch (error) {
      setError(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setProcessingId(null);
    }
  }

  return (
    <main className="min-h-screen bg-[#FAF9F6] px-4 py-8 text-[#252323] sm:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <DoctorApplicationsHeader loading={loading} onRefresh={() => void loadDoctors()} />

        {message && <p role="status" className="mb-6 rounded-xl bg-green-50 p-4 text-sm text-green-800">{message}</p>}
        {error && <p role="alert" className="mb-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}

        <section className="mb-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Pending applications</p>
            <p className="mt-2 text-3xl font-bold">{doctors.length}</p>
          </div>
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Review status</p>
            <p className="mt-2 text-lg font-semibold text-[#166534]">Awaiting review</p>
          </div>
        </section>

        <DoctorApplicationsList
          doctors={doctors}
          loading={loading}
          processingId={processingId}
          onReview={(id, decision) => void reviewDoctor(id, decision)}
        />
      </div>
    </main>
  );
}
