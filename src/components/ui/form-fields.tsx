
"use client";

import type { ChangeEvent } from "react";

type FieldProps = {
  label: string;
  value: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  min?: string;
  step?: string;
  maxLength?: number;
  readOnly?: boolean;
  rows?: number;
};

const inputClass =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-green-700";

export function FormField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required,
  min,
  step,
  maxLength,
  readOnly,
}: FieldProps) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-gray-800">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          onChange?.(e.target.value)
        }
        placeholder={placeholder}
        required={required}
        min={min}
        step={step}
        maxLength={maxLength}
        readOnly={readOnly}
        className={`${inputClass} ${readOnly ? "bg-gray-50 text-gray-500" : ""}`}
      />
    </label>
  );
}

export function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
  maxLength,
  rows = 5,
}: FieldProps) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-gray-800">{label}</span>
      <textarea
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        rows={rows}
        className={`${inputClass} resize-y`}
      />
      {maxLength && (
        <span className="text-xs text-gray-500">
          {value.length}/{maxLength}
        </span>
      )}
    </label>
  );
}
