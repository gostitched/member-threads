/**
 * "How it works": copy, ticket data and swappable art.
 *
 * Each stage draws a placeholder until a real asset is set here. Assets are drawn
 * inside the stage's SVG, over the same box as the placeholder, so the thread
 * still lands where it should. Put files in /public/process and set the path.
 */

export const PROCESS = {
  eyebrow: 'How it works / 004',
  headline: ['From a text', 'to the dance floor.'],
  note: 'You bring them. We build the collection.',

  /**
   * The six-step flow, folded into the four drawn stages: 01 tell us + meet your
   * designer, 02 build the collection, 03 approve designs and pricing, 04 we make
   * everything and it arrives ready.
   */
  stages: {
    brief: { n: '01', name: 'Tell us', title: 'Send us the kid, not a spec.', note: 'Colors, the vibe, screenshots, the planner’s deck. Then you meet your designer.' },
    design: { n: '02', name: 'Design', title: 'We build the collection.', note: 'Hoodies, sets, hats, packaging, drawn to go together.' },
    quote: { n: '03', name: 'Approve', title: 'One collection price.', note: 'Approve the designs and the price together. Design included.' },
    made: { n: '04', name: 'Made', title: 'Then we make every piece.', note: 'Made by our own production team. It arrives ready for the weekend.' },
  },

  /** The production ticket in stage 03. Illustrative, but keep it believable. */
  ticket: {
    brand: 'Member Threads',
    project: 'MT-0516',
    style: 'Heavyweight hoodie',
    qty: '86 pcs',
    total: '86',
    price: 'In collection',
    decoration: 'Chenille + satin',
    design: 'Included',
  },
} as const;

export type StageId = keyof typeof PROCESS.stages;

export const PROCESS_ASSETS: {
  /** A phone screenshot / reference image, portrait ~9:16. */
  reference: string | null;
  /** A rough sketch on white, 340 × 400. Replaces the drawn sketch; the loose stitch still overlays it. */
  sketch: string | null;
  /** A technical flat, front view, on transparent, framed to the garment's 600 × 620 box. */
  flat: string | null;
  /**
   * The finished garment: a photo or render, front view, cut out on transparent,
   * framed to the same 600 × 620 box as the technical outline it replaces. This is
   * the payoff of the section, so it should look genuinely manufactured.
   */
  made: string | null;
} = {
  reference: null,
  sketch: null,
  flat: null,
  made: null,
};
