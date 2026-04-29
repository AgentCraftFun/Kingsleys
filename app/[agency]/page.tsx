import { notFound } from "next/navigation";
import { ctaPersonLabel, ctaPersonShort, getAgency, resolveAgencyLogoPath } from "@/lib/branding";
import AgencyApp from "@/components/AgencyApp";

type Params = { agency: string };

export default async function AgencyPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { agency: slug } = await params;
  const agency = getAgency(slug);
  if (!agency) notFound();

  const publicAgency = {
    slug: agency.slug,
    name: agency.name,
    shortName: agency.shortName,
    address: agency.address,
    phone: agency.phone,
    email: agency.email,
    website: agency.website,
    ctaPerson: ctaPersonLabel(agency),
    ctaPersonShort: ctaPersonShort(agency),
    directorTitle: agency.directorTitle,
    hasNamedDirector: agency.directorName !== null,
    logoPath: resolveAgencyLogoPath(agency),
    logoAspect: agency.logoAspect,
    tagline: agency.tagline,
    postcodesInAgencyPatch: agency.postcodesInAgencyPatch,
    postcodesInValuationDB: agency.postcodesInValuationDB,
    coverageHero: agency.coverageHero,
    coverageLine: agency.coverageLine,
    reportName: agency.reportName,
    area: agency.area,
    audience: agency.audience,
    framing: agency.framing,
    heroHeadline: agency.heroHeadline,
    heroSubline: agency.heroSubline,
    headerBg: agency.headerBg ?? "white",
    allowAudienceSwitch: agency.allowAudienceSwitch ?? false,
    bookingMode: agency.bookingMode ?? "form",
  };

  return <AgencyApp agency={publicAgency} />;
}
