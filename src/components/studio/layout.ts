/**
 * Where words sit on the desktop canvas, by slot. Garments and techniques fill
 * slots in the order they're listed in `@/lib/studio`, so reordering the data
 * re-art-directs the canvas without touching this file.
 *
 * `x` is the left edge and `r` the right edge, in % of the canvas; `y` is the top.
 * The garment owns the middle ~45%, the bottom corners belong to the recipe and
 * the payoff, and a word may bleed off the canvas edge on purpose.
 */

export type Size = 'xl' | 'lg' | 'md' | 'sm';

export type Slot = {
  x?: number;
  r?: number;
  y: number;
  size: Size;
  vertical?: boolean;
};

export const SIZE: Record<Size, string> = {
  xl: 'text-[clamp(3rem,6vw,6.5rem)] leading-[0.84] tracking-[-0.045em]',
  lg: 'text-[clamp(2rem,3.4vw,3.6rem)] leading-[0.88] tracking-[-0.035em]',
  md: 'text-[clamp(1.35rem,2.1vw,2.2rem)] leading-[0.92] tracking-[-0.025em]',
  sm: 'text-[clamp(0.95rem,1.2vw,1.2rem)] leading-none tracking-[-0.01em]',
};

export const WHAT_SLOTS: Slot[] = [
  { x: -0.6, y: 5, size: 'xl' },           // Hoodies
  { x: 74, y: 7, size: 'md' },             // Baby tees
  { r: -0.6, y: 17, size: 'xl' },          // Varsity
  { x: 5, y: 24, size: 'sm' },             // Polos
  { x: 2.5, y: 36, size: 'lg', vertical: true }, // Jerseys
  { x: 9, y: 64, size: 'lg' },             // Workwear
  { x: 76, y: 35, size: 'md' },            // Crewnecks
  { x: 80, y: 46, size: 'sm' },            // Quarter-zips
  { x: 11, y: 43, size: 'md' },            // Button-downs
  { r: 4, y: 57, size: 'lg' },             // Shorts
  { x: 23, y: 25, size: 'sm', vertical: true }, // Caps
  { r: 1.5, y: 30, size: 'md', vertical: true }, // Robes
];

export const HOW_SLOTS: Slot[] = [
  { x: 2, y: 6, size: 'lg' },              // Embroider it
  { r: -1, y: 4, size: 'xl' },             // Puff it
  { x: 6, y: 21, size: 'lg' },             // Print it
  { x: 76, y: 22, size: 'md' },            // Patch it
  { x: 3, y: 35, size: 'sm' },             // Foil it
  { r: 2, y: 33, size: 'lg' },             // Distress it
  { x: -0.6, y: 45, size: 'xl' },          // Dye it
  { x: 78, y: 48, size: 'md' },            // Appliqué it
  { x: 24.5, y: 8, size: 'sm', vertical: true }, // Sublimate it
  { x: 10, y: 65, size: 'md' },            // Wash it
  { x: 81, y: 60, size: 'sm' },            // Metallic
  { r: 3, y: 67, size: 'lg' },             // All-over
];

/** Where "+ N MORE" sits in each mode. */
export const MORE_SLOT: Record<'what' | 'how', Slot> = {
  what: { x: 79, y: 71, size: 'sm' },
  how: { x: 21, y: 71, size: 'sm' },
};
