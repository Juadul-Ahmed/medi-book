import type { Metadata } from "next";
import { NavbarWrapper } from "@/components/layout/navbar-wrapper";
import "./globals.css";

export const metadata: Metadata = {
  title: "MediBook",
  description: "Find doctors and manage your appointments with MediBook.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <NavbarWrapper />
        {children}
      </body>
    </html>
  );
}