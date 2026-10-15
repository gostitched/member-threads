import { SEGMENTS } from './site';

/**
 * Collections.
 *
 * Every entry here is a CONCEPT COLLECTION: a worked example of what Member Threads
 * designs for one kind of organization. None of them is a real client, and each says
 * so in its `sector` ("Concept collection · …"). Names are invented on purpose. Swap a
 * concept out for a real collection, with the organization's permission, as they arrive.
 *
 * Slugs are a contract with the rest of the site: `ashford-business-society`,
 * `halden-works`, `riverbend-5k`, `eastline-run-club`, `holloway-club`
 * (link to one as `/work?project=<slug>` to open it on the wall, or `/work/<slug>`).
 *
 * ── Assets ───────────────────────────────────────────────────────────────────
 * Every picture on the Collections wall is an asset that belongs to one collection.
 * The wall scatters a collection's assets through the collage, and hovering any one
 * of them pulls the rest of its collection forward, so each wants several:
 *
 *   photo     the collection laid out flat, on a coloured ground. Cropped to fit.
 *   garment   one piece, cut out on a transparent background. Never cropped.
 *   detail    a macro of the decoration: tackle twill, satin stitch, a print.
 *   artifact  something small from the collection: a woven label, a hang-tag.
 *
 * An asset shows its photograph (`src`, under /public) when it has one and falls back
 * to its drawn version (`art`) until then. To publish a real photo, add `src` with its
 * pixel `width` and `height` and, for crops, a `focal` point.
 */

// ── the drawings ─────────────────────────────────────────────────────────────

export type DrawnKind =
  | 'tee' | 'longsleeve' | 'hoodie' | 'ziphoodie' | 'crewneck' | 'quarterzip' | 'polo'
  | 'jacket' | 'cap' | 'shorts' | 'pants' | 'tote' | 'tank';

/** Decoration on a drawn piece. */
export type Deco =
  | {
      t: 'type';
      lines: string[];
      /** block: heavy sans. varsity: heavy collegiate caps with an outline. script: the brand script. chenille: felt-backed pile. */
      face: 'block' | 'varsity' | 'script' | 'chenille';
      tech: 'embroidery' | 'print' | 'puff' | 'twill';
      ink: string;
      /** Second colour: the outline on varsity, the felt on chenille and twill, the last line on a block print. */
      ink2?: string;
      /** Set the first line on an arch. */
      arch?: boolean;
    }
  /** A woven patch: a framed rectangle with a stitched edge. */
  | { t: 'patch'; lines: string[]; ground: string; ink: string }
  /** A club crest: a shield with a monogram and, at size, a word over it. */
  | { t: 'crest'; letter: string; ground: string; ink: string; words?: string };

/** An all-over pattern in the cloth. */
export type Pattern = { t: 'check' | 'stripe'; ink: string; ink2?: string };

export type Drawn = {
  kind: DrawnKind;
  color: string;
  deco?: Deco;
  /** Where the decoration sits: full front, or left chest (left leg on a bottom). */
  place?: 'chest' | 'left';
  /** Contrast rib: cuffs, hem, collar, waistband, a cap's visor, a tote's base and handles. */
  trim?: string;
  /** The inside of the hood. */
  lining?: string;
  /** The rope across a cap's brim. */
  rope?: string;
  pattern?: Pattern;
  /** Stripes: across the chest on a top, down the side seam on a bottom. */
  stripes?: { ink: string; ink2?: string };
};

/** A hang-tag or woven label laid on a flat lay. */
export type Sticker = {
  lines: string[];
  x: number;
  y: number;
  r: number;
  shape?: 'tag' | 'round';
  color?: string;
  ink?: string;
};

export type Art =
  | { t: 'garment'; g: Drawn }
  /** A flat lay on a coloured ground: the stand-in for a lifestyle photograph. */
  | {
      t: 'plate';
      ground: string;
      /** Wide stripes across the ground, in this colour. */
      stripe?: string;
      tall?: boolean;
      items: { g: Drawn; x: number; y: number; s: number; r: number }[];
      stickers?: Sticker[];
    }
  /** A macro of the decoration on its cloth. */
  | { t: 'macro'; cloth: string; deco: Deco; satin?: boolean }
  | { t: 'swatch'; color: string; name: string }
  | { t: 'spool'; color: string }
  | { t: 'patch'; deco: Extract<Deco, { t: 'patch' }> }
  /** A hang-tag on its string. */
  | { t: 'tag'; lines: string[]; color?: string; ink?: string }
  /** A woven neck label. */
  | { t: 'label'; lines: string[]; ground: string; ink: string };

// ── the model ────────────────────────────────────────────────────────────────

export type AssetKind = 'photo' | 'garment' | 'detail' | 'artifact';

export type WorkAsset = {
  id: string;
  kind: AssetKind;
  orientation: 'landscape' | 'portrait' | 'square';
  alt: string;
  /** Photograph under /public. Wins over `art` when present. */
  src?: string;
  width?: number;
  height?: number;
  /** object-position for crops, e.g. '50% 30%'. */
  focal?: string;
  /** Drawn version, shown until `src` exists. */
  art?: Art;
  /** For garments: what it is, so a layout can ask for a cap where a cap looks right. */
  garment?: DrawnKind;
  /** A designer's note the wall may write beside this piece. */
  annotation?: string;
  /** Which of a collection's pieces the wall reaches for first: 1 before 2. Unset is last. */
  priority?: number;
  /**
   * A photograph whose framing matters: the wall only puts it in a slot of its own
   * orientation, so a crop never cuts the point of the picture away.
   */
  keepShape?: boolean;
  /** False keeps a piece off the wall: it appears in the collection page only. */
  wall?: boolean;
};

/** One section of a collection page that is told in pictures. */
export type Chapter = {
  label: string;
  /**
   * How the section is set. Pictures by default; `swatches` lays the palette out as
   * colour cards, and `index` sets its assets as a numbered grid of tiles.
   */
  kind?: 'pictures' | 'swatches' | 'index';
  /** Asset ids, shown in this order. */
  assets: string[];
  /** Captions under a pair (or under each tile of an index), by position. */
  captions?: string[];
};

/** The audience segments in @/lib/site double as the wall's categories. */
export type WorkCategory = (typeof SEGMENTS)[number]['id'];

/** Short labels for the wall's filter row; `title` is the segment's full name. */
const SHORT: Record<WorkCategory, string> = {
  campus: 'University',
  company: 'Companies',
  nonprofit: 'Nonprofits',
  athletic: 'Teams',
  social: 'Associations',
};

export const CATEGORIES: { id: WorkCategory; label: string; title: string }[] = SEGMENTS.map((s) => ({
  id: s.id,
  label: SHORT[s.id],
  title: s.label,
}));

export type WorkItem = {
  id: string;
  slug: string;
  /** Archive number, shown as 001. */
  no: number;
  title: string;
  /** Starts with "Concept collection" while the collection is a concept. */
  sector: string;
  category: WorkCategory;
  /** Where the organization is, when it matters. */
  location?: string;
  /** The look, in a few words ("Collegiate heritage"). */
  vibe?: string;
  method: 'Chenille appliqué' | 'Embroidery' | 'Tackle twill' | 'Puff print' | 'Screen printing';
  /** Pieces in the collection ("438 pc"). */
  qty?: string;
  /** What was in the collection, for the index ("Heavyweight hoodies", "Caps"). */
  made: string[];
  note?: string;
  /** The case study in @/lib/cases. */
  caseId?: string;
  /** The assembled collection: the lead picture, then the supporting strip. Asset ids. */
  cover?: string[];
  /** The collection page told in pictures, section by section. */
  chapters?: Chapter[];
  /** The mini brief in the assembled collection: The ask / The collection. */
  brief?: { label: string; text: string }[];
  /** Piece by piece: what each piece is and how it's made. */
  pieces?: { name: string; details: string[] }[];
  /** The collection's colours. `code` is a colour reference, `use` what it's used for. */
  palette?: { name: string; hex: string; code?: string; use?: string }[];
  /** A line under the colour cards. */
  paletteNote?: string;
  /** Short prose sections on the collection page. */
  story?: {
    label: string;
    body: string[];
    /** Set after the chapter with this label; after the first chapter if unset. */
    after?: string;
    quote?: { text: string; cite: string };
  }[];
  assets: WorkAsset[];
};

const PALETTE_NOTE = 'Concept palette. Every color is matched to Pantone before production.';

// ── Ashford Business Society · university club ───────────────────────────────

const BURGUNDY = '#5B1F2A';
const OATMEAL = '#E6DCCB';
const HEATHER = '#B7B4AE';
const GOLD = '#B8924A';
const NATURAL = '#F3EFE6';

const ashArch: Deco = { t: 'type', lines: ['ASHFORD'], face: 'varsity', tech: 'twill', ink: BURGUNDY, ink2: GOLD, arch: true };
const ashCrest: Deco = { t: 'crest', letter: 'A', ground: BURGUNDY, ink: OATMEAL, words: 'ASHFORD' };
const ashMono = (ink: string): Deco => ({ t: 'type', lines: ['ABS'], face: 'block', tech: 'embroidery', ink });

const hoodieAsh: Drawn = { kind: 'hoodie', color: OATMEAL, deco: ashArch, trim: BURGUNDY, lining: BURGUNDY };
const crewAsh: Drawn = { kind: 'crewneck', color: BURGUNDY, trim: OATMEAL, deco: { ...ashCrest, ground: OATMEAL, ink: BURGUNDY }, place: 'left' };
const qzAsh: Drawn = { kind: 'quarterzip', color: HEATHER, deco: ashMono(BURGUNDY), place: 'left' };
const teeAsh: Drawn = { kind: 'tee', color: NATURAL, deco: { t: 'type', lines: ['ASHFORD'], face: 'block', tech: 'print', ink: BURGUNDY }, place: 'left' };
const capAsh: Drawn = { kind: 'cap', color: BURGUNDY, deco: ashMono(OATMEAL) };

// ── Halden Works · company ───────────────────────────────────────────────────

const CHARCOAL = '#2B2E33';
const STONE = '#CFC7B8';
const BONE = '#EDE7DC';
const EMBER = '#C8562E';

const haldenTonal: Deco = { t: 'type', lines: ['HALDEN'], face: 'block', tech: 'embroidery', ink: '#454A52' };

const hoodieHalden: Drawn = { kind: 'hoodie', color: CHARCOAL, deco: haldenTonal, place: 'left', lining: EMBER };
const qzHalden: Drawn = { kind: 'quarterzip', color: STONE, deco: { ...haldenTonal, ink: CHARCOAL }, place: 'left' };
const teeHalden: Drawn = { kind: 'tee', color: BONE, deco: { t: 'type', lines: ['HALDEN', 'WORKS'], face: 'block', tech: 'print', ink: CHARCOAL, ink2: EMBER } };
const capHalden: Drawn = { kind: 'cap', color: CHARCOAL, deco: { t: 'type', lines: ['HALDEN'], face: 'block', tech: 'embroidery', ink: EMBER } };
const toteHalden: Drawn = { kind: 'tote', color: BONE, trim: CHARCOAL, deco: { t: 'type', lines: ['HALDEN', 'WORKS'], face: 'block', tech: 'print', ink: CHARCOAL } };

// ── Riverbend Literacy Fund · nonprofit ──────────────────────────────────────

const TEAL = '#1F4E52';
const MARIGOLD = '#DDA03A';
const LINEN = '#F0EADD';

const riverTee: Deco = { t: 'type', lines: ['READ THE', 'RIVER', '5K'], face: 'block', tech: 'print', ink: TEAL, ink2: MARIGOLD };
const riverScript: Deco = { t: 'type', lines: ['Riverbend'], face: 'script', tech: 'embroidery', ink: MARIGOLD };
const riverPatch: Deco = { t: 'patch', lines: ['READ THE', 'RIVER'], ground: TEAL, ink: LINEN };

const teeRiver: Drawn = { kind: 'tee', color: LINEN, deco: riverTee };
const crewRiver: Drawn = { kind: 'crewneck', color: TEAL, trim: TEAL, deco: riverScript };
const hoodieRiver: Drawn = { kind: 'hoodie', color: LINEN, trim: TEAL, lining: MARIGOLD, deco: riverPatch };
const capRiver: Drawn = { kind: 'cap', color: TEAL, rope: MARIGOLD, deco: { t: 'type', lines: ['RIVER 5K'], face: 'block', tech: 'embroidery', ink: MARIGOLD } };

// ── Eastline Run Club · teams & fitness ──────────────────────────────────────

const ORANGE = '#E2572B';
const ASPHALT = '#1D1F22';
const CHALK = '#ECE6DA';
const GREY = '#B4B5B1';

const tankEast: Drawn = { kind: 'tank', color: ASPHALT, trim: ORANGE, deco: { t: 'type', lines: ['EASTLINE', 'RC'], face: 'block', tech: 'print', ink: ORANGE } };
const shortEast: Drawn = { kind: 'shorts', color: ASPHALT, trim: ORANGE, deco: { t: 'type', lines: ['ERC'], face: 'block', tech: 'print', ink: ORANGE }, place: 'left' };
const teeEast: Drawn = { kind: 'tee', color: CHALK, deco: { t: 'type', lines: ['EASTLINE', 'RUN CLUB'], face: 'block', tech: 'print', ink: ASPHALT, ink2: ORANGE } };
const crewEast: Drawn = { kind: 'crewneck', color: GREY, trim: ASPHALT, deco: { t: 'type', lines: ['EASTLINE'], face: 'varsity', tech: 'twill', ink: ORANGE, ink2: ASPHALT, arch: true } };
const capEast: Drawn = { kind: 'cap', color: ORANGE, trim: ASPHALT, deco: { t: 'type', lines: ['ERC'], face: 'block', tech: 'embroidery', ink: ASPHALT } };

// ── The Holloway Club · social club ──────────────────────────────────────────

const NAVY = '#1F2A44';
const IVORY = '#F2ECDF';
const CLARET = '#7A2632';
const OXFORD = '#B8C7D6';

const hollCrest = (ground: string, ink: string): Deco => ({ t: 'crest', letter: 'H', ground, ink, words: 'HOLLOWAY' });

const poloHoll: Drawn = { kind: 'polo', color: IVORY, trim: NAVY, deco: hollCrest(NAVY, IVORY), place: 'left' };
const qzHoll: Drawn = { kind: 'quarterzip', color: NAVY, deco: hollCrest(CLARET, IVORY), place: 'left' };
const crewHoll: Drawn = { kind: 'crewneck', color: OXFORD, trim: NAVY, deco: { t: 'type', lines: ['Holloway'], face: 'script', tech: 'embroidery', ink: NAVY } };
const capHoll: Drawn = { kind: 'cap', color: IVORY, trim: NAVY, rope: CLARET, deco: hollCrest(NAVY, IVORY) };

/** Every collection written up, published or not. */
const ARCHIVE: WorkItem[] = [
  {
    id: 'ashford', slug: 'ashford-business-society', no: 1,
    title: 'Ashford Business Society', sector: 'Concept collection · Fall recruitment', category: 'campus',
    vibe: 'Collegiate heritage',
    method: 'Tackle twill', qty: '438 pc',
    made: ['Arched hoodies', 'Crest crewnecks', 'Exec quarter-zips', 'Heavyweight tees', 'Caps'],
    note: 'Burgundy, oatmeal and heather for a business society’s fall recruitment: an arched tackle-twill hoodie, crest crewnecks, a quarter-zip for the exec board, a tee for every new member and caps.',
    caseId: 'ashford',
    brief: [
      {
        label: 'The ask',
        text: 'Recruitment week is the first thing new students see of us. Members should look like they came from the best shelf in the campus store, not a career-fair table. School colors, nothing loud, and one piece just for the exec board.',
      },
      {
        label: 'The collection',
        text: '438 pieces across five styles: an oatmeal hoodie with ASHFORD arched in burgundy tackle twill, a burgundy crewneck with a small crest, a heather quarter-zip reserved for the board, a natural tee for every new member and a six-panel cap.',
      },
    ],
    pieces: [
      { name: 'Hoodie', details: ['120 pieces', 'Heavyweight brushed fleece in oatmeal, burgundy rib and hood lining', 'ASHFORD arched across the chest in burgundy tackle twill with an old-gold edge'] },
      { name: 'Crewneck', details: ['72 pieces', 'Burgundy fleece, oatmeal rib', 'The society crest embroidered on the left chest'] },
      { name: 'Exec quarter-zip', details: ['36 pieces', 'Heather grey', 'ABS embroidered in burgundy on the left chest', 'Made only for the executive board'] },
      { name: 'Recruitment tee', details: ['150 pieces', 'Heavyweight cotton, natural', 'ASHFORD printed small on the left chest in water-based ink'] },
      { name: 'Cap', details: ['60 pieces', 'Burgundy six-panel, unstructured', 'ABS embroidered in oatmeal'] },
    ],
    palette: [
      { name: 'Burgundy', hex: BURGUNDY, use: 'Twill, crewneck, cap' },
      { name: 'Oatmeal', hex: OATMEAL, use: 'Hoodie, crest' },
      { name: 'Heather', hex: HEATHER, use: 'Exec quarter-zip' },
      { name: 'Old gold', hex: GOLD, use: 'Twill edge stitch' },
    ],
    paletteNote: PALETTE_NOTE,
    story: [
      {
        label: 'The thinking',
        after: 'Up close',
        body: [
          'One wordmark and one crest, used the same way on every piece. The arched hoodie is what members wear to info sessions; the quarter-zip is the only piece not made for everyone, which is why the board wants it. Next fall’s run starts from the same saved artwork.',
        ],
      },
    ],
    cover: ['a-plate', 'a-hoodie', 'a-macro', 'a-cap', 'a-label'],
    chapters: [
      { label: 'The collection', assets: ['a-plate'] },
      { label: 'Exec board', assets: ['a-tall'] },
      { label: 'The pieces', assets: ['a-hoodie', 'a-crew', 'a-tee'], captions: ['Arched hoodie · 120', 'Crest crewneck · 72', 'Recruitment tee · 150'] },
      { label: 'Up close', assets: ['a-macro', 'a-label'], captions: ['Tackle twill, edge-stitched', 'Woven neck label'] },
      { label: 'Palette', kind: 'swatches', assets: [] },
    ],
    assets: [
      { id: 'a-plate', kind: 'photo', orientation: 'landscape', priority: 1,
        alt: 'The Ashford collection laid flat on oatmeal: arched hoodie, burgundy crest crewneck and a burgundy cap',
        art: { t: 'plate', ground: '#D9CDB8', items: [
          { g: crewAsh, x: 575, y: 335, s: 1.3, r: 4 },
          { g: hoodieAsh, x: 285, y: 318, s: 1.45, r: -3 },
          { g: capAsh, x: 655, y: 140, s: 0.85, r: 6 },
        ], stickers: [
          { lines: ['ASHFORD', 'FALL RECRUITMENT'], x: 150, y: 538, r: -2, shape: 'tag', color: IVORY, ink: BURGUNDY },
          { lines: ['438', 'PIECES'], x: 440, y: 84, r: 0, shape: 'round' },
        ] } },
      { id: 'a-tall', kind: 'photo', orientation: 'portrait', priority: 2,
        alt: 'The exec quarter-zip in heather grey over a natural recruitment tee, on burgundy',
        art: { t: 'plate', ground: BURGUNDY, tall: true, items: [
          { g: qzAsh, x: 300, y: 270, s: 1.3, r: -2 },
          { g: teeAsh, x: 305, y: 600, s: 1.1, r: 3 },
        ], stickers: [
          { lines: ['EXEC', 'BOARD'], x: 470, y: 455, r: 0, shape: 'round', color: OATMEAL, ink: BURGUNDY },
        ] } },
      { id: 'a-hoodie', kind: 'garment', orientation: 'square', garment: 'hoodie', priority: 1,
        alt: 'Oatmeal hoodie with ASHFORD arched across the chest in burgundy tackle twill',
        art: { t: 'garment', g: hoodieAsh } },
      { id: 'a-cap', kind: 'garment', orientation: 'square', garment: 'cap', priority: 1,
        alt: 'Burgundy six-panel cap with ABS embroidered in oatmeal',
        art: { t: 'garment', g: capAsh } },
      { id: 'a-crew', kind: 'garment', orientation: 'square', garment: 'crewneck', priority: 2,
        alt: 'Burgundy crewneck with a small oatmeal crest on the left chest',
        art: { t: 'garment', g: crewAsh } },
      { id: 'a-qz', kind: 'garment', orientation: 'square', garment: 'quarterzip', wall: false,
        alt: 'Heather grey quarter-zip with ABS embroidered in burgundy on the left chest',
        art: { t: 'garment', g: qzAsh } },
      { id: 'a-tee', kind: 'garment', orientation: 'square', garment: 'tee', wall: false,
        alt: 'Natural heavyweight tee with ASHFORD printed small on the left chest',
        art: { t: 'garment', g: teeAsh } },
      { id: 'a-macro', kind: 'detail', orientation: 'landscape', priority: 1,
        alt: 'Close-up of burgundy tackle-twill lettering with an old-gold edge stitch on oatmeal fleece',
        art: { t: 'macro', cloth: OATMEAL, deco: { ...ashArch, arch: false } } },
      { id: 'a-crest', kind: 'detail', orientation: 'portrait',
        alt: 'Close-up of the embroidered Ashford crest on burgundy fleece',
        art: { t: 'macro', cloth: BURGUNDY, deco: { ...ashCrest, ground: OATMEAL, ink: BURGUNDY } } },
      { id: 'a-label', kind: 'artifact', orientation: 'square',
        alt: 'Burgundy woven neck label reading Ashford Business Society',
        art: { t: 'label', lines: ['ASHFORD', 'BUSINESS SOCIETY'], ground: BURGUNDY, ink: OATMEAL } },
    ],
  },
  {
    id: 'halden', slug: 'halden-works', no: 2,
    title: 'Halden Works', sector: 'Concept collection · New-hire kit', category: 'company',
    vibe: 'Quiet, tonal workwear',
    method: 'Embroidery', qty: '328 pc',
    made: ['Tonal hoodies', 'Quarter-zips', 'Heavyweight tees', 'Caps', 'Canvas totes'],
    note: 'Charcoal, stone and ember for a growing software company’s first-day kit: a tonal hoodie, a quarter-zip, a heavyweight tee, a cap and a canvas tote to carry it home.',
    caseId: 'halden',
    brief: [
      {
        label: 'The ask',
        text: 'Every new hire gets a kit on day one, and most of what we’ve handed out ends up in a drawer. We want pieces people wear on weekends, with the logo small enough that it never feels like a uniform.',
      },
      {
        label: 'The collection',
        text: '328 pieces across five styles, built around a tonal wordmark: a charcoal hoodie embroidered charcoal on charcoal, a stone quarter-zip, a bone tee that carries the one loud moment in ember, a cap and a canvas tote.',
      },
    ],
    pieces: [
      { name: 'Hoodie', details: ['80 pieces', 'Heavyweight fleece in charcoal, ember inside the hood', 'HALDEN embroidered tonally on the left chest'] },
      { name: 'Quarter-zip', details: ['48 pieces', 'Stone, midweight', 'HALDEN embroidered in charcoal on the left chest'] },
      { name: 'Tee', details: ['80 pieces', 'Heavyweight cotton, bone', 'HALDEN WORKS printed in charcoal and ember'] },
      { name: 'Cap', details: ['60 pieces', 'Charcoal, unstructured', 'HALDEN embroidered in ember'] },
      { name: 'Tote', details: ['60 pieces', 'Natural canvas, charcoal base and handles', 'HALDEN WORKS printed in charcoal'] },
    ],
    palette: [
      { name: 'Charcoal', hex: CHARCOAL, use: 'Hoodie, cap, handles' },
      { name: 'Stone', hex: STONE, use: 'Quarter-zip' },
      { name: 'Bone', hex: BONE, use: 'Tee, tote' },
      { name: 'Ember', hex: EMBER, use: 'Hood lining, cap, one line of print' },
    ],
    paletteNote: PALETTE_NOTE,
    story: [
      {
        label: 'The thinking',
        after: 'Up close',
        body: [
          'The logo never gets bigger than a thumbnail except once, on the tee, and even there it keeps to two colors. That restraint is what gets a company hoodie worn outside the office. Each new cohort reorders the same kit from saved artwork.',
        ],
      },
    ],
    cover: ['h-plate', 'h-hoodie', 'h-macro', 'h-cap', 'h-label'],
    chapters: [
      { label: 'The collection', assets: ['h-plate'] },
      { label: 'Day one', assets: ['h-tall'] },
      { label: 'The pieces', assets: ['h-hoodie', 'h-qz', 'h-tee'], captions: ['Tonal hoodie · 80', 'Quarter-zip · 48', 'Heavyweight tee · 80'] },
      { label: 'Up close', assets: ['h-macro', 'h-label'], captions: ['Tonal embroidery', 'Woven neck label'] },
      { label: 'Palette', kind: 'swatches', assets: [] },
    ],
    assets: [
      { id: 'h-plate', kind: 'photo', orientation: 'landscape', priority: 1,
        alt: 'The Halden Works kit laid flat on stone: charcoal hoodie, bone tee and a charcoal cap',
        art: { t: 'plate', ground: STONE, items: [
          { g: teeHalden, x: 590, y: 340, s: 1.25, r: 3 },
          { g: hoodieHalden, x: 290, y: 318, s: 1.45, r: -3 },
          { g: capHalden, x: 650, y: 132, s: 0.85, r: -5 },
        ], stickers: [
          { lines: ['HALDEN', 'NEW-HIRE KIT'], x: 140, y: 540, r: -2, shape: 'tag', color: BONE, ink: CHARCOAL },
          { lines: ['328', 'PIECES'], x: 450, y: 84, r: 0, shape: 'round' },
        ] } },
      { id: 'h-tall', kind: 'photo', orientation: 'portrait', priority: 2,
        alt: 'A stone quarter-zip over a canvas tote with charcoal handles, on charcoal',
        art: { t: 'plate', ground: CHARCOAL, tall: true, items: [
          { g: qzHalden, x: 300, y: 265, s: 1.3, r: -2 },
          { g: toteHalden, x: 305, y: 600, s: 1.05, r: 3 },
        ], stickers: [
          { lines: ['DAY', 'ONE'], x: 470, y: 455, r: 0, shape: 'round', color: EMBER, ink: BONE },
        ] } },
      { id: 'h-hoodie', kind: 'garment', orientation: 'square', garment: 'hoodie', priority: 1,
        alt: 'Charcoal hoodie with HALDEN embroidered tonally on the left chest and an ember hood lining',
        art: { t: 'garment', g: hoodieHalden } },
      { id: 'h-cap', kind: 'garment', orientation: 'square', garment: 'cap', priority: 1,
        alt: 'Charcoal cap with HALDEN embroidered in ember',
        art: { t: 'garment', g: capHalden } },
      { id: 'h-tee', kind: 'garment', orientation: 'square', garment: 'tee', priority: 2,
        alt: 'Bone heavyweight tee printed HALDEN WORKS in charcoal and ember',
        art: { t: 'garment', g: teeHalden } },
      { id: 'h-qz', kind: 'garment', orientation: 'square', garment: 'quarterzip', wall: false,
        alt: 'Stone quarter-zip with HALDEN embroidered in charcoal on the left chest',
        art: { t: 'garment', g: qzHalden } },
      { id: 'h-tote', kind: 'garment', orientation: 'square', garment: 'tote', wall: false,
        alt: 'Canvas tote with charcoal base and handles, HALDEN WORKS printed in charcoal',
        art: { t: 'garment', g: toteHalden } },
      { id: 'h-macro', kind: 'detail', orientation: 'portrait', priority: 1,
        alt: 'Close-up of tonal satin-stitch embroidery, charcoal on charcoal fleece',
        art: { t: 'macro', cloth: CHARCOAL, deco: { ...haldenTonal, ink: '#4A5058' } } },
      { id: 'h-spool', kind: 'artifact', orientation: 'square',
        alt: 'A spool of ember embroidery thread',
        art: { t: 'spool', color: EMBER } },
      { id: 'h-label', kind: 'artifact', orientation: 'square',
        alt: 'Charcoal woven neck label reading Halden Works',
        art: { t: 'label', lines: ['HALDEN WORKS', 'MEMBER ISSUE'], ground: CHARCOAL, ink: BONE } },
    ],
  },
  {
    id: 'riverbend', slug: 'riverbend-5k', no: 3,
    title: 'Riverbend Literacy Fund', sector: 'Concept collection · Charity 5K', category: 'nonprofit',
    vibe: 'Riverside, warm and plain-spoken',
    method: 'Screen printing', qty: '528 pc',
    made: ['Race tees', 'Volunteer crewnecks', 'Supporter hoodies', 'Rope caps'],
    note: 'Deep teal, marigold and linen for a literacy nonprofit’s annual 5K: a race tee for every runner, a crewneck that marks the volunteers, a supporter hoodie to sell at the finish and caps.',
    caseId: 'riverbend',
    brief: [
      {
        label: 'The ask',
        text: 'Our 5K is the biggest fundraiser of the year. Runners need a shirt, volunteers need to be easy to spot, and we want something good enough to sell at the merch table, so the apparel funds books instead of costing us.',
      },
      {
        label: 'The collection',
        text: '528 pieces across four styles: a linen race tee for every registrant, a teal crewneck that marks volunteers on the course, a supporter hoodie with a woven patch for the merch table and a teal cap with a marigold rope.',
      },
    ],
    pieces: [
      { name: 'Race tee', details: ['300 pieces', 'Heavyweight cotton, linen', 'READ THE RIVER 5K printed in teal and marigold, water-based ink'] },
      { name: 'Volunteer crewneck', details: ['60 pieces', 'Teal fleece', 'Riverbend embroidered in marigold script across the chest'] },
      { name: 'Supporter hoodie', details: ['120 pieces', 'Heavyweight fleece in linen, teal rib, marigold hood lining', 'A woven READ THE RIVER patch on the chest'] },
      { name: 'Rope cap', details: ['48 pieces', 'Teal, marigold rope across the brim', 'RIVER 5K embroidered in marigold'] },
    ],
    palette: [
      { name: 'Teal', hex: TEAL, use: 'Crewneck, cap, print' },
      { name: 'Marigold', hex: MARIGOLD, use: 'Script, rope, lining' },
      { name: 'Linen', hex: LINEN, use: 'Race tee, hoodie' },
    ],
    paletteNote: PALETTE_NOTE,
    story: [
      {
        label: 'The thinking',
        after: 'Up close',
        body: [
          'The race tee does the volume; the hoodie does the fundraising. Volunteers wear the only teal crewneck on the course, so runners always know who to ask. Next year’s race starts from the same saved artwork.',
        ],
      },
    ],
    cover: ['r-plate', 'r-hoodie', 'r-macro', 'r-cap', 'r-patch'],
    chapters: [
      { label: 'The collection', assets: ['r-plate'] },
      { label: 'Race morning', assets: ['r-tall'] },
      { label: 'The pieces', assets: ['r-tee', 'r-crew', 'r-hoodie'], captions: ['Race tee · 300', 'Volunteer crewneck · 60', 'Supporter hoodie · 120'] },
      { label: 'Up close', assets: ['r-macro', 'r-patch'], captions: ['Script embroidery', 'Woven patch'] },
      { label: 'Palette', kind: 'swatches', assets: [] },
    ],
    assets: [
      { id: 'r-plate', kind: 'photo', orientation: 'landscape', priority: 1,
        alt: 'The Riverbend collection laid flat on teal: linen race tee, linen supporter hoodie and a teal rope cap',
        art: { t: 'plate', ground: TEAL, items: [
          { g: teeRiver, x: 585, y: 345, s: 1.25, r: 4 },
          { g: hoodieRiver, x: 285, y: 318, s: 1.45, r: -3 },
          { g: capRiver, x: 660, y: 130, s: 0.85, r: 5 },
        ], stickers: [
          { lines: ['RIVERBEND', 'READ THE RIVER 5K'], x: 160, y: 540, r: -2, shape: 'tag', color: LINEN, ink: TEAL },
          { lines: ['528', 'PIECES'], x: 450, y: 84, r: 0, shape: 'round', color: LINEN, ink: TEAL },
        ] } },
      { id: 'r-tall', kind: 'photo', orientation: 'portrait', priority: 2,
        alt: 'The teal volunteer crewneck over a linen race tee, on marigold',
        art: { t: 'plate', ground: MARIGOLD, tall: true, items: [
          { g: crewRiver, x: 300, y: 265, s: 1.3, r: -2 },
          { g: teeRiver, x: 305, y: 600, s: 1.1, r: 3 },
        ], stickers: [
          { lines: ['VOLUNTEER', 'CREW'], x: 445, y: 455, r: 0, shape: 'round', color: TEAL, ink: LINEN },
        ] } },
      { id: 'r-hoodie', kind: 'garment', orientation: 'square', garment: 'hoodie', priority: 1,
        alt: 'Linen hoodie with teal rib, marigold hood lining and a teal woven patch reading Read the River',
        art: { t: 'garment', g: hoodieRiver } },
      { id: 'r-cap', kind: 'garment', orientation: 'square', garment: 'cap', priority: 1,
        alt: 'Teal cap with a marigold rope and RIVER 5K embroidered in marigold',
        art: { t: 'garment', g: capRiver } },
      { id: 'r-tee', kind: 'garment', orientation: 'square', garment: 'tee', priority: 2, wall: false,
        alt: 'Linen race tee printed READ THE RIVER 5K in teal and marigold',
        art: { t: 'garment', g: teeRiver } },
      { id: 'r-crew', kind: 'garment', orientation: 'square', garment: 'crewneck',
        alt: 'Teal crewneck with Riverbend embroidered in marigold script',
        art: { t: 'garment', g: crewRiver } },
      { id: 'r-macro', kind: 'detail', orientation: 'landscape', priority: 1,
        alt: 'Close-up of Riverbend in marigold satin-stitch script on teal fleece',
        art: { t: 'macro', cloth: TEAL, deco: riverScript } },
      { id: 'r-print', kind: 'detail', orientation: 'portrait',
        alt: 'Close-up of the teal and marigold race print on linen jersey',
        art: { t: 'macro', cloth: LINEN, deco: riverTee } },
      { id: 'r-patch', kind: 'artifact', orientation: 'square',
        alt: 'Teal woven patch with a stitched edge reading Read the River',
        art: { t: 'patch', deco: riverPatch } },
    ],
  },
  {
    id: 'eastline', slug: 'eastline-run-club', no: 4,
    title: 'Eastline Run Club', sector: 'Concept collection · Members’ issue', category: 'athletic',
    vibe: 'Road running, safety orange',
    method: 'Screen printing', qty: '396 pc',
    made: ['Singlets', 'Run shorts', 'Members’ tees', 'Arched crewnecks', 'Caps'],
    note: 'Safety orange, asphalt and chalk for a city run club: a singlet and short for race day, a members’ tee, a crewneck for coffee after the long run and an orange cap.',
    caseId: 'eastline',
    brief: [
      {
        label: 'The ask',
        text: 'We run three mornings a week and race a few times a year. Members want something to race in and something to wear to coffee after, in our orange, without it looking like a fun-run giveaway.',
      },
      {
        label: 'The collection',
        text: '396 pieces across five styles: an asphalt singlet and short with the club mark in orange, a chalk members’ tee, a heather crewneck with EASTLINE arched across the chest and an orange cap you can spot from the back of the pack.',
      },
    ],
    pieces: [
      { name: 'Singlet', details: ['72 pieces', 'Lightweight knit, asphalt, orange binding', 'EASTLINE RC printed in safety orange'] },
      { name: 'Run short', details: ['72 pieces', 'Asphalt, orange waistband', 'ERC printed on the left leg'] },
      { name: 'Members’ tee', details: ['120 pieces', 'Heavyweight cotton, chalk', 'EASTLINE RUN CLUB printed in asphalt and orange'] },
      { name: 'Crewneck', details: ['60 pieces', 'Heather grey fleece, asphalt rib', 'EASTLINE arched in orange twill with an asphalt outline'] },
      { name: 'Cap', details: ['72 pieces', 'Safety orange, asphalt brim', 'ERC embroidered in asphalt'] },
    ],
    palette: [
      { name: 'Safety orange', hex: ORANGE, use: 'Print, cap, binding' },
      { name: 'Asphalt', hex: ASPHALT, use: 'Singlet, short, outline' },
      { name: 'Chalk', hex: CHALK, use: 'Members’ tee' },
      { name: 'Heather', hex: GREY, use: 'Crewneck' },
    ],
    paletteNote: PALETTE_NOTE,
    story: [
      {
        label: 'The thinking',
        after: 'Up close',
        body: [
          'Race kit and everything after it, in one palette. The orange is the club’s, so it does the identifying; asphalt and chalk keep the rest quiet enough to wear every day. New members order into the same saved styles each season.',
        ],
      },
    ],
    cover: ['e-plate', 'e-crew', 'e-macro', 'e-cap', 'e-tag'],
    chapters: [
      { label: 'The collection', assets: ['e-plate'] },
      { label: 'Race day', assets: ['e-tall'] },
      { label: 'The pieces', assets: ['e-crew', 'e-tee', 'e-cap'], captions: ['Arched crewneck · 60', 'Members’ tee · 120', 'Cap · 72'] },
      { label: 'Up close', assets: ['e-macro', 'e-tag'], captions: ['Twill, outlined', 'Hang-tag'] },
      { label: 'Palette', kind: 'swatches', assets: [] },
    ],
    assets: [
      { id: 'e-plate', kind: 'photo', orientation: 'landscape', priority: 1,
        alt: 'The Eastline collection laid flat on chalk: heather crewneck, asphalt singlet and an orange cap',
        art: { t: 'plate', ground: '#DDD6C8', items: [
          { g: tankEast, x: 585, y: 335, s: 1.3, r: 4 },
          { g: crewEast, x: 285, y: 318, s: 1.45, r: -3 },
          { g: capEast, x: 660, y: 130, s: 0.85, r: -5 },
        ], stickers: [
          { lines: ['EASTLINE', 'MEMBERS’ ISSUE'], x: 150, y: 540, r: -2, shape: 'tag', color: ORANGE, ink: ASPHALT },
          { lines: ['396', 'PIECES'], x: 450, y: 84, r: 0, shape: 'round', color: ASPHALT, ink: CHALK },
        ] } },
      { id: 'e-tall', kind: 'photo', orientation: 'portrait', priority: 2,
        alt: 'The race kit on safety orange: an asphalt singlet over an asphalt run short',
        art: { t: 'plate', ground: ORANGE, tall: true, items: [
          { g: tankEast, x: 300, y: 260, s: 1.25, r: -2 },
          { g: shortEast, x: 305, y: 590, s: 1.15, r: 3 },
        ], stickers: [
          { lines: ['RACE', 'KIT'], x: 470, y: 440, r: 0, shape: 'round', color: ASPHALT, ink: CHALK },
        ] } },
      { id: 'e-crew', kind: 'garment', orientation: 'square', garment: 'crewneck', priority: 1,
        alt: 'Heather grey crewneck with EASTLINE arched across the chest in orange outlined in asphalt',
        art: { t: 'garment', g: crewEast } },
      { id: 'e-cap', kind: 'garment', orientation: 'square', garment: 'cap', priority: 1,
        alt: 'Safety orange cap with an asphalt brim and ERC embroidered in asphalt',
        art: { t: 'garment', g: capEast } },
      { id: 'e-tee', kind: 'garment', orientation: 'square', garment: 'tee', priority: 2, wall: false,
        alt: 'Chalk members’ tee printed EASTLINE RUN CLUB in asphalt and orange',
        art: { t: 'garment', g: teeEast } },
      { id: 'e-tank', kind: 'garment', orientation: 'square', garment: 'tank',
        alt: 'Asphalt singlet with orange binding, EASTLINE RC printed in orange',
        art: { t: 'garment', g: tankEast } },
      { id: 'e-short', kind: 'garment', orientation: 'square', garment: 'shorts', wall: false,
        alt: 'Asphalt run short with an orange waistband and ERC on the left leg',
        art: { t: 'garment', g: shortEast } },
      { id: 'e-macro', kind: 'detail', orientation: 'landscape', priority: 1,
        alt: 'Close-up of orange twill lettering outlined in asphalt on heather fleece',
        art: { t: 'macro', cloth: GREY, deco: { t: 'type', lines: ['EAST'], face: 'varsity', tech: 'twill', ink: ORANGE, ink2: ASPHALT } } },
      { id: 'e-swatch', kind: 'artifact', orientation: 'square',
        alt: 'Color card in safety orange',
        art: { t: 'swatch', color: ORANGE, name: 'Safety orange' } },
      { id: 'e-tag', kind: 'artifact', orientation: 'square',
        alt: 'Orange hang-tag reading Eastline, Members’ issue',
        art: { t: 'tag', lines: ['EASTLINE', 'MEMBERS’ ISSUE'], color: ORANGE, ink: ASPHALT } },
    ],
  },
  {
    id: 'holloway', slug: 'holloway-club', no: 5,
    title: 'The Holloway Club', sector: 'Concept collection · Spring capsule', category: 'social',
    vibe: 'Embroidered, members only',
    method: 'Embroidery', qty: '276 pc',
    made: ['Crest polos', 'Quarter-zips', 'Script crewnecks', 'Rope caps'],
    note: 'Navy, ivory and claret for a private members’ club: a crest polo, a navy quarter-zip, an oxford-blue crewneck with the club’s name in script and a rope cap, embroidered throughout.',
    caseId: 'holloway',
    brief: [
      {
        label: 'The ask',
        text: 'Our members already own good clothes, and pro-shop logo wear doesn’t get worn. We want a small seasonal capsule that looks at home next to what they already buy, with the crest and nothing else.',
      },
      {
        label: 'The collection',
        text: '276 pieces across four styles, all embroidered: an ivory piqué polo with the crest on the chest, a navy quarter-zip, an oxford-blue crewneck with Holloway in navy script and an ivory rope cap.',
      },
    ],
    pieces: [
      { name: 'Polo', details: ['96 pieces', 'Ivory piqué, navy collar and cuffs', 'The H crest embroidered on the left chest'] },
      { name: 'Quarter-zip', details: ['48 pieces', 'Navy, midweight', 'Claret crest embroidered on the left chest'] },
      { name: 'Crewneck', details: ['60 pieces', 'Oxford-blue fleece, navy rib', 'Holloway in navy script embroidery'] },
      { name: 'Rope cap', details: ['72 pieces', 'Ivory crown, navy brim, claret rope', 'The crest embroidered on the front'] },
    ],
    palette: [
      { name: 'Club navy', hex: NAVY, use: 'Quarter-zip, crest, script' },
      { name: 'Ivory', hex: IVORY, use: 'Polo, cap' },
      { name: 'Claret', hex: CLARET, use: 'Crest, rope' },
      { name: 'Oxford', hex: OXFORD, use: 'Crewneck' },
    ],
    paletteNote: PALETTE_NOTE,
    story: [
      {
        label: 'The thinking',
        after: 'Up close',
        body: [
          'Nothing in the capsule is printed. The crest stays the size of a coin, and the one piece with the club’s name on it uses a script quiet enough to pass for a heritage label. Autumn’s capsule picks up from the same saved crest.',
        ],
      },
    ],
    cover: ['o-plate', 'o-polo', 'o-macro', 'o-cap', 'o-label'],
    chapters: [
      { label: 'The collection', assets: ['o-plate'] },
      { label: 'The clubhouse', assets: ['o-tall'] },
      { label: 'The pieces', assets: ['o-polo', 'o-qz', 'o-crew'], captions: ['Crest polo · 96', 'Quarter-zip · 48', 'Script crewneck · 60'] },
      { label: 'Up close', assets: ['o-macro', 'o-label'], captions: ['The crest, embroidered', 'Woven neck label'] },
      { label: 'Palette', kind: 'swatches', assets: [] },
    ],
    assets: [
      { id: 'o-plate', kind: 'photo', orientation: 'landscape', priority: 1,
        alt: 'The Holloway capsule laid flat on club navy: oxford-blue script crewneck, ivory crest polo and an ivory rope cap',
        art: { t: 'plate', ground: NAVY, items: [
          { g: poloHoll, x: 585, y: 345, s: 1.25, r: 4 },
          { g: crewHoll, x: 285, y: 318, s: 1.45, r: -3 },
          { g: capHoll, x: 655, y: 130, s: 0.85, r: -4 },
        ], stickers: [
          { lines: ['HOLLOWAY', 'SPRING CAPSULE'], x: 150, y: 540, r: -2, shape: 'tag', color: IVORY, ink: NAVY },
          { lines: ['276', 'PIECES'], x: 450, y: 84, r: 0, shape: 'round', color: IVORY, ink: NAVY },
        ] } },
      { id: 'o-tall', kind: 'photo', orientation: 'portrait', priority: 2,
        alt: 'A navy quarter-zip over an ivory crest polo, on oxford blue',
        art: { t: 'plate', ground: OXFORD, tall: true, items: [
          { g: qzHoll, x: 300, y: 265, s: 1.3, r: -2 },
          { g: poloHoll, x: 305, y: 600, s: 1.1, r: 3 },
        ], stickers: [
          { lines: ['MEMBERS', 'ONLY'], x: 465, y: 455, r: 0, shape: 'round', color: NAVY, ink: IVORY },
        ] } },
      { id: 'o-polo', kind: 'garment', orientation: 'square', garment: 'polo', priority: 1,
        alt: 'Ivory piqué polo with a navy collar and the H crest on the left chest',
        art: { t: 'garment', g: poloHoll } },
      { id: 'o-cap', kind: 'garment', orientation: 'square', garment: 'cap', priority: 1,
        alt: 'Ivory rope cap with a navy brim, claret rope and an embroidered crest',
        art: { t: 'garment', g: capHoll } },
      { id: 'o-crew', kind: 'garment', orientation: 'square', garment: 'crewneck', priority: 2,
        alt: 'Oxford-blue crewneck with Holloway in navy script embroidery',
        art: { t: 'garment', g: crewHoll } },
      { id: 'o-qz', kind: 'garment', orientation: 'square', garment: 'quarterzip', wall: false,
        alt: 'Navy quarter-zip with a claret crest on the left chest',
        art: { t: 'garment', g: qzHoll } },
      { id: 'o-macro', kind: 'detail', orientation: 'portrait', priority: 1,
        alt: 'Close-up of the embroidered Holloway crest, ivory on navy',
        art: { t: 'macro', cloth: IVORY, deco: hollCrest(NAVY, IVORY) } },
      { id: 'o-script', kind: 'detail', orientation: 'landscape',
        alt: 'Close-up of Holloway in navy satin-stitch script on oxford-blue fleece',
        art: { t: 'macro', cloth: OXFORD, deco: { t: 'type', lines: ['Holloway'], face: 'script', tech: 'embroidery', ink: NAVY } } },
      { id: 'o-label', kind: 'artifact', orientation: 'square',
        alt: 'Navy woven neck label reading The Holloway Club',
        art: { t: 'label', lines: ['HOLLOWAY', 'THE CLUB · SPRING'], ground: NAVY, ink: IVORY } },
    ],
  },
];

/**
 * What the site shows, in this order. To publish another, add its id here; the wall
 * grows a band for every few collections.
 */
const PUBLISHED = ['ashford', 'halden', 'riverbend', 'eastline', 'holloway'];

export const WORK: WorkItem[] = PUBLISHED.map((id) => ARCHIVE.find((w) => w.id === id)).filter((w): w is WorkItem => !!w);

export const pad3 = (n: number) => String(n).padStart(3, '0');

/** A collection's archive label, "No. 001". */
export const drop = (n: number) => `No. ${pad3(n)}`;

export function projectBySlug(slug: string) {
  return WORK.find((w) => w.slug === slug);
}

/** Pieces as a bare number for the index ("438"), from qty ("438 pc"). */
export function pieces(w: WorkItem) {
  return w.qty?.replace(/\s*pc$/, '');
}

/**
 * The short list under a collection's name: pieces, the method, then what was in it.
 * The method isn't repeated when `made` already names it.
 */
export function specs(w: WorkItem) {
  const n = pieces(w);
  const said = w.made.some((m) => m.toLowerCase() === w.method.toLowerCase());
  return [...(n ? [`${n} pieces`] : []), ...(said ? [] : [w.method]), ...w.made];
}

export const assetById = (w: WorkItem, id: string) => w.assets.find((a) => a.id === id);

/** The picture that leads a collection: its cover's first, else a photo, then a detail, then a garment. */
export function leadOf(w: WorkItem): WorkAsset {
  const cover = w.cover?.[0] && assetById(w, w.cover[0]);
  return cover || (w.assets.find((a) => a.kind === 'photo') ?? w.assets.find((a) => a.kind === 'detail') ?? w.assets[0]);
}

/** The small pictures beside the lead in the assembled collection. */
export function stripOf(w: WorkItem): WorkAsset[] {
  const lead = leadOf(w);
  if (w.cover) return w.cover.slice(1).map((id) => assetById(w, id)).filter((a): a is WorkAsset => !!a);
  return w.assets.filter((a) => a !== lead);
}
