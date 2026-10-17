/**
 * Site content for Member Threads.
 *
 * Member Threads makes retail-quality custom apparel collections for
 * organizations: university clubs, companies, nonprofits, teams and fitness
 * clubs, social clubs and associations. Customers start from a curated
 * catalog and customize colors, fabric, fit, graphics and embroidery. Orders
 * start at 36 pieces per style. Member Threads operates under Stitched Group,
 * which runs production, sourcing, QC and logistics; credit it once per page
 * at most.
 *
 * Voice: an apparel partner, not a promo-products distributor. Confident,
 * plain, specific; sell the collection, never the single shirt. Name the
 * craft. No exclamation points. Never state a fact that isn't true of the
 * business; anything marked [CONFIRM] is listed in README "Before launch".
 */

/** Public origin of this site. [CONFIRM] domain. */
export const SITE_URL = 'https://memberthreads.com';

/** Origin of the customer app that serves the intake form (Stitched's pipeline). */
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://app.gostitched.com';
/**
 * Member Threads's embed key (Stitched dashboard → Embed sites). Public by design:
 * it tells the dashboard which site is asking, so leads land under this brand and the
 * form only frames on this site's registered origins.
 */
export const EMBED_KEY = process.env.NEXT_PUBLIC_EMBED_KEY || 'emb_live_NGvIwbuofqui3d54tGp97zcJ';
export const REQUEST_FORM_URL = `${APP_URL}/embed/v1/form?embed=true&key=${encodeURIComponent(EMBED_KEY)}`;

/** [CONFIRM] inbox. */
export const CONTACT = { email: 'hello@memberthreads.com' };

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
  { href: '/#how', label: 'How it works' },
  { href: '/catalog', label: 'Catalog' },
  { href: '/work', label: 'Collections' },
  { href: '/about', label: 'About' },
];

/** The one header CTA. Static: personalisation lives in the chapter. */
export const NAV_CTA = { href: '/quote', label: 'Start a collection' };

/** Who we make collections for. Order is the display order. */
export const SEGMENTS = [
  {
    id: 'campus',
    label: 'University clubs',
    title: 'University clubs & student organizations',
    body: 'Recruitment drops, exec board pieces and the hoodie everyone wears to the library.',
    pieces: ['Hoodies', 'Crewnecks', 'Heavyweight tees', 'Quarter-zips', 'Hats'],
  },
  {
    id: 'company',
    label: 'Companies',
    title: 'Businesses & corporate teams',
    body: 'Onboarding kits, conference gear and team gifts that feel like a brand, not a booth.',
    pieces: ['Premium hoodies', 'Embroidered polos', 'Quarter-zips', 'Outerwear'],
  },
  {
    id: 'nonprofit',
    label: 'Nonprofits',
    title: 'Nonprofits, charities & fundraisers',
    body: 'Apparel that unifies volunteers, thanks supporters and sells well enough to fund the mission.',
    pieces: ['Graphic tees', 'Hoodies', 'Crewnecks', 'Event merch'],
  },
  {
    id: 'athletic',
    label: 'Teams & fitness',
    title: 'Sports teams, run clubs & fitness studios',
    body: 'Off-field lifestyle pieces for the people who show up every week.',
    pieces: ['Athletic tees', 'Shorts', 'Hoodies', 'Polos', 'Hats'],
  },
  {
    id: 'social',
    label: 'Clubs & associations',
    title: 'Social clubs, alumni & associations',
    body: 'Quiet, embroidered pieces that signal membership to the people who know.',
    pieces: ['Embroidered crewnecks', 'Polos', 'Heavyweight hoodies', 'Seasonal collections'],
  },
] as const;


/** What the design engagement covers. Included in every collection. */
export const DESIGN_STEPS = [
  { n: '01', title: 'Tell us about your organization', body: 'Your logo, your colors, who it’s for and when you need it. A brand guide or a few screenshots is plenty.' },
  { n: '02', title: 'Meet your designer', body: 'One designer on our team owns the collection from first sketch to final proof.' },
  { n: '03', title: 'Revise together', body: 'Change the colors, the pieces, the artwork. Design is part of the collection, never billed by the hour.' },
  { n: '04', title: 'Approve it', body: 'You sign off on every piece and the full collection price before anything is made.' },
] as const;

/** Labelled rows: the pieces we make and the ways we finish them. */
export const CAPABILITIES = {
  garments: [
    'Heavyweight hoodies', 'Crewnecks', 'Heavyweight tees', 'Quarter-zips',
    'Polos', 'Sweatpants', 'Shorts', 'Hats', 'Rugbys', 'Varsity jackets',
    'Coach jackets', 'Vests', 'Long sleeves', 'Totes', 'Socks',
  ],
  decoration: [
    'Embroidery', '3D puff embroidery', 'Chenille appliqué', 'Tackle twill',
    'Woven neck labels', 'Custom zipper pulls', 'Pantone-matched dye',
    'Screen printing', 'Water-based ink', 'Puff print', 'Woven patches',
    'Garment dye', 'Custom hang tags', 'Debossed trims',
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

// [CONFIRM] 01 per-piece pricing, 03 lead time. See README.
export const FAQ: FaqItem[] = [
  {
    number: '01',
    question: 'What does a collection cost?',
    answer: 'One clear price per piece.',
    line: 'Cost comes down to the pieces you choose and how many of each. Every product in our catalog shows a starting price, so you can budget before you talk to us.',
  },
  {
    number: '02',
    question: 'Does customizing cost extra?',
    answer: 'No.',
    line: 'Embroidery, extra print locations, custom colors and design are built into one price, quoted up front. No setup fees, no surprise line items.',
  },
  {
    number: '03',
    question: 'What’s the minimum?',
    answer: '36 pieces per style.',
    line: 'Sizes can be mixed within a style. Most organizations order between 36 and 300 of each piece.',
  },
  {
    number: '04',
    question: 'How far out should we start?',
    answer: '6 to 8 weeks.',
    line: 'Design, sampling and production included. Have a hard date, like a recruitment week or a conference? Tell us first and we plan backward from it.',
  },
  {
    number: '05',
    question: 'Can we reorder?',
    answer: 'Anytime.',
    line: 'Every approved piece is saved to your organization, so next semester’s run or next year’s onboarding kit starts where the last one left off.',
  },
  {
    number: '06',
    question: 'Who actually makes it?',
    answer: 'We do.',
    line: 'Member Threads is part of Stitched Group, which runs our design, sourcing and production. No blanks with a logo pressed on.',
  },
];
