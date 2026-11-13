import type { LookbookPieceKind } from '@/lib/catalog/types';

/**
 * Where each flat sits on a square card, as percentages. The lookbook draws every
 * garment to fill its own artboard, so sizes come from real garment lengths (inches,
 * by kind) instead: sweatpants stand taller than the hoodie, shorts come up small.
 */

const LENGTH: Record<LookbookPieceKind, number> = {
  hoodie: 30, zip_hoodie: 30, crewneck: 26, quarter_zip: 27,
  jersey: 29, polo: 28, tee: 24, baby_tee: 18, tank: 23, crop_top: 16,
  sweatpant: 38, pj_pant: 38, jogger: 37, legging: 36, short: 16, skirt: 17,
  hat: 10, tote: 16, other: 28,
};

export type Placed = { left: number; top: number; width: number; height: number; rotate: number };

/** Inner area of the card, in %, below the caption. */
const BOX = { x: 7, y: 14, w: 86, h: 80 };
/** A lone piece never fills more than this much of the card's height. */
const SINGLE_MAX = 64;

export function layFlat(pieces: { kind: LookbookPieceKind; w: number; h: number }[]): Placed[] {
  if (pieces.length === 0) return [];
  const size = pieces.map((p) => {
    const h = LENGTH[p.kind] ?? LENGTH.other;
    const ratio = p.w > 0 && p.h > 0 ? p.w / p.h : 1;
    return { w: ratio * h, h };
  });
  const [top] = size;
  // The lead piece top-left, the rest beside it in a row, just touching: never over a design.
  const at: { x: number; y: number; r: number }[] = [{ x: 0, y: 0, r: size.length === 1 ? 0 : -5 }];
  if (size.length === 2) at.push({ x: top.w * 0.9, y: top.h * 0.2, r: 5 });
  else if (size.length > 2) {
    at.push({ x: top.w * 0.9, y: -top.h * 0.02, r: 6 });
    for (let i = 2; i < size.length; i++) {
      at.push({ x: at[i - 1].x + size[i - 1].w * 0.85, y: i % 2 === 0 ? top.h * 0.24 : -top.h * 0.02, r: i % 2 === 0 ? 5 : -4 });
    }
  }

  const x0 = Math.min(...at.map((a) => a.x));
  const y0 = Math.min(...at.map((a) => a.y));
  const bw = Math.max(...at.map((a, i) => a.x + size[i].w)) - x0;
  const bh = Math.max(...at.map((a, i) => a.y + size[i].h)) - y0;
  let s = Math.min(BOX.w / bw, BOX.h / bh);
  if (size.length === 1) s = Math.min(s, SINGLE_MAX / bh);
  const ox = BOX.x + (BOX.w - bw * s) / 2;
  const oy = BOX.y + (BOX.h - bh * s) / 2;

  return at.map((a, i) => ({
    left: ox + (a.x - x0) * s,
    top: oy + (a.y - y0) * s,
    width: size[i].w * s,
    height: size[i].h * s,
    rotate: a.r,
  }));
}
