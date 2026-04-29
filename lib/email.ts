import type { AgencyConfig } from "./branding";
import type { ValuationResult } from "./valuation";
import type { OutOfDatabaseResult } from "../app/api/valuation/route";

export type BookingPayload = {
  name: string;
  email: string;
  phone: string;
  preferredTime: string;
  message: string;
  result: ValuationResult | null;
  outOfDb: OutOfDatabaseResult | null;
  /**
   * The audience the user actually transacted as. For single-audience
   * agencies this is the configured value; for /gravity (and any future
   * agency with allowAudienceSwitch) it's the user's pick.
   */
  audience: "vendor" | "landlord";
  /** Set when bookingMode === "calendar" and a slot was chosen. */
  slotDate: string | null;
  slotTime: string | null;
};

type Input = {
  postcode: string;
  propertyType: "F" | "T" | "S" | "D";
  bedrooms: number;
  condition: "needs-work" | "good" | "excellent" | "renovated";
  features: string[];
};

function getInput(payload: BookingPayload): Input | null {
  if (payload.result) return payload.result.input;
  if (payload.outOfDb) return payload.outOfDb.input;
  return null;
}

function getSectorOrDistrict(payload: BookingPayload): string {
  if (payload.result) return payload.result.sector;
  if (payload.outOfDb) return payload.outOfDb.district;
  return "";
}

export function renderBookingEmailSubject(agency: AgencyConfig, payload: BookingPayload): string {
  const where = getSectorOrDistrict(payload) || "no postcode";
  const oodTag = payload.outOfDb ? " [OUT-OF-DB, in patch]" : "";
  // Prefer the per-audience tag when the agency declares one (e.g. /gravity
  // wants distinct [GRAVITY, vendor lead] vs [GRAVITY, landlord lead] tags
  // so its inbox can route the two lead types separately). Fall back to
  // the single emailSubjectTag, then nothing.
  const audienceTag = agency.emailSubjectTagByAudience?.[payload.audience];
  const baseTag = audienceTag ?? agency.emailSubjectTag ?? "";
  const agencyTag = baseTag ? `${baseTag} ` : "";
  const noun = payload.audience === "landlord" ? "appraisal" : "valuation";
  const slotSuffix =
    payload.slotDate && payload.slotTime
      ? ` for ${formatSlotShort(payload.slotDate, payload.slotTime)}`
      : "";
  return `${agencyTag}New ${noun} request for ${agency.name}: ${payload.name} — ${where}${slotSuffix}${oodTag}`;
}

function formatSlotShort(dateIso: string, time: string): string {
  const d = new Date(dateIso + "T00:00:00");
  if (Number.isNaN(d.getTime())) return `${dateIso} ${time}`;
  const day = d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
  return `${day} ${time}`;
}

function formatSlotLong(dateIso: string, time: string): string {
  const d = new Date(dateIso + "T00:00:00");
  if (Number.isNaN(d.getTime())) return `${dateIso} at ${time}`;
  const weekday = d.toLocaleDateString("en-GB", { weekday: "long" });
  const dayMonth = d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return `${weekday} ${dayMonth} at ${time}`;
}

export function renderBookingEmailHtml(agency: AgencyConfig, payload: BookingPayload): string {
  const r = payload.result;
  const ood = payload.outOfDb;
  const input = getInput(payload);

  const compsHtml = r
    ? r.comparables
        .map(
          (c) =>
            `<li style="margin:0 0 4px 0;">${escapeHtml(c.address)} (${escapeHtml(
              c.postcode
            )}) — £${c.price.toLocaleString()}, sold ${formatDate(c.date)}</li>`
        )
        .join("")
    : "";

  const reportSection = r
    ? `
    <h3 style="margin:24px 0 8px;">Report shown to vendor</h3>
    <table style="border-collapse:collapse;">
      <tr><td style="padding:4px 14px 4px 0;color:#666;">Sale range</td><td>£${r.lowerBound.toLocaleString()} – £${r.upperBound.toLocaleString()}</td></tr>
      <tr><td style="padding:4px 14px 4px 0;color:#666;">Rental (PCM)</td><td>£${r.rentalPcmLower.toLocaleString()} – £${r.rentalPcmUpper.toLocaleString()} (~${r.yieldPercent.toFixed(
        1
      )}% yield)</td></tr>
      <tr><td style="padding:4px 14px 4px 0;color:#666;">Sample size</td><td>${r.sampleSize} (scope: ${escapeHtml(
        r.sampleScope
      )})</td></tr>
    </table>

    <h4 style="margin:20px 0 4px;">Comparables shown</h4>
    <ul style="padding-left:18px;margin:0;">
      ${compsHtml}
    </ul>`
    : ood
      ? `
    <h3 style="margin:24px 0 8px;">Out-of-database (in agency patch)</h3>
    <p style="margin:0 0 8px;">Postcode <strong>${escapeHtml(input?.postcode ?? "")}</strong> (${escapeHtml(
          ood.district
        )}) is in ${escapeHtml(agency.name)}'s coverage but outside the current Land Registry comparables we have loaded. Vendor was shown the "needs in-person" path; no automated valuation was generated.</p>`
      : "";

  const propertySection = input
    ? `
    <h3 style="margin:24px 0 8px;">Property</h3>
    <table style="border-collapse:collapse;">
      <tr><td style="padding:4px 14px 4px 0;color:#666;">Postcode</td><td>${escapeHtml(input.postcode)}</td></tr>
      <tr><td style="padding:4px 14px 4px 0;color:#666;">Type</td><td>${propertyTypeLabel(input.propertyType)}</td></tr>
      <tr><td style="padding:4px 14px 4px 0;color:#666;">Bedrooms</td><td>${input.bedrooms}</td></tr>
      <tr><td style="padding:4px 14px 4px 0;color:#666;">Condition</td><td>${escapeHtml(input.condition)}</td></tr>
      <tr><td style="padding:4px 14px 4px 0;color:#666;">Features</td><td>${
        input.features.length ? input.features.map(escapeHtml).join(", ") : "none"
      }</td></tr>
    </table>`
    : "";

  const slotRow =
    payload.slotDate && payload.slotTime
      ? `<tr><td style="padding:4px 14px 4px 0;color:#666;">Booked slot</td><td><strong>${escapeHtml(
          formatSlotLong(payload.slotDate, payload.slotTime)
        )}</strong></td></tr>`
      : "";

  const noun = payload.audience === "landlord" ? "appraisal" : "valuation";
  const audienceRow = `<tr><td style="padding:4px 14px 4px 0;color:#666;">Lead type</td><td>${escapeHtml(
    payload.audience
  )} ${noun}</td></tr>`;

  return `
  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; color:#1a1a1a; line-height:1.5;">
    <h2 style="margin:0 0 12px 0;">New ${escapeHtml(noun)} request via ${escapeHtml(agency.name)} report</h2>

    <h3 style="margin:20px 0 8px;">Contact</h3>
    <table style="border-collapse:collapse;">
      <tr><td style="padding:4px 14px 4px 0;color:#666;">Name</td><td><strong>${escapeHtml(payload.name)}</strong></td></tr>
      <tr><td style="padding:4px 14px 4px 0;color:#666;">Email</td><td><a href="mailto:${encodeURIComponent(
        payload.email
      )}">${escapeHtml(payload.email)}</a></td></tr>
      <tr><td style="padding:4px 14px 4px 0;color:#666;">Phone</td><td><a href="tel:${encodeURIComponent(
        payload.phone
      )}">${escapeHtml(payload.phone)}</a></td></tr>
      ${audienceRow}
      ${slotRow}
      <tr><td style="padding:4px 14px 4px 0;color:#666;">Preferred time</td><td>${escapeHtml(
        payload.preferredTime
      )}</td></tr>
      ${
        payload.message
          ? `<tr><td style="padding:4px 14px 4px 0;color:#666;vertical-align:top;">Message</td><td>${escapeHtml(
              payload.message
            ).replace(/\n/g, "<br>")}</td></tr>`
          : ""
      }
    </table>

    ${propertySection}

    ${reportSection}

    <p style="margin-top:24px;color:#666;font-size:12px;">
      Generated ${new Date().toISOString()} by ${escapeHtml(agency.reportName)} —
      <a href="${escapeHtml(agency.website)}">${escapeHtml(agency.website)}</a>
    </p>
  </div>
  `;
}

export function renderBookingEmailText(agency: AgencyConfig, payload: BookingPayload): string {
  const r = payload.result;
  const ood = payload.outOfDb;
  const input = getInput(payload);

  const noun = payload.audience === "landlord" ? "appraisal" : "valuation";
  const slotLine =
    payload.slotDate && payload.slotTime
      ? `Booked slot: ${formatSlotLong(payload.slotDate, payload.slotTime)}`
      : "";
  const lines: string[] = [
    `New ${noun} request via ${agency.name} report`,
    `Lead type: ${payload.audience} ${noun}`,
    ``,
    `Name: ${payload.name}`,
    `Email: ${payload.email}`,
    `Phone: ${payload.phone}`,
    slotLine,
    `Preferred time: ${payload.preferredTime}`,
    payload.message ? `Message: ${payload.message}` : "",
    ``,
  ];

  if (input) {
    lines.push(
      `Property: ${input.bedrooms}-bed ${propertyTypeLabel(input.propertyType)} in ${input.postcode}`,
      `Condition: ${input.condition}`,
      `Features: ${input.features.join(", ") || "none"}`,
      ``
    );
  }

  if (r) {
    lines.push(
      `Range shown: £${r.lowerBound.toLocaleString()} – £${r.upperBound.toLocaleString()}`,
      `Rental: £${r.rentalPcmLower.toLocaleString()} – £${r.rentalPcmUpper.toLocaleString()} pcm (~${r.yieldPercent.toFixed(1)}% yield)`,
      `Sample: ${r.sampleSize} sales, scope: ${r.sampleScope}`,
      ``,
      `Comparables:`,
      ...r.comparables.map(
        (c) => `  - ${c.address} (${c.postcode}) — £${c.price.toLocaleString()}, sold ${formatDate(c.date)}`
      )
    );
  } else if (ood) {
    lines.push(
      `OUT-OF-DATABASE: ${input?.postcode ?? ""} (${ood.district}) is in ${agency.name}'s coverage but outside the loaded Land Registry comparables.`,
      `Vendor was shown the "needs in-person" path; no automated valuation generated.`
    );
  }

  return lines.filter(Boolean).join("\n");
}

function propertyTypeLabel(t: string): string {
  return (
    { F: "Flat / Maisonette", T: "Terraced house", S: "Semi-detached house", D: "Detached house" } as Record<
      string,
      string
    >
  )[t] ?? t;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
