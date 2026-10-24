import { Suspense } from "react";
import DoctorDashboardContent from "./doctor-dashboard-content";

export default function DoctorDashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FAF9F6]" />}>
      <DoctorDashboardContent>{children}</DoctorDashboardContent>
    </Suspense>
  );
}