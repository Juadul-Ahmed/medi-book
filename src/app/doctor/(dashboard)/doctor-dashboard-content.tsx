import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/layouts/dashboard-shell";
import { doctorNavigation } from "@/components/layouts/dashboard-navigation";
import {
  getCurrentUser,
  requireApprovedDoctor,
} from "@/lib/server-auth";

export default async function DoctorDashboardContent({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  let doctor;

  try {
    doctor = await requireApprovedDoctor();
  } catch {
    redirect("/");
  }

  return (
    <DashboardShell
      role="Doctor"
      name={doctor.name || "Doctor"}
      email={doctor.email}
      navigation={doctorNavigation}
    >
      {children}
    </DashboardShell>
  );
}