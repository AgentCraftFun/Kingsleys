import { NextResponse } from "next/server";
import { calculateValuation } from "@/lib/valuation";
import { getAgency } from "@/lib/branding";
import { isValidOutwardOrFull } from "@/lib/postcode";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Body = {
  agencySlug?: string;
  postcode?: string;
  propertyType?: "F" | "T" | "S" | "D";
  bedrooms?: number;
  condition?: "needs-work" | "good" | "excellent" | "renovated";
  features?: string[];
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
  if (!agency) {
    return NextResponse.json({ error: "Unknown agency" }, { status: 404 });
  }

  const { postcode, propertyType, bedrooms, condition, features } = body;

  if (!postcode || !isValidOutwardOrFull(postcode)) {
    return NextResponse.json({ error: "Invalid postcode" }, { status: 400 });
  }
  if (!propertyType || !["F", "T", "S", "D"].includes(propertyType)) {
    return NextResponse.json({ error: "Invalid property type" }, { status: 400 });
  }
  if (!bedrooms || bedrooms < 1 || bedrooms > 10) {
    return NextResponse.json({ error: "Invalid bedroom count" }, { status: 400 });
  }
  if (!condition || !["needs-work", "good", "excellent", "renovated"].includes(condition)) {
    return NextResponse.json({ error: "Invalid condition" }, { status: 400 });
  }

  try {
    const result = calculateValuation(
      {
        postcode,
        propertyType,
        bedrooms,
        condition,
        features: Array.isArray(features) ? features.slice(0, 10) : [],
      },
      agency
    );
    return NextResponse.json(result);
  } catch (e) {
    console.error("valuation error", e);
    return NextResponse.json(
      { error: "Could not calculate valuation. Please try a different postcode." },
      { status: 500 }
    );
  }
}
