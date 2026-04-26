# Agency logo drop-in

Each agency's branded page reads its logo from `public/agencies/{slug}/`.

The server-side resolver (`resolveAgencyLogoPath` in `lib/branding.ts`) tries
files in this order:

1. `logo.png` — preferred. Drop the real artwork here.
2. `logo.svg` — fallback. The current SVG wordmarks live here for the three
   agencies whose real PNGs we couldn't download from a sandboxed environment.
3. Whatever `logoPath` is set to in `lib/branding.ts`.

**That means you can drag a `logo.png` into the right folder via the GitHub
web UI, commit on this branch, and the page picks it up on the next deploy
with zero code change.**

## Where to drop each missing logo

| Agency | Drop here as `logo.png` |
| --- | --- |
| Winkworth | `public/agencies/winkworth/logo.png` |
| Ellis & Co | `public/agencies/ellisandco/logo.png` |
| Rawlins Estates | `public/agencies/rawlins/logo.png` |

## Filename convention

- Always name it exactly `logo.png` (lowercase).
- PNG with transparency preferred. White or off-white background fine if
  it'll sit on a white header (i.e. agencies without `headerBg: "primary"`).
- Aim for ~600px wide for retina sharpness. The page renders at h-6 to h-8
  (24–32px height), so anything ~150–600px wide works.

## Adding a brand-new agency

1. Run `npx tsx scripts/add-agency.ts ...` (see project README).
2. The scaffolder creates `public/agencies/{slug}/` for you.
3. Drop the agency's logo into that folder as `logo.png`.

## Logos already in place (PNG)

- `dreamview/logo.png`
- `goldersgreenestates/logo.png`
- `gravity/logo.png`
- `hendonestates/logo.png`
- `keyhaven/logo.png`
- `kingsleys/logo.png`
- `templefortune/logo.png`

## Logos awaiting real artwork (using SVG fallback)

- `ellisandco/logo.svg` — needs `logo.png`
- `rawlins/logo.svg` — needs `logo.png`
- `winkworth/logo.svg` — needs `logo.png`
