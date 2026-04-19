#!/usr/bin/env node
/**
 * Scaffold a new agency config by editing lib/branding.ts.
 *
 * Usage:
 *   npx tsx scripts/add-agency.ts \
 *     --slug=dreamview \
 *     --name="Dreamview Estates" \
 *     --short="Dreamview" \
 *     --address="34 Golders Green Road, London, NW11 8LL" \
 *     --phone="020 8455 0055" \
 *     --email="mail@dreamviewestates.co.uk" \
 *     --website="https://dreamviewestates.co.uk" \
 *     --director="Firstname Lastname" \
 *     --tagline="Optional tagline" \
 *     --primary="#1a2a4a" \
 *     --logo="https://.../logo.png"
 *
 * After running, inspect the diff, drop the logo into public/agencies/<slug>/logo.png,
 * and visit /<slug> locally to check.
 */

import fs from "node:fs";
import path from "node:path";
import https from "node:https";
import http from "node:http";

type Args = Record<string, string>;

function parseArgs(argv: string[]): Args {
  const out: Args = {};
  for (const a of argv) {
    if (!a.startsWith("--")) continue;
    const [k, ...rest] = a.slice(2).split("=");
    out[k] = rest.join("=");
  }
  return out;
}

function lighten(hex: string, amount: number): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const adjust = (c: number) => Math.max(0, Math.min(255, Math.round(c * (1 - amount))));
  return "#" + [adjust(r), adjust(g), adjust(b)].map((c) => c.toString(16).padStart(2, "0")).join("");
}

function downloadFile(url: string, dest: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith("https") ? https : http;
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    const file = fs.createWriteStream(dest);
    lib
      .get(url, (res) => {
        if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          file.close();
          fs.unlinkSync(dest);
          return downloadFile(res.headers.location, dest).then(resolve, reject);
        }
        if (res.statusCode !== 200) {
          reject(new Error(`Logo download failed: HTTP ${res.statusCode}`));
          return;
        }
        res.pipe(file);
        file.on("finish", () => file.close(() => resolve()));
      })
      .on("error", reject);
  });
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const required = ["slug", "name", "address", "phone", "email", "website", "director"];
  const missing = required.filter((k) => !args[k]);
  if (missing.length) {
    console.error("Missing required args: " + missing.join(", "));
    process.exit(1);
  }

  const slug = args.slug.toLowerCase().replace(/[^a-z0-9-]/g, "");
  const shortName = args.short || args.name.split(" ")[0];
  const directorFirstName = args.director.split(" ")[0];
  const primary = args.primary || "#1a1a1a";
  const primaryHover = lighten(primary, 0.15);
  const postcodes = (args.postcodes || "NW11,NW4,NW3,NW2").split(",").map((s) => s.trim());
  const logoPath = `/agencies/${slug}/logo.png`;
  const localLogo = path.resolve(process.cwd(), "public" + logoPath);

  if (args.logo) {
    console.log(`Downloading logo → ${localLogo}`);
    await downloadFile(args.logo, localLogo);
  } else {
    console.log(`No --logo provided. Drop a logo into ${localLogo} before going live.`);
    fs.mkdirSync(path.dirname(localLogo), { recursive: true });
  }

  const brandingPath = path.resolve(process.cwd(), "lib/branding.ts");
  const src = fs.readFileSync(brandingPath, "utf8");
  if (src.includes(`  ${slug}: {`)) {
    console.error(`Agency '${slug}' already exists in lib/branding.ts — edit it by hand.`);
    process.exit(1);
  }

  const yieldMap = postcodes
    .map((p) => `      ${p}: ${p === "NW2" ? "0.05" : p === "NW4" ? "0.045" : p === "NW3" ? "0.032" : "0.038"},`)
    .join("\n");

  const entry = `  ${slug}: {
    slug: "${slug}",
    name: "${args.name}",
    shortName: "${shortName}",
    address: "${args.address}",
    phone: "${args.phone}",
    email: "${args.email}",
    website: "${args.website}",
    directorName: "${args.director}",
    directorFirstName: "${directorFirstName}",
    directorTitle: "${args.title || "Director"}",
    logoPath: "${logoPath}",
    logoAspect: "wide",
    colors: {
      primary: "${primary}",
      primaryHover: "${primaryHover}",
      accent: "${args.accent || "#b8945f"}",
      bgSoft: "${args.bgSoft || "#f6f6f3"}",
      text: "${primary}",
      muted: "#6b7280",
      border: "#e5e5e0",
    },
    tagline: "${args.tagline || ""}",
    postcodesCovered: ${JSON.stringify(postcodes)},
    rentalYieldByArea: {
${yieldMap}
    },
    defaultRentalYield: 0.04,
    reportName: "Property Intelligence Report",
  },
`;

  const marker = "export const agencyConfigs: Record<string, AgencyConfig> = {\n";
  const idx = src.indexOf(marker);
  if (idx === -1) {
    console.error("Could not find agencyConfigs marker in lib/branding.ts");
    process.exit(1);
  }
  const insertAt = idx + marker.length;
  const next = src.slice(0, insertAt) + entry + src.slice(insertAt);
  fs.writeFileSync(brandingPath, next, "utf8");

  console.log(`\nAdded '${slug}' to lib/branding.ts.`);
  console.log(`Visit /${slug} locally to preview, then deploy.\n`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
