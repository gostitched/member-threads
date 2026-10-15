/**
 * The Mitzvah Studio's pieces, held here rather than in the dashboard.
 *
 * The Studio sells collections, not SKUs: every piece below is a starting point a
 * designer builds on (fabric, color, fit, decoration), and every price is a
 * "from" number that lives inside one collection price. Pieces with no `pricing`
 * render as "Priced inside your collection".
 *
 * There are no photographs yet, on purpose: `images` stays empty and GarmentArt
 * draws each piece in its colourways. Set `CATALOG_SOURCE=live` to read the
 * dashboard instead (see api.ts).
 */

import type { Catalog, CatalogProduct, Colorway } from './types';

const UPDATED = '2026-09-01T00:00:00.000Z';

/** Youth XS through adult 2XL: how a Mitzvah guest list actually sizes. */
const GUEST_SIZES = ['YXS', 'YS', 'YM', 'YL', 'YXL', 'S', 'M', 'L', 'XL', '2XL'].map((code) => ({ code }));
const ADULT_SIZES = ['S', 'M', 'L', 'XL', '2XL'].map((code) => ({ code }));

const cw = (name: string, hex: string): Colorway => ({ name, hex, pantone: null, moq: null });
const from = (dollars: number) => ({ mode: 'starting_at' as const, startingAtCents: dollars * 100, currency: 'USD' });

/** Everything a piece shares, so each entry below is only what makes it that piece. */
function piece(p: Partial<CatalogProduct> & Pick<CatalogProduct, 'slug' | 'name' | 'category'>): CatalogProduct {
  return {
    styleNumber: null,
    description: null,
    fabric: null,
    fit: null,
    gsm: null,
    careInstructions: 'Wash cold, inside out. Hang dry.',
    countryOfOrigin: null,
    sustainabilityNotes: null,
    decorationMethods: [],
    sizeMode: 'sized',
    sizes: GUEST_SIZES,
    sizeChart: {},
    sizeChartUnit: 'in',
    colorways: [],
    minimumOrderQuantity: null,
    moqPerColorway: null,
    leadTimeDays: null,
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

const PRODUCTS: CatalogProduct[] = [
  // ── featured: the three pieces a collection is usually built around ────────
  piece({
    slug: 'heavyweight-hoodie',
    name: 'Heavyweight Hoodie',
    styleNumber: 'TMS-01',
    category: 'Hoodies & crewnecks',
    isFeatured: true,
    sticker: "The one they'll actually wear",
    description:
      'The anchor of most collections. A 420 GSM brushed-back fleece, cut oversized with a dropped shoulder, in a color we dye to match the event.\n\n' +
      'Contrast rib at the cuffs and hem, a lined hood, a custom zipper pull if you want one, their name in chenille or satin script, and a woven label inside the neck. It is meant to be worn for years, not packed away after the party.',
    fabric: 'Brushed-back cotton fleece',
    gsm: 420,
    fit: 'Oversized, dropped shoulder',
    decorationMethods: ['Chenille appliqué', 'Embroidery', 'Puff print', 'Woven neck label', 'Custom zipper pull'],
    colorways: [cw('Cream', '#FFF3CF'), cw('Navy', '#141B66'), cw('Sky', '#59C8FF'), cw('Kelly', '#0FA958')],
    tags: ['oversized', 'contrast rib', 'chenille', 'guest piece'],
    pricing: from(65),
  }),
  piece({
    slug: 'pajama-pants',
    name: 'Pajama Pants',
    styleNumber: 'TMS-02',
    category: 'Bottoms',
    isFeatured: true,
    sticker: 'After-party approved',
    description:
      'Soft brushed flannel with the event art in the pattern itself: their monogram, the date, a crest, a palm, whatever the collection is built on, repeated as a check or an all-over print.\n\n' +
      'Drawcord waist, side pockets, a woven tab at the hip. The piece every guest changes into the minute they get home.',
    fabric: 'Brushed cotton flannel',
    gsm: 170,
    fit: 'Relaxed, drawcord waist',
    decorationMethods: ['Custom all-over print', 'Jacquard', 'Embroidery', 'Woven tab'],
    colorways: [cw('Sky', '#59C8FF'), cw('Navy', '#141B66'), cw('Blush', '#FFC2DD'), cw('Kelly', '#0FA958')],
    tags: ['event artwork', 'pattern', 'sleepover'],
    pricing: from(35),
  }),
  piece({
    slug: 'racing-jersey',
    name: 'Racing Jersey',
    styleNumber: 'TMS-03',
    category: 'Jerseys',
    isFeatured: true,
    sticker: 'Pick your number',
    description:
      'Vintage racing, hockey or basketball cut, in a mesh or interlock that moves on the dance floor. Their name across the back, every guest gets a number.\n\n' +
      'Twill numbers, contrast striping and sponsor-style patches built from the event: the date, the city, the inside jokes.',
    fabric: 'Athletic interlock or mesh',
    gsm: 180,
    fit: 'Boxy, racing, hockey or basketball cut',
    decorationMethods: ['Tackle twill', 'Screen printing', 'Woven patches', 'Embroidery'],
    colorways: [cw('Cherry', '#FF2F2F'), cw('Black', '#111014'), cw('White', '#FAFAF7'), cw('Silver', '#C9CDD4')],
    tags: ['numbered', 'racing', 'hockey', 'basketball'],
    pricing: from(35),
  }),

  // ── the rest of the rack ─────────────────────────────────────────────────
  piece({
    slug: 'sweatpants',
    name: 'Sweatpants',
    styleNumber: 'TMS-04',
    category: 'Bottoms',
    sticker: 'Matches the hoodie',
    description:
      'Built to pair with the hoodie: the same fleece, the same dyed color, a straight leg with a rib cuff. Puff print or embroidery down one leg, their initials on the hip.',
    fabric: 'Brushed-back cotton fleece',
    gsm: 380,
    fit: 'Relaxed, straight leg, rib cuff',
    decorationMethods: ['Puff print', 'Embroidery', 'Screen printing'],
    colorways: [cw('Cream', '#FFF3CF'), cw('Navy', '#141B66'), cw('Heather', '#B9B6AE'), cw('Sky', '#59C8FF')],
    tags: ['matching', 'fleece'],
    pricing: from(40),
  }),
  piece({
    slug: 'heavyweight-tee',
    name: 'Heavyweight Tee',
    styleNumber: 'TMS-05',
    category: 'Tees & tanks',
    description:
      'A boxy, heavyweight cotton tee with a thick rib neck. Vintage-wash on request, so it feels like it has been in their closet for years.',
    fabric: 'Combed cotton jersey',
    gsm: 240,
    fit: 'Boxy, slightly cropped',
    decorationMethods: ['Screen printing', 'Puff print', 'Embroidery'],
    colorways: [cw('White', '#FAFAF7'), cw('Cream', '#FFF3CF'), cw('Lemon', '#FFE600'), cw('Kelly', '#0FA958')],
    tags: ['vintage wash', 'guest piece'],
    pricing: from(25),
  }),
  piece({
    slug: 'baby-tee',
    name: 'Baby Tee',
    styleNumber: 'TMS-06',
    category: 'Tees & tanks',
    sticker: 'Friends section',
    description:
      'Fitted, cropped and soft, in a color matched to the Pantone of the event. Usually half of a matching set with the foldover short.',
    fabric: 'Cotton-modal rib',
    gsm: 200,
    fit: 'Fitted, cropped',
    decorationMethods: ['Puff print', 'Embroidery', 'Rhinestones'],
    colorways: [cw('Sky', '#59C8FF'), cw('Lemon', '#FFE600'), cw('Blush', '#FFC2DD'), cw('White', '#FAFAF7')],
    tags: ['pantone match', 'matching set'],
    pricing: from(25),
  }),
  piece({
    slug: 'dance-floor-hat',
    name: 'Dance-Floor Hat',
    styleNumber: 'TMS-07',
    category: 'Hats',
    sticker: 'Rope brim',
    description:
      'The hat that comes out when the DJ does. A rope-brim cap, a foam trucker or a washed bucket, with the event mark in puff embroidery on the front.',
    fabric: 'Washed cotton twill',
    gsm: 280,
    fit: 'Rope-brim, trucker or bucket',
    sizeMode: 'one_size',
    sizes: [],
    decorationMethods: ['Puff embroidery', 'Embroidery', 'Woven patches'],
    colorways: [cw('Cream & navy', '#FFF3CF'), cw('Navy', '#141B66'), cw('Kelly', '#0FA958'), cw('Sky', '#59C8FF')],
    tags: ['rope brim', 'trucker', 'bucket', 'dance floor'],
    pricing: from(25),
  }),

  // ── priced inside your collection ───────────────────────────────────────
  piece({
    slug: 'heavyweight-crewneck',
    name: 'Heavyweight Crewneck',
    styleNumber: 'TMS-08',
    category: 'Hoodies & crewnecks',
    description:
      'Vintage country-club crewneck in heavyweight fleece, with a varsity rib collar and a chenille crest on the chest.',
    fabric: 'Brushed-back cotton fleece',
    gsm: 400,
    fit: 'Relaxed, set-in sleeve',
    decorationMethods: ['Chenille appliqué', 'Embroidery', 'Screen printing'],
    colorways: [cw('Kelly', '#0FA958'), cw('Cream', '#FFF3CF'), cw('Navy', '#141B66')],
    tags: ['country club', 'crest'],
  }),
  piece({
    slug: 'varsity-jacket',
    name: 'Varsity Jacket',
    styleNumber: 'TMS-09',
    category: 'Hoodies & crewnecks',
    sticker: 'Family only',
    description:
      'Wool body, contrast sleeves, striped rib and snaps, with chenille letters and their name in satin script across the back. Usually a family piece, or for the closest friends.',
    fabric: 'Melton wool body, contrast sleeves',
    gsm: null,
    fit: 'Classic varsity, snap front',
    sizes: ADULT_SIZES,
    careInstructions: 'Dry clean only.',
    decorationMethods: ['Chenille appliqué', 'Satin script embroidery', 'Woven neck label'],
    colorways: [cw('Navy', '#141B66'), cw('Kelly', '#0FA958'), cw('Cherry', '#FF2F2F')],
    tags: ['family', 'chenille letters'],
  }),
  piece({
    slug: 'foldover-short',
    name: 'Foldover Short',
    styleNumber: 'TMS-10',
    category: 'Bottoms',
    description:
      'A soft foldover-waist short, made to go with the baby tee as a set. Dyed to the same Pantone so the two read as one look.',
    fabric: 'Cotton-modal French terry',
    gsm: 240,
    fit: 'Relaxed, foldover waist',
    decorationMethods: ['Embroidery', 'Puff print'],
    colorways: [cw('Sky', '#59C8FF'), cw('Blush', '#FFC2DD'), cw('Oat', '#E9E0C8')],
    tags: ['matching set', 'pantone match'],
  }),
  piece({
    slug: 'ribbed-tank',
    name: 'Ribbed Tank',
    styleNumber: 'TMS-11',
    category: 'Tees & tanks',
    description: 'A fitted rib tank for the pool day or the morning after, with a tiny embroidered mark at the neckline.',
    fabric: 'Cotton rib',
    gsm: 190,
    fit: 'Fitted',
    decorationMethods: ['Embroidery', 'Screen printing'],
    colorways: [cw('White', '#FAFAF7'), cw('Blush', '#FFC2DD'), cw('Sky', '#59C8FF')],
    tags: ['pool day'],
  }),
  piece({
    slug: 'matching-set',
    name: 'Matching Set',
    styleNumber: 'TMS-12',
    category: 'Sets',
    sticker: 'For the best friends',
    description:
      'Two pieces designed as one look: a baby tee and foldover short, or a hoodie and sweatpant, in one Pantone-matched color. Most families make these for the special-friend list.',
    fabric: 'Matched to the pieces in the set',
    fit: 'Per piece',
    decorationMethods: ['Embroidery', 'Puff print', 'Chenille appliqué'],
    colorways: [cw('Sky', '#59C8FF'), cw('Lemon', '#FFE600'), cw('Blush', '#FFC2DD'), cw('Cream', '#FFF3CF')],
    tags: ['baby tee', 'friends section', 'color matched'],
  }),
  piece({
    slug: 'canvas-tote',
    name: 'Canvas Tote',
    styleNumber: 'TMS-13',
    category: 'Bags & packaging',
    description:
      'Heavy canvas, long handles, the collection mark embroidered or printed on the front. Carries the rest of the pieces home.',
    fabric: 'Cotton canvas',
    gsm: 340,
    fit: 'Open top, long handles',
    sizeMode: 'one_size',
    sizes: [],
    decorationMethods: ['Embroidery', 'Screen printing'],
    colorways: [cw('Natural', '#ECE4D3'), cw('Navy', '#141B66'), cw('Kelly', '#0FA958')],
    tags: ['carry-all'],
  }),
  piece({
    slug: 'custom-packaging',
    name: 'Custom Packaging',
    styleNumber: 'TMS-14',
    category: 'Bags & packaging',
    sticker: 'Unboxing included',
    description:
      'Every guest piece arrives folded in its own box or pouch, with a printed tag, tissue and a ribbon in the event colors. Delivered sorted, ready to set out at the venue.',
    fabric: 'Rigid board, printed tissue, ribbon',
    fit: 'Sized to the pieces inside',
    sizeMode: 'one_size',
    sizes: [],
    careInstructions: null,
    decorationMethods: ['Foil stamp', 'Printed tag', 'Custom ribbon'],
    colorways: [cw('Cream', '#FFF3CF'), cw('Navy', '#141B66'), cw('Sky', '#59C8FF')],
    tags: ['box', 'guest table'],
  }),
];

export const LOCAL_CATALOG: Catalog = {
  source: 'live',
  brand: { slug: 'the-mitzvah-studio', displayName: 'The Mitzvah Studio' },
  products: PRODUCTS,
};
