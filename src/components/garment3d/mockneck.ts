import * as THREE from 'three';
import { ATLAS } from './config';

/**
 * The stand-in mockneck, generated in code.
 *
 * The flat silhouette is a signed distance field: a boxy body, two dropped-shoulder
 * sleeves hanging slightly forward and down, rib cuffs, a rib waistband, and a scooped
 * neck, blended with smooth unions so the armpits and shoulders read as cloth rather
 * than as joined shapes. Each face (front, back) is a grid laid over that silhouette:
 * vertices outside are pulled onto the edge, and every vertex is lifted by its
 * distance from the edge with a round profile, so the two faces meet in a soft
 * rolled edge the way a heavyweight sweatshirt does. Folds, blousing over the
 * waistband and bunching above the cuffs are displacements on top.
 *
 * `surface()` answers "where is the cloth at this x/y", which is how patches sit on
 * the fabric and how annotation anchors find the garment.
 */

// ── Shape ────────────────────────────────────────────────────────────────────
const BODY = { cx: 0, cy: -0.02, hx: 0.76, hy: 0.6, r: 0.07 };
const BAND = { cx: 0, cy: -0.69, hx: 0.71, hy: 0.075, r: 0.025 };
const NECK = { cx: 0, cy: 0.71, r: 0.215 };
/** Sleeve axis: from the dropped shoulder, angled down and out. */
const SLEEVE = { ax: 0.6, ay: 0.32, angle: (-29 * Math.PI) / 180, len: 0.98, r0: 0.235, r1: 0.158 };
const CUFF = { len: 0.155, hw: 0.135, r: 0.022 };

const DEPTH = 0.15; // how far each face stands off the middle
const ROLL = 0.16; // how far in from the edge the roll-over finishes

const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const smin = (a: number, b: number, k: number) => {
  const h = clamp(0.5 + (0.5 * (b - a)) / k);
  return b * (1 - h) + a * h - k * h * (1 - h);
};
const smax = (a: number, b: number, k: number) => -smin(-a, -b, k);

function roundBox(px: number, py: number, b: { cx: number; cy: number; hx: number; hy: number; r: number }) {
  const qx = Math.abs(px - b.cx) - b.hx + b.r;
  const qy = Math.abs(py - b.cy) - b.hy + b.r;
  return Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - b.r;
}

type SleeveFrame = { along: number; across: number; t: number };

/** Local sleeve coordinates for the sleeve on the same side as x. */
function sleeveFrame(px: number, py: number): SleeveFrame {
  const x = Math.abs(px);
  const dx = Math.cos(SLEEVE.angle);
  const dy = Math.sin(SLEEVE.angle);
  const rx = x - SLEEVE.ax;
  const ry = py - SLEEVE.ay;
  const along = rx * dx + ry * dy;
  const across = -rx * dy + ry * dx; // + is the top edge of the sleeve
  return { along, across, t: along / SLEEVE.len };
}

function sleeveSdf(f: SleeveFrame) {
  const t = clamp(f.t);
  const r = SLEEVE.r0 + (SLEEVE.r1 - SLEEVE.r0) * t;
  const a = clamp(f.along, -0.05, SLEEVE.len);
  return Math.hypot(f.along - a, f.across) - r;
}

function cuffSdf(f: SleeveFrame) {
  const qx = Math.abs(f.along - (SLEEVE.len + CUFF.len / 2)) - CUFF.len / 2 + CUFF.r;
  const qy = Math.abs(f.across) - CUFF.hw + CUFF.r;
  return Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - CUFF.r;
}

export type Sample = {
  /** Signed distance to the edge: negative inside. */
  d: number;
  /** How much of this point belongs to the sleeve (0 body, 1 sleeve). */
  sleeve: number;
  frame: SleeveFrame;
  cuff: boolean;
  band: boolean;
};

export function sample(x: number, y: number): Sample {
  const frame = sleeveFrame(x, y);
  const body = smax(roundBox(x, y, BODY), NECK.r - Math.hypot(x - NECK.cx, y - NECK.cy), 0.06);
  const band = roundBox(x, y, BAND);
  const sl = sleeveSdf(frame);
  const cf = cuffSdf(frame);
  const torso = smin(body, band, 0.025);
  const arm = smin(sl, cf, 0.02);
  const d = smin(torso, arm, 0.085);
  const sleeve = clamp(0.5 + (torso - arm) / 0.16);
  return { d, sleeve, frame, cuff: frame.along > SLEEVE.len + 0.005 && cf < 0.01, band: y < BAND.cy + BAND.hy - 0.004 && Math.abs(x) < BAND.hx + 0.02 };
}

/** Pull a point outside the silhouette back onto its edge. */
function toEdge(x: number, y: number) {
  const e = 0.0015;
  for (let i = 0; i < 4; i++) {
    const d = sample(x, y).d;
    if (Math.abs(d) < 1e-4) break;
    const gx = (sample(x + e, y).d - sample(x - e, y).d) / (2 * e);
    const gy = (sample(x, y + e).d - sample(x, y - e).d) / (2 * e);
    const g = Math.hypot(gx, gy) || 1;
    x -= (d * gx) / g / g;
    y -= (d * gy) / g / g;
  }
  return [x, y] as const;
}

// ── Cloth ────────────────────────────────────────────────────────────────────
const hash = (x: number, y: number) => {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
};
function noise(x: number, y: number) {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;
  const u = fx * fx * (3 - 2 * fx);
  const v = fy * fy * (3 - 2 * fy);
  const a = hash(ix, iy);
  const b = hash(ix + 1, iy);
  const c = hash(ix, iy + 1);
  const d = hash(ix + 1, iy + 1);
  return (a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v) * 2 - 1;
}

/**
 * Where the cloth is. `side` is +1 for the front face, -1 for the back. Returns the
 * face's z and a 0–1 occlusion term (1 = open, lower in creases and at the roll).
 */
export function surface(x: number, y: number, side: 1 | -1) {
  const s = sample(x, y);
  const inside = Math.max(0, -s.d);
  const k = clamp(inside / ROLL);
  const roll = Math.sqrt(1 - (1 - k) * (1 - k)); // round over at the edge
  let depth = DEPTH;
  if (s.band) depth *= 0.8; // rib hugs tighter than the body
  if (s.cuff) depth *= 0.85;
  let z = depth * roll;

  // Folds, faded out toward the edge so the faces still meet cleanly.
  const open = clamp(inside / 0.12);
  const ph = side === 1 ? 0 : 2.1;
  const f = s.frame;
  const body = 1 - s.sleeve;
  const t = clamp(f.t);

  // Gravity: long soft verticals hanging off the shoulders, strongest mid-body.
  const drape = (Math.sin(x * 7.4 + ph + noise(x * 2, y * 2) * 1.4) * 0.5 + noise(x * 3.1 + ph, y * 1.2) * 0.5) * 0.024;
  // Blousing: the body spills over the rib just above it.
  const blouse = Math.exp(-(((y + 0.6) / 0.055) ** 2)) * 0.028 * clamp(1 - Math.abs(x) / 0.72);
  // Sleeves: rings of bunching toward the cuff, diagonal pulls under the arm.
  const bunch = Math.sin(f.along * 26 + noise(f.along * 4, f.across * 3 + ph) * 2.2 + ph) * 0.022 * t ** 1.4;
  const pull = Math.sin(f.along * 11 - f.across * 16 + ph) * 0.016 * (1 - t) * clamp(-f.across / 0.2);
  // Just above the cuff the sleeve stacks over it.
  const stack = Math.exp(-(((f.along - SLEEVE.len + 0.02) / 0.04) ** 2)) * 0.03;

  const fold = body * (drape + blouse) + s.sleeve * (bunch + pull + (s.cuff ? 0 : stack));
  z += fold * open;

  // The whole sample isn't flat: the body curves gently and the sleeves hang forward.
  const bow = -0.05 * (x / 0.8) ** 2 * body;
  const forward = s.sleeve * 0.2 * clamp(f.t + 0.1) ** 1.3;
  const zc = bow + forward;

  const crease = clamp(1 - Math.max(0, -fold) * 12);
  const ao = (0.62 + 0.38 * Math.pow(roll, 0.7)) * (0.82 + 0.18 * crease);
  return { z: zc + side * z, ao, sample: s };
}

// ── Geometry ─────────────────────────────────────────────────────────────────
function atlasUV(x: number, y: number, side: 1 | -1): [number, number] {
  const u = (x - ATLAS.minX) / (ATLAS.maxX - ATLAS.minX);
  const v = (y - ATLAS.minY) / (ATLAS.maxY - ATLAS.minY);
  return side === 1 ? [u * 0.5, v] : [0.5 + (1 - u) * 0.5, v];
}

/** Both faces of the body+sleeves as one mesh, sharing their edge. */
export function buildCloth(detail: number) {
  const nx = Math.round(260 * detail);
  const ny = Math.round(nx * ((ATLAS.maxY - ATLAS.minY) / (ATLAS.maxX - ATLAS.minX)));
  const W = ATLAS.maxX - ATLAS.minX;
  const H = ATLAS.maxY - ATLAS.minY;
  const gx = (i: number) => ATLAS.minX + (i / nx) * W;
  const gy = (j: number) => ATLAS.minY + (j / ny) * H;

  // Which cells are cloth, and each grid point's position once pulled onto the edge.
  const cellIn = new Uint8Array(nx * ny);
  for (let j = 0; j < ny; j++)
    for (let i = 0; i < nx; i++) cellIn[j * nx + i] = sample(gx(i + 0.5), gy(j + 0.5)).d < 0 ? 1 : 0;

  const index = new Int32Array((nx + 1) * (ny + 1)).fill(-1);
  const px: number[] = [];
  const py: number[] = [];
  const used = (i: number, j: number) =>
    [cellIn[(j - 1) * nx + (i - 1)], cellIn[(j - 1) * nx + i], cellIn[j * nx + (i - 1)], cellIn[j * nx + i]].some(
      (c, k) => {
        const ci = i - (k % 2 === 0 ? 1 : 0);
        const cj = j - (k < 2 ? 1 : 0);
        return ci >= 0 && cj >= 0 && ci < nx && cj < ny && c === 1;
      },
    );
  for (let j = 0; j <= ny; j++)
    for (let i = 0; i <= nx; i++) {
      if (!used(i, j)) continue;
      let x = gx(i);
      let y = gy(j);
      if (sample(x, y).d > 0) [x, y] = toEdge(x, y);
      index[j * (nx + 1) + i] = px.length;
      px.push(x);
      py.push(y);
    }

  const n = px.length;
  const pos = new Float32Array(n * 2 * 3);
  const uv = new Float32Array(n * 2 * 2);
  const col = new Float32Array(n * 2 * 3);
  const rib = new Float32Array(n * 2);
  for (const [f, side] of [
    [0, 1],
    [1, -1],
  ] as const) {
    for (let k = 0; k < n; k++) {
      const s = surface(px[k], py[k], side);
      const o = f * n + k;
      pos.set([px[k], py[k], s.z], o * 3);
      uv.set(atlasUV(px[k], py[k], side), o * 2);
      col.set([s.ao, s.ao, s.ao], o * 3);
      rib[o] = s.sample.band || s.sample.cuff ? 1 : 0;
    }
  }

  const idx: number[] = [];
  for (let j = 0; j < ny; j++)
    for (let i = 0; i < nx; i++) {
      if (!cellIn[j * nx + i]) continue;
      const a = index[j * (nx + 1) + i];
      const b = index[j * (nx + 1) + i + 1];
      const c = index[(j + 1) * (nx + 1) + i];
      const d = index[(j + 1) * (nx + 1) + i + 1];
      // Front faces +z, back faces -z.
      idx.push(a, b, d, a, d, c);
      idx.push(n + a, n + d, n + b, n + a, n + c, n + d);
    }

  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

/** The mock collar: a short rib tube with a rolled top edge and a darker inside. */
export function buildCollar() {
  const group = new THREE.Group();
  const h = 0.2;
  const rx = 0.205;
  const rz = 0.16;
  const bottom = 0.5;
  const seg = 72;

  const tube = (scale: number, inward: boolean) => {
    const g = new THREE.CylinderGeometry(1, 1.03, h, seg, 6, true);
    const p = g.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i);
      const y = p.getY(i);
      const z = p.getZ(i);
      // A slight lean back and a soft wobble so it isn't a machined cylinder.
      const wob = 1 + noise(Math.atan2(z, x) * 3, y * 4) * 0.02;
      p.setXYZ(i, x * rx * scale * wob, y + bottom + h / 2, z * rz * scale * wob - (y + h / 2) * 0.06);
    }
    if (inward) g.scale(1, 1, 1);
    g.computeVertexNormals();
    return g;
  };

  const outer = new THREE.Mesh(tube(1, false));
  outer.name = 'collar-outer';
  const inner = new THREE.Mesh(tube(0.9, true));
  inner.name = 'collar-inner';

  // The folded top edge.
  const rim = new THREE.TorusGeometry(1, 0.085, 10, seg);
  rim.rotateX(Math.PI / 2);
  const rp = rim.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < rp.count; i++) {
    const x = rp.getX(i);
    const y = rp.getY(i);
    const z = rp.getZ(i);
    const a = Math.atan2(z, x);
    const rr = Math.hypot(x, z);
    const R = 0.95 + (rr - 1);
    rp.setXYZ(i, Math.cos(a) * R * rx, y * 0.2 + bottom + h - 0.004, Math.sin(a) * R * rz - h * 0.06);
  }
  rim.computeVertexNormals();
  const rimMesh = new THREE.Mesh(rim);
  rimMesh.name = 'collar-rim';

  group.add(outer, inner, rimMesh);
  return group;
}

/** A small chrome hook, as if the sample hangs on a rail. */
export function buildHanger(material: THREE.Material) {
  const g = new THREE.Group();
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.009, 0.26, 12), material);
  stem.position.set(0, 0.8, -0.05);
  const hook = new THREE.Mesh(new THREE.TorusGeometry(0.075, 0.009, 10, 40, Math.PI * 1.35), material);
  hook.rotation.z = -Math.PI * 0.18;
  hook.position.set(0.07, 0.93, -0.05);
  g.add(stem, hook);
  return g;
}

/** A merrowed patch that sits on the cloth: a thick disc with a rolled edge. */
export function buildPatch(radius: number, face: THREE.Material, edge: THREE.Material) {
  const g = new THREE.Group();
  const t = 0.014;
  // Side wall, then a flat face (a circle maps its texture upright), then the
  // merrowed edge rolled over the rim.
  const wall = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, t, 64, 1, true), edge);
  wall.rotation.x = Math.PI / 2;
  const top = new THREE.Mesh(new THREE.CircleGeometry(radius, 64), face);
  top.position.z = t / 2;
  const merrow = new THREE.Mesh(new THREE.TorusGeometry(radius, 0.0085, 10, 80), edge);
  merrow.position.z = t / 2 - 0.002;
  g.add(wall, top, merrow);
  return g;
}

export const SHAPE = { SLEEVE, CUFF, BAND, BODY };
