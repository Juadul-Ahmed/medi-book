
import { AvailabilityEditor } from "@/components/doctors/availability/availability-editor";

export default function DoctorAvailabilityPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-stone-900">
          Availability
        </h1>
        <p className="mt-2 text-sm text-stone-500">
          Manage your weekly working hours and appointment periods.
        </p>
      </header>

      <AvailabilityEditor />
    </div>
  );
}
