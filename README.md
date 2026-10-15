# Member Threads: marketing site

The public site for Member Threads, custom apparel collections for Bar, Bat
and B'nai Mitzvahs. A Stitched brand: the Studio is the customer-facing creative
side; Stitched's design and production team makes every piece.

Next.js 15 (App Router), React 19, Tailwind, statically rendered.

## Routes

| Route | What it is |
|---|---|
| `/` | Hero (drawn concept collection), the chapter ("We actually make the clothes" / "Designed around them"), how it works, FAQ |
| `/work`, `/work/[slug]` | Collections (`jake`, `sophie`, `levi-noa`, `ella`; all concepts for now) |
| `/catalog`, `/catalog/[slug]` | Pieces: starting points, each priced inside a collection |
| `/custom` | Fully custom pieces |
| `/about` | The Studio, including `#planners` |
| `/quote` | Start a collection (the intake form) |

## Design system

Direction: **WHITE v1, "Your party. Your collection."** (`.plan/WHITE.md`).
An off-white page with chunky navy display type, baby-blue and pink accents,
rounded white cards and the odd star doodle. Friendly, confident, little copy.

Tokens live in `tailwind.config.ts` (names kept from the original system):
`ink` `#0E1A47` is navy TYPE (and the solid pill), `paper` `#F8F6F1` is the
GROUND; `muted`, `ash`, `ash-2`, `rule` are warm neutrals. `electric`
`#A9CCF4` baby blue (plates, chips, tints; never type), `electric-lit`
`#DCE9F9` pale-blue ground, `blue` / `electric-deep` `#2B5BD7` (links, hover),
`uv` `#C8336E` raspberry (accent type, doodles, the thread), `uv-lit` / `pop`
`#F9A8C9` sticker pink, `pop-lit` `#FDDAE6`, `cream` `#F5EEDC`. Rules: every
ground is paper; cards are `bg-white rounded-3xl ring-1 ring-rule`; nothing
glows, sweeps or strobes; at most one star doodle (`<Star>` in
`src/components/Sticker.tsx`) per section. The one button is `.btn-blue`, a
navy pill. The thread colour is `--thread` in `src/app/globals.css`.

Type is loaded with `next/font/google` in `src/app/layout.tsx`: Rubik 700/900
(display caps, wordmark, numerals), Jost (body, nav, buttons, the "turn" lines
in medium) and DM Mono (labels, form small print).

Logos: `public/mt-logo.svg` (primary script wordmark) is rendered by `Wordmark`
in `src/components/SiteHeader.tsx` for the header and footer. `public/mt-mark.svg`
is the MT lettermark, and `public/favicon.svg` is that lettermark on a paper tile.
Both brand files are dark green (`#133327`).

### Hype layer (name, colorway, motion)

- **Name**: typed into the home hero (`01 / NAME`), stored in `localStorage`
  (`mt:name`) via `useKidName()` in `src/lib/name.ts`, and echoed on the hero
  headline and swing tag, the header readout and CTA, the chapter and finale,
  the /work reserved frame, the footer woven label and the /quote headline.
  Server render and hydration always use the default, so there are no
  hydration mismatches.
- **Colorway**: five palettes in `src/lib/vibe.ts` (`mt:vibe`; ids frozen,
  shown as Colorways 01–05), applied as CSS variables (`--v-ground` etc.) on the
  hero with a 400ms cross-fade; the header reads it while it sits transparent
  over the hero, then turns ink on scroll.
- **Trims**: `Sticker` renders garment trims (`label`, `chip`, `care`, `tag`,
  `pip`), set straight, at most two per viewport, with production-true copy.
- **Motion**: color and text move, layout doesn't. `Marquee` (48s),
  `useDrag` on the swing tag and woven label, `.slap` (240ms) only for the name
  landing and the ADDED chip, one slow parallax rate on the hero photo.
  `.tilt` / `.wiggle` / `.nudge` are retired no-ops. Everything is static under
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
- `src/lib/about.ts`: founder, origin story, milestones, planner section.
- `src/lib/work.ts`, `src/lib/cases.ts`: the collections.
- `src/lib/chapter.ts`, `src/lib/process.ts`: the home chapter.
- `src/lib/catalog/local.ts`: pieces and starting prices.
- `src/components/HowItWorks.tsx`: the six steps.

## Before launch

Every item below was written from the brand brief and is marked `[CONFIRM]`
in the code. Check each one; anything left as-is ships as written.

- [ ] **Domain**: `SITE_URL` / `metadataBase` is `https://memberthreads.com` (`src/lib/site.ts`).
- [ ] **Inbox**: `hello@memberthreads.com` exists and is monitored (`CONTACT` in `src/lib/site.ts`).
- [ ] **FAQ 01 pricing**: "Most land $5–10k" and the starting points (hoodies from $65, sweatpants ~$40, PJ pants ~$35, tees ~$25, jerseys ~$35, hats ~$25).
- [ ] **FAQ 02 timing**: 12 weeks before the event as the recommended start.
- [ ] **FAQ 03 minimum**: collections start around 50 guest pieces, with smaller runs inside.
- [ ] **FAQ 04 sizing**: youth XS–XL and adult S–2XL; a size-collection link or RSVP list; extras built in.
- [ ] **FAQ 05 planners**: proofs go to planner and family together; delivery to venue or hotel.
- [ ] **How it works**: one designer per family as the point of contact; delivery in custom boxes to home, venue or hotel.
- [ ] **About**: founder quote ("The apparel should feel as considered as the rest of the event."), the origin story and the milestone lines (`src/lib/about.ts`). Add a founder photo at `public/about/` and set `FOUNDER.photo`.
- [ ] **Collections are concepts**: Jake, Sophie, Levi & Noa and Ella are labelled "Concept". Piece counts, cities and lead times on them are illustrative. Replace with real collections (and photography, with the family's permission) as they ship.
- [ ] **Case study metrics**: lead time and piece/guest counts in `src/lib/cases.ts`.
- [ ] **Catalog**: starting prices, fabrics, GSM, colourways and sizes in `src/lib/catalog/local.ts`.
- [ ] **Illustration specs**: Pantone codes and measurements in the Sophie drawings (`public/chapter/sophie-*.svg`, PANTONE 2767 C, 24" chest, 3" patch, etc.) and the GSM on catalog pieces other than the 420 GSM hoodie are illustrative.
- [ ] **Concept guest counts**: Jake 64, Levi & Noa 110, Ella 58 are invented (only Sophie's 80 is from the brief).
- [ ] **Intake form**: `/quote` frames Stitched's `/request` form; confirm the form's own copy reads right for Mitzvah families, or point `NEXT_PUBLIC_APP_URL` at a Studio-branded version.
- [ ] **Logo**: `public/mt-mark.svg` / `public/mt-logo.svg` are first-pass marks drawn for this launch. Swap in final artwork if a designer produces one.
