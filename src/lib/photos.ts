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
 * Corrective re-grades: craft-thread-cones (hue pulled from chartreuse toward olive, less saturation),
 * detail-knit-stack-window (less saturation), craft-studio-cutting-table (shadows lifted, contrast lowered).
 * Crops: craft-embroidery-machine-cap (top 12%, removes a machine maker's wordmark),
 * craft-thread-cones (top 17%, removes a partial thread label), craft-studio-cutting-table
 * (left 25%, removes a branded tin on the windowsill).
 * Product plates (role 'product') are logo-free stock garments that stand in for catalog styles.
 * Grounds and lighting vary. No suitable plate was found for heavyweight-hoodie,
 * rugby-shirt, quilted-vest or five-panel-cap.
 * Full credits: /public/photos/CREDITS.md
 */

export type PhotoRole = 'hero' | 'segment' | 'craft' | 'detail' | 'lifestyle' | 'texture' | 'product';
/** Catalog style slugs from src/lib/catalog/local.ts */
export type PhotoProduct =
  | 'heavyweight-hoodie' | 'quarter-zip' | 'embroidered-polo' | 'heavyweight-crewneck'
  | 'heavyweight-tee' | 'long-sleeve-tee' | 'rugby-shirt' | 'coach-jacket' | 'quilted-vest'
  | 'fleece-sweatpant' | 'club-short' | 'dad-hat' | 'five-panel-cap' | 'canvas-tote';
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
  /** For role 'product': the catalog style this image suits. These are stand-in mood plates, not the actual product. */
  product?: PhotoProduct;
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
    height: 2134,
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
  /** @deprecated Soft focus at the needle. Use 'detail-embroidery-satin' instead. Kept so existing references don't break. */

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
  'product-heavyweight-tee-hanger': {
    src: '/photos/product-heavyweight-tee-hanger.webp',
    width: 2400,
    height: 1600,
    alt: 'A plain white crewneck T-shirt on a wooden hanger against a warm off-white wall',
    role: 'product',
    product: 'heavyweight-tee',
    objectPosition: '50% 45%',
    tone: 'light',
    credit: { photographer: 'Avtar Singh', source: 'Unsplash', url: 'https://unsplash.com/photos/a-plain-white-t-shirt-hangs-on-a-wooden-hanger-8ACmRoleM24' },
  },
  'product-crewneck-knit-hanger': {
    src: '/photos/product-crewneck-knit-hanger.webp',
    width: 1743,
    height: 2400,
    alt: 'A chestnut-brown knit crewneck hanging on a white hanger in soft window light',
    // A hand knit, not a fleece crewneck: kept as texture, not mapped to MT-04.
    role: 'detail',
    objectPosition: '50% 45%',
    tone: 'light',
    credit: { photographer: 'Yuliia Pakhomova', source: 'Unsplash', url: 'https://unsplash.com/photos/a-brown-knitted-sweater-hangs-on-a-white-hanger-g3AwbdZut70' },
  },
  'product-dad-hat-linen': {
    src: '/photos/product-dad-hat-linen.webp',
    width: 1600,
    height: 2400,
    alt: 'An unbranded natural-linen six-panel dad hat resting on a dark navy surface in low light',
    role: 'product',
    product: 'dad-hat',
    objectPosition: '50% 30%',
    tone: 'dark',
    credit: { photographer: 'Benjamin R.', source: 'Unsplash', url: 'https://unsplash.com/photos/a-hat-on-a-persons-head-gcZcCqpGEw0' },
  },
  'product-canvas-tote-detail': {
    src: '/photos/product-canvas-tote-detail.webp',
    width: 2400,
    height: 1920,
    alt: 'Close-up of a natural cotton canvas tote with woven webbing handles on a white ground',
    role: 'product',
    product: 'canvas-tote',
    objectPosition: '45% 55%',
    tone: 'light',
    credit: { photographer: 'Mel Poole', source: 'Unsplash', url: 'https://unsplash.com/photos/brown-tote-bag-on-white-surface--zBSu3rYjNs' },
  },
  'product-quarter-zip-rib': {
    src: '/photos/product-quarter-zip-rib.webp',
    width: 1600,
    height: 2400,
    alt: 'Close-up of a taupe rib-knit quarter-zip pullover with a metal zip, worn over a cream tee',
    role: 'product',
    product: 'quarter-zip',
    objectPosition: '50% 45%',
    tone: 'dark',
    credit: { photographer: 'Laurenz Heymann', source: 'Unsplash', url: 'https://unsplash.com/photos/a-man-wearing-a-gray-sweater-with-a-zipper-LlTOg2mWZP4' },
  },
  'product-coach-jacket-rack': {
    src: '/photos/product-coach-jacket-rack.webp',
    width: 2400,
    height: 1601,
    alt: 'A row of olive-green cotton jackets hanging on a dark rail against a warm grey wall',
    role: 'product',
    product: 'coach-jacket',
    objectPosition: '70% 60%',
    tone: 'dark',
    credit: { photographer: 'Deyan Sight', source: 'Unsplash', url: 'https://unsplash.com/photos/a-row-of-green-suits-hanging-on-a-rail-OhjG66NrPqk' },
  },
  'product-sweatpant-drawcord': {
    src: '/photos/product-sweatpant-drawcord.webp',
    width: 2400,
    height: 1442,
    alt: 'Close-up of a mustard fleece waistband with metal eyelets and a pale-blue tied drawcord',
    role: 'product',
    product: 'fleece-sweatpant',
    objectPosition: '40% 45%',
    tone: 'light',
    credit: { photographer: 'lilartsy', source: 'Unsplash', url: 'https://unsplash.com/photos/orange-and-white-shorts-5hzGB5ktcw8' },
  },
  'product-club-shorts-stack': {
    src: '/photos/product-club-shorts-stack.webp',
    width: 1600,
    height: 2400,
    alt: 'Fleece and twill drawstring shorts in heather grey, charcoal, black and white laid flat',
    role: 'product',
    product: 'club-short',
    objectPosition: '50% 55%',
    tone: 'light',
    credit: { photographer: 'TuanAnh Blue', source: 'Unsplash', url: 'https://unsplash.com/photos/a-group-of-three-shorts-sitting-next-to-each-other-ZgDpz1A9-U4' },
  },
  'product-polo-pique-flatlay': {
    src: '/photos/product-polo-pique-flatlay.webp',
    width: 2400,
    height: 1600,
    alt: 'Pique knit polos in cream, camel, pale grey and navy loosely laid on a white table',
    role: 'product',
    product: 'embroidered-polo',
    objectPosition: '50% 50%',
    tone: 'light',
    credit: { photographer: 'TuanAnh Blue', source: 'Unsplash', url: 'https://unsplash.com/photos/a-pile-of-clothing-sitting-on-top-of-a-white-table-Tcy7f54MhTw' },
  },
  'product-long-sleeve-rack': {
    src: '/photos/product-long-sleeve-rack.webp',
    width: 1667,
    height: 2400,
    alt: 'A white rail of cream, oat and white long- and short-sleeve tees on white hangers in a bright corner',
    role: 'product',
    product: 'long-sleeve-tee',
    objectPosition: '55% 60%',
    tone: 'light',
    credit: { photographer: 'Dinh Ng.', source: 'Unsplash', url: 'https://unsplash.com/photos/white-long-sleeve-shirt-on-white-clothes-hanger-jYz3EGBhDpk' },
  },
  'detail-rib-navy': {
    src: '/photos/detail-rib-navy.webp',
    width: 2400,
    height: 1600,
    alt: 'Macro of chunky heathered navy rib knit with burgundy flecks',
    role: 'detail',
    objectPosition: '50% 50%',
    tone: 'dark',
    credit: { photographer: 'Maria Kovalets', source: 'Unsplash', url: 'https://unsplash.com/photos/a-close-up-of-a-knitted-material-FRCr3ezYFLg' },
  },
  'detail-rib-cuff-grey': {
    src: '/photos/detail-rib-cuff-grey.webp',
    width: 1590,
    height: 2400,
    alt: 'Close-up of pale grey rib-knit cuffs in raking light',
    role: 'detail',
    objectPosition: '50% 40%',
    tone: 'light',
    credit: { photographer: 'Courtney Smith', source: 'Unsplash', url: 'https://unsplash.com/photos/white-textile-in-close-up-photography-jqhrI9IhK3k' },
  },
  'detail-knit-stack-trio': {
    src: '/photos/detail-knit-stack-trio.webp',
    width: 1600,
    height: 2400,
    alt: 'Three folded knits stacked: cream chunky rib, camel jersey and mustard sweater knit',
    role: 'detail',
    objectPosition: '50% 50%',
    tone: 'light',
    credit: { photographer: 'Olga Kozachenko', source: 'Unsplash', url: 'https://unsplash.com/photos/white-and-gray-knit-textile-o9dtfshlJ60' },
  },
  'detail-varsity-stripe-cuff': {
    src: '/photos/detail-varsity-stripe-cuff.webp',
    width: 1600,
    height: 2400,
    alt: 'Close-up of a grey and cream rib-knit cuff with a red varsity stripe over navy',
    role: 'detail',
    objectPosition: '50% 55%',
    tone: 'light',
    credit: { photographer: 'Dorice Legault', source: 'Unsplash', url: 'https://unsplash.com/photos/gray-red-and-white-sock-vefzt_9qg-c' },
  },
  'detail-zipper-canvas': {
    src: '/photos/detail-zipper-canvas.webp',
    width: 2400,
    height: 1600,
    alt: 'Macro of a chunky antique-nickel zipper and pull on navy canvas with tan webbing tape',
    role: 'detail',
    objectPosition: '50% 50%',
    tone: 'dark',
    credit: { photographer: 'Mohamed Marey', source: 'Unsplash', url: 'https://unsplash.com/photos/a-metal-zipper-on-blue-and-brown-fabric-pCb3rHZZCTA' },
  },

  'detail-swatch-book': {
    src: '/photos/detail-swatch-book.webp',
    width: 1590,
    height: 2400,
    alt: 'A tailoring swatch book with fanned suiting cloth strips in cream, grey and navy',
    role: 'detail',
    objectPosition: '50% 55%',
    tone: 'dark',
    credit: { photographer: 'Yasamine June', source: 'Unsplash', url: 'https://unsplash.com/photos/a-close-up-of-a-piece-of-cloth-on-a-table-9pFE-9CWEBI' },
  },
  'detail-fabric-houndstooth': {
    src: '/photos/detail-fabric-houndstooth.webp',
    width: 1800,
    height: 2400,
    alt: 'Folded fabrics in rust cotton, tan micro-houndstooth and chocolate brown',
    role: 'detail',
    objectPosition: '50% 50%',
    tone: 'dark',
    credit: { photographer: 'Victor Volkov', source: 'Unsplash', url: 'https://unsplash.com/photos/a-close-up-of-a-brown-and-black-fabric-t3mSDMjd9ZY' },
  },
  'detail-folded-stack-color': {
    src: '/photos/detail-folded-stack-color.webp',
    width: 2400,
    height: 2237,
    alt: 'A tight stack of folded garments in powder blue, mustard, rust stripe and denim',
    role: 'detail',
    objectPosition: '50% 50%',
    tone: 'dark',
    credit: { photographer: 'Zoe', source: 'Unsplash', url: 'https://unsplash.com/photos/brown-and-black-textile-on-black-textile-ZRcD8IxeXUw' },
  },
  'detail-embroidery-satin': {
    src: '/photos/detail-embroidery-satin.webp',
    width: 2400,
    height: 2400,
    alt: 'Close-up of hand embroidery in a wooden hoop: blush and crimson satin-stitch roses with green leaves on natural cotton',
    role: 'detail',
    objectPosition: '50% 50%',
    tone: 'light',
    credit: { photographer: 'Gio Gix', source: 'Unsplash', url: 'https://unsplash.com/photos/green-and-red-floral-textile-iKO49WSTJaU' },
  },
  'craft-pattern-pieces': {
    src: '/photos/craft-pattern-pieces.webp',
    width: 2400,
    height: 1569,
    alt: 'Hands laying out cut fabric pattern pieces on a dark wooden workbench beside scissors and thread',
    role: 'craft',
    objectPosition: '55% 50%',
    tone: 'dark',
    credit: { photographer: 'Kelly Sikkema', source: 'Unsplash', url: 'https://unsplash.com/photos/person-in-black-long-sleeve-shirt-holding-red-round-ornament-4LjWS2TtmEk' },
  },
  'segment-nonprofit-garden': {
    src: '/photos/segment-nonprofit-garden.webp',
    width: 2400,
    height: 1602,
    alt: 'A volunteer in a striped shirt and gloves kneeling to tend a community garden bed in warm afternoon light',
    role: 'segment',
    segment: 'nonprofit',
    objectPosition: '55% 50%',
    tone: 'light',
    credit: { photographer: 'Hasan Hasanzadeh', source: 'Unsplash', url: 'https://unsplash.com/photos/a-woman-kneeling-down-in-a-garden-holding-an-apple--4lNMuL4qJ4' },
  },
  'segment-social-croquet': {
    src: '/photos/segment-social-croquet.webp',
    width: 2400,
    height: 1600,
    alt: 'Wooden croquet mallets and balls lying on a freshly mown lawn',
    role: 'segment',
    segment: 'social',
    objectPosition: '55% 55%',
    tone: 'light',
    credit: { photographer: 'Troy Taylor', source: 'Unsplash', url: 'https://unsplash.com/photos/red-and-white-balls-on-green-grass-kN5nJA9LpZc' },
  },
  'lifestyle-park-picnic': {
    src: '/photos/lifestyle-park-picnic.webp',
    width: 1600,
    height: 2400,
    alt: 'Friends gathered on picnic blankets on a shaded lawn under tall trees',
    role: 'lifestyle',
    objectPosition: '50% 75%',
    tone: 'dark',
    credit: { photographer: 'Jonathan Borba', source: 'Unsplash', url: 'https://unsplash.com/photos/people-enjoying-a-picnic-in-a-sunny-park-nQjwhL5TKM8' },
  },
} as const satisfies Record<string, Photo>;

export type PhotoSlug = keyof typeof PHOTOS;

export function getPhoto(slug: PhotoSlug): Photo {
  return PHOTOS[slug];
}

export function photosByRole(role: PhotoRole): Photo[] {
  return Object.values(PHOTOS).filter((p: Photo) => p.role === role);
}

export function photosForProduct(product: PhotoProduct): Photo[] {
  return Object.values(PHOTOS).filter((p: Photo) => p.product === product);
}

export function photosForSegment(segment: PhotoSegment): Photo[] {
  return Object.values(PHOTOS).filter((p: Photo) => p.segment === segment);
}

export function photoForSegment(segment: PhotoSegment): Photo | undefined {
  return Object.values(PHOTOS).find((p: Photo) => p.segment === segment);
}

/** Hero options, best first */
export const HERO_PHOTOS = ['hero-field-trio', 'hero-heritage-knits', 'hero-field-trio-portrait'] as const satisfies readonly PhotoSlug[];
