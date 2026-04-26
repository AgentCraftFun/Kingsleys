import { notFound } from "next/navigation";
import { getAgency } from "@/lib/branding";
import type { Metadata } from "next";

type Params = { agency: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { agency: slug } = await params;
  const agency = getAgency(slug);
  if (!agency) return { title: "Not found" };

  const title = agency.pageTitle ?? `Property Valuation — ${agency.name}, ${agency.area}`;
  const description =
    agency.audience === "landlord"
      ? `Get a free Landlord Rental Report for your ${agency.area} property, prepared by ${agency.name} using HM Land Registry data and local lettings yields.`
      : `Get a free Property Intelligence Report for your ${agency.area} home, prepared by ${agency.name} using HM Land Registry data.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      siteName: agency.name,
      url: `/${agency.slug}`,
      images: [
        {
          url: agency.logoPath,
          alt: `${agency.name} logo`,
        },
      ],
    },
    twitter: {
      card: "summary",
      title,
      description,
      images: [agency.logoPath],
    },
    alternates: {
      canonical: `/${agency.slug}`,
    },
  };
}

export default async function AgencyLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<Params>;
}) {
  const { agency: slug } = await params;
  const agency = getAgency(slug);
  if (!agency) notFound();

  const styleVars = {
    ["--agency-primary" as string]: agency.colors.primary,
    ["--agency-primary-hover" as string]: agency.colors.primaryHover,
    ["--agency-accent" as string]: agency.colors.accent,
    ["--agency-bg-soft" as string]: agency.colors.bgSoft,
    ["--agency-text" as string]: agency.colors.text,
    ["--agency-muted" as string]: agency.colors.muted,
    ["--agency-border" as string]: agency.colors.border,
  } as React.CSSProperties;

  return (
    <div style={styleVars} className="min-h-screen">
      {children}
    </div>
  );
}
