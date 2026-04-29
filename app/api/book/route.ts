import { NextResponse } from "next/server";
import { Resend } from "resend";
import { getAgency } from "@/lib/branding";
import {
  renderBookingEmailHtml,
  renderBookingEmailSubject,
  renderBookingEmailText,
  type BookingPayload,
} from "@/lib/email";
import type { ValuationResult } from "@/lib/valuation";
import type { OutOfDatabaseResult } from "@/app/api/valuation/route";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Body = {
  agencySlug?: string;
  name?: string;
  email?: string;
  phone?: string;
  preferredTime?: string;
  message?: string;
  result?: ValuationResult | null;
  outOfDatabase?: OutOfDatabaseResult | null;
  /** User-selected audience for agencies with allowAudienceSwitch=true. */
  audience?: "vendor" | "landlord";
  /** ISO yyyy-mm-dd, only set when bookingMode === "calendar". */
  slotDate?: string | null;
  /** "10:30" etc, only set when bookingMode === "calendar". */
  slotTime?: string | null;
};

export async function POST(req: Request) {
  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const slug = (body.agencySlug ?? "").toLowerCase();
  const agency = getAgency(slug);
  if (!agency) return NextResponse.json({ error: "Unknown agency" }, { status: 404 });

  const name = (body.name ?? "").trim();
  const email = (body.email ?? "").trim();
  const phone = (body.phone ?? "").trim();
  const preferredTime = (body.preferredTime ?? "").trim();
  const message = (body.message ?? "").trim();

  if (!name || name.length < 2) return NextResponse.json({ error: "Please enter your name" }, { status: 400 });
  if (!/\S+@\S+\.\S+/.test(email)) return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  if (!phone || phone.length < 7) return NextResponse.json({ error: "Invalid phone number" }, { status: 400 });

  const result = body.result ?? null;
  const outOfDb = body.outOfDatabase ?? null;
  if (!result && !outOfDb) {
    return NextResponse.json({ error: "Missing report context" }, { status: 400 });
  }

  // Effective audience: trust the client value only if it's a valid string
  // and the agency actually supports switching. Otherwise fall back to the
  // agency's configured audience — guards against a bookmarked /gravity URL
  // that submits a payload meant for a single-audience agency.
  const audienceFromBody =
    body.audience === "vendor" || body.audience === "landlord" ? body.audience : null;
  const effectiveAudience: "vendor" | "landlord" =
    agency.allowAudienceSwitch && audienceFromBody ? audienceFromBody : agency.audience;

  const slotDate = typeof body.slotDate === "string" ? body.slotDate.trim() : "";
  const slotTime = typeof body.slotTime === "string" ? body.slotTime.trim() : "";

  const payload: BookingPayload = {
    name,
    email,
    phone,
    preferredTime,
    message,
    result,
    outOfDb,
    audience: effectiveAudience,
    slotDate: slotDate || null,
    slotTime: slotTime || null,
  };

  const subject = renderBookingEmailSubject(agency, payload);
  const html = renderBookingEmailHtml(agency, payload);
  const text = renderBookingEmailText(agency, payload);

  const to = process.env.BOOKING_TO_EMAIL ?? "JackColeProductions@gmail.com";
  const from = process.env.BOOKING_FROM_EMAIL ?? "Property Intelligence Report <onboarding@resend.dev>";
  const resendKey = process.env.RESEND_API_KEY;

  if (!resendKey) {
    console.log("\n=== BOOKING REQUEST (no RESEND_API_KEY set) ===");
    console.log("To:", to);
    console.log("Subject:", subject);
    console.log(text);
    console.log("=== END ===\n");
    return NextResponse.json({ ok: true, delivered: false, reason: "email-dev-mode" });
  }

  try {
    const resend = new Resend(resendKey);
    const { data, error } = await resend.emails.send({
      from,
      to,
      replyTo: email,
      subject,
      html,
      text,
    });
    if (error) {
      console.error("resend error", error);
      return NextResponse.json({ error: "Could not send email" }, { status: 502 });
    }
    return NextResponse.json({ ok: true, delivered: true, id: data?.id ?? null });
  } catch (e) {
    console.error("booking error", e);
    return NextResponse.json({ error: "Could not send email" }, { status: 500 });
  }
}
