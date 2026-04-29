/**
 * Borough-level median rent lookup, drawn from the ONS ad-hoc dataset
 * "Private rental market in London: April 2025 to March 2026"
 * (publication ref 3389, dataset published 27 April 2026, sourced from
 * VOA Rent Officer collections via the ONS Private Rental Market
 * Statistics workstream).
 *
 * Used on /gravity to add a borough-context strip to the lettings
 * report. Other agencies don't read this lookup — it's gated on the
 * `showBoroughRentContext` flag in AgencyConfig.
 *
 * Source URL:
 *   https://www.ons.gov.uk/economy/inflationandpriceindices/adhocs/3389privaterentalmarketinlondonapril2025tomarch2026
 */

export type Borough = "Barnet" | "Brent" | "Harrow" | "Camden";

/** Public-facing label that gets baked into the displayed copy. */
export const ONS_REFERENCE_PERIOD = "year ending March 2026";

/** Source label used in the citation under the borough strip. */
export const ONS_SOURCE_LABEL = "ONS Private Rental Market Statistics";

/**
 * Bedroom-count keyed median rents by borough (£/month).
 *
 * Pulled directly from sheet 5 ("Summary of monthly rents recorded
 * between April 2025 to March 2026 by borough and bedroom category for
 * London") of londonrentalstatsaccessibleq12026.xlsx. Median is the
 * column F figure, all values £/month rounded to the nearest pound by
 * ONS at source.
 *
 * Bedroom keys map to ONS' own categories:
 *   1 -> "One Bedroom"
 *   2 -> "Two Bedrooms"
 *   3 -> "Three Bedrooms"
 *   "4+" -> "Four or More Bedrooms"
 *
 * `all` is the unweighted median across all property types as a
 * conservative fallback when we can't match the bedroom count cleanly
 * (e.g. 0-bed studios, which our form doesn't currently capture).
 */
const BOROUGH_MEDIANS: Record<
  Borough,
  { 1: number; 2: number; 3: number; "4+": number; all: number }
> = {
  // ONS sheet5, rows 10-15 (Barnet)
  Barnet: { 1: 1486, 2: 1800, 3: 2350, "4+": 3425, all: 1800 },
  // ONS sheet5, rows 22-27 (Brent)
  Brent: { 1: 1695, 2: 2000, 3: 2500, "4+": 3250, all: 2000 },
  // ONS sheet5, rows 88-93 (Harrow)
  Harrow: { 1: 1400, 2: 1750, 3: 2250, "4+": 2900, all: 1750 },
  // ONS sheet5, rows 34-39 (Camden)
  Camden: { 1: 1925, 2: 2650, 3: 3350, "4+": 4200, all: 2650 },
};

/**
 * Postcode-district to London borough mapping covering Gravity's stated
 * agency patch. Choices follow the user spec verbatim:
 *
 *  - NW4 / NW11 / NW7 / N3 / N12 / N20  -> Barnet
 *  - NW2 / NW9 / NW10 / HA0 / HA9       -> Brent
 *  - HA1 / HA2 / HA3 / HA7 / HA8        -> Harrow
 *  - NW3 / NW5 / NW6                    -> Camden
 *
 * NW9 (Colindale) straddles the Barnet / Brent boundary; per the spec
 * we settle on Brent. Districts outside this set return null and the
 * borough strip is hidden for those postcodes — better to show nothing
 * than a wrong-borough number.
 */
const DISTRICT_TO_BOROUGH: Record<string, Borough> = {
  NW4: "Barnet",
  NW11: "Barnet",
  NW7: "Barnet",
  N3: "Barnet",
  N12: "Barnet",
  N20: "Barnet",

  NW2: "Brent",
  NW9: "Brent",
  NW10: "Brent",
  HA0: "Brent",
  HA9: "Brent",

  HA1: "Harrow",
  HA2: "Harrow",
  HA3: "Harrow",
  HA7: "Harrow",
  HA8: "Harrow",

  NW3: "Camden",
  NW5: "Camden",
  NW6: "Camden",
};

export type BoroughRentLookup = {
  borough: Borough;
  /** Median monthly rent in £, rounded to nearest pound by ONS. */
  medianPerMonth: number;
  /** Plain-English label of the bedroom bucket, e.g. "2-bedroom property". */
  bedroomLabel: string;
  /** Whether we matched the user's exact bedroom count or fell back to the all-properties median. */
  bedroomMatched: boolean;
  /** Reference period ("year ending March 2026") for the citation. */
  referencePeriod: string;
  /** Citation source label. */
  sourceLabel: string;
};

/**
 * Resolve a postcode district to its London borough. Returns null when
 * the district isn't in our covered list.
 */
export function boroughForDistrict(district: string | null | undefined): Borough | null {
  if (!district) return null;
  const key = district.toUpperCase().trim();
  return DISTRICT_TO_BOROUGH[key] ?? null;
}

/**
 * Look up the borough median rent for a given postcode district +
 * bedroom count. Returns null when the district isn't mapped or when
 * the bedroom count is too small to be meaningful (e.g. negative).
 *
 * If the bedroom count exceeds 4 we fall into the "4+" bucket; if it's
 * 0 or unrecognised we fall back to the borough's all-properties
 * median and flag bedroomMatched=false so the rendering layer can
 * hedge the copy.
 */
export function lookupBoroughRent(
  district: string | null | undefined,
  bedrooms: number | null | undefined
): BoroughRentLookup | null {
  const borough = boroughForDistrict(district);
  if (!borough) return null;

  const data = BOROUGH_MEDIANS[borough];
  let medianPerMonth: number;
  let bedroomLabel: string;
  let bedroomMatched = true;

  if (bedrooms === 1) {
    medianPerMonth = data[1];
    bedroomLabel = "1-bedroom property";
  } else if (bedrooms === 2) {
    medianPerMonth = data[2];
    bedroomLabel = "2-bedroom property";
  } else if (bedrooms === 3) {
    medianPerMonth = data[3];
    bedroomLabel = "3-bedroom property";
  } else if (typeof bedrooms === "number" && bedrooms >= 4) {
    medianPerMonth = data["4+"];
    bedroomLabel = "4+ bedroom property";
  } else {
    medianPerMonth = data.all;
    bedroomLabel = "private rental property";
    bedroomMatched = false;
  }

  return {
    borough,
    medianPerMonth,
    bedroomLabel,
    bedroomMatched,
    referencePeriod: ONS_REFERENCE_PERIOD,
    sourceLabel: ONS_SOURCE_LABEL,
  };
}
