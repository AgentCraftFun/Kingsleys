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
  /**
   * Drives which numbers are emphasised in the report and what the CTA copy
   * says. Vendor pages lead with sale price range and "30-minute valuation".
   * Landlord pages lead with rental PCM and "landlord appraisal".
   */
  audience: "vendor" | "landlord";
  /**
   * Tone of the report page.
   * - "standard" (default): the calculator IS the value prop alongside the
   *   in-person CTA.
   * - "preparation": the calculator is positioned as preparation reading for
   *   the in-person visit. Price range is de-emphasised, comparables and
   *   "what this can't see" are amplified. Used for agencies that publicly
   *   campaign against AVMs (Winkworth).
   */
  framing: "standard" | "preparation";
  /** Optional override for the Welcome H1 (default: "Discover what your home is really worth."). */
  heroHeadline?: string;
  /** Optional override for the Welcome intro paragraph. */
  heroSubline?: string;
  /** Fully custom <title> string. Default: "Property Valuation — {name}, {area}". */
  pageTitle?: string;
  /** Tag prepended to booking email subjects, e.g. "[RAWLINS — landlord lead]". */
  emailSubjectTag?: string;
  /** Header background: white (default) or the agency's primary colour (e.g. Winkworth, dark green). */
  headerBg?: "white" | "primary";
  /**
   * Set true for agencies that should be EXCLUDED from the first-wave email
   * sequence. Used by scripts/list-sendable.ts. Page is still buildable so
   * the asset exists for later, but the slug is filtered out of any
   * sending list.
   */
  doNotSendBeforeFirstReferences?: boolean;
};

/** Returns the slugs that should be in the first-wave outreach sequence. */
export function sendableSlugs(): string[] {
  return Object.values(agencyConfigs)
    .filter((a) => !a.doNotSendBeforeFirstReferences)
    .map((a) => a.slug);
}

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
    audience: "vendor",
    framing: "standard",
    heroHeadline: "What's your NW London home worth?",
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
    audience: "vendor",
    framing: "standard",
    heroHeadline: "What's your Golders Green home worth?",
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
    audience: "vendor",
    framing: "standard",
    heroHeadline: "What's your North-West London home worth?",
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
      primary: "#1f4e79",
      primaryHover: "#163c5e",
      accent: "#7eb9d9",
      bgSoft: "#f4f8fb",
      text: "#172a3f",
      muted: "#5e6b7a",
      border: "#dde6ee",
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
    audience: "vendor",
    framing: "standard",
    heroHeadline: "What's your Golders Green home worth in today's market?",
  },
  rawlins: {
    slug: "rawlins",
    name: "Rawlins Estates",
    shortName: "Rawlins",
    address: "Unit 325, 78 Golders Green Road, London, NW11 8LN",
    phone: "020 8371 0033",
    email: "info@rawlinsestates.co.uk",
    website: "https://www.rawlinsestates.co.uk",
    directorName: "Rachel Elroy",
    directorFirstName: "Rachel",
    directorTitle: "Director",
    logoPath: "/agencies/rawlins/logo.svg",
    logoAspect: "wide",
    colors: {
      primary: "#7d7836",
      primaryHover: "#5d5826",
      accent: "#2c2b16",
      bgSoft: "#f8f6ee",
      text: "#2c2b16",
      muted: "#6f6a4a",
      border: "#e2dec8",
    },
    tagline: "Lettings and landlord-focused, NW London",
    postcodesInAgencyPatch: ["NW11", "NW2", "NW6"],
    postcodesInValuationDB: ["NW11", "NW2", "NW6"],
    rentalYieldByArea: {
      NW11: 0.038,
      NW2: 0.05,
      NW6: 0.04,
    },
    defaultRentalYield: 0.045,
    reportName: "Landlord Rental Report",
    area: "NW London",
    coverageHero: "Built for landlords in NW London.",
    coverageLine: "Covering NW11, NW2 and NW6 — focused on the NW London lettings market.",
    audience: "landlord",
    framing: "standard",
    pageTitle: "Landlord Rental Report — Rawlins Estates, NW London",
    emailSubjectTag: "[RAWLINS — landlord lead]",
    heroHeadline: "What rent could your NW London property achieve?",
    heroSubline:
      "A data-driven rental report for your NW London property, based on local lettings yields and HM Land Registry capital values. Free, no obligation — then, if you'd like, an in-person landlord appraisal with Rachel Elroy.",
  },
  goldersgreenestates: {
    slug: "goldersgreenestates",
    name: "Golders Green Estates",
    shortName: "GG Estates",
    address: "14 Pennine Parade, London, NW2 1NT",
    phone: "020 8728 0700",
    email: "info@goldersgreenestates.uk",
    website: "https://goldersgreenestates.uk",
    directorName: "Asfia Saleh",
    directorFirstName: "Asfia",
    directorTitle: "Director",
    logoPath: "/agencies/goldersgreenestates/logo.png",
    logoAspect: "wide",
    colors: {
      primary: "#3d4022",
      primaryHover: "#2a2c17",
      accent: "#dba946",
      bgSoft: "#f7f4ec",
      text: "#1f2014",
      muted: "#6b6c5e",
      border: "#e6e2d3",
    },
    tagline: "Independent NW London estate agent",
    postcodesInAgencyPatch: ["NW11", "NW2", "NW4"],
    postcodesInValuationDB: ["NW11", "NW2", "NW4"],
    rentalYieldByArea: {
      NW11: 0.038,
      NW2: 0.05,
      NW4: 0.045,
    },
    defaultRentalYield: 0.04,
    reportName: "Property Intelligence Report",
    area: "NW11",
    coverageHero: "Built for NW11 and surrounding areas.",
    audience: "vendor",
    framing: "standard",
    pageTitle: "Property Valuation — Golders Green Estates, NW11",
    emailSubjectTag: "[GG-ESTATES — vendor lead]",
    heroHeadline: "What's your Golders Green home worth in 2026?",
  },
  hendonestates: {
    slug: "hendonestates",
    name: "Hendon Estates",
    shortName: "Hendon Estates",
    address: "135 Golders Green Road, London, NW11 8HG",
    phone: "020 8202 3817",
    email: "info@hendonestates.com",
    website: "https://hendonestates.com",
    directorName: "Sheldon Bodner",
    directorFirstName: "Sheldon",
    directorTitle: "Director",
    logoPath: "/agencies/hendonestates/logo.png",
    logoAspect: "wide",
    colors: {
      primary: "#cf0a08",
      primaryHover: "#a30806",
      accent: "#1a1414",
      bgSoft: "#faf6f4",
      text: "#1a1414",
      muted: "#6e5e5c",
      border: "#ecdedb",
    },
    tagline: "NW11 family homes — sales, lettings and landlord services",
    postcodesInAgencyPatch: ["NW11", "NW4", "NW2"],
    postcodesInValuationDB: ["NW11", "NW4", "NW2"],
    rentalYieldByArea: {
      NW11: 0.038,
      NW4: 0.045,
      NW2: 0.05,
    },
    defaultRentalYield: 0.04,
    reportName: "Property Intelligence Report",
    area: "Golders Green & Hendon",
    coverageHero: "Built for NW11 and Hendon family homes from £750k to £1.5m+.",
    coverageLine: "Covering Golders Green (NW11), Hendon (NW4) and Cricklewood (NW2) — focused on NW family homes.",
    audience: "vendor",
    framing: "standard",
    pageTitle: "Property Valuation — Hendon Estates, Golders Green & Hendon",
    emailSubjectTag: "[HENDON — vendor lead]",
    headerBg: "primary",
    heroHeadline: "What's your Hendon or NW11 home worth?",
  },
  keyhaven: {
    slug: "keyhaven",
    name: "Key Haven Estates",
    shortName: "Key Haven",
    address: "233A Golders Green Road, London, NW11 9ES",
    phone: "020 3641 0749",
    email: "info@keyhavenestates.co.uk",
    website: "https://keyhavenestates.co.uk",
    directorName: "Simon Cymerman",
    directorFirstName: "Simon",
    directorTitle: "Director",
    logoPath: "/agencies/keyhaven/logo.png",
    logoAspect: "wide",
    colors: {
      primary: "#1f44e0",
      primaryHover: "#173399",
      accent: "#59adff",
      bgSoft: "#f3f7ff",
      text: "#0f1933",
      muted: "#6b7280",
      border: "#dde4f5",
    },
    tagline: "NW11 sales, lettings and property management",
    postcodesInAgencyPatch: ["NW11", "NW2"],
    postcodesInValuationDB: ["NW11", "NW2"],
    rentalYieldByArea: {
      NW11: 0.038,
      NW2: 0.05,
    },
    defaultRentalYield: 0.045,
    reportName: "Landlord Rental Report",
    area: "Golders Green",
    coverageHero: "Built for NW11 lettings and landlords.",
    coverageLine: "Covering NW11 (Golders Green) and NW2 (Cricklewood, Willesden) — focused on the local lettings market.",
    audience: "landlord",
    framing: "standard",
    pageTitle: "Landlord Rental Report — Key Haven Estates, Golders Green",
    emailSubjectTag: "[KEYHAVEN — landlord lead]",
    heroHeadline: "What rent could your NW11 property achieve?",
  },
  templefortune: {
    slug: "templefortune",
    name: "Temple Fortune Estates",
    shortName: "Temple Fortune",
    address: "1 Hallswelle Parade, Finchley Road, London, NW11 0DL",
    phone: "020 8952 0908",
    email: "info@templefe.co.uk",
    website: "https://templefe.co.uk",
    directorName: null,
    directorFirstName: null,
    directorTitle: "Branch team",
    directorFallback: "the Temple Fortune Estates team",
    logoPath: "/agencies/templefortune/logo.png",
    logoAspect: "wide",
    colors: {
      primary: "#c89a37",
      primaryHover: "#a17626",
      accent: "#1f1a14",
      bgSoft: "#fbf7f0",
      text: "#221b10",
      muted: "#6f6452",
      border: "#ecdfc8",
    },
    tagline: "Hampstead Garden Suburb sales and lettings",
    postcodesInAgencyPatch: ["NW11", "NW4", "NW3"],
    postcodesInValuationDB: ["NW11", "NW4", "NW3"],
    rentalYieldByArea: {
      NW11: 0.038,
      NW4: 0.045,
      NW3: 0.032,
    },
    defaultRentalYield: 0.038,
    reportName: "Property Intelligence Report",
    area: "NW11",
    coverageHero: "Built for Temple Fortune and Hampstead Garden Suburb homes.",
    audience: "vendor",
    framing: "standard",
    pageTitle: "Property Valuation — Temple Fortune Estates, NW11",
    emailSubjectTag: "[TEMPLEFORTUNE — vendor lead]",
    heroHeadline: "What's your Temple Fortune or Hampstead Garden Suburb home worth?",
  },
  /**
   * DO NOT SEND THIS WEEK.
   * Winkworth is a Tier 2 target. They publicly campaign against AVMs.
   * Pitch only after 3+ Tier 1 references are landed.
   * Different price bracket: £5-15k setup, £500-1000/month — not £1,750.
   * Built only for completeness — exclude from the Monday email sequence.
   */
  winkworth: {
    slug: "winkworth",
    name: "Winkworth Golders Green",
    shortName: "Winkworth",
    address: "891 Finchley Road, London, NW11 8RR",
    phone: "020 8458 8313",
    email: "goldersgreen@winkworth.co.uk",
    website: "https://www.winkworth.co.uk/estate-agents/golders-green",
    directorName: "Graham Gold",
    directorFirstName: "Graham",
    directorTitle: "Sales Partner",
    logoPath: "/agencies/winkworth/logo.svg",
    logoAspect: "wide",
    colors: {
      primary: "#14142b",
      primaryHover: "#0a0a1a",
      accent: "#d88e3a",
      bgSoft: "#f6f4ef",
      text: "#14142b",
      muted: "#5b5b73",
      border: "#dedcd2",
    },
    tagline: "Local expertise, genuinely earned reviews — Golders Green",
    postcodesInAgencyPatch: ["NW11", "NW3", "NW8"],
    postcodesInValuationDB: ["NW11", "NW3", "NW8"],
    rentalYieldByArea: {
      NW11: 0.038,
      NW3: 0.032,
      NW8: 0.035,
    },
    defaultRentalYield: 0.035,
    reportName: "Property Valuation Preparation",
    area: "Golders Green",
    coverageHero: "Built for the Hampstead and St John's Wood corridor.",
    coverageLine:
      "Covering Golders Green (NW11), Hampstead (NW3) and St John's Wood (NW8) — premium NW London sales and lettings.",
    audience: "vendor",
    framing: "preparation",
    pageTitle: "Property Valuation Preparation — Winkworth Golders Green",
    emailSubjectTag: "[WINKWORTH — preparation lead]",
    heroHeadline: "What does the Land Registry data say about your street?",
    heroSubline:
      "Recent comparable sales near your home, drawn from public records — to inform your valuation appointment with Graham Gold. Online data alone can't replace an expert visit. This is the data your visit will discuss.",
    doNotSendBeforeFirstReferences: true,
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
