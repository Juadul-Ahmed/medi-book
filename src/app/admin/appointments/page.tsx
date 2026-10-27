
import { Suspense } from "react";

import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { AdminAppointments } from "./admin-appointments";

function AppointmentsPageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <LoadingSkeleton className="h-8 w-56" />
        <LoadingSkeleton className="h-4 w-80 max-w-full" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <LoadingSkeleton key={index} className="h-28 w-full" />
        ))}
      </div>

      <LoadingSkeleton className="h-20 w-full" />
      <LoadingSkeleton className="h-96 w-full" />
    </div>
  );
}

export default function AdminAppointmentsPage() {
  return (
    <Suspense fallback={<AppointmentsPageSkeleton />}>
      <AdminAppointments />
    </Suspense>
  );
}
