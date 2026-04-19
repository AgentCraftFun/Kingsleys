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

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Body = {
  agencySlug?: string;
  name?: string;
  email?: string;
  phone?: string;
  preferredTime?: string;
  message?: string;
  result?: ValuationResult;
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
  if (!body.result || typeof body.result !== "object") {
    return NextResponse.json({ error: "Missing report context" }, { status: 400 });
  }

  const payload: BookingPayload = {
    name,
    email,
    phone,
    preferredTime,
    message,
    result: body.result,
  };

  const subject = renderBookingEmailSubject(agency, payload);
  const html = renderBookingEmailHtml(agency, payload);
  const text = renderBookingEmailText(agency, payload);

  const to = process.env.BOOKING_TO_EMAIL ?? "JackColeProductions@gmail.com";
  const from = process.env.BOOKING_FROM_EMAIL ?? "Property Intelligence Report <onboarding@resend.dev>";
  const resendKey = process.env.RESEND_API_KEY;

  if (!resendKey) {
    // Dev fallback: log to server console so the flow is testable without a key.
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
