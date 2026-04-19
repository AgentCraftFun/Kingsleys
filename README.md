# Property Intelligence Report

A branded, per-agency vendor-capture web app for London estate agents. Built in Next.js 15, powered by HM Land Registry Price Paid Data.

## What it does

A vendor enters their postcode, property type, bedrooms, condition and features, and gets back a branded report showing:

- A defensible sale price **range** (never a point estimate)
- A rental valuation with gross yield
- 3–5 real recent comparable sales from HM Land Registry
- A "What this report can't see" section that pre-sells the in-person visit
- A clear CTA to book a free valuation with the named director

Report output is always framed as **"Property Intelligence Report"** — never an "Instant Valuation". The tool exists to pre-sell the in-person visit.

## Routes

- `/` — redirects to `/kingsleys`
- `/<agencySlug>` — branded single-page experience (welcome → form → report → booking → thanks)
- `POST /api/valuation` — compute a report given form inputs
- `POST /api/book` — send a booking request via Resend

## Quick start

```bash
npm install
npm run build
npm start   # or `npm run dev`
```

Open http://localhost:3000/kingsleys.

## Data

HM Land Registry Price Paid Data is imported into `data/land-registry.db` (SQLite, ~3MB). Only NW London districts (NW1–NW11) are kept to keep the DB small.

To rebuild from scratch, drop the bulk CSVs into `data/` and run:

```bash
npm run import-data
```

Accepted filenames: `pp-2024.csv`, `pp-2025.csv`, `pp-monthly.csv`. Missing files are skipped.

Data source: https://www.gov.uk/government/statistical-data-sets/price-paid-data-downloads

## Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `RESEND_API_KEY` | For booking emails | API key from resend.com. Without it, booking submissions log to the server console ("email-dev-mode") so the flow is still testable. |
| `BOOKING_TO_EMAIL` | Optional | Overrides the booking destination. Defaults to `JackColeProductions@gmail.com`. |
| `BOOKING_FROM_EMAIL` | Optional | Overrides the "From" header. Defaults to Resend's sandbox address. |
| `LAND_REGISTRY_DB_PATH` | Optional | Absolute path to the SQLite DB. Defaults to `./data/land-registry.db`. |

## Adding a new agency

Run the scaffolder:

```bash
npx tsx scripts/add-agency.ts \
  --slug=dreamview \
  --name="Dreamview Estates" \
  --address="34 Golders Green Road, London, NW11 8LL" \
  --phone="020 8455 0055" \
  --email="mail@dreamviewestates.co.uk" \
  --website="https://dreamviewestates.co.uk" \
  --director="Firstname Lastname" \
  --primary="#1a2a4a" \
  --logo="https://.../logo.png"
```

This writes a new entry to `lib/branding.ts`, downloads the logo to `public/agencies/<slug>/logo.png`, and creates the route at `/<slug>`. Check colours and copy, then redeploy.

Optional flags: `--short`, `--tagline`, `--title`, `--accent`, `--bgSoft`, `--postcodes`.

## Deploy (Railway)

`railway.json` and `nixpacks.toml` are configured for Railway out of the box.

```bash
railway login
railway link       # link to your project
railway up         # deploy from current branch
```

Set `RESEND_API_KEY` in the Railway dashboard (Variables tab).

The SQLite DB ships with the repo so no build-time data import is required. `better-sqlite3` compiles native bindings during `npm ci` — `nixpacks.toml` pins the necessary build tools (python3, gcc, make).

## Quality bar

Before calling a new agency instance done:

- [ ] Real logo loads (not a placeholder)
- [ ] Primary colour on the page matches the agency's own website
- [ ] Director name is on the CTA (researched via Companies House or About page)
- [ ] Comparable sales shown are real addresses from Land Registry
- [ ] "What this report can't see" section is present and prominent
- [ ] Booking form captures a lead and emails the destination address (test with a real submission)
- [ ] Renders cleanly at 375px width (iPhone SE)

## Attribution

Contains HM Land Registry Price Paid Data © Crown copyright and database right 2026. Licensed under the Open Government Licence v3.0.
