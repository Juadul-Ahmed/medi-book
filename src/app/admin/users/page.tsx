
import { AccountsManager } from "../components/accounts-manager";

export default function AdminPatientsPage() {
  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-semibold tracking-wider text-[#166534]">
          ACCOUNT MANAGEMENT
        </p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight text-stone-900">
          Patients and doctors
        </h1>

        <p className="mt-2 text-stone-500">
          Search accounts, filter by role, and review doctor approval status.
        </p>
      </header>

      <AccountsManager />
    </div>
  );
}
