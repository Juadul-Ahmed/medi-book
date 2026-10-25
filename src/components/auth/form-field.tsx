
import type { InputHTMLAttributes } from "react";
import type { FieldError } from "react-hook-form";
import { Input } from "@heroui/react";

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
  return (
    <div className="space-y-1">
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-800"
      >
        {label}
      </label>

      <Input
        {...inputProps}
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className={["w-full", className].filter(Boolean).join(" ")}
      />

      {error?.message && (
        <p id={`${id}-error`} className="text-sm text-green-800">
          {error.message}
        </p>
      )}
    </div>
  );
}
