"use client";

import type { ValuationResult } from "@/lib/valuation";
import type { PublicAgency } from "./AgencyApp";

export default function ReportView({
  agency,
  result,
  onBook,
  onRestart,
}: {
  agency: PublicAgency;
  result: ValuationResult;
  onBook: () => void;
  onRestart: () => void;
}) {
  const scopeLabel =
    result.sampleScope === "sector"
      ? `postcode sector ${result.sector}`
      : result.sampleScope === "district"
      ? `${result.district} postcode district`
      : "nearby NW London";

  const propertyTypeReadable =
    result.input.propertyType === "F"
      ? "flat"
      : result.input.propertyType === "T"
      ? "terraced house"
      : result.input.propertyType === "S"
      ? "semi-detached house"
      : "detached house";

  // Three layout variants drive what's emphasised:
  //  - landlord:    rental PCM is the hero, sale range secondary.
  //  - preparation: comparables are the hero, sale range muted, "what this
  //                 can't see" expanded. Used when the agency publicly
  //                 disagrees with AVMs (Winkworth).
  //  - standard:    sale range hero, rental secondary.
  const variant = agency.framing === "preparation" ? "preparation" : agency.audience;

  return (
    <section className="w-full">
      <div className="max-w-3xl mx-auto px-5 sm:px-8 pt-8 sm:pt-12 pb-8">
        <div className="text-xs font-medium uppercase tracking-wider mb-2" style={{ color: "var(--agency-muted)" }}>
          {agency.reportName}
        </div>
        <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight leading-tight" style={{ color: "var(--agency-text)" }}>
          Your {result.input.bedrooms}-bedroom {propertyTypeReadable},{" "}
          <span className="whitespace-nowrap" style={{ color: "var(--agency-accent)" }}>{result.input.postcode}</span>
        </h1>
        <p className="mt-3 text-base sm:text-lg" style={{ color: "var(--agency-muted)" }}>
          Based on {result.sampleSize} nearby transactions in {scopeLabel}, recorded by HM Land
          Registry in the last {Math.max(result.monthsCovered, 12)} months.
        </p>

        {variant === "landlord" && <LandlordHeroCard result={result} agency={agency} />}
        {variant === "vendor" && <VendorHeroCard result={result} agency={agency} />}
        {variant === "preparation" && <PreparationHeroNote agency={agency} />}

        {/* Primary CTA repeated near the top */}
        <div className="mt-8">
          <BookCta agency={agency} onBook={onBook} />
        </div>

        {/* Comparables */}
        <Comparables result={result} agency={agency} variant={variant} />

        {/* Preparation variant shows the price range here, after the
            comparables, deliberately de-emphasised. */}
        {variant === "preparation" && <PreparationFooterRange result={result} />}

        {/* What this can't see — expanded for preparation framing. */}
        <CantSeeSection agency={agency} variant={variant} />

        <div className="mt-10">
          <BookCta agency={agency} onBook={onBook} variant="large" />
        </div>

        <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
          <button
            type="button"
            onClick={onRestart}
            className="text-sm underline underline-offset-4"
            style={{ color: "var(--agency-muted)" }}
          >
            Start a new report
          </button>
          <div className="text-xs" style={{ color: "var(--agency-muted)" }}>
            Data: HM Land Registry Price Paid Data. Report generated{" "}
            {new Date(result.lastUpdated).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
            .
          </div>
        </div>
      </div>
    </section>
  );
}

function VendorHeroCard({ result, agency }: { result: ValuationResult; agency: PublicAgency }) {
  return (
    <div className="mt-8 rounded-2xl overflow-hidden border" style={{ borderColor: "var(--agency-border)" }}>
      <div className="px-5 py-6 sm:p-8 bg-white">
        <div className="text-sm font-medium uppercase tracking-wider" style={{ color: "var(--agency-muted)" }}>
          Indicative sale price range
        </div>
        <div
          className="mt-3 font-semibold tracking-tight text-[clamp(1.5rem,6.5vw,3rem)] leading-[1.05] whitespace-nowrap"
          style={{ color: "var(--agency-text)" }}
        >
          <span>£{result.lowerBound.toLocaleString()}</span>
          <span className="mx-2 sm:mx-3" style={{ color: "var(--agency-accent)" }}>–</span>
          <span>£{result.upperBound.toLocaleString()}</span>
        </div>
        <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--agency-muted)" }}>
          An indicative band based only on public Land Registry data. {agency.ctaPersonShort}{" "}
          will refine this in person once they've seen the property, its condition, and the
          specifics of the local street.
        </p>
      </div>
      <div className="px-5 py-6 sm:p-8" style={{ background: "var(--agency-bg-soft)" }}>
        <div className="text-sm font-medium uppercase tracking-wider" style={{ color: "var(--agency-muted)" }}>
          Indicative monthly rent
        </div>
        <div className="mt-2 flex items-baseline gap-2 flex-wrap">
          <div className="text-2xl sm:text-3xl font-semibold" style={{ color: "var(--agency-text)" }}>
            £{result.rentalPcmLower.toLocaleString()} – £{result.rentalPcmUpper.toLocaleString()}{" "}
            <span className="text-sm font-normal" style={{ color: "var(--agency-muted)" }}>pcm</span>
          </div>
          <div className="text-sm" style={{ color: "var(--agency-muted)" }}>
            (~{result.yieldPercent.toFixed(1)}% gross yield)
          </div>
        </div>
      </div>
    </div>
  );
}

function LandlordHeroCard({ result, agency }: { result: ValuationResult; agency: PublicAgency }) {
  return (
    <div className="mt-8 rounded-2xl overflow-hidden border" style={{ borderColor: "var(--agency-border)" }}>
      <div className="px-5 py-6 sm:p-8 bg-white">
        <div className="text-sm font-medium uppercase tracking-wider" style={{ color: "var(--agency-muted)" }}>
          Indicative monthly rent
        </div>
        <div
          className="mt-3 font-semibold tracking-tight text-[clamp(1.5rem,6.5vw,3rem)] leading-[1.05] whitespace-nowrap"
          style={{ color: "var(--agency-text)" }}
        >
          <span>£{result.rentalPcmLower.toLocaleString()}</span>
          <span className="mx-2 sm:mx-3" style={{ color: "var(--agency-accent)" }}>–</span>
          <span>£{result.rentalPcmUpper.toLocaleString()}</span>
          <span className="ml-3 text-base font-normal" style={{ color: "var(--agency-muted)" }}>pcm</span>
        </div>
        <div className="mt-2 text-sm" style={{ color: "var(--agency-muted)" }}>
          Roughly {result.yieldPercent.toFixed(1)}% gross yield against the indicative capital
          value. Achieved rents depend on condition, presentation and current demand —{" "}
          {agency.ctaPersonShort} will refine this in person.
        </div>
      </div>
      <div className="px-5 py-6 sm:p-8" style={{ background: "var(--agency-bg-soft)" }}>
        <div className="text-sm font-medium uppercase tracking-wider" style={{ color: "var(--agency-muted)" }}>
          Indicative capital value (for context)
        </div>
        <div className="mt-2 text-xl sm:text-2xl font-semibold" style={{ color: "var(--agency-text)" }}>
          £{result.lowerBound.toLocaleString()} – £{result.upperBound.toLocaleString()}
        </div>
        <p className="mt-2 text-sm" style={{ color: "var(--agency-muted)" }}>
          Drawn from {result.sampleSize} comparable HM Land Registry sales — useful for tracking
          your portfolio's underlying value, not a sales valuation.
        </p>
      </div>
    </div>
  );
}

function PreparationHeroNote({ agency }: { agency: PublicAgency }) {
  return (
    <div
      className="mt-8 rounded-2xl border p-5 sm:p-6"
      style={{ borderColor: "var(--agency-border)", background: "#ffffff" }}
    >
      <div className="text-sm font-medium uppercase tracking-wider" style={{ color: "var(--agency-muted)" }}>
        How to read this report
      </div>
      <p className="mt-3 text-base leading-relaxed" style={{ color: "var(--agency-text)" }}>
        This page isn't a valuation. It's a snapshot of the public Land Registry record for
        comparable properties near you — the same data {agency.ctaPersonShort} will reference at
        your in-person appointment. The numbers below give you context to walk in informed; the
        valuation itself happens when {agency.ctaPersonShort} sees the property.
      </p>
    </div>
  );
}

function Comparables({
  result,
  agency,
  variant,
}: {
  result: ValuationResult;
  agency: PublicAgency;
  variant: "vendor" | "landlord" | "preparation";
}) {
  const isLandlord = variant === "landlord";
  // Indicative monthly rent per comparable, derived from the sale price
  // and the postcode-area yield. Gated on the agency config flag so we
  // only ship this view on /gravity for the demo; other landlord pages
  // (Rawlins, Slettings, Haviva, Key Haven, Charringtons) keep the
  // existing capital-values view until their copy has been signed off.
  const showImpliedRent = isLandlord && agency.showImpliedRentComparables;
  const yieldFraction = result.yieldPercent / 100;
  const heading =
    variant === "preparation"
      ? "Recent comparable sales near you"
      : showImpliedRent
        ? "What rents look like for properties like yours"
        : isLandlord
          ? "Recent comparable sales (capital values)"
          : "Recent comparable sales";
  const sub =
    variant === "preparation"
      ? `These are the records ${agency.ctaPersonShort} will discuss at your in-person valuation. Same property type, sold nearby, verified by HM Land Registry.`
      : showImpliedRent
        ? `Properties recently sold near you, shown as the indicative monthly rent we'd expect at today's local lettings yield (~${result.yieldPercent.toFixed(1)}%). Actual let prices aren't published by HM Land Registry, so ${agency.ctaPersonShort} will bring live rental comparables from current pipeline to your appraisal.`
        : "Same property type, sold nearby, verified by HM Land Registry.";

  return (
    <div className="mt-12">
      <h2
        className="text-2xl sm:text-3xl font-semibold tracking-tight"
        style={{ color: "var(--agency-text)" }}
      >
        {heading}
      </h2>
      <p className="mt-1 text-sm" style={{ color: "var(--agency-muted)" }}>
        {sub}
      </p>

      <div
        className="mt-4 rounded-2xl border overflow-hidden bg-white"
        style={{ borderColor: "var(--agency-border)" }}
      >
        <ul>
          {result.comparables.map((c, i) => {
            const impliedPcm = Math.round((c.price * yieldFraction) / 12 / 25) * 25;
            return (
              <li
                key={`${c.address}-${c.date}-${i}`}
                className="flex items-center justify-between gap-3 p-4 sm:p-5 border-b last:border-b-0"
                style={{ borderColor: "var(--agency-border)" }}
              >
                <div className="min-w-0">
                  <div className="font-medium truncate" style={{ color: "var(--agency-text)" }}>
                    {c.address}
                  </div>
                  <div className="text-sm flex gap-2 mt-0.5 flex-wrap" style={{ color: "var(--agency-muted)" }}>
                    <span>{c.postcode}</span>
                    <span>·</span>
                    <span>{c.propertyTypeLabel}</span>
                    <span>·</span>
                    <span>Sold {formatDate(c.date)}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  {showImpliedRent ? (
                    <>
                      <div className="font-semibold" style={{ color: "var(--agency-text)" }}>
                        £{impliedPcm.toLocaleString()}
                        <span className="ml-1 text-xs font-normal" style={{ color: "var(--agency-muted)" }}>pcm</span>
                      </div>
                      <div className="text-xs" style={{ color: "var(--agency-muted)" }}>
                        from £{c.price.toLocaleString()} sale
                      </div>
                    </>
                  ) : (
                    <div className="font-semibold" style={{ color: "var(--agency-text)" }}>
                      £{c.price.toLocaleString()}
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

function PreparationFooterRange({ result }: { result: ValuationResult }) {
  return (
    <div
      className="mt-8 rounded-xl border p-4 sm:p-5"
      style={{ borderColor: "var(--agency-border)", background: "var(--agency-bg-soft)" }}
    >
      <div className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--agency-muted)" }}>
        For reference only — not a valuation
      </div>
      <div className="mt-1 flex items-baseline gap-2 flex-wrap">
        <div className="text-lg sm:text-xl font-semibold" style={{ color: "var(--agency-text)" }}>
          £{result.lowerBound.toLocaleString()} – £{result.upperBound.toLocaleString()}
        </div>
        <div className="text-sm" style={{ color: "var(--agency-muted)" }}>
          a wide indicative band drawn from comparables alone
        </div>
      </div>
      <p className="mt-2 text-xs leading-relaxed" style={{ color: "var(--agency-muted)" }}>
        A single number from public data is misleading without seeing the property. The visit
        narrows this band by orders of magnitude.
      </p>
    </div>
  );
}

const CANT_SEE_STANDARD = [
  "The quality of your kitchen, bathrooms and finish.",
  "Loft conversions, extensions or layouts not captured in Land Registry.",
  "Lease terms, service charges and ground rent (for flats).",
  "Views, orientation, noise and the specifics of your block or street.",
  "Current demand: who's actively looking for a home like yours right now.",
];

const CANT_SEE_PREPARATION = [
  "The quality of your kitchen, bathrooms, joinery and finish.",
  "Loft conversions, extensions, side returns and layouts that aren't recorded by Land Registry.",
  "Lease length, service charges, ground rent, and any restrictions on the title (for flats).",
  "Views, orientation, daylight, garden depth and the noise profile of the street.",
  "Block, building or estate-specific factors — managing agent, planned works, neighbour mix.",
  "Current demand: which buyers are actively looking for exactly your property right now, and what they're prepared to pay above the headline.",
  "Comparable properties that are agreed but not yet completed at HM Land Registry — sometimes the most relevant data point.",
  "Anything that has happened in the local market in the last 12 weeks.",
];

const CANT_SEE_LANDLORD = [
  "Achievable rent vs. headline rent — what tenants will actually pay after viewings.",
  "Condition, finish and presentation — Land Registry only sees prices, not properties.",
  "Furnished vs. unfurnished, white-goods inclusions and bills configurations.",
  "Tenant demographic in your specific street and block.",
  "Compliance gaps (EPC, gas safety, HMO licensing) that affect what you can legally let for.",
];

function CantSeeSection({
  agency,
  variant,
}: {
  agency: PublicAgency;
  variant: "vendor" | "landlord" | "preparation";
}) {
  const lines =
    variant === "preparation"
      ? CANT_SEE_PREPARATION
      : variant === "landlord"
        ? CANT_SEE_LANDLORD
        : CANT_SEE_STANDARD;

  const eyebrow =
    variant === "preparation"
      ? "Why your in-person valuation matters"
      : variant === "landlord"
        ? "Why an in-person appraisal matters"
        : "Why an in-person visit matters";

  const heading =
    variant === "preparation"
      ? "What this report can't see — the case for the in-person visit."
      : "What this report can't see.";

  const closing =
    variant === "preparation"
      ? `${agency.ctaPerson} will visit in person and translate this public data into an actual valuation. Free, no obligation, and no pressure to list.`
      : variant === "landlord"
        ? `For an accurate rental appraisal that accounts for these, ${agency.ctaPerson} will visit in person. Free, no obligation, no pressure to instruct.`
        : `For an accurate valuation that accounts for these, ${agency.ctaPerson} will visit in person. Free, no obligation, and no pressure to list.`;

  const padding = variant === "preparation" ? "p-7 sm:p-10" : "p-6 sm:p-8";

  return (
    <div className={`mt-12 rounded-2xl ${padding}`} style={{ background: "var(--agency-primary)" }}>
      <div className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--agency-accent)" }}>
        {eyebrow}
      </div>
      <h2 className="mt-2 text-2xl sm:text-3xl font-semibold tracking-tight text-white">
        {heading}
      </h2>
      <ul className="mt-4 space-y-2 text-white/90 text-sm sm:text-base leading-relaxed">
        {lines.map((line) => (
          <li key={line} className="flex items-start gap-3">
            <span
              className="mt-2 w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ background: "var(--agency-accent)" }}
            />
            <span>{line}</span>
          </li>
        ))}
      </ul>
      <p className="mt-5 text-white/80 text-sm leading-relaxed">{closing}</p>
    </div>
  );
}

function BookCta({
  agency,
  onBook,
  variant = "inline",
}: {
  agency: PublicAgency;
  onBook: () => void;
  variant?: "inline" | "large";
}) {
  const isLandlord = agency.audience === "landlord";
  const isPreparation = agency.framing === "preparation";

  const largeHeading = isLandlord
    ? "Ready for a proper rental appraisal?"
    : isPreparation
      ? "Ready to discuss this with the experts?"
      : "Ready for a proper valuation?";

  const largeBody = isLandlord
    ? `Book a free, no-obligation 30-minute landlord appraisal with ${agency.ctaPerson} at ${agency.name}.`
    : isPreparation
      ? `Book a free, no-obligation in-person valuation with ${agency.ctaPerson} at ${agency.name}. The data above is the starting point; the visit is where the actual valuation happens.`
      : `Book a free, no-obligation 30-minute visit with ${agency.ctaPerson} at ${agency.name}.`;

  const largeButton = isLandlord
    ? `Book my landlord appraisal with ${agency.ctaPersonShort} →`
    : isPreparation
      ? `Book my in-person valuation with ${agency.ctaPersonShort} →`
      : `Book my free valuation with ${agency.ctaPersonShort} →`;

  if (variant === "large") {
    return (
      <div className="rounded-2xl border p-6 sm:p-8 bg-white" style={{ borderColor: "var(--agency-border)" }}>
        <h3 className="text-2xl sm:text-3xl font-semibold tracking-tight" style={{ color: "var(--agency-text)" }}>
          {largeHeading}
        </h3>
        <p className="mt-3 text-base" style={{ color: "var(--agency-muted)" }}>
          {largeBody}
        </p>
        <button
          type="button"
          onClick={onBook}
          className="agency-btn-primary w-full sm:w-auto mt-6 rounded-full px-8 py-4 text-base font-medium"
        >
          {largeButton}
        </button>
      </div>
    );
  }

  const inlineLead = isLandlord
    ? "Want a proper rental appraisal?"
    : isPreparation
      ? "Discuss this in person?"
      : "Want a precise number?";
  const inlineSub = isLandlord
    ? `Book a free landlord appraisal with ${agency.ctaPerson}.`
    : `Book a free in-person valuation with ${agency.ctaPerson}.`;

  return (
    <div
      className="rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between"
      style={{ background: "#fff", border: "1px solid var(--agency-border)" }}
    >
      <div className="min-w-0">
        <div className="font-semibold" style={{ color: "var(--agency-text)" }}>
          {inlineLead}
        </div>
        <div className="text-sm" style={{ color: "var(--agency-muted)" }}>
          {inlineSub}
        </div>
      </div>
      <button
        type="button"
        onClick={onBook}
        className="agency-btn-primary rounded-full px-6 py-3 text-sm font-medium whitespace-nowrap"
      >
        Book now →
      </button>
    </div>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", { month: "short", year: "numeric" });
}
