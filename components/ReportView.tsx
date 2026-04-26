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
              will refine this in person once they've seen the property, its condition, and the specifics
              of the local street.
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

        {/* Primary CTA (repeated at top so mobile users see it early) */}
        <div className="mt-8">
          <BookCta agency={agency} onBook={onBook} />
        </div>

        {/* Comparables */}
        <div className="mt-12">
          <h2 className="text-2xl font-semibold tracking-tight" style={{ color: "var(--agency-text)" }}>
            Recent comparable sales
          </h2>
          <p className="mt-1 text-sm" style={{ color: "var(--agency-muted)" }}>
            Same property type, sold nearby, verified by HM Land Registry.
          </p>

          <div className="mt-4 rounded-2xl border overflow-hidden bg-white" style={{ borderColor: "var(--agency-border)" }}>
            <ul>
              {result.comparables.map((c, i) => (
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
                  <div className="text-right font-semibold shrink-0" style={{ color: "var(--agency-text)" }}>
                    £{c.price.toLocaleString()}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* What this can't see */}
        <div className="mt-12 rounded-2xl p-6 sm:p-8" style={{ background: "var(--agency-primary)" }}>
          <div className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--agency-accent)" }}>
            Why an in-person visit matters
          </div>
          <h2 className="mt-2 text-2xl sm:text-3xl font-semibold tracking-tight text-white">
            What this report can't see.
          </h2>
          <ul className="mt-4 space-y-2 text-white/90 text-sm sm:text-base leading-relaxed">
            {[
              "The quality of your kitchen, bathrooms and finish.",
              "Loft conversions, extensions or layouts not captured in Land Registry.",
              "Lease terms, service charges and ground rent (for flats).",
              "Views, orientation, noise and the specifics of your block or street.",
              "Current demand: who's actively looking for a home like yours right now.",
            ].map((line) => (
              <li key={line} className="flex items-start gap-3">
                <span
                  className="mt-2 w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ background: "var(--agency-accent)" }}
                />
                <span>{line}</span>
              </li>
            ))}
          </ul>
          <p className="mt-5 text-white/80 text-sm leading-relaxed">
            For an accurate valuation that accounts for these, {agency.ctaPerson} will visit in
            person. Free, no obligation, and no pressure to list.
          </p>
        </div>

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
            Data: HM Land Registry Price Paid Data. Report generated {new Date(result.lastUpdated).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}.
          </div>
        </div>
      </div>
    </section>
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
  if (variant === "large") {
    return (
      <div className="rounded-2xl border p-6 sm:p-8 bg-white" style={{ borderColor: "var(--agency-border)" }}>
        <h3 className="text-2xl sm:text-3xl font-semibold tracking-tight" style={{ color: "var(--agency-text)" }}>
          Ready for a proper valuation?
        </h3>
        <p className="mt-3 text-base" style={{ color: "var(--agency-muted)" }}>
          Book a free, no-obligation 30-minute visit with {agency.ctaPerson} at {agency.name}.
        </p>
        <button
          type="button"
          onClick={onBook}
          className="agency-btn-primary w-full sm:w-auto mt-6 rounded-full px-8 py-4 text-base font-medium"
        >
          Book my free valuation with {agency.ctaPersonShort} →
        </button>
      </div>
    );
  }

  return (
    <div
      className="rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between"
      style={{ background: "#fff", border: "1px solid var(--agency-border)" }}
    >
      <div className="min-w-0">
        <div className="font-semibold" style={{ color: "var(--agency-text)" }}>
          Want a precise number?
        </div>
        <div className="text-sm" style={{ color: "var(--agency-muted)" }}>
          Book a free in-person valuation with {agency.ctaPerson}.
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
