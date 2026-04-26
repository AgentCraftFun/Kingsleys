"use client";

import { useState } from "react";
import type { ValuationResult } from "@/lib/valuation";
import type { OutOfDatabaseResult } from "@/app/api/valuation/route";
import type { PublicAgency } from "./AgencyApp";

const PREFERRED_TIMES = [
  "Any weekday morning",
  "Any weekday afternoon",
  "Weekday evening (after 6pm)",
  "Saturday morning",
  "Saturday afternoon",
  "I'll suggest a time when you call",
];

export default function BookingForm({
  agency,
  result,
  outOfDb,
  onCancel,
  onSubmit,
  error,
}: {
  agency: PublicAgency;
  result: ValuationResult | null;
  outOfDb: OutOfDatabaseResult | null;
  onCancel: () => void;
  onSubmit: (data: {
    name: string;
    email: string;
    phone: string;
    preferredTime: string;
    message: string;
  }) => Promise<void> | void;
  error: string | null;
}) {
  // Reference both props so unused-variable lint doesn't flag them; they're
  // already consumed by the email payload server-side via AgencyApp.
  void result;
  void outOfDb;
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [preferredTime, setPreferredTime] = useState(PREFERRED_TIMES[0]);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const valid = name.trim().length > 1 && /\S+@\S+\.\S+/.test(email) && phone.trim().length >= 7;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid || submitting) return;
    setSubmitting(true);
    try {
      await onSubmit({ name: name.trim(), email: email.trim(), phone: phone.trim(), preferredTime, message: message.trim() });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="w-full">
      <div className="max-w-2xl mx-auto px-5 sm:px-8 pt-8 sm:pt-12 pb-20">
        <button
          onClick={onCancel}
          className="text-sm mb-4 underline underline-offset-4"
          style={{ color: "var(--agency-muted)" }}
        >
          ← Back to my report
        </button>

        <div className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--agency-muted)" }}>
          Book your valuation
        </div>
        <h1 className="mt-2 text-3xl sm:text-4xl font-semibold tracking-tight" style={{ color: "var(--agency-text)" }}>
          Meet with {agency.ctaPerson}.
        </h1>
        <p className="mt-3 text-base" style={{ color: "var(--agency-muted)" }}>
          A free, no-obligation 30-minute visit. {agency.ctaPersonShort} will walk round the
          property, refine the valuation, and leave you with a clear picture of what your home
          could achieve on the open market.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <Field label="Your name" htmlFor="name">
            <input
              id="name"
              type="text"
              autoComplete="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="field"
              placeholder="Jane Smith"
            />
          </Field>

          <Field label="Email" htmlFor="email">
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="field"
              placeholder="jane@example.com"
            />
          </Field>

          <Field label="Phone number" htmlFor="phone">
            <input
              id="phone"
              type="tel"
              autoComplete="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="field"
              placeholder="07xxx xxxxxx"
            />
          </Field>

          <Field label="When works best for you?" htmlFor="time">
            <select
              id="time"
              value={preferredTime}
              onChange={(e) => setPreferredTime(e.target.value)}
              className="field"
            >
              {PREFERRED_TIMES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Anything we should know? (optional)" htmlFor="message">
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              className="field"
              placeholder="e.g. I've got a buyer interested privately, or we're looking to move in the next 3 months."
            />
          </Field>

          {error && (
            <div
              className="text-sm rounded-md px-4 py-3"
              style={{ background: "#fff4f0", color: "#7a1f1f", border: "1px solid #fad2c6" }}
            >
              {error}
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={!valid || submitting}
              className="agency-btn-primary w-full sm:w-auto rounded-full px-8 py-4 text-base font-medium"
            >
              {submitting ? "Sending…" : `Request my valuation with ${agency.ctaPersonShort}`}
            </button>
            <p className="mt-3 text-xs" style={{ color: "var(--agency-muted)" }}>
              By submitting, you agree to {agency.name} getting in touch about your property. We won't share your details.
            </p>
          </div>
        </form>
      </div>

      <style jsx>{`
        .field {
          width: 100%;
          background: #ffffff;
          border: 1px solid var(--agency-border);
          border-radius: 12px;
          padding: 14px 16px;
          font-size: 16px;
          color: var(--agency-text);
          outline: none;
          transition: border-color 150ms ease, box-shadow 150ms ease;
        }
        .field:focus {
          border-color: var(--agency-primary);
          box-shadow: 0 0 0 3px rgba(20, 28, 59, 0.12);
        }
      `}</style>
    </section>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <label htmlFor={htmlFor} className="block">
      <span className="block text-sm font-medium mb-1.5" style={{ color: "var(--agency-text)" }}>
        {label}
      </span>
      {children}
    </label>
  );
}
