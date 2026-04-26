"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import type { ValuationResult, PropertyType, Condition } from "@/lib/valuation";
import type { OutOfDatabaseResult } from "@/app/api/valuation/route";
import ReportView from "./ReportView";
import BookingForm from "./BookingForm";
import StepForm from "./StepForm";

export type PublicAgency = {
  slug: string;
  name: string;
  shortName: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  /** "Eyal Landau" or "the Ellis & Co Golders Green team". */
  ctaPerson: string;
  /** "Eyal" or "the Ellis & Co Golders Green team". */
  ctaPersonShort: string;
  directorTitle: string;
  hasNamedDirector: boolean;
  logoPath: string;
  logoAspect: "wide" | "square" | "tall";
  tagline: string;
  postcodesInAgencyPatch: string[];
  postcodesInValuationDB: string[];
  coverageHero?: string;
  coverageLine?: string;
  reportName: string;
  area: string;
  audience: "vendor" | "landlord";
  framing: "standard" | "preparation";
  heroHeadline?: string;
  heroSubline?: string;
  headerBg: "white" | "primary";
};

export type FormState = {
  postcode: string;
  propertyType: PropertyType | null;
  bedrooms: number | null;
  condition: Condition | null;
  features: string[];
};

type Step = "welcome" | "form" | "loading" | "report" | "out-of-db" | "booking" | "thanks";

const initialForm: FormState = {
  postcode: "",
  propertyType: null,
  bedrooms: null,
  condition: null,
  features: [],
};

export default function AgencyApp({ agency }: { agency: PublicAgency }) {
  const [step, setStep] = useState<Step>("welcome");
  const [form, setForm] = useState<FormState>(initialForm);
  const [result, setResult] = useState<ValuationResult | null>(null);
  const [oodResult, setOodResult] = useState<OutOfDatabaseResult | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleFormComplete = useCallback(
    async (final: FormState) => {
      setForm(final);
      setStep("loading");
      setSubmitError(null);
      try {
        const res = await fetch("/api/valuation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...final, agencySlug: agency.slug }),
        });
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || "Unable to build your report right now.");
        }
        const data = (await res.json()) as ValuationResult | OutOfDatabaseResult;
        if ("outOfDatabase" in data && data.outOfDatabase) {
          setOodResult(data);
          setResult(null);
          setStep("out-of-db");
        } else {
          setResult(data as ValuationResult);
          setOodResult(null);
          setStep("report");
        }
      } catch (e) {
        setSubmitError(e instanceof Error ? e.message : "Something went wrong.");
        setStep("form");
      }
    },
    [agency.slug]
  );

  const handleBookingSubmit = useCallback(
    async (data: {
      name: string;
      email: string;
      phone: string;
      preferredTime: string;
      message: string;
    }) => {
      setBookingError(null);
      try {
        const res = await fetch("/api/book", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...data,
            result: result ?? null,
            outOfDatabase: oodResult ?? null,
            agencySlug: agency.slug,
          }),
        });
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || "Could not send your booking request.");
        }
        setStep("thanks");
      } catch (e) {
        setBookingError(
          e instanceof Error ? e.message : "Could not send your booking request."
        );
      }
    },
    [result, oodResult, agency.slug]
  );

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--agency-bg-soft)" }}>
      <Header agency={agency} />
      <main className="flex-1 w-full">
        {step === "welcome" && (
          <Welcome
            agency={agency}
            onStart={() => {
              setForm(initialForm);
              setSubmitError(null);
              setStep("form");
            }}
            submitError={submitError}
          />
        )}
        {step === "form" && (
          <StepForm
            agency={agency}
            initial={form}
            onCancel={() => setStep("welcome")}
            onComplete={handleFormComplete}
            submitError={submitError}
          />
        )}
        {step === "loading" && <Loading agency={agency} />}
        {step === "report" && result && (
          <ReportView
            agency={agency}
            result={result}
            onBook={() => {
              setBookingError(null);
              setStep("booking");
            }}
            onRestart={() => {
              setResult(null);
              setOodResult(null);
              setForm(initialForm);
              setStep("welcome");
            }}
          />
        )}
        {step === "out-of-db" && oodResult && (
          <OutOfDbView
            agency={agency}
            result={oodResult}
            onBook={() => {
              setBookingError(null);
              setStep("booking");
            }}
            onRestart={() => {
              setOodResult(null);
              setResult(null);
              setForm(initialForm);
              setStep("welcome");
            }}
          />
        )}
        {step === "booking" && (
          <BookingForm
            agency={agency}
            result={result}
            outOfDb={oodResult}
            onCancel={() => setStep(result ? "report" : "out-of-db")}
            onSubmit={handleBookingSubmit}
            error={bookingError}
          />
        )}
        {step === "thanks" && <ThankYou agency={agency} />}
      </main>
      <Footer agency={agency} />
    </div>
  );
}

function Header({ agency }: { agency: PublicAgency }) {
  const isSvg = agency.logoPath.toLowerCase().endsWith(".svg");
  const onPrimary = agency.headerBg === "primary";

  // Header height bumps for non-wide logos so square badges and portrait
  // logos are legible at the same visual weight as a wide wordmark.
  const logoSizeClass =
    agency.logoAspect === "tall"
      ? "h-16 sm:h-24 w-auto max-w-[6rem] sm:max-w-[7.5rem]"
      : agency.logoAspect === "square"
        ? "h-14 sm:h-20 w-auto"
        : "h-9 sm:h-12 w-auto";

  // Header padding tightens for taller logos so they don't blow up the bar.
  const headerPaddingClass =
    agency.logoAspect === "tall" || agency.logoAspect === "square"
      ? "py-3 sm:py-4"
      : "py-4 sm:py-5";

  return (
    <header
      className="w-full border-b"
      style={{
        background: onPrimary ? "var(--agency-primary)" : "#ffffff",
        borderColor: onPrimary ? "var(--agency-primary)" : "var(--agency-border)",
      }}
    >
      <div className={`max-w-5xl mx-auto px-5 sm:px-8 ${headerPaddingClass} flex items-center justify-between gap-4`}>
        <a
          href={agency.website}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-3 min-w-0"
          aria-label={`${agency.name} home`}
        >
          {isSvg ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={agency.logoPath}
              alt={agency.name}
              className={logoSizeClass}
            />
          ) : (
            <Image
              src={agency.logoPath}
              alt={agency.name}
              width={300}
              height={120}
              priority
              className={logoSizeClass}
            />
          )}
        </a>
        <a
          href={`tel:${agency.phone.replace(/\s/g, "")}`}
          className="hidden sm:inline-flex items-center gap-2 text-sm font-medium"
          style={{ color: onPrimary ? "#ffffff" : "var(--agency-primary)" }}
        >
          <PhoneIcon />
          {agency.phone}
        </a>
        <a
          href={`tel:${agency.phone.replace(/\s/g, "")}`}
          className="sm:hidden inline-flex items-center gap-1 text-xs font-medium"
          style={{ color: onPrimary ? "#ffffff" : "var(--agency-primary)" }}
          aria-label={`Call ${agency.shortName}`}
        >
          <PhoneIcon />
          Call
        </a>
      </div>
    </header>
  );
}

function Footer({ agency }: { agency: PublicAgency }) {
  return (
    <footer
      className="w-full border-t bg-white mt-12"
      style={{ borderColor: "var(--agency-border)" }}
    >
      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-8 text-sm" style={{ color: "var(--agency-muted)" }}>
        <div className="grid sm:grid-cols-3 gap-6">
          <div>
            <div className="font-semibold mb-1" style={{ color: "var(--agency-text)" }}>
              {agency.name}
            </div>
            <div>{agency.address}</div>
          </div>
          <div>
            <div className="font-semibold mb-1" style={{ color: "var(--agency-text)" }}>
              Contact
            </div>
            <div>
              <a href={`tel:${agency.phone.replace(/\s/g, "")}`} className="underline-offset-2 hover:underline">
                {agency.phone}
              </a>
            </div>
            <div>
              <a href={`mailto:${agency.email}`} className="underline-offset-2 hover:underline">
                {agency.email}
              </a>
            </div>
          </div>
          <div>
            <div className="font-semibold mb-1" style={{ color: "var(--agency-text)" }}>
              About this report
            </div>
            <p className="text-xs leading-relaxed">
              Property Intelligence Reports are prepared using HM Land Registry Price Paid Data.
              Ranges are indicative and do not replace an in-person valuation by {agency.ctaPerson}.
            </p>
          </div>
        </div>
        <div
          className="mt-8 pt-4 border-t text-xs"
          style={{ borderColor: "var(--agency-border)" }}
        >
          © {new Date().getFullYear()} {agency.name}. Data contains HM Land Registry data © Crown copyright and database right. Licensed under the Open Government Licence v3.0.
        </div>
      </div>
    </footer>
  );
}

function formatCoverageLine(agency: PublicAgency): React.ReactNode {
  if (agency.coverageLine) return agency.coverageLine;
  const list = agency.postcodesInAgencyPatch;
  if (list.length === 0) return "";
  if (list.length === 1) return `Covering ${list[0]}.`;
  if (list.length === 2) return `Covering ${list[0]} and ${list[1]}.`;
  return `Covering ${list.slice(0, -1).join(", ")} and ${list[list.length - 1]}.`;
}

function Welcome({
  agency,
  onStart,
  submitError,
}: {
  agency: PublicAgency;
  onStart: () => void;
  submitError: string | null;
}) {
  const heroLine = agency.coverageHero ?? `Built for ${agency.postcodesInAgencyPatch[0]}.`;
  const coverageLine = formatCoverageLine(agency);

  const defaultHeadline =
    agency.audience === "landlord"
      ? "What rent can your property achieve?"
      : "Discover what your home is really worth.";
  const headline = agency.heroHeadline ?? defaultHeadline;

  const defaultIntro =
    agency.audience === "landlord"
      ? `A data-driven rental report for your ${agency.area} property, based on local lettings yields and HM Land Registry capital values. Free, no obligation — then, if you'd like, an in-person landlord appraisal with ${agency.ctaPerson}.`
      : `A data-driven market report for your property in ${agency.area}, based on HM Land Registry sales. Free, no obligation — then, if you'd like, ${agency.hasNamedDirector ? "a personal valuation with" : "an in-person valuation from"} ${agency.ctaPerson}.`;
  const intro = agency.heroSubline ?? defaultIntro;

  return (
    <section className="w-full">
      <div className="max-w-3xl mx-auto px-5 sm:px-8 pt-10 sm:pt-20 pb-10">
        <div
          className="inline-flex items-center gap-2 text-xs font-medium px-3 py-1 rounded-full mb-6 uppercase tracking-wider"
          style={{
            background: "#ffffff",
            color: "var(--agency-primary)",
            border: "1px solid var(--agency-border)",
          }}
        >
          <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ background: "var(--agency-accent)" }} />
          {agency.reportName}
        </div>
        <h1 className="text-4xl sm:text-6xl font-semibold leading-tight tracking-tight" style={{ color: "var(--agency-text)" }}>
          {headline}
        </h1>
        <p className="mt-5 text-lg sm:text-xl" style={{ color: "var(--agency-muted)" }}>
          {intro}
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <button
            onClick={onStart}
            className="agency-btn-primary w-full sm:w-auto text-base font-medium rounded-full px-8 py-4 shadow-sm"
          >
            Start my report →
          </button>
          <span className="text-sm" style={{ color: "var(--agency-muted)" }}>
            Takes about 90 seconds.
          </span>
        </div>

        {submitError && (
          <div
            className="mt-6 text-sm rounded-md px-4 py-3"
            style={{ background: "#fff4f0", color: "#7a1f1f", border: "1px solid #fad2c6" }}
          >
            {submitError}
          </div>
        )}

        <div className="mt-16 grid sm:grid-cols-3 gap-4 sm:gap-6">
          <TrustTile
            title="Real comparable sales"
            body="Three to five recent, verified sales on your street or postcode sector."
          />
          <TrustTile
            title="A defensible range"
            body="Never a single number. We show the realistic band a buyer is likely to pay."
          />
          <TrustTile
            title={heroLine}
            bodyNode={
              <>
                {coverageLine} Prepared by {agency.name} —{" "}
                <span className="italic">{agency.tagline}.</span>
              </>
            }
          />
        </div>
      </div>
    </section>
  );
}

function TrustTile({
  title,
  body,
  bodyNode,
}: {
  title: string;
  body?: string;
  bodyNode?: React.ReactNode;
}) {
  return (
    <div className="agency-card p-5">
      <div className="text-base font-semibold mb-1" style={{ color: "var(--agency-text)" }}>
        {title}
      </div>
      <div className="text-sm leading-relaxed" style={{ color: "var(--agency-muted)" }}>
        {bodyNode ?? body}
      </div>
    </div>
  );
}

function Loading({ agency }: { agency: PublicAgency }) {
  return (
    <section className="max-w-2xl mx-auto px-5 sm:px-8 py-24 text-center">
      <div className="inline-block" aria-hidden>
        <div
          className="w-10 h-10 rounded-full border-2 animate-spin mx-auto"
          style={{
            borderColor: "var(--agency-border)",
            borderTopColor: "var(--agency-primary)",
          }}
        />
      </div>
      <p className="mt-6 text-lg" style={{ color: "var(--agency-text)" }}>
        Building your {agency.reportName.toLowerCase()}…
      </p>
      <p className="text-sm mt-2" style={{ color: "var(--agency-muted)" }}>
        Matching against recent HM Land Registry transactions in your area.
      </p>
    </section>
  );
}

function OutOfDbView({
  agency,
  result,
  onBook,
  onRestart,
}: {
  agency: PublicAgency;
  result: OutOfDatabaseResult;
  onBook: () => void;
  onRestart: () => void;
}) {
  return (
    <section className="w-full">
      <div className="max-w-2xl mx-auto px-5 sm:px-8 pt-10 sm:pt-16 pb-12">
        <div className="text-xs font-medium uppercase tracking-wider mb-2" style={{ color: "var(--agency-muted)" }}>
          {agency.reportName}
        </div>
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight leading-tight" style={{ color: "var(--agency-text)" }}>
          Your postcode is in {agency.shortName}'s patch — but needs an in-person look.
        </h1>
        <p className="mt-4 text-base sm:text-lg" style={{ color: "var(--agency-muted)" }}>
          {agency.name} covers <span className="font-medium" style={{ color: "var(--agency-text)" }}>{result.district}</span>, but our online comparable database is currently focused on NW postcodes. Submit your details and {agency.ctaPerson} will give you a full valuation in person — usually within a few working days.
        </p>

        <div className="mt-8 rounded-2xl border p-5 sm:p-6" style={{ borderColor: "var(--agency-border)", background: "#ffffff" }}>
          <div className="text-sm font-medium uppercase tracking-wider" style={{ color: "var(--agency-muted)" }}>
            What we have on your property
          </div>
          <dl className="mt-3 grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm" style={{ color: "var(--agency-text)" }}>
            <div className="flex justify-between"><dt style={{ color: "var(--agency-muted)" }}>Postcode</dt><dd>{result.input.postcode}</dd></div>
            <div className="flex justify-between"><dt style={{ color: "var(--agency-muted)" }}>Type</dt><dd>{propertyTypeLabel(result.input.propertyType)}</dd></div>
            <div className="flex justify-between"><dt style={{ color: "var(--agency-muted)" }}>Bedrooms</dt><dd>{result.input.bedrooms}</dd></div>
            <div className="flex justify-between"><dt style={{ color: "var(--agency-muted)" }}>Condition</dt><dd>{conditionLabel(result.input.condition)}</dd></div>
          </dl>
        </div>

        <div className="mt-8">
          <button
            onClick={onBook}
            className="agency-btn-primary w-full sm:w-auto rounded-full px-8 py-4 text-base font-medium"
          >
            Book my in-person valuation →
          </button>
        </div>

        <div className="mt-8 flex items-center justify-between">
          <button
            type="button"
            onClick={onRestart}
            className="text-sm underline underline-offset-4"
            style={{ color: "var(--agency-muted)" }}
          >
            Start a new report
          </button>
        </div>
      </div>
    </section>
  );
}

function propertyTypeLabel(t: "F" | "T" | "S" | "D"): string {
  return ({ F: "Flat / Maisonette", T: "Terraced house", S: "Semi-detached house", D: "Detached house" })[t];
}
function conditionLabel(c: "needs-work" | "good" | "excellent" | "renovated"): string {
  return (
    {
      "needs-work": "Needs modernising",
      good: "Good condition",
      excellent: "Excellent condition",
      renovated: "Recently renovated",
    } as const
  )[c];
}

function ThankYou({ agency }: { agency: PublicAgency }) {
  return (
    <section className="max-w-2xl mx-auto px-5 sm:px-8 py-16 sm:py-24 text-center">
      <div
        className="mx-auto w-14 h-14 rounded-full flex items-center justify-center mb-6"
        style={{ background: "var(--agency-primary)" }}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M5 12l5 5L20 7"
            stroke="#fff"
            strokeWidth="2.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight" style={{ color: "var(--agency-text)" }}>
        Booking request sent.
      </h2>
      <p className="mt-4 text-base sm:text-lg" style={{ color: "var(--agency-muted)" }}>
        {agency.ctaPerson} will be in touch shortly to confirm a time that works for you. In the
        meantime, if you'd like to speak sooner, call{" "}
        <a
          href={`tel:${agency.phone.replace(/\s/g, "")}`}
          className="underline underline-offset-4"
          style={{ color: "var(--agency-primary)" }}
        >
          {agency.phone}
        </a>
        .
      </p>
    </section>
  );
}

function PhoneIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M22 16.92v3a2 2 0 0 1-2.18 2 19.86 19.86 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.86 19.86 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.72 2.8a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.28-1.28a2 2 0 0 1 2.11-.45c.9.35 1.84.59 2.8.72A2 2 0 0 1 22 16.92z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
