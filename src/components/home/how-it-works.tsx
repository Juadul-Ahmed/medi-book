
import Link from "next/link";
import { Reveal } from "@/components/ui/reveal";

const steps = [
  {
    number: "01",
    title: "Start with your needs",
    description:
      "Browse the doctor directory and explore available specialties.",
  },
  {
    number: "02",
    title: "Find a suitable time",
    description:
      "Open a doctor's profile and review the available appointment slots.",
  },
  {
    number: "03",
    title: "Book with confidence",
    description:
      "Follow the booking flow and keep your appointment details together.",
  },
];

export function HowItWorks() {
  return (
    <section className="overflow-hidden bg-[#193B29] px-5 py-20 text-[#F8FAF8] sm:px-8 sm:py-28">
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <div className="grid gap-8 lg:grid-cols-[1fr_0.75fr] lg:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#B9D1B9]">
                A simpler process
              </p>

              <h2 className="mt-5 max-w-2xl text-4xl font-medium leading-[1.05] tracking-[-0.055em] sm:text-6xl">
                Three steps.
                <br />
                <span className="font-serif font-normal italic text-[#B9D1B9]">
                  A clearer way forward.
                </span>
              </h2>
            </div>

            <p className="max-w-md text-base leading-7 text-[#D0DCD1] lg:justify-self-end">
              From discovering a specialist to managing your booking,
              each step is designed to keep things clear.
            </p>
          </div>
        </Reveal>

        <div className="mt-16 grid border-t border-white/20 md:grid-cols-3">
          {steps.map((step, index) => (
            <Reveal
              key={step.number}
              delay={index * 0.1}
              className="h-full"
            >
              <article className="group h-full border-b border-white/20 py-8 md:border-b-0 md:border-r md:px-7 md:first:pl-0 md:last:border-r-0 md:last:pr-0">
                <div className="flex items-start justify-between">
                  <span className="text-sm tabular-nums text-[#B9D1B9]">
                    {step.number}
                  </span>

                  <span
                    aria-hidden="true"
                    className="text-2xl text-[#B9D1B9] transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
                  >
                    ↗
                  </span>
                </div>

                <h3 className="mt-10 text-2xl font-medium tracking-tight">
                  {step.title}
                </h3>

                <p className="mt-4 max-w-sm text-sm leading-7 text-[#D0DCD1]">
                  {step.description}
                </p>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.2}>
          <div className="mt-12 flex flex-wrap items-center justify-between gap-5 border-t border-white/20 pt-7">
            <p className="text-sm text-[#D0DCD1]">
              Ready to take the first step?
            </p>

            <Link
              href="/doctors"
              className="group inline-flex items-center gap-5 rounded-full bg-[#F0F3EC] px-6 py-4 text-sm font-semibold text-[#193B29] transition-colors duration-300 hover:bg-white"
            >
              Browse doctors
              <span
                aria-hidden="true"
                className="transition-transform duration-300 group-hover:translate-x-1"
              >
                →
              </span>
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
