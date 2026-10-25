
"use client";

import { useRef, useState } from "react";
import Image from "next/image";

type DoctorProfilePhotoProps = {
  name: string;
  image: string | null;
};

export function DoctorProfilePhoto({
  name,
  image,
}: DoctorProfilePhotoProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState(image);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);

  async function handleUpload(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    setMessage("");
    setError(false);

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      setError(true);
      setMessage("Choose a JPEG, PNG, or WebP image.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError(true);
      setMessage("Your image must be 5 MB or smaller.");
      event.target.value = "";
      return;
    }

    const localPreview = URL.createObjectURL(file);
    setPreview(localPreview);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch("/api/doctor/profile-image", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok || !result.image) {
        throw new Error(result.error || "Image upload failed.");
      }

      setPreview(result.image);
      setMessage("Profile photo updated successfully.");
    } catch (err) {
      setPreview(image);
      setError(true);
      setMessage(
        err instanceof Error
          ? err.message
          : "Unable to upload your photo.",
      );
    } finally {
      URL.revokeObjectURL(localPreview);
      setUploading(false);

      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }

  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-6">
      <h2 className="text-lg font-semibold text-stone-900">
        Profile photo
      </h2>

      <p className="mt-1 text-sm text-stone-500">
        Add a professional photo so patients can recognize you.
      </p>

      <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-center">
        <div className="relative flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-full bg-green-100 text-3xl font-bold text-green-900">
          {preview ? (
            <Image
              src={preview}
              alt={`${name}'s profile photo`}
              fill
              unoptimized
              sizes="96px"
              className="object-cover"
            />
          ) : (
            name.charAt(0).toUpperCase()
          )}
        </div>

        <div>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleUpload}
            disabled={uploading}
            className="block w-full max-w-xs text-sm text-stone-600 file:mr-3 file:rounded-lg file:border-0 file:bg-green-800 file:px-4 file:py-2 file:font-semibold file:text-white hover:file:bg-green-900 disabled:opacity-50"
          />

          <p className="mt-2 text-xs text-stone-500">
            JPEG, PNG, or WebP · Maximum 5 MB
          </p>

          {uploading && (
            <p className="mt-3 text-sm text-green-800">
              Uploading your photo...
            </p>
          )}

          {message && (
            <p
              role={error ? "alert" : "status"}
              className={`mt-3 text-sm ${
                error ? "text-red-600" : "text-green-800"
              }`}
            >
              {message}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
