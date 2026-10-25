
"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { signUp } from "@/lib/auth-client";
import { FormField } from "./form-field";
import { AuthCard } from "./auth-card";
import {
  registerSchema,
  type RegisterFormValues,
} from "@/lib/validations/auth";

export function RegisterForm() {
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: RegisterFormValues) {
    setServerError("");
    setSuccessMessage("");

    try {
      const result = await signUp.email({
        name: values.name.trim(),
        email: values.email.trim().toLowerCase(),
        password: values.password,
      });

      if (result.error) {
        setServerError(
          result.error.message || "Registration failed. Please try again.",
        );
        return;
      }

      setSuccessMessage(
        "Your patient account has been created. You can now sign in.",
      );
    } catch {
      setServerError("Something went wrong. Please try again.");
    }
  }

  return (
    <AuthCard
      title="Create your patient account"
      description="Register to find doctors and manage your appointments."
      footer={
        <>
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-green-800 hover:underline"
          >
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          id="name"
          label="Full name"
          autoComplete="name"
          placeholder="Your full name"
          {...register("name")}
          error={errors.name}
        />

        <FormField
          id="email"
          label="Email address"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          {...register("email")}
          error={errors.email}
        />

        <FormField
          id="password"
          label="Password"
          type="password"
          autoComplete="new-password"
          placeholder="At least 12 characters"
          {...register("password")}
          error={errors.password}
        />

        <FormField
          id="confirmPassword"
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          placeholder="Enter your password again"
          {...register("confirmPassword")}
          error={errors.confirmPassword}
        />

        {serverError && (
          <p
            role="alert"
            className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
          >
            {serverError}
          </p>
        )}

        {successMessage && (
          <p
            role="status"
            className="rounded-lg bg-green-50 p-3 text-sm text-green-800"
          >
            {successMessage}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-green-800 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-900 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Creating account..." : "Create patient account"}
        </button>
      </form>
    </AuthCard>
  );
}
