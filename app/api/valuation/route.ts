import { NextResponse } from "next/server";
import { calculateValuation, type ValuationResult } from "@/lib/valuation";
import { getAgency } from "@/lib/branding";
import { getPostcodeDistrict, isValidOutwardOrFull, normalisePostcode } from "@/lib/postcode";

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

export type OutOfDatabaseResult = {
  outOfDatabase: true;
  district: string;
  input: {
    postcode: string;
    propertyType: "F" | "T" | "S" | "D";
    bedrooms: number;
    condition: "needs-work" | "good" | "excellent" | "renovated";
    features: string[];
  };
};

export type ValuationResponse = ValuationResult | OutOfDatabaseResult;

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

  const normalisedPostcode = normalisePostcode(postcode);
  const district = getPostcodeDistrict(normalisedPostcode);
  if (!district) {
    return NextResponse.json({ error: "Could not parse postcode" }, { status: 400 });
  }

  const input = {
    postcode: normalisedPostcode,
    propertyType,
    bedrooms,
    condition,
    features: Array.isArray(features) ? features.slice(0, 10) : [],
  };

  // If the postcode is in the agency's coverage but not in our valuation DB,
  // skip the calculator and return an "out-of-database" marker. The frontend
  // shows a friendly "we'll value this in person" path that still captures
  // the booking.
  //
  // Match both the full district ("W1U") and the trailing-letter-stripped
  // base ("W1"). Real vendor postcodes in central London use sub-letter
  // districts like W1U, W1H, EC1A, SW1A which won't equal the "W1" or "EC1"
  // entries in patch lists. The base-strip lets a config write "W1" and
  // catch every W1x postcode a vendor might enter.
  const districtBase = district.replace(/[A-Z]$/, "");
  const matchesPatch = (p: string) => p === district || p === districtBase;
  const inPatch = agency.postcodesInAgencyPatch.some(matchesPatch);
  const inDb = agency.postcodesInValuationDB.some(matchesPatch);
  if (inPatch && !inDb) {
    return NextResponse.json({
      outOfDatabase: true,
      district,
      input,
    } satisfies OutOfDatabaseResult);
  }

  try {
    const result = calculateValuation(input, agency);
    return NextResponse.json(result);
  } catch (e) {
    console.error("valuation error", e);
    return NextResponse.json(
      { error: "Could not calculate valuation. Please try a different postcode." },
      { status: 500 }
    );
  }
}
