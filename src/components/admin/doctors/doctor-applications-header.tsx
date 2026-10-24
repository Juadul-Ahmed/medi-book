
type Props = {
  loading: boolean;
  onRefresh: () => void;
};

export default function DoctorApplicationsHeader({
  loading,
  onRefresh,
}: Props) {
  return (
    <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <div>
        <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-[#B52D32]">
          Administration
        </p>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Doctor applications
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Review applications before allowing doctors to provide services.
        </p>
      </div>

      <button
        type="button"
        onClick={onRefresh}
        disabled={loading}
        className="rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-semibold hover:bg-gray-50 disabled:opacity-50"
      >
        {loading ? "Refreshing..." : "Refresh applications"}
      </button>
    </div>
  );
}
