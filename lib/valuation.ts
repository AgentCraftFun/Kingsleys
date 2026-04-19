import { getDb, type SaleRow } from "./db";
import { getPostcodeDistrict, getPostcodeSector, normalisePostcode } from "./postcode";
import type { AgencyConfig } from "./branding";

export type PropertyType = "F" | "T" | "S" | "D";
export type Condition = "needs-work" | "good" | "excellent" | "renovated";

export const PROPERTY_TYPE_LABEL: Record<PropertyType, string> = {
  F: "Flat / Maisonette",
  T: "Terraced house",
  S: "Semi-detached house",
  D: "Detached house",
};

export const CONDITION_ADJUSTMENT: Record<Condition, number> = {
  "needs-work": -0.1,
  good: 0,
  excellent: 0.05,
  renovated: 0.1,
};

export const CONDITION_LABEL: Record<Condition, string> = {
  "needs-work": "Needs modernising",
  good: "Good condition",
  excellent: "Excellent condition",
  renovated: "Recently renovated",
};

export type ValuationInput = {
  postcode: string;
  propertyType: PropertyType;
  bedrooms: number;
  condition: Condition;
  features: string[];
};

export type Comparable = {
  address: string;
  postcode: string;
  price: number;
  date: string;
  propertyTypeLabel: string;
  propertyType: PropertyType;
};

export type ValuationResult = {
  input: ValuationInput;
  district: string;
  sector: string;
  centralEstimate: number;
  lowerBound: number;
  upperBound: number;
  sampleSize: number;
  sampleScope: "sector" | "district" | "wider";
  medianSaleInArea: number;
  rentalPcmLower: number;
  rentalPcmUpper: number;
  yieldPercent: number;
  comparables: Comparable[];
  monthsCovered: number;
  lastUpdated: string;
};

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

function percentile(values: number[], p: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const idx = Math.max(0, Math.min(sorted.length - 1, Math.floor((sorted.length - 1) * p)));
  return sorted[idx];
}

function bedroomMultiplier(type: PropertyType, bedrooms: number): number {
  const anchor: Record<PropertyType, number> = { F: 2, T: 3, S: 3, D: 4 };
  const perBed: Record<PropertyType, number> = { F: 0.16, T: 0.12, S: 0.1, D: 0.1 };
  const diff = bedrooms - anchor[type];
  return 1 + diff * perBed[type];
}

function featureAdjustment(features: string[], type: PropertyType): number {
  let adj = 0;
  for (const f of features) {
    switch (f) {
      case "garden":
        adj += type === "F" ? 0.05 : 0.02;
        break;
      case "parking":
        adj += 0.02;
        break;
      case "period":
        adj += 0.02;
        break;
      case "share-of-freehold":
        adj += type === "F" ? 0.04 : 0;
        break;
      case "loft-potential":
        adj += 0.015;
        break;
    }
  }
  return Math.min(adj, 0.1);
}

function roundTo(n: number, step: number): number {
  return Math.round(n / step) * step;
}

function formatAddressPaon(paon: string | null, saon: string | null, street: string | null): string {
  const parts: string[] = [];
  if (saon) parts.push(saon);
  if (paon) parts.push(paon);
  const addr = parts.join(", ");
  const streetPart = street ? street.replace(/\b\w/g, (c) => c.toUpperCase()) : "";
  return `${addr} ${streetPart}`.trim();
}

function titleCase(s: string | null | undefined): string {
  if (!s) return "";
  return s
    .toLowerCase()
    .replace(/\b([a-z])/g, (m) => m.toUpperCase())
    .replace(/'S\b/g, "'s");
}

export function calculateValuation(input: ValuationInput, agency: AgencyConfig): ValuationResult {
  const postcode = normalisePostcode(input.postcode);
  const sector = getPostcodeSector(postcode);
  const district = getPostcodeDistrict(postcode);

  if (!district) {
    throw new Error("Invalid postcode");
  }

  const db = getDb();

  type Row = Pick<SaleRow, "price" | "date_of_transfer" | "postcode" | "postcode_sector" | "property_type" | "paon" | "saon" | "street">;

  let rows: Row[] = [];
  let scope: ValuationResult["sampleScope"] = "sector";

  if (sector) {
    rows = db
      .prepare(
        `SELECT price, date_of_transfer, postcode, postcode_sector, property_type, paon, saon, street
         FROM sales
         WHERE postcode_sector = ? AND property_type = ?
         ORDER BY date_of_transfer DESC`
      )
      .all(sector, input.propertyType) as Row[];
  }

  if (rows.length < 8) {
    scope = "district";
    rows = db
      .prepare(
        `SELECT price, date_of_transfer, postcode, postcode_sector, property_type, paon, saon, street
         FROM sales
         WHERE postcode_district = ? AND property_type = ?
         ORDER BY date_of_transfer DESC`
      )
      .all(district, input.propertyType) as Row[];
  }

  if (rows.length < 5) {
    scope = "wider";
    rows = db
      .prepare(
        `SELECT price, date_of_transfer, postcode, postcode_sector, property_type, paon, saon, street
         FROM sales
         WHERE postcode_district IN ('NW11','NW4','NW3','NW2') AND property_type = ?
         ORDER BY date_of_transfer DESC`
      )
      .all(input.propertyType) as Row[];
  }

  const trimmedForMedian = rows.slice(0, 80);
  const prices = trimmedForMedian.map((r) => r.price);
  const p25 = percentile(prices, 0.25);
  const p75 = percentile(prices, 0.75);
  const iqr = p75 - p25;
  const lowFence = p25 - iqr * 1.5;
  const highFence = p75 + iqr * 1.5;
  const cleaned = prices.filter((p) => p >= lowFence && p <= highFence);
  const areaMedian = median(cleaned.length >= 5 ? cleaned : prices);

  const bedMult = bedroomMultiplier(input.propertyType, input.bedrooms);
  const condAdj = CONDITION_ADJUSTMENT[input.condition];
  const featAdj = featureAdjustment(input.features, input.propertyType);

  const central = areaMedian * bedMult * (1 + condAdj + featAdj);
  const lower = central * 0.92;
  const upper = central * 1.08;

  const yieldPct = agency.rentalYieldByArea[district] ?? agency.defaultRentalYield;
  const rentalMonthly = (central * yieldPct) / 12;
  const rentalLower = rentalMonthly * 0.95;
  const rentalUpper = rentalMonthly * 1.05;

  const compLow = central * 0.6;
  const compHigh = central * 1.5;
  const toComparable = (r: Row): Comparable => ({
    address: titleCase(formatAddressPaon(r.paon, r.saon, r.street)),
    postcode: r.postcode,
    price: r.price,
    date: r.date_of_transfer,
    propertyTypeLabel: PROPERTY_TYPE_LABEL[r.property_type as PropertyType] ?? r.property_type,
    propertyType: r.property_type as PropertyType,
  });

  const inBand = rows.filter((r) => r.price >= compLow && r.price <= compHigh);
  const sectorBand = sector ? inBand.filter((r) => r.postcode_sector === sector) : [];
  const comparables: Comparable[] = [];
  const seen = new Set<string>();

  const pushUnique = (r: Row) => {
    const key = `${r.paon}-${r.street}-${r.postcode}-${r.date_of_transfer}`;
    if (seen.has(key)) return;
    seen.add(key);
    comparables.push(toComparable(r));
  };

  for (const r of sectorBand) {
    if (comparables.length >= 5) break;
    pushUnique(r);
  }
  if (comparables.length < 5) {
    for (const r of inBand) {
      if (comparables.length >= 5) break;
      pushUnique(r);
    }
  }
  if (comparables.length < 3) {
    for (const r of rows) {
      if (comparables.length >= 5) break;
      pushUnique(r);
    }
  }

  const oldest = rows.length ? rows[rows.length - 1].date_of_transfer : null;
  const newest = rows.length ? rows[0].date_of_transfer : null;
  const monthsCovered =
    oldest && newest
      ? Math.max(1, Math.round((new Date(newest).getTime() - new Date(oldest).getTime()) / (1000 * 60 * 60 * 24 * 30)))
      : 0;

  return {
    input,
    district,
    sector: sector ?? district,
    centralEstimate: Math.round(central),
    lowerBound: roundTo(lower, 5000),
    upperBound: roundTo(upper, 5000),
    sampleSize: rows.length,
    sampleScope: scope,
    medianSaleInArea: Math.round(areaMedian),
    rentalPcmLower: roundTo(rentalLower, 25),
    rentalPcmUpper: roundTo(rentalUpper, 25),
    yieldPercent: yieldPct * 100,
    comparables,
    monthsCovered,
    lastUpdated: new Date().toISOString(),
  };
}
