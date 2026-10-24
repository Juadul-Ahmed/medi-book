
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@heroui/react";
import { signOut, useSession } from "@/lib/auth-client";

export function AuthHeader() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  async function handleSignOut() {
    const result = await signOut();

    if (result.error) {
      return;
    }

    router.replace("/login");
    router.refresh();
  }

  return (
    <header className="flex items-center justify-between border-b border-stone-200 bg-white px-5 py-4 sm:px-8">
      <Link href="/" className="text-lg font-bold text-rose-800">
        MediBook
      </Link>

      <nav className="flex items-center gap-3">
        {isPending ? (
          <span className="text-sm text-gray-500">Loading session...</span>
        ) : session?.user ? (
          <>
            <span className="hidden text-sm text-gray-700 sm:inline">
              {session.user.name}
            </span>

            <Button
              variant="outline"
              onPress={handleSignOut}
              className="border-stone-300 text-gray-800"
            >
              Sign out
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="outline"
              onPress={() => router.push("/login")}
            >
              Sign in
            </Button>

            <Button
              onPress={() => router.push("/register")}
              className="bg-rose-800 text-white"
            >
              Register
            </Button>
          </>
        )}
      </nav>
    </header>
  );
}
