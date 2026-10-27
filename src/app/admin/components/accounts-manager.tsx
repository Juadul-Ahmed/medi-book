"use client";

import { useCallback, useEffect, useState } from "react";
import { AccountSearch } from "./account-search";
import { AccountsTable } from "./accounts-table";
import type { AdminAccount, AccountsResponse } from "./account-types";

export function AccountsManager() {
  const [accounts, setAccounts] = useState<AdminAccount[]>([]);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAccounts = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();

      if (search.trim()) {
        params.set("search", search.trim());
      }

      if (role !== "ALL") {
        params.set("role", role);
      }

      const query = params.toString();
      const response = await fetch(
        `/api/admin/accounts${query ? `?${query}` : ""}`,
        { cache: "no-store" },
      );

      const data = (await response.json()) as
        | AccountsResponse
        | { error?: string };

      if (!response.ok) {
        throw new Error(
          "error" in data && data.error
            ? data.error
            : "Unable to load accounts.",
        );
      }

      setAccounts((data as AccountsResponse).accounts);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load accounts.");
    } finally {
      setLoading(false);
    }
  }, [search, role]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadAccounts();
    }, 250);

    return () => clearTimeout(timer);
  }, [loadAccounts]);

  return (
    <div className="space-y-5">
      <AccountSearch
        search={search}
        role={role}
        onSearchChange={setSearch}
        onRoleChange={setRole}
      />

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          <p>{error}</p>
          <button
            type="button"
            onClick={() => void loadAccounts()}
            className="mt-2 font-semibold underline"
          >
            Try again
          </button>
        </div>
      )}

      <AccountsTable
        accounts={accounts}
        loading={loading}
        onAccountChanged={() => void loadAccounts()}
      />

      {!loading && !error && (
        <p className="text-sm text-stone-500">
          Showing {accounts.length} account
          {accounts.length === 1 ? "" : "s"} (maximum 100 per request).
        </p>
      )}
    </div>
  );
}
