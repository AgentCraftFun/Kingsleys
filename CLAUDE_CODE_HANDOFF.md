# Handoff to Claude Code — Property Intelligence Report Build

**You are Claude Code, picking up a build mid-stream.** Read this document in full before writing any code. The strategic context, product positioning, data approach, and target audience have all been worked out in a prior session — your job is to execute the build.

---

## What you're building

A **Property Intelligence Report** tool: a single-page web app where a vendor enters their property details (postcode, type, bedrooms, condition) and receives a branded report showing:

1. A price range (never a point estimate) based on Land Registry comparables
2. 3-5 recent comparable sales nearby with real addresses/dates/prices
3. A rental valuation with implied yield
4. A "What this report can't see" section listing factors requiring in-person valuation
5. A clear CTA to book an in-person valuation with the agent

The tool is **explicitly not** an "instant valuation" in the KFH/Zoopla sense. It is a vendor-capture layer positioned as "data-informed preparation for the expert's visit." This framing is critical — it sidesteps the "online valuations are worthless" attack that premium agents make.

The first branded instance is for **Kingsleys Estates**, a Golders Green boutique agent the human has a warm intro with (they previously rented a flat through Kingsleys).

---

## Business context (why this matters)

The human is building a personalised outbound sales business targeting London boutique estate agents. Plan: ship this tool to 10 mapped Golders Green-area agencies tomorrow, each branded as theirs, as a free gift with an offer to install/maintain for £1,750 setup + £150/month.

Kingsleys is the first target because warm intro = 5-10x higher close rate than cold. If Kingsleys converts, that reference unlocks the other 9 (all competitors on the same high street). If this works, it scales to ~2,900 London agencies and ~25,000 UK-wide.

**Quality bar**: the demo must look like something KFH could have built. Premium boutique agents will instantly dismiss anything that looks amateur. No dev-ugly UI. No placeholder data visible. No Lorem Ipsum. Must render well on mobile (most vendors will open the Loom link on phones).

---

## Product principles (non-negotiable)

1. **Never call it "Instant Valuation"** — use "Property Intelligence Report", "Local Market Report", or similar. The brand positioning hinges on this.
2. **Always show a range, never a single number.** A £843,000 point estimate can be wrong and damage the agent's credibility. "£820,000 – £920,000" is defensible.
3. **Always include a "What this report can't see" section.** List: condition and finish quality, extensions/loft conversions not in Land Registry, views and orientation, lease terms (for flats), micro-location within the postcode.
4. **Primary CTA is "Book a free in-person valuation with [Director Name]"** — not "Get my full valuation" or anything implying the tool is the product. The tool exists to pre-sell the visit.
5. **Lead capture is mandatory for the booking flow**, optional for just viewing the report. Give the vendor value first, then capture.
6. **Mobile first.** Most people will tap the Loom link on a phone.

---

## Kingsleys Estates — branding and specifics

- **Agency name**: Kingsleys Estates
- **Address**: 92 Golders Green Road, London, NW11 8HB
- **Phone**: 020 8458 3333
- **Email**: info@kingsleys.uk
- **Website**: https://www.kingsleys-estates.co.uk
- **Tagline**: "Big Enough To Cope, Small Enough To Care"
- **Brand style**: existing site uses white/navy/warm greys with a simple serif-ish logo. **Pull the actual logo and exact brand colours from their site** — do not guess. Their logo asset is at `https://www.kingsleys-estates.co.uk/wp-content/uploads/2021/11/klogo.png`.
- **Director name**: needs to be researched via Companies House or their About Us page (https://www.kingsleys-estates.co.uk/about-us/). Do this as an early step — the whole tool is worthless without a named person on the booking CTA.

---

## Data approach

### The problem
Land Registry Price Paid Data is the right source — it's free, public, comprehensive, and includes every property transaction in England and Wales since 1995. Download from:
`https://www.gov.uk/government/statistical-data-sets/price-paid-data-downloads`

The monthly file (`pp-monthly-update-new-version.csv`) is manageable; the full file is ~4GB.

### Recommended approach for tonight
1. Download the monthly file (much smaller — few MB)
2. Filter to postcodes starting with NW11, NW4, NW2, NW3 (covers the entire Golders Green / Hampstead / Hendon cluster)
3. Load into SQLite for querying
4. Augment with 2-3 years of historical data if time permits (more comparables = better demo)

### Data schema (Land Registry CSV columns)
```
transaction_id, price, date_of_transfer, postcode, property_type, old_or_new,
duration, paon, saon, street, locality, town_city, district, county,
ppd_category_type, record_status
```

Property type codes: D=Detached, S=Semi, T=Terraced, F=Flat, O=Other

**Important**: Land Registry does NOT include bedroom count or floor area. You have two options:

1. **Infer from price/type** — reasonable for NW11 where prices cluster by type
2. **Cross-reference with EPC data** (epc.opendatacommunities.org — free API, gives floor area for most properties) — more accurate but more work

For tonight's demo, Option 1 is sufficient. Display comparables by type + price without claiming exact bedroom matches. Use phrases like "3 recent sales of similar-size houses in NW11 8" rather than "3-bed houses matching yours exactly."

### Valuation logic
```
1. Parse user input: postcode sector (e.g. "NW11 8"), property type, bedrooms, condition
2. Query SQLite: filter to same postcode sector + same property type + last 18 months of sales
3. If < 3 results, widen to postcode district (e.g. "NW11")
4. Compute median sale price
5. Adjust for condition:
   - "needs work" → -10%
   - "good" → 0%
   - "excellent" → +5%
   - "recently renovated" → +10%
6. Apply ±8% range around the adjusted median
7. Return: lower bound, central estimate, upper bound
8. Separately: select 3-5 recent comparables (same postcode sector + type, sorted by date desc)
```

### Rental yield lookup
Hardcode area-based rental yields for the demo:
- NW11 Golders Green: ~3.8%
- NW11 Hampstead Garden Suburb: ~3.5%
- NW4 Hendon: ~4.5%
- NW2 Cricklewood/Willesden: ~5.0%
- NW3 Hampstead: ~3.2%

Rental valuation = (central estimate × yield) / 12 = PCM figure.

---

## Technical stack (recommended)

- **Framework**: Next.js 15 (app router) + TypeScript + Tailwind
- **Deploy**: Railway (not Vercel — ignore Vercel references elsewhere in this brief)
- **Database**: SQLite for the Land Registry data. `better-sqlite3` npm package is simple and fast for read-heavy use.
- **Lead capture**: POST endpoint that stores submission + emails the destination address. Use Resend. For the demo it's fine to email JackColeProductions@gmail.com and he can forward.
- **Hosting cost target**: < £10/month.

### Project structure suggestion
```
/
├── app/
│   ├── page.tsx                    # Landing / intro
│   ├── report/
│   │   ├── page.tsx                # Multi-step form
│   │   └── [id]/page.tsx           # Generated report view
│   ├── api/
│   │   ├── valuation/route.ts      # POST: inputs → report data
│   │   └── book/route.ts           # POST: booking capture + email
│   └── layout.tsx
├── lib/
│   ├── db.ts                       # SQLite connection
│   ├── valuation.ts                # Valuation logic
│   └── branding.ts                 # Per-agency config
├── data/
│   └── land-registry.db            # SQLite DB with NW postcodes
├── scripts/
│   └── import-land-registry.ts     # CSV → SQLite import
└── public/
    └── agencies/
        └── kingsleys/
            └── logo.png
```

### Branding config pattern
```typescript
// lib/branding.ts
export const agencyConfigs = {
  kingsleys: {
    name: "Kingsleys Estates",
    shortName: "Kingsleys",
    address: "92 Golders Green Road, London, NW11 8HB",
    phone: "020 8458 3333",
    email: "info@kingsleys.uk",
    directorName: "[LOOK UP ON COMPANIES HOUSE]",
    directorTitle: "Director",
    logoPath: "/agencies/kingsleys/logo.png",
    colors: {
      primary: "#[pull from site]",
      secondary: "#[pull from site]",
    },
    tagline: "Big Enough To Cope, Small Enough To Care",
    postcodesCovered: ["NW11", "NW4", "NW2", "NW3"],
    rentalYield: 0.038,
    reportName: "Kingsleys Property Intelligence Report",
  },
  // ... other 9 agencies follow same shape
};
```

The route to a branded version should be `/{agencySlug}`. Path-based (`/kingsleys`) is fine for the demo.

---

## UX flow (three screens)

### Screen 1 — Welcome
- Kingsleys logo top-left, their phone top-right
- Headline: "Discover what your property is worth"
- Sub: "Get a data-driven market report for your NW11 property using Land Registry data. Free, no obligation."
- Big CTA button: "Start my report"
- Subtle trust signals at bottom: "Powered by Land Registry data" / "3-min process"

### Screen 2 — Property details (multi-step, one question at a time looks modern)
- Step 1: Postcode (autocomplete via postcodes.io API would be classy)
- Step 2: Property type (Flat / House / Maisonette) with nice icons
- Step 3: Bedrooms (1-6+ buttons)
- Step 4: Condition (Needs work / Good / Excellent / Recently renovated)
- Step 5: Key features (checkboxes: Garden, Off-street parking, Period features, Share of freehold, Loft potential)
- Progress bar at top
- "Back" and "Continue" buttons

### Screen 3 — Report output
- Agency-branded header
- "Your Property Intelligence Report"
- Property address echo
- **Price range** card: "£820,000 – £920,000" large, bold. Small caveat: "Indicative range based on public Land Registry data"
- **Rental valuation** card: "£2,650 – £2,900 PCM" with yield %
- **Comparable sales** table: 3-5 real recent sales, addresses, dates, prices, property types
- **What this report can't see** section: condition quality, extensions/lofts, specific features, lease terms, micro-location. "For an accurate valuation that accounts for these, [Director Name] will visit your property."
- **Big CTA**: "Book a free 30-minute valuation with [Director Name]" → booking form
- Secondary CTA: "Email me this report"

### Booking form
- Name, email, phone
- Preferred date/time (simple dropdown for demo, not a real Calendly)
- Message (optional)
- On submit: email to JackColeProductions@gmail.com with full report data + vendor contact details, thank-you screen for vendor

---

## Critical quality checks before calling it done

- [ ] Mobile view actually works (test in devtools at 375px width)
- [ ] Real Kingsleys logo loads (not a placeholder)
- [ ] Real colours pulled from their site (inspect element, don't eyeball)
- [ ] Director's real name is on the CTA (research via Companies House if needed)
- [ ] Comparable sales shown are real addresses from NW11 Land Registry data
- [ ] "What this report can't see" section is present and prominent
- [ ] Booking form captures lead and emails JackColeProductions@gmail.com (test with a real submission)
- [ ] No Lorem Ipsum or placeholder text anywhere visible
- [ ] Page load is under 2s
- [ ] Works when deployed to Railway, not just locally

---

## Scaling pattern for the other 9 agencies

Once Kingsleys is live, each additional agency is ~20 minutes:

1. Create new entry in `agencyConfigs`
2. Download their logo, screenshot their site for colours
3. Look up director name on Companies House
4. Adjust postcodes covered if different from Kingsleys
5. Deploy → path like `/gravity`, `/dreamview`, etc.
6. Record a 90-second Loom walking through their branded version

Full list of 10 Tier 1 agencies with addresses, phones, platforms, and pitch angles is in the accompanying `estate_agent_campaign_plan.md` file.

---

## What to do first when you start

1. Read `estate_agent_campaign_plan.md` for full strategic context
2. Look up the Kingsleys director name — start at https://www.kingsleys-estates.co.uk/about-us/ and fall back to Companies House for "Kingsleys Estates Ltd" (filter to 92 Golders Green Road NW11 8HB if multiple matches)
3. Visit kingsleys-estates.co.uk and inspect the actual brand colours with devtools
4. Download their logo to `public/agencies/kingsleys/logo.png`
5. Set up the Next.js project
6. Download the Land Registry monthly CSV and import NW postcodes into SQLite
7. Build the valuation logic and verify it gives sensible numbers for a test NW11 property
8. Build the three UI screens
9. Wire up the booking email (Resend key will be provided before this step)
10. Deploy to Railway
11. Test on mobile
12. Hand live URL back for the Loom recording and outreach email

Reasonable time budget: 3-5 hours focused work for a polished v1.
