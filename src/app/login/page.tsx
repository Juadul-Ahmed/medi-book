
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@heroui/react";

import { signIn } from "@/lib/auth-client";
import { AuthCard } from "@/components/auth/auth-card";
import { FormField } from "@/components/auth/form-field";

const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: LoginFormValues) {
    setServerError("");

    try {
      const result = await signIn.email({
        email: values.email.trim().toLowerCase(),
        password: values.password,
      });

      if (result.error) {
        setServerError(
          result.error.message || "Unable to sign in. Check your credentials.",
        );
        return;
      }

      router.replace("/");
      router.refresh();
    } catch {
      setServerError("Something went wrong. Please try again.");
    }
  }

  return (
    <AuthCard
      title="Welcome back"
      description="Sign in to manage your medical appointments."
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-semibold text-rose-800 hover:underline"
          >
            Create a patient account
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
          autoComplete="current-password"
          placeholder="Enter your password"
          {...register("password")}
          error={errors.password}
        />

        {serverError && (
          <p
            role="alert"
            className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
          >
            {serverError}
          </p>
        )}

        <Button
          type="submit"
          fullWidth
          isDisabled={isSubmitting}
          className="bg-rose-800 font-semibold text-white hover:bg-rose-900"
        >
          {isSubmitting ? "Signing in..." : "Sign in"}
        </Button>
      </form>
    </AuthCard>
  );
}
