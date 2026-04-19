"use client";

import { useMemo, useState } from "react";
import type { PropertyType, Condition } from "@/lib/valuation";
import type { FormState, PublicAgency } from "./AgencyApp";
import { getPostcodeDistrict, isValidOutwardOrFull, normalisePostcode } from "@/lib/postcode";

const PROPERTY_TYPES: { value: PropertyType; label: string; sub: string; icon: React.ReactNode }[] = [
  {
    value: "F",
    label: "Flat / Maisonette",
    sub: "Purpose-built, converted or period",
    icon: <FlatIcon />,
  },
  { value: "T", label: "Terraced house", sub: "Mid or end of terrace", icon: <TerracedIcon /> },
  { value: "S", label: "Semi-detached house", sub: "Joined on one side", icon: <SemiIcon /> },
  { value: "D", label: "Detached house", sub: "Standalone, all sides free", icon: <DetachedIcon /> },
];

const CONDITIONS: { value: Condition; label: string; sub: string }[] = [
  {
    value: "needs-work",
    label: "Needs modernising",
    sub: "Original fixtures, dated kitchen/bathroom, or requires work.",
  },
  {
    value: "good",
    label: "Good condition",
    sub: "Well-maintained, presentable, move-in ready without major work.",
  },
  {
    value: "excellent",
    label: "Excellent condition",
    sub: "High specification throughout, nothing you'd want to change.",
  },
  {
    value: "renovated",
    label: "Recently renovated",
    sub: "Fully refurbished in the last few years with quality finishes.",
  },
];

const FEATURES: { value: string; label: string; hint?: string }[] = [
  { value: "garden", label: "Private garden or large terrace" },
  { value: "parking", label: "Off-street parking or garage" },
  { value: "period", label: "Period features" },
  { value: "share-of-freehold", label: "Share of freehold (flats only)" },
  { value: "loft-potential", label: "Loft conversion or potential to add one" },
];

const BEDROOMS = [1, 2, 3, 4, 5, 6];

const TOTAL_STEPS = 5;

export default function StepForm({
  agency,
  initial,
  onCancel,
  onComplete,
  submitError,
}: {
  agency: PublicAgency;
  initial: FormState;
  onCancel: () => void;
  onComplete: (f: FormState) => void;
  submitError: string | null;
}) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(initial);
  const [postcodeTouched, setPostcodeTouched] = useState(false);

  const postcodeValid = useMemo(
    () => form.postcode.trim().length > 0 && isValidOutwardOrFull(form.postcode),
    [form.postcode]
  );
  const postcodeDistrict = getPostcodeDistrict(form.postcode);
  const outsideArea =
    postcodeValid &&
    postcodeDistrict &&
    !agency.postcodesCovered.includes(postcodeDistrict) &&
    !postcodeDistrict.startsWith("NW");

  const canContinue = () => {
    switch (step) {
      case 1:
        return postcodeValid;
      case 2:
        return !!form.propertyType;
      case 3:
        return !!form.bedrooms;
      case 4:
        return !!form.condition;
      case 5:
        return true;
      default:
        return false;
    }
  };

  const next = () => {
    if (!canContinue()) return;
    if (step === TOTAL_STEPS) {
      const finalForm = {
        ...form,
        postcode: normalisePostcode(form.postcode),
      };
      onComplete(finalForm);
      return;
    }
    setStep((s) => Math.min(TOTAL_STEPS, s + 1));
  };

  const back = () => {
    if (step === 1) {
      onCancel();
      return;
    }
    setStep((s) => Math.max(1, s - 1));
  };

  return (
    <section className="w-full">
      <div className="max-w-2xl mx-auto px-5 sm:px-8 pt-8 sm:pt-12 pb-24">
        <ProgressBar step={step} total={TOTAL_STEPS} />

        <div className="mt-8">
          {step === 1 && (
            <StepShell
              eyebrow="Step 1 of 5"
              title="What's your postcode?"
              sub="We use this to match your property against recent nearby sales."
            >
              <label className="block">
                <input
                  type="text"
                  inputMode="text"
                  autoComplete="postal-code"
                  autoFocus
                  spellCheck={false}
                  value={form.postcode}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, postcode: e.target.value.toUpperCase() }))
                  }
                  onBlur={() => setPostcodeTouched(true)}
                  placeholder="e.g. NW11 8HB"
                  className="w-full rounded-xl border bg-white px-5 py-4 text-lg tracking-wider uppercase focus:outline-none focus:ring-2"
                  style={{
                    borderColor: "var(--agency-border)",
                    color: "var(--agency-text)",
                    ["--tw-ring-color" as string]: "var(--agency-primary)",
                  } as React.CSSProperties}
                />
                {!postcodeValid && postcodeTouched && (
                  <div className="mt-3 text-sm" style={{ color: "#7a1f1f" }}>
                    Please enter a valid UK postcode.
                  </div>
                )}
                {outsideArea && (
                  <div
                    className="mt-3 text-sm rounded-md px-3 py-2"
                    style={{
                      background: "#fffbeb",
                      color: "#7a5a00",
                      border: "1px solid #f5e6b0",
                    }}
                  >
                    {agency.shortName} specialises in {agency.postcodesCovered.slice(0, -1).join(", ")} and{" "}
                    {agency.postcodesCovered.slice(-1)}. You can still continue — we'll use the
                    wider London comparables.
                  </div>
                )}
              </label>
            </StepShell>
          )}

          {step === 2 && (
            <StepShell
              eyebrow="Step 2 of 5"
              title="Which best describes the property?"
              sub="Choose the closest match — you can refine later with your valuer."
            >
              <div className="grid sm:grid-cols-2 gap-3">
                {PROPERTY_TYPES.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => {
                      setForm((f) => ({ ...f, propertyType: t.value }));
                      setTimeout(next, 120);
                    }}
                    className={`agency-card text-left p-4 flex items-center gap-4 transition-all ${
                      form.propertyType === t.value ? "ring-2" : "hover:shadow-sm"
                    }`}
                    style={{
                      borderColor:
                        form.propertyType === t.value ? "var(--agency-primary)" : "var(--agency-border)",
                      ["--tw-ring-color" as string]: "var(--agency-primary)",
                    } as React.CSSProperties}
                  >
                    <div
                      className="shrink-0 w-12 h-12 rounded-lg flex items-center justify-center"
                      style={{ background: "var(--agency-bg-soft)", color: "var(--agency-primary)" }}
                    >
                      {t.icon}
                    </div>
                    <div>
                      <div className="font-semibold" style={{ color: "var(--agency-text)" }}>
                        {t.label}
                      </div>
                      <div className="text-sm" style={{ color: "var(--agency-muted)" }}>
                        {t.sub}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </StepShell>
          )}

          {step === 3 && (
            <StepShell
              eyebrow="Step 3 of 5"
              title="How many bedrooms?"
              sub="Count only full bedrooms — not box rooms or studies."
            >
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                {BEDROOMS.map((b) => {
                  const selected = form.bedrooms === b;
                  return (
                    <button
                      key={b}
                      type="button"
                      onClick={() => {
                        setForm((f) => ({ ...f, bedrooms: b }));
                        setTimeout(next, 120);
                      }}
                      className={`rounded-xl text-lg font-semibold py-4 transition-all ${
                        selected ? "text-white" : "bg-white"
                      }`}
                      style={{
                        background: selected ? "var(--agency-primary)" : "#fff",
                        border: `1px solid ${selected ? "var(--agency-primary)" : "var(--agency-border)"}`,
                        color: selected ? "#fff" : "var(--agency-text)",
                      }}
                    >
                      {b}
                      {b === 6 ? "+" : ""}
                    </button>
                  );
                })}
              </div>
            </StepShell>
          )}

          {step === 4 && (
            <StepShell
              eyebrow="Step 4 of 5"
              title="What condition is it in?"
              sub="Be honest — this helps the range better reflect your property."
            >
              <div className="space-y-3">
                {CONDITIONS.map((c) => {
                  const selected = form.condition === c.value;
                  return (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => {
                        setForm((f) => ({ ...f, condition: c.value }));
                        setTimeout(next, 120);
                      }}
                      className="agency-card text-left p-4 w-full transition-all"
                      style={{
                        borderColor: selected ? "var(--agency-primary)" : "var(--agency-border)",
                        borderWidth: selected ? 2 : 1,
                      }}
                    >
                      <div className="font-semibold" style={{ color: "var(--agency-text)" }}>
                        {c.label}
                      </div>
                      <div className="text-sm mt-1" style={{ color: "var(--agency-muted)" }}>
                        {c.sub}
                      </div>
                    </button>
                  );
                })}
              </div>
            </StepShell>
          )}

          {step === 5 && (
            <StepShell
              eyebrow="Step 5 of 5"
              title="Which of these does your property have?"
              sub="Optional — tick any that apply."
            >
              <div className="space-y-2">
                {FEATURES.map((f) => {
                  const checked = form.features.includes(f.value);
                  return (
                    <label
                      key={f.value}
                      className="agency-card flex items-start gap-3 p-4 cursor-pointer"
                      style={{
                        borderColor: checked ? "var(--agency-primary)" : "var(--agency-border)",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => {
                          setForm((prev) => ({
                            ...prev,
                            features: e.target.checked
                              ? [...prev.features, f.value]
                              : prev.features.filter((x) => x !== f.value),
                          }));
                        }}
                        className="mt-1 w-5 h-5 accent-current"
                        style={{ accentColor: "var(--agency-primary)" }}
                      />
                      <div>
                        <div className="font-medium" style={{ color: "var(--agency-text)" }}>
                          {f.label}
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </StepShell>
          )}
        </div>

        {submitError && (
          <div
            className="mt-4 text-sm rounded-md px-4 py-3"
            style={{ background: "#fff4f0", color: "#7a1f1f", border: "1px solid #fad2c6" }}
          >
            {submitError}
          </div>
        )}

        <div className="mt-8 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={back}
            className="agency-btn-secondary rounded-full px-5 py-3 text-sm font-medium"
          >
            {step === 1 ? "← Back" : "← Back"}
          </button>
          <button
            type="button"
            onClick={next}
            disabled={!canContinue()}
            className="agency-btn-primary rounded-full px-7 py-3 text-sm font-medium"
          >
            {step === TOTAL_STEPS ? "See my report" : "Continue"}
          </button>
        </div>
      </div>
    </section>
  );
}

function ProgressBar({ step, total }: { step: number; total: number }) {
  const pct = (step / total) * 100;
  return (
    <div>
      <div
        className="h-1 rounded-full overflow-hidden"
        style={{ background: "var(--agency-border)" }}
      >
        <div
          className="h-full transition-[width] duration-300 ease-out"
          style={{ width: `${pct}%`, background: "var(--agency-primary)" }}
        />
      </div>
    </div>
  );
}

function StepShell({
  eyebrow,
  title,
  sub,
  children,
}: {
  eyebrow: string;
  title: string;
  sub: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="text-xs font-medium uppercase tracking-wider mb-2" style={{ color: "var(--agency-muted)" }}>
        {eyebrow}
      </div>
      <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight" style={{ color: "var(--agency-text)" }}>
        {title}
      </h2>
      <p className="mt-2 text-base" style={{ color: "var(--agency-muted)" }}>
        {sub}
      </p>
      <div className="mt-6">{children}</div>
    </div>
  );
}

function FlatIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3" y="4" width="18" height="16" rx="1" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3 10h18M9 4v16M15 4v16" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}
function TerracedIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M2 10l4-4 4 4M10 10l4-4 4 4M18 10l4-4M2 20V10M22 20V6M6 14h2v6H6zM14 14h2v6h-2z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function SemiIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M3 11l5-5 5 5M13 11l5-5 5 5M3 20V11M23 20V11M6 14h3v6H6zM15 14h3v6h-3zM13 20V11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function DetachedIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4 10l8-6 8 6M5 10v10h14V10M10 20v-6h4v6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
