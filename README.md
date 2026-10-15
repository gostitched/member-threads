# Member Threads: marketing site

The public site for Member Threads: premium custom apparel collections for
organizations (university clubs and student orgs, companies, nonprofits,
sports teams and fitness clubs, social clubs and associations). Customers
start from a curated catalog and customize colors, fabric, fit, graphics and
embroidery into one cohesive collection, from 36 pieces per style. Member
Threads is a Stitched Group company: Stitched runs sourcing, production,
quality control and logistics.

Next.js 15 (App Router), React 19, Tailwind, statically rendered.

## Routes

| Route | What it is |
|---|---|
| `/` | Hero, the chapter, how it works, FAQ |
| `/work`, `/work/[slug]` | Collections |
| `/catalog`, `/catalog/[slug]` | Pieces: starting points, each priced inside a collection |
| `/custom` | Fully custom pieces, developed from scratch |
| `/about` | Why we exist, the founder, who it's for, `#what-you-get`, Stitched Group |
| `/quote` | Start a collection (the intake form) |
| 404 | `src/app/not-found.tsx`, branded |

## Design system

Direction: a retail-grade apparel brand, not a promo-merch site. Restrained,
confident, generous whitespace, hairline rules instead of cards, heavy wide
caps over plain text, one script accent per view at most.

Tokens live in `tailwind.config.ts` (legacy names are remapped to the brand
board so components stay put):

- **Green** `#133327` (`ink`, `green`): type, buttons, the logo.
- **Paper** `#F7F3EC` (`paper`): the default ground.
- **Cream** `#EEE6D9` (`cream`, `ash`): raised bands, chips; logo colour on dark.
- **Beige** `#C4B19A` (`beige`, `electric`, `pop`): plates, chips, tints, and
  accent type on dark grounds. Never body type on light grounds.
- **Dusty Blue** `#223041` (`dusty`, `blue`, `uv`, `navy`): the second dark:
  hover, accent type on light grounds, full-bleed bands (the footer).

The one button is `.btn-blue`, a green pill that turns dusty blue on hover.
Secondary pages, the header and the footer share one frame (`FRAME` in
`src/components/frame.ts`: 1536px max, 56px gutters at `lg`) so their edges
line up with the home hero.

Type is loaded with `next/font/google` in `src/app/layout.tsx`. **Archivo**
does everything: `font-display` heavy and wide for caps (standing in for The
Bold Font), `font-sans` for body (standing in for Acumin), `font-mono` as
small tracked caps labels (`.label`). **Yellowtail** (`font-serif`) stands in
for the brand script, Billion Dreams: used sparingly, never italic.

Logos: `public/mt-logo.svg` (script "Member" over block "THREADS") and
`public/mt-mark.svg` (MT lettermark), both green `#133327`;
`public/favicon.svg` is the lettermark. `Wordmark` in
`src/components/SiteHeader.tsx` inlines the primary logo's path data
unchanged with `fill="currentColor"`, so the header shows it in green and the
footer in cream on dusty blue, as on the brand board. If the logo file
changes, re-copy its paths there.

### Personalisation and motion

- **Name**: the organization's name, typed into the home hero, stored in
  `localStorage` (`mt:name`) via `useOrgName()` in `src/lib/name.ts`, and
  echoed across the site, including the /quote headline ("Start the Harbor
  Run Club collection.") and the woven label beside the form. Server render
  and hydration always use the default, so there are no hydration mismatches.
- **Colorway**: palettes in `src/lib/vibe.ts` (`mt:vibe`), applied as CSS
  variables on the hero.
- **Trims**: `Sticker` renders garment trims (`label`, `chip`, `care`, `tag`,
  `pip`), set straight, with production-true copy.
- **Motion**: color and text move, layout doesn't. Everything is static under
  `prefers-reduced-motion`. No animation libraries.

## The intake form (`/quote`)

`/quote` frames Stitched's customer app (`/request` on `app.gostitched.com`) so
requests land directly in the real order pipeline. That needs no change on the
dashboard side:

- Framing uses an **iframe**, so CORS is not involved.
- The dashboard's middleware already serves `/request` with `frame-ancestors *`.
- `src/components/RequestForm.tsx` implements the same postMessage contract as
  the dashboard's embed script (`stitched-form-*` messages), including the height
  ack. The form keeps its own scrollbars until it hears a height back, so the ack
  is not optional.

This repo is otherwise independent of the dashboard: separate project, build and
environment, and nothing here imports from it.

## The catalog (`/catalog`)

By default the pieces come from local data in `src/lib/catalog/local.ts`
(`LOCAL_CATALOG`), drawn with `src/components/catalog/GarmentArt.tsx` in each
colourway. Set `CATALOG_SOURCE=live` to read the dashboard's public catalog API
instead (see `src/lib/catalog/api.ts`).

## Running it

```bash
npm install
npm run dev      # http://localhost:3000
npm run build
```

## Configuration

| Variable | Purpose | Default |
|---|---|---|
| `NEXT_PUBLIC_APP_URL` | Origin of the customer app that serves `/request`. | `https://app.gostitched.com` |
| `CATALOG_SOURCE` | `live` reads the catalog from the dashboard; anything else uses local data. | local |
| `STITCHED_CATALOG_KEY` | Embed key for the live catalog. | dashboard default |

Set these in the Vercel project for this site. They are read at build time.

## Deploying

The Vercel project (`stitched1/member-threads`) is connected to this repo:

- Every push to `main` deploys to production at https://member-threads.vercel.app.
- Every pull request gets a preview deployment, linked from the PR's Vercel check.

`memberthreads.com` still points at the old static site on GitHub Pages
(`gh-pages` branch). To move it, add the domain under Vercel → Settings →
Domains, swap the DNS records at the registrar for the ones Vercel lists, then
turn off GitHub Pages.

## Where the content lives

Copy is kept out of the components:

- `src/lib/site.ts`: site URL, contact, nav, capabilities, FAQ.
- `src/lib/about.ts`: founder, origin story, "what you get", the Stitched Group note.
- `src/lib/work.ts`, `src/lib/cases.ts`: the collections.
- `src/lib/chapter.ts`, `src/lib/process.ts`: the home chapter.
- `src/lib/catalog/local.ts`: pieces and starting prices.
- `src/components/HowItWorks.tsx`: the six steps.

## Before launch

Every item below was written from the brand brief and is marked `[CONFIRM]`
in the code. Check each one; anything left as-is ships as written.

- [ ] **Domain**: `SITE_URL` / `metadataBase` is `https://memberthreads.com` (`src/lib/site.ts`).
- [ ] **Inbox**: `hello@memberthreads.com` exists and is monitored (`CONTACT` in `src/lib/site.ts`).
- [ ] **FAQ pricing**: "one clear price per piece" and the catalog's starting prices.
- [ ] **FAQ lead time**: 6 to 8 weeks as the recommended start.
- [ ] **Minimum**: 36 pieces per style, sizes mixed within a style (FAQ, footer, /about, /quote).
- [ ] **About, origin story**: Ethan working directly with manufacturers on fabric, fit, color and labels (`ORIGIN.story` in `src/lib/about.ts`).
- [ ] **About, Stitched Group**: Member Threads designs; Stitched Group runs sourcing, production, QC and logistics (`STITCHED`).
- [ ] **About, what you get**: one dedicated designer per collection, reorders saved on file, and **nationwide (U.S.) delivery**, packed by size (`OFFER`).
- [ ] **/quote**: "if the timeline is tight, we tell you on day one" and "a designer reads every request".
- [ ] **/custom**: the fabric, fit, construction and trim examples; whether fully custom pieces carry the same 36-piece minimum.
- [ ] **Founder photo**: `public/about/founder.jpg` is approved for use.
- [ ] **Collections**: any collection not yet produced is labelled "Concept"; piece counts and lead times on them are illustrative. Replace with real collections (and photography, with the organization's permission) as they ship.
- [ ] **Case study metrics**: lead times and piece counts in `src/lib/cases.ts`.
- [ ] **Catalog**: starting prices, fabrics, GSM, colourways and sizes in `src/lib/catalog/local.ts`.
- [ ] **Intake form**: `/quote` frames Stitched's `/request` form; confirm the form's own copy reads right for organizations, and that leads land under the Member Threads embed key.
- [ ] **Fonts**: Archivo and Yellowtail are stand-ins for The Bold Font, Acumin and Billion Dreams. Swap in licensed brand fonts if available.
