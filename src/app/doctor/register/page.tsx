
"use client";

import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import Link from "next/link";
import { Button } from "@heroui/react";

type Specialty = {
  id: string;
  name: string;
};

type TextFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  step?: string;
};

function TextField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
  minLength,
  maxLength,
  min,
  step,
}: TextFieldProps) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-gray-800">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event: ChangeEvent<HTMLInputElement>) =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
        required={required}
        minLength={minLength}
        maxLength={maxLength}
        min={min}
        step={step}
        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[#B52D32] focus:ring-2 focus:ring-[#B52D32]/15"
      />
    </label>
  );
}

type TextAreaFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
};

function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
  maxLength,
}: TextAreaFieldProps) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-gray-800">{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        rows={4}
        className="w-full resize-y rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[#B52D32] focus:ring-2 focus:ring-[#B52D32]/15"
      />
    </label>
  );
}

export default function DoctorRegisterPage() {
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [specialtyId, setSpecialtyId] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [bio, setBio] = useState("");
  const [consultationFee, setConsultationFee] = useState("150");
  const [timezone, setTimezone] = useState("Asia/Shanghai");

  const [loadingSpecialties, setLoadingSpecialties] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function loadSpecialties() {
      try {
        const response = await fetch("/api/specialties");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Could not load specialties.");
        }

        setSpecialties(data.specialties ?? []);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Could not load medical specialties."
        );
      } finally {
        setLoadingSpecialties(false);
      }
    }

    void loadSpecialties();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!specialtyId) {
      setError("Please select a medical specialty.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/doctor/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          specialtyId,
          licenseNumber,
          bio,
          consultationFee: Number(consultationFee),
          timezone,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const fieldErrors = data.details
          ? Object.values(data.details).flat().join(" ")
          : "";

        throw new Error(
          fieldErrors || data.error || "Doctor registration failed."
        );
      }

      setSuccess(
        data.message ||
          "Registration submitted. Your account is awaiting admin approval."
      );

      setName("");
      setEmail("");
      setPassword("");
      setLicenseNumber("");
      setBio("");
      setConsultationFee("150");
      setSpecialtyId("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#FAF9F6] px-4 py-12 text-[#242424]">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/"
          className="text-sm font-medium text-[#B52D32] hover:underline"
        >
          ← Back to MediBook
        </Link>

        <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-9">
          <p className="text-sm font-semibold uppercase tracking-wider text-[#B52D32]">
            Join MediBook
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            Doctor registration
          </h1>

          <p className="mt-3 text-sm leading-6 text-gray-600">
            Create your professional account. An administrator must approve
            your profile before you can provide services through MediBook.
          </p>

          {error && (
            <div
              role="alert"
              className="mt-6 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          {success && (
            <div
              role="status"
              className="mt-6 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800"
            >
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <TextField
              label="Full name"
              placeholder="Dr. Alex Smith"
              value={name}
              onChange={setName}
              required
              minLength={2}
              maxLength={100}
            />

            <TextField
              label="Email address"
              type="email"
              placeholder="doctor@example.com"
              value={email}
              onChange={setEmail}
              required
              maxLength={254}
            />

            <TextField
              label="Password"
              type="password"
              placeholder="At least 12 characters"
              value={password}
              onChange={setPassword}
              required
              minLength={12}
              maxLength={128}
            />

            <label className="block space-y-2">
              <span className="text-sm font-medium text-gray-800">
                Medical specialty
              </span>

              <select
                value={specialtyId}
                onChange={(event) => setSpecialtyId(event.target.value)}
                required
                disabled={loadingSpecialties || specialties.length === 0}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#B52D32] focus:ring-2 focus:ring-[#B52D32]/15 disabled:cursor-not-allowed disabled:bg-gray-100"
              >
                <option value="">
                  {loadingSpecialties
                    ? "Loading specialties..."
                    : specialties.length === 0
                      ? "No specialties available"
                      : "Select your specialty"}
                </option>

                {specialties.map((specialty) => (
                  <option key={specialty.id} value={specialty.id}>
                    {specialty.name}
                  </option>
                ))}
              </select>
            </label>

            <TextField
              label="Medical license number"
              placeholder="Enter your license number"
              value={licenseNumber}
              onChange={setLicenseNumber}
              required
              minLength={3}
              maxLength={100}
            />

            <TextField
              label="Consultation fee"
              type="number"
              value={consultationFee}
              onChange={setConsultationFee}
              required
              min={0.01}
              step="0.01"
            />

            <TextField
              label="Time zone"
              placeholder="Asia/Shanghai"
              value={timezone}
              onChange={setTimezone}
              required
            />

            <TextAreaField
              label="Professional bio"
              placeholder="Describe your experience and areas of practice."
              value={bio}
              onChange={setBio}
              maxLength={2000}
            />

            <Button
              type="submit"
              isDisabled={
                submitting ||
                loadingSpecialties ||
                specialties.length === 0
              }
              className="w-full bg-[#B52D32] font-semibold text-white"
            >
              {submitting ? "Submitting..." : "Submit registration"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Already registered?{" "}
            <Link
              href="/login"
              className="font-semibold text-[#B52D32] hover:underline"
            >
              Sign in
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
