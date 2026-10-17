/**
 * Shared design constants for TS/JS (motion, breakpoints, photo treatments).
 * The CSS side of the same system lives in src/app/globals.css; the spec is
 * DESIGN.md. Keep the two in sync.
 */

/** Easings, as cubic-bezier arrays (Framer-style) and CSS strings. */
export const EASE = {
  /** Arrivals: fast start, long settle. Most things. */
  out: [0.16, 1, 0.3, 1] as const,
  /** State changes that go both ways (toggles, colourway swaps). */
  inout: [0.65, 0, 0.35, 1] as const,
  /** The needle: a pull and a soft stop. Draws, wipes, underlines. */
  stitch: [0.7, 0, 0.2, 1] as const,
};
export const EASE_CSS = {
  out: 'cubic-bezier(0.16, 1, 0.3, 1)',
  inout: 'cubic-bezier(0.65, 0, 0.35, 1)',
  stitch: 'cubic-bezier(0.7, 0, 0.2, 1)',
} as const;

/** Durations in ms. quick = hovers/presses, base = UI state, slow = entrances. */
export const DUR = { quick: 180, base: 420, slow: 900 } as const;

/** Stagger between sibling entrances (lines of a headline, tiles in a row). */
export const STAGGER = 80;

/** Tailwind breakpoints, for JS that has to agree with CSS. */
export const BP = { sm: 640, md: 768, lg: 1024, xl: 1280, '2xl': 1536 } as const;

/** Photo treatments: map to the CSS classes in globals.css. */
export type PhotoTreatment = 'grade' | 'duo' | 'duo-dusty';
export const TREATMENT_CLASS: Record<PhotoTreatment, string> = {
  grade: 'photo grade grain',
  duo: 'photo duo grain',
  'duo-dusty': 'photo duo-dusty grain',
};

/** The approved aspect ratios. Use only these for photo frames. */
export const RATIO = {
  portrait: 'aspect-[4/5]',
  tall: 'aspect-[2/3]',
  square: 'aspect-square',
  landscape: 'aspect-[3/2]',
  cinema: 'aspect-[21/9]',
} as const;

/** Section rhythm classes (see .sec in globals.css). */
export const SECTION = { sm: 'sec-sm', md: 'sec', lg: 'sec-lg' } as const;

/** The brand palette, for canvas/SVG code that cannot read Tailwind tokens. */
export const PALETTE = {
  green: '#133327',
  greenDeep: '#0D241B',
  cream: '#EEE6D9',
  paper: '#F4EFE6',
  beige: '#C4B19A',
  beigeDeep: '#8C7A63',
  dusty: '#223041',
  muted: '#55625A',
  rule: '#D3C8B6',
} as const;
