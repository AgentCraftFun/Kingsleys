"use client";

import { useMemo, useState } from "react";
import type { ValuationResult } from "@/lib/valuation";
import type { OutOfDatabaseResult } from "@/app/api/valuation/route";
import type { PublicAgency } from "./AgencyApp";

export type SelectedSlot = {
  /** ISO yyyy-mm-dd, day-only (no timezone). */
  dateIso: string;
  /** "10:00" through "17:00". */
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

// 13 half-hour slots running from 10:00 to 17:00 (last slot starts 5pm)
// with a 13:00 to 14:00 lunch gap. Splitting into morning / afternoon
// arrays drives the visual grouping in the per-day grid: 6-col grid
// for the morning row, 7-col for the afternoon row, both responsive
// down to 3-col on mobile.
const MORNING_SLOTS = ["10:00", "10:30", "11:00", "11:30", "12:00", "12:30"] as const;
const AFTERNOON_SLOTS = ["14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00"] as const;
const SLOT_TIMES: ReadonlyArray<string> = [...MORNING_SLOTS, ...AFTERNOON_SLOTS];

/**
 * Deterministic "already booked" pattern. ~30% of slots come back booked
 * so the calendar looks lived-in rather than empty, but the pattern is
 * stable across renders (no flicker between SSR and client) and across
 * mobile vs desktop.
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
  /** Whether this is Saturday or Sunday. */
  isWeekend: boolean;
  /** Index used by isSlotBooked, stable across the rendered list. */
  index: number;
};

function buildDayList(): Day[] {
  // 14 calendar days starting tomorrow, weekends included. Weekend days
  // pick up an isWeekend flag so the row can render with a slightly
  // softer header treatment ("Sat 3 May") without losing them entirely.
  const days: Day[] = [];
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() + 1);
  for (let i = 0; i < 14; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const dow = d.getDay();
    days.push({
      iso: toIsoDate(d),
      weekdayShort: d.toLocaleDateString("en-GB", { weekday: "short" }),
      dayMonth: d.toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
      isWeekend: dow === 0 || dow === 6,
      index: i,
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

type Phase = "pick" | "confirm";

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

  const days = useMemo(buildDayList, []);

  const [phase, setPhase] = useState<Phase>("pick");
  const [selected, setSelected] = useState<SelectedSlot | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const contactValid =
    name.trim().length > 1 && /\S+@\S+\.\S+/.test(email) && phone.trim().length >= 7;
  const valid = contactValid && selected !== null;

  function handlePickSlot(dateIso: string, time: string) {
    setSelected({ dateIso, time });
    setPhase("confirm");
    // Snap back to the top of the page so the contact form is in view
    // immediately. Without this the confirm phase opens at whatever
    // scroll position the user was at when they tapped the slot.
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function handleChangeSlot() {
    setPhase("pick");
  }

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

  if (phase === "pick") {
    return (
      <PickPhase agency={agency} days={days} onCancel={onCancel} onPick={handlePickSlot} />
    );
  }

  // phase === "confirm"
  return (
    <ConfirmPhase
      agency={agency}
      slot={selected!}
      onChangeSlot={handleChangeSlot}
      onCancel={onCancel}
      name={name}
      email={email}
      phone={phone}
      message={message}
      setName={setName}
      setEmail={setEmail}
      setPhone={setPhone}
      setMessage={setMessage}
      submitting={submitting}
      valid={valid}
      error={error}
      onSubmit={handleSubmit}
    />
  );
}

function PickPhase({
  agency,
  days,
  onCancel,
  onPick,
}: {
  agency: PublicAgency;
  days: Day[];
  onCancel: () => void;
  onPick: (dateIso: string, time: string) => void;
}) {
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
            ? `30 minutes at the property. ${agency.ctaPersonShort} will walk round, advise on achievable rent and presentation, and leave you with a clear picture of what the investment can do.`
            : `30 minutes at the property. ${agency.ctaPersonShort} will walk round, refine the valuation, and leave you with a clear picture of what your home could achieve on the open market.`}
        </p>

        <div className="mt-8 space-y-3">
          {days.map((day) => (
            <DayRow key={day.iso} day={day} onPick={(time) => onPick(day.iso, time)} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ConfirmPhase({
  agency,
  slot,
  onChangeSlot,
  onCancel,
  name,
  email,
  phone,
  message,
  setName,
  setEmail,
  setPhone,
  setMessage,
  submitting,
  valid,
  error,
  onSubmit,
}: {
  agency: PublicAgency;
  slot: SelectedSlot;
  onChangeSlot: () => void;
  onCancel: () => void;
  name: string;
  email: string;
  phone: string;
  message: string;
  setName: (v: string) => void;
  setEmail: (v: string) => void;
  setPhone: (v: string) => void;
  setMessage: (v: string) => void;
  submitting: boolean;
  valid: boolean;
  error: string | null;
  onSubmit: (e: React.FormEvent) => void;
}) {
  const ctaLabel = agency.audience === "landlord" ? "appraisal" : "valuation";
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

        {/* Locked-in slot header. Sticks at the top of the confirm screen
            so the user always sees what they're about to book and has
            an obvious "change time" affordance if they tapped the wrong
            one. */}
        <div
          className="rounded-2xl p-5 sm:p-6"
          style={{
            background: "var(--agency-primary)",
            color: "#ffffff",
            boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
          }}
        >
          <div className="text-xs font-medium uppercase tracking-wider opacity-80">
            Your slot
          </div>
          <div className="mt-1 text-xl sm:text-2xl font-semibold leading-tight">
            {formatSelectedLabel(slot)}
          </div>
          <button
            type="button"
            onClick={onChangeSlot}
            className="mt-3 inline-flex items-center gap-1 text-sm underline underline-offset-4"
            style={{ color: "#ffffff", opacity: 0.9 }}
          >
            Change time
          </button>
        </div>

        <h1
          className="mt-8 text-2xl sm:text-3xl font-semibold tracking-tight"
          style={{ color: "var(--agency-text)" }}
        >
          One more step. Add your details.
        </h1>
        <p className="mt-2 text-base" style={{ color: "var(--agency-muted)" }}>
          {agency.ctaPersonShort} will text or call to confirm and to make sure they have
          everything they need before the visit.
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-5">
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
              {submitting ? "Sending…" : `Confirm my ${ctaLabel}`}
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

function DayRow({ day, onPick }: { day: Day; onPick: (time: string) => void }) {
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
          {day.isWeekend && (
            <span
              className="ml-2 text-xs font-medium uppercase tracking-wider align-middle"
              style={{ color: "var(--agency-accent)" }}
            >
              Weekend
            </span>
          )}
        </div>
        <div className="text-xs" style={{ color: "var(--agency-muted)" }}>
          {countAvailable(day.index)} of {SLOT_TIMES.length} available
        </div>
      </div>
      <SlotGroup
        title="Morning"
        slots={MORNING_SLOTS}
        offset={0}
        day={day}
        onPick={onPick}
      />
      <div className="h-2" />
      <SlotGroup
        title="Afternoon"
        slots={AFTERNOON_SLOTS}
        offset={MORNING_SLOTS.length}
        day={day}
        onPick={onPick}
      />
    </div>
  );
}

function SlotGroup({
  title,
  slots,
  offset,
  day,
  onPick,
}: {
  title: string;
  slots: ReadonlyArray<string>;
  offset: number;
  day: Day;
  onPick: (time: string) => void;
}) {
  return (
    <div>
      <div
        className="text-[11px] font-medium uppercase tracking-wider mb-1.5"
        style={{ color: "var(--agency-muted)" }}
      >
        {title}
      </div>
      <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
        {slots.map((time, i) => {
          const slotIndex = offset + i;
          const booked = isSlotBooked(day.index, slotIndex);
          return (
            <SlotButton
              key={time}
              time={time}
              booked={booked}
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
  onClick,
}: {
  time: string;
  booked: boolean;
  onClick: () => void;
}) {
  // Tactile press: brief scale-down on active, hover lift on desktop.
  // motion-reduce:transform-none respects prefers-reduced-motion.
  const baseClasses =
    "rounded-lg py-2.5 sm:py-3 text-sm font-medium transition-all duration-150 ease-out";
  const interactiveClasses = booked
    ? ""
    : "hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.97] motion-reduce:transform-none cursor-pointer";

  return (
    <button
      type="button"
      onClick={booked ? undefined : onClick}
      disabled={booked}
      aria-label={booked ? `${time} (booked)` : `Book ${time}`}
      className={`${baseClasses} ${interactiveClasses}`}
      style={{
        background: booked ? "var(--agency-bg-soft)" : "#ffffff",
        color: booked ? "var(--agency-muted)" : "var(--agency-text)",
        border: "1px solid var(--agency-border)",
        textDecoration: booked ? "line-through" : "none",
        opacity: booked ? 0.55 : 1,
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

