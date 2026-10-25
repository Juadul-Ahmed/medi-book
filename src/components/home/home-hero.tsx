"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { useSession } from "@/lib/auth-client";

export function HomeHero() {
  const { data: session, isPending } = useSession();
  const user = isPending ? undefined : session?.user;
  const reduceMotion = useReducedMotion();

  const dashboardLink =
    user?.role === "ADMIN"
      ? "/admin"
      : user?.role === "DOCTOR"
        ? "/doctor"
        : "/appointments";

  const dashboardLabel =
    user?.role === "ADMIN"
      ? "Admin dashboard"
      : user?.role === "DOCTOR"
        ? "Doctor dashboard"
        : "My appointments";

  const entrance = (delay: number) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 18 },
          animate: { opacity: 1, y: 0 },
          transition: {
            duration: 0.7,
            delay,
            ease: [0.22, 1, 0.36, 1] as const,
          },
        };

  return (
    <section className="overflow-hidden rounded-2xl bg-[#F0F3EC]">
      <div className="grid lg:min-h-[590px] lg:grid-cols-[1.05fr_0.95fr]">
        {/* Copy and actions */}
        <div className="flex flex-col justify-center px-6 py-14 sm:px-10 sm:py-16 lg:px-14 lg:py-20 xl:px-16">
          <motion.p
            {...entrance(0.05)}
            className="text-sm font-medium text-[#477453]"
          >
            Healthcare, made more personal.
          </motion.p>

          <motion.h1
            {...entrance(0.13)}
            className="mt-7 max-w-xl text-5xl font-semibold leading-[1.02] tracking-[-0.065em] text-[#193B29] sm:text-6xl xl:text-7xl"
          >
            Your health.
            <br />
            Your time.
            <br />
            <span className="text-[#568064]">Your choice.</span>
          </motion.h1>

          <motion.p
            {...entrance(0.23)}
            className="mt-7 max-w-md text-base leading-7 text-[#5F6E61] sm:text-lg sm:leading-8"
          >
            Find the right doctor, explore available appointments, and manage
            your care in one place.
          </motion.p>

          <motion.div
            {...entrance(0.33)}
            className="mt-9 flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:gap-6"
          >
            <Link
              href="/doctors"
              className="group inline-flex min-h-14 items-center justify-center gap-5 rounded-lg bg-[#166534] px-6 text-sm font-semibold text-white transition-colors duration-300 hover:bg-[#14532D] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#166534]"
            >
              Find a doctor
              <span
                aria-hidden="true"
                className="text-lg transition-transform duration-300 group-hover:translate-x-1"
              >
                →
              </span>
            </Link>

            {user ? (
              <Link
                href={dashboardLink}
                className="text-sm font-semibold text-[#315A3C] underline decoration-[#B4C6B4] underline-offset-4 transition-colors hover:text-[#193B29]"
              >
                {dashboardLabel}
              </Link>
            ) : (
              <Link
                href="/register"
                className="text-sm font-semibold text-[#315A3C] underline decoration-[#B4C6B4] underline-offset-4 transition-colors hover:text-[#193B29]"
              >
                Create an account
              </Link>
            )}
          </motion.div>

          <motion.div
            {...entrance(0.42)}
            className="mt-12 border-t border-[#D7DED3] pt-5"
          >
            <Link
              href="/doctors"
              className="group inline-flex items-center gap-3 text-sm text-[#657167] transition-colors hover:text-[#193B29]"
            >
              Looking for a specialist?
              <span
                aria-hidden="true"
                className="text-[#477453] transition-transform duration-300 group-hover:translate-x-1"
              >
                →
              </span>
            </Link>
          </motion.div>
        </div>

        {/* Quiet photographic panel */}
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, scale: 1.035 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: reduceMotion ? 0 : 1.1,
            delay: reduceMotion ? 0 : 0.12,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="relative min-h-[340px] overflow-hidden bg-[#DDE6DA] sm:min-h-[440px] lg:min-h-full"
        >
          <div>
            <Image
              src="/images/hero1.jpg"
              alt="MediBook"
              fill
              className="object-cover"
            />
          </div>

          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-[#193B29]/15 to-transparent"
          />
        </motion.div>
      </div>
    </section>
  );
}
