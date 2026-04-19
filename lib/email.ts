import type { AgencyConfig } from "./branding";
import type { ValuationResult } from "./valuation";

export type BookingPayload = {
  name: string;
  email: string;
  phone: string;
  preferredTime: string;
  message: string;
  result: ValuationResult;
};

export function renderBookingEmailSubject(agency: AgencyConfig, payload: BookingPayload): string {
  return `New valuation request for ${agency.name}: ${payload.name} — ${payload.result.sector}`;
}

export function renderBookingEmailHtml(agency: AgencyConfig, payload: BookingPayload): string {
  const r = payload.result;
  const comps = r.comparables
    .map(
      (c) =>
        `<li style="margin:0 0 4px 0;">${escapeHtml(c.address)} (${escapeHtml(
          c.postcode
        )}) — £${c.price.toLocaleString()}, sold ${formatDate(c.date)}</li>`
    )
    .join("");

  return `
  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; color:#1a1a1a; line-height:1.5;">
    <h2 style="margin:0 0 12px 0;">New valuation request via ${escapeHtml(agency.name)} report</h2>

    <h3 style="margin:20px 0 8px;">Contact</h3>
    <table style="border-collapse:collapse;">
      <tr><td style="padding:4px 14px 4px 0;color:#666;">Name</td><td><strong>${escapeHtml(payload.name)}</strong></td></tr>
      <tr><td style="padding:4px 14px 4px 0;color:#666;">Email</td><td><a href="mailto:${encodeURIComponent(
        payload.email
      )}">${escapeHtml(payload.email)}</a></td></tr>
      <tr><td style="padding:4px 14px 4px 0;color:#666;">Phone</td><td><a href="tel:${encodeURIComponent(
        payload.phone
      )}">${escapeHtml(payload.phone)}</a></td></tr>
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

    <h3 style="margin:24px 0 8px;">Property</h3>
    <table style="border-collapse:collapse;">
      <tr><td style="padding:4px 14px 4px 0;color:#666;">Postcode</td><td>${escapeHtml(
        r.input.postcode
      )} (${escapeHtml(r.sector)})</td></tr>
      <tr><td style="padding:4px 14px 4px 0;color:#666;">Type</td><td>${propertyTypeLabel(
        r.input.propertyType
      )}</td></tr>
      <tr><td style="padding:4px 14px 4px 0;color:#666;">Bedrooms</td><td>${r.input.bedrooms}</td></tr>
      <tr><td style="padding:4px 14px 4px 0;color:#666;">Condition</td><td>${escapeHtml(
        r.input.condition
      )}</td></tr>
      <tr><td style="padding:4px 14px 4px 0;color:#666;">Features</td><td>${
        r.input.features.length ? r.input.features.map(escapeHtml).join(", ") : "none"
      }</td></tr>
    </table>

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
      ${comps}
    </ul>

    <p style="margin-top:24px;color:#666;font-size:12px;">
      Generated ${new Date().toISOString()} by ${escapeHtml(agency.reportName)} —
      <a href="${escapeHtml(agency.website)}">${escapeHtml(agency.website)}</a>
    </p>
  </div>
  `;
}

export function renderBookingEmailText(agency: AgencyConfig, payload: BookingPayload): string {
  const r = payload.result;
  return [
    `New valuation request via ${agency.name} report`,
    ``,
    `Name: ${payload.name}`,
    `Email: ${payload.email}`,
    `Phone: ${payload.phone}`,
    `Preferred time: ${payload.preferredTime}`,
    payload.message ? `Message: ${payload.message}` : "",
    ``,
    `Property: ${r.input.bedrooms}-bed ${propertyTypeLabel(r.input.propertyType)} in ${r.input.postcode} (${r.sector})`,
    `Condition: ${r.input.condition}`,
    `Features: ${r.input.features.join(", ") || "none"}`,
    ``,
    `Range shown: £${r.lowerBound.toLocaleString()} – £${r.upperBound.toLocaleString()}`,
    `Rental: £${r.rentalPcmLower.toLocaleString()} – £${r.rentalPcmUpper.toLocaleString()} pcm (~${r.yieldPercent.toFixed(1)}% yield)`,
    `Sample: ${r.sampleSize} sales, scope: ${r.sampleScope}`,
    ``,
    `Comparables:`,
    ...r.comparables.map(
      (c) => `  - ${c.address} (${c.postcode}) — £${c.price.toLocaleString()}, sold ${formatDate(c.date)}`
    ),
  ]
    .filter(Boolean)
    .join("\n");
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
