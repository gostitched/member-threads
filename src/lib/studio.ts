/**
 * The studio: pick a piece, then stack decoration on it.
 *
 * Everything the section shows lives here: the garments, the techniques, where
 * each one lands on each garment, and the copy. The component is an engine over
 * this data, so swapping the placeholder drawings for final renders, or adding a
 * technique, needs no new component.
 *
 * Rules the copy follows, because they are true of the business:
 * - Decoration is included. Tags, labels and packaging are not, so none of them
 *   is ever a technique here.
 * - No minimums, weights or lead times: those depend on the garment and live in
 *   the quote. Annotations describe construction and process, never numbers we
 *   would have to stand behind.
 */

import type { Drawing } from '@/components/studio/drawings';

// ── placement ────────────────────────────────────────────────────────────────

/** Where a mark can sit, named the way a tech pack would. */
export type ZoneId = 'chest' | 'center' | 'upper' | 'sleeveL' | 'sleeveR' | 'hem' | 'hemR';

/**
 * A placement on the 400×400 drawing: centre point, box size, rotation in degrees.
 * `tall` zones run down a sleeve or leg; square artwork shrinks to fit their width.
 */
export type Zone = { x: number; y: number; w: number; r?: number; tall?: boolean };

// ── garments ─────────────────────────────────────────────────────────────────

export type StudioGarment = {
  id: string;
  /** The word on the canvas. */
  name: string;
  /** Singular, for the recipe ("VARSITY + PUFF"). */
  single: string;
  /** Flat drawing used until a render exists. */
  drawing: Drawing;
  /**
   * Final renders, when we have them: transparent PNG/WebP drawn to the same
   * 400×400 front-on box as the drawings, so every zone below still lines up.
   * The front replaces the drawing; the back is shown on the tech sketch.
   */
  frontAsset?: string;
  backAsset?: string;
  /** Contrast panels (varsity sleeves, jersey trim). */
  accent?: string;
  /** Construction notes shown on hover. Short; this is not a spec sheet. */
  technicalLabel: string[];
  zones: Partial<Record<ZoneId, Zone>>;
};

/** Zones shared by anything with a torso and long sleeves. */
const TOP: Partial<Record<ZoneId, Zone>> = {
  chest: { x: 246, y: 152, w: 50 },
  upper: { x: 156, y: 150, w: 44 },
  center: { x: 200, y: 222, w: 116 },
  sleeveL: { x: 86, y: 226, w: 84, r: 12, tall: true },
  sleeveR: { x: 314, y: 226, w: 84, r: -12, tall: true },
  hem: { x: 150, y: 298, w: 44 },
  hemR: { x: 250, y: 298, w: 44 },
};

/** Short sleeves: the sleeve zones are small and steep. */
const TEE: Partial<Record<ZoneId, Zone>> = {
  ...TOP,
  sleeveL: { x: 84, y: 160, w: 44, r: 42, tall: true },
  sleeveR: { x: 316, y: 160, w: 44, r: -42, tall: true },
};

export const STUDIO_GARMENTS: StudioGarment[] = [
  {
    id: 'hoodie', name: 'Hoodies', single: 'Hoodie', drawing: 'hoodie',
    technicalLabel: ['Pullover', 'Kangaroo pocket', 'Rib cuffs'],
    zones: { ...TOP, upper: { x: 158, y: 150, w: 40 }, center: { x: 200, y: 212, w: 100 }, hem: { x: 158, y: 292, w: 40 }, hemR: { x: 242, y: 292, w: 40 } },
  },
  {
    id: 'babytee', name: 'Baby tees', single: 'Baby tee', drawing: 'babytee',
    technicalLabel: ['Cropped', 'Fitted body', 'Rib collar'],
    zones: {
      chest: { x: 240, y: 168, w: 32 },
      upper: { x: 200, y: 158, w: 40 },
      center: { x: 200, y: 222, w: 80 },
      sleeveL: { x: 100, y: 172, w: 30, r: 40, tall: true },
      sleeveR: { x: 300, y: 172, w: 30, r: -40, tall: true },
      hem: { x: 152, y: 268, w: 32 },
      hemR: { x: 248, y: 268, w: 32 },
    },
  },
  {
    id: 'varsity', name: 'Varsity', single: 'Varsity', drawing: 'varsity', accent: '#0E1A47',
    technicalLabel: ['Custom body', 'Contrast sleeves', 'Rib knit trim'],
    zones: { ...TOP, chest: { x: 252, y: 168, w: 64 }, upper: { x: 150, y: 164, w: 50 }, center: { x: 200, y: 236, w: 104 }, hem: { x: 146, y: 296, w: 36 }, hemR: { x: 254, y: 296, w: 36 } },
  },
  {
    id: 'polo', name: 'Polos', single: 'Polo', drawing: 'polo',
    technicalLabel: ['Two-button placket', 'Knit collar', 'Side vents'],
    zones: { ...TEE, upper: { x: 150, y: 150, w: 38 }, center: { x: 200, y: 236, w: 104 } },
  },
  {
    id: 'jersey', name: 'Jerseys', single: 'Jersey', drawing: 'jersey', accent: '#0E1A47',
    technicalLabel: ['V-neck', 'Mesh side panels', 'Sleeve stripes'],
    zones: { ...TEE, upper: { x: 200, y: 172, w: 52 }, center: { x: 200, y: 244, w: 108 } },
  },
  {
    id: 'workwear', name: 'Workwear', single: 'Chore coat', drawing: 'workwear',
    technicalLabel: ['Chore coat', 'Patch pockets', 'Triple stitch'],
    zones: { ...TOP, chest: { x: 244, y: 159, w: 38 }, upper: { x: 152, y: 162, w: 44 }, center: { x: 200, y: 208, w: 56 }, hem: { x: 153, y: 271, w: 48 }, hemR: { x: 247, y: 271, w: 48 } },
  },
  {
    id: 'crewneck', name: 'Crewnecks', single: 'Crewneck', drawing: 'crewneck',
    technicalLabel: ['Set-in sleeves', 'Rib hem', 'Crew collar'],
    zones: TOP,
  },
  {
    id: 'quarterzip', name: 'Quarter-zips', single: 'Quarter-zip', drawing: 'quarterzip',
    technicalLabel: ['Mock neck', 'Quarter zip', 'Rib hem'],
    zones: { ...TOP, upper: { x: 150, y: 150, w: 42 }, center: { x: 200, y: 236, w: 108 } },
  },
  {
    id: 'buttondown', name: 'Button-downs', single: 'Button-down', drawing: 'buttondown',
    technicalLabel: ['Button-down collar', 'Chest pocket', 'Shirttail hem'],
    zones: { ...TOP, chest: { x: 244, y: 172, w: 32 }, upper: { x: 152, y: 158, w: 42 }, center: { x: 152, y: 236, w: 60 }, hem: { x: 152, y: 300, w: 42 }, hemR: { x: 248, y: 262, w: 52 } },
  },
  {
    id: 'shorts', name: 'Shorts', single: 'Shorts', drawing: 'shorts',
    technicalLabel: ['Elastic waist', 'Drawcord', 'Side pockets'],
    zones: {
      chest: { x: 252, y: 176, w: 36 },
      hem: { x: 146, y: 240, w: 44 },
      hemR: { x: 256, y: 244, w: 40 },
      upper: { x: 200, y: 122, w: 48 },
      sleeveL: { x: 118, y: 208, w: 64, r: 8, tall: true },
      sleeveR: { x: 282, y: 208, w: 64, r: -8, tall: true },
    },
  },
  {
    id: 'cap', name: 'Caps', single: 'Cap', drawing: 'cap',
    technicalLabel: ['Six panel', 'Curved visor', 'Structured crown'],
    zones: {
      center: { x: 206, y: 196, w: 82 },
      chest: { x: 142, y: 214, w: 30 },
      hem: { x: 270, y: 222, w: 26 },
    },
  },
  {
    id: 'robe', name: 'Robes', single: 'Robe', drawing: 'robe',
    technicalLabel: ['Shawl collar', 'Belted', 'Wide sleeves'],
    zones: {
      chest: { x: 250, y: 144, w: 38 },
      upper: { x: 150, y: 150, w: 32 },
      center: { x: 250, y: 290, w: 60 },
      sleeveL: { x: 76, y: 160, w: 60, r: 30, tall: true },
      sleeveR: { x: 324, y: 160, w: 60, r: -30, tall: true },
      hem: { x: 150, y: 306, w: 44 },
          },
  },
  // Index-only from here: reachable from VIEW ALL, not crowding the canvas.
  { id: 'tee', name: 'Tees', single: 'Tee', drawing: 'tee', technicalLabel: ['Crew neck', 'Short sleeve', 'Straight hem'], zones: TEE },
  { id: 'longsleeve', name: 'Long sleeves', single: 'Long sleeve', drawing: 'longsleeve', technicalLabel: ['Crew neck', 'Long sleeve', 'Straight hem'], zones: TOP },
  {
    id: 'jacket', name: 'Jackets', single: 'Jacket', drawing: 'jacket',
    technicalLabel: ['Notch collar', 'Snap front', 'Welt pockets'],
    zones: { ...TOP, center: { x: 150, y: 200, w: 56 }, upper: { x: 152, y: 150, w: 36 } },
  },
  {
    id: 'sweatpants', name: 'Sweatpants', single: 'Sweatpants', drawing: 'pants',
    technicalLabel: ['Elastic waist', 'Tapered leg', 'Cuffed'],
    zones: {
      chest: { x: 250, y: 130, w: 30 },
      hem: { x: 150, y: 300, w: 30 },
      sleeveL: { x: 134, y: 212, w: 90, r: 3, tall: true },
      sleeveR: { x: 266, y: 212, w: 90, r: -3, tall: true },
    },
  },
  {
    id: 'dress', name: 'Dresses', single: 'Dress', drawing: 'dress',
    technicalLabel: ['Slip straps', 'A-line skirt', 'Waist seam'],
    zones: { chest: { x: 222, y: 152, w: 26 }, center: { x: 200, y: 262, w: 96 }, hem: { x: 150, y: 324, w: 30 } },
  },
  {
    id: 'beanie', name: 'Beanies', single: 'Beanie', drawing: 'beanie',
    technicalLabel: ['Rib knit', 'Fold-over cuff'],
    zones: { center: { x: 200, y: 264, w: 44 }, upper: { x: 200, y: 178, w: 40 } },
  },
  {
    id: 'tote', name: 'Totes', single: 'Tote', drawing: 'tote',
    technicalLabel: ['Canvas', 'Long handles', 'Flat base'],
    zones: { center: { x: 200, y: 250, w: 110 }, chest: { x: 256, y: 204, w: 34 }, hem: { x: 146, y: 306, w: 30 } },
  },
];

/** How many garments sit on the canvas; the rest wait in the index. */
export const CANVAS_GARMENTS = 12;

// ── techniques ───────────────────────────────────────────────────────────────

/**
 * How a technique arrives on the garment. Each engine borrows the physical
 * behaviour of the process: thread traces, a squeegee sweeps, a patch lands.
 */
export type Engine =
  | 'stitch'   // embroidery: thread traces itself in
  | 'puff'     // puff: rises into relief
  | 'sweep'    // screen print: a squeegee pass reveals the ink
  | 'slap'     // patch: dropped on, slightly crooked, settles
  | 'foil'     // foil: a narrow light sweeps across
  | 'erode'    // distress: the print loses pieces
  | 'press'    // deboss: pressed into the cloth
  | 'metal'    // metallic ink: light tracks the cursor
  | 'scan'     // DTG: printed in passes, top to bottom
  | 'glint'    // rhinestones: set stone by stone, then catch the light
  | 'burn'     // laser etch: a hot point draws the line
  | 'dye'      // tie-dye: colour blooms through the cloth
  | 'sublimate'// sublimation: colour spreads through the whole piece
  | 'wash'     // wash: the cloth mottles
  | 'flood';   // all-over: the print escapes the print area

/** Artwork drawn for the demo, in a 100×100 box. See `art.tsx`. */
export type ArtId =
  | 'daisy' | 'bubble' | 'sunset' | 'badge' | 'crest' | 'athletic' | 'seal'
  | 'star' | 'photo' | 'numerals' | 'sleeve' | 'heart' | 'etch' | 'letter' | 'discharge' | 'twill';

export type Technique = {
  id: string;
  /** The invitation: PUFF IT. */
  verb: string;
  /** The process, in small type under the verb. */
  technical: string;
  /** Marks sit in a zone; cloth treatments cover the whole piece. */
  layer: 'mark' | 'cloth';
  engine: Engine;
  art?: ArtId;
  /** Material colour of the mark. */
  color?: string;
  /** Zones to try, in order. The first free one on the garment wins. */
  zones?: ZoneId[];
  /** A process note that shows up as the piece gets busier. */
  microcopy: string;
};

export const TECHNIQUES: Technique[] = [
  { id: 'embroidery', verb: 'Embroider it', technical: 'Embroidery', layer: 'mark', engine: 'stitch', art: 'daisy', color: '#2B5BD7', zones: ['chest', 'upper', 'hem', 'hemR', 'center'], microcopy: 'Satin + fill stitch' },
  { id: 'puff', verb: 'Puff it', technical: '3D puff embroidery', layer: 'mark', engine: 'puff', art: 'bubble', color: '#F4F1EA', zones: ['center', 'upper', 'hem', 'hemR', 'chest'], microcopy: 'Puff / foam underlay' },
  { id: 'print', verb: 'Print it', technical: 'Screen printing', layer: 'mark', engine: 'sweep', art: 'sunset', color: '#0E1A47', zones: ['center', 'upper', 'hem', 'hemR', 'chest'], microcopy: 'Screen / 2 colour' },
  { id: 'patch', verb: 'Patch it', technical: 'Woven patches', layer: 'mark', engine: 'slap', art: 'badge', color: '#0E1A47', zones: ['hem', 'hemR', 'chest', 'upper', 'center'], microcopy: 'Merrowed edge' },
  { id: 'foil', verb: 'Foil it', technical: 'Foil print', layer: 'mark', engine: 'foil', art: 'crest', color: '#C9A544', zones: ['upper', 'chest', 'center', 'hem'], microcopy: 'Heat-pressed foil' },
  { id: 'distress', verb: 'Distress it', technical: 'Distressed print', layer: 'mark', engine: 'erode', art: 'athletic', color: '#0E1A47', zones: ['center', 'upper', 'hem', 'hemR', 'chest'], microcopy: 'Cracked / worn in' },
  { id: 'dye', verb: 'Dye it', technical: 'Tie-dye', layer: 'cloth', engine: 'dye', microcopy: 'Garment dyed' },
  { id: 'applique', verb: 'Appliqué it', technical: 'Appliqué', layer: 'mark', engine: 'stitch', art: 'numerals', color: '#2B5BD7', zones: ['center', 'upper', 'hem', 'hemR', 'chest'], microcopy: 'Zigzag edge' },
  { id: 'sublimate', verb: 'Sublimate it', technical: 'Sublimation', layer: 'cloth', engine: 'sublimate', microcopy: 'Dye in the fibre' },
  { id: 'wash', verb: 'Wash it', technical: 'Vintage wash', layer: 'cloth', engine: 'wash', microcopy: 'Enzyme wash' },
  { id: 'metallic', verb: 'Metallic', technical: 'Metallic ink', layer: 'mark', engine: 'metal', art: 'star', color: '#B8BCC4', zones: ['chest', 'upper', 'hem', 'hemR', 'center'], microcopy: 'Metallic ink' },
  { id: 'allover', verb: 'All-over', technical: 'All-over print', layer: 'cloth', engine: 'flood', microcopy: 'Edge to edge' },
  // Behind "+ MORE" and in the index.
  { id: 'dtg', verb: 'DTG', technical: 'Direct-to-garment', layer: 'mark', engine: 'scan', art: 'photo', zones: ['center', 'upper', 'hem', 'hemR', 'chest'], microcopy: 'Full colour' },
  { id: 'deboss', verb: 'Deboss it', technical: 'Debossing', layer: 'mark', engine: 'press', art: 'seal', zones: ['chest', 'upper', 'hem', 'hemR', 'center'], microcopy: 'Pressed in' },
  { id: 'sleeve', verb: 'Sleeve it', technical: 'Sleeve print', layer: 'mark', engine: 'sweep', art: 'sleeve', color: '#0E1A47', zones: ['sleeveL', 'sleeveR'], microcopy: 'Extra locations included' },
  { id: 'rhinestone', verb: 'Rhinestone it', technical: 'Rhinestones', layer: 'mark', engine: 'glint', art: 'heart', color: '#E9ECF2', zones: ['hem', 'hemR', 'chest', 'upper', 'center'], microcopy: 'Set by hand' },
  { id: 'etch', verb: 'Etch it', technical: 'Laser etch', layer: 'mark', engine: 'burn', art: 'etch', color: '#6B5A45', zones: ['upper', 'center', 'hem', 'hemR', 'chest'], microcopy: 'Laser / no ink' },
  { id: 'chenille', verb: 'Chenille it', technical: 'Chenille patches', layer: 'mark', engine: 'slap', art: 'letter', color: '#2B5BD7', zones: ['chest', 'hem', 'hemR', 'upper', 'center'], microcopy: 'Chenille / felt backing' },
  { id: 'discharge', verb: 'Discharge it', technical: 'Discharge printing', layer: 'mark', engine: 'sweep', art: 'discharge', color: '#FBF8F1', zones: ['upper', 'center', 'hem', 'hemR', 'chest'], microcopy: 'Ink lifts the dye' },
  { id: 'twill', verb: 'Twill it', technical: 'Tackle twill', layer: 'mark', engine: 'stitch', art: 'twill', color: '#0E1A47', zones: ['center', 'upper', 'hem', 'hemR', 'chest'], microcopy: 'Layered twill' },
];

/** How many techniques sit on the canvas; the rest wait behind "+ MORE". */
export const CANVAS_TECHNIQUES = 12;

// ── copy ─────────────────────────────────────────────────────────────────────

/**
 * Section copy. `now` is the phase-two headline; the brief's harder version is
 * "Now f*** with it." and is a one-word change here if the brand wants it.
 */
export const STUDIO_COPY = {
  eyebrow: 'The studio / 003',
  eyebrowRight: 'What we make / How we make it',
  headline: ['Pick a piece.', 'Make it yours.'],
  script: 'Go nuts.',
  what: { n: '01', label: 'What', line: 'Choose what we’re making.' },
  how: { n: '02', label: 'How', line: 'Then mess with it.' },
  now: ['Now', 'mess with it.'],
  lazy: 'Feeling lazy?',
  surprise: 'Surprise me',
  surprised: 'There. Better.',
  reset: 'Burn it. Start again.',
  okay: 'Okay…',
  piece: 'That’s a piece.',
  want: 'Want to actually make it?',
  cta: 'Start a project',
  youPicked: 'You picked',
  canMake: ['We can actually', 'make this.'],
  ctaProject: 'Start this project',
  closing: {
    eyebrow: 'Still don’t see it?',
    big: 'Good.',
    script: 'Those are our favorite ones.',
    body: 'If you can describe it, sketch it, screenshot it or dream it up, we’ll figure out how to make it. Decoration included, like everything else.',
    cta: 'Make something we haven’t',
  },
} as const;
