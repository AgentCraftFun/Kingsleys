# Estate Agent Valuation Tool — Project Context

_Last updated: 19 April 2026 (evening)_
_User location: London, NW11 focus_
_Campaign launch: tomorrow morning (20 April 2026)_

---

## Executive summary

Build hyper-personalised **Property Intelligence Reports** as free gifts for London boutique estate agents, delivered with their branding already applied. Each report is a single branded web page pulling Land Registry data for the property's postcode sector, showing recent comparable sales, market context, and a clear path to book an in-person valuation with the agent. Offer to install and maintain for £1,750 setup + £150/month.

Test cluster: 10 Tier 1 agencies in NW11 (Golders Green and nearby). Seven are on Golders Green Road alone. All have demonstrably weak, broken, missing, or portal-outsourced valuation infrastructure. KFH and Foxtons offer polished instant tools for comparison — so the gap is real, visible, and pitchable.

---

## The wedge

Big London chains (KFH, Foxtons, Dexters, Hamptons) have full instant valuation tools with Land Registry integration. Everyone below them has some variant of weak valuation experience. Vendors comparing agencies silently prefer the chain experience, so boutiques lose instructions they don't know they're losing.

---

## The five failure-mode patterns

| # | Pattern | Examples | Opening line |
|---|---|---|---|
| 1 | **Broken form** — renders code, fails silently | Dreamview, Rawlins | "Your form is broken — here's proof I tested it" |
| 2 | **Stale site** — copyright years old | Kingsleys | "Noticed your site's been the same since 2021" (warm intro preferred) |
| 3 | **Weak form but functional** | Gravity, Golders Green Estates, Ellis & Co, Temple Fortune | "KFH has this tool, you don't" |
| 4 | **No valuation path at all** | Hendon Estates | "Every other agency on your road has this, you have none" |
| 5 | **Portal-dependent** — pays Zoopla/OTM for leads | Key Haven | "You're paying for leads your own site should capture" |

Winkworth sits outside these — actively anti-AVM as a positioning choice.

---

## Tier 1 targets — 10 agencies in/near Golders Green

### 1. Gravity Estates
- 18 Golders Green Road, NW11 8LL — gravity-estates.com
- Pattern #3, Platform: TechnicWeb

### 2. Dreamview Estates
- 34 Golders Green Road, NW11 8LL — dreamviewestates.co.uk
- 020 8455 0055 — mail@dreamviewestates.co.uk
- **FORM IS BROKEN** — no confirmation after 3 submissions
- Pattern #1, Platform: GNB Property

### 3. Ellis & Co (Golders Green)
- 52 Golders Green Road, NW11 8LN — 020 8455 1014
- Franchise of TPFG (~1,500 UK branches — grapevine effect if landed)
- Pattern #3

### 4. Winkworth (Golders Green)
- 891 Finchley Road, NW11 8RR — +44 (0) 20 8458 8313
- Explicitly anti-AVM: "Online Valuations Aren't Worth The Paper They're Printed On"
- Partners: Graham Gold (Sales), Howard Greenfield (Lettings)
- **Defer until 3+ references secured**

### 5. Golders Green Estates
- goldersgreenestates.uk — 020 8728 0700
- Copyright typo: "© Golders Green **Esttes** 2025"
- Promises "cutting-edge analysis" — delivers 7-field form
- Pattern #3, Platform: Drupal + Rhythm theme

### 6. Kingsleys Estates ⭐ FIRST TARGET — WARM INTRO
- 92 Golders Green Road, NW11 8HB — kingsleys-estates.co.uk
- 020 8458 3333 — info@kingsleys.uk
- 7-field form, copyright 2021 (stale)
- Tagline: "Big Enough To Cope, Small Enough To Care"
- **Human previously rented a flat through them**

### 7. Rawlins Estates
- rawlinsestates.co.uk — +44 208 371 0033 — info@rawlinsestates.co.uk
- **Landlord appraisal form renders `[gravityform id="7"...]` as literal text**
- Principal: **Rachel Elroy** — 60+ glowing personal testimonials
- Lettings-focused, landlord-heavy
- Pattern #1

### 8. Hendon Estates
- 135 Golders Green Road, NW11 8HG — hendonestates.com
- 020 8202 3817 — info@hendonestates.com
- **NO VALUATION ROUTE AT ALL**
- Listing £1m+ houses with no capture path
- Pattern #4

### 9. Key Haven Estates
- 233A Golders Green Road, NW11 9ES — keyhavenestates.co.uk
- 020 3641 0749
- **Entire digital presence outsourced to Zoopla/OnTheMarket** — paying portal lead fees
- Named in testimonials: Simon (probable director)
- Pattern #5

### 10. Temple Fortune Estates
- 1 Hallswelle Parade, Finchley Road, NW11 0DL — templefe.co.uk
- 020 8952 0908
- Standard weak form, promises "Accurate & Professional Valuations"
- Platform: **Built by The Property Jungle** (new white-label provider discovery)
- Pattern #3

---

## Product principle — Property Intelligence Report positioning

The product must NOT be framed as instant valuation. Instead:

- Recent comparable sales (addresses, dates, prices, distance)
- Local market context (sale volumes, days on market, asking-to-sold ratio)
- A **range**, not a point estimate — clearly labelled as public-data-only
- "What this report can't see" section listing condition, finish, lease, etc.
- Primary CTA: "For accurate valuation, book free 30-min home visit with [Director]"

**Rename options**: Property Intelligence Report, Local Market Report, Vendor Insights Tool, Home Value Report.
**Never call it**: Instant Valuation.

---

## Pricing

- Setup: £1,750–£2,500
- Monthly: £150–£300
- Compares favourably vs Rightmove listing fees (£1,500+/month per branch)

---

## Go-to-market sequence

1. Build Kingsleys version properly tonight
2. Send to Kingsleys first (warm intro = 5–10× close rate)
3. Dreamview second (broken form = strongest cold hook)
4. Rawlins third (soft pitch, highest-value potential — Safeland PLC connections)
5. Rest: Gravity, Golders Green Estates, Ellis & Co, Hendon, Key Haven, Temple Fortune
6. Winkworth: defer until 3+ references secured
7. Next clusters: Hampstead High Street, Upper Street Islington, King's Road Chelsea, Northcote Road Clapham

---

## Key principles to remember during build

- Product name is **Property Intelligence Report** — never "Instant Valuation"
- Always show a **range**, never a point estimate
- Always include "What this report can't see" section
- Primary CTA is "book an in-person valuation with [Director Name]"
- Mobile-first — vendors will tap the Loom link on phones
- One email, one Loom, one live link. "Yours regardless."
