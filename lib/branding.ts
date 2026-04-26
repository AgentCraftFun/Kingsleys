export type AgencyConfig = {
  slug: string;
  name: string;
  shortName: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  directorName: string;
  directorTitle: string;
  directorFirstName: string;
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
  postcodesCovered: string[];
  rentalYieldByArea: Record<string, number>;
  defaultRentalYield: number;
  reportName: string;
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
    postcodesCovered: ["NW11","NW4","NW3","NW2"],
    rentalYieldByArea: {
      NW11: 0.038,
      NW4: 0.045,
      NW3: 0.032,
      NW2: 0.05,
    },
    defaultRentalYield: 0.04,
    reportName: "Property Intelligence Report",
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
    postcodesCovered: ["NW11", "NW4", "NW3", "NW2"],
    rentalYieldByArea: {
      NW11: 0.038,
      NW4: 0.045,
      NW3: 0.032,
      NW2: 0.05,
    },
    defaultRentalYield: 0.04,
    reportName: "Property Intelligence Report",
  },
};

export function getAgency(slug: string): AgencyConfig | null {
  return agencyConfigs[slug.toLowerCase()] ?? null;
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
