"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@heroui/react";
import { DoctorProfilePhoto } from "@/components/doctors/doctor-profile-photo";
import { FormField, TextAreaField } from "@/components/ui/form-fields";

type Specialty = { id: string; name: string };

type Profile = {
  specialtyId: string;
  licenseNumber: string;
  bio: string | null;
  consultationFee: string;
  timezone: string;
  approved: boolean;
  reviewStatus: "PENDING" | "APPROVED" | "REJECTED";
  user: { name: string; email: string; image: string | null };
  specialty: { name: string };
};

export default function DoctorProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [form, setForm] = useState({
    name: "",
    specialtyId: "",
    bio: "",
    consultationFee: "",
    timezone: "Asia/Shanghai",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function update<K extends keyof typeof form>(
    key: K,
    value: (typeof form)[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  useEffect(() => {
    async function load() {
      try {
        const [p, s] = await Promise.all([
          fetch("/api/doctor/profile"),
          fetch("/api/specialties"),
        ]);
        const pd = await p.json();
        const sd = await s.json();

        if (!p.ok) throw new Error(pd.error || "Could not load profile.");
        if (!s.ok) throw new Error(sd.error || "Could not load specialties.");

        const current: Profile = pd.profile;
        setProfile(current);
        setSpecialties(sd.specialties ?? []);
        setForm({
          name: current.user.name,
          specialtyId: current.specialtyId,
          bio: current.bio ?? "",
          consultationFee: current.consultationFee,
          timezone: current.timezone,
        });
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not load profile.");
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const response = await fetch("/api/doctor/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();

      if (!response.ok) {
        const details = data.details
          ? Object.values(data.details).flat().join(" ")
          : "";
        throw new Error(details || data.error || "Profile update failed.");
      }

      setProfile((current) =>
        current
          ? {
              ...current,
              specialtyId: form.specialtyId,
              bio: form.bio,
              consultationFee: form.consultationFee,
              timezone: form.timezone,
              user: { ...current.user, name: form.name },
            }
          : current,
      );
      setSuccess(data.message || "Profile updated successfully.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save profile.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p>Loading profile...</p>;
  if (!profile) return <p role="alert">{error || "Profile not found."}</p>;

  const status = profile.approved
    ? "Approved"
    : profile.reviewStatus === "REJECTED"
      ? "Rejected"
      : "Pending approval";

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header>
        <h1 className="text-2xl font-bold">My Profile</h1>
        <p className="text-sm text-gray-500">
          Manage your personal and professional information.
        </p>
      </header>

      <section className="rounded-xl border bg-white p-5">
        <p className="font-semibold">{status}</p>
        <p className="text-sm text-gray-500">
          License: {profile.licenseNumber}
        </p>
      </section>

      <DoctorProfilePhoto name={form.name} image={profile.user.image} />

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-2xl border bg-white p-6"
      >
        <FormField
          label="Full name"
          value={form.name}
          onChange={(v) => update("name", v)}
          required
          maxLength={100}
        />
        <FormField label="Email" value={profile.user.email} readOnly />

        <label className="block space-y-2">
          <span className="text-sm font-medium">Specialty</span>
          <select
            value={form.specialtyId}
            onChange={(e) => update("specialtyId", e.target.value)}
            required
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm"
          >
            <option value="">Select specialty</option>
            {specialties.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>

        <FormField
          label="Consultation fee"
          type="number"
          value={form.consultationFee}
          onChange={(v) => update("consultationFee", v)}
          required
          min="0.01"
          step="0.01"
        />
        <FormField
          label="Time zone"
          value={form.timezone}
          onChange={(v) => update("timezone", v)}
          required
          placeholder="Asia/Shanghai"
          maxLength={100}
        />
        <TextAreaField
          label="Biography"
          value={form.bio}
          onChange={(v) => update("bio", v)}
          maxLength={2000}
          placeholder="Your experience and approach to patient care."
        />

        {error && (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}
        {success && (
          <p role="status" className="text-sm text-green-700">
            {success}
          </p>
        )}

        <Button
          type="submit"
          isDisabled={saving}
          className="bg-green-700 text-white hover:bg-green-800"
        >
          {saving ? "Saving..." : "Save changes"}
        </Button>
      </form>
    </div>
  );
}
