import { bodyOf, type Placed } from '@/lib/work-layout';

/**
 * Geometry for the project reveal, all in wall units: the connecting lines between a
 * project's pieces and a place for the project panel that doesn't sit on them.
 */

type Box = { x: number; y: number; w: number; h: number };
type Pt = { x: number; y: number };

/** Points along each link's curve, for keeping the panel off the lines. */
export function linkPoints(ls: { a: Pt; b: Pt; c: Pt }[], step = 24) {
  const pts: Pt[] = [];
  for (const { a, b, c } of ls)
    for (let i = 0; i <= step; i++) {
      const t = i / step, u = 1 - t;
      pts.push({ x: u * u * a.x + 2 * u * t * c.x + t * t * b.x, y: u * u * a.y + 2 * u * t * c.y + t * t * b.y });
    }
  return pts;
}
export { bodyOf };

const centre = (b: Box) => ({ x: b.x + b.w / 2, y: b.y + b.h / 2 });

/** Where the ray from a box's centre towards (tx, ty) leaves the box. */
function exit(b: Box, tx: number, ty: number) {
  const c = centre(b);
  const dx = tx - c.x;
  const dy = ty - c.y;
  const k = Math.min(Math.abs((b.w / 2) / (dx || 1e-6)), Math.abs((b.h / 2) / (dy || 1e-6)));
  return { x: c.x + dx * Math.min(k, 1), y: c.y + dy * Math.min(k, 1) };
}

/**
 * The project's pieces joined in one path, read left to right across the wall, so the
 * line is the same whichever piece was touched and never doubles back on itself.
 * Each link is a shallow curve, bowed alternately, from edge to edge — a hand joining
 * things with a pen, not a network diagram.
 */
export function links(items: Placed[]) {
  if (items.length < 2) return [];
  const left = [...items].sort((p, q) => centre(bodyOf(p)).x - centre(bodyOf(q)).x);
  let cur = left.shift()!;
  const out: { d: string; a: Pt; b: Pt; c: Pt }[] = [];
  let bow = 1;
  while (left.length) {
    const cc = centre(bodyOf(cur));
    const next = left.shift()!;
    const nc = centre(bodyOf(next));
    // Start and end inside each piece, a third of the way from its centre to its edge,
    // so the line reads as drawn over the pictures rather than squeezed between them.
    const ea = exit(bodyOf(cur), nc.x, nc.y);
    const eb = exit(bodyOf(next), cc.x, cc.y);
    const a = { x: cc.x + (ea.x - cc.x) * 0.45, y: cc.y + (ea.y - cc.y) * 0.45 };
    const b = { x: nc.x + (eb.x - nc.x) * 0.45, y: nc.y + (eb.y - nc.y) * 0.45 };
    const len = Math.hypot(b.x - a.x, b.y - a.y);
    // Leave a little air at each end, so the line points at a piece rather than touching it.
    const gap = 0;
    const ux = (b.x - a.x) / (len || 1);
    const uy = (b.y - a.y) / (len || 1);
    const A = { x: a.x + ux * gap, y: a.y + uy * gap };
    const B = { x: b.x - ux * gap, y: b.y - uy * gap };
    const mx = (A.x + B.x) / 2 - uy * len * 0.16 * bow;
    const my = (A.y + B.y) / 2 + ux * len * 0.16 * bow;
    out.push({ d: `M${A.x.toFixed(2)} ${A.y.toFixed(2)}Q${mx.toFixed(2)} ${my.toFixed(2)} ${B.x.toFixed(2)} ${B.y.toFixed(2)}`, a: A, b: B, c: { x: mx, y: my } });
    bow = -bow;
    cur = next;
  }
  return out;
}

/**
 * Where to put the project panel: inside the visible part of the wall, clear of the
 * project's own pieces and of the lines joining them, and as close to them as it can be. The panel may sit over
 * other (dimmed) work — that's negative space once the project is isolated.
 */
export function panelSpot(
  items: Placed[],
  view: { top: number; bottom: number },
  size: { w: number; h: number },
  wallH: number,
  avoid: Pt[] = [],
) {
  const boxes = items.map((p) => {
    const b = bodyOf(p);
    return { x: b.x - 1.5, y: b.y - 1.5, w: b.w + 3, h: b.h + 3 };
  });
  const cs = boxes.map(centre);
  const mid = cs.reduce((m, c) => ({ x: m.x + c.x / cs.length, y: m.y + c.y / cs.length }), { x: 0, y: 0 });
  const top = Math.max(0, view.top + 1);
  const bottom = Math.min(wallH, view.bottom - 1) - size.h;
  let best = { x: 2, y: top, score: Infinity };
  for (let y = top; y <= Math.max(top, bottom); y += 1.5) {
    for (let x = 1; x <= 100 - size.w - 1; x += 1.5) {
      let overlap = 0;
      for (const b of boxes) {
        const ox = Math.max(0, Math.min(x + size.w, b.x + b.w) - Math.max(x, b.x));
        const oy = Math.max(0, Math.min(y + size.h, b.y + b.h) - Math.max(y, b.y));
        overlap += ox * oy;
      }
      // A line running under the panel reads as broken: keep a margin around them.
      const crossed = avoid.filter((p) => p.x > x - 1 && p.x < x + size.w + 1 && p.y > y - 1 && p.y < y + size.h + 1).length;
      const d = Math.hypot(x + size.w / 2 - mid.x, y + size.h / 2 - mid.y);
      const score = overlap * 40 + crossed * 60 + d;
      if (score < best.score) best = { x, y, score };
    }
  }
  return { x: best.x, y: best.y };
}
