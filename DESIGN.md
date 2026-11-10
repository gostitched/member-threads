# Member Threads: Design System & Art Direction

Owner: art director. Foundation files (`src/app/layout.tsx`, `src/app/globals.css`, `tailwind.config.ts`, `src/lib/design.ts`, `src/components/frame.ts`) are AD-owned. **Page designers do not edit them.** Put page CSS in a co-located stylesheet imported by your component (`src/components/home/home.css`, like the existing `catalog.css`, `work.css`, `chapter.css`). Tailwind only ships classes it finds in `src/app`, `src/components` and `src/lib`, so write class names out in full; never build them from strings.

---

## 1. The idea: SEWN IN

Promo merch is *printed on*: a logo pressed onto a blank. Member Threads is *sewn in*: a collection made for the people who belong. Every good garment has a woven label sewn inside the collar, and every club has a roster. The site is built from those two objects.

- **The woven label** is the signature object. Small, square-cornered, a running stitch just inside its edge (`.woven`). It carries roster numbers (No. 036), categories, "Members only", status. It overlaps photo edges the way a label overlaps a seam.
- **The running stitch** is the one line that runs through the site (`.stitch-rule`, beige). It joins steps, divides the roster, underlines. Button hovers stitch themselves (`.btn::after`); links re-sew their underline (`.link-u`).
- **The roster.** Everything is numbered and issued, like a membership list: collections are No. 001–0XX, catalog styles MT-01 onward, steps 01–04. Numbers are set in the block face. 36 (the minimum) is the house number; use it.

The mood is the clubhouse, not the costume: Aimé Leon Dore / Sporty & Rich editorial calm with varsity weight used sparingly. Quiet paper, a serious serif voice, and then one heavy block moment that hits like the name across a chest.

## 2. Type

Three voices plus a signature. All Google Fonts via `next/font/google` (self-hosted at build):

| Voice | Family | License | Role |
|---|---|---|---|
| The Voice | **Newsreader** (Production Type), opsz 6–72, wght 200–800, italic | SIL OFL 1.1 | Headlines, leads, quotes. Italic is the only emphasis. |
| The Uniform | **Archivo** (Omnibus-Type), wght 100–900, wdth 62–125 | SIL OFL 1.1 | 900 at wdth 125 = the logo's block "THREADS" (numerals, names on garments). Display only. |
| The Hand | **Hanken Grotesk** (Hanken Design Co.), wght 100–900 | SIL OFL 1.1 | The sans at text sizes: body, UI, captions, filters, labels, spec. Warm and quiet beside the serif. Chosen over Archivo, Libre Franklin, Schibsted, Instrument Sans and others. |
| The Signature | **Yellowtail** (Astigmatic) | Apache 2.0 | Stand-in for Billion Dreams. Script, rare. |

Brand-board fonts (Billion Dreams, Acumin, The Bold Font) are not licensed for web; do not add them. Fontshare's Gambetta was tested and rejected: its ITF license forbids redistribution, and the font files would sit in the repo.

### Scale (use the class; it sets family, weight, width, size, leading and tracking)

| Class | Face | Mobile (390) | Desktop (1440) | Leading | Tracking | Use |
|---|---|---|---|---|---|---|
| `.t-mast` | Archivo 900/125 caps | 56px | 216px (max 256) | 0.80 | −0.035em | Footer "THREADS"; 404. Nowhere else. |
| `.t-display` | Newsreader 400 | 46px | 106px (max 128) | 0.94 | −0.03em | One per page: the page's headline. |
| `.t-h1` | Newsreader 400 | 38px | 69px (max 76) | 1.0 | −0.025em | Section headlines. |
| `.t-h2` | Newsreader 400 | 30px | 46px (max 48) | 1.05 | −0.02em | Sub-sections, roster names. |
| `.t-h3` | Newsreader 400 | 22px | 27px (max 28) | 1.15 | −0.012em | Item titles, product names, FAQ. |
| `.t-quote` | Newsreader 300 italic | 28px | 49px (max 52) | 1.08 | −0.02em | Testimonials, pull quotes. |
| `.t-lead` | Newsreader 400 | 19px | 24px | 1.42 | −0.006em | First paragraph after a headline. Max 56ch (`max-w-measure`). |
| `.t-block` | Archivo 900/125 caps | 24px | 43px (max 44) | 0.90 | −0.02em | Numerals, stats, roster numbers, short names. |
| `.t-body` | Hanken 400 | 16px | 17px | 1.6 | 0 | Reading text. Max 62ch. |
| `.t-small` | Hanken 400 | 14px | 14px | 1.5 | 0 | Secondary notes. |
| `.t-eyebrow` | Archivo 600 caps | 12px | 12px | 15px | 0.18em | Section labels. |
| `.t-spec` | Hanken 500 caps, tabular | 12px | 12px | 16px | 0.06em | Tech-pack lines, captions, prices, metadata. |

**12px floor:** nothing on the site computes below 12px (eyebrows, `.label`, `.t-spec`, `.caption`, `.woven`, chip counts). Don't scale these down with utilities.
| `.t-script` | Yellowtail | relative | relative | 1 | 0 | See rules. Rotated −5deg. |

Rules:
- **Headlines are sentences in the serif**, sentence case, with one italic word doing the emphasis ("Apparel your members *actually* want to wear."). No more all-caps headlines. The block face appears for numbers and names only, which is what makes it hit.
- `h1–h3` default to the serif. Existing `.caps` (now Archivo 900/125) is legacy; replace `caps` headlines with `.t-display`/`.t-h*` as you rebuild each section.
- **Script lives where it would be embroidered:** on garments, on hang tags, as a sign-off ("Welcome to the club."). Max one script moment per page, two to four words. Never in nav, buttons or body. Use `font-script`/`.t-script` (`font-serif` is the legacy name and still maps to the script).
- Body copy is ink at 80–100%, never grey on beige. `text-muted` (#4A564F, ≥5.5:1 on paper and cream) only for metadata.
- Eyebrows are optional. Use them when they carry information (No. 03 / Audiences), not as decoration on every section.

## 3. Colour

| Token | Hex | Role | Share |
|---|---|---|---|
| `paper` | #F4EFE6 | Main ground | ~65% |
| `cream` | #EEE6D9 | Alternate ground (`.band-cream`), photo plates | ~12% |
| `green` / `ink` | #133327 | All type on light; primary button; the clubhouse band (`.band-green`) | ~18% |
| `green-deep` | #0D241B | Footer, button hover | footer only |
| `beige` | #C4B19A | A FILL: stitch rules, plates, `.woven-beige`, large numerals on green | ~3% |
| `beige-deep` | #6A5A45 | Beige as TEXT on paper/cream (block numerals, small accents), ≥5.3:1 | |
| `dusty` | #223041 | Second dark: focus rings, `.duo-dusty` photos, script on light grounds | ≤2% |
| `rule` | #D3C8B6 | Hairlines on paper (`var(--rule-c)` adapts per band) | |
| `alert` | #9B2C1F | Form errors only | |

- One dark band per page plus the footer. Two adjacent dark sections never touch; paper always separates them.
- Beige is a fill colour. On paper/cream, beige-coloured text uses `beige-deep`. On green, beige only for numerals ≥24px and stitch; small caps on dark bands (eyebrows, `.t-spec`, captions) are cream at 80% (`var(--fg-muted)`), which the band classes enforce.
- Bands re-point contextual colours: inside `.band-green`/`.band-dusty`, `var(--fg-muted)`, `var(--rule-c)`, `.hairline`, `.stitch-rule`, focus rings and `.field` all adapt. Use `.fg-muted` rather than hard-coded opacities.
- Legacy names (`electric*`, `uv*`, `pop*`, `blue`, `sky`, …) still resolve to board colours; don't use them in new code.

## 4. Grid, space, shape

- Frame: `.shell` / `FRAME` (max 1536, side padding 20 / 32 / 56). Unchanged.
- Grid: `.grid-12` = 4 / 8 / 12 columns, gutter 16 / 24 / 32 (`gap-gutter`). Compose asymmetrically: headline cols 1–8, lead 9–12 aligned to the headline's last baseline; images that break into the gutter or bleed off one edge (never both).
- Sticky header: `html` has `scroll-padding-top` (88/100/108px) and inputs/anchors a matching `scroll-margin-top`, so anchors and focused fields clear the header. Don't add your own offsets.
- Section rhythm: `.sec` (80→160px), `.sec-sm` (56→96), `.sec-lg` (112→224). Nothing else. Inside a section: eyebrow→headline 20px, headline→lead 24–32px, lead→CTA 40px, header block→content 64–96px.
- Spacing scale: 4, 8, 12, 16, 24, 32, 48, 64, 96, 128, 160.
- **Shape: square.** Radius is `var(--radius)` = 2px on buttons, fields, chips; 0 on photos and plates. The only round things: colour swatches, the punched hole in a hang tag, radio dots. Remove every `rounded-2xl/3xl/[24px]` card.
- **No cards.** Content sits on the ground, divided by hairlines and space. Allowed containers: the photo frame, the cream product plate (no border, no shadow), the woven label, and physical objects (hang tag, receipt) which may take `.lift`, the only shadow on the site.

## 5. Components

- **Motif budget.** Max ONE hang tag per page. Woven labels only on photo corners and ID/roster numbers, max ~4 per viewport. Dashed stitch rules only as dividers that carry meaning (joining steps, splitting roster rows), never as decoration.
- **CTA standard.** The only primary label is "Start a collection" (write it in sentence case; `.btn` sets it in tracked caps). One primary per viewport. Secondary actions are sentence-case `.link-arrow` links, never tracked caps or a second button style. No page-level CTA directly above the footer's CTA: end pages with a next-step link instead.
- **Buttons:** `.btn-blue` (= `.btn-primary`, green), `.btn-white` (= `.btn-cream`, for dark bands), `.btn-outline` (hairline, current colour), modifier `.btn-sm`. Tracked caps 13px, 52/56px tall, square. Hover: a stitch appears inside the edge and the trailing arrow steps 4px. Always end primary CTAs with the arrow SVG. One primary per viewport.
- **The varsity:** short UI lines (nav, buttons, chips, woven labels, eyebrows, the hero promises "Premium Quality · Unlimited Customization · No Upcharges", Menu) are Big Shoulders Text caps (`--font-varsity`, `.t-uniform`), tall and condensed like a team jersey. Body and captions are Hanken Grotesk, the slip DM Mono; headlines stay Newsreader. Write them in Title Case or sentence case in source; CSS caps them. Never a sentence.
- **Links:** `.link-u` (re-sewing underline) for inline and nav; `.link-arrow` for "See all →".
- **Labels:** `.t-eyebrow`; `.woven` (cream), `.woven-green`, `.woven-beige`, `.woven-dusty`, `.woven-lg`. `.stamp` is legacy and renders as `.woven-green`.
- **Tags:** `.tag` (outlined, quiet: garment lists). **Chips:** `.chip` for filters and choices; selected state via `aria-pressed`/`aria-checked`/`aria-selected`/`data-on="true"`. 44px tall.
- **Rules:** `.hairline` / `.hairline-b` (1px, adapts); `.stitch-rule` / `.stitch-rule-v` (running stitch). Add `.draw-in` to sew a rule in on scroll.
- **Fields:** `.field-label` + `.field` (+ `select.field`, `textarea.field`), underline only, 16px+ text (no iOS zoom), `aria-invalid="true"` + `.field-error`.
- **Numbers:** `.num` for tabular figures in tables and prices.

## 6. Imagery

The photo editor will add files to `public/photos/` and a manifest at `src/lib/photos.ts` (src, alt, width, height, focal point, treatment). Build every image slot against that manifest, with `next/image`, real `sizes`, `object-position` from the focal point, and the current SVG art as fallback until a photo exists.

- **Subjects:** real members in real places: a run club at 6am, a chapter on the quad steps, a team on an office rooftop, a fundraiser crowd. Groups of 3–8, mid-laugh, arms over shoulders: *belonging*. Details at macro: chenille texture, satin-stitch embroidery, a woven label, a rib cuff. Product: flat-lay or folded stacks on cream linen, shot top-down. No models isolated on white, no stock handshakes.
- **Each photo asset is used once site-wide.** Exception: a collection's photos may appear both on its wall tile and on its own page.
- **Frames:** use only `RATIO` from `src/lib/design.ts`: portrait 4:5 (people), tall 2:3 (hero, editorial), square (details), landscape 3:2 (places), cinema 21:9 (wide editorial plates, desktop only; fall back to 4:5 on mobile). Crop tight: cut people at the shoulder or knee, never at joints; details fill the frame edge to edge.
- **Treatment:** wrap in `.photo` plus one of: `.grade` (default: warm, slightly desaturated, lifted, film-like), `.duo` (green shadows/cream highlights) or `.duo-dusty`. Add `.grain` to all of them. Duo is for "at rest" (wall tiles, roster hover thumbs, anything with type over it); full grade is for "in focus". Hovering a duo tile can release it to `.grade`: that is the wall's core interaction.
- **Type and photos:** a headline may overlap a photo edge by up to one line; a woven label may sit across the edge. Type on a photo only with `.duo` or `.scrim`. Captions go under the image in `.caption`, never on it.
- **Motion:** `.wipe-in` (uncovers bottom-up as it enters) or `.drift-in` (in-frame parallax, 14%). One per image, not both.

## 7. Motion

Things are sewn, not animated: a pull, then a soft stop.

- Easing: `ease-out` (arrivals), `ease-inout` (two-way state), `ease-stitch` (draws, wipes, underlines). Durations: `quick` 180ms (hover/press), `base` 420ms (state), `slow` 900ms (entrances). JS constants in `src/lib/design.ts` (`EASE`, `DUR`, `STAGGER` = 80ms).
- Entrances play once. Headline lines rise 0.4em with an 80ms stagger (`.enter` with `--d`, or the existing `.clip` mask). Below-the-fold blocks use `<Reveal>`. Photos `.wipe-in`, stitch rules `.draw-in` (CSS scroll timelines; static elsewhere).
- No header scroll-progress stitch (removed from the vocabulary). No scroll-jacking, no smooth-scroll libraries, no cursor followers except the roster thumbnail, no infinite motion except one marquee (if any) at ≥48s. Keep the existing `.slap` and hang-tag drop to the chapter.
- `prefers-reduced-motion: reduce`: everything renders in its final state, no transforms; already handled for every foundation class. Test it.

## 8. Page direction

The site runs on the shared Stitched sister-site framework (the same page structure, components and UX as The Mitzvah Studio), dressed in this brand. Layouts below describe that framework as Member Threads renders it.

**Header.** 72/84/92px, paper, hairline-b after 8px of scroll. Logo left (`Wordmark`, 44/52/56px tall). Three links centred from md (How it works `/#how`, Catalog `/catalog`, Get inspired `/work`) in the varsity (Big Shoulders Text 800, 16px caps); hover sews an underline in, the active page keeps a running stitch. Right: `.btn-blue .btn-sm` "Start a collection". Mobile menu: full-screen paper sheet, the three pages in `.t-h1` serif numbered with `.t-spec` 01–03, stitch rules between, the primary, the email and a `.woven-beige` "Est. 2023 · A Stitched Group company"; the lettermark watermarks the corner in cream.

**Home: Hero.** Picture right. Left: the page's `.t-display` in two lines, "Apparel your members / *actually* want to wear." (no script in the hero), `.t-lead`, the primary + a `.link-arrow`, then the promises in `.t-spec` joined by short stitch segments. Right: two portrait photos (`.photo grade grain`), the second dropped 12%, on a square beige plate; the `RosterLabel` woven "No. 036 · Harbor Run Club" (it takes the typed name) crosses the plate's lower-left corner. Below lg everything centres and stacks. A stitched divider, "Sewn in, not printed on", sits just below the fold.

**Home: Chapter (the hoodie).** On paper over `.board-grid`. Centred `.t-eyebrow`, `.t-h1` "Not a *blank*.", `.t-lead`, a `.t-small` hint. Desktop: one board: the house hoodie on a cream drawing sheet (linen, crop marks), eight numbered square `.chip`s either side with 1px dashed leaders, the name field and colorway swatches on the sheet under the garment, the woven sheet label "No. 036 · {name}" across the sheet's bottom edge, and the tech pack (`.lift`) on the board's lower right from xl (under the board below xl). Phone: the sheet with numbered pins, name and swatches, chips 2-up, the tech pack. Script lives here: the name on the hoodie is the home page's one script moment. Then Act 02: copy cols 1–4, three drawn pieces on square cream/beige plates carrying the name (phones swipe). Then the finale: one square `.band-green` panel (the page's one dark band), "*Your* name. / *Your* colors. / *Your* collection." in serif (the typed name replaces "Your"), a stitch, the lead, `.btn-white` + link, a `.woven-beige` "No. 036" in the corner.

**Home: Intro.** Eyebrow + `.t-h1` "Not merch. *A collection.*" left, `.t-lead` right; three square plates (cream, oat, sand) each with a `.woven-green` "No. 0X", `.t-h3`, `.t-body`; a centred `.t-h2` closing line.

**Home: How it works.** Sticky left column: eyebrow, `.t-h1` "Four steps. *One* collection.", lead, the primary. Right: four rows divided by stitch rules: `.t-block` beige-deep numeral, two-line `.t-h3`, `.t-body`.

**Home: FAQ.** The seam-unpicking interaction (it is the concept), on paper, no panel. Eyebrow + `.t-h1` "Questions, *answered.*" on top, the six questions full width, the email under them.

**Catalog (/catalog).** "Build your *collection*." (`.t-h1`) + lead. One `Dropdown` filter (square chip, hairline menu, title-case group labels with counts) and a `.t-spec` count. A grid of every piece the dashboard publishes to this site (`CollectionBuilder`), on square plates tinted by kind from the board (cream, oat, sand, sage, mist), each with a `.t-spec` style number MT-01…, a serif name and a square + chip. Picked pieces gather in a green tray at the bottom that carries their names to `/quote?piece=…`. A photo that fails to load falls back to its drawing. Then a cream plate: "Need a piece that isn't *here?*" → /custom.

**Product page (/catalog/[slug]).** Breadcrumb link. Left (sticky): a square cream stage (photo or drawing) with thumbnails (photos, or colorways as drawings). Right: `.t-eyebrow` category, `.t-h1` name, `.t-spec` price line, `.t-lead` first paragraph, round colour swatches, the primary. Under it two cream plates (the details as hairline rows; the price estimator), a size-chart disclosure, and "Goes *with it*." with three `ProductCard`s.

**Get inspired (/work).** "Get *inspired*." + lead; two `Dropdown`s (All Organizations, All Pieces), Clear, a count. A mixed-size wall of square tiles (`work/Catalog.tsx`), each a concept drawn in code (`work/art.tsx`) for a made-up organization in `src/lib/inspo.ts`, captioned "{Organization} · {Piece}" in `.t-spec`; "Show more designs". Real mockups go in `UPLOADS` (empty until there are approved ones). Ends on a cream plate (`Ending.tsx`): "The {name} collection." with the name typed into the headline in serif italic on a stitched underline, "starts here.", the primary.

**About.** `.t-display` "Started for the clubs we were *in*.", the intro and the first line of the story, `founder.jpg` (4:5, grade) with a caption. "What you *get*." as four cream plates with woven numbers (`#what-you-get`), the Stitched Group note (`#stitched`), the primary and the email.

**Custom.** `.t-display` "Describe the *piece*." + "We'll develop it." + one paragraph; four cream plates (fabric, fit, construction, trims & labels) with woven numbers; what we make and how we finish it as `.tag`s; the primary.

**Quote.** `QuoteTitle` (`.t-display`, personalised), one italic line, one sentence; the "For {name}" woven label and the email; a cream "You picked" plate when pieces arrive from the catalog; then the request form, an embedded Stitched app iframe (`RequestForm.tsx`; the remote sets `frame-ancestors`, so it is blank on localhost) in a cream plate with a `.t-spec` header line and a plain-link fallback. Success state: `.band-green` with the script sign-off "Welcome to the club." (the page's script moment).

**404.** `.t-mast` "404" cropped by the viewport edge, `.t-h1` "Not on the roster.", links to catalog and home.

**Footer.** Paper under a top rule: the wordmark and the email, two link columns (Explore, Company) with `.t-eyebrow` heads, the legal line in `.t-spec` with a `.woven-beige` "Est. 2023 · A Stitched Group company". Then `.t-mast` "THREADS" in green, full width, cropped ~18% by the bottom edge: the site's one heavy varsity moment.

## 9. Quality checklist (critics grade against this)

1. One idea visible within five seconds: label, stitch, roster. Every page shows at least two of the three.
2. Exactly one `.t-display` per page; serif sentence-case headlines; block caps only for numerals, names, mast.
3. Script appears at most once per page, only where it would be embroidered or signed.
4. No rounded cards, no pills, no drop shadows on UI; square everything except swatches.
5. Colour shares roughly match §3; one dark band per page plus footer; no beige body text on light.
6. Body text ≥16px, ≤62ch, contrast ≥4.5:1; metadata ≥12px.
7. Asymmetric compositions on the 12-column grid; at least one element per page breaks the frame (bleed, overlap, crop).
8. Section spacing uses only `.sec-sm/.sec/.sec-lg`.
9. Every photo slot uses the manifest, a `RATIO`, a treatment and `.grain`, with real alt text; it degrades to the current art gracefully.
10. Motion: entrances once, ≤900ms, stitch/ease-out; hovers 180ms; everything correct under reduced motion.
11. Mobile (390px) is designed, not stacked: no horizontal scroll, 44px targets, headline sizes from the scale.
12. Every interactive element has a visible `:focus-visible` state and a hover that isn't just opacity.
13. No console errors, no hydration mismatches, no layout shift from fonts or images.
14. Copy reads as a clubhouse, not a SaaS: no exclamation marks, no "unlock", no emoji.
