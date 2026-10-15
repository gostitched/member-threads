/**
 * Member Threads' catalog, held here rather than in the dashboard.
 *
 * Every style below is a foundation, not a finished SKU: an organization starts
 * from the established pattern and changes the color, fabric, fit, graphics,
 * embroidery and details. Minimum 36 pieces per style; sizes mix freely within it.
 *
 * Prices are per piece with design and decoration included, as a ladder at
 * 36 / 72 / 144 / 300 pieces. EVERY PRICE IS A PLACEHOLDER: each ladder is marked
 * [CONFIRM] and must be checked against real costing before launch. Size charts
 * are standard blank measurements, also [CONFIRM].
 *
 * There are no photographs yet, on purpose: `images` stays empty and GarmentArt
 * draws each piece in its colorways. Set `MT_CATALOG_SOURCE=live` to read the
 * dashboard instead (see api.ts).
 */

import type { Catalog, CatalogProduct, Colorway, PublicPricing } from './types';

const UPDATED = '2026-10-01T00:00:00.000Z';

/** Adult unisex XS through 3XL. */
const ADULT = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'].map((code) => ({ code }));

/** Matches site.ts: minimum 36 pieces per style. */
const MINIMUM = 36;
/** Matches site.ts FAQ: 6 to 8 weeks, design and sampling included. [CONFIRM] */
const LEAD = { min: 42, max: 56 };

const cw = (name: string, hex: string): Colorway => ({ name, hex, pantone: null, moq: null });

/** Realistic garment colors, shared so the same color reads the same across styles. */
const C = {
  heather: cw('Heather Grey', '#B9B7B1'),
  oatmeal: cw('Oatmeal Heather', '#D8CEBD'),
  cream: cw('Cream', '#ECE4D4'),
  white: cw('White', '#F5F3EE'),
  natural: cw('Natural', '#E6DCC6'),
  stone: cw('Stone', '#D2C6AE'),
  sand: cw('Sand', '#C9B596'),
  khaki: cw('Khaki', '#B3A07C'),
  olive: cw('Olive', '#55553A'),
  forest: cw('Forest', '#1F3D30'),
  navy: cw('Navy', '#1E2A3D'),
  slate: cw('Slate Blue', '#56677A'),
  burgundy: cw('Burgundy', '#5A2230'),
  charcoal: cw('Charcoal', '#3A3B3D'),
  black: cw('Black', '#1B1B1C'),
};

/**
 * One per-piece price ladder at 36 / 72 / 144 / 300, in whole dollars.
 * Decoration and design are included, so there is one price per quantity.
 */
const ladder = (at36: number, at72: number, at144: number, at300: number): PublicPricing => ({
  mode: 'full_breaks',
  breaks: [
    [36, at36],
    [72, at72],
    [144, at144],
    [300, at300],
  ].map(([minQuantity, dollars]) => ({ decorationMethod: null, minQuantity, unitPriceCents: dollars * 100, currency: 'USD' })),
});

// ── size charts (inches, measured flat) [CONFIRM all measurements] ───────────

type Chart = Record<string, Record<string, number>>;
const chart = (rows: Record<string, number[]>, sizes = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL']): Chart =>
  Object.fromEntries(sizes.map((s, i) => [s, Object.fromEntries(Object.entries(rows).map(([m, v]) => [m, v[i]]))]));

const FLEECE_CHART = chart({
  'Chest width': [21, 22.5, 24, 25.5, 27, 28.5, 30],
  'Body length': [26, 27, 28, 29, 30, 31, 32],
  'Sleeve length': [33, 34, 35, 36, 37, 37.5, 38],
});
const TEE_CHART = chart({
  'Chest width': [19.5, 21, 22.5, 24, 25.5, 27, 28.5],
  'Body length': [26, 27, 28, 29, 30, 31, 32],
  'Sleeve length': [8, 8.5, 9, 9.5, 10, 10.5, 11],
});
const LS_CHART = chart({
  'Chest width': [19.5, 21, 22.5, 24, 25.5, 27, 28.5],
  'Body length': [26, 27, 28, 29, 30, 31, 32],
  'Sleeve length': [32.5, 33.5, 34.5, 35.5, 36.5, 37, 37.5],
});
const POLO_CHART = chart({
  'Chest width': [19, 20.5, 22, 23.5, 25, 26.5, 28],
  'Body length': [26.5, 27.5, 28.5, 29.5, 30.5, 31.5, 32.5],
  'Sleeve length': [7.5, 8, 8.5, 9, 9.5, 10, 10.5],
});
const OUTER_CHART = chart({
  'Chest width': [21.5, 23, 24.5, 26, 27.5, 29, 30.5],
  'Body length': [26.5, 27.5, 28.5, 29.5, 30.5, 31.5, 32.5],
  'Sleeve length': [33, 34, 35, 36, 37, 37.5, 38],
});
const VEST_CHART = chart({
  'Chest width': [21.5, 23, 24.5, 26, 27.5, 29, 30.5],
  'Body length': [25.5, 26.5, 27.5, 28.5, 29.5, 30.5, 31.5],
});
const PANT_CHART = chart({
  'Waist, relaxed': [12.5, 13.5, 14.5, 15.5, 16.5, 17.5, 18.5],
  Inseam: [29, 30, 30.5, 31, 31.5, 32, 32],
  'Leg opening': [4.5, 4.75, 5, 5.25, 5.5, 5.75, 6],
});
const SHORT_CHART = chart({
  'Waist, relaxed': [12.5, 13.5, 14.5, 15.5, 16.5, 17.5, 18.5],
  Inseam: [6, 6, 6.5, 6.5, 7, 7, 7],
  'Leg opening': [11, 11.5, 12, 12.5, 13, 13.5, 14],
});

/** Everything a style shares, so each entry below is only what makes it that style. */
function style(p: Partial<CatalogProduct> & Pick<CatalogProduct, 'slug' | 'name' | 'category'>): CatalogProduct {
  return {
    styleNumber: null,
    description: null,
    fabric: null,
    fit: null,
    gsm: null,
    careInstructions: 'Machine wash cold, inside out. Tumble dry low.',
    countryOfOrigin: null,
    sustainabilityNotes: null,
    decorationMethods: [],
    sizeMode: 'sized',
    sizes: ADULT,
    sizeChart: {},
    sizeChartUnit: 'in',
    colorways: [],
    minimumOrderQuantity: MINIMUM,
    moqPerColorway: null,
    leadTimeDays: LEAD,
    sampleLeadTimeDays: null,
    tags: [],
    isFeatured: false,
    images: [],
    sizeGuideUrl: null,
    marketingImages: [],
    updatedAt: UPDATED,
    ...p,
  };
}

/** Segment tags, so search and the list read the way buyers describe themselves. */
const SEG = {
  campus: 'University clubs',
  company: 'Companies',
  nonprofit: 'Nonprofits',
  athletic: 'Teams & fitness',
  social: 'Clubs & associations',
};

const PRODUCTS: CatalogProduct[] = [
  // ── featured: the three styles most collections are built around ─────────
  style({
    slug: 'heavyweight-hoodie',
    name: 'Heavyweight Hoodie',
    styleNumber: 'MT-01',
    category: 'Fleece',
    isFeatured: true,
    description:
      'The piece most collections are built on. A dense brushed-back fleece with a relaxed body, a lined double-layer hood and ribbed cuffs and hem that hold their shape wash after wash.\n\n' +
      'Change the color, swap the drawcord and tips, add a contrast rib, then finish it with embroidery, chenille or a print. A woven neck label makes it read as yours, not a blank.',
    fabric: '80/20 cotton-poly brushed-back fleece',
    gsm: 400,
    fit: 'Relaxed, set-in sleeve',
    decorationMethods: ['Embroidery', 'Chenille appliqué', 'Screen printing', 'Puff print', 'Woven neck label'],
    colorways: [C.heather, C.forest, C.navy, C.cream, C.black],
    sizeChart: FLEECE_CHART,
    tags: ['fleece', 'hooded', SEG.campus, SEG.company, SEG.nonprofit, SEG.athletic, SEG.social],
    pricing: ladder(58, 52, 47, 43), // [CONFIRM] MT-01 prices
  }),
  style({
    slug: 'quarter-zip',
    name: 'Quarter-Zip Pullover',
    styleNumber: 'MT-02',
    category: 'Fleece',
    isFeatured: true,
    description:
      'A clean mid-layer for offices, sidelines and alumni weekends. Smooth-faced fleece outside, brushed inside, with a stand collar and a metal quarter zip.\n\n' +
      'Embroidery sits best here: a left-chest mark, a sleeve hit, a custom zipper pull in your color.',
    fabric: 'Cotton-poly double-face fleece',
    gsm: 340,
    fit: 'Classic, set-in sleeve',
    decorationMethods: ['Embroidery', 'Custom zipper pull', 'Woven neck label', 'Debossed trims'],
    colorways: [C.navy, C.heather, C.forest, C.oatmeal, C.black],
    sizeChart: FLEECE_CHART,
    tags: ['mid-layer', 'zip', SEG.company, SEG.social, SEG.athletic, SEG.campus],
    pricing: ladder(64, 58, 53, 49), // [CONFIRM] MT-02 prices
  }),
  style({
    slug: 'embroidered-polo',
    name: 'Embroidered Polo',
    styleNumber: 'MT-03',
    category: 'Polos & Rugbys',
    isFeatured: true,
    description:
      'A heavy cotton piqué polo with a knit collar, a two-button placket and a side-vented hem. The polo you wear to the club, the client dinner and the tournament.\n\n' +
      'Tipped collars, a contrast placket and a tonal or full-color embroidered mark are all part of the price.',
    fabric: '100% cotton piqué',
    gsm: 240,
    fit: 'Classic, side-vented hem',
    decorationMethods: ['Embroidery', 'Tipped collar', 'Woven neck label'],
    colorways: [C.white, C.navy, C.forest, C.black, C.burgundy],
    sizeChart: POLO_CHART,
    tags: ['piqué', 'collared', SEG.company, SEG.social, SEG.athletic],
    pricing: ladder(44, 40, 36, 33), // [CONFIRM] MT-03 prices
  }),

  // ── fleece ──────────────────────────────────────────────────────────────
  style({
    slug: 'heavyweight-crewneck',
    name: 'Heavyweight Crewneck',
    styleNumber: 'MT-04',
    category: 'Fleece',
    description:
      'A heavyweight crewneck in the same fleece as the hoodie, with a tall rib collar, a cover-stitched neck and a straight hem. Quiet enough for an embroidered crest, sturdy enough for chenille.',
    fabric: '80/20 cotton-poly brushed-back fleece',
    gsm: 400,
    fit: 'Relaxed, set-in sleeve',
    decorationMethods: ['Embroidery', 'Chenille appliqué', 'Screen printing', 'Woven neck label'],
    colorways: [C.oatmeal, C.forest, C.navy, C.burgundy, C.heather],
    sizeChart: FLEECE_CHART,
    tags: ['fleece', 'crest', SEG.social, SEG.campus, SEG.nonprofit],
    pricing: ladder(52, 47, 43, 39), // [CONFIRM] MT-04 prices
  }),

  // ── tees ────────────────────────────────────────────────────────────────
  style({
    slug: 'heavyweight-tee',
    name: 'Heavyweight Tee',
    styleNumber: 'MT-05',
    category: 'Tees',
    description:
      'A thick, structured cotton tee with a tight rib neck and a slightly boxy body. Garment-dyed on request, so it wears in rather than out.',
    fabric: '100% combed cotton jersey',
    gsm: 240,
    fit: 'Boxy, dropped shoulder',
    decorationMethods: ['Screen printing', 'Water-based ink', 'Puff print', 'Embroidery', 'Garment dye'],
    colorways: [C.white, C.cream, C.heather, C.forest, C.black],
    sizeChart: TEE_CHART,
    tags: ['cotton', SEG.campus, SEG.nonprofit, SEG.athletic, SEG.company],
    pricing: ladder(26, 23, 20, 18), // [CONFIRM] MT-05 prices
  }),
  style({
    slug: 'long-sleeve-tee',
    name: 'Long Sleeve Tee',
    styleNumber: 'MT-06',
    category: 'Tees',
    description:
      'The heavyweight tee with a full sleeve and rib cuffs. Room for a sleeve print or a running sleeve hit, which is most of the reason to choose it.',
    fabric: '100% combed cotton jersey',
    gsm: 240,
    fit: 'Boxy, rib cuff',
    decorationMethods: ['Screen printing', 'Water-based ink', 'Embroidery', 'Garment dye'],
    colorways: [C.white, C.navy, C.sand, C.charcoal],
    sizeChart: LS_CHART,
    tags: ['cotton', 'sleeve print', SEG.campus, SEG.athletic, SEG.nonprofit],
    pricing: ladder(32, 29, 26, 23), // [CONFIRM] MT-06 prices
  }),

  // ── polos & rugbys ──────────────────────────────────────────────────────
  style({
    slug: 'rugby-shirt',
    name: 'Rugby Shirt',
    styleNumber: 'MT-07',
    category: 'Polos & Rugbys',
    description:
      'A heavy jersey rugby with a woven twill collar, a rubber-button placket and reinforced side vents. Solid or hooped, in your colors.\n\n' +
      'An embroidered crest on the chest and a number or year on the sleeve make it a club piece.',
    fabric: '100% cotton heavy jersey, twill collar',
    gsm: 330,
    fit: 'Relaxed, side-vented hem',
    decorationMethods: ['Embroidery', 'Tackle twill', 'Woven patches', 'Custom stripe'],
    colorways: [C.navy, C.forest, C.burgundy, C.cream],
    sizeChart: OUTER_CHART,
    tags: ['collared', 'stripes', SEG.social, SEG.campus, SEG.athletic],
    pricing: ladder(72, 66, 60, 55), // [CONFIRM] MT-07 prices
  }),

  // ── outerwear ───────────────────────────────────────────────────────────
  style({
    slug: 'coach-jacket',
    name: 'Coach Jacket',
    styleNumber: 'MT-08',
    category: 'Outerwear',
    description:
      'A water-resistant nylon shell with a mesh lining, a snap front and a drawcord hem. Light enough for three seasons, with a large back panel for a print or a full embroidered mark.',
    fabric: 'Nylon taslan, water-resistant, mesh lined',
    gsm: null,
    fit: 'Classic, snap front, drawcord hem',
    decorationMethods: ['Screen printing', 'Embroidery', 'Woven neck label'],
    colorways: [C.black, C.navy, C.forest, C.khaki],
    sizeChart: OUTER_CHART,
    careInstructions: 'Machine wash cold. Hang dry.',
    tags: ['nylon', 'shell', SEG.athletic, SEG.company, SEG.campus],
    pricing: ladder(76, 69, 63, 58), // [CONFIRM] MT-08 prices
  }),
  style({
    slug: 'quilted-vest',
    name: 'Quilted Vest',
    styleNumber: 'MT-09',
    category: 'Outerwear',
    description:
      'A lightweight quilted vest with a stand collar, a full zip and zip hand pockets. Worn over a quarter-zip or an oxford, it is the corporate team piece that people keep.',
    fabric: 'Poly shell, synthetic insulation',
    gsm: null,
    fit: 'Classic, layering',
    decorationMethods: ['Embroidery', 'Custom zipper pull', 'Woven neck label'],
    colorways: [C.navy, C.black, C.olive, C.forest],
    sizeChart: VEST_CHART,
    careInstructions: 'Machine wash cold. Hang dry.',
    tags: ['quilted', 'layering', SEG.company, SEG.social],
    pricing: ladder(78, 71, 65, 60), // [CONFIRM] MT-09 prices
  }),

  // ── bottoms ─────────────────────────────────────────────────────────────
  style({
    slug: 'fleece-sweatpant',
    name: 'Fleece Sweatpant',
    styleNumber: 'MT-10',
    category: 'Bottoms',
    description:
      'Cut to pair with the hoodie: the same fleece and the same color, with a straight leg, a rib cuff, an elastic drawcord waist and a back patch pocket. Embroidery on the hip.',
    fabric: '80/20 cotton-poly brushed-back fleece',
    gsm: 380,
    fit: 'Relaxed, straight leg, rib cuff',
    decorationMethods: ['Embroidery', 'Screen printing', 'Puff print'],
    colorways: [C.heather, C.navy, C.forest, C.black],
    sizeChart: PANT_CHART,
    tags: ['fleece', 'matching set', SEG.athletic, SEG.campus],
    pricing: ladder(48, 43, 39, 36), // [CONFIRM] MT-10 prices
  }),
  style({
    slug: 'club-short',
    name: 'Club Short',
    styleNumber: 'MT-11',
    category: 'Bottoms',
    description:
      'A French terry short with a 6.5 inch inseam, an elastic drawcord waist and side pockets. The run-club and studio piece, made to match the tee.',
    fabric: 'Cotton French terry',
    gsm: 300,
    fit: 'Relaxed, 6.5" inseam', // [CONFIRM] inseam
    decorationMethods: ['Embroidery', 'Screen printing'],
    colorways: [C.heather, C.navy, C.black, C.cream],
    sizeChart: SHORT_CHART,
    tags: ['terry', 'run club', SEG.athletic, SEG.campus],
    pricing: ladder(38, 34, 31, 28), // [CONFIRM] MT-11 prices
  }),

  // ── headwear ────────────────────────────────────────────────────────────
  style({
    slug: 'dad-hat',
    name: 'Dad Hat',
    styleNumber: 'MT-12',
    category: 'Headwear',
    description:
      'An unstructured six-panel cap in washed cotton twill, with a curved brim and a self-fabric strap with a brass buckle. Low profile, broken in from the first wear.',
    fabric: 'Washed cotton twill',
    gsm: null,
    fit: 'Unstructured, low profile',
    sizeMode: 'one_size',
    sizes: [],
    careInstructions: 'Spot clean.',
    decorationMethods: ['Embroidery', '3D puff embroidery', 'Woven patches'],
    colorways: [C.stone, C.navy, C.forest, C.burgundy, C.black],
    tags: ['cap', 'six-panel', SEG.campus, SEG.athletic, SEG.social, SEG.nonprofit, SEG.company],
    pricing: ladder(28, 25, 22, 20), // [CONFIRM] MT-12 prices
  }),
  style({
    slug: 'five-panel-cap',
    name: 'Five-Panel Cap',
    styleNumber: 'MT-13',
    category: 'Headwear',
    description:
      'A flat-brim five-panel in nylon or cotton ripstop, with a seamless front panel built for a woven label or a single line of embroidery, and a quick-release strap.',
    fabric: 'Nylon or cotton ripstop',
    gsm: null,
    fit: 'Structured crown, flat brim',
    sizeMode: 'one_size',
    sizes: [],
    careInstructions: 'Spot clean.',
    decorationMethods: ['Embroidery', 'Woven patches', 'Screen printing'],
    colorways: [C.navy, C.black, C.khaki, C.forest],
    tags: ['cap', 'camp cap', 'run club', SEG.athletic, SEG.campus],
    pricing: ladder(30, 27, 24, 22), // [CONFIRM] MT-13 prices
  }),

  // ── bags ────────────────────────────────────────────────────────────────
  style({
    slug: 'canvas-tote',
    name: 'Canvas Tote',
    styleNumber: 'MT-14',
    category: 'Bags',
    description:
      'A heavy cotton canvas tote with long handles and a gusseted base. The welcome-kit and event piece that keeps going to the grocery store for years.',
    fabric: '100% cotton canvas',
    gsm: 340,
    fit: '16 × 15 × 4 in, long handles', // [CONFIRM] dimensions
    sizeMode: 'one_size',
    sizes: [],
    careInstructions: 'Spot clean or wash cold. Hang dry.',
    decorationMethods: ['Screen printing', 'Embroidery'],
    colorways: [C.natural, C.black, C.navy, C.forest],
    tags: ['bag', 'welcome kit', SEG.company, SEG.nonprofit, SEG.campus],
    pricing: ladder(22, 19, 17, 15), // [CONFIRM] MT-14 prices
  }),
];

export const LOCAL_CATALOG: Catalog = {
  source: 'live',
  brand: { slug: 'member-threads', displayName: 'Member Threads' },
  products: PRODUCTS,
};
