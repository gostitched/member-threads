/**
 * Member Threads photography manifest.
 *
 * These are licensed stock mood images (Unsplash License: free for commercial use,
 * no attribution required). They set the brand mood only. They are NOT Member Threads
 * customers, and none of the people, teams or garments shown are our clients or products.
 * Don't caption them as customer stories or case studies.
 *
 * Files: /public/photos/<slug>.webp, max 2400px long edge, WebP q78, metadata stripped.
 * Grade: every non-texture image got the same subtle house grade (blacks lifted ~6/255,
 * highlights rolled off ~3.5%, slight warm shift R x1.02 / B x0.965). Textures are ungraded.
 * Crops: craft-embroidery-machine-cap (top 12%, removes a machine maker's wordmark) and
 * craft-thread-cones (top 17%, removes a partial thread label).
 * Full credits: /public/photos/CREDITS.md
 */

export type PhotoRole = 'hero' | 'segment' | 'craft' | 'detail' | 'lifestyle' | 'texture';
export type PhotoSegment = 'campus' | 'company' | 'nonprofit' | 'athletic' | 'social';
/**
 * The image's overall brightness where text would sit.
 * 'light' = light image, so use dark (green/navy) text.
 * 'dark' = dark image, so use light (cream) text.
 * Add a scrim either way for long copy.
 */
export type PhotoTone = 'light' | 'dark';

export interface PhotoCredit {
  photographer: string;
  source: 'Unsplash' | 'Pexels';
  /** Photo page on the source site */
  url: string;
}

export interface Photo {
  src: `/photos/${string}.webp`;
  width: number;
  height: number;
  alt: string;
  role: PhotoRole;
  segment?: PhotoSegment;
  /** CSS object-position that keeps the subject in frame when cropped */
  objectPosition: string;
  tone: PhotoTone;
  credit: PhotoCredit;
}

export const PHOTOS = {
  'hero-field-trio': {
    src: '/photos/hero-field-trio.webp',
    width: 2400,
    height: 1600,
    alt: 'Three friends in soft heather-grey, mint and slate hoodies with matching sweat shorts, standing together in a golden grass meadow below rocky foothills',
    role: 'hero',
    objectPosition: '50% 62%',
    tone: 'light',
    credit: { photographer: 'Woody Kelly', source: 'Unsplash', url: 'https://unsplash.com/photos/a-group-of-three-women-standing-next-to-each-other-in-a-field-rp10UtEMtYg' },
  },
  'hero-field-trio-portrait': {
    src: '/photos/hero-field-trio-portrait.webp',
    width: 1600,
    height: 2400,
    alt: 'Three friends leaning into each other in a dry grass field, wearing relaxed grey, mint and slate fleece hoodies and sweats under an overcast sky',
    role: 'hero',
    objectPosition: '50% 55%',
    tone: 'light',
    credit: { photographer: 'Woody Kelly', source: 'Unsplash', url: 'https://unsplash.com/photos/three-people-standing-in-a-field-of-tall-grass-lGEDc-y-RZU' },
  },
  'hero-heritage-knits': {
    src: '/photos/hero-heritage-knits.webp',
    width: 2400,
    height: 1600,
    alt: 'Three young adults in heritage knitwear, a ribbed cardigan, cable sweater vest and crewneck with a sweater knotted over the shoulders, posed on a wooden ranch fence in late-afternoon light',
    role: 'hero',
    objectPosition: '50% 40%',
    tone: 'light',
    credit: { photographer: 'Christian Agbede', source: 'Unsplash', url: 'https://unsplash.com/photos/three-diverse-young-adults-posing-outdoors-together-outdoors-Hc1uHK6Jntg' },
  },
  'segment-campus-walk': {
    src: '/photos/segment-campus-walk.webp',
    width: 2400,
    height: 1347,
    alt: 'Five college friends laughing as they walk down a brick-lined sidewalk in jackets, sweaters and denim',
    role: 'segment',
    segment: 'campus',
    objectPosition: '55% 50%',
    tone: 'light',
    credit: { photographer: 'Eliott Reyna', source: 'Unsplash', url: 'https://unsplash.com/photos/three-men-and-laughing-two-women-walking-side-by-side-jCEpN62oWL4' },
  },
  'segment-company-coffee-team': {
    src: '/photos/segment-company-coffee-team.webp',
    width: 2400,
    height: 1600,
    alt: 'A small coffee-shop team gathered around a red espresso machine in a warm, plywood-walled room lit by bare bulbs',
    role: 'segment',
    segment: 'company',
    objectPosition: '55% 55%',
    tone: 'dark',
    credit: { photographer: 'Helena Lopes', source: 'Unsplash', url: 'https://unsplash.com/photos/man-in-white-dress-shirt-playing-guitar-4DYhHYpBR3c' },
  },
  'segment-nonprofit-cleanup': {
    src: '/photos/segment-nonprofit-cleanup.webp',
    width: 2400,
    height: 1350,
    alt: 'Five volunteers in matching light-blue T-shirts holding full trash bags after a cleanup in a birch forest',
    role: 'segment',
    segment: 'nonprofit',
    objectPosition: '50% 45%',
    tone: 'light',
    credit: { photographer: 'Vitaly Gariev', source: 'Unsplash', url: 'https://unsplash.com/photos/diverse-volunteers-holding-trash-bags-in-a-forest-OwLmtn2_Cmw' },
  },
  'segment-athletic-run-club': {
    src: '/photos/segment-athletic-run-club.webp',
    width: 1600,
    height: 2400,
    alt: 'A run club pack heading down a dusty road into hazy golden morning sun',
    role: 'segment',
    segment: 'athletic',
    objectPosition: '50% 45%',
    tone: 'light',
    credit: { photographer: 'Jefferson Sees', source: 'Unsplash', url: 'https://unsplash.com/photos/people-standing-on-gray-concrete-road-during-daytime-gilCd9_Jjv0' },
  },
  'segment-athletic-rowing': {
    src: '/photos/segment-athletic-rowing.webp',
    width: 2400,
    height: 1600,
    alt: 'A rowing eight silhouetted on calm water at dusk, oars feathered, with gold light reflected on the river',
    role: 'segment',
    segment: 'athletic',
    objectPosition: '55% 65%',
    tone: 'dark',
    credit: { photographer: 'Mitchell Luo', source: 'Unsplash', url: 'https://unsplash.com/photos/men-rowing-boat-H3htK85wwnU' },
  },
  'segment-social-lawn-bowls': {
    src: '/photos/segment-social-lawn-bowls.webp',
    width: 1678,
    height: 2400,
    alt: 'Three men dressed in club whites and bucket hats studying the bowls on a lawn-bowling green, seen from above',
    role: 'segment',
    segment: 'social',
    objectPosition: '45% 55%',
    tone: 'dark',
    credit: { photographer: 'Community Archives of Belleville and Hastings County', source: 'Unsplash', url: 'https://unsplash.com/photos/three-men-in-white-play-lawn-bowls-on-a-green-5h61VgPB0u4' },
  },
  'segment-social-garden-table': {
    src: '/photos/segment-social-garden-table.webp',
    width: 2400,
    height: 1802,
    alt: 'A group of friends sharing a long table under a sprawling old tree on a sunlit lawn',
    role: 'segment',
    segment: 'social',
    objectPosition: '50% 70%',
    tone: 'dark',
    credit: { photographer: 'Lucas Lemoine', source: 'Unsplash', url: 'https://unsplash.com/photos/people-gathered-around-a-table-under-a-large-tree-cB_jDhLuADs' },
  },
  'lifestyle-fence-pair': {
    src: '/photos/lifestyle-fence-pair.webp',
    width: 2400,
    height: 1600,
    alt: 'Two young men on a weathered wooden fence, one in a ribbed knit with a plaid scarf, the other in an oatmeal sweater with a black knit tied over his shoulders',
    role: 'lifestyle',
    objectPosition: '45% 45%',
    tone: 'light',
    credit: { photographer: 'Christian Agbede', source: 'Unsplash', url: 'https://unsplash.com/photos/two-men-sitting-on-a-wooden-fence-outdoors-IFgWxzLxF1s' },
  },
  'lifestyle-barn-walk': {
    src: '/photos/lifestyle-barn-walk.webp',
    width: 2400,
    height: 1601,
    alt: 'Four friends seen from behind walking a dirt lane alongside a long open barn and green pasture',
    role: 'lifestyle',
    objectPosition: '62% 60%',
    tone: 'light',
    credit: { photographer: 'Portraits of Modern Dairy', source: 'Unsplash', url: 'https://unsplash.com/photos/group-walking-beside-a-dairy-barn--qfaOBqgXzY' },
  },
  'lifestyle-sweatsuit-portrait': {
    src: '/photos/lifestyle-sweatsuit-portrait.webp',
    width: 1600,
    height: 2400,
    alt: 'A young woman crouching on sunlit grass in a matching pale-blue fleece hoodie and sweatpants, holding a sprig of lavender',
    role: 'lifestyle',
    objectPosition: '50% 40%',
    tone: 'light',
    credit: { photographer: 'Jadon Johnson', source: 'Unsplash', url: 'https://unsplash.com/photos/a-young-woman-in-a-blue-tracksuit-squats-in-grass-4Xh8twzRKcs' },
  },
  'craft-studio-cutting-table': {
    src: '/photos/craft-studio-cutting-table.webp',
    width: 2400,
    height: 1601,
    alt: 'A maker working at a large pattern-cutting table in a moody, window-lit studio, scissors and tools laid out on striped fabric',
    role: 'craft',
    objectPosition: '50% 55%',
    tone: 'dark',
    credit: { photographer: 'Metin Ozer', source: 'Unsplash', url: 'https://unsplash.com/photos/woman-working-on-a-large-paper-with-scissors-and-tools-fPmQNx7cf0E' },
  },
  'craft-cutting-fabric': {
    src: '/photos/craft-cutting-fabric.webp',
    width: 2400,
    height: 1602,
    alt: 'Hands cutting dark navy wool cloth with tailor shears beside a wooden measuring rule',
    role: 'craft',
    objectPosition: '45% 50%',
    tone: 'dark',
    credit: { photographer: 'SIL Group', source: 'Unsplash', url: 'https://unsplash.com/photos/a-person-cutting-a-piece-of-fabric-with-a-pair-of-scissors-oshVSMH6JZQ' },
  },
  'craft-embroidery-machine-cap': {
    src: '/photos/craft-embroidery-machine-cap.webp',
    width: 2400,
    height: 1408,
    alt: 'A cap clamped on a multi-needle embroidery machine, lit warmly in a dark workshop',
    role: 'craft',
    objectPosition: '45% 50%',
    tone: 'dark',
    credit: { photographer: 'ibh', source: 'Unsplash', url: 'https://unsplash.com/photos/a-machine-that-is-sitting-on-a-table-0R8guO8uJaI' },
  },
  'craft-thread-cones': {
    src: '/photos/craft-thread-cones.webp',
    width: 2168,
    height: 2400,
    alt: 'Close-up of thread cones in olive, moss, forest and chartreuse greens lying side by side',
    role: 'craft',
    objectPosition: '40% 50%',
    tone: 'dark',
    credit: { photographer: 'Victor Volkov', source: 'Unsplash', url: 'https://unsplash.com/photos/a-group-of-spools-of-thread-sitting-on-top-of-each-other-kfuLd8UCTFI' },
  },
  'craft-fabric-swatches': {
    src: '/photos/craft-fabric-swatches.webp',
    width: 1800,
    height: 2400,
    alt: 'Folded fabric swatches in oatmeal tweed, sage cotton and blue basketweave overlapping on a table',
    role: 'craft',
    objectPosition: '50% 50%',
    tone: 'light',
    credit: { photographer: 'Victor Volkov', source: 'Unsplash', url: 'https://unsplash.com/photos/a-close-up-of-several-different-colors-of-fabric-mPCCiE4vpzQ' },
  },
  'detail-chenille-numerals': {
    src: '/photos/detail-chenille-numerals.webp',
    width: 2400,
    height: 1800,
    alt: 'Macro of burgundy chenille varsity numerals stitched onto cream twill',
    role: 'detail',
    objectPosition: '55% 50%',
    tone: 'light',
    credit: { photographer: 'Ali Yasar isgoren', source: 'Unsplash', url: 'https://unsplash.com/photos/white-and-red-love-print-textile-nUjsTdVR6rM' },
  },
  'detail-folded-stack-warm': {
    src: '/photos/detail-folded-stack-warm.webp',
    width: 1600,
    height: 2400,
    alt: 'A tall stack of folded sweats and knits in espresso, rust, olive and cream, lit by low warm light',
    role: 'detail',
    objectPosition: '50% 55%',
    tone: 'dark',
    credit: { photographer: 'Katya Azimova', source: 'Unsplash', url: 'https://unsplash.com/photos/stack-of-folded-cozy-sweaters-in-neutral-colors-05O5v_aBkO0' },
  },
  'detail-knit-stack-window': {
    src: '/photos/detail-knit-stack-window.webp',
    width: 1600,
    height: 2400,
    alt: 'A stack of chunky knits in cream, grey, brown and forest green on a wooden stool against a sunlit wall with leaf shadows',
    role: 'detail',
    objectPosition: '40% 60%',
    tone: 'light',
    credit: { photographer: 'Storiès', source: 'Unsplash', url: 'https://unsplash.com/photos/a-stack-of-sweaters-sitting-on-top-of-a-wooden-chair-jrQv0161nNM' },
  },
  'detail-fabric-rolls': {
    src: '/photos/detail-fabric-rolls.webp',
    width: 2400,
    height: 2400,
    alt: 'Rolled cotton fabric in forest green, navy and burgundy on a pale wood table',
    role: 'detail',
    objectPosition: '40% 55%',
    tone: 'dark',
    credit: { photographer: 'Moonstarious Project', source: 'Unsplash', url: 'https://unsplash.com/photos/a-close-up-of-a-cloth-on-a-table-R2Z3xE7nsB8' },
  },
  'detail-embroidery-needle': {
    src: '/photos/detail-embroidery-needle.webp',
    width: 2400,
    height: 1603,
    alt: 'Close-up of an embroidery needle laying white satin stitches on dark fabric inside a green hoop',
    role: 'detail',
    objectPosition: '60% 50%',
    tone: 'dark',
    credit: { photographer: 'PJ Wallace', source: 'Unsplash', url: 'https://unsplash.com/photos/a-sewing-machine-needle-creating-white-stitches-on-dark-fabric-6tilGbJNkcU' },
  },
  'detail-corduroy-cap': {
    src: '/photos/detail-corduroy-cap.webp',
    width: 1602,
    height: 2400,
    alt: 'A brown corduroy cap hanging from an old iron hook on a timber wall in warm side light',
    role: 'detail',
    objectPosition: '45% 55%',
    tone: 'dark',
    credit: { photographer: 'Juneta Jurgaityte', source: 'Unsplash', url: 'https://unsplash.com/photos/brown-corduroy-cap-hanging-on-a-metal-hook-dUyd_-eUlCk' },
  },
  'texture-canvas': {
    src: '/photos/texture-canvas.webp',
    width: 1350,
    height: 2400,
    alt: 'Even, tightly woven natural canvas in warm wheat beige',
    role: 'texture',
    objectPosition: '50% 50%',
    tone: 'light',
    credit: { photographer: 'Logan Voss', source: 'Unsplash', url: 'https://unsplash.com/photos/a-textured-beige-fabric-background-sFGj4Lj1un8' },
  },
  'texture-sherpa-fleece': {
    src: '/photos/texture-sherpa-fleece.webp',
    width: 2400,
    height: 1600,
    alt: 'Close-up of plush, curly sherpa fleece pile in camel tan',
    role: 'texture',
    objectPosition: '50% 50%',
    tone: 'light',
    credit: { photographer: 'Shiori Miyashita', source: 'Unsplash', url: 'https://unsplash.com/photos/close-up-of-brown-fluffy-textured-fur-VdP7rIGWTLs' },
  },
  'texture-green-jersey': {
    src: '/photos/texture-green-jersey.webp',
    width: 2400,
    height: 1600,
    alt: 'Softly draped deep forest-green heathered knit jersey',
    role: 'texture',
    objectPosition: '50% 50%',
    tone: 'dark',
    credit: { photographer: 'Divazus Fabric Store', source: 'Unsplash', url: 'https://unsplash.com/photos/green-textile-in-close-up-image-zLex1iJO8bc' },
  },
} as const satisfies Record<string, Photo>;

export type PhotoSlug = keyof typeof PHOTOS;

export function getPhoto(slug: PhotoSlug): Photo {
  return PHOTOS[slug];
}

export function photosByRole(role: PhotoRole): Photo[] {
  return Object.values(PHOTOS).filter((p: Photo) => p.role === role);
}

export function photoForSegment(segment: PhotoSegment): Photo | undefined {
  return Object.values(PHOTOS).find((p: Photo) => p.segment === segment);
}

/** Hero options, best first */
export const HERO_PHOTOS = ['hero-field-trio', 'hero-heritage-knits', 'hero-field-trio-portrait'] as const satisfies readonly PhotoSlug[];
