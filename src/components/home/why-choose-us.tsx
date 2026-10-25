
import Link from "next/link";
import { Reveal } from "@/components/ui/reveal";

const principles = [
  {
    number: "01",
    title: "Find your fit",
    description:
      "Explore doctors by specialty and find someone suited to your needs.",
  },
  {
    number: "02",
    title: "Choose your time",
    description:
      "Review appointment availability and choose a time that works for you.",
  },
  {
    number: "03",
    title: "Stay in control",
    description:
      "Keep track of your appointments through your own MediBook account.",
  },
];

export function WhyChooseUs() {
  return (
    <section className="border-y border-[#E2E8E1] bg-white px-5 py-20 sm:px-8 sm:py-24">
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#477453]">
                A better way to navigate care
              </p>

              <h2 className="mt-5 max-w-md text-4xl font-medium leading-[1.08] tracking-[-0.055em] text-[#193B29] sm:text-5xl">
                Less time figuring it out. More time focusing on you.
              </h2>
            </div>

            <div className="flex flex-col justify-between">
              <p className="max-w-xl text-lg leading-8 text-[#657167]">
                Finding healthcare should feel straightforward.
                MediBook brings doctor discovery and appointment
                management into one considered experience.
              </p>

              <Link
                href="/doctors"
                className="mt-7 inline-flex w-fit items-center gap-3 rounded-full border border-[#B9C9BA] px-5 py-3 text-sm font-semibold text-[#245A35] transition-colors duration-300 hover:border-[#245A35] hover:bg-[#EFF4ED]"
              >
                Find your doctor
                <span aria-hidden="true">↗</span>
              </Link>
            </div>
          </div>
        </Reveal>

        <div className="mt-16 grid border-t border-[#DCE4DB] md:grid-cols-3">
          {principles.map((principle, index) => (
            <Reveal
              key={principle.number}
              delay={index * 0.09}
              className="h-full"
            >
              <article className="h-full border-b border-[#DCE4DB] py-7 md:border-b-0 md:border-r md:px-7 md:first:pl-0 md:last:border-r-0 md:last:pr-0">
                <span className="text-xs tabular-nums text-[#829183]">
                  {principle.number}
                </span>

                <h3 className="mt-5 text-2xl font-medium tracking-tight text-[#244631]">
                  {principle.title}
                </h3>

                <p className="mt-3 max-w-sm text-sm leading-7 text-[#68766A]">
                  {principle.description}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
