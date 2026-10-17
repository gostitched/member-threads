/**
 * "Not a blank": the chapter under the homepage hero.
 *
 * Two acts and a close. 01 puts the house hoodie on the development table with
 * the visitor's organization on the chest, and lets them build it detail by
 * detail while the tech pack prints. 02 shows the design team turning a loose
 * brief into a whole collection. The close is a cream band: name, colors,
 * collection. Copy, callouts, the slip and every swappable asset live here so
 * the components only lay things out.
 *
 * Rules from the business, not taste:
 *  - Sell the collection, never the shirt: no per-piece prices on this table.
 *  - Name the craft (400 GSM fleece, chenille, embroidery, puff print, 2×2 rib).
 *  - Customization never costs extra; design help is included.
 *  - Harbor Run Club is a sample organization; nothing here claims a real client.
 */

import { possessive } from './name';
import { VIBES, type VibeId } from './vibe';

/**
 * Fill `{name}` / `{name’s}` tokens with the organization's name (from `useOrgName`).
 * With no name typed (`you`), the copy speaks to the visitor instead:
 * `{name’s}` → "your", `{name}` → "Your organization", capitalised at the start.
 * @example named('{name’s} hoodie', 'Harbor Run Club') // 'Harbor Run Club’s hoodie'
 * @example named('Start {name’s} collection', 'Harbor Run Club', true) // 'Start your collection'
 */
export const named = (s: string, name: string, you = false) => {
  const out = s
    .split('{name’s}').join(you ? 'your' : possessive(name).replace("'", '’'))
    .split('{name}').join(you ? 'Your organization' : name);
  return you && out.startsWith('your') ? `Y${out.slice(1)}` : out;
};

/**
 * The chest wordmark, split the way a collegiate lockup is: the top line set on
 * an arch, the rest set straight and smaller underneath. Multi-word names are
 * split where the two lines come out most even; short names stay on one arch.
 * @example lockup('Harbor Run Club') // ['HARBOR', 'RUN CLUB']
 * @example lockup('Northfield Business Society') // ['NORTHFIELD', 'BUSINESS SOCIETY']
 */
export function lockup(name: string): [string, string] {
  const up = name.trim().toUpperCase();
  const words = up.split(/\s+/);
  if (words.length < 2 || up.length <= 10) return [up, ''];
  let best: [string, string] = [words[0], words.slice(1).join(' ')];
  for (let i = 1; i < words.length; i++) {
    const a = words.slice(0, i).join(' ');
    const b = words.slice(i).join(' ');
    if (Math.max(a.length, b.length) < Math.max(best[0].length, best[1].length)) best = [a, b];
  }
  return best;
}

/** The initial on the chenille patch. */
export const initial = (name: string) => (name.trim().match(/\p{L}|\p{N}/u)?.[0] ?? 'M').toUpperCase();

// ── Act 01 ────────────────────────────────────────────────────────────────────

export const ACT1 = {
  eyebrow: 'The house hoodie · 400 GSM',
  /** Sentence case; the bracketed word is set in the serif italic. */
  title: ['Not a ', 'blank', '.'] as const,
  /** The lead: what the hoodie is for. */
  lead: 'Promo merch starts with a blank and a logo. We start with the garment: better fabric, a better cut, and every detail decided by you.',
  /** The small line under it: how to play with the hoodie, and the price of a detail. */
  hint: 'Type your organization’s name, pick a colorway, then add details. Each one is +$0.',
  /** The chip that lands beside a detail as it goes on. */
  added: '+$0',
  /** The name field. */
  namePlaceholder: 'Your organization',
  nameLabel: 'Organization name',
  /** Colorway dots (synced with the hero's colorway). */
  colorways: 'Colorway',
  /** Beside the dots: the five are examples, not the menu. */
  anyColor: 'Any color',
  details: 'Details',
  reset: 'Start over',
  /** The drawing sheet's title block. */
  sheet: 'Front · House hoodie',
};

/**
 * The details a visitor can add to the hoodie. The cut is fixed as the house
 * piece: oversized, boxy, 400 GSM fleece. It starts in the site's colorway
 * with the organization's wordmark on the chest (tonal rib, self-lined hood, no
 * cords). Every accent comes from the colorway, so no combination can clash.
 */
export type Custom =
  | 'color' | 'rib' | 'liner'
  | 'embroidery' | 'print' | 'patch' | 'trims' | 'construction';

export type Callout = {
  id: Custom;
  word: string;
  /** What pressing it does, before it's done. */
  add: string;
  /** The slip line it prints. `{color}`, `{liner}` and `{initial}` are filled in. */
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
 * The eight details on the homepage toy. Left side top to bottom, then right.
 * The hood liner takes a second press: solid jersey, then a rugby stripe.
 */
export const CALLOUTS: Callout[] = [
  { id: 'construction', word: 'Contrast stitch', add: 'Every seam', line: 'Contrast topstitch, {accent}', at: [478, 812], side: 'left', rides: 'side' },
  { id: 'patch', word: 'Chenille patch', add: 'On the sleeve', line: 'Chenille “{initial}” patch, sleeve', at: [330, 1090], side: 'left', pin: [440, 1190], rides: 'side' },
  { id: 'color', word: 'Colorway', add: 'Tap to change', line: 'Body / {color} fleece', at: [330, 1250], side: 'left', pin: [760, 1240], rides: 'side' },
  { id: 'rib', word: 'Contrast rib', add: 'Hem and cuffs', line: '2×2 rib, {liner}, hem + cuffs', at: [300, 1690], side: 'left', pin: [660, 1690], rides: 'side' },
  { id: 'liner', word: 'Hood liner', add: 'Inside the hood', line: '{liner} jersey hood liner', at: [1120, 300], side: 'right', pin: [1100, 280] },
  { id: 'trims', word: 'Cords + aglets', add: 'Flat cord, metal tips', line: 'Flat drawcord, metal aglets', at: [1034, 740], side: 'right', pin: [1034, 700] },
  { id: 'embroidery', word: 'Wordmark', add: 'Script, embroidered', line: '“{name}” script, embroidered, chest', at: [1250, 930], side: 'right', pin: [1240, 900] },
  { id: 'print', word: 'Puff print', add: 'On the pocket', line: '“Season 01” puff print, pocket', at: [1010, 1500], side: 'right', pin: [1160, 1410] },
];

// ── The garment ──────────────────────────────────────────────────────────────

/**
 * The five colorways, one per site colorway (`@/lib/vibe`), in the same order
 * and ids, so picking one here sets the site's colorway and vice versa. Every
 * colour comes from the vibe: body = garment, rib + liner = rib, wordmark,
 * cords, stitch and patch felt = accent.
 */
type Patch = { felt: string; letter: string; outline: string };

export type Colorway = {
  id: VibeId;
  name: string;
  body: string;
  accent: string;
  accentName: string;
  /** Hem band and cuffs once the rib step is on. */
  rib: string;
  edge: string;
  /** The hood liner, and the chenille letter. */
  liner: string;
  linerName: string;
  /** Outline colour: brand green on light bodies, a deeper shade of the body on dark ones. */
  line: string;
  /** Preview marks on the garment: dusty blue on light bodies, cream on dark ones. */
  mark: string;
  /** The sleeve patch: felt ground, chenille letter, the felt cut around the letter. */
  patch: Patch;
  heather?: boolean;
};

/** Brand colours by name, for slip lines. */
const NAMES: Record<string, string> = {
  '#133327': 'Forest', '#EEE6D9': 'Cream', '#C4B19A': 'Sand', '#223041': 'Navy', '#A8A9A4': 'Heather',
};
const nameOf = (hex: string) => NAMES[hex.toUpperCase()] ?? NAMES[hex] ?? 'Contrast';

/** Outline, preview-mark and sleeve-patch colours per colorway. */
const CW: Record<VibeId, { line: string; mark: string; patch: Patch }> = {
  club: { line: '#133327', mark: '#223041', patch: { felt: '#133327', letter: '#EEE6D9', outline: '#C4B19A' } },
  racing: { line: '#121B26', mark: '#EEE6D9', patch: { felt: '#EEE6D9', letter: '#223041', outline: '#C4B19A' } },
  miami: { line: '#0A1D16', mark: '#EEE6D9', patch: { felt: '#EEE6D9', letter: '#133327', outline: '#C4B19A' } },
  ballet: { line: '#133327', mark: '#223041', patch: { felt: '#133327', letter: '#EEE6D9', outline: '#C4B19A' } },
  varsity: { line: '#133327', mark: '#223041', patch: { felt: '#223041', letter: '#EEE6D9', outline: '#C4B19A' } },
};

export const COLORWAYS: Colorway[] = VIBES.map((v) => ({
  id: v.id,
  name: v.label,
  body: v.garment,
  accent: v.accent,
  accentName: nameOf(v.accent),
  rib: v.rib,
  edge: v.garment,
  liner: v.rib,
  linerName: nameOf(v.rib),
  heather: v.id === 'varsity',
  ...CW[v.id],
}));

/** The undyed blank (only used if a look starts with `colorSet: false`). */
export const UNDYED = { name: 'Undyed', body: '#EEE6D9' };

/** Index into COLORWAYS for a colorway id. */
export const colorwayIndex = (id: VibeId) => Math.max(0, COLORWAYS.findIndex((c) => c.id === id));

/** What the garment is. `color` indexes COLORWAYS; the rest are on or off. */
export type Look = Record<Exclude<Custom, 'color'>, boolean> & {
  color: number;
  colorSet: boolean;
  /** The liner's second step: a rugby stripe. Only counts while `liner` is on. */
  linerStripe: boolean;
};

/** The hood liner callout, once on: what the next press does, and the slip line with the stripe. */
export const LINER_STRIPE = { next: 'Tap again for a stripe', on: 'Stripe · +$0', line: '{liner} rugby-stripe hood liner' };

/** Where the toy starts: dyed in the site's colorway, with the wordmark already on. */
export const BLANK: Look = {
  color: 0, colorSet: true, rib: false, liner: false, linerStripe: false,
  embroidery: true, print: false, patch: false, trims: false, construction: false,
};

/** Every step taken: the hoodie the section is building toward. */
export const BUILT: Look = {
  color: 0, colorSet: true, rib: true, liner: true, linerStripe: true,
  embroidery: true, print: true, patch: true, trims: true, construction: true,
};

export const isOn = (look: Look, id: Custom) => (id === 'color' ? look.colorSet : look[id]);

// ── The slip ─────────────────────────────────────────────────────────────────

/**
 * The tech pack: one line per detail, in the order they were chosen. No
 * per-piece prices: the hoodie is priced inside the collection.
 * Style numbers are illustrative. [CONFIRM] house style numbering.
 */
export const SLIP = {
  brand: 'Member Threads',
  kicker: 'Tech pack',
  title: '{name}',
  no: 'MT-HD01',
  specs: [
    ['Body', '400 GSM fleece'],
    ['Fit', 'Oversized, boxy'],
    ['Colorway', '{color}'],
    ['Minimum', '36 pcs'],
  ] as const,
  label: 'Neck label',
  item: 'Detail',
  upcharge: 'Upcharge',
  included: '+$0',
  empty: 'Tap a detail to add it',
  totalLabel: 'Total upcharge',
  total: '$0',
  note: 'Design help included. One clear price, no customization fees.',
  code: 'MT-HD01 · Season 01',
};

// ── Act 02 ────────────────────────────────────────────────────────────────────

/** Brand colours for the drawn pieces. */
const C = { green: '#133327', cream: '#EEE6D9', beige: '#C4B19A', dusty: '#223041', paper: '#F7F3EC' } as const;

/**
 * One piece in the example collection: a drawn garment (`@/components/work/art`)
 * on a plate, with the organization's name set on it live.
 */
export type Piece = {
  kind: 'quarterzip' | 'polo' | 'crewneck' | 'cap';
  label: string;
  spec: string;
  /** Plate behind the piece (a theme colour class). */
  plate: 'cream' | 'beige' | 'dusty' | 'green';
  color: string;
  trim?: string;
  /** How the name goes on. */
  deco: 'script' | 'crest' | 'block' | 'varsity';
  place: 'chest' | 'left';
  ink: string;
  ink2?: string;
};

export const ACT3 = {
  eyebrow: 'Design help, included',
  /** One headline; the middle string is set in the serif italic. */
  ask: ['Don’t know what you want yet? We design the ', 'whole', ' collection.'] as const,
  body: 'Send a logo, a color, a reference, or nothing at all. Our designers build it into a cohesive set of pieces and revise until it’s right. Design help is included.',
  /** An example collection on /work (slug provided by the Work page). */
  link: { label: 'See the Eastline Run Club collection', href: '/work/eastline-run-club' },
  collection: {
    pieces: [
      { kind: 'quarterzip', label: 'Quarter-zip', spec: 'Brushed fleece · Forest', plate: 'cream', color: C.green, trim: C.green,
        deco: 'block', place: 'left', ink: C.cream },
      { kind: 'polo', label: 'Polo', spec: 'Piqué · Cream', plate: 'beige', color: C.cream, trim: C.green,
        deco: 'crest', place: 'left', ink: C.green, ink2: C.cream },
      { kind: 'cap', label: 'Six-panel cap', spec: 'Washed twill · Navy', plate: 'cream', color: C.dusty, trim: C.dusty,
        deco: 'block', place: 'chest', ink: C.cream },
    ] satisfies Piece[],
  },
} as const;

// ── The close ─────────────────────────────────────────────────────────────────

export const FINALE = {
  /** Three lines; the last word of the last line is set in the serif italic. */
  lines: ['Your name.', 'Your colors.', 'Your collection.'] as const,
  /** The hang tag: who it's made for, then the house facts. */
  madeFor: 'Made for',
  tag: { style: 'The house hoodie', min: 'From 36 pieces' },
  body: 'Start from the catalog, make every detail yours, and get one clear price. From 36 pieces per style.',
  primary: { label: 'Start a collection', href: '/quote' },
  secondary: { label: 'Browse the catalog', href: '/catalog' },
};
