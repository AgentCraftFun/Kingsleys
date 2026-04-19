import { notFound } from "next/navigation";
import { getAgency } from "@/lib/branding";
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
    directorName: agency.directorName,
    directorFirstName: agency.directorFirstName,
    directorTitle: agency.directorTitle,
    logoPath: agency.logoPath,
    tagline: agency.tagline,
    postcodesCovered: agency.postcodesCovered,
    reportName: agency.reportName,
  };

  return <AgencyApp agency={publicAgency} />;
}
