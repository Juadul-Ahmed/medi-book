
import Link from "next/link";
import {
  FiArrowRight,
  FiCalendar,
  FiHeart,
  FiShield,
  FiUsers,
} from "react-icons/fi";

const values = [
  {
    icon: FiHeart,
    title: "Patient first",
    description:
      "We put patients at the center of every decision, making it easier to find care and manage appointments.",
  },
  {
    icon: FiShield,
    title: "Trust and privacy",
    description:
      "We aim to provide a secure, reliable experience for patients and healthcare professionals.",
  },
  {
    icon: FiUsers,
    title: "Care for everyone",
    description:
      "We want to make discovering healthcare professionals and accessing appointments more convenient.",
  },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#F8FAF8] text-slate-900">
      <section className="relative overflow-hidden bg-white">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 md:grid-cols-2 md:px-10 md:py-28">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-green-50 px-4 py-2 text-sm font-semibold text-[#166534]">
              <FiHeart />
              About MediBook
            </span>

            <h1 className="mt-6 max-w-xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Better access to care starts{" "}
              <span className="text-[#166534]">
                with a simpler booking.
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
              MediBook helps patients discover healthcare professionals and
              request appointments through a clear, convenient online
              experience.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/doctors"
                className="inline-flex items-center gap-2 rounded-xl bg-[#166534] px-6 py-3.5 font-semibold text-white transition hover:bg-[#14532D]"
              >
                Find a doctor <FiArrowRight />
              </Link>

              <Link
                href="/contact"
                className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-6 py-3.5 font-semibold text-slate-700 transition hover:border-[#166534] hover:text-[#166534]"
              >
                Contact us
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-green-100 blur-3xl" />

            <div className="relative rounded-3xl bg-[#166534] p-8 text-white shadow-xl sm:p-12">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15">
                <FiCalendar className="h-8 w-8" />
              </div>

              <h2 className="mt-8 text-3xl font-bold">
                Healthcare appointments, made simpler.
              </h2>

              <p className="mt-4 leading-7 text-white/85">
                Find a professional, choose an available time, and keep track
                of your appointment requests in one place.
              </p>

              <div className="mt-8 border-t border-white/20 pt-6">
                <p className="text-sm font-medium text-white/75">
                  Our goal
                </p>
                <p className="mt-2 text-xl font-semibold">
                  Less time arranging care. More focus on wellbeing.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 md:px-10 md:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#166534]">
            Why MediBook
          </p>

          <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Built around a better care experience
          </h2>

          <p className="mt-5 text-lg leading-8 text-slate-600">
            Booking healthcare should feel straightforward. MediBook brings
            essential appointment steps into one accessible platform.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {values.map((value) => {
            const Icon = value.icon;

            return (
              <article
                key={value.title}
                className="rounded-2xl border border-slate-200/80 bg-white p-7 transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-[#166534]">
                  <Icon className="h-6 w-6" />
                </div>

                <h3 className="mt-5 text-xl font-bold">{value.title}</h3>

                <p className="mt-3 leading-7 text-slate-600">
                  {value.description}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="px-6 pb-20 md:px-10 md:pb-24">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200/70 sm:p-12 md:flex-row md:items-center">
          <div>
            <h2 className="text-2xl font-bold sm:text-3xl">
              Have questions about MediBook?
            </h2>

            <p className="mt-3 max-w-2xl leading-7 text-slate-600">
              We welcome your feedback and questions about the platform.
            </p>
          </div>

          <Link
            href="/contact"
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-[#166534] px-6 py-3.5 font-semibold text-white transition hover:bg-[#14532D]"
          >
            Get in touch <FiArrowRight />
          </Link>
        </div>
      </section>
    </main>
  );
}
