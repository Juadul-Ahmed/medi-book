
import type { InputHTMLAttributes } from "react";
import type { FieldError } from "react-hook-form";

type FormFieldProps = {
  id: string;
  label: string;
  error?: FieldError;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "id">;

export function FormField({
  id,
  label,
  error,
  className,
  ...inputProps
}: FormFieldProps) {
  const inputClassName = [
    "mt-1 w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition",
    "focus:border-rose-700 focus:ring-2 focus:ring-rose-100",
    error ? "border-red-500" : "border-gray-300",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="space-y-1">
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-800"
      >
        {label}
      </label>

      <input
        id={id}
        {...inputProps}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className={inputClassName}
      />

      {error?.message && (
        <p id={`${id}-error`} className="text-sm text-red-600">
          {error.message}
        </p>
      )}
    </div>
  );
}
