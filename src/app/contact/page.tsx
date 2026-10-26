
"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import {
  FiArrowLeft,
  FiArrowRight,
  FiCheckCircle,
  FiMail,
  FiMessageCircle,
} from "react-icons/fi";

const CONTACT_EMAIL = "juadulahmed9@gmail.com";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const subject = String(formData.get("subject") ?? "").trim();
    const message = String(formData.get("message") ?? "").trim();

    const emailSubject = encodeURIComponent(`[MediBook Contact] ${subject}`);
    const emailBody = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
    );

    window.location.href =
      `mailto:${CONTACT_EMAIL}?subject=${emailSubject}&body=${emailBody}`;

    setSubmitted(true);
  }

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition placeholder:text-slate-400 focus:border-[#166534] focus:ring-4 focus:ring-green-100";

  return (
    <main className="min-h-screen bg-[#F8FAF8] text-slate-900">
      <section className="border-b border-green-100 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-16 md:px-10 md:py-20">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-[#166534]"
          >
            <FiArrowLeft />
            Back to home
          </Link>

          <div className="mt-8 max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-green-50 px-4 py-2 text-sm font-semibold text-[#166534]">
              <FiMessageCircle />
              Contact MediBook
            </span>

            <h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl">
              We&apos;re here to{" "}
              <span className="text-[#166534]">listen.</span>
            </h1>

            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
              Have a question, feedback, or need help using MediBook? Send us
              a message and we&apos;ll be glad to hear from you.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-[0.8fr_1.2fr] md:px-10 md:py-20">
        <aside>
          <h2 className="text-2xl font-bold">Get in touch</h2>

          <p className="mt-3 leading-7 text-slate-600">
            Use the form to prepare a message for our team. You can also
            browse the platform to learn more about our services.
          </p>

          <div className="mt-8 rounded-2xl border border-green-100 bg-white p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-[#166534]">
              <FiMail className="h-6 w-6" />
            </div>

            <h3 className="mt-4 font-bold">Email us</h3>

            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="mt-2 block break-all text-sm leading-6 text-[#166534] transition hover:text-[#14532D] hover:underline"
            >
              {CONTACT_EMAIL}
            </a>

            <p className="mt-4 text-sm leading-6 text-slate-500">
              We welcome your questions and feedback.
            </p>
          </div>

          <div className="mt-6 rounded-2xl bg-[#166534] p-6 text-white shadow-sm">
            <h3 className="text-lg font-bold">Looking for a doctor?</h3>

            <p className="mt-2 text-sm leading-6 text-white/85">
              Explore the doctor directory to find a healthcare professional.
            </p>

            <Link
              href="/doctors"
              className="mt-5 inline-flex items-center gap-2 text-sm font-semibold transition hover:text-green-200"
            >
              Find doctors <FiArrowRight />
            </Link>
          </div>
        </aside>

        <div className="rounded-3xl border border-green-100 bg-white p-6 shadow-sm sm:p-9">
          <h2 className="text-2xl font-bold">Send us a message</h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Complete the form below to prepare an email to our team.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Your name
                </label>

                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  maxLength={100}
                  placeholder="Enter your name"
                  className={inputClass}
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Email address
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  maxLength={254}
                  placeholder="you@example.com"
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="subject"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Subject
              </label>

              <input
                id="subject"
                name="subject"
                type="text"
                required
                maxLength={150}
                placeholder="How can we help?"
                className={inputClass}
              />
            </div>

            <div>
              <label
                htmlFor="message"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Message
              </label>

              <textarea
                id="message"
                name="message"
                rows={6}
                required
                maxLength={5000}
                placeholder="Write your message here..."
                className={`${inputClass} resize-y`}
              />
            </div>

            <button
              type="submit"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#166534] px-6 py-3.5 font-semibold text-white transition hover:bg-[#14532D] focus:outline-none focus:ring-4 focus:ring-green-200 sm:w-auto"
            >
              Prepare email <FiArrowRight />
            </button>

            {submitted && (
              <p
                role="status"
                className="flex items-start gap-2 text-sm leading-6 text-slate-600"
              >
                <FiCheckCircle className="mt-1 shrink-0 text-[#166534]" />
                Your email application should open with your message prepared.
                Review it and send the email to complete your message.
              </p>
            )}
          </form>
        </div>
      </section>
    </main>
  );
}
