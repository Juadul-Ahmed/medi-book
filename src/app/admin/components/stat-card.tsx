
import type { IconType } from "react-icons";

type StatCardProps = {
  title: string;
  value: number;
  description: string;
  icon: IconType;
};

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
}: StatCardProps) {
  return (
    <article className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-stone-500">{title}</p>
          <p className="mt-3 text-3xl font-bold tracking-tight text-stone-900">
            {value.toLocaleString()}
          </p>
          <p className="mt-2 text-xs leading-5 text-stone-500">
            {description}
          </p>
        </div>

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-50 text-[#166534]">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </article>
  );
}
