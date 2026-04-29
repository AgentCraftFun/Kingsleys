"use client";

import { useMemo, useState } from "react";
import type { ValuationResult } from "@/lib/valuation";
import type { OutOfDatabaseResult } from "@/app/api/valuation/route";
import type { PublicAgency } from "./AgencyApp";

export type SelectedSlot = {
  /** ISO yyyy-mm-dd, day-only (no timezone). */
  dateIso: string;
  /** "10:00" through "15:30". */
  time: string;
};

type SubmitData = {
  name: string;
  email: string;
  phone: string;
  preferredTime: string;
  message: string;
  slot: SelectedSlot;
};

const SLOT_TIMES = [
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
] as const;

/**
 * Deterministic "already booked" pattern. ~30% of slots come back booked
 * so the calendar looks lived-in rather than empty, but the pattern is
 * stable across renders (no flicker between SSR and client).
 */
function isSlotBooked(dayIndex: number, slotIndex: number): boolean {
  return ((dayIndex * 13 + slotIndex * 7) % 10) < 3;
}

type Day = {
  /** ISO yyyy-mm-dd. */
  iso: string;
  /** "Mon" / "Tue" etc. */
  weekdayShort: string;
  /** "28 Apr" etc. */
  dayMonth: string;
  /** Index into the chronological weekday list, used by isSlotBooked. */
  index: number;
};

function buildWeekdayList(): Day[] {
  // 14 calendar days starting tomorrow, weekends filtered out.
  const days: Day[] = [];
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() + 1);
  let weekdayIndex = 0;
  for (let i = 0; i < 14; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const dow = d.getDay();
    if (dow === 0 || dow === 6) continue; // Sun / Sat
    days.push({
      iso: toIsoDate(d),
      weekdayShort: d.toLocaleDateString("en-GB", { weekday: "short" }),
      dayMonth: d.toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
      index: weekdayIndex++,
    });
  }
  return days;
}

function toIsoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatSelectedLabel(slot: SelectedSlot): string {
  const d = new Date(slot.dateIso + "T00:00:00");
  if (Number.isNaN(d.getTime())) return `${slot.dateIso} at ${slot.time}`;
  const weekday = d.toLocaleDateString("en-GB", { weekday: "long" });
  const dayMonth = d.toLocaleDateString("en-GB", { day: "numeric", month: "long" });
  return `${weekday}, ${dayMonth} at ${slot.time}`;
}

export default function SlotPicker({
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
  onSubmit: (data: SubmitData) => Promise<void> | void;
  error: string | null;
}) {
  void result;
  void outOfDb;

  const days = useMemo(buildWeekdayList, []);

  const [selected, setSelected] = useState<SelectedSlot | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const contactValid =
    name.trim().length > 1 && /\S+@\S+\.\S+/.test(email) && phone.trim().length >= 7;
  const valid = contactValid && selected !== null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid || submitting || !selected) return;
    setSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        message: message.trim(),
        // Mirror the chosen slot into preferredTime so the existing
        // BookingForm-shaped email payload still has a human-readable
        // time string in the historical field.
        preferredTime: formatSelectedLabel(selected),
        slot: selected,
      });
    } finally {
      setSubmitting(false);
    }
  }

  const ctaLabel = agency.audience === "landlord" ? "appraisal" : "valuation";

  return (
    <section className="w-full">
      <div className="max-w-3xl mx-auto px-5 sm:px-8 pt-8 sm:pt-12 pb-20">
        <button
          onClick={onCancel}
          className="text-sm mb-4 underline underline-offset-4"
          style={{ color: "var(--agency-muted)" }}
        >
          ← Back to my report
        </button>

        <div
          className="text-xs font-medium uppercase tracking-wider"
          style={{ color: "var(--agency-muted)" }}
        >
          {agency.audience === "landlord" ? "Book your appraisal" : "Book your valuation"}
        </div>
        <h1
          className="mt-2 text-3xl sm:text-4xl font-semibold tracking-tight"
          style={{ color: "var(--agency-text)" }}
        >
          Pick a time with {agency.ctaPerson}.
        </h1>
        <p className="mt-3 text-base" style={{ color: "var(--agency-muted)" }}>
          {agency.audience === "landlord"
            ? `30-minute landlord appraisal at the property. ${agency.ctaPersonShort} will walk round, advise on achievable rent and presentation, and leave you with a clear picture of what the investment can do.`
            : `30-minute visit at the property. ${agency.ctaPersonShort} will walk round, refine the valuation and leave you with a clear picture of what your home could achieve on the open market.`}
        </p>

        <div className="mt-8 space-y-3">
          {days.map((day) => (
            <DayRow
              key={day.iso}
              day={day}
              selected={selected}
              onPick={(time) => setSelected({ dateIso: day.iso, time })}
            />
          ))}
        </div>

        {/* Selected confirmation banner — sticks above the contact form so
            the user always sees what they're booking when scrolling. */}
        <div
          className="mt-8 rounded-2xl p-4 sm:p-5"
          style={{
            background: selected ? "var(--agency-primary)" : "#ffffff",
            color: selected ? "#ffffff" : "var(--agency-muted)",
            border: `1px solid ${selected ? "var(--agency-primary)" : "var(--agency-border)"}`,
          }}
        >
          <div className="text-xs font-medium uppercase tracking-wider opacity-80">
            {selected ? "You're booking" : "No slot selected yet"}
          </div>
          <div className="mt-1 text-base sm:text-lg font-medium">
            {selected ? formatSelectedLabel(selected) : "Tap an available time above to continue."}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <Field label="Your name" htmlFor="sp-name">
            <input
              id="sp-name"
              type="text"
              autoComplete="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="field"
              placeholder="Jane Smith"
            />
          </Field>

          <Field label="Email" htmlFor="sp-email">
            <input
              id="sp-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="field"
              placeholder="jane@example.com"
            />
          </Field>

          <Field label="Phone number" htmlFor="sp-phone">
            <input
              id="sp-phone"
              type="tel"
              autoComplete="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="field"
              placeholder="07xxx xxxxxx"
            />
          </Field>

          <Field label="Anything we should know? (optional)" htmlFor="sp-message">
            <textarea
              id="sp-message"
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
              style={{
                background: "#fff4f0",
                color: "#7a1f1f",
                border: "1px solid #fad2c6",
              }}
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
              {submitting
                ? "Sending…"
                : selected
                  ? `Confirm my ${ctaLabel} for ${selected.time}`
                  : `Pick a slot to confirm`}
            </button>
            <p className="mt-3 text-xs" style={{ color: "var(--agency-muted)" }}>
              By submitting, you agree to {agency.name} getting in touch about your
              property. We won't share your details.
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

function DayRow({
  day,
  selected,
  onPick,
}: {
  day: Day;
  selected: SelectedSlot | null;
  onPick: (time: string) => void;
}) {
  return (
    <div
      className="rounded-2xl p-4 sm:p-5"
      style={{
        background: "#ffffff",
        border: "1px solid var(--agency-border)",
      }}
    >
      <div className="flex items-baseline justify-between gap-2 mb-3">
        <div className="text-base sm:text-lg font-semibold" style={{ color: "var(--agency-text)" }}>
          {day.weekdayShort} {day.dayMonth}
        </div>
        <div className="text-xs" style={{ color: "var(--agency-muted)" }}>
          {countAvailable(day.index)} of {SLOT_TIMES.length} available
        </div>
      </div>
      <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
        {SLOT_TIMES.map((time, slotIndex) => {
          const booked = isSlotBooked(day.index, slotIndex);
          const isSelected =
            !!selected && selected.dateIso === day.iso && selected.time === time;
          return (
            <SlotButton
              key={time}
              time={time}
              booked={booked}
              selected={isSelected}
              onClick={() => onPick(time)}
            />
          );
        })}
      </div>
    </div>
  );
}

function countAvailable(dayIndex: number): number {
  let n = 0;
  for (let s = 0; s < SLOT_TIMES.length; s++) if (!isSlotBooked(dayIndex, s)) n++;
  return n;
}

function SlotButton({
  time,
  booked,
  selected,
  onClick,
}: {
  time: string;
  booked: boolean;
  selected: boolean;
  onClick: () => void;
}) {
  const bg = selected ? "var(--agency-primary)" : booked ? "var(--agency-bg-soft)" : "#ffffff";
  const color = selected
    ? "#ffffff"
    : booked
      ? "var(--agency-muted)"
      : "var(--agency-text)";
  const borderColor = selected
    ? "var(--agency-primary)"
    : booked
      ? "var(--agency-border)"
      : "var(--agency-border)";

  return (
    <button
      type="button"
      onClick={booked ? undefined : onClick}
      disabled={booked}
      aria-pressed={selected}
      aria-label={booked ? `${time} (booked)` : `Book ${time}`}
      className="rounded-lg py-2.5 sm:py-3 text-sm font-medium transition-colors"
      style={{
        background: bg,
        color,
        border: `1px solid ${borderColor}`,
        textDecoration: booked ? "line-through" : "none",
        opacity: booked ? 0.6 : 1,
        cursor: booked ? "not-allowed" : "pointer",
      }}
    >
      {time}
    </button>
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
