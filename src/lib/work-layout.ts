import type { AssetKind, DrawnKind, WorkAsset, WorkItem } from './work';

/**
 * The Collections wall's layout engine.
 *
 * The wall is a stack of BANDS. Each band is a composition set by hand — slots with a
 * position, a size, a layer and a role — the way an art director would lay out one
 * spread. The engine only decides which asset fills which slot, so every band keeps
 * its hierarchy (one or two anchors, supporting pieces, small things in the gaps)
 * whatever work is in it, and nothing is ever placed at random.
 *
 * Units: the wall is 100 units wide. Everything, type included, is sized in units, so
 * a band holds its composition at any desktop width.
 *
 * Slots belong to GROUPS (0–3). A band takes the next few projects and gives the
 * richest one group 0, which holds the most slots, so one project anchors the band and
 * the others thread through it. A project's pieces are spread across its group's
 * slots, which sit apart from each other on purpose: the relationship is something
 * the visitor discovers on hover, not something the layout announces.
 */

export type Role = 'photo' | 'garment' | 'detail' | 'bit';

export type Slot = {
  g: 0 | 1 | 2 | 3;
  role: Role;
  x: number;
  y: number;
  w: number;
  /** Crop height for photo/detail/bit. Garments take their own height (square art). */
  h?: number;
  z?: number;
  /** Prefer this garment where it matters to the composition (a cap over a photo). */
  prefer?: DrawnKind[];
  /** Only a preferred garment will do; otherwise the slot stays empty. */
  strict?: boolean;
  /** Print the project credit beside this slot. */
  credit?: 'below' | 'below-end' | 'right' | 'left' | 'right-end';
  /** Write the asset's annotation here (unit offsets from the slot's top-left). */
  note?: { dx: number; dy: number; r: number; arrow?: 'down' | 'up' | 'left' | 'right' | 'down-left' };
};

export type Archetype = { id: string; groups: number; slots: Slot[] };

/** Which asset kinds may fill a role, in order of preference. */
const FILLS: Record<Role, AssetKind[]> = {
  photo: ['photo', 'detail'],
  detail: ['detail', 'photo'],
  garment: ['garment'],
  bit: ['artifact', 'detail'],
};

// ── archetypes ───────────────────────────────────────────────────────────────

/**
 * The first frame. Composed around the headline (top left, units 0–36 × 0–13) and the
 * category index (top right), with the anchor project (group 0, the band's
 * photographed project) scattered across the whole spread rather than gathered in one
 * corner: a tall portrait photo under the headline, a big cut-out garment top right,
 * a macro crop in the middle, a second portrait low on the right and one small piece
 * at the far edge. The other projects thread between them, so nothing announces which
 * pieces belong together until one is touched. Photo slots here are 3:4, the shape
 * phone and studio photography arrives in, so the anchor's pictures aren't cropped.
 */
const HERO: Archetype = {
  id: 'hero',
  groups: 4,
  slots: [
    // group 0: the anchor, scattered
    { g: 0, role: 'photo', x: 2, y: 16.5, w: 19.5, h: 26, z: 2, credit: 'below' },
    { g: 0, role: 'garment', x: 57.5, y: 5.5, w: 24.5, z: 4, prefer: ['hoodie', 'ziphoodie', 'jersey', 'crewneck', 'quarterzip', 'tee'] },
    { g: 0, role: 'detail', x: 40.5, y: 37.5, w: 10.8, h: 8.1, z: 3 },
    { g: 0, role: 'photo', x: 67.5, y: 33.5, w: 14, h: 18.67, z: 2 },
    { g: 0, role: 'detail', x: 89.5, y: 43, w: 8.5, h: 11.1, z: 3, note: { dx: -8.2, dy: 12.4, r: -4, arrow: 'up' } },
    // group 1
    { g: 1, role: 'photo', x: 24, y: 17, w: 17.5, h: 12.3, z: 1, credit: 'right-end' },
    { g: 1, role: 'garment', x: 36.5, y: 7.2, w: 11, z: 5, prefer: ['cap'], strict: true },
    { g: 1, role: 'garment', x: 16, y: 32.5, w: 19.5, z: 5, prefer: ['hoodie', 'ziphoodie', 'jersey', 'quarterzip', 'jacket'] },
    { g: 1, role: 'bit', x: 35.8, y: 31.4, w: 4, h: 4, z: 6 },
    { g: 1, role: 'photo', x: 53.2, y: 35.5, w: 11.2, h: 14.9, z: 1 },
    { g: 1, role: 'detail', x: 24.5, y: 52, w: 13.5, h: 8.5, z: 3 },
    // group 2
    { g: 2, role: 'garment', x: 41.5, y: 15.5, w: 16.5, z: 4, prefer: ['jersey', 'tee', 'babytee', 'tank'] },
    { g: 2, role: 'photo', x: 83.5, y: 6.5, w: 16.5, h: 11.5, z: 1, credit: 'below' },
    { g: 2, role: 'garment', x: 85, y: 20.5, w: 12.5, z: 5 },
    { g: 2, role: 'detail', x: 41.5, y: 48.5, w: 7.5, h: 10, z: 2 },
    { g: 2, role: 'bit', x: 50.5, y: 52.5, w: 4, h: 4, z: 3 },
    // group 3
    { g: 3, role: 'detail', x: 84, y: 30.5, w: 6.5, h: 9, z: 2, credit: 'left' },
    { g: 3, role: 'photo', x: 1, y: 48, w: 12, h: 16, z: 1 },
    { g: 3, role: 'garment', x: 55.5, y: 51.5, w: 12.5, z: 4, credit: 'below' },
    { g: 3, role: 'bit', x: 93, y: 34, w: 4, h: 4, z: 3 },
  ],
};

/** A huge garment on the left, a wide photo on the right with a garment breaking out of it. */
const GARMENT_DOMINANT: Archetype = {
  id: 'garment',
  groups: 3,
  slots: [
    { g: 0, role: 'garment', x: 2, y: 3, w: 26, z: 3, credit: 'below' },
    { g: 0, role: 'detail', x: 23.5, y: 20.5, w: 12.5, h: 15.5, z: 4 },
    { g: 0, role: 'photo', x: 29.5, y: 2, w: 19, h: 13.5, z: 1 },
    { g: 0, role: 'bit', x: 19.5, y: 5, w: 5, h: 5.6, z: 4 },
    { g: 2, role: 'garment', x: 3, y: 34.5, w: 12, z: 5 },
    { g: 1, role: 'photo', x: 53, y: 5.5, w: 27, h: 18.5, z: 1, note: { dx: 3, dy: -3.5, r: -5, arrow: 'down' } },
    { g: 1, role: 'garment', x: 72.5, y: 15.5, w: 18, z: 3 },
    { g: 1, role: 'bit', x: 49.5, y: 26.5, w: 4.8, h: 4.8, z: 2 },
    { g: 1, role: 'detail', x: 88.5, y: 35, w: 9.5, h: 11, z: 2, credit: 'below' },
    { g: 2, role: 'photo', x: 87.5, y: 1.5, w: 10.5, h: 14.5, z: 0 },
    { g: 2, role: 'detail', x: 38.5, y: 30.5, w: 17, h: 12, z: 2, credit: 'below' },
    { g: 2, role: 'garment', x: 56.5, y: 27.5, w: 15.5, z: 3 },
  ],
};

/** One wide lifestyle photo in the middle, garments tucked over both of its edges. */
const LIFESTYLE_DOMINANT: Archetype = {
  id: 'lifestyle',
  groups: 2,
  slots: [
    { g: 0, role: 'photo', x: 35, y: 3, w: 34, h: 23.5, z: 1, credit: 'below' },
    { g: 0, role: 'garment', x: 19, y: 11, w: 20, z: 3 },
    { g: 0, role: 'detail', x: 2.5, y: 4, w: 14, h: 18, z: 2 },
    { g: 0, role: 'bit', x: 14, y: 30, w: 5, h: 5, z: 3 },
    { g: 0, role: 'photo', x: 3.5, y: 27, w: 12.5, h: 15, z: 1 },
    { g: 1, role: 'garment', x: 64.5, y: 19, w: 19, z: 3, note: { dx: 13, dy: 16, r: -6, arrow: 'left' } },
    { g: 1, role: 'photo', x: 84, y: 3.5, w: 14, h: 20, z: 1 },
    { g: 1, role: 'detail', x: 49.5, y: 30.5, w: 12, h: 10, z: 2 },
    { g: 1, role: 'bit', x: 90.5, y: 28.5, w: 5, h: 6, z: 2 },
    { g: 1, role: 'garment', x: 86, y: 30, w: 12, z: 4 },
  ],
};

/** Detail crops lead; garments and photos fill in around them. */
const DETAIL_CLUSTER: Archetype = {
  id: 'detail',
  groups: 3,
  slots: [
    { g: 0, role: 'detail', x: 2, y: 2, w: 22, h: 15, z: 1 },
    { g: 0, role: 'garment', x: 17.5, y: 10, w: 17, z: 3, credit: 'right' },
    { g: 0, role: 'photo', x: 4, y: 20, w: 12, h: 14, z: 2 },
    { g: 1, role: 'detail', x: 38.5, y: 3.5, w: 11, h: 14, z: 2 },
    { g: 1, role: 'photo', x: 46.5, y: 10, w: 22, h: 16, z: 1, credit: 'below' },
    { g: 1, role: 'garment', x: 61.5, y: 1.5, w: 14, z: 3 },
    { g: 2, role: 'garment', x: 77.5, y: 7.5, w: 19.5, z: 2, note: { dx: -1, dy: -3.5, r: -4, arrow: 'down' } },
    { g: 2, role: 'detail', x: 73.5, y: 25.5, w: 10, h: 10, z: 3 },
    { g: 2, role: 'bit', x: 89, y: 28.5, w: 5, h: 5, z: 3 },
    { g: 1, role: 'bit', x: 37, y: 22, w: 4.4, h: 4.4, z: 2 },
  ],
};

/** Two tall portrait photos with garments overlapping their lower corners. */
const VERTICAL_CAMPAIGN: Archetype = {
  id: 'vertical',
  groups: 2,
  slots: [
    { g: 0, role: 'photo', x: 5, y: 3, w: 19, h: 27, z: 1, credit: 'right' },
    { g: 0, role: 'garment', x: 19.5, y: 20, w: 18.5, z: 3 },
    { g: 0, role: 'detail', x: 41, y: 11, w: 12, h: 15, z: 2 },
    { g: 0, role: 'bit', x: 37, y: 4, w: 4.2, h: 4.2, z: 2 },
    { g: 1, role: 'photo', x: 63, y: 7, w: 18, h: 26, z: 1 },
    { g: 1, role: 'garment', x: 49, y: 25, w: 19.5, z: 3, note: { dx: 2, dy: 20, r: -5 } },
    { g: 1, role: 'detail', x: 84, y: 2.5, w: 14, h: 11, z: 2 },
    { g: 1, role: 'bit', x: 85, y: 34, w: 5, h: 5, z: 2 },
  ],
};

/** A run of garments at different sizes, with photos slipped behind. */
const PRODUCT_CLUSTER: Archetype = {
  id: 'product',
  groups: 3,
  slots: [
    { g: 0, role: 'photo', x: 15.5, y: 2, w: 12.5, h: 16, z: 1 },
    { g: 0, role: 'garment', x: 2.5, y: 6, w: 16.5, z: 3, credit: 'below' },
    { g: 0, role: 'detail', x: 20, y: 21, w: 10, h: 10, z: 2 },
    { g: 1, role: 'garment', x: 30, y: 3.5, w: 22, z: 3 },
    { g: 1, role: 'detail', x: 49.5, y: 18.5, w: 11.5, h: 12, z: 4 },
    { g: 1, role: 'photo', x: 47, y: 1, w: 11, h: 14, z: 1 },
    { g: 2, role: 'garment', x: 62, y: 2, w: 15, z: 2, note: { dx: 1, dy: -3.2, r: -5, arrow: 'down' } },
    { g: 2, role: 'photo', x: 77, y: 8, w: 20, h: 14, z: 1, credit: 'below' },
    { g: 2, role: 'bit', x: 70, y: 21.5, w: 4.6, h: 4.6, z: 3 },
  ],
};

/** For a filtered view with very little in it: one or two projects, set simply. */
const SOLO: Archetype = {
  id: 'solo',
  groups: 2,
  slots: [
    { g: 0, role: 'photo', x: 6, y: 4, w: 30, h: 21, z: 1, credit: 'below' },
    { g: 0, role: 'garment', x: 30, y: 10, w: 24, z: 3, note: { dx: 20, dy: 1, r: -6, arrow: 'left' } },
    { g: 0, role: 'detail', x: 56, y: 3, w: 14, h: 18, z: 2 },
    { g: 0, role: 'bit', x: 52, y: 27, w: 5, h: 5, z: 3 },
    { g: 0, role: 'garment', x: 72, y: 12, w: 17, z: 2 },
    { g: 1, role: 'photo', x: 76, y: 2, w: 15, h: 19, z: 1, credit: 'below' },
    { g: 1, role: 'garment', x: 57, y: 24, w: 17, z: 3 },
    { g: 1, role: 'detail', x: 8, y: 30, w: 13, h: 13, z: 2 },
  ],
};

const ROTATION = [GARMENT_DOMINANT, LIFESTYLE_DOMINANT, DETAIL_CLUSTER, VERTICAL_CAMPAIGN, PRODUCT_CLUSTER];

// ── placement ────────────────────────────────────────────────────────────────

export type Placed = {
  asset: WorkAsset;
  project: WorkItem;
  x: number;
  y: number;
  w: number;
  h: number;
  z: number;
  role: Role;
  credit?: Slot['credit'];
  note?: Slot['note'] & { text: string };
  /** First band on the page: loaded eagerly. */
  eager: boolean;
};

export type Layout = {
  items: Placed[];
  /** Total height, units. */
  h: number;
  /** Where each band starts, for placing the project panel. */
  bands: { y: number; h: number }[];
};

const area = (s: Slot) => s.w * (s.h ?? s.w);
const onWall = (p: WorkItem) => p.assets.filter((a) => a.wall !== false);
/** How many of a project's pieces are real photographs rather than stand-ins. */
const shot = (p: WorkItem) => p.assets.filter((a) => a.src).length;
const orientationOf = (s: Slot) => {
  const r = s.w / (s.h ?? s.w);
  return r > 1.15 ? 'landscape' : r < 0.87 ? 'portrait' : 'square';
};

/** Garments are drawn in a square; a cut-out photo carries its own proportions. */
function garmentHeight(a: WorkAsset, w: number) {
  return a.src && a.width && a.height ? (w * a.height) / a.width : w;
}

/**
 * Lay out the wall. Deterministic: the same projects always give the same wall.
 */
export function layoutWall(projects: WorkItem[]): Layout {
  const items: Placed[] = [];
  const bands: Layout['bands'] = [];
  const queue = [...projects];
  // Pools persist across bands: a piece a band had no slot for is offered to the next.
  // Pieces marked off the wall never enter them.
  const pools = new Map(projects.map((p) => [p.id, onWall(p)]));
  let carry: WorkItem[] = [];
  let y = 0;
  let rot = 0;
  let lastId = '';
  let first = true;

  while (queue.length || carry.length) {
    const remaining = queue.reduce((n, p) => n + onWall(p).length, 0) + carry.reduce((n, p) => n + pools.get(p.id)!.length, 0);
    let arch: Archetype;
    if (first) arch = remaining < 9 ? SOLO : HERO;
    else if (remaining < 7) arch = SOLO;
    else {
      // Try each composition against the work that's next and keep the one it fills
      // best: few empty slots, few pieces pushed on to a later band. Ties go to the
      // rotation order, so consecutive bands still vary.
      let best = -Infinity;
      arch = ROTATION[rot % ROTATION.length];
      ROTATION.forEach((cand, i) => {
        if (cand.id === lastId) return;
        const trial = new Map([...pools].map(([k, v]) => [k, [...v]]));
        const take = queue.slice(0, cand.groups);
        const placed = fillBand(cand, take, carry, trial, 0, false).length;
        const left = [...carry, ...take].reduce((n, p) => n + trial.get(p.id)!.length, 0);
        const score = placed - (cand.slots.length - placed) * 0.6 - left * 1.5 - ((i - rot + ROTATION.length) % ROTATION.length) * 0.01;
        if (score > best) { best = score; arch = cand; }
      });
      rot++;
    }
    lastId = arch.id;
    const take = queue.splice(0, arch.groups);
    const placed = fillBand(arch, take, carry, pools, y, first);
    carry = [...carry, ...take].filter((p) => pools.get(p.id)!.length);
    if (!placed.length) break;
    const top = first ? 0 : Math.min(...placed.map((p) => p.y));
    const bottom = Math.max(...placed.map((p) => p.y + p.h));
    // Pull the band up so its top sits under the last one, keeping a margin of air.
    const shift = first ? 0 : y - top;
    for (const p of placed) p.y += shift;
    items.push(...placed);
    bands.push({ y, h: bottom + shift - y });
    y = bottom + shift + (first ? 7 : 6);
    first = false;
    // A band isn't opened for a stray piece or two: they stay in their project's dossier.
    if (!queue.length && carry.reduce((n, p) => n + pools.get(p.id)!.length, 0) < 3) break;
  }

  placeCredits(items);
  return { items, h: y, bands };
}

/**
 * The part of a slot the eye reads as the object. A drawn garment sits inside its
 * square with air around it; a cut-out photo is trimmed to the garment already.
 */
export function bodyOf(p: Pick<Placed, 'x' | 'y' | 'w' | 'h' | 'role'> & { asset?: WorkAsset }) {
  if (p.role !== 'garment') return { x: p.x, y: p.y, w: p.w, h: p.h };
  const cut = !!p.asset?.src;
  const ix = p.w * (cut ? 0.05 : 0.17);
  const iy = p.h * (cut ? 0.05 : 0.2);
  return { x: p.x + ix, y: p.y + iy, w: p.w - ix * 2, h: p.h - iy * 2 };
}

/**
 * Credits go where the slot asks if that spot is clear, otherwise to the first clear
 * spot around the piece, otherwise nowhere: a credit printed over another picture
 * reads as a mistake, not as marginalia. Sizes are estimates in units for 10px mono.
 */
function placeCredits(items: Placed[]) {
  const boxes = items.map((p) => ({ p, b: bodyOf(p) }));
  const taken: { x: number; y: number; w: number; h: number }[] = [
    { x: 0, y: 0, w: 37, h: 13 }, // headline
    { x: 55, y: 0, w: 45, h: 4.5 }, // category index
  ];
  const hit = (r: { x: number; y: number; w: number; h: number }, self: Placed) =>
    r.x < 0 || r.x + r.w > 100 ||
    taken.some((t) => r.x < t.x + t.w && r.x + r.w > t.x && r.y < t.y + t.h && r.y + r.h > t.y) ||
    boxes.some(({ p, b }) => p !== self && r.x < b.x + b.w && r.x + r.w > b.x && r.y < b.y + b.h && r.y + r.h > b.y);
  for (const p of items) {
    if (!p.credit) continue;
    const chars = Math.max(p.project.title.length, p.project.sector.length);
    const cw = chars * 0.56 + 0.4;
    const ch = 3.5;
    const at = {
      below: { x: p.x, y: p.y + p.h + 0.9, w: cw, h: ch },
      right: { x: p.x + p.w + 1.1, y: p.y + 0.3, w: cw, h: ch },
      'right-end': { x: p.x + p.w + 1.1, y: p.y + p.h - ch, w: cw, h: ch },
      left: { x: p.x - 1.1 - cw, y: p.y + 0.3, w: cw, h: ch },
    } as const;
    const order = [p.credit === 'below-end' ? 'below' : p.credit, ...(['below', 'right-end', 'right', 'left'] as const).filter((c) => c !== p.credit)];
    const ok = order.find((c) => !hit(at[c], p));
    p.credit = ok;
    if (ok) taken.push(at[ok]);
  }
}

function fillBand(
  arch: Archetype,
  projects: WorkItem[],
  carry: WorkItem[],
  pools: Map<string, WorkAsset[]>,
  y0: number,
  eager: boolean,
): Placed[] {
  // A photographed project anchors the band, then the richest.
  const byGroup = [...projects].sort((a, b) => shot(b) - shot(a) || onWall(b).length - onWall(a).length);
  const out: Placed[] = [];

  const take = (p: WorkItem, slot: Slot): WorkAsset | undefined => {
    const pool = pools.get(p.id)!;
    const want = orientationOf(slot);
    for (const kind of FILLS[slot.role]) {
      const fits = pool
        .filter((a) => a.kind === kind && !(a.keepShape && slot.role !== 'garment' && a.orientation !== want))
        .sort((a, b) => (a.priority ?? 9) - (b.priority ?? 9));
      if (!fits.length) continue;
      const preferred = slot.prefer && fits.find((a) => a.garment && slot.prefer!.includes(a.garment));
      if (slot.strict && !preferred) return;
      const pick =
        preferred ||
        fits.find((a) => a.orientation === want) ||
        fits[0];
      pool.splice(pool.indexOf(pick), 1);
      return pick;
    }
  };

  const slots = [...arch.slots].sort((a, b) => area(b) - area(a));
  for (const slot of slots) {
    const own = byGroup[slot.g];
    // The slot's own project first; otherwise any project in the band with a spare
    // piece of the right kind, so a thin project doesn't leave holes.
    const order = [...(own ? [own] : []), ...carry, ...byGroup.filter((p) => p !== own)];
    let asset: WorkAsset | undefined;
    let project: WorkItem | undefined;
    for (const p of order) {
      asset = take(p, slot);
      if (asset) { project = p; break; }
    }
    if (!asset || !project) continue;
    const h = slot.role === 'garment' ? garmentHeight(asset, slot.w) : slot.h ?? slot.w;
    out.push({
      asset, project,
      x: slot.x, y: y0 + slot.y, w: slot.w, h,
      z: slot.z ?? 1, role: slot.role,
      credit: slot.credit,
      note: slot.note && asset.annotation ? { ...slot.note, text: asset.annotation } : undefined,
      eager,
    });
  }

  return out;
}

// ── phone ────────────────────────────────────────────────────────────────────

/**
 * On a phone the wall becomes a vertical editorial stream: a big photo, a garment
 * overlapping its corner, a detail set beside the next thing, and so on. Same pieces,
 * same order as the desktop wall, so the projects still interleave.
 */
export function layoutStream(desktop: Layout): Layout {
  const items: Placed[] = [];
  const seen = new Set<string>();
  let y = 0;
  let alt = false;
  let lastLead = '';
  const put = (src: Placed, x: number, yy: number, w: number, h: number, z: number, credit?: Placed['credit']) => {
    const first = !seen.has(src.project.id);
    seen.add(src.project.id);
    const p: Placed = { ...src, x, y: yy, w, h, z, credit: first ? credit : undefined, note: undefined, eager: items.length < 3 };
    items.push(p);
    return p;
  };
  const tall = (a: WorkAsset) =>
    a.keepShape && a.width && a.height ? a.height / a.width : a.orientation === 'portrait' ? 1.22 : a.orientation === 'landscape' ? 0.74 : 1;

  // Band by band, so the projects stay interleaved the way the desktop wall mixes them.
  for (const band of desktop.bands) {
    const inBand = desktop.items.filter((p) => p.y >= band.y - 0.01 && p.y < band.y + band.h).sort((a, b) => a.y - b.y || a.x - b.x);
    // The band's biggest photographs lead its stanzas.
    const photos = inBand.filter((p) => p.asset.kind === 'photo').sort((a, b) => b.w * b.h - a.w * a.h);
    const garments = inBand.filter((p) => p.asset.kind === 'garment');
    const smalls = inBand.filter((p) => p.asset.kind === 'detail' || p.asset.kind === 'artifact');

    while (photos.length || garments.length || smalls.length) {
      alt = !alt;
      // A stanza: a big photo with a garment breaking over its bottom edge. Consecutive
      // stanzas lead with different projects, so the stream stays mixed.
      const nextPh = photos.findIndex((x) => x.project.id !== lastLead);
      const ph = photos.length ? photos.splice(Math.max(0, nextPh), 1)[0] : undefined;
      if (ph) lastLead = ph.project.id;
      if (ph) {
        const w = alt ? 100 : 88;
        const x = alt ? 0 : 12;
        const h = w * tall(ph.asset);
        const P = put(ph, x, y + 6, w, h, 1, alt ? 'below' : 'below-end');
        y = P.y + P.h;
        // A photo's own project's garment first; a photo whose framing matters is
        // only ever touched by its own garment, and only just.
        const own = garments.findIndex((x) => x.project.id === ph.project.id);
        const g = own >= 0 ? garments.splice(own, 1)[0] : ph.asset.keepShape ? undefined : garments.shift();
        if (g) {
          const gw = 64;
          const gh = g.asset.src && g.asset.width && g.asset.height ? (gw * g.asset.height) / g.asset.width : gw;
          const G = put(g, alt ? 36 : 0, P.y + P.h - gh * (ph.asset.keepShape ? 0.16 : 0.42), gw, gh, 4);
          y = G.y + G.h;
        } else if (P.credit) y += 12;
      } else {
        // …or, with no photo left, two garments staggered side by side.
        const g1 = garments.shift();
        const g2 = garments.shift();
        if (g1) {
          const A = put(g1, alt ? 0 : 44, y + 4, 56, 56, 3, alt ? 'below' : 'below-end');
          let bottom = A.y + A.h;
          if (g2) {
            const B = put(g2, alt ? 46 : 0, y + 18, 54, 54, 4);
            bottom = Math.max(bottom, B.y + B.h);
          }
          y = bottom + (A.credit ? 10 : 0);
        }
      }
      // …then the small things, a pair set off-centre.
      const s1 = smalls.shift();
      if (s1) {
        const w1 = s1.asset.kind === 'artifact' ? 26 : 48;
        const A = put(s1, alt ? 52 : 0, y + 5, w1, w1 * tall(s1.asset), 2);
        let bottom = A.y + A.h;
        const s2 = smalls.shift();
        if (s2) {
          const w2 = s2.asset.kind === 'artifact' ? 24 : 40;
          const B = put(s2, alt ? 6 : 58, y + 14, w2, w2 * tall(s2.asset), 3);
          bottom = Math.max(bottom, B.y + B.h);
        }
        y = bottom;
      }
    }
    y += 6;
  }
  return { items, h: y + 4, bands: [{ y: 0, h: y }] };
}
