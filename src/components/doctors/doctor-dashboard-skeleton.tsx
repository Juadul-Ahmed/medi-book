import { LoadingSkeleton } from "@/components/ui/loading-skeleton";

export function DoctorDashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <LoadingSkeleton className="h-8 w-56" />
        <LoadingSkeleton className="h-4 w-72 max-w-full" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border bg-white p-5 space-y-3">
            <LoadingSkeleton className="h-4 w-28" />
            <LoadingSkeleton className="h-8 w-20" />
            <LoadingSkeleton className="h-3 w-32" />
          </div>
        ))}
      </div>

      <div className="rounded-xl border bg-white p-5 space-y-4">
        <LoadingSkeleton className="h-6 w-44" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <LoadingSkeleton className="size-10 shrink-0 rounded-full" />
            <div className="flex-1 space-y-2">
              <LoadingSkeleton className="h-4 w-40 max-w-full" />
              <LoadingSkeleton className="h-3 w-56 max-w-full" />
            </div>
            <LoadingSkeleton className="h-8 w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}