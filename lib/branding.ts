export type AgencyConfig = {
  slug: string;
  name: string;
  shortName: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  /** Public-facing director name. If unknown, set to null and put `directorFallback` text on the CTA. */
  directorName: string | null;
  directorTitle: string;
  directorFirstName: string | null;
  /** Used in CTAs when directorName is null, e.g. "the Ellis & Co Golders Green team". */
  directorFallback?: string;
  logoPath: string;
  logoAspect: "wide" | "square";
  colors: {
    primary: string;
    primaryHover: string;
    accent: string;
    bgSoft: string;
    text: string;
    muted: string;
    border: string;
  };
  tagline: string;
  /**
   * Postcode districts the agency actually operates in. Drives the displayed
   * coverage and the in-form "outside area" warning. May include districts
   * that aren't in our valuation DB.
   */
  postcodesInAgencyPatch: string[];
  /**
   * Subset of postcodesInAgencyPatch that we have Land Registry comparables
   * for. If a vendor's postcode is in patch but NOT in this list, the report
   * page shows a graceful "needs in-person" message instead of computed
   * comparables.
   */
  postcodesInValuationDB: string[];
  rentalYieldByArea: Record<string, number>;
  defaultRentalYield: number;
  reportName: string;
  /** "Golders Green", "North-West London", etc. Used in the page <title>. */
  area: string;
  /** Optional override for the Welcome trust tile title. Default: "Built for {first patch postcode}". */
  coverageHero?: string;
  /** Optional override for the Welcome coverage body line. Default: auto-formatted from postcodesInAgencyPatch. */
  coverageLine?: string;
};

export const agencyConfigs: Record<string, AgencyConfig> = {
  dreamview: {
    slug: "dreamview",
    name: "Dreamview Estates",
    shortName: "Dreamview",
    address: "34 Golders Green Road, London, NW11 8LL",
    phone: "020 8455 0055",
    email: "mail@dreamviewestates.co.uk",
    website: "https://dreamviewestates.co.uk",
    directorName: "Murray Lee",
    directorFirstName: "Murray",
    directorTitle: "Founder",
    logoPath: "/agencies/dreamview/logo.png",
    logoAspect: "wide",
    colors: {
      primary: "#5e1f2a",
      primaryHover: "#501a24",
      accent: "#7c8041",
      bgSoft: "#faf6f1",
      text: "#231518",
      muted: "#6b6b6b",
      border: "#e8dfd9",
    },
    tagline: "North West London's Award Winning Estate Agent",
    postcodesInAgencyPatch: ["NW11", "NW4", "NW3", "NW2"],
    postcodesInValuationDB: ["NW11", "NW4", "NW3", "NW2"],
    rentalYieldByArea: {
      NW11: 0.038,
      NW4: 0.045,
      NW3: 0.032,
      NW2: 0.05,
    },
    defaultRentalYield: 0.04,
    reportName: "Property Intelligence Report",
    area: "Golders Green",
    coverageHero: "Built for NW11 and the local NW patch.",
  },
  kingsleys: {
    slug: "kingsleys",
    name: "Kingsleys Estates",
    shortName: "Kingsleys",
    address: "92 Golders Green Road, London, NW11 8HB",
    phone: "020 8458 3333",
    email: "info@kingsleys.uk",
    website: "https://www.kingsleys-estates.co.uk",
    directorName: "Eyal Landau",
    directorFirstName: "Eyal",
    directorTitle: "Director",
    logoPath: "/agencies/kingsleys/logo.png",
    logoAspect: "wide",
    colors: {
      primary: "#141c3b",
      primaryHover: "#0d1328",
      accent: "#b8945f",
      bgSoft: "#f6f6f3",
      text: "#141c3b",
      muted: "#6b7280",
      border: "#e5e5e0",
    },
    tagline: "Big Enough To Cope, Small Enough To Care",
    postcodesInAgencyPatch: ["NW11", "N6", "NW2", "NW3", "NW4", "NW7"],
    postcodesInValuationDB: ["NW11", "N6", "NW2", "NW3", "NW4", "NW7"],
    rentalYieldByArea: {
      NW11: 0.038,
      N6: 0.033,
      NW2: 0.05,
      NW3: 0.032,
      NW4: 0.045,
      NW7: 0.04,
    },
    defaultRentalYield: 0.04,
    reportName: "Property Intelligence Report",
    area: "Golders Green",
    coverageHero: "Built for Golders Green.",
  },
  gravity: {
    slug: "gravity",
    name: "Gravity Estates",
    shortName: "Gravity",
    address: "18 Golders Green Road, London, NW11 8LL",
    phone: "020 8458 8200",
    email: "info@gravity-estates.com",
    website: "https://www.gravity-estates.com",
    directorName: "Mykhaylo Datsyuk",
    directorFirstName: "Mykhaylo",
    directorTitle: "Director",
    logoPath: "/agencies/gravity/logo.png",
    logoAspect: "wide",
    colors: {
      primary: "#2d3a4d",
      primaryHover: "#1f2a39",
      accent: "#b8945f",
      bgSoft: "#f5f3ee",
      text: "#1d2330",
      muted: "#6b7280",
      border: "#e2dfd6",
    },
    tagline: "Independent sales and lettings, Golders Green",
    postcodesInAgencyPatch: [
      "NW2", "NW3", "NW4", "NW6", "NW9", "NW10", "NW11",
      "HA0", "HA1", "HA2", "HA3", "HA7", "HA8", "HA9",
      "N2", "N3", "W5", "WD6",
    ],
    postcodesInValuationDB: ["NW2", "NW3", "NW4", "NW6", "NW9", "NW10", "NW11"],
    rentalYieldByArea: {
      NW2: 0.05,
      NW3: 0.032,
      NW4: 0.045,
      NW6: 0.04,
      NW9: 0.045,
      NW10: 0.05,
      NW11: 0.038,
    },
    defaultRentalYield: 0.045,
    reportName: "Property Intelligence Report",
    area: "Golders Green",
    coverageHero: "Built for North-West London.",
    coverageLine:
      "Covering Golders Green, Hampstead, Hendon, Finchley, West Hampstead, Wembley, Harrow, Stanmore and surrounding NW and outer-West London postcodes.",
  },
  ellisandco: {
    slug: "ellisandco",
    name: "Ellis & Co",
    shortName: "Ellis & Co",
    address: "52 Golders Green Road, London, NW11 8LN",
    phone: "020 8455 1014",
    email: "goldersgreen@ellisandco.co.uk",
    website: "https://www.ellisandco.co.uk/estate-agents-and-letting-agents/branch/golders-green/",
    directorName: null,
    directorFirstName: null,
    directorTitle: "Branch team",
    directorFallback: "the Ellis & Co Golders Green team",
    logoPath: "/agencies/ellisandco/logo.svg",
    logoAspect: "wide",
    colors: {
      primary: "#a91d36",
      primaryHover: "#8a172c",
      accent: "#1a1a1a",
      bgSoft: "#f7f3f3",
      text: "#1a1a1a",
      muted: "#6b6b6b",
      border: "#ece4e4",
    },
    tagline: "Golders Green branch — sales and lettings since the team have been at this office for decades",
    postcodesInAgencyPatch: ["NW11", "NW2", "NW3", "NW4", "HA8"],
    postcodesInValuationDB: ["NW11", "NW2", "NW3", "NW4"],
    rentalYieldByArea: {
      NW11: 0.038,
      NW2: 0.05,
      NW3: 0.032,
      NW4: 0.045,
    },
    defaultRentalYield: 0.04,
    reportName: "Property Intelligence Report",
    area: "Golders Green",
    coverageHero: "Built for Golders Green and the surrounding area.",
    coverageLine:
      "Covering Golders Green (NW11), Hendon (NW4), Cricklewood (NW2), Hampstead (NW3) and Edgware (HA8).",
  },
};

export function getAgency(slug: string): AgencyConfig | null {
  return agencyConfigs[slug.toLowerCase()] ?? null;
}

/** "Eyal Landau" or "the Ellis & Co Golders Green team" — used in CTAs. */
export function ctaPersonLabel(agency: AgencyConfig): string {
  return agency.directorName ?? agency.directorFallback ?? `the ${agency.name} team`;
}

/** "Eyal" or "the Ellis & Co Golders Green team" — for shorter inline references. */
export function ctaPersonShort(agency: AgencyConfig): string {
  return agency.directorFirstName ?? agency.directorFallback ?? `the ${agency.shortName} team`;
}

export function agencyCssVars(config: AgencyConfig): React.CSSProperties {
  return {
    ["--agency-primary" as string]: config.colors.primary,
    ["--agency-primary-hover" as string]: config.colors.primaryHover,
    ["--agency-accent" as string]: config.colors.accent,
    ["--agency-bg-soft" as string]: config.colors.bgSoft,
    ["--agency-text" as string]: config.colors.text,
    ["--agency-muted" as string]: config.colors.muted,
    ["--agency-border" as string]: config.colors.border,
  } as React.CSSProperties;
}
