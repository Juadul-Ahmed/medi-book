
import type { DashboardNavItem } from "./dashboard-shell";

export const adminNavigation: DashboardNavItem[] = [
  { label: "Overview", href: "/admin", icon: "home" },
  {
    label: "Doctor Applications",
    href: "/admin/doctors",
    icon: "check-circle",
  },
  {
    label: "Appointments",
    href: "/admin/appointments",
    icon: "calendar",
  },
  { label: "Users", href: "/admin/users", icon: "users" },
];

export const doctorNavigation: DashboardNavItem[] = [
  { label: "Overview", href: "/doctor", icon: "home" },
  {
    label: "Appointments",
    href: "/doctor/appointments",
    icon: "calendar",
  },
  {
    label: "Availability",
    href: "/doctor/availability",
    icon: "clock",
  },
  {
    label: "My Profile",
    href: "/doctor/profile",
    icon: "user",
  },
];
