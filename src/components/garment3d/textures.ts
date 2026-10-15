import type { CustomizationId } from '@/lib/upcharge';
import { ANCHORS, ATLAS, INCH } from './config';
import { SHAPE, sample } from './mockneck';

/**
 * Every texture the garment wears, drawn on canvases at startup: no image files to
 * fetch. The atlas holds the cloth (heather fleece, rib zones, seams) with the
 * decorations painted over it; a matching height map gives the knit, the ribs, the
 * seams and raised embroidery their relief.
 *
 * Decorations are drawn in garment units through `Atlas.at()`, so the same drawing
 * lands in the same place on the stand-in or on a production asset that follows the
 * atlas contract in ./config.
 */

const BLUE = '#2B5BD7';
const INK = '#161616';
const CREAM = '#EFEBE1';

// Seeded so the heather is identical on every load.
function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

export class Atlas {
  readonly w: number;
  readonly h: number;
  readonly color: HTMLCanvasElement;
  readonly height: HTMLCanvasElement;
  private baseColor: HTMLCanvasElement;
  private baseHeight: HTMLCanvasElement;

  constructor(w: number) {
    this.w = w;
    this.h = w / 4;
    const make = () => Object.assign(document.createElement('canvas'), { width: this.w, height: this.h });
    this.color = make();
    this.height = make();
    this.baseColor = make();
    this.baseHeight = make();
    this.paintCloth();
    this.compose([]);
  }

  /** Garment units → atlas pixels, on the front or back half. */
  at(x: number, y: number, side: 'front' | 'back') {
    const u = (x - ATLAS.minX) / (ATLAS.maxX - ATLAS.minX);
    const v = (y - ATLAS.minY) / (ATLAS.maxY - ATLAS.minY);
    const half = this.w / 2;
    return { x: side === 'front' ? u * half : half + (1 - u) * half, y: (1 - v) * this.h };
  }
  /** Pixels per garment unit, horizontally and vertically. */
  get ppu() {
    return { x: this.w / 2 / (ATLAS.maxX - ATLAS.minX), y: this.h / (ATLAS.maxY - ATLAS.minY) };
  }

  private paintCloth() {
    const { w, h } = this;
    const c = this.baseColor.getContext('2d')!;
    const hc = this.baseHeight.getContext('2d')!;
    const r = rng(65);

    // Heather: a light grey base, then thousands of short fibres, darker and lighter,
    // mostly running with the grain.
    c.fillStyle = '#B3B2AD';
    c.fillRect(0, 0, w, h);
    const px = this.ppu;
    const fibres = Math.round(w * h * 0.055);
    for (let i = 0; i < fibres; i++) {
      const x = r() * w;
      const y = r() * h;
      const len = 1 + r() * 3.2;
      const t = r();
      c.fillStyle = t < 0.5 ? `rgba(104,103,99,${0.3 + r() * 0.32})` : t < 0.9 ? `rgba(226,225,221,${0.28 + r() * 0.3})` : `rgba(80,79,76,${0.4})`;
      c.fillRect(x, y, 1, len);
    }
    // Slow cloudy variation, the way a real heather is never perfectly even.
    for (let i = 0; i < 90; i++) {
      const x = r() * w;
      const y = r() * h;
      const rad = (0.08 + r() * 0.2) * px.x;
      const g = c.createRadialGradient(x, y, 0, x, y, rad);
      const light = r() > 0.5;
      g.addColorStop(0, light ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      c.fillStyle = g;
      c.fillRect(x - rad, y - rad, rad * 2, rad * 2);
    }

    // Height: fleece grain as fine noise.
    hc.fillStyle = '#808080';
    hc.fillRect(0, 0, w, h);
    const grain = Math.round(w * h * 0.04);
    for (let i = 0; i < grain; i++) {
      const v = Math.round(100 + r() * 60);
      hc.fillStyle = `rgba(${v},${v},${v},0.5)`;
      hc.fillRect(r() * w, r() * h, 1, 1 + r() * 2);
    }

    // Rib zones and seams, on both halves.
    for (const side of ['front', 'back'] as const) {
      this.paintRibs(c, hc, side);
      this.paintSeams(c, hc, side);
    }
  }

  private paintRibs(c: CanvasRenderingContext2D, hc: CanvasRenderingContext2D, side: 'front' | 'back') {
    const { BAND, SLEEVE, CUFF } = SHAPE;
    const px = this.ppu;
    const pitch = 0.012 * px.x; // one wale every ~0.19 in

    // Waistband: vertical wales.
    const a = this.at(-BAND.hx - 0.03, BAND.cy + BAND.hy, side);
    const b = this.at(BAND.hx + 0.03, BAND.cy - BAND.hy - 0.02, side);
    const x0 = Math.min(a.x, b.x);
    const x1 = Math.max(a.x, b.x);
    for (let x = x0; x < x1; x += pitch) {
      c.fillStyle = 'rgba(0,0,0,0.075)';
      c.fillRect(x, a.y, pitch * 0.42, b.y - a.y);
      hc.fillStyle = 'rgba(0,0,0,0.55)';
      hc.fillRect(x, a.y, pitch * 0.38, b.y - a.y);
      hc.fillStyle = 'rgba(255,255,255,0.35)';
      hc.fillRect(x + pitch * 0.5, a.y, pitch * 0.3, b.y - a.y);
    }

    // Cuffs: wales running along the sleeve.
    for (const s of [-1, 1]) {
      const dir = { x: Math.cos(SLEEVE.angle) * s, y: Math.sin(SLEEVE.angle) };
      const start = { x: (SLEEVE.ax + Math.cos(SLEEVE.angle) * SLEEVE.len) * s, y: SLEEVE.ay + Math.sin(SLEEVE.angle) * SLEEVE.len };
      const p = this.at(start.x, start.y, side);
      const flip = side === 'back' ? -1 : 1;
      const ang = Math.atan2(-dir.y, dir.x * flip);
      for (const ctx of [c, hc]) {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(ang);
        const len = (CUFF.len + 0.02) * px.x;
        const hw = (CUFF.hw + 0.02) * px.y;
        for (let y = -hw; y < hw; y += pitch) {
          if (ctx === c) {
            ctx.fillStyle = 'rgba(0,0,0,0.075)';
            ctx.fillRect(-2, y, len, pitch * 0.42);
          } else {
            ctx.fillStyle = 'rgba(0,0,0,0.55)';
            ctx.fillRect(-2, y, len, pitch * 0.38);
            ctx.fillStyle = 'rgba(255,255,255,0.35)';
            ctx.fillRect(-2, y + pitch * 0.5, len, pitch * 0.3);
          }
        }
        ctx.restore();
      }
    }
  }

  private paintSeams(c: CanvasRenderingContext2D, hc: CanvasRenderingContext2D, side: 'front' | 'back') {
    const { BAND, SLEEVE } = SHAPE;
    const stroke = (pts: [number, number][], width: number) => {
      for (const [ctx, col] of [
        [c, 'rgba(0,0,0,0.16)'],
        [hc, 'rgba(0,0,0,0.8)'],
      ] as const) {
        ctx.strokeStyle = col;
        ctx.lineWidth = width;
        ctx.beginPath();
        pts.forEach(([x, y], i) => {
          const p = this.at(x, y, side);
          if (i === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        });
        ctx.stroke();
      }
    };
    const w = Math.max(1.5, this.w / 1600);

    // Waistband seam, and the cover stitch just above it.
    stroke([[-BAND.hx, BAND.cy + BAND.hy], [BAND.hx, BAND.cy + BAND.hy]], w);
    // Dropped-shoulder seams: a gentle curve down the top of each arm into the armpit.
    for (const s of [-1, 1]) {
      const pts: [number, number][] = [];
      for (let i = 0; i <= 20; i++) {
        const t = i / 20;
        pts.push([s * (0.7 + Math.sin(t * Math.PI) * 0.035), 0.56 - t * 0.47]);
      }
      stroke(pts, w);
      // Cuff seam.
      const ex = (SLEEVE.ax + Math.cos(SLEEVE.angle) * SLEEVE.len) * s;
      const ey = SLEEVE.ay + Math.sin(SLEEVE.angle) * SLEEVE.len;
      const nx = -Math.sin(SLEEVE.angle) * s;
      const ny = Math.cos(SLEEVE.angle);
      stroke([[ex - nx * 0.17, ey - ny * 0.17], [ex + nx * 0.17, ey + ny * 0.17]], w);
    }
  }

  /** Repaint with a set of decorations. */
  compose(applied: readonly CustomizationId[]) {
    const c = this.color.getContext('2d')!;
    const hc = this.height.getContext('2d')!;
    c.drawImage(this.baseColor, 0, 0);
    hc.drawImage(this.baseHeight, 0, 0);
    for (const id of applied) DRAW[id]?.(this, c, hc);
  }
}

type Draw = (a: Atlas, c: CanvasRenderingContext2D, hc: CanvasRenderingContext2D) => void;

/** Print: flat ink that lets a little of the fleece through, and smooths the relief. */
function printed(a: Atlas, c: CanvasRenderingContext2D, hc: CanvasRenderingContext2D, draw: (ctx: CanvasRenderingContext2D, ink: boolean) => void) {
  c.save();
  c.globalAlpha = 0.93;
  draw(c, true);
  c.restore();
  hc.save();
  hc.globalAlpha = 0.6;
  hc.fillStyle = '#8a8a8a';
  hc.strokeStyle = '#8a8a8a';
  draw(hc, false);
  hc.restore();
}

const DRAW: Partial<Record<CustomizationId, Draw>> = {
  // Satin-stitch monogram, raised well above the fleece.
  embroidery(a, c, hc) {
    const o = ANCHORS.embroidery;
    const p = a.at(o.x, o.y, 'front');
    const r = 1.9 * INCH * a.ppu.x;
    // Contact shadow first, so it reads as sitting on the cloth.
    c.save();
    c.fillStyle = 'rgba(0,0,0,0.18)';
    c.filter = `blur(${r * 0.08}px)`;
    c.beginPath();
    c.arc(p.x + r * 0.03, p.y + r * 0.05, r * 1.02, 0, Math.PI * 2);
    c.fill();
    c.restore();

    for (const [ctx, isColor] of [
      [c, true],
      [hc, false],
    ] as const) {
      ctx.save();
      ctx.translate(p.x, p.y);
      // Ring
      ctx.fillStyle = isColor ? BLUE : '#f2f2f2';
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.arc(0, 0, r * 0.8, 0, Math.PI * 2, true);
      ctx.fill();
      // Letter
      ctx.font = `italic 400 ${r * 1.45}px Georgia, serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('S', 0, r * 0.06);
      // Stitch direction: radial across the ring, diagonal across the letter.
      ctx.strokeStyle = isColor ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.35)';
      ctx.lineWidth = Math.max(1, r * 0.018);
      for (let i = 0; i < 140; i++) {
        const t = (i / 140) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(Math.cos(t) * r * 0.81, Math.sin(t) * r * 0.81);
        ctx.lineTo(Math.cos(t + 0.05) * r * 0.99, Math.sin(t + 0.05) * r * 0.99);
        ctx.stroke();
      }
      ctx.globalCompositeOperation = 'source-atop';
      for (let i = -r; i < r; i += r * 0.045) {
        ctx.beginPath();
        ctx.moveTo(i - r * 0.5, -r * 0.78);
        ctx.lineTo(i + r * 0.3, r * 0.78);
        ctx.stroke();
      }
      ctx.restore();
    }
  },

  // The big front graphic: the site's blue disc and ink starburst.
  art(a, c, hc) {
    const o = ANCHORS.art;
    const p = a.at(o.x, o.y, 'front');
    const r = 0.2 * a.ppu.x;
    printed(a, c, hc, (ctx, ink) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.fillStyle = ink ? BLUE : ctx.fillStyle;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = ink ? INK : ctx.strokeStyle;
      ctx.lineWidth = r * 0.12;
      ctx.lineCap = 'square';
      ctx.translate(r * 0.38, -r * 0.1);
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.moveTo(-r * 1.05, 0);
        ctx.lineTo(r * 1.05, 0);
        ctx.stroke();
        ctx.rotate(Math.PI / 4);
      }
      ctx.fillStyle = ink ? CREAM : ctx.fillStyle;
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.19, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  },

  // Running down the wearer's right sleeve, along its axis.
  sleeve(a, c, hc) {
    const { SLEEVE } = SHAPE;
    const s = -1;
    const t0 = 0.12;
    const t1 = 0.92;
    const at = (t: number, off: number) => {
      const ax = (SLEEVE.ax + Math.cos(SLEEVE.angle) * SLEEVE.len * t) * s;
      const ay = SLEEVE.ay + Math.sin(SLEEVE.angle) * SLEEVE.len * t;
      const nx = -Math.sin(SLEEVE.angle) * s;
      const ny = Math.cos(SLEEVE.angle);
      return a.at(ax + nx * off, ay + ny * off, 'front');
    };
    const p0 = at(t0, 0.03);
    const p1 = at(t1, 0.03);
    const ang = Math.atan2(p1.y - p0.y, p1.x - p0.x);
    const len = Math.hypot(p1.x - p0.x, p1.y - p0.y);
    const hgt = 0.05 * a.ppu.y;
    printed(a, c, hc, (ctx, ink) => {
      ctx.save();
      ctx.translate(p1.x, p1.y);
      ctx.rotate(ang + Math.PI);
      ctx.fillStyle = ink ? BLUE : ctx.fillStyle;
      ctx.fillRect(0, -hgt * 1.25, len, hgt * 0.16);
      ctx.fillRect(0, hgt * 1.05, len, hgt * 0.16);
      ctx.fillStyle = ink ? INK : ctx.fillStyle;
      ctx.font = `500 ${hgt * 1.05}px ui-monospace, Menlo, monospace`;
      ctx.textBaseline = 'middle';
      const text = 'EDITION 001 · EDITION 001 · EDITION 001';
      const m = ctx.measureText(text).width;
      ctx.save();
      ctx.scale(len / m, 1);
      ctx.fillText(text, 0, 0);
      ctx.restore();
      ctx.restore();
    });
  },

  // Small, low on the back: the one you only find by turning it round.
  location(a, c, hc) {
    const o = ANCHORS.location;
    const p = a.at(o.x, o.y, 'back');
    const size = 0.07 * a.ppu.y;
    printed(a, c, hc, (ctx, ink) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.fillStyle = ink ? INK : ctx.fillStyle;
      ctx.font = `800 ${size}px system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('WHY NOT.', 0, 0);
      ctx.strokeStyle = ink ? BLUE : ctx.strokeStyle;
      ctx.lineWidth = size * 0.1;
      ctx.setLineDash([size * 0.3, size * 0.22]);
      ctx.beginPath();
      ctx.moveTo(-size * 2.2, size * 0.75);
      ctx.lineTo(size * 2.2, size * 0.75);
      ctx.stroke();
      ctx.restore();
    });
  },

  // The big back graphic.
  back(a, c, hc) {
    const o = ANCHORS.back;
    const p = a.at(o.x, o.y, 'back');
    const w = 0.5 * a.ppu.x;
    const h = 0.58 * a.ppu.y;
    printed(a, c, hc, (ctx, ink) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.fillStyle = ink ? BLUE : ctx.fillStyle;
      ctx.fillRect(-w / 2, -h / 2, w, h);
      if (ink) {
        ctx.fillStyle = CREAM;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = `500 ${h * 0.065}px ui-monospace, Menlo, monospace`;
        ctx.fillText('D E P T .  O F', 0, -h * 0.34);
        ctx.font = `800 ${h * 0.25}px system-ui, sans-serif`;
        ctx.fillText('BETTER', 0, -h * 0.06, w * 0.86);
        ctx.font = `800 ${h * 0.17}px system-ui, sans-serif`;
        ctx.fillText('GARMENTS', 0, h * 0.17, w * 0.86);
        ctx.font = `500 ${h * 0.055}px ui-monospace, Menlo, monospace`;
        ctx.fillText('E D I T I O N  0 0 1', 0, h * 0.37);
      }
      ctx.restore();
    });
  },
};

/** Chenille patch face: short cream loops on an ink ground, "65" in raised pile. */
export function patchFace(size: number) {
  const cv = Object.assign(document.createElement('canvas'), { width: size, height: size });
  const c = cv.getContext('2d')!;
  const r = rng(7);
  c.fillStyle = '#1B1B1B';
  c.fillRect(0, 0, size, size);
  for (let i = 0; i < size * size * 0.08; i++) {
    const v = 20 + r() * 30;
    c.fillStyle = `rgb(${v},${v},${v})`;
    c.fillRect(r() * size, r() * size, 1.5, 1.5);
  }
  // The letters on their own layer, broken up into loops of pile, then laid on.
  const letters = Object.assign(document.createElement('canvas'), { width: size, height: size });
  const l = letters.getContext('2d')!;
  l.font = `800 ${size * 0.46}px system-ui, sans-serif`;
  l.textAlign = 'center';
  l.textBaseline = 'middle';
  l.fillStyle = CREAM;
  l.fillText('65', size / 2, size * 0.53);
  l.globalCompositeOperation = 'source-atop';
  for (let i = 0; i < size * size * 0.2; i++) {
    const v = 200 + r() * 55;
    l.fillStyle = `rgba(${v},${v - 6},${v - 18},0.7)`;
    l.beginPath();
    l.arc(r() * size, r() * size, 0.8 + r() * 1.6, 0, Math.PI * 2);
    l.fill();
  }
  c.drawImage(letters, 0, 0);
  // Inner stitch ring.
  c.strokeStyle = 'rgba(239,235,225,0.55)';
  c.setLineDash([size * 0.02, size * 0.018]);
  c.lineWidth = size * 0.012;
  c.beginPath();
  c.arc(size / 2, size / 2, size * 0.42, 0, Math.PI * 2);
  c.stroke();
  return cv;
}

/** A small tile of rib knit for the collar, repeated around it. */
export function ribTile(size: number) {
  const make = () => Object.assign(document.createElement('canvas'), { width: size, height: size });
  const color = make();
  const height = make();
  const c = color.getContext('2d')!;
  const hc = height.getContext('2d')!;
  const r = rng(11);
  c.fillStyle = '#B1B0AB';
  c.fillRect(0, 0, size, size);
  for (let i = 0; i < size * size * 0.35; i++) {
    const t = r();
    c.fillStyle = t < 0.5 ? `rgba(112,111,107,${0.3 + r() * 0.3})` : `rgba(238,237,233,${0.3 + r() * 0.3})`;
    c.fillRect(r() * size, r() * size, 1, 1 + r() * 3);
  }
  hc.fillStyle = '#808080';
  hc.fillRect(0, 0, size, size);
  const wales = 4;
  const p = size / wales;
  for (let i = 0; i < wales; i++) {
    const x = i * p;
    c.fillStyle = 'rgba(0,0,0,0.09)';
    c.fillRect(x, 0, p * 0.4, size);
    const g = hc.createLinearGradient(x, 0, x + p, 0);
    g.addColorStop(0, '#303030');
    g.addColorStop(0.25, '#606060');
    g.addColorStop(0.6, '#e0e0e0');
    g.addColorStop(1, '#303030');
    hc.fillStyle = g;
    hc.fillRect(x, 0, p, size);
  }
  return { color, height };
}

/** Is this point on the cloth? Used to keep annotation anchors honest. */
export const onCloth = (x: number, y: number) => sample(x, y).d < 0;
