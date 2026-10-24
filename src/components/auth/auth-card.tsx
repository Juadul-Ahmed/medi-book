
import type { ReactNode } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@heroui/react";

type AuthCardProps = {
  title: string;
  description: string;
  children: ReactNode;
  footer: ReactNode;
};

export function AuthCard({
  title,
  description,
  children,
  footer,
}: AuthCardProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-stone-50 px-4 py-10">
      <Card className="w-full max-w-md border border-stone-200 bg-white shadow-sm">
        <CardHeader className="flex flex-col items-start gap-2 px-6 pt-7 sm:px-8">
          <Link
            href="/"
            className="text-sm font-bold tracking-wide text-rose-800"
          >
            MediBook
          </Link>

          <CardTitle className="mt-4 text-2xl font-bold tracking-tight text-gray-900">
            {title}
          </CardTitle>

          <CardDescription className="text-sm leading-6 text-gray-600">
            {description}
          </CardDescription>
        </CardHeader>

        <CardContent className="px-6 py-4 sm:px-8">
          {children}
        </CardContent>

        <CardFooter className="justify-center px-6 pb-7 text-center text-sm text-gray-600 sm:px-8">
          {footer}
        </CardFooter>
      </Card>
    </main>
  );
}
