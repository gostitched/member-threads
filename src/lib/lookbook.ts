import type { LookbookPieceKind } from './catalog/types';

/**
 * Get inspired: how the lookbook's sets are filtered and what they sit on. The sets
 * themselves come from the dashboard (`getLookbook` in `@/lib/catalog/api`).
 */

export type PieceGroup = 'hoodies' | 'tops' | 'outerwear' | 'bottoms' | 'hats' | 'extras';

/** The piece filter, in display order. A group with no sets on the wall isn't offered. */
export const PIECE_GROUPS: { id: PieceGroup; label: string }[] = [
  { id: 'hoodies', label: 'Hoodies & Crewnecks' },
  { id: 'tops', label: 'Tees, Polos & Jerseys' },
  { id: 'outerwear', label: 'Outerwear' },
  { id: 'bottoms', label: 'Shorts & Sweats' },
  { id: 'hats', label: 'Hats' },
  { id: 'extras', label: 'Totes' },
];

/** The dashboard has no outerwear kind yet, so that group stays hidden until it does. */
export const GROUP_OF: Record<LookbookPieceKind, PieceGroup> = {
  hoodie: 'hoodies', zip_hoodie: 'hoodies', crewneck: 'hoodies', quarter_zip: 'hoodies',
  jersey: 'tops', polo: 'tops', tee: 'tops', baby_tee: 'tops', tank: 'tops', crop_top: 'tops',
  sweatpant: 'bottoms', jogger: 'bottoms', legging: 'bottoms', pj_pant: 'bottoms', short: 'bottoms', skirt: 'bottoms',
  hat: 'hats',
  tote: 'extras', other: 'extras',
};

// Grounds, all from the board: cream, sage, oat, sand and mist. Cycled set by set.
const CREAM = '#EEE6D9';
const SAGE = '#DDDCD3';
const OAT = '#E4DACA';
const SAND = '#E1D6C8';
const MIST = '#DFDCD5';

export const GROUNDS = [CREAM, SAGE, OAT, SAND, MIST];
