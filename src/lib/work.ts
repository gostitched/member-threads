/**
 * Collections.
 *
 * Every entry here is a CONCEPT COLLECTION: a worked example of what The Mitzvah
 * Studio designs for one kid and one weekend. None of them is a real family, and each
 * says so in its `sector` ("Concept collection · …"). Swap a concept out for a real
 * collection, with the family's permission, as they arrive.
 *
 * Slugs are a contract with the rest of the site: `jake`, `sophie`, `levi-noa`, `ella`
 * (the home chapter links to `/work?project=sophie`).
 *
 * ── Assets ───────────────────────────────────────────────────────────────────
 * Every picture on the Collections wall is an asset that belongs to one collection.
 * The wall scatters a collection's assets through the collage, and hovering any one
 * of them pulls the rest of its collection forward, so each wants several:
 *
 *   photo     the drop laid out flat, on a coloured ground. Cropped to fit.
 *   garment   one piece, cut out on a transparent background. Never cropped.
 *   detail    a macro of the decoration: chenille, satin stitch, puff print.
 *   artifact  something small from the collection: the box, a hang-tag, a label.
 *
 * An asset shows its photograph (`src`, under /public) when it has one and falls back
 * to its drawn version (`art`) until then. To publish a real photo, add `src` with its
 * pixel `width` and `height` and, for crops, a `focal` point.
 */

// ── the drawings ─────────────────────────────────────────────────────────────

export type DrawnKind =
  | 'tee' | 'longsleeve' | 'hoodie' | 'ziphoodie' | 'crewneck' | 'quarterzip' | 'polo'
  | 'jacket' | 'robe' | 'cap' | 'shorts' | 'pants' | 'pajama' | 'tote'
  | 'babytee' | 'tank' | 'jersey' | 'box';

/** Decoration on a drawn piece. */
export type Deco =
  | {
      t: 'type';
      lines: string[];
      face: 'block' | 'varsity' | 'script' | 'chenille';
      tech: 'embroidery' | 'print' | 'puff';
      ink: string;
      /** Second colour: the outline on varsity, the felt on chenille, the last line on a block print. */
      ink2?: string;
      /** Set the first line on an arch. */
      arch?: boolean;
    }
  | { t: 'patch'; lines: string[]; ground: string; ink: string }
  /** A country-club crest: a shield with a monogram and, at size, a word over it. */
  | { t: 'crest'; letter: string; ground: string; ink: string; words?: string }
  /** Full-colour art, as direct-to-garment prints it. `photo` draws a photographic scene. */
  | { t: 'art'; colors: string[]; photo?: boolean };

/** An all-over pattern in the cloth: gingham, PJ stripe, racing checker, a repeat motif. */
export type Pattern = {
  t: 'check' | 'stripe' | 'checker' | 'scatter';
  ink: string;
  ink2?: string;
  motif?: 'letter' | 'bow' | 'sparkle';
  letter?: string;
};

export type Drawn = {
  kind: DrawnKind;
  color: string;
  deco?: Deco;
  /** Where the decoration sits: full front, or left chest (left thigh on a pant). */
  place?: 'chest' | 'left';
  /** Reflective tape, for hi-vis. */
  tape?: boolean;
  /** Contrast rib: cuffs, hem, collar, waistband, a cap's visor, a tote's base and handles, a box's ribbon. */
  trim?: string;
  /** The inside of the hood. */
  lining?: string;
  /** The rope across a cap's brim. */
  rope?: string;
  pattern?: Pattern;
  /** Racing stripes: across the chest on a top, down the side seam on a pant. */
  stripes?: { ink: string; ink2?: string };
};

/** A sticker or hang-tag slapped on a flat lay. Butter by default. */
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
      /** Cabana stripes across the ground, in this colour. */
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
  /** The packaging, from above: the lid, the ribbon, the card. */
  | { t: 'box'; lines: string[]; color?: string; ribbon?: string }
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

export type WorkCategory = 'bar' | 'bat' | 'bnai' | 'family';

export const CATEGORIES: { id: WorkCategory; label: string }[] = [
  { id: 'bar', label: 'Bar Mitzvah' },
  { id: 'bat', label: 'Bat Mitzvah' },
  { id: 'bnai', label: 'B’nai Mitzvah' },
  { id: 'family', label: 'Family & planners' },
];

export type WorkItem = {
  id: string;
  slug: string;
  /** Archive number, shown as 001. */
  no: number;
  title: string;
  /** Starts with "Concept collection" while the collection is a concept. */
  sector: string;
  category: WorkCategory;
  /** Where the weekend is. */
  location?: string;
  /** The look, in a few words ("Vintage golf / country club"). */
  vibe?: string;
  method: 'Chenille appliqué' | 'Embroidery' | 'Puff print' | 'Jacquard' | 'Screen printing';
  /** Pieces in the collection ("86 pc"). */
  qty?: string;
  /** What was in the collection, for the index ("Oversized hoodies", "Dance-floor caps"). */
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

// ── palettes ─────────────────────────────────────────────────────────────────

const CREAM = '#F5EEDC';
const NAVY = '#0E1A47';
const SKY = '#A9CCF4';
const POP = '#F9A8C9';
const INK = '#0E1A47';

// Jake: vintage golf / country club
const FOREST = '#2B5BD7';
const BUTTER = '#F5EEDC';

// Levi & Noa: vintage racing
const BLACK = '#0E1A47';
const CHERRY = '#FF2F2F';
const WHITE = '#FFFFFF';
const SILVER = '#C9CDD4';

// Ella: ballet-core
const BLUSH = '#F9A8C9';
const BLUSH_LT = '#FFDCEA';
const BLUSH_DK = '#F28DB8';
const OAT = '#E9E0C8';

// ── Sophie ───────────────────────────────────────────────────────────────────

const sophieScript: Deco = { t: 'type', lines: ['Sophie'], face: 'script', tech: 'embroidery', ink: NAVY };
const sophieCap: Deco = { t: 'type', lines: ['SOPHIE'], face: 'block', tech: 'embroidery', ink: NAVY };
const sophiePuff: Deco = { t: 'type', lines: ['SOPHIE', 'MIAMI'], face: 'varsity', tech: 'puff', ink: NAVY, ink2: CREAM, arch: true };
const sophieS: Deco = { t: 'type', lines: ['S'], face: 'chenille', tech: 'embroidery', ink: CREAM, ink2: SKY };

const hoodieSophie: Drawn = { kind: 'hoodie', color: CREAM, deco: sophieScript, trim: NAVY, lining: SKY };
const babyteeSophie: Drawn = { kind: 'babytee', color: SKY, deco: sophiePuff, trim: NAVY };
const shortSophie: Drawn = { kind: 'shorts', color: SKY, trim: NAVY, deco: { t: 'type', lines: ['S'], face: 'script', tech: 'embroidery', ink: NAVY } };
const sweatSophie: Drawn = { kind: 'pants', color: NAVY, stripes: { ink: SKY, ink2: CREAM }, deco: sophieS, place: 'left' };
const capSophie: Drawn = { kind: 'cap', color: CREAM, trim: NAVY, deco: sophieCap };
const pjSophie: Drawn = { kind: 'pajama', color: CREAM, trim: NAVY, pattern: { t: 'stripe', ink: SKY, ink2: NAVY } };

// ── Jake ─────────────────────────────────────────────────────────────────────

const jakeChenille: Deco = { t: 'type', lines: ['JAKE'], face: 'chenille', tech: 'embroidery', ink: CREAM, ink2: NAVY, arch: true };
const jakeCrest: Deco = { t: 'crest', letter: 'J', ground: FOREST, ink: BUTTER, words: 'JAKE' };
const jakeCrestCap: Deco = { t: 'crest', letter: 'J', ground: CREAM, ink: FOREST };

const hoodieJake: Drawn = { kind: 'hoodie', color: FOREST, deco: jakeChenille, lining: CREAM, trim: '#0B7A40' };
const poloJake: Drawn = { kind: 'polo', color: CREAM, trim: FOREST, deco: jakeCrest, place: 'left' };
const capJake: Drawn = { kind: 'cap', color: FOREST, trim: CREAM, rope: BUTTER, deco: jakeCrestCap };
const pjJake: Drawn = { kind: 'pajama', color: FOREST, trim: NAVY, pattern: { t: 'scatter', motif: 'letter', letter: 'J', ink: BUTTER } };
const toteJake: Drawn = { kind: 'tote', color: CREAM, trim: FOREST, deco: { t: 'type', lines: ['Jake'], face: 'script', tech: 'embroidery', ink: FOREST } };

// ── Levi & Noa ───────────────────────────────────────────────────────────────

const jerseyLevi: Drawn = {
  kind: 'jersey', color: WHITE, trim: CHERRY, stripes: { ink: CHERRY, ink2: BLACK },
  deco: { t: 'type', lines: ['LEVI', '01'], face: 'block', tech: 'puff', ink: BLACK, ink2: CHERRY },
};
const jerseyNoa: Drawn = {
  kind: 'jersey', color: BLACK, trim: CHERRY, stripes: { ink: CHERRY, ink2: WHITE },
  deco: { t: 'type', lines: ['NOA', '02'], face: 'block', tech: 'puff', ink: WHITE, ink2: CHERRY },
};
const capLN: Drawn = { kind: 'cap', color: BLACK, trim: CHERRY, deco: { t: 'type', lines: ['L&N'], face: 'block', tech: 'embroidery', ink: WHITE } };
const crewLN: Drawn = {
  kind: 'crewneck', color: SILVER, trim: BLACK,
  deco: { t: 'type', lines: ['LEVI & NOA', 'GRAND PRIX'], face: 'block', tech: 'print', ink: BLACK, ink2: CHERRY },
};
const toteLN: Drawn = { kind: 'tote', color: WHITE, trim: CHERRY, pattern: { t: 'checker', ink: BLACK } };

// ── Ella ─────────────────────────────────────────────────────────────────────

const ellaScript = (ink: string): Deco => ({ t: 'type', lines: ['Ella'], face: 'script', tech: 'embroidery', ink });

const zipElla: Drawn = { kind: 'ziphoodie', color: OAT, trim: BLUSH, lining: BLUSH, deco: ellaScript(BLUSH_DK), place: 'left' };
const tankElla: Drawn = { kind: 'tank', color: INK, trim: INK, deco: ellaScript(BLUSH) };
const pjElla: Drawn = { kind: 'pajama', color: BLUSH_LT, trim: BLUSH, pattern: { t: 'check', ink: BLUSH_DK } };
const toteElla: Drawn = { kind: 'tote', color: OAT, trim: BLUSH, deco: ellaScript(BLUSH_DK) };
const boxElla: Drawn = { kind: 'box', color: BLUSH, trim: INK, deco: { t: 'patch', lines: ['ELLA'], ground: OAT, ink: INK } };

/** Every collection written up, published or not. */
const ARCHIVE: WorkItem[] = [
  {
    id: 'sophie', slug: 'sophie', no: 1,
    title: 'The Sophie Collection', sector: 'Concept collection · Bat Mitzvah', category: 'bat',
    location: 'Miami, Florida', vibe: 'Aviator Nation × country club',
    method: 'Embroidery', qty: '86 pc',
    made: ['Oversized hoodies', 'Baby tee + short sets', 'Sweatpants', 'Dance-floor caps', 'PJ pants', 'Packaging'],
    note: 'A cream, navy and baby blue collection for a Miami Bat Mitzvah: an oversized hoodie with contrast rib, a friends’ matching set, sweats, caps and PJ pants, boxed by name.',
    caseId: 'sophie',
    brief: [
      {
        label: 'The ask',
        text: 'Her colors are cream, navy and baby blue. She lives in Aviator Nation and loves vintage country-club stuff. Something amazing for 80 kids, and a matching set for her closest friends.',
      },
      {
        label: 'The collection',
        text: 'One drop of 86 pieces: a 420 GSM hoodie with her name in satin script, a Pantone-matched baby tee and foldover short for the friends section, sweats, dance-floor caps and PJ pants, all in one palette.',
      },
    ],
    pieces: [
      { name: 'Hoodie', details: ['420 GSM, oversized, cream fleece', 'Navy contrast rib at the cuffs and hem, baby blue inside the hood', '“Sophie” in navy satin-stitch script across the chest', 'Woven neck label'] },
      { name: 'Friends set', details: ['Baby tee and foldover short, Pantone-matched in baby blue', 'Navy ringer rib on the tee, navy foldover on the short', 'SOPHIE / MIAMI in navy puff print'] },
      { name: 'Sweatpant', details: ['Navy, relaxed', 'Baby blue and cream side stripe', 'Chenille S on the left thigh'] },
      { name: 'Dance-floor cap', details: ['Cream crown, navy brim', 'SOPHIE embroidered in navy'] },
      { name: 'PJ pant', details: ['Cream with a baby blue and navy pajama stripe', 'Navy waistband and drawcord'] },
      { name: 'Packaging', details: ['Navy box, baby blue ribbon', 'Sorted and labelled by guest name, sizes collected in advance'] },
    ],
    palette: [
      { name: 'Miami blue', hex: SKY, use: 'Friends set, hood, ribbon' },
      { name: 'Cream', hex: CREAM, use: 'Hoodie, cap, PJ pant' },
      { name: 'Navy', hex: NAVY, use: 'Rib, script, sweats, box' },
    ],
    paletteNote: 'Concept palette. Every color is matched to Pantone before production.',
    story: [
      {
        label: 'How it arrives',
        after: 'Up close',
        body: [
          'Sizes are collected from the guest list weeks ahead, so nobody is guessing on the day. Every piece is folded, sorted by name and boxed in navy with a baby blue ribbon.',
          'It arrives at the venue ready to hand out: the friends’ sets in their own boxes, the hoodies on the welcome table, the caps for the dance floor.',
        ],
      },
    ],
    cover: ['s-plate', 's-hoodie', 's-set', 's-macro', 's-cap'],
    chapters: [
      { label: 'The drop', assets: ['s-plate'] },
      { label: 'The friends section', assets: ['s-set'] },
      { label: 'The pieces', assets: ['s-hoodie', 's-sweat', 's-pj'], captions: ['Oversized hoodie', 'Sweatpant', 'PJ pant'] },
      { label: 'Up close', assets: ['s-macro', 's-box'], captions: ['Satin-stitch script', 'The box'] },
      { label: 'Palette', kind: 'swatches', assets: [] },
    ],
    assets: [
      { id: 's-plate', kind: 'photo', orientation: 'landscape', priority: 1,
        alt: 'The Sophie Collection laid flat on baby blue: cream hoodie, navy sweatpant and a cream cap with a navy brim',
        art: { t: 'plate', ground: SKY, stripe: '#A6E0FF', items: [
          { g: sweatSophie, x: 590, y: 330, s: 1.25, r: 14 },
          { g: hoodieSophie, x: 300, y: 320, s: 1.45, r: -7 },
          { g: capSophie, x: 640, y: 150, s: 0.9, r: 10 },
        ], stickers: [
          { lines: ['SOPHIE', "’26"], x: 120, y: 92, r: -9, shape: 'tag' },
          { lines: ['86', 'PIECES'], x: 700, y: 512, r: 8, shape: 'round', color: CREAM, ink: NAVY },
        ] } },
      { id: 's-set', kind: 'photo', orientation: 'portrait', priority: 2,
        annotation: 'the friends section',
        alt: 'The matching set on navy: a baby blue baby tee with navy puff print over a baby blue foldover short',
        art: { t: 'plate', ground: NAVY, tall: true, items: [
          { g: babyteeSophie, x: 300, y: 270, s: 1.35, r: -4 },
          { g: shortSophie, x: 310, y: 590, s: 1.15, r: 5 },
        ], stickers: [
          { lines: ['MATCHING', 'SET'], x: 470, y: 690, r: -8, shape: 'tag' },
        ] } },
      { id: 's-hoodie', kind: 'garment', orientation: 'square', garment: 'hoodie', priority: 1,
        annotation: 'baby blue inside the hood',
        alt: 'Cream oversized hoodie, navy contrast rib, baby blue hood lining, Sophie in navy script',
        art: { t: 'garment', g: hoodieSophie } },
      { id: 's-cap', kind: 'garment', orientation: 'square', garment: 'cap', priority: 2,
        annotation: 'dance-floor issue',
        alt: 'Cream cap with a navy brim, SOPHIE embroidered in navy',
        art: { t: 'garment', g: capSophie } },
      { id: 's-sweat', kind: 'garment', orientation: 'square', garment: 'pants',
        alt: 'Navy sweatpant with a baby blue and cream side stripe and a chenille S',
        art: { t: 'garment', g: sweatSophie } },
      { id: 's-pj', kind: 'garment', orientation: 'square', garment: 'pajama',
        alt: 'Cream PJ pant with a baby blue and navy pajama stripe',
        art: { t: 'garment', g: pjSophie } },
      { id: 's-macro', kind: 'detail', orientation: 'landscape', priority: 1,
        alt: 'Close-up of Sophie in navy satin-stitch script on cream fleece',
        art: { t: 'macro', cloth: CREAM, deco: sophieScript } },
      { id: 's-box', kind: 'artifact', orientation: 'square',
        alt: 'Navy collection box tied with baby blue ribbon, card reading The Sophie Collection',
        art: { t: 'box', lines: ['THE COLLECTION', 'SOPHIE', 'MIAMI · 05.16.26'], color: NAVY, ribbon: SKY } },
    ],
  },
  {
    id: 'jake', slug: 'jake', no: 2,
    title: 'The Jake Collection', sector: 'Concept collection · Bar Mitzvah', category: 'bar',
    location: 'Scottsdale, Arizona', vibe: 'Vintage golf / country club',
    method: 'Chenille appliqué', qty: '72 pc',
    made: ['Chenille hoodies', 'Polos', 'Rope-brim caps', 'Crest PJ pants', 'Totes', 'Packaging'],
    note: 'Kelly green, cream and lemon for a Scottsdale Bar Mitzvah: chenille hoodies, crest polos, rope-brim caps and PJ pants with his crest on repeat.',
    caseId: 'jake',
    brief: [
      {
        label: 'The ask',
        text: 'Golf weekend in Scottsdale. He wanted it to feel like an old members’ club, not a party store. Kelly green, cream, a hit of lemon yellow.',
      },
      {
        label: 'The collection',
        text: '72 pieces around one crest: a kelly green hoodie with JAKE in chenille, a cream polo, a rope-brim cap, PJ pants with the crest on repeat, a tote for the parents and a box for every guest.',
      },
    ],
    pieces: [
      { name: 'Hoodie', details: ['420 GSM kelly green fleece, cream inside the hood', 'JAKE in cream chenille on navy felt, arched across the chest'] },
      { name: 'Polo', details: ['Cream piqué, kelly collar', 'The J crest embroidered on the left chest'] },
      { name: 'Rope-brim cap', details: ['Kelly crown, cream brim, lemon rope', 'Embroidered crest on the front'] },
      { name: 'PJ pant', details: ['Kelly green, with the J crest woven on repeat', 'Navy waistband and drawcord'] },
      { name: 'Tote', details: ['Cream canvas, kelly base and handles', '“Jake” in kelly script'] },
      { name: 'Packaging', details: ['Kelly box, lemon ribbon', 'Boxed by guest name, caps packed separately for the dance floor'] },
    ],
    palette: [
      { name: 'Kelly', hex: FOREST, use: 'Hoodie, PJ pant, box' },
      { name: 'Cream', hex: CREAM, use: 'Polo, chenille, tote' },
      { name: 'Navy', hex: NAVY, use: 'Felt, waistband' },
      { name: 'Lemon', hex: BUTTER, use: 'Crest, rope, ribbon' },
    ],
    paletteNote: 'Concept palette. Every color is matched to Pantone before production.',
    story: [
      {
        label: 'How it arrives',
        after: 'Up close',
        body: [
          'Every guest gets a kelly box with a lemon ribbon and their name on the card, sized from the RSVP list. The caps travel separately and go out at the start of the party.',
        ],
      },
    ],
    cover: ['j-plate', 'j-hoodie', 'j-macro', 'j-cap', 'j-box'],
    chapters: [
      { label: 'The drop', assets: ['j-plate'] },
      { label: 'Clubhouse', assets: ['j-tall'] },
      { label: 'The pieces', assets: ['j-hoodie', 'j-polo', 'j-pj'], captions: ['Chenille hoodie', 'Crest polo', 'PJ pant'] },
      { label: 'Up close', assets: ['j-macro', 'j-box'], captions: ['Chenille on felt', 'The box'] },
      { label: 'Palette', kind: 'swatches', assets: [] },
    ],
    assets: [
      { id: 'j-plate', kind: 'photo', orientation: 'landscape', priority: 1,
        alt: 'The Jake Collection laid flat on lemon yellow: kelly chenille hoodie, crest PJ pant and a rope-brim cap',
        art: { t: 'plate', ground: BUTTER, items: [
          { g: pjJake, x: 600, y: 350, s: 1.3, r: 12 },
          { g: hoodieJake, x: 290, y: 315, s: 1.45, r: -8 },
          { g: capJake, x: 650, y: 140, s: 0.9, r: -12 },
        ], stickers: [
          { lines: ['JAKE', "’26"], x: 112, y: 520, r: 7, shape: 'tag', color: CREAM, ink: FOREST },
          { lines: ['72', 'PIECES'], x: 470, y: 88, r: -8, shape: 'round', color: FOREST, ink: BUTTER },
        ] } },
      { id: 'j-tall', kind: 'photo', orientation: 'portrait', priority: 2,
        annotation: 'members only',
        alt: 'A cream crest polo over a cream and kelly tote, on kelly green',
        art: { t: 'plate', ground: FOREST, tall: true, items: [
          { g: poloJake, x: 290, y: 270, s: 1.3, r: -5 },
          { g: toteJake, x: 320, y: 600, s: 1.05, r: 6 },
        ], stickers: [
          { lines: ['MEMBERS', 'ONLY'], x: 150, y: 470, r: -10, shape: 'tag' },
        ] } },
      { id: 'j-hoodie', kind: 'garment', orientation: 'square', garment: 'hoodie', priority: 1,
        annotation: 'chenille, not a print',
        alt: 'Kelly hoodie with JAKE arched across the chest in cream chenille on navy felt',
        art: { t: 'garment', g: hoodieJake } },
      { id: 'j-cap', kind: 'garment', orientation: 'square', garment: 'cap', priority: 1,
        annotation: 'rope brim',
        alt: 'Kelly rope-brim cap with a cream brim, lemon rope and an embroidered crest',
        art: { t: 'garment', g: capJake } },
      { id: 'j-polo', kind: 'garment', orientation: 'square', garment: 'polo',
        alt: 'Cream polo with a kelly collar and the J crest on the left chest',
        art: { t: 'garment', g: poloJake } },
      { id: 'j-pj', kind: 'garment', orientation: 'square', garment: 'pajama',
        annotation: 'the crest, on repeat',
        alt: 'Kelly PJ pant with a lemon J crest on repeat',
        art: { t: 'garment', g: pjJake } },
      { id: 'j-macro', kind: 'detail', orientation: 'portrait', priority: 1,
        alt: 'Close-up of cream chenille lettering on navy felt, sewn onto kelly green fleece',
        art: { t: 'macro', cloth: FOREST, deco: { t: 'type', lines: ['JAKE'], face: 'chenille', tech: 'embroidery', ink: CREAM, ink2: NAVY } } },
      { id: 'j-box', kind: 'artifact', orientation: 'square',
        alt: 'Kelly collection box with a lemon ribbon and a card reading The Jake Collection',
        art: { t: 'box', lines: ['THE COLLECTION', 'JAKE', 'SCOTTSDALE, AZ'], color: FOREST, ribbon: BUTTER } },
    ],
  },
  {
    id: 'levi-noa', slug: 'levi-noa', no: 3,
    title: 'The Levi & Noa Collection', sector: 'Concept collection · B’nai Mitzvah', category: 'bnai',
    location: 'Westchester, New York', vibe: 'Vintage racing',
    method: 'Puff print', qty: '118 pc',
    made: ['Racing jerseys', 'Crewnecks', 'Caps', 'Checker totes', 'Numbered pieces', 'Packaging'],
    note: 'Black, cherry, white and silver for twins: numbered racing jerseys, a Grand Prix crewneck, caps and checker totes, every piece numbered out of 118.',
    caseId: 'levi-noa',
    brief: [
      {
        label: 'The ask',
        text: 'Twins, one party, two very different kids. Both into cars. Make it feel like a vintage racing team, and make sure neither one gets the “matching outfit” treatment.',
      },
      {
        label: 'The collection',
        text: '118 pieces for one team with two drivers: Levi’s white jersey and Noa’s black one, each with their own number, a silver Grand Prix crewneck, caps, checker totes and a numbered woven label in every piece.',
      },
    ],
    pieces: [
      { name: 'Racing jersey', details: ['Two colorways: white for Levi, black for Noa', 'Cherry collar and cuffs, racing stripes across the chest and sleeves', 'Name and number in puff print'] },
      { name: 'Crewneck', details: ['Silver heather, black rib', 'LEVI & NOA / GRAND PRIX, two-color screen print'] },
      { name: 'Cap', details: ['Black crown, cherry brim', 'L&N embroidered in white'] },
      { name: 'Tote', details: ['Black and white checker', 'Cherry base and handles'] },
      { name: 'Numbered pieces', details: ['A woven label in every piece, numbered 001 to 118'] },
      { name: 'Packaging', details: ['Black boxes with cherry ribbon, split by team: Levi’s guests and Noa’s'] },
    ],
    palette: [
      { name: 'Cherry', hex: CHERRY, use: 'Stripes, collars, brims' },
      { name: 'Black', hex: BLACK, use: 'Noa’s jersey, caps, checker' },
      { name: 'White', hex: WHITE, use: 'Levi’s jersey, checker' },
      { name: 'Silver', hex: SILVER, use: 'Crewneck' },
    ],
    paletteNote: 'Concept palette. Every color is matched to Pantone before production.',
    story: [
      {
        label: 'How it arrives',
        after: 'Up close',
        body: [
          'Two teams, two sets of boxes. Guests pick a driver on the RSVP, sizes come in with it, and every box is labelled by name and number so the pit crew at the door just hands them out.',
        ],
      },
    ],
    cover: ['ln-plate', 'ln-levi', 'ln-macro', 'ln-noa', 'ln-label'],
    chapters: [
      { label: 'The drop', assets: ['ln-plate'] },
      { label: 'Two drivers', assets: ['ln-levi', 'ln-noa'], captions: ['Levi, #01', 'Noa, #02'] },
      { label: 'The pit crew', assets: ['ln-tall'] },
      { label: 'Up close', assets: ['ln-macro', 'ln-label'], captions: ['Puff print', 'Numbered label'] },
      { label: 'Palette', kind: 'swatches', assets: [] },
    ],
    assets: [
      { id: 'ln-plate', kind: 'photo', orientation: 'landscape', priority: 1,
        alt: 'Two racing jerseys crossed on cherry red, one white numbered 01, one black numbered 02, with a black cap',
        art: { t: 'plate', ground: CHERRY, items: [
          { g: jerseyNoa, x: 560, y: 330, s: 1.35, r: 11 },
          { g: jerseyLevi, x: 270, y: 320, s: 1.4, r: -9 },
          { g: capLN, x: 690, y: 120, s: 0.85, r: 14 },
        ], stickers: [
          { lines: ['LEVI & NOA', "’26"], x: 150, y: 540, r: -6, shape: 'tag', color: WHITE, ink: BLACK },
          { lines: ['118', 'PIECES'], x: 470, y: 86, r: 9, shape: 'round', color: POP, ink: BLACK },
        ] } },
      { id: 'ln-tall', kind: 'photo', orientation: 'portrait', priority: 2,
        alt: 'A silver Grand Prix crewneck over a black and white checker tote, on black',
        art: { t: 'plate', ground: BLACK, tall: true, items: [
          { g: crewLN, x: 300, y: 270, s: 1.3, r: 4 },
          { g: toteLN, x: 290, y: 600, s: 1.05, r: -6 },
        ], stickers: [
          { lines: ['PIT', 'CREW'], x: 470, y: 470, r: 10, shape: 'round', color: CHERRY, ink: WHITE },
        ] } },
      { id: 'ln-levi', kind: 'garment', orientation: 'square', garment: 'jersey', priority: 1,
        annotation: 'one team, two drivers',
        alt: 'White racing jersey with cherry and black stripes, LEVI 01 in puff print',
        art: { t: 'garment', g: jerseyLevi } },
      { id: 'ln-noa', kind: 'garment', orientation: 'square', garment: 'jersey', priority: 1,
        alt: 'Black racing jersey with cherry and white stripes, NOA 02 in puff print',
        art: { t: 'garment', g: jerseyNoa } },
      { id: 'ln-cap', kind: 'garment', orientation: 'square', garment: 'cap', priority: 2,
        alt: 'Black cap with a cherry brim, L&N in white embroidery',
        art: { t: 'garment', g: capLN } },
      { id: 'ln-macro', kind: 'detail', orientation: 'landscape', priority: 1,
        alt: 'Close-up of a raised cherry puff-print number on white jersey knit',
        art: { t: 'macro', cloth: WHITE, deco: { t: 'type', lines: ['01'], face: 'block', tech: 'puff', ink: CHERRY } } },
      { id: 'ln-label', kind: 'artifact', orientation: 'square',
        annotation: 'numbered 001–118',
        alt: 'Woven neck label reading Levi & Noa, No. 047 of 118',
        art: { t: 'label', lines: ['LEVI & NOA', 'NO. 047 / 118'], ground: BLACK, ink: WHITE } },
    ],
  },
  {
    id: 'ella', slug: 'ella', no: 4,
    title: 'The Ella Collection', sector: 'Concept collection · Bat Mitzvah', category: 'bat',
    location: 'Los Angeles, California', vibe: 'Ballet-core',
    method: 'Embroidery', qty: '64 pc',
    made: ['Zip hoodies', 'Ribbed tanks', 'Gingham PJ pants', 'Totes', 'Satin-ribbon boxes'],
    note: 'Blush, oat and ink for an LA Bat Mitzvah: zip hoodies, ribbed tanks and gingham PJ pants with her name in script, boxed in satin ribbon.',
    caseId: 'ella',
    brief: [
      {
        label: 'The ask',
        text: 'She dances, and she wanted it to look like it: soft pink, ribbon, nothing loud. Pieces her friends would wear to the studio and to sleepovers, long after the party.',
      },
      {
        label: 'The collection',
        text: '64 pieces in blush, oat and ink: an oat zip hoodie and a ribbed black tank with “Ella” in script, gingham PJ pants for the after-party and a tote, each boxed with a satin ribbon.',
      },
    ],
    pieces: [
      { name: 'Zip hoodie', details: ['Oat fleece, blush rib and hood lining', '“Ella” in blush script on the left chest', 'Custom zipper pull'] },
      { name: 'Tank', details: ['Ink rib-knit, fitted', '“Ella” in blush script'] },
      { name: 'PJ pant', details: ['Blush gingham', 'Blush waistband and drawcord'] },
      { name: 'Tote', details: ['Oat canvas, blush base and handles', 'Ties with a scrunchie'] },
      { name: 'Packaging', details: ['Blush box, ink satin ribbon, a woven card with each guest’s name'] },
    ],
    palette: [
      { name: 'Blush', hex: BLUSH, use: 'Rib, box, script' },
      { name: 'Oat', hex: OAT, use: 'Zip hoodie, tote' },
      { name: 'Ink', hex: INK, use: 'Tank, ribbon' },
    ],
    paletteNote: 'Concept palette. Every color is matched to Pantone before production.',
    story: [
      {
        label: 'How it arrives',
        after: 'Up close',
        body: [
          'Each guest’s pieces are folded in tissue, boxed in blush and tied with an ink satin ribbon, with their name on a woven card. The PJ pants are packed on top, for the after-party.',
        ],
      },
    ],
    cover: ['e-plate', 'e-zip', 'e-macro', 'e-tank', 'e-box'],
    chapters: [
      { label: 'The drop', assets: ['e-plate'] },
      { label: 'After-party', assets: ['e-tall'] },
      { label: 'The pieces', assets: ['e-zip', 'e-tank', 'e-tote'], captions: ['Zip hoodie', 'Ribbed tank', 'Tote'] },
      { label: 'Up close', assets: ['e-macro', 'e-box'], captions: ['Satin-stitch script', 'The box'] },
      { label: 'Palette', kind: 'swatches', assets: [] },
    ],
    assets: [
      { id: 'e-plate', kind: 'photo', orientation: 'landscape', priority: 1,
        alt: 'The Ella Collection laid flat on blush: oat zip hoodie, black ribbed tank and a blush box with ink ribbon',
        art: { t: 'plate', ground: '#F7A8C8', items: [
          { g: tankElla, x: 580, y: 330, s: 1.3, r: 10 },
          { g: zipElla, x: 290, y: 320, s: 1.45, r: -7 },
          { g: boxElla, x: 690, y: 120, s: 0.75, r: -8 },
        ], stickers: [
          { lines: ['ELLA', "’26"], x: 120, y: 528, r: -7, shape: 'tag', color: INK, ink: BLUSH_LT },
        ] } },
      { id: 'e-tall', kind: 'photo', orientation: 'portrait', priority: 2,
        annotation: 'after-party approved',
        alt: 'The PJ set on oat: a black ribbed tank over blush gingham PJ pants',
        art: { t: 'plate', ground: OAT, tall: true, items: [
          { g: tankElla, x: 300, y: 250, s: 1.25, r: -4 },
          { g: pjElla, x: 300, y: 590, s: 1.2, r: 4 },
        ], stickers: [
          { lines: ['AFTER', 'PARTY'], x: 470, y: 420, r: 9, shape: 'round', color: POP, ink: INK },
        ] } },
      { id: 'e-zip', kind: 'garment', orientation: 'square', garment: 'ziphoodie', priority: 1,
        annotation: 'the one they’ll actually wear',
        alt: 'Oat zip hoodie with blush rib and hood lining, Ella in blush script on the left chest',
        art: { t: 'garment', g: zipElla } },
      { id: 'e-tank', kind: 'garment', orientation: 'square', garment: 'tank', priority: 2,
        alt: 'Black ribbed tank with Ella in blush script',
        art: { t: 'garment', g: tankElla } },
      { id: 'e-pj', kind: 'garment', orientation: 'square', garment: 'pajama', wall: false,
        alt: 'Blush gingham PJ pant',
        art: { t: 'garment', g: pjElla } },
      { id: 'e-tote', kind: 'garment', orientation: 'square', garment: 'tote',
        alt: 'Oat canvas tote with blush base and handles, Ella in blush script',
        art: { t: 'garment', g: toteElla } },
      { id: 'e-macro', kind: 'detail', orientation: 'portrait', priority: 1,
        alt: 'Close-up of Ella in ivory satin-stitch script on blush satin',
        art: { t: 'macro', cloth: BLUSH, deco: ellaScript(WHITE), satin: true } },
      { id: 'e-box', kind: 'artifact', orientation: 'square',
        alt: 'Blush collection box tied with an ink satin ribbon, card reading The Ella Collection',
        art: { t: 'box', lines: ['THE COLLECTION', 'ELLA', 'LOS ANGELES'], color: BLUSH, ribbon: INK } },
    ],
  },
];

/**
 * What the site shows, in this order. To publish another, add its id here; the wall
 * grows a band for every few collections.
 */
const PUBLISHED = ['sophie', 'jake', 'levi-noa', 'ella'];

export const WORK: WorkItem[] = PUBLISHED.map((id) => ARCHIVE.find((w) => w.id === id)).filter((w): w is WorkItem => !!w);

export const pad3 = (n: number) => String(n).padStart(3, '0');

/** A collection's archive label, "Drop 001". The kid's own is always the next one. */
export const drop = (n: number) => `Drop ${pad3(n)}`;

export function projectBySlug(slug: string) {
  return WORK.find((w) => w.slug === slug);
}

/** Pieces as a bare number for the index ("86"), from qty ("86 pc"). */
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
