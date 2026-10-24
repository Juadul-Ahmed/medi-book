
import type { DashboardNavItem } from "./dashboard-shell";

export const adminNavigation: DashboardNavItem[] = [
  { label: "Overview", href: "/admin", icon: "⌂" },
  { label: "Doctor Applications", href: "/admin/doctors", icon: "✓" },
  { label: "Appointments", href: "/admin/appointments", icon: "▦" },
  { label: "Patients", href: "/admin/patients", icon: "♙" },
  { label: "Doctors", href: "/admin/doctor-directory", icon: "⚕" },
  { label: "Specialties", href: "/admin/specialties", icon: "✚" },
  { label: "Settings", href: "/admin/settings", icon: "⚙" },
];

export const doctorNavigation: DashboardNavItem[] = [
  { label: "Overview", href: "/doctor", icon: "⌂" },
  { label: "Appointments", href: "/doctor/appointments", icon: "▦" },
  { label: "Availability", href: "/doctor/availability", icon: "◷" },
  { label: "My Patients", href: "/doctor/patients", icon: "♙" },
  { label: "My Profile", href: "/doctor/profile", icon: "⚕" },
  { label: "Settings", href: "/doctor/settings", icon: "⚙" },
];
