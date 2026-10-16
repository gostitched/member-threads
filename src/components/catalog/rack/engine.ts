/**
 * The endless rack: the catalog hung on one serpentine pipe that runs down the page.
 *
 * Changing category or searching runs the conveyor. The garments on screen leave at
 * speed, a blur of other stock streams past, and the new ones brake in and swing on
 * their hooks. One velocity profile drives the whole rack; every garment reads its
 * position, speed and acceleration from it analytically, and a damped pendulum per
 * garment turns that acceleration into swing.
 *
 * This is imperative DOM on purpose. A run keeps the outgoing garments alive while the
 * incoming ones are already in place, and streams throwaway ones between them, at 60fps.
 * React owns the controls around it; this owns what hangs.
 */

import type { CatalogProduct } from '@/lib/catalog/types';
import { EMPTY_HANGER, buildDefs, ctaMarkup, dividerMarkup, esc, itemMarkup, paintVars, type Mount } from './art';
import { paintOf } from '@/lib/catalog/util';
import { RackSound } from './sound';

/** `sec`: this piece opens a section of the rack; a spec-line marker sits over it on the rail. */
export type Slot = { p: CatalogProduct; sec?: { name: string; count: number; no: number } } | { div: { id: string; name: string; count: number; no?: number } } | { cta: true };
/** wake: the first run, the longest. category: a full run. search: a short shuffle, keeping what still matches. */
export type RunMode = 'intro' | 'wake' | 'category' | 'search' | 'none';

export interface RackElements {
  section: HTMLElement;
  rows: HTMLElement;
  head: HTMLElement;
  bar: HTMLElement;
  plate: HTMLElement;
}

export interface RackCallbacks {
  /** A garment was pulled forward: a good moment to prefetch its page. */
  onHover?: (href: string) => void;
  /** Navigate. Called once a garment is lifted off the rail. */
  onOpen: (href: string) => void;
  /** The empty rack's "Clear filters". */
  onClear?: () => void;
}

interface Layout {
  W: number;
  per: number;
  mobile: boolean;
  turn: number;
  x0: number;
  slot: number;
  gw: number;
  gh: number;
  railPad: number;
  infoTop: number;
  rowH: number;
  iw: number;
  tube: number;
  bendR: number;
  pw: number;
  ph: number;
  plateTop: number;
}

interface Spring {
  el: HTMLElement;
  swing: HTMLElement;
  tag: HTMLElement | null;
  rest: number;
  w0: number;
  amp: number;
  th: number;
  om: number;
  v: number;
  a: number;
  off: number;
  moving: boolean;
}

interface Row {
  el: HTMLElement;
  r: number;
  items: HTMLElement[];
}

type ItemType = 'arrive' | 'keep' | 'depart' | 'stream';
interface RunItem {
  type: ItemType;
  n: HTMLElement;
  st?: Spring;
  T: number;
  from?: number;
  done?: boolean;
  fast?: boolean;
}
interface RunRow {
  s: number;
  D: number;
  el: HTMLElement;
  layer: HTMLElement;
  glint: HTMLElement;
  items: RunItem[];
}
interface Run {
  t0: number;
  T: number;
  rows: RunRow[];
}

const SVGNS = 'http://www.w3.org/2000/svg';
const TWO_PI = Math.PI * 2;
const W0: Record<Mount | 'div' | 'empty', number> = {
  top: TWO_PI * 1.2,
  bottom: TWO_PI * 0.95,
  head: TWO_PI * 1.75,
  div: TWO_PI * 1.45,
  empty: TWO_PI * 1.3,
};

const hash = (s: string) => {
  let h = 2166136261;
  for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return h >>> 0;
};

// ── the velocity profile ─────────────────────────────────────────────────────
// A hard shove, a flat-out run, a long braking curve; tabulated once and normalised
// so position runs 0→1.
const UA = 0.14;
const UB = 0.4;
const DEC = 1.6;
const vel = (u: number) => (u < UA ? Math.sin(((Math.PI / 2) * u) / UA) : u < UB ? 1 : Math.pow(1 - (u - UB) / (1 - UB), DEC));
const dvel = (u: number) =>
  u < UA
    ? (Math.PI / 2 / UA) * Math.cos(((Math.PI / 2) * u) / UA)
    : u < UB
      ? 0
      : (-DEC / (1 - UB)) * Math.pow(1 - (u - UB) / (1 - UB), DEC - 1);
const LUT_N = 800;
const LUT = new Float64Array(LUT_N + 1);
let AREA = 0;
for (let i = 1; i <= LUT_N; i++) {
  AREA += (vel((i - 1) / LUT_N) + vel(i / LUT_N)) / 2 / LUT_N;
  LUT[i] = AREA;
}
for (let i = 0; i <= LUT_N; i++) LUT[i] /= AREA;
function prof(u: number): [number, number, number] {
  if (u <= 0) return [0, 0, 0];
  if (u >= 1) return [1, 0, 0];
  const f = u * LUT_N;
  const i = f | 0;
  const k = f - i;
  return [LUT[i] + (LUT[i + 1] - LUT[i]) * k, vel(u) / AREA, dvel(u) / AREA];
}

// Pendulum constants. θ in degrees, v in px/s, a in px/s².
const G = 0.0042;
const KV = 0.00021;
const ZETA = 0.28;
const KICK = 20;
const CLAMP = 5.5;

// The rail: one solid pipe in --rk-pipe (rack.css), with a single soft highlight down
// its middle so it still reads as a tube. Straights are shaded across their diameter;
// each elbow gets a radial gradient centred on its bend, so the cross-section follows the curve.
const PIPE: Array<[number, number]> = [[0, 0.78], [0.3, 0.86], [0.45, 1], [0.55, 1], [0.7, 0.86], [1, 0.78]];
const stops = (map = (p: number) => p) =>
  PIPE.map(([p, o]) => `<stop offset="${map(p).toFixed(4)}" style="stop-color:var(--rk-pipe);stop-opacity:${o}"/>`).join('');


export function createRack(els: RackElements, cb: RackCallbacks) {
  const { section, rows: rowsEl, head, bar, plate } = els;
  const RM = window.matchMedia('(prefers-reduced-motion: reduce)');
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
  const sound = new RackSound();

  const defs = document.createElementNS(SVGNS, 'svg');
  defs.setAttribute('aria-hidden', 'true');
  defs.setAttribute('class', 'rk-defs');
  defs.innerHTML = `<defs>${buildDefs()}</defs>`;
  section.prepend(defs);
  const railEl = document.createElementNS(SVGNS, 'svg');
  railEl.setAttribute('class', 'rk-rail');
  railEl.setAttribute('aria-hidden', 'true');
  rowsEl.appendChild(railEl);

  const reg = new WeakMap<Element, Spring>();
  const active = new Set<Spring>();
  const timers = new Set<number>();
  let lay: Layout;
  let rows: Row[] = [];
  let slots: Slot[] = [];
  /** Where along the second run the tag hangs, 0…1. Picked per change, kept across resizes. */
  let ctaAt = Math.random();
  let pool: CatalogProduct[] = [];
  let tr: Run | null = null;
  let raf = 0;
  let lastT = 0;
  let hot: HTMLElement | null = null;
  let fly: HTMLElement | null = null;
  let leaving = false;
  let lastW = 0;

  const later = (fn: () => void, ms: number) => {
    const id = window.setTimeout(() => {
      timers.delete(id);
      fn();
    }, ms);
    timers.add(id);
  };

  // ── layout ─────────────────────────────────────────────────────────────────
  function computeLayout(): Layout {
    const W = rowsEl.clientWidth || window.innerWidth;
    const per = W >= 1560 ? 5 : W >= 1000 ? 4 : W >= 660 ? 3 : 2;
    const mobile = per === 2;
    const turn = mobile ? 12 : Math.round(Math.max(22, Math.min(42, W * 0.024)));
    const x0 = turn + (mobile ? 12 : 20);
    // A slim rail: present, not the subject.
    const tube = mobile ? 5 : 7;
    const bendR = mobile ? 14 : 24;
    const slot = (W - 2 * x0) / per;
    const gw = Math.round(Math.min(slot * 1.04, 400));
    const gh = Math.round(gw * 0.85);
    const railPad = mobile ? 26 : 30;
    // Each piece hangs in front of a cream 4:5 plate, one gutter narrower than its slot.
    const pw = Math.round(Math.min(slot - (mobile ? 10 : 24), gw));
    const ph = Math.round(pw * 1.25);
    const plateTop = railPad + 14;
    const infoTop = plateTop + ph + (mobile ? 10 : 16);
    const rowH = infoTop + (mobile ? 84 : 94) + (mobile ? 14 : 40);
    const iw = Math.max(80, Math.round(Math.min(slot, gw) - (mobile ? 10 : 28)));
    return { W, per, mobile, turn, x0, slot, gw, gh, railPad, infoTop, rowH, iw, tube, bendR, pw, ph, plateTop };
  }
  function applyLayoutVars() {
    const s = rowsEl.style;
    s.setProperty('--gw', `${lay.gw}px`);
    s.setProperty('--gh', `${lay.gh}px`);
    s.setProperty('--railPad', `${lay.railPad}px`);
    s.setProperty('--infoTop', `${lay.infoTop}px`);
    s.setProperty('--rowH', `${lay.rowH}px`);
    s.setProperty('--iw', `${lay.iw}px`);
    s.setProperty('--tube', `${lay.tube}px`);
    s.setProperty('--pw', `${lay.pw}px`);
    s.setProperty('--ph', `${lay.ph}px`);
    s.setProperty('--plateTop', `${lay.plateTop}px`);
    head.style.paddingInline = `${lay.x0 + (lay.mobile ? 4 : 10)}px ${lay.x0}px`;
  }
  const slotLeft = (k: number) => lay.x0 + k * lay.slot + (lay.slot - lay.gw) / 2;

  // ── springs ────────────────────────────────────────────────────────────────
  function ensureState(el: HTMLElement, key: string, mount: Mount | 'div' | 'empty'): Spring {
    const had = reg.get(el);
    if (had) return had;
    const h = hash(key);
    const st: Spring = {
      el,
      swing: el.querySelector<HTMLElement>('.rk-swing')!,
      tag: el.querySelector<HTMLElement>('.rk-tag'),
      rest: (((h % 19) - 9) / 10) * (mount === 'div' ? 0.5 : 1), // −0.9°…+0.9°: believable, not messy
      w0: W0[mount] * (0.93 + ((h >> 8) % 15) / 100),
      amp: mount === 'div' ? 0.6 : 1,
      th: 0,
      om: 0,
      v: 0,
      a: 0,
      off: 0,
      moving: false,
    };
    st.swing.style.transform = `rotate(${st.rest}deg)`;
    reg.set(el, st);
    return st;
  }
  function wake(st: Spring) {
    if (RM.matches) return;
    active.add(st);
    if (!raf) {
      lastT = 0;
      raf = requestAnimationFrame(tick);
    }
  }
  function tick(now: number) {
    const dt = lastT ? Math.min(0.034, (now - lastT) / 1000) : 0.016;
    lastT = now;
    if (tr) stepRun(now);
    for (const st of active) stepSpring(st, dt);
    raf = tr || active.size ? requestAnimationFrame(tick) : 0;
  }
  function stepSpring(st: Spring, dt: number) {
    if (!st.el.isConnected) {
      active.delete(st);
      return;
    }
    const w2 = st.w0 * st.w0;
    const c = 2 * ZETA * st.w0;
    const h = dt / 2;
    for (let k = 0; k < 2; k++) {
      const acc = -w2 * (st.th - KV * st.v) - c * st.om + G * st.a;
      st.om += acc * h;
      st.th += st.om * h;
    }
    if (st.th > CLAMP) {
      st.th = CLAMP;
      st.om = Math.min(st.om, 0);
    }
    if (st.th < -CLAMP) {
      st.th = -CLAMP;
      st.om = Math.max(st.om, 0);
    }
    st.swing.style.transform = `rotate(${(st.rest + st.th * st.amp).toFixed(3)}deg)`;
    if (st.tag) st.tag.style.transform = `rotate(${Math.max(-10, Math.min(10, -st.om * 0.06)).toFixed(2)}deg)`;
    if (!st.moving && Math.abs(st.th) < 0.015 && Math.abs(st.om) < 0.04) {
      st.th = st.om = st.v = st.a = 0;
      st.swing.style.transform = `rotate(${st.rest}deg)`;
      if (st.tag) st.tag.style.transform = '';
      active.delete(st);
    }
  }

  // ── building the rack ──────────────────────────────────────────────────────
  function makeItem(p: CatalogProduct, stream: boolean, sec?: { name: string; count: number; no: number }): HTMLElement {
    const el = document.createElement(stream ? 'div' : 'a');
    const { html, mount, photo, cutout } = itemMarkup(p, stream);
    el.className = `rk-g${stream ? ' rk-stream' : ''}${photo ? ' rk-ph' : ''}${cutout ? ' rk-co' : ''}`;
    el.innerHTML = html;
    if (sec && !stream) {
      const m = document.createElement('span');
      m.className = 'rk-sec';
      m.innerHTML = `${sec.no ? `<b>${String(sec.no).padStart(2, '0')}</b> ` : ''}${esc(sec.name)} <i>· ${String(sec.count).padStart(2, '0')}</i>`;
      el.prepend(m);
    }
    if (stream) {
      el.setAttribute('aria-hidden', 'true');
    } else {
      (el as HTMLAnchorElement).href = `/catalog/${encodeURIComponent(p.slug)}`;
      el.dataset.slug = p.slug;
      // Drawn pieces with more than one colorway cycle through them under the pointer.
      if (!photo && p.colorways.length > 1) {
        el.dataset.cw = JSON.stringify(p.colorways.map((c) => [c.name, paintVars(paintOf(c))]));
      }
      ensureState(el, p.slug, mount);
    }
    return el;
  }
  function makeDivider(d: { id: string; name: string; count: number; no?: number }): HTMLElement {
    const el = document.createElement('div');
    el.className = 'rk-g rk-divider';
    el.setAttribute('role', 'heading');
    el.setAttribute('aria-level', '2');
    el.dataset.slug = `div-${d.id}`;
    el.innerHTML = dividerMarkup(d.name, d.count, d.no);
    ensureState(el, `div-${d.id}`, 'div');
    return el;
  }
  function makeCta(): HTMLElement {
    const el = document.createElement('div');
    el.className = 'rk-g rk-ctag';
    el.dataset.slug = 'cta';
    el.innerHTML = ctaMarkup();
    ensureState(el, 'cta', 'div');
    return el;
  }
  function makeEmpty(row: Row): DocumentFragment {
    const wrap = document.createDocumentFragment();
    const n = lay.per >= 4 ? 3 : 2;
    for (let k = 0; k < n; k++) {
      const el = document.createElement('div');
      el.className = 'rk-g rk-emptyhanger';
      el.setAttribute('aria-hidden', 'true');
      el.dataset.slug = `empty-${k}`;
      el.innerHTML = EMPTY_HANGER;
      el.style.left = `${slotLeft(Math.round((lay.per - n) / 2) + k)}px`;
      const st = ensureState(el, `empty-${k}`, 'empty');
      st.om = (k % 2 ? -1 : 1) * 14;
      wake(st);
      wrap.appendChild(el);
      row.items.push(el);
    }
    const msg = document.createElement('div');
    msg.className = 'rk-empty';
    msg.style.top = `${lay.railPad + 20 + lay.gh * 0.42}px`;
    msg.innerHTML = `<h3>No styles <em>match</em>.</h3><p>Try another search, or tell us what you need and we&rsquo;ll source it.</p><div class="rk-empty-ctas"><button type="button" class="btn-outline btn-sm">Clear filters</button><a class="btn-blue btn-sm" href="/quote" data-nav>Start a collection</a></div>`;
    msg.querySelector('button')?.addEventListener('click', () => cb.onClear?.());
    wrap.appendChild(msg);
    return wrap;
  }

  function renderRack() {
    lay = computeLayout();
    lastW = lay.W;
    applyLayoutVars();
    rowsEl.querySelectorAll(':scope > .rk-run').forEach((n) => n.remove());
    rows = [];
    // The tag always hangs on the second run, at a random spot along it. When the first
    // run isn't full, its gaps stay empty so the tag still drops to the second.
    const cta = slots.find((s) => 'cta' in s);
    const hung: Array<Slot | undefined> = cta ? slots.filter((s) => s !== cta) : [...slots];
    if (cta) {
      // Alone on its run it can hang anywhere; among garments it doesn't leave a gap before it.
      const col = Math.floor(ctaAt * lay.per);
      const at = lay.per + (hung.length > lay.per ? Math.min(hung.length - lay.per, col) : col);
      while (hung.length < at) hung.push(undefined);
      hung.splice(at, 0, cta);
    }
    const nRows = Math.max(1, Math.ceil(hung.length / lay.per));
    const frag = document.createDocumentFragment();
    for (let r = 0; r < nRows; r++) {
      const el = document.createElement('div');
      el.className = 'rk-run';
      el.style.top = `${r * lay.rowH}px`;
      el.style.height = `${lay.rowH}px`;
      el.style.containIntrinsicSize = `auto ${lay.rowH}px`;
      const row: Row = { el, r, items: [] };
      for (let k = 0; k < lay.per; k++) {
        const s = hung[r * lay.per + k];
        if (!s) continue;
        const node = 'div' in s ? makeDivider(s.div) : 'cta' in s ? makeCta() : makeItem(s.p, false, s.sec);
        node.style.left = `${slotLeft(k)}px`;
        el.appendChild(node);
        row.items.push(node);
      }
      if (!slots.length) el.appendChild(makeEmpty(row));
      rows.push(row);
      frag.appendChild(el);
    }
    rowsEl.appendChild(frag);
    rowsEl.style.height = `${nRows * lay.rowH}px`;
    drawRail(nRows);
  }

  function drawRail(n: number) {
    const { W, turn, rowH, railPad, tube: t, bendR: R, x0, slot, per } = lay;
    const H = n * rowH;
    const lead = rowsEl.offsetTop + 2;
    const h = t / 2;
    const cw = 7;
    const ch = t + 5;
    const straights: string[] = [];
    const bends: Array<{ cx: number; cy: number; d: string }> = [];
    const collars: string[] = [];
    const lines: string[] = [];
    const hSeg = (y: number, a: number, b: number) => {
      lines.push(`<path d="M${a} ${y}H${b}"/>`);
      straights.push(`<rect x="${Math.min(a, b) - 0.5}" y="${y - h}" width="${Math.abs(b - a) + 1}" height="${t}" fill="url(#rk-pv)"/>`);
    };
    const vSeg = (x: number, a: number, b: number) => {
      lines.push(`<path d="M${x} ${a}V${b}"/>`);
      straights.push(`<rect x="${x - h}" y="${Math.min(a, b) - 0.5}" width="${t}" height="${Math.abs(b - a) + 1}" fill="url(#rk-ph)"/>`);
    };
    const bend = (cx: number, cy: number, d: string) => bends.push({ cx, cy, d });
    const hCol = (x: number, y: number) =>
      collars.push(`<rect x="${x - cw / 2}" y="${y - ch / 2}" width="${cw}" height="${ch}" rx="1" fill="url(#rk-pv)" stroke="rgba(0,0,0,.35)" stroke-width="1"/>`);
    const vCol = (x: number, y: number) =>
      collars.push(`<rect x="${x - ch / 2}" y="${y - cw / 2}" width="${ch}" height="${cw}" rx="1" fill="url(#rk-ph)" stroke="rgba(0,0,0,.35)" stroke-width="1"/>`);
    const fit = 5 + cw / 2; // collars sit just past each elbow, like fittings

    // Lead-in: the pipe drops in from the top of the section and elbows into the first run.
    const y0 = railPad;
    vSeg(turn, -lead, y0 - R);
    bend(turn + R, y0 - R, `M${turn} ${y0 - R}A${R} ${R} 0 0 0 ${turn + R} ${y0}`);
    vCol(turn, y0 - R - fit);
    hCol(turn + R + fit, y0);

    for (let r = 0; r < n; r++) {
      const y = r * rowH + railPad;
      const yn = y + rowH;
      const last = r === n - 1;
      const right = r % 2 === 0;
      const xs = right ? turn + R : W - turn - R;
      const xe = last ? (right ? W + 30 : -30) : right ? W - turn - R : turn + R;
      hSeg(y, xs, xe);
      // Couplers between garments, every other slot.
      for (let k = 2; k < per; k += 2) hCol(x0 + k * slot, y);
      if (last) break;
      const x = right ? W - turn : turn;
      vSeg(x, y + R, yn - R);
      if (right) {
        bend(x - R, y + R, `M${x - R} ${y}A${R} ${R} 0 0 1 ${x} ${y + R}`);
        bend(x - R, yn - R, `M${x} ${yn - R}A${R} ${R} 0 0 1 ${x - R} ${yn}`);
      } else {
        bend(x + R, y + R, `M${x + R} ${y}A${R} ${R} 0 0 0 ${x} ${y + R}`);
        bend(x + R, yn - R, `M${x} ${yn - R}A${R} ${R} 0 0 0 ${x + R} ${yn}`);
      }
      const sx = right ? -1 : 1;
      hCol(x + sx * (R + fit), y);
      vCol(x, y + R + fit);
      vCol(x, yn - R - fit);
      hCol(x + sx * (R + fit), yn);
    }

    const inner = (R - h) / (R + h);
    const gdefs =
      `<linearGradient id="rk-pv" x1="0" y1="0" x2="0" y2="1">${stops()}</linearGradient>
      <linearGradient id="rk-ph" x1="0" y1="0" x2="1" y2="0">${stops()}</linearGradient>` +
      bends
        .map(
          (b, i) =>
            `<radialGradient id="rk-bd${i}" gradientUnits="userSpaceOnUse" cx="${b.cx}" cy="${b.cy}" r="${R + h}"><stop offset="0" style="stop-color:var(--rk-pipe);stop-opacity:0.78"/>${stops(
              (p) => inner + p * (1 - inner)
            )}</radialGradient>`
        )
        .join('');
    // Flat: the site keeps one shadow, and it isn't this one.
    const shadow = '';
    const blur = (t * 0.45).toFixed(1);
    const sdefs = `<filter id="rk-shv" x="-2%" y="-300%" width="104%" height="700%"><feGaussianBlur stdDeviation="${blur}"/></filter>
      <filter id="rk-shh" x="-300%" y="-2%" width="700%" height="104%"><feGaussianBlur stdDeviation="${blur}"/></filter>
      <filter id="rk-shb" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="${blur}"/></filter>`;

    railEl.setAttribute('width', String(W));
    railEl.setAttribute('height', String(H + 20));
    railEl.setAttribute('viewBox', `0 0 ${W} ${H + 20}`);
    railEl.innerHTML = `<defs>${gdefs}${sdefs}</defs>
      <g transform="translate(0 ${t * 1.3})">${shadow}</g>
      <g fill="none" stroke="rgba(19,51,39,.18)" stroke-width="${t + 2}">${lines.join('')}${bends.map((b) => `<path d="${b.d}"/>`).join('')}</g>
      <g>${straights.join('')}${bends.map((b, i) => `<path d="${b.d}" fill="none" stroke="url(#rk-bd${i})" stroke-width="${t}"/>`).join('')}</g>
      <g>${collars.join('')}</g>`;
  }

  // ── the run ────────────────────────────────────────────────────────────────
  const barBottom = () => bar.getBoundingClientRect().bottom;
  function rowsInView(list: Row[]) {
    const top = barBottom() + 30;
    const vh = window.innerHeight - 30;
    return list
      .filter((row) => {
        const b = row.el.getBoundingClientRect();
        return b.bottom > top && b.top < vh;
      })
      .slice(0, 3);
  }
  function capture() {
    return rowsInView(rows).map((row) =>
      [...row.el.children]
        .filter((n): n is HTMLElement => n.classList.contains('rk-g') && !n.classList.contains('rk-emptyhanger'))
        .map((n) => {
          const st = reg.get(n);
          return { n, st, x: parseFloat(n.style.left) + (st ? st.off : 0), slug: n.dataset.slug ?? '', used: false };
        })
    );
  }
  function endRun() {
    if (!tr) return;
    for (const row of tr.rows) {
      row.layer.remove();
      row.el.classList.remove('rk-anim');
    }
    for (const row of tr.rows)
      for (const it of row.items)
        if (it.type === 'arrive' || it.type === 'keep') {
          it.n.style.transform = '';
          it.n.classList.remove('rk-moving', 'rk-fast');
          if (it.st) {
            it.st.off = it.st.v = it.st.a = 0;
            it.st.moving = false;
          }
        }
    tr = null;
    plate.classList.remove('is-live');
    sound.silence();
  }

  function stickyOffset() {
    return (parseFloat(getComputedStyle(bar).top) || 0) + bar.offsetHeight;
  }

  function show(next: Slot[], nextPool: CatalogProduct[], mode: RunMode) {
    const reduce = RM.matches;
    const running = mode === 'wake' || mode === 'category' || mode === 'search';
    const old = running && !reduce ? capture() : [];
    // Interrupted mid-run: the garments on screen become the ones leaving, from wherever they are.
    if (tr) {
      for (const row of tr.rows) row.layer.remove();
      tr = null;
    }
    setHot(null);
    if (next !== slots) ctaAt = Math.random();
    slots = next;
    pool = nextPool;
    renderRack();

    if (running) {
      const target = head.getBoundingClientRect().top + window.scrollY - stickyOffset() - 6;
      if (window.scrollY > target) window.scrollTo({ top: target, behavior: 'instant' as ScrollBehavior });
    }
    if (mode === 'intro') return intro();
    if (!running) return;
    if (reduce) {
      rowsEl.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 180, easing: 'ease-out' });
      return;
    }

    const W = lay.W;
    const cfg = mode === 'wake' ? { T: 1000, S: 2.6, stag: 48 } : mode === 'category' ? { T: 740, S: 1.4, stag: 38 } : { T: 560, S: 0, stag: 30 };
    if (lay.mobile) {
      cfg.T *= 0.82;
      cfg.S = Math.min(cfg.S, 1.1);
      cfg.stag *= 0.8;
    }
    const D = W + cfg.S * W;
    const run: Run = { t0: performance.now(), T: cfg.T, rows: [] };
    const list = slots.flatMap((s) => ('p' in s ? [s.p] : []));
    const incoming = list.length ? list : pool;
    const between = pool.length ? pool : incoming;

    rowsInView(rows).forEach((row, j) => {
      const s = row.r % 2 === 0 ? 1 : -1; // serpentine: each run of rail feeds the other way
      const layer = document.createElement('div');
      layer.className = 'rk-layer';
      row.el.appendChild(layer);
      row.el.classList.add('rk-anim');
      const glint = document.createElement('div');
      glint.className = 'rk-glint';
      const trow: RunRow = { s, D, el: row.el, layer, glint, items: [] };
      const ghosts = old[j] ?? [];
      const keep = new Map<string, (typeof ghosts)[number]>();
      if (mode === 'search') ghosts.forEach((g) => keep.set(g.slug, g));
      const arrivals = row.items.filter((n) => !n.classList.contains('rk-emptyhanger'));
      arrivals.forEach((n, i) => {
        const st = reg.get(n);
        const g = keep.get(n.dataset.slug ?? '');
        if (g) {
          keep.delete(n.dataset.slug ?? '');
          g.used = true;
          if (st && g.st) {
            st.th = g.st.th;
            st.om = g.st.om;
          }
          trow.items.push({ type: 'keep', n, st, from: g.x - parseFloat(n.style.left), T: cfg.T * 0.85 });
        } else {
          const order = s > 0 ? i : arrivals.length - 1 - i; // the leading garment lands first
          n.classList.add('rk-moving');
          trow.items.push({ type: 'arrive', n, st, T: cfg.T + order * cfg.stag });
        }
      });
      for (const g of ghosts) {
        if (g.used) continue;
        g.n.style.left = `${g.x}px`;
        g.n.style.transform = '';
        g.n.style.removeProperty('--push');
        g.n.classList.remove('is-hot', 'rk-clack');
        g.n.classList.add('rk-moving');
        g.n.setAttribute('aria-hidden', 'true');
        g.n.tabIndex = -1;
        if (g.st) g.st.off = 0;
        layer.appendChild(g.n);
        trow.items.push({ type: 'depart', n: g.n, st: g.st, T: cfg.T });
      }
      // The inventory in between: a short, reused run of real garments at speed.
      if (cfg.S > 0 && between.length) {
        const sp = lay.slot * 0.9;
        const n = Math.ceil((cfg.S * W) / sp);
        for (let k = 0; k < n; k++) {
          const src = k >= n - 2 ? incoming : between;
          const node = makeItem(src[(Math.random() * src.length) | 0], true);
          node.style.left = `${(s > 0 ? W + k * sp : -(k + 1) * sp) + (lay.slot - lay.gw) / 2}px`;
          node.querySelector<HTMLElement>('.rk-swing')!.style.transform = `rotate(${-s * 2.2}deg)`;
          layer.appendChild(node);
          trow.items.push({ type: 'stream', n: node, T: cfg.T });
        }
      }
      layer.appendChild(glint);
      run.rows.push(trow);
    });

    tr = run;
    plate.classList.add('is-live');
    if (mode === 'wake' || mode === 'category') sound.engage(mode === 'wake');
    if (mode === 'wake') {
      plate.classList.remove('is-wake');
      void plate.offsetWidth;
      plate.classList.add('is-wake');
    }
    stepRun(run.t0);
    if (!raf) {
      lastT = 0;
      raf = requestAnimationFrame(tick);
    }
  }

  function stepRun(now: number) {
    if (!tr) return;
    const t = now - tr.t0;
    let busy = false;
    let vmax = 0;
    for (const row of tr.rows) {
      let rv = 0;
      for (const it of row.items) {
        if (it.done) continue;
        const u = t / it.T;
        const [p, pv, pa] = prof(u);
        const Ts = it.T / 1000;
        let off: number;
        let v: number;
        let a: number;
        if (it.type === 'arrive') {
          off = row.s * row.D * (1 - p);
          v = (-row.s * row.D * pv) / Ts;
          a = (-row.s * row.D * pa) / (Ts * Ts);
        } else if (it.type === 'keep') {
          const from = it.from ?? 0;
          off = from * (1 - p);
          v = (-from * pv) / Ts;
          a = (-from * pa) / (Ts * Ts);
        } else {
          off = -row.s * row.D * p;
          v = (-row.s * row.D * pv) / Ts;
          a = (-row.s * row.D * pa) / (Ts * Ts);
        }
        it.n.style.transform = `translate3d(${off.toFixed(1)}px,0,0)`;
        const fast = Math.abs(v) > 2400 && it.type !== 'stream';
        if (fast !== !!it.fast) {
          it.fast = fast;
          it.n.classList.toggle('rk-fast', fast);
        }
        if (it.st) {
          it.st.off = off;
          it.st.v = v;
          it.st.a = a;
          it.st.moving = u < 1;
          wake(it.st);
        }
        rv = Math.max(rv, Math.abs(v));
        if (u >= 1) {
          it.done = true;
          if (it.type === 'arrive' || it.type === 'keep') land(it, row);
        } else busy = true;
      }
      // A highlight racing along the chrome while the rack is at speed.
      const [pp] = prof(t / tr.T);
      const span = lay.W + 360;
      const gx = ((((-row.s * row.D * pp * 0.7) % span) + span) % span) - 180;
      row.glint.style.transform = `translate3d(${gx.toFixed(1)}px,0,0)`;
      row.glint.style.opacity = Math.min(1, rv / 5000).toFixed(2);
      vmax = Math.max(vmax, rv);
    }
    sound.speed(vmax);
    if (!busy) endRun();
  }

  const panOf = (el: Element) => {
    const r = el.getBoundingClientRect();
    return ((r.left + r.width / 2) / window.innerWidth * 2 - 1) * 0.7;
  };

  function land(it: RunItem, row: RunRow) {
    const n = it.n;
    const st = it.st;
    n.style.transform = '';
    n.classList.remove('rk-moving', 'rk-fast');
    if (st) {
      st.off = st.v = st.a = 0;
      st.moving = false;
      st.om += row.s * KICK * (it.type === 'keep' ? 0.35 : 1);
      wake(st);
    }
    n.classList.remove('rk-clack');
    void n.offsetWidth;
    n.classList.add('rk-clack');
    later(() => n.classList.remove('rk-clack'), 220);
    if (it.type === 'arrive') sound.land(((parseFloat(n.style.left) + lay.gw / 2) / lay.W) * 2 * 0.7 - 0.7);
  }

  // First paint: the rail draws in, then the hangers go on.
  function intro() {
    if (RM.matches) return;
    railEl.animate([{ clipPath: 'inset(-600px 100% -40px -40px)' }, { clipPath: 'inset(-600px -40px -40px -40px)' }], {
      duration: 950,
      easing: 'cubic-bezier(.3,.6,.2,1)',
    });
    rowsInView(rows).forEach((row, r) =>
      row.items.forEach((n, i) => {
        const d = 240 + r * 280 + (parseFloat(n.style.left) / lay.W) * 520;
        const kf = [
          { translate: '0 -22px', opacity: 0 },
          { translate: '0 0', opacity: 1 },
        ];
        const opt: KeyframeAnimationOptions = { duration: 460, delay: d, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'backwards' };
        n.querySelector('.rk-swing')?.animate(kf, opt);
        n.querySelector('.rk-hook')?.animate(kf, opt);
        n.querySelector('.rk-info')?.animate([{ opacity: 0 }, { opacity: 1 }], { ...opt, delay: d + 180 });
        const st = reg.get(n);
        if (st)
          later(() => {
            st.om += (i % 2 ? -1 : 1) * 16;
            wake(st);
          }, d + 300);
      })
    );
  }

  // ── colorways: a hovered piece cycles through its colors; a click locks one ──
  let cycle = 0;
  const cwOf = (g: HTMLElement): Array<[string, string]> | null => {
    try {
      return g.dataset.cw ? JSON.parse(g.dataset.cw) : null;
    } catch {
      return null;
    }
  };
  function paint(g: HTMLElement, i: number) {
    const list = cwOf(g);
    const svg = g.querySelector<SVGElement>('svg.rk-gm');
    if (!list || !svg || !list[i]) return;
    svg.setAttribute('style', list[i][1]);
    g.dataset.ci = String(i);
    const nm = g.querySelector('.rk-cwn');
    if (nm) nm.textContent = list[i][0];
  }
  function stopCycle(g: HTMLElement | null) {
    window.clearInterval(cycle);
    cycle = 0;
    // Let go without locking: back to its first colorway.
    if (g && g.dataset.cw && !g.classList.contains('is-locked') && g.dataset.ci && g.dataset.ci !== '0') paint(g, 0);
  }
  function startCycle(g: HTMLElement) {
    const list = cwOf(g);
    if (!list || RM.matches || g.classList.contains('is-locked')) return;
    let i = Number(g.dataset.ci ?? 0);
    cycle = window.setInterval(() => {
      if (!g.isConnected) return stopCycle(null);
      i = (i + 1) % list.length;
      paint(g, i);
    }, 900);
  }
  function lock(g: HTMLElement) {
    stopCycle(null);
    g.classList.add('is-locked');
    const i = Number(g.dataset.ci ?? 0);
    const href = g.getAttribute('href')!.split('?')[0];
    g.setAttribute('href', `${href}?color=${i}`);
    const vw = g.querySelector('.rk-vw');
    if (vw) vw.textContent = 'Held · View →';
    // The price tag turns lemon (CSS); colour moves, layout doesn't.
    sound.nudge(panOf(g));
  }

  // ── hover: pull it forward; the rest of the run slides aside on the rail ───
  function setHot(g: HTMLElement | null) {
    if (g === hot) return;
    stopCycle(hot);
    if (hot) {
      hot.classList.remove('is-hot');
      const run = hot.parentElement;
      if (run) {
        run.classList.remove('has-hot');
        run.querySelectorAll<HTMLElement>(':scope > .rk-g').forEach((n) => n.style.removeProperty('--push'));
      }
    }
    hot = g;
    if (!g) return;
    const run = g.parentElement;
    if (!run || run.classList.contains('rk-anim')) {
      hot = null;
      return;
    }
    g.classList.add('is-hot');
    run.classList.add('has-hot');
    if (fine.matches) startCycle(g);
    const sibs = [...run.querySelectorAll<HTMLElement>(':scope > .rk-g')];
    const idx = sibs.indexOf(g);
    const push = lay.mobile ? 0 : 10;
    sibs.forEach((n, j) => {
      if (j === idx) return;
      n.style.setProperty('--push', `${j < idx ? -push : push}px`);
      const st = reg.get(n);
      if (st && Math.abs(j - idx) === 1) {
        st.om += (j < idx ? 1 : -1) * 7;
        wake(st);
      }
    });
    const st = reg.get(g);
    if (st) {
      st.om += 6;
      wake(st);
    }
    sound.nudge(panOf(g));
    const href = g.getAttribute('href');
    if (href) cb.onHover?.(href);
  }
  const hanging = (target: EventTarget | null) => {
    const g = (target as Element | null)?.closest<HTMLElement>('a.rk-g');
    return g && g.parentElement?.classList.contains('rk-run') ? g : null;
  };
  const onMove = (e: PointerEvent) => {
    if (!fine.matches || e.pointerType !== 'mouse' || leaving) return;
    setHot(hanging(e.target));
  };
  const onLeave = () => setHot(null);
  const onFocusIn = (e: FocusEvent) => {
    const g = hanging(e.target);
    if (g) setHot(g);
  };
  const onFocusOut = () => setHot(null);

  // ── taking one off the rack ────────────────────────────────────────────────
  // It lifts off its hook and travels to where the product page puts its picture,
  // while the rack falls back; the page takes over from there.
  function pull(g: HTMLElement) {
    const href = g.getAttribute('href')!;
    const src = g.querySelector<HTMLElement | SVGElement>('.rk-gm');
    if (RM.matches || !src) return cb.onOpen(href);
    leaving = true;
    setHot(null);
    const s = src.getBoundingClientRect();
    const st = reg.get(g);
    fly = document.createElement('div');
    fly.className = g.classList.contains('rk-ph') ? 'rk-fly rk-ph' : 'rk-fly';
    fly.style.width = `${s.width}px`;
    fly.style.height = `${s.height}px`;
    const clone = src.cloneNode(true) as HTMLElement;
    if (clone.classList.contains('rk-cutout')) {
      // A cut-out is placed by inline box percentages; in flight it fills the fly box
      // instead, upright, at full resolution.
      clone.removeAttribute('style');
      clone.removeAttribute('loading');
      if (clone.dataset.full) (clone as HTMLImageElement).src = clone.dataset.full;
    }
    fly.appendChild(clone);
    document.body.appendChild(fly);
    src.style.visibility = 'hidden';
    section.classList.add('rk-leaving');

    // The product page's stage: the left column of the shell, under the breadcrumb.
    const vw = window.innerWidth;
    const pad = vw >= 640 ? 32 : 20;
    const shell = Math.min(vw, 1280);
    const inner = shell - 2 * pad;
    const col = vw >= 1024 ? ((inner - 64) * 1.15) / 2.15 : inner;
    const size = Math.min(col * 0.82, window.innerHeight * 0.62);
    const k = size / s.width;
    const tx = (vw - shell) / 2 + pad + (col - size) / 2;
    const ty = (vw >= 1024 ? 104 : vw >= 640 ? 72 : 64) + 90 + col * 0.09;
    const rot = st ? st.rest + st.th : 0;
    fly.animate(
      [
        { transform: `translate(${s.left}px,${s.top}px) rotate(${rot}deg)`, easing: 'cubic-bezier(.3,.7,.4,1)' },
        { transform: `translate(${s.left}px,${s.top - 16}px) scale(1.04) rotate(0deg)`, offset: 0.22, easing: 'cubic-bezier(.55,0,.1,1)' },
        { transform: `translate(${tx}px,${ty}px) scale(${k})` },
      ],
      { duration: 680, fill: 'forwards' }
    );
    sound.pull(panOf(g));
    // The empty hanger stays on the rail and sways.
    if (st) {
      st.om += 18;
      wake(st);
    }
    later(() => cb.onOpen(href), 260);
    // If the page never arrives, hang it back up rather than leave the rack dimmed.
    later(() => {
      fly?.remove();
      fly = null;
      src.style.visibility = '';
      section.classList.remove('rk-leaving');
      leaving = false;
    }, 6000);
  }
  const onClick = (e: MouseEvent) => {
    const target = e.target as Element;
    const nav = target.closest<HTMLAnchorElement>('a[data-nav]');
    const g = hanging(target);
    if ((!g && !nav) || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    if (nav) return cb.onOpen(nav.getAttribute('href')!);
    // First click on a cycling piece (mouse only; Enter on a link has detail 0) locks
    // its colorway and slaps the price tag; the next click takes it off the rack.
    if (g && g.dataset.cw && !g.classList.contains('is-locked') && fine.matches && e.detail > 0 && !RM.matches) return lock(g);
    if (!leaving && g) pull(g);
  };

  let rzTimer = 0;
  const onResize = () => {
    window.clearTimeout(rzTimer);
    rzTimer = window.setTimeout(() => {
      const W = rowsEl.clientWidth;
      if (!W || W === lastW) return;
      endRun();
      renderRack();
    }, 160);
  };

  rowsEl.addEventListener('pointermove', onMove);
  rowsEl.addEventListener('pointerleave', onLeave);
  rowsEl.addEventListener('focusin', onFocusIn);
  rowsEl.addEventListener('focusout', onFocusOut);
  rowsEl.addEventListener('click', onClick);
  window.addEventListener('resize', onResize);

  return {
    show,
    /** The slots last hung, to tell a real change from a re-render. */
    get slots() {
      return slots;
    },
    toggleSound: () => sound.toggle(),
    destroy() {
      window.clearInterval(cycle);
      cancelAnimationFrame(raf);
      raf = 0;
      window.clearTimeout(rzTimer);
      timers.forEach((id) => window.clearTimeout(id));
      rowsEl.removeEventListener('pointermove', onMove);
      rowsEl.removeEventListener('pointerleave', onLeave);
      rowsEl.removeEventListener('focusin', onFocusIn);
      rowsEl.removeEventListener('focusout', onFocusOut);
      rowsEl.removeEventListener('click', onClick);
      window.removeEventListener('resize', onResize);
      rowsEl.querySelectorAll(':scope > .rk-run').forEach((n) => n.remove());
      railEl.remove();
      defs.remove();
      fly?.remove();
      section.classList.remove('rk-leaving');
      plate.classList.remove('is-live', 'is-wake');
      sound.close();
    },
  };
}

export type Rack = ReturnType<typeof createRack>;
