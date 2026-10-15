/**
 * "We actually make the clothes": the chapter under the homepage hero.
 *
 * Two acts. 01 puts Sophie's guest hoodie on the development table and lets the
 * visitor build it, detail by detail, while her tech pack grows. 02 shows the
 * design team turning a parent's rough note into a whole collection. Copy,
 * callouts, the slip and every swappable asset live here so the components only
 * lay things out.
 *
 * Rules from the business, not taste:
 *  - Sell the collection, never the shirt: no per-piece prices on this table.
 *  - Name the craft (420 GSM, chenille, satin script, puff print, woven label).
 *  - Sophie is a concept collection; nothing here claims a real client.
 */

import { possessive } from './name';
import { VIBES, type VibeId } from './vibe';

/**
 * Fill `{name}` / `{name’s}` tokens with the kid's name (from `useOrgName`).
 * With no name typed (`you`), the copy speaks to the visitor instead:
 * `{name’s}` → "your", `{name}` → "Your name", capitalised at the start.
 * @example named('{name’s} hoodie', 'James') // 'James’ hoodie'
 * @example named('Start {name’s} collection', 'Sophie', true) // 'Start your collection'
 */
export const named = (s: string, name: string, you = false) => {
  const out = s
    .split('{name’s}').join(you ? 'your' : possessive(name).replace("'", '’'))
    .split('{name}').join(you ? 'Your name' : name);
  return you && out.startsWith('your') ? `Y${out.slice(1)}` : out;
};

// ── Act 01 ────────────────────────────────────────────────────────────────────

export const ACT1 = {
  title: 'Not a blank.',
  /** The body, with the emphasised claim split out. */
  body: { lead: 'We ', mark: 'literally manufacture', rest: ' every piece from scratch. Better fabric, better fit, and every detail is your call.' },
  /** The small line under it: how to play with the hoodie, and the price of a detail. */
  hint: 'Tap a detail to add it to {name’s} hoodie. Each one is +$0.',
  /** The chip that lands beside a detail as it goes on. */
  added: '+$0',
  /** Colorway dots under the garment (synced with the hero's colorway). */
  colorways: 'Colorway',
  /** Beside the dots: the five are examples, not the menu. */
  anyColor: 'Any color',
  /** Kept for the dormant tech-pack slip. */
  reset: 'Start over',
};

/**
 * The eight details a visitor can add to Sophie's hoodie. The cut is fixed as
 * the house piece: oversized, boxy, 420 GSM fleece. It starts as a plain cream
 * blank (tonal rib, self-lined hood, no cords, no decoration) and every step is
 * physically obvious. Every combination has been art-directed: accents come from
 * the colourway, so nothing can clash.
 */
export type Custom =
  | 'color' | 'rib' | 'liner'
  | 'embroidery' | 'print' | 'patch' | 'trims' | 'construction';

export type Callout = {
  id: Custom;
  word: string;
  /** What pressing it does, before it's done. */
  add: string;
  /** The slip line it prints. `{color}` is filled in. */
  line: string;
  /** Where the leader lands, in drawing units (see `@/components/chapter/geometry`). */
  at: [number, number];
  side: 'left' | 'right';
  /** Where the numbered pin goes on a phone, when `at` would cover the detail. */
  pin?: [number, number];
  /**
   * What the anchor rides with in the house cut: `side` moves out with the
   * side seams and sleeves, `hem` moves with the body length.
   */
  rides?: 'side' | 'hem';
};

/**
 * The seven details on the homepage toy. Left side top to bottom, then right.
 * (Flat cords were cut; `trims` stays in the type so old looks still draw.)
 * The hood liner takes a second press: solid jersey, then printed with stars.
 */
export const CALLOUTS: Callout[] = [
  { id: 'construction', word: 'Contrast stitch', add: 'Every seam', line: 'Contrast topstitching', at: [478, 812], side: 'left', rides: 'side' },
  { id: 'patch', word: 'Chenille patch', add: 'On the sleeve', line: 'Chenille S patch, sleeve', at: [330, 1090], side: 'left', pin: [440, 1190], rides: 'side' },
  { id: 'color', word: 'Color', add: 'Tap to change', line: 'Body / {color}', at: [330, 1250], side: 'left', rides: 'side' },
  { id: 'rib', word: 'Contrast rib', add: 'Hem and cuffs', line: 'Contrast 2×2 rib', at: [300, 1690], side: 'left', rides: 'side' },
  { id: 'liner', word: 'Hood liner', add: 'Inside the hood', line: '{liner} jersey hood liner', at: [1120, 300], side: 'right', pin: [1100, 280] },
  { id: 'embroidery', word: '“{name}”', add: 'Satin script', line: '“{name}” satin script', at: [1300, 885], side: 'right', pin: [1320, 710] },
  { id: 'print', word: 'Puff print', add: 'The date, on the pocket', line: '05.16.26 puff print, pocket', at: [1010, 1500], side: 'right', pin: [1160, 1410] },
];

// ── The garment ──────────────────────────────────────────────────────────────

/**
 * The five colorways, one per site colorway (`@/lib/vibe`), in the same order
 * and ids, so picking one here sets the site's colorway and vice versa. Every
 * colour comes from the vibe, so a palette change in vibe.ts flows straight
 * through: body = garment, rib = rib, script/cords/patch felt = accent.
 */
export type Colorway = {
  id: VibeId;
  name: string;
  body: string;
  accent: string;
  /** Hem band and cuffs once the rib step is on. */
  rib: string;
  edge: string;
  /** The hood liner, and the chenille letter. */
  liner: string;
  linerName: string;
  /** Outline colour. Only the navy body gets a blue outline; the rest are drawn in navy. */
  line?: string;
  heather?: boolean;
};

/**
 * Per-colorway garment colours (WHITE §1). Body and accent mirror the vibe. The
 * contrast rib and hood liner are picked here, not taken from the vibe, so the
 * rib always sits opposite the body (dark on light, light on dark) and stays
 * in the same palette as the script and patch.
 */
const NAVY = '#0E1A47';
const CREAM = '#F5EEDC';
const CW: Record<VibeId, { rib: string; ribName: string; line?: string }> = {
  club: { rib: NAVY, ribName: 'Navy' },
  racing: { rib: CREAM, ribName: 'Cream', line: '#2B5BD7' },
  miami: { rib: NAVY, ribName: 'Navy' },
  ballet: { rib: NAVY, ribName: 'Navy' },
  varsity: { rib: NAVY, ribName: 'Navy' },
};

export const COLORWAYS: Colorway[] = VIBES.map((v) => {
  const { rib, ribName, line } = CW[v.id];
  return { id: v.id, name: v.label, body: v.garment, accent: v.accent, rib, edge: v.garment, liner: rib, linerName: ribName, line };
});

/** The undyed blank (only used if a look starts with `colorSet: false`). */
export const UNDYED = { name: 'Undyed', body: VIBES[0].garment };

/** Index into COLORWAYS for a colorway id. */
export const colorwayIndex = (id: VibeId) => Math.max(0, COLORWAYS.findIndex((c) => c.id === id));

/** What the garment is. `color` indexes COLORWAYS; the rest are on or off. */
export type Look = Record<Exclude<Custom, 'color'>, boolean> & {
  color: number;
  colorSet: boolean;
  /** The liner's second step: printed with stars. Only counts while `liner` is on. */
  linerStars: boolean;
};

/** The hood liner callout, once on: what the next press does, and the slip line with stars. */
export const LINER_STARS = { next: 'Tap again for stars', on: 'Stars · +$0', line: '{liner} star-print hood liner' };

/** Where the toy starts: dyed in the site's colorway, with the name already on. */
export const BLANK: Look = {
  color: 0, colorSet: true, rib: false, liner: false, linerStars: false,
  embroidery: true, print: false, patch: false, trims: false, construction: false,
};

/** Every step taken: the hoodie the section is building toward. */
export const BUILT: Look = {
  color: 0, colorSet: true, rib: true, liner: true, linerStars: true,
  embroidery: true, print: true, patch: true, trims: false, construction: true,
};

export const isOn = (look: Look, id: Custom) => (id === 'color' ? look.colorSet : look[id]);

// ── The slip ─────────────────────────────────────────────────────────────────

/**
 * Sophie's tech pack: one line per detail, in the order she chose them. No
 * per-piece prices: the hoodie is priced inside the collection.
 */
export const SLIP = {
  brand: 'Member Threads',
  title: '{name’s} hoodie / tech pack',
  no: 'Style MT-H01',
  qty: '420 GSM',
  item: 'Item',
  upcharge: 'Upcharge',
  included: '+$0',
  totalLabel: 'Total upcharge',
  total: '$0',
  note: 'Every upgrade, design and development included',
  code: 'MT 0516 2026',
};

// ── Act 02 ────────────────────────────────────────────────────────────────────

export const ACT3 = {
  ask: 'Don’t know what you want?',
  script: 'We design the whole collection.',
  body: 'Send us a screenshot, a color, a vibe. Our designers turn it into every piece, with revisions until it’s right. Design is free.',
  collection: {
    href: '/work?project=sophie',
    pieces: [
      { src: '/chapter/sophie-piece-sweatset.webp', width: 1500, height: 2000, label: 'Sweatset', plate: 'blue',
        alt: 'A matching sweatset: a pale-blue hoodie with navy sleeves, hood and pocket over matching pale-blue sweatpants' },
      { src: '/chapter/sophie-piece-jersey.webp', width: 1500, height: 2000, label: 'Jersey', plate: 'pink',
        alt: 'A navy football jersey with cream sleeves, JACK and the number 13 across the front' },
      { src: '/chapter/sophie-piece-hat.webp', width: 1450, height: 1900, label: 'Hat', plate: 'cream',
        alt: 'A cream cap with a pink-and-cream striped brim and a pink MS patch on the front' },
    ],
  },
} as const;

export const FINALE = {
  /** Three lines; the possessive is the typed name. */
  lines: ['{name’s} name.', '{name’s} colors.', '{name’s} collection.'],
  script: 'We know how to make it.',
  primary: { label: 'Start {name’s} collection', href: '/quote' },
};
