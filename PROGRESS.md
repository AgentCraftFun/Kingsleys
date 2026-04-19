# Build progress

_Last updated: 2026-04-19 evening_

## Status: v1 feature-complete, ready to deploy to Railway

## What's built

- Next.js 15 (App Router) + TypeScript + Tailwind 3 project in this repo
- Land Registry SQLite DB at `data/land-registry.db` (11,801 rows across NW1–NW11, 2024–2026)
- Branded single-page app at `/kingsleys` with 5 screens: welcome → form → loading → report → booking → thanks
- Valuation endpoint `POST /api/valuation` — realistic ranges, outlier-trimmed comparables
- Booking endpoint `POST /api/book` — Resend-backed, logs in dev mode when no API key
- Per-agency config in `lib/branding.ts` — Kingsleys entry fully populated with:
  - Director: **Eyal Landau** (via Kingsleys About page)
  - Brand colour: `#141c3b` (deep navy, pulled from their site)
  - Logo: `public/agencies/kingsleys/logo.png` (downloaded from their CDN)
  - Tagline, address, phone, email, website all real
- `scripts/add-agency.ts` — CLI to scaffold the other 9 agencies in ~one command
- Railway config: `railway.json` + `nixpacks.toml` (pins python3/gcc/make for better-sqlite3 native build)
- README.md with full run/deploy instructions

## Quality checks passed

- [x] Real Kingsleys logo loads, no placeholder
- [x] Real colours: `#141c3b` navy, `#b8945f` gold accent, `#f6f6f3` cream background — all applied via CSS vars so the layout pattern works for any agency
- [x] Director Eyal Landau on all CTAs
- [x] Comparable sales are real NW London addresses from HM Land Registry
- [x] "What this report can't see" section present, prominent (navy card with gold bullets)
- [x] Booking form captures lead + attempts email send (dev-mode logs when RESEND_API_KEY missing)
- [x] No Lorem Ipsum, no placeholder text anywhere
- [x] Mobile layout: 375px-safe, CTAs full-width on mobile, call-link in header, tap targets ≥44px
- [x] Build passes cleanly, no TypeScript errors, no lint warnings

## Sanity-checked valuations (NW11 + nearby)

| Postcode | Type | Beds | Condition | Range |
| --- | --- | --- | --- | --- |
| NW11 8HB | Flat | 2 | Good | £500k–£585k |
| NW11 7XU | Terraced | 3 | Good | ~£915k–£1.075M |
| NW11 6XL | Semi | 3 | Excellent | £1.205M–£1.415M |
| NW11 9 | Flat | 1 | Needs work | £340k–£400k |
| NW4 2 | Semi | 4 | Good | £975k–£1.145M |
| NW3 1 | Detached | 5 | Renovated | £4.6M–£5.4M (Hampstead prime) |

## What's left to ship the demo

1. **Jack provides Resend API key** (sign up at resend.com → API keys). Set as `RESEND_API_KEY` in Railway env vars.
2. **Deploy to Railway**: `railway login && railway link && railway up`. Set the env var and the SQLite DB ships with the repo.
3. Paste the live URL, record Loom, send to Kingsleys.

## Replicating for the other 9 agencies

```bash
npx tsx scripts/add-agency.ts \
  --slug=dreamview \
  --name="Dreamview Estates" \
  --address="34 Golders Green Road, London, NW11 8LL" \
  --phone="020 8455 0055" \
  --email="mail@dreamviewestates.co.uk" \
  --website="https://dreamviewestates.co.uk" \
  --director="Director Name" \
  --primary="#hex-from-their-site" \
  --logo="https://.../their-logo.png"
```

Then visit `/dreamview`, check colours + director CTA, redeploy. ~20 min per agency.

## Known limitations / not-for-v1

- No EPC cross-reference — bedrooms are inferred from type, not verified against floor area. Good enough for a range; the brief agreed to Option 1.
- No Companies House API integration — director looked up manually via About page. For agencies without an obvious director on their site, look up manually before adding.
- No postcodes.io autocomplete on the postcode field — we validate format but don't suggest matches. Fine for demo; easy to add later.
- Booking "preferred time" is a simple dropdown, not a real calendar — per the brief.
- No rate limiting on endpoints — add before scaling beyond 10 agencies.

## File map

```
app/
  layout.tsx                   # root HTML + fonts (Cormorant Garamond, Inter)
  page.tsx                     # / → /kingsleys redirect
  [agency]/
    layout.tsx                 # injects CSS vars for the agency's brand colours
    page.tsx                   # server component that loads agency config
  api/
    valuation/route.ts         # POST: inputs → valuation result
    book/route.ts              # POST: booking → email via Resend (or dev-mode log)
components/
  AgencyApp.tsx                # top-level SPA state machine + Header/Footer/Welcome/Loading/Thanks
  StepForm.tsx                 # 5-step vendor form with progress bar
  ReportView.tsx               # report output with range card, comps, "can't see" section, CTAs
  BookingForm.tsx              # contact + preferred time form
lib/
  branding.ts                  # agency configs (add new ones here)
  db.ts                        # better-sqlite3 read-only connection
  valuation.ts                 # median-based range calc + outlier trimming + comparable selection
  postcode.ts                  # UK postcode parsing helpers
  email.ts                     # HTML + text email templates for bookings
scripts/
  import-land-registry.ts      # CSV → SQLite (run once; DB is committed)
  add-agency.ts                # scaffold a new branded instance
data/
  land-registry.db             # 3.3MB SQLite, shipped with repo
public/agencies/kingsleys/
  logo.png                     # real Kingsleys logo
railway.json, nixpacks.toml    # Railway deploy config
```
