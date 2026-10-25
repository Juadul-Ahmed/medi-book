"use client";

type LoadingSkeletonProps = {
  className?: string;
};

export function LoadingSkeleton({ className = "" }: LoadingSkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-lg bg-gray-200 ${className}`}
    />
  );
}

export function ProfilePageSkeleton() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="space-y-2">
        <LoadingSkeleton className="h-8 w-40" />
        <LoadingSkeleton className="h-4 w-64 max-w-full" />
      </div>

      <div className="rounded-xl border p-5 space-y-3">
        <LoadingSkeleton className="h-5 w-32" />
        <LoadingSkeleton className="h-4 w-48" />
      </div>

      <div className="rounded-xl border p-6 space-y-5">
        <LoadingSkeleton className="h-24 w-24 rounded-full" />
        <LoadingSkeleton className="h-10 w-full" />
        <LoadingSkeleton className="h-10 w-full" />
        <LoadingSkeleton className="h-10 w-full" />
        <LoadingSkeleton className="h-28 w-full" />
        <LoadingSkeleton className="h-10 w-32" />
      </div>
    </div>
  );
}