"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth-client";

export function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogout() {
    setLoading(true);
    setError("");

    try {
      const result = await signOut();

      if (result.error) {
        setError("Unable to log out. Please try again.");
        return;
      }

      router.replace("/login");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleLogout}
        disabled={loading}
        className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#B52D32]/20 bg-white px-4 py-2.5 text-sm font-semibold text-[#B52D32] transition hover:bg-[#B52D32] hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span aria-hidden="true">↪</span>
        {loading ? "Logging out..." : "Log out"}
      </button>

      {error && (
        <p role="alert" className="mt-2 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}