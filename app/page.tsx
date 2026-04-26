import type { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "Property Valuation Calculator — Property Intelligence Reports for London Estate Agencies",
  description:
    "Custom Property Intelligence Reports for boutique London estate agents. Built by Jack Cole — based in London.",
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
  openGraph: {
    title:
      "Property Valuation Calculator — Property Intelligence Reports for London Estate Agencies",
    description:
      "Custom Property Intelligence Reports for boutique London estate agents. Built by Jack Cole — based in London.",
    type: "website",
    url: "/",
  },
  twitter: {
    card: "summary",
    title:
      "Property Valuation Calculator — Property Intelligence Reports for London Estate Agencies",
    description:
      "Custom Property Intelligence Reports for boutique London estate agents. Built by Jack Cole — based in London.",
  },
  alternates: { canonical: "/" },
};

export default function RootPage() {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "#f6f4ee", color: "#1f1d18" }}
    >
      <main className="flex-1 w-full">
        <div className="max-w-xl mx-auto px-5 sm:px-8 pt-16 sm:pt-28 pb-16">
          <header>
            <h1
              className="text-3xl sm:text-4xl font-semibold tracking-tight"
              style={{
                fontFamily: "var(--font-display, Georgia), serif",
                letterSpacing: "-0.01em",
              }}
            >
              Property Valuation Calculator
            </h1>
          </header>

          <section className="mt-10">
            <h2
              className="text-xl sm:text-2xl font-semibold leading-snug"
              style={{ fontFamily: "var(--font-display, Georgia), serif" }}
            >
              Property Intelligence Reports for London estate agents.
            </h2>
            <p className="mt-4 text-base sm:text-lg leading-relaxed" style={{ color: "#3a3631" }}>
              This platform builds custom Land Registry-powered valuation reports for boutique
              London estate agencies, branded for each individual agency. Sellers get real
              comparable sales and a defensible price range; agencies get qualified vendor
              leads — not silent contact-form submissions that nobody clicks.
            </p>
          </section>

          <section className="mt-12">
            <p
              className="text-sm leading-relaxed"
              style={{ color: "#65605a" }}
            >
              If you've been sent a personalised link, that's the version built for your
              agency. This homepage is just the platform's front door.
            </p>
          </section>

          <section className="mt-12">
            <h3
              className="text-sm font-medium uppercase tracking-wider"
              style={{ color: "#65605a" }}
            >
              About
            </h3>
            <p className="mt-3 text-base sm:text-lg leading-relaxed" style={{ color: "#3a3631" }}>
              Built and run by Jack Cole, an entrepreneur based in London. Each agency's tool
              is custom-built, branded to their site, populated with real local Land Registry
              data, and maintained ongoing.
            </p>
          </section>

          <section className="mt-12">
            <h3
              className="text-sm font-medium uppercase tracking-wider"
              style={{ color: "#65605a" }}
            >
              Get in touch
            </h3>
            <p className="mt-3 text-base sm:text-lg leading-relaxed" style={{ color: "#3a3631" }}>
              Reply to my email, or give me a call — I'm based in London.
            </p>
            <ul className="mt-4 space-y-2 text-base sm:text-lg">
              <li>
                <a
                  href="mailto:JackColeProductions@gmail.com"
                  className="underline underline-offset-4 decoration-1"
                  style={{ color: "#1f1d18" }}
                >
                  JackColeProductions@gmail.com
                </a>
              </li>
              <li>
                <a
                  href="tel:+447596431329"
                  className="underline underline-offset-4 decoration-1"
                  style={{ color: "#1f1d18" }}
                >
                  07596 431329
                </a>
              </li>
            </ul>
          </section>
        </div>
      </main>

      <footer
        className="w-full border-t"
        style={{ borderColor: "#e3dfd6" }}
      >
        <div
          className="max-w-xl mx-auto px-5 sm:px-8 py-8 text-xs leading-relaxed"
          style={{ color: "#7a746c" }}
        >
          © {new Date().getFullYear()} Jack Cole. Data: HM Land Registry. Licensed under the
          Open Government Licence v3.0.
        </div>
      </footer>
    </div>
  );
}
