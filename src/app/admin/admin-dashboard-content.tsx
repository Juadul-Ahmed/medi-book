
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/layouts/dashboard-shell";
import { adminNavigation } from "@/components/layouts/dashboard-navigation";
import { getCurrentUser, requireRole } from "@/lib/server-auth";

export default async function AdminDashboardContent({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  let admin;

  try {
    admin = await requireRole("ADMIN");
  } catch (error) {
    console.error("Admin authorization failed:", error);
    throw error;
  }

  return (
    <DashboardShell
      role="Admin"
      name={admin.name || "Administrator"}
      email={admin.email}
      navigation={adminNavigation}
    >
      {children}
    </DashboardShell>
  );
}
