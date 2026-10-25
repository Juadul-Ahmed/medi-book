"use client";

import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

const specialties = [
  {
    number: "01",
    name: "General Medicine",
    description: "Everyday health and preventive care",
    slug: "general-medicine",
  },
  {
    number: "02",
    name: "Cardiology",
    description: "Heart health and cardiovascular care",
    slug: "cardiology",
  },
  {
    number: "03",
    name: "Dermatology",
    description: "Skin, hair, and nail conditions",
    slug: "dermatology",
  },
  {
    number: "04",
    name: "Pediatrics",
    description: "Care for infants, children, and teens",
    slug: "pediatrics",
  },
  {
    number: "05",
    name: "Neurology",
    description: "Brain and nervous system care",
    slug: "neurology",
  },
  {
    number: "06",
    name: "Orthopedics",
    description: "Bones, joints, and movement",
    slug: "orthopedics",
  },
];

// Demo copy: replace with genuine patient feedback before production.
const testimonials = [
  {
    quote:
      "Finding a doctor no longer feels overwhelming. I can explore my options and plan my visit in one place.",
    name: "A patient",
    detail: "Finding the right care",
  },
  {
    quote:
      "The booking process is straightforward. I can focus on my health instead of worrying about arranging an appointment.",
    name: "A patient",
    detail: "A simpler booking experience",
  },
  {
    quote:
      "Being able to compare specialties helps me understand where to start and what kind of care to look for.",
    name: "A patient",
    detail: "Exploring specialties",
  },
  {
    quote:
      "Having my appointment information together makes it easier to stay organized and feel prepared for my visit.",
    name: "A patient",
    detail: "Managing appointments",
  },
  {
    quote:
      "A clear, calm experience makes an important task feel a little less stressful. That's what I appreciate most.",
    name: "A patient",
    detail: "A more reassuring experience",
  },
];

export function MedicalSpecialties() {
  const reduceMotion = useReducedMotion();
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  useEffect(() => {
    if (reduceMotion) return;

    const interval = window.setInterval(() => {
      setActiveTestimonial((current) => (current + 1) % testimonials.length);
    }, 5000);

    return () => window.clearInterval(interval);
  }, [reduceMotion]);

  const showTestimonial = (index: number) => {
    setActiveTestimonial((index + testimonials.length) % testimonials.length);
  };

  const testimonial = testimonials[activeTestimonial];

  return (
    <section className="bg-[#F8FAF8] px-5 py-20 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          {/* Left column */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#477453]">
              Find your specialty
            </p>

            <h2 className="mt-5 max-w-lg text-4xl font-medium leading-[1.06] tracking-[-0.055em] text-[#193B29] sm:text-5xl">
              The right expertise makes a difference.
            </h2>

            <p className="mt-5 max-w-md text-base leading-7 text-[#657167]">
              Start with what you need. Explore medical specialties and find the
              care that feels right for you.
            </p>

            <Link
              href="/doctors"
              className="group mt-7 inline-flex min-h-12 items-center justify-center gap-4 rounded-lg bg-[#166534] px-5 py-3 text-sm font-semibold text-white transition-colors duration-300 hover:bg-[#14532D] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#166534]"
            >
              Explore all doctors
              <span
                aria-hidden="true"
                className="text-lg transition-transform duration-300 group-hover:translate-x-1"
              >
                →
              </span>
            </Link>

            {/* Testimonial carousel */}
            <div
              className="mt-10 border-t border-[#DCE4DB] pt-6 sm:mt-12"
              aria-label="Patient testimonials"
              aria-roledescription="carousel"
              onMouseEnter={() => {
                // Rotation continues unless the user chooses a control.
              }}
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#477453]">
                  Patient stories
                </p>

                <span className="text-xs tabular-nums text-[#8A9A8B]">
                  {String(activeTestimonial + 1).padStart(2, "0")}
                  {" / "}
                  {String(testimonials.length).padStart(2, "0")}
                </span>
              </div>

              <div className="relative mt-5 min-h-[190px] sm:min-h-[175px]">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={activeTestimonial}
                    initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
                    transition={{
                      duration: reduceMotion ? 0 : 0.4,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    aria-live="polite"
                    aria-atomic="true"
                  >
                    <span
                      aria-hidden="true"
                      className="font-serif text-5xl leading-none text-[#8BA991]"
                    >
                      “
                    </span>

                    <blockquote className="-mt-1 text-lg leading-8 tracking-[-0.02em] text-[#31513A]">
                      {testimonial.quote}
                    </blockquote>

                    <div className="mt-5">
                      <p className="text-sm font-semibold text-[#244631]">
                        {testimonial.name}
                      </p>
                      <p className="mt-1 text-xs text-[#778278]">
                        {testimonial.detail}
                      </p>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-[#DCE4DB] pt-4">
                {/* Slide indicators */}
                <div className="flex items-center gap-2">
                  {testimonials.map((item, index) => (
                    <button
                      key={item.detail}
                      type="button"
                      onClick={() => showTestimonial(index)}
                      aria-label={`Show testimonial ${index + 1}`}
                      aria-pressed={activeTestimonial === index}
                      className={`h-1.5 rounded-full transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#166534] ${
                        activeTestimonial === index
                          ? "w-7 bg-[#166534]"
                          : "w-1.5 bg-[#C6D2C5] hover:bg-[#7F9A82]"
                      }`}
                    />
                  ))}
                </div>

                {/* Previous / next controls */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => showTestimonial(activeTestimonial - 1)}
                    aria-label="Previous testimonial"
                    className="flex size-9 items-center justify-center rounded-full border border-[#DCE4DB] text-[#315A3C] transition-colors hover:bg-[#EAF0E8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#166534]"
                  >
                    <span aria-hidden="true">←</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => showTestimonial(activeTestimonial + 1)}
                    aria-label="Next testimonial"
                    className="flex size-9 items-center justify-center rounded-full border border-[#DCE4DB] text-[#315A3C] transition-colors hover:bg-[#EAF0E8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#166534]"
                  >
                    <span aria-hidden="true">→</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right column: specialty list */}
          <div className="border-t border-[#DCE4DB]">
            {specialties.map((specialty, index) => (
              <motion.div
                key={specialty.slug}
                initial={reduceMotion ? false : { opacity: 0, x: 22 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{
                  duration: reduceMotion ? 0 : 0.55,
                  delay: reduceMotion ? 0 : index * 0.07,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <Link
                  href={`/doctors?specialty=${specialty.slug}`}
                  className="group grid grid-cols-[36px_1fr_24px] items-center gap-3 border-b border-[#DCE4DB] py-5 transition-colors duration-300 hover:bg-[#EFF4ED] sm:grid-cols-[44px_1fr_30px] sm:gap-5 sm:py-6"
                >
                  <span className="text-xs tabular-nums text-[#8A9A8B]">
                    {specialty.number}
                  </span>

                  <span>
                    <span className="block text-lg font-medium tracking-tight text-[#244631] transition-transform duration-300 group-hover:translate-x-1 sm:text-xl">
                      {specialty.name}
                    </span>
                    <span className="mt-1 block text-sm leading-6 text-[#778278]">
                      {specialty.description}
                    </span>
                  </span>

                  <span
                    aria-hidden="true"
                    className="text-xl text-[#477453] transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1"
                  >
                    ↗
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
