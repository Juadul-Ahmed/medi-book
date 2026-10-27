
"use client";

import { useState } from "react";
import type { AdminAccount } from "./account-types";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";

function getAccountStatus(account: AdminAccount) {
  if (account.isBlocked) return "Blocked";

  if (account.role === "PATIENT") return "Active";

  if (!account.doctorProfile) return "Profile missing";

  switch (account.doctorProfile.reviewStatus) {
    case "APPROVED":
      return account.doctorProfile.approved ? "Approved" : "Inactive";
    case "REJECTED":
      return "Rejected";
    default:
      return "Pending review";
  }
}

function statusClasses(status: string) {
  switch (status) {
    case "Approved":
    case "Active":
      return "bg-green-50 text-green-700";
    case "Pending review":
      return "bg-amber-50 text-amber-700";
    case "Blocked":
    case "Rejected":
    case "Inactive":
      return "bg-red-50 text-red-700";
    default:
      return "bg-stone-100 text-stone-600";
  }
}

function AccountsTableSkeleton() {
  return (
    <div
      className="overflow-hidden rounded-2xl border border-stone-200 bg-white p-5"
      aria-label="Loading accounts"
    >
      <div className="space-y-4">
        <LoadingSkeleton className="h-10 w-full" />
        {Array.from({ length: 5 }, (_, index) => (
          <div key={index} className="flex gap-4 border-b border-stone-100 pb-4">
            <LoadingSkeleton className="h-12 flex-1" />
            <LoadingSkeleton className="h-8 w-20" />
            <LoadingSkeleton className="h-8 w-24" />
            <LoadingSkeleton className="h-8 w-24" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function AccountsTable({
  accounts,
  loading = false,
  onAccountChanged,
}: {
  accounts: AdminAccount[];
  loading?: boolean;
  onAccountChanged?: () => void;
}) {
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedAccount, setSelectedAccount] = useState<AdminAccount | null>(null);
  const [reason, setReason] = useState("");

  async function changeAccountStatus() {
    if (!selectedAccount || busyId) return;

    const account = selectedAccount;
    const action = account.isBlocked ? "UNBLOCK" : "BLOCK";

    setBusyId(account.id);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `/api/admin/accounts/${encodeURIComponent(account.id)}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action,
            reason: action === "BLOCK" ? reason.trim() : undefined,
          }),
        },
      );

      const data = (await response.json()) as {
        error?: string;
        isBlocked?: boolean;
      };

      if (!response.ok) {
        throw new Error(data.error || "Unable to update this account.");
      }

      setSuccess(
        `${account.name} has been ${action === "BLOCK" ? "blocked" : "unblocked"}.`,
      );
      setSelectedAccount(null);
      setReason("");
      onAccountChanged?.();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to update this account.",
      );
    } finally {
      setBusyId(null);
    }
  }

  if (loading) return <AccountsTableSkeleton />;

  if (accounts.length === 0) {
    return (
      <div className="rounded-2xl border border-stone-200 bg-white p-10 text-center">
        <p className="font-semibold text-stone-900">No accounts found</p>
        <p className="mt-1 text-sm text-stone-500">
          Try changing your search or role filter.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div role="status" className="rounded-xl bg-green-50 p-3 text-sm text-green-700">
          {success}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-stone-50 text-xs uppercase tracking-wide text-stone-500">
              <tr>
                <th className="px-5 py-4 font-semibold">Account</th>
                <th className="px-5 py-4 font-semibold">Role</th>
                <th className="px-5 py-4 font-semibold">Specialty</th>
                <th className="px-5 py-4 font-semibold">Status</th>
                <th className="px-5 py-4 font-semibold">Registered</th>
                <th className="px-5 py-4 font-semibold">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-stone-100">
              {accounts.map((account) => {
                const status = getAccountStatus(account);
                const busy = busyId === account.id;

                return (
                  <tr key={account.id} className="hover:bg-stone-50">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-stone-900">{account.name}</p>
                      <p className="mt-1 text-stone-500">{account.email}</p>
                    </td>

                    <td className="px-5 py-4 text-stone-700">
                      {account.role === "DOCTOR" ? "Doctor" : "Patient"}
                    </td>

                    <td className="px-5 py-4 text-stone-600">
                      {account.doctorProfile?.specialty.name ?? "—"}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusClasses(status)}`}
                      >
                        {status}
                      </span>
                      {account.isBlocked && account.blockedReason && (
                        <p className="mt-1 max-w-48 text-xs text-stone-500">
                          Reason: {account.blockedReason}
                        </p>
                      )}
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-stone-500">
                      {new Intl.DateTimeFormat("en", {
                        dateStyle: "medium",
                      }).format(new Date(account.createdAt))}
                    </td>

                    <td className="px-5 py-4">
                      <button
                        type="button"
                        disabled={Boolean(busyId)}
                        onClick={() => {
                          setError("");
                          setSuccess("");
                          setReason("");
                          setSelectedAccount(account);
                        }}
                        className={`rounded-lg px-3 py-2 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-50 ${
                          account.isBlocked
                            ? "bg-green-50 text-green-700 hover:bg-green-100"
                            : "bg-red-50 text-red-700 hover:bg-red-100"
                        }`}
                      >
                        {busy ? "Updating..." : account.isBlocked ? "Unblock" : "Block"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {selectedAccount && (
        <div className="rounded-2xl border border-stone-200 bg-white p-5">
          <h3 className="font-semibold text-stone-900">
            {selectedAccount.isBlocked ? "Unblock account" : "Block account"}
          </h3>

          <p className="mt-2 text-sm text-stone-600">
            {selectedAccount.isBlocked
              ? `Allow ${selectedAccount.name} to access MediBook again?`
              : `Block ${selectedAccount.name} from accessing MediBook? Their existing sessions will be revoked.`}
          </p>

          {!selectedAccount.isBlocked && (
            <div className="mt-4">
              <label
                htmlFor="block-reason"
                className="mb-1 block text-sm font-medium text-stone-700"
              >
                Reason (optional)
              </label>
              <textarea
                id="block-reason"
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                maxLength={500}
                rows={3}
                placeholder="Explain why this account is being blocked"
                className="w-full rounded-xl border border-stone-300 p-3 text-sm outline-none focus:border-green-700 focus:ring-2 focus:ring-green-100"
              />
              <p className="mt-1 text-right text-xs text-stone-500">
                {reason.length}/500
              </p>
            </div>
          )}

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              disabled={Boolean(busyId)}
              onClick={() => void changeAccountStatus()}
              className={`rounded-xl px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 ${
                selectedAccount.isBlocked
                  ? "bg-green-700 hover:bg-green-800"
                  : "bg-red-700 hover:bg-red-800"
              }`}
            >
              {busyId
                ? "Updating..."
                : selectedAccount.isBlocked
                  ? "Confirm unblock"
                  : "Confirm block"}
            </button>

            <button
              type="button"
              disabled={Boolean(busyId)}
              onClick={() => {
                setSelectedAccount(null);
                setReason("");
              }}
              className="rounded-xl border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-50 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
