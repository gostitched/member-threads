/**
 * Site content for The Mitzvah Studio.
 *
 * The Mitzvah Studio designs and makes complete apparel collections for Bar,
 * Bat and B'nai Mitzvahs: heavyweight hoodies, sweatpants, pajama pants, baby
 * tees, jerseys, hats, sets, packaging. Stitched is the engine underneath
 * (production, sourcing, QC, logistics) and is credited once per page at most.
 *
 * Voice: sell the collection, never the single shirt. Name the craft. No
 * exclamation points. Never state a fact that isn't true of the business;
 * anything marked [CONFIRM] is listed in README "Before launch".
 */

/** Public origin of this site. [CONFIRM] domain. */
export const SITE_URL = 'https://themitzvahstudio.com';

/** Origin of the customer app that serves the intake form (Stitched's pipeline). */
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://app.gostitched.com';
/**
 * The Mitzvah Studio's embed key (Stitched dashboard → Embed sites). Public by design:
 * it tells the dashboard which site is asking, so leads land under this brand and the
 * form only frames on this site's registered origins.
 */
export const EMBED_KEY = process.env.NEXT_PUBLIC_EMBED_KEY || 'emb_live_NGvIwbuofqui3d54tGp97zcJ';
export const REQUEST_FORM_URL = `${APP_URL}/embed/v1/form?embed=true&key=${encodeURIComponent(EMBED_KEY)}`;

/** [CONFIRM] inbox. */
export const CONTACT = { email: 'hello@themitzvahstudio.com' };

/**
 * Background footage for the methods section.
 *
 * Empty by design. Drop a licensed clip at `public/video/manufacturing.mp4`
 * with a still at `public/video/manufacturing.jpg` and set both paths here.
 * See `public/video/README.md`.
 */
export const MEDIA = {
  methodsVideo: '',
  methodsPoster: '',
};

export const NAV = [
  { href: '/#how', label: 'How It Works' },
  { href: '/catalog', label: 'The Goods' },
  { href: '/work', label: 'Get Inspired' },
];

/** The one header CTA. Static: personalisation lives in the chapter. */
export const NAV_CTA = { href: '/quote', label: 'Start Creating' };


/** What the design engagement covers. Included in every collection. */
export const DESIGN_STEPS = [
  { n: '01', title: 'Tell us about the kid', body: 'Their colors, what they wear, the venue, the vibe. A planner’s deck or a few screenshots is plenty.' },
  { n: '02', title: 'Meet your designer', body: 'One designer on our team owns the collection from first sketch to final proof.' },
  { n: '03', title: 'Revise together', body: 'Change the colors, the pieces, the artwork. Design is part of the collection, never billed by the hour.' },
  { n: '04', title: 'Approve it', body: 'You sign off on every piece and the full collection price before anything is made.' },
] as const;

/** Labelled rows: the pieces we make and the ways we finish them. */
export const CAPABILITIES = {
  garments: [
    'Heavyweight hoodies', 'Sweatpants', 'Pajama pants', 'Baby tees', 'Tanks',
    'Jerseys', 'Hats', 'Shorts', 'Foldover shorts', 'Crewnecks', 'Matching sets',
    'Totes', 'Varsity jackets', 'Rugbys', 'Socks', 'Blankets', 'Robes',
  ],
  decoration: [
    'Chenille appliqué', 'Puff print', 'Embroidery', '3D puff embroidery',
    'Woven neck labels', 'Custom zipper pulls', 'Jacquard patterns',
    'Pantone-matched dye', 'Screen printing', 'Water-based ink', 'Satin script',
    'Tackle twill', 'Woven patches', 'All-over print', 'Rhinestones',
  ],
} as const;

/** Row labels for CAPABILITIES, in display order. */
export const CAPABILITY_ROWS = [
  { key: 'garments',   label: 'Pieces' },
  { key: 'decoration', label: 'Finishes' },
] as const;

/**
 * The FAQ (see `Faq`): four questions. `answer` is the one-glance answer set
 * large; `line` is the one plain sentence under it.
 */
export type FaqItem = {
  number: string;
  question: string;
  answer: string;
  line: string;
};

// [CONFIRM] 01 pricing range, 03 eight to twelve weeks, 04 per-product minimums. See README.
export const FAQ: FaqItem[] = [
  {
    number: '01',
    question: 'What does a collection cost?',
    answer: 'It depends on the order.',
    line: 'Cost comes down to the pieces you choose and how many of each. You can price any product in our catalog, and most collections land between $5k and $10k.',
  },
  {
    number: '02',
    question: 'Does customizing cost extra?',
    answer: 'No.',
    line: 'Embroidery, extra print spots, custom colors and design are all built into one clear price, quoted up front. What you see is what you pay, with no surprise fees added later.',
  },
  {
    number: '03',
    question: 'How far out should we start?',
    answer: '8 to 12 weeks.',
    line: 'Tighter dates are sometimes possible. Tell us yours and we check it first.',
  },
  {
    number: '04',
    question: 'Is there a minimum?',
    answer: 'It depends on the piece.',
    line: 'Each product in the catalog lists its own minimum. Under it? Reach out anyway and we’ll see what we can do.',
  },
  {
    number: '05',
    question: 'Who actually makes it?',
    answer: 'We do.',
    line: 'Made by Stitched, our own design and production team. No blanks with a logo pressed on.',
  },
];
