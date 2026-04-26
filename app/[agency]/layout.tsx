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
  return {
    title: `Property Valuation — ${agency.name}, ${agency.area}`,
    description: `A data-driven local market report for your property, prepared by ${agency.name}. Powered by HM Land Registry data.`,
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
