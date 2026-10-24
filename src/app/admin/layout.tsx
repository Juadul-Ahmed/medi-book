
import { Suspense } from "react";
import AdminDashboardContent from "./admin-dashboard-content";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAF9F6]" />
      }
    >
      <AdminDashboardContent>{children}</AdminDashboardContent>
    </Suspense>
  );
}
