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
  logoAspect: "wide" | "square" | "tall";
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
  /**
   * Per-audience subject tags. Used by agencies that let the user
   * self-select audience at the top of the page (see `allowAudienceSwitch`),
   * so the booking inbox can still tell vendor leads apart from landlord
   * leads. If absent, falls back to `emailSubjectTag`.
   */
  emailSubjectTagByAudience?: { vendor: string; landlord: string };
  /** Header background: white (default) or the agency's primary colour (e.g. Winkworth, dark green). */
  headerBg?: "white" | "primary";
  /**
   * If true, the welcome screen offers a vendor / landlord self-select
   * before the form starts. The `audience` field becomes the *default*
   * selection rather than a hard mode. Off by default — only set for
   * agencies that genuinely operate sales AND lettings as equal lines
   * of business and want to capture both lead types from the same URL.
   */
  allowAudienceSwitch?: boolean;
  /**
   * Booking step UX. "form" (default) collects contact details + free-text
   * preferred-time. "calendar" replaces the form with an in-page slot
   * picker that shows the next 14 weekdays and 8 slots/day, then submits
   * the chosen slot alongside contact details.
   */
  bookingMode?: "form" | "calendar";
  /**
   * If true and the active audience is "landlord", the report's
   * Comparables section flips from showing capital sale prices to
   * showing the implied monthly rent for each comparable (sale price
   * times local yield divided by 12), with a caption that's honest
   * about HM Land Registry not publishing rental transactions. Off by
   * default so existing landlord pages keep their current copy until
   * each agency signs off on the new view.
   */
  showImpliedRentComparables?: boolean;
  /**
   * If true and the active audience is "landlord", the rental report
   * shows an additional "borough context" strip with the official ONS
   * median monthly rent for the user's postcode-mapped borough +
   * bedroom count, plus a methodology note explaining how the
   * implied-yield estimate, ONS borough median, and (post-install)
   * Rightmove/Zoopla feeds combine. Reads from lib/onsRent.ts. Off by
   * default; only /gravity opts in for the demo.
   */
  showBoroughRentContext?: boolean;
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
    allowAudienceSwitch: true,
    bookingMode: "calendar",
    showImpliedRentComparables: true,
    showBoroughRentContext: true,
    emailSubjectTagByAudience: {
      vendor: "[GRAVITY, vendor lead]",
      landlord: "[GRAVITY, landlord lead]",
    },
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
    logoAspect: "tall",
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
    logoAspect: "square",
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
    logoAspect: "square",
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
  brampton: {
    slug: "brampton",
    name: "Brampton Real Estate",
    shortName: "Brampton",
    address: "Hendon, London NW4",
    phone: "020 7101 3737",
    email: "info@bramptonrealestate.co.uk",
    website: "https://bramptonrealestate.co.uk",
    directorName: "Jonny Eisenberg",
    directorFirstName: "Jonny",
    directorTitle: "Director",
    logoPath: "/agencies/brampton/logo.png",
    logoAspect: "wide",
    colors: {
      primary: "#1a1a1a",
      primaryHover: "#0d0d0d",
      accent: "#c8202a",
      bgSoft: "#f7f4f3",
      text: "#181312",
      muted: "#6b6664",
      border: "#e9e2e0",
    },
    tagline: "Estate Agent in Hendon",
    postcodesInAgencyPatch: ["NW11", "NW4", "NW9", "N3", "N12", "HA8", "HA3"],
    postcodesInValuationDB: ["NW11", "NW4", "NW9"],
    rentalYieldByArea: {
      NW11: 0.038,
      NW4: 0.045,
      NW9: 0.045,
    },
    defaultRentalYield: 0.04,
    reportName: "Property Intelligence Report",
    area: "Hendon",
    coverageHero: "Built for Hendon and the surrounding NW London patch.",
    coverageLine:
      "Covering Hendon (NW4), Golders Green (NW11), Kingsbury (NW9), Finchley (N3, N12), Edgware (HA8) and Kenton (HA3).",
    audience: "vendor",
    framing: "standard",
    pageTitle: "Property Valuation, Brampton Real Estate, Hendon",
    emailSubjectTag: "[BRAMPTON, vendor lead]",
    heroHeadline: "What's your Hendon home worth?",
  },
  /**
   * Tier 2 — was previously gated behind doNotSendBeforeFirstReferences
   * pending Tier 1 references. Cleared as of agency 12 onboarding;
   * Winkworth is now in the first-wave sendable list. Note for future:
   * Winkworth's price bracket is materially higher than the rest
   * (£5–15k setup, £500–1000/month vs £1,750/£150) — pitch accordingly.
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
    logoPath: "/agencies/winkworth/logo.png",
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
  },
  belvoir: {
    slug: "belvoir",
    name: "Belvoir Hendon",
    shortName: "Belvoir",
    address: "258 Watford Way, Hendon, London NW4 4UJ",
    phone: "020 3875 6000",
    email: "hendon@belvoir.co.uk",
    website: "https://www.belvoir.co.uk/estate-agents-and-letting-agents/branch/hendon/",
    directorName: "Dawood Hussain",
    directorFirstName: "Dawood",
    directorTitle: "Director",
    logoPath: "/agencies/belvoir/logo.svg",
    logoAspect: "wide",
    colors: {
      primary: "#c41230",
      primaryHover: "#a00d26",
      accent: "#1a1a1a",
      bgSoft: "#faf3f4",
      text: "#1a1414",
      muted: "#6b5e60",
      border: "#ecdcdf",
    },
    tagline: "Belvoir Hendon — sales, lettings and management",
    postcodesInAgencyPatch: ["NW4", "NW7", "NW9", "NW11", "N10"],
    postcodesInValuationDB: ["NW4", "NW7", "NW9", "NW11"],
    rentalYieldByArea: {
      NW4: 0.045,
      NW7: 0.04,
      NW9: 0.045,
      NW11: 0.038,
    },
    defaultRentalYield: 0.04,
    reportName: "Property Intelligence Report",
    area: "Hendon",
    coverageHero: "Built for Hendon, Mill Hill and Colindale homes.",
    coverageLine:
      "Covering Hendon (NW4), Mill Hill (NW7), Colindale (NW9), Golders Green (NW11) and Muswell Hill (N10).",
    audience: "vendor",
    framing: "standard",
    pageTitle: "Property Valuation, Belvoir Hendon",
    emailSubjectTag: "[BELVOIR, vendor lead]",
    heroHeadline: "What's your Hendon, Colindale or Mill Hill home worth?",
  },
  ashmore: {
    slug: "ashmore",
    name: "Ashmore & Co",
    shortName: "Ashmore & Co",
    address: "5 Finchley Lane, Hendon, London, NW4 1BP",
    phone: "020 8203 1177",
    email: "enquiries@ashmoreestates.com",
    website: "https://www.ashmoreestates.com",
    directorName: null,
    directorFirstName: null,
    directorTitle: "Branch team",
    directorFallback: "the Ashmore & Co team",
    logoPath: "/agencies/ashmore/logo.svg",
    logoAspect: "wide",
    colors: {
      primary: "#2a2e35",
      primaryHover: "#1b1e23",
      accent: "#b59855",
      bgSoft: "#f6f3ec",
      text: "#1b1e23",
      muted: "#6b6960",
      border: "#e3ddca",
    },
    tagline: "Independent NW London estate agent since 1948",
    postcodesInAgencyPatch: [
      "NW4", "NW9", "NW11", "NW2", "NW7", "NW3", "NW8",
      "N2", "N3", "N12", "N20",
      "W1",
    ],
    postcodesInValuationDB: ["NW4", "NW9", "NW11", "NW2", "NW7", "NW3"],
    rentalYieldByArea: {
      NW4: 0.045,
      NW9: 0.045,
      NW11: 0.038,
      NW2: 0.05,
      NW7: 0.04,
      NW3: 0.032,
    },
    defaultRentalYield: 0.038,
    reportName: "Property Intelligence Report",
    area: "Hendon",
    coverageHero: "Built for NW London, Finchley and Central London.",
    coverageLine:
      "Covering Hendon (NW4), Colindale (NW9), Golders Green (NW11), Cricklewood (NW2), Mill Hill (NW7), Hampstead (NW3), St John's Wood (NW8), Hampstead Garden Suburb (N2), Finchley (N3, N12, N20) and Central London (W1).",
    audience: "vendor",
    framing: "standard",
    pageTitle: "Property Valuation, Ashmore & Co, Hendon",
    emailSubjectTag: "[ASHMORE, vendor lead]",
    heroHeadline: "What's your home worth, from Hendon to St John's Wood?",
  },
  slettings: {
    slug: "slettings",
    name: "Slettings",
    shortName: "Slettings",
    address: "39a Vivian Avenue, Hendon, London NW4 3UX",
    phone: "",
    email: "",
    website: "https://slettings.co.uk",
    directorName: "Stefan Labuda",
    directorFirstName: "Stefan",
    directorTitle: "Director",
    logoPath: "/agencies/slettings/logo.svg",
    logoAspect: "wide",
    colors: {
      primary: "#2a3a4a",
      primaryHover: "#1c2735",
      accent: "#a48a5b",
      bgSoft: "#f5f5f1",
      text: "#1c2735",
      muted: "#697585",
      border: "#dfdfd5",
    },
    tagline: "Family-run NW London lettings since 2014",
    postcodesInAgencyPatch: ["NW4", "NW7", "NW9", "NW2", "HA8"],
    postcodesInValuationDB: ["NW4", "NW7", "NW9", "NW2"],
    rentalYieldByArea: {
      NW4: 0.045,
      NW7: 0.04,
      NW9: 0.045,
      NW2: 0.05,
    },
    defaultRentalYield: 0.045,
    reportName: "Landlord Rental Report",
    area: "Hendon",
    coverageHero: "Built for landlords across Hendon, Colindale and Edgware.",
    coverageLine:
      "Covering Hendon (NW4), Mill Hill (NW7), Colindale (NW9), Cricklewood (NW2) and Edgware (HA8) — focused on the NW lettings market.",
    audience: "landlord",
    framing: "standard",
    pageTitle: "Landlord Rental Report, Slettings, Hendon",
    emailSubjectTag: "[SLETTINGS, landlord lead]",
    heroHeadline: "What rent could your Hendon or Edgware property achieve?",
  },
  roundtree: {
    slug: "roundtree",
    name: "Roundtree Real Estate",
    shortName: "Roundtree",
    address: "Brent Street, Hendon, London NW4",
    phone: "",
    email: "",
    website: "https://www.theroundtree.com",
    directorName: null,
    directorFirstName: null,
    directorTitle: "Branch team",
    directorFallback: "the Roundtree team",
    logoPath: "/agencies/roundtree/logo.svg",
    logoAspect: "wide",
    colors: {
      primary: "#1f2c2a",
      primaryHover: "#121b1a",
      accent: "#a48a5b",
      bgSoft: "#f5f3ee",
      text: "#161e1d",
      muted: "#5a6663",
      border: "#dfdacd",
    },
    tagline: "Independent NW London estate agent",
    postcodesInAgencyPatch: ["NW4", "NW11", "N12", "N3", "NW9"],
    postcodesInValuationDB: ["NW4", "NW11", "NW9"],
    rentalYieldByArea: {
      NW4: 0.045,
      NW11: 0.038,
      NW9: 0.045,
    },
    defaultRentalYield: 0.04,
    reportName: "Property Intelligence Report",
    area: "Hendon",
    coverageHero: "Built for Hendon, Golders Green and the wider NW patch.",
    coverageLine:
      "Covering Hendon (NW4), Golders Green and Temple Fortune (NW11), Finchley (N12, N3) and Colindale (NW9).",
    audience: "vendor",
    framing: "standard",
    pageTitle: "Property Valuation, Roundtree Real Estate, Hendon",
    emailSubjectTag: "[ROUNDTREE, vendor lead]",
    heroHeadline: "What's your Hendon or Finchley home worth?",
  },
  shproperties: {
    slug: "shproperties",
    name: "S.H. Properties",
    shortName: "S.H. Properties",
    address: "252 Hendon Way, London, NW4 3NL",
    phone: "020 8202 3000",
    email: "info@shproperties.net",
    website: "https://www.shproperties.net",
    directorName: "Stephen Harris",
    directorFirstName: "Stephen",
    directorTitle: "Director",
    logoPath: "/agencies/shproperties/logo.png",
    logoAspect: "wide",
    colors: {
      primary: "#c8242c",
      primaryHover: "#a31d24",
      accent: "#1a1a1a",
      bgSoft: "#faf3f3",
      text: "#1a1a1a",
      muted: "#646464",
      border: "#ecdedf",
    },
    tagline: "Sales, lettings and property management — Hendon Way",
    postcodesInAgencyPatch: ["NW4", "NW2", "NW9", "NW11", "NW7", "HA8"],
    postcodesInValuationDB: ["NW4", "NW2", "NW9", "NW11", "NW7"],
    rentalYieldByArea: {
      NW4: 0.045,
      NW2: 0.05,
      NW9: 0.045,
      NW11: 0.038,
      NW7: 0.04,
    },
    defaultRentalYield: 0.04,
    reportName: "Property Intelligence Report",
    area: "Hendon",
    coverageHero: "Built for the Hendon Way and NW4 patch.",
    coverageLine:
      "Covering Hendon (NW4), Cricklewood (NW2), Colindale (NW9), Golders Green (NW11), Mill Hill (NW7) and Edgware (HA8).",
    audience: "vendor",
    framing: "standard",
    pageTitle: "Property Valuation, S.H. Properties, Hendon",
    emailSubjectTag: "[SHPROPERTIES, vendor lead]",
    heroHeadline: "What's your NW4 home worth?",
  },
  talbots: {
    slug: "talbots",
    name: "Talbots Estate Agents",
    shortName: "Talbots",
    address: "67 Brent Street, Hendon, London, NW4 2EA",
    phone: "020 8202 5511",
    email: "info@talbots.co.uk",
    website: "https://www.talbots.co.uk",
    directorName: "Simon Levy",
    directorFirstName: "Simon",
    directorTitle: "Partner",
    logoPath: "/agencies/talbots/logo.png",
    logoAspect: "wide",
    colors: {
      primary: "#4a3424",
      primaryHover: "#321f15",
      accent: "#d4a574",
      bgSoft: "#f8f4ec",
      text: "#2a1c12",
      muted: "#6e5e51",
      border: "#e6d9c5",
    },
    tagline: "Independent NW London estate agent — Brent Street, Hendon",
    postcodesInAgencyPatch: ["NW4", "NW11", "NW9", "HA8", "N3", "N12", "WD6"],
    postcodesInValuationDB: ["NW4", "NW11"],
    rentalYieldByArea: {
      NW4: 0.045,
      NW11: 0.038,
    },
    defaultRentalYield: 0.04,
    reportName: "Property Intelligence Report",
    area: "Hendon",
    coverageHero:
      "Built for Hendon, Golders Green and the wider NW patch including Edgware and Borehamwood.",
    coverageLine:
      "Covering Hendon (NW4), Golders Green (NW11), Colindale (NW9), Edgware (HA8), Finchley (N3, N12) and Borehamwood (WD6).",
    audience: "vendor",
    framing: "standard",
    pageTitle: "Property Valuation, Talbots Estate Agents, Hendon",
    emailSubjectTag: "[TALBOTS, vendor lead]",
    heroHeadline: "What's your Hendon, Edgware or Borehamwood home worth?",
  },
  charringtons: {
    slug: "charringtons",
    name: "Charringtons",
    shortName: "Charringtons",
    address: "170 West Hendon Broadway, West Hendon, London, NW9 7AA",
    phone: "020 7112 4852",
    email: "",
    website: "https://www.charringtons.london",
    directorName: "Michael Kangau",
    directorFirstName: "Michael",
    directorTitle: "Director",
    logoPath: "/agencies/charringtons/logo.png",
    logoAspect: "wide",
    colors: {
      primary: "#1f4e3a",
      primaryHover: "#143625",
      accent: "#b08948",
      bgSoft: "#f5f3ec",
      text: "#142822",
      muted: "#5a6862",
      border: "#d8dcc7",
    },
    tagline: "Sales, lettings and property management — NW and Central London",
    postcodesInAgencyPatch: ["NW9", "NW4", "NW2", "W9", "SW3", "SW7", "SW10"],
    postcodesInValuationDB: ["NW4", "NW2"],
    rentalYieldByArea: {
      NW4: 0.045,
      NW2: 0.05,
    },
    defaultRentalYield: 0.04,
    reportName: "Landlord Rental Report",
    area: "North West and Central London",
    coverageHero: "Built for landlords across NW and Central London.",
    coverageLine:
      "Covering West Hendon (NW9), Hendon (NW4), Cricklewood (NW2), Maida Vale (W9), South Kensington (SW7) and Chelsea (SW3, SW10) — landlord and investor focus.",
    audience: "landlord",
    framing: "standard",
    pageTitle: "Landlord Rental Report, Charringtons, North West and Central London",
    emailSubjectTag: "[CHARRINGTONS, landlord lead]",
    heroHeadline: "What rent could your London property achieve?",
    heroSubline:
      "A data-driven rental report for your London property, drawing on local lettings yields and HM Land Registry capital values. Free, no obligation — then, if you'd like, an in-person landlord appraisal with Michael Kangau.",
  },
  haviva: {
    slug: "haviva",
    name: "Haviva Estates",
    shortName: "Haviva Estates",
    address: "92a Brent Street, Hendon, London, NW4 2ES",
    phone: "020 7680 1000",
    email: "havivaestateagents@gmail.com",
    website: "https://www.havivaestates.co.uk",
    directorName: null,
    directorFirstName: null,
    directorTitle: "Branch team",
    directorFallback: "the Haviva Estates team",
    logoPath: "/agencies/haviva/logo.jpeg",
    logoAspect: "wide",
    colors: {
      primary: "#2e4f4f",
      primaryHover: "#1f3939",
      accent: "#c69b5a",
      bgSoft: "#f5f3ed",
      text: "#15292a",
      muted: "#5e6e6f",
      border: "#dad7c8",
    },
    tagline: "Family-run NW London estate and lettings agency",
    postcodesInAgencyPatch: ["NW4", "NW11"],
    postcodesInValuationDB: ["NW4", "NW11"],
    rentalYieldByArea: {
      NW4: 0.045,
      NW11: 0.038,
    },
    defaultRentalYield: 0.04,
    reportName: "Landlord Rental Report",
    area: "Hendon",
    coverageHero: "Built for Hendon landlords.",
    coverageLine:
      "Covering Hendon (NW4) and Golders Green (NW11) — focused on the local lettings market.",
    audience: "landlord",
    framing: "standard",
    pageTitle: "Landlord Rental Report, Haviva Estates, Hendon",
    emailSubjectTag: "[HAVIVA, landlord lead]",
    heroHeadline: "What rent could your Hendon property achieve?",
    heroSubline:
      "A data-driven rental report for your Hendon property, based on local lettings yields and HM Land Registry capital values. Free, no obligation — then, if you'd like, an in-person landlord appraisal with the Haviva Estates team.",
  },
  orient: {
    slug: "orient",
    name: "Orient Estates",
    shortName: "Orient",
    address: "5 Watford Way, Hendon, London, NW4 3JL",
    phone: "020 8202 6888",
    email: "hello@orientestates.co.uk",
    website: "https://www.orientestates.co.uk",
    directorName: null,
    directorFirstName: null,
    directorTitle: "Branch team",
    directorFallback: "the Orient Estates team",
    logoPath: "/agencies/orient/logo.png",
    logoAspect: "wide",
    colors: {
      primary: "#df4a43",
      primaryHover: "#b83a34",
      accent: "#1c1c1c",
      bgSoft: "#faf3f3",
      text: "#1c1c1c",
      muted: "#74777c",
      border: "#ecdcda",
    },
    tagline: "Sales, lettings and management across NW and Central London",
    postcodesInAgencyPatch: [
      "NW3", "NW4", "NW7", "NW9", "NW11",
      "N10", "N12",
      "E14", "SE1", "W1",
    ],
    postcodesInValuationDB: ["NW3", "NW4", "NW7", "NW9", "NW11"],
    rentalYieldByArea: {
      NW3: 0.032,
      NW4: 0.045,
      NW7: 0.04,
      NW9: 0.045,
      NW11: 0.038,
    },
    defaultRentalYield: 0.04,
    reportName: "Property Intelligence Report",
    area: "Hendon",
    coverageHero: "Built for North West London.",
    coverageLine:
      "Covering Hendon (NW4), Mill Hill (NW7), Colindale (NW9), Golders Green (NW11), Hampstead (NW3), Finchley (N12), Muswell Hill (N10), and Central London (E14, SE1, W1).",
    audience: "vendor",
    framing: "standard",
    pageTitle: "Property Valuation, Orient Estates, Hendon",
    emailSubjectTag: "[ORIENT, vendor lead]",
    headerBg: "primary",
    heroHeadline: "What's your North West London home worth?",
  },
};

export function getAgency(slug: string): AgencyConfig | null {
  return agencyConfigs[slug.toLowerCase()] ?? null;
}

/**
 * Server-side logo resolver. Prefers a real PNG ({slug}/logo.png) if you've
 * dropped one into the public folder. Falls back to the SVG wordmark, then
 * to whatever logoPath the config declares.
 *
 * This means: drag a logo.png into public/agencies/{slug}/ on GitHub, commit,
 * and the page automatically uses it on the next build — no config edit
 * needed.
 */
export function resolveAgencyLogoPath(agency: AgencyConfig): string {
  if (typeof window !== "undefined") return agency.logoPath;
  // Lazy require so this never runs in the browser.
  const fs = require("node:fs") as typeof import("node:fs");
  const path = require("node:path") as typeof import("node:path");
  const publicRoot = path.resolve(process.cwd(), "public");
  const candidates = [
    `agencies/${agency.slug}/logo.png`,
    `agencies/${agency.slug}/logo.svg`,
    agency.logoPath.replace(/^\//, ""),
  ];
  for (const rel of candidates) {
    if (fs.existsSync(path.join(publicRoot, rel))) return "/" + rel;
  }
  return agency.logoPath;
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
