'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * "How custom are we talking?"
 *
 * One hoodie and one scrubber. The garment is built from its real pattern pieces
 * (hood, body, sleeves, cuffs, pocket), so the same drawing can be decorated,
 * treated, re-cut and finally pulled apart into a flat pattern on a drafting
 * table. Everything is driven by a single value `t` from 0 (start with ours) to
 * 1 (start from zero); each stage fades in over its own stretch of `t`, so the
 * garment interpolates rather than swapping between pictures.
 *
 * The stages are a picture of range, not tiers or services, so nothing here
 * carries a price.
 */

// ── Palette ──────────────────────────────────────────────────────────────────
const BONE = '#E7E2D6'; // our blank
const DYED = '#5A1E1A'; // garment-dyed oxblood
const WASHED = '#8A4638'; // after a mineral wash
const CREAM = '#EFE4CC'; // print, thread, patches
const PAPER = '#F1EDE5'; // the drafting table
const ELECTRIC = '#2B5BD7';
const INK = '#0E1A47';

const STAGES = [
  { n: '01', name: 'Start with ours', line: 'A clean blank, cut to a silhouette we’ve already perfected.' },
  { n: '02', name: 'Make it yours', line: 'Screen print, embroidery, your colors.' },
  { n: '03', name: 'Push it further', line: 'Washes, appliqué, patches, distressing.' },
  { n: '04', name: 'Change the garment', line: 'Fit, crop, shoulder, hood, fabric, proportions.' },
  { n: '05', name: 'Start from zero', line: 'Pattern, fabric, fit and construction. Every last detail.' },
] as const;

const TOOLS = [
  { id: 'embroidery', label: 'Embroidery' },
  { id: 'print', label: 'Print' },
  { id: 'wash', label: 'Wash' },
  { id: 'patches', label: 'Patches' },
  { id: 'fit', label: 'Fit' },
  { id: 'fabric', label: 'Fabric' },
  { id: 'construction', label: 'Construction' },
] as const;
type ToolId = (typeof TOOLS)[number]['id'];

type Anim = { t: number; px: number; py: number } & Record<ToolId, number>;
const REST: Anim = { t: 0, px: 0, py: 0, embroidery: 0, print: 0, wash: 0, patches: 0, fit: 0, fabric: 0, construction: 0 };

// ── Maths ────────────────────────────────────────────────────────────────────
const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
/** 0 before `a`, 1 after `b`, eased in between. */
const ease = (a: number, b: number, x: number) => {
  const k = clamp((x - a) / (b - a));
  return k * k * (3 - 2 * k);
};
function mix(a: string, b: string, t: number) {
  const p = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const [x, y] = [p(a), p(b)];
  return '#' + x.map((v, i) => Math.round(lerp(v, y[i], t)).toString(16).padStart(2, '0')).join('');
}
type Pt = { x: number; y: number };
const at = (a: Pt, b: Pt, t: number): Pt => ({ x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) });

/**
 * The hoodie's pieces for a given amount of re-cut `f` (0 = our block, 1 = boxy,
 * dropped shoulder, cropped, bigger hood). Drawn front-on around x = 500.
 */
function cut(f: number) {
  const cx = 500;
  const neckY = 210;
  const nw = 56;
  const w = 150 + 32 * f;
  const len = 660 - 70 * f;
  const drop = 30 * f;
  const flare = 26 * f;
  const h = 1 + 0.12 * f;
  const armY = 365 + drop * 1.3;

  const side = (s: -1 | 1) => {
    const X = (dx: number) => cx + s * dx;
    const sh = { x: X(w - 12 + drop * 1.1), y: 232 + drop * 0.9 };
    const co = { x: X(w + 118 + flare), y: 600 - 30 * f };
    const ci = { x: X(w + 52 + flare * 0.3), y: 622 - 30 * f };
    const arm = { x: X(w), y: armY };
    const sleeve = `M${sh.x} ${sh.y} Q${X(w + 58 + drop * 1.1 + flare)} ${sh.y + 90} ${co.x} ${co.y} L${ci.x} ${ci.y} Q${X(w + 18)} ${armY + 90} ${arm.x} ${arm.y} Z`;
    const cuffD = `M${co.x} ${co.y} L${ci.x} ${ci.y} L${ci.x} ${ci.y + 36} L${co.x + s * 2} ${co.y + 34} Z`;
    const mid = { x: (sh.x + co.x + ci.x + arm.x) / 4, y: (sh.y + co.y + ci.y + arm.y) / 4 };
    return { sh, co, ci, arm, sleeve, cuff: cuffD, mid, s };
  };
  const L = side(-1);
  const R = side(1);

  const body = `M${cx - nw} ${neckY} Q${cx} ${neckY + 50} ${cx + nw} ${neckY} L${R.sh.x} ${R.sh.y} L${R.arm.x} ${R.arm.y} L${cx + w - 3} ${len} L${cx - w + 3} ${len} L${L.arm.x} ${L.arm.y} L${L.sh.x} ${L.sh.y} Z`;
  const hood = `M${cx - nw - 6} ${neckY + 8} C${cx - nw - 58 * h} ${neckY - 60 * h} ${cx - 52 * h} ${neckY - 150 * h} ${cx} ${neckY - 152 * h} C${cx + 52 * h} ${neckY - 150 * h} ${cx + nw + 58 * h} ${neckY - 60 * h} ${cx + nw + 6} ${neckY + 8} Z`;
  const hoodInner = `M${cx - nw + 4} ${neckY + 2} C${cx - nw - 18 * h} ${neckY - 60 * h} ${cx - 30 * h} ${neckY - 108 * h} ${cx} ${neckY - 110 * h} C${cx + 30 * h} ${neckY - 108 * h} ${cx + nw + 18 * h} ${neckY - 60 * h} ${cx + nw - 4} ${neckY + 2} Q${cx} ${neckY + 44} ${cx - nw + 4} ${neckY + 2} Z`;
  const band = `M${cx - w + 3} ${len} L${cx + w - 3} ${len} L${cx + w - 5} ${len + 44} L${cx - w + 5} ${len + 44} Z`;
  const k = w / 150;
  const pTop = len - 170;
  const pBot = len - 40;
  const pocket = `M${cx - 92 * k} ${pTop} L${cx + 92 * k} ${pTop} L${cx + 118 * k} ${pBot} L${cx - 118 * k} ${pBot} Z`;

  return { cx, neckY, nw, w, len, armY, h, k, pTop, pBot, L, R, body, hood, hoodInner, band, pocket };
}

// ── Drawing helpers ──────────────────────────────────────────────────────────
const around = { transformBox: 'fill-box', transformOrigin: 'center' } as const;

/** Seam allowance, grain line and cutting note: what a piece looks like on the table. */
function PatternMarks({ d, c, label, o, grain = 70 }: { d: string; c: Pt; label: string; o: number; grain?: number }) {
  if (o <= 0.001) return null;
  const g = grain / 2;
  return (
    <g opacity={o}>
      <path
        d={d}
        fill="none"
        stroke={ELECTRIC}
        strokeWidth={1}
        strokeDasharray="5 4"
        vectorEffect="non-scaling-stroke"
        style={{ ...around, transform: 'scale(0.92)' }}
      />
      <path
        d={`M${c.x} ${c.y - g} V${c.y + g} M${c.x - 5} ${c.y - g + 8} L${c.x} ${c.y - g} L${c.x + 5} ${c.y - g + 8} M${c.x - 5} ${c.y + g - 8} L${c.x} ${c.y + g} L${c.x + 5} ${c.y + g - 8}`}
        stroke={ELECTRIC}
        strokeWidth={1.2}
        fill="none"
      />
      <text x={c.x + 10} y={c.y + 4} className="font-mono" fontSize={10} letterSpacing="0.1em" fill={ELECTRIC}>
        {label}
      </text>
    </g>
  );
}

/** A dimension line that draws itself in, with end ticks and a label along it. */
function Dim({ a, b, label, m }: { a: Pt; b: Pt; label: string; m: number }) {
  if (m <= 0.001) return null;
  const ang = Math.atan2(b.y - a.y, b.x - a.x);
  const nx = -Math.sin(ang) * 7;
  const ny = Math.cos(ang) * 7;
  const mid = at(a, b, 0.5);
  let deg = (ang * 180) / Math.PI;
  if (deg > 90) deg -= 180;
  if (deg < -90) deg += 180;
  return (
    <g>
      <path d={`M${a.x} ${a.y} L${b.x} ${b.y}`} stroke={INK} strokeWidth={1} fill="none" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - m} />
      <path
        d={`M${a.x - nx} ${a.y - ny} L${a.x + nx} ${a.y + ny} M${b.x - nx} ${b.y - ny} L${b.x + nx} ${b.y + ny}`}
        stroke={INK}
        strokeWidth={1}
        opacity={m}
      />
      <text
        x={mid.x}
        y={mid.y}
        transform={`rotate(${deg} ${mid.x} ${mid.y}) translate(0 -7)`}
        textAnchor="middle"
        className="font-mono"
        fontSize={10}
        letterSpacing="0.08em"
        fill={INK}
        opacity={ease(0.5, 1, m)}
      >
        {label}
      </text>
    </g>
  );
}

/** A callout: a dot on the garment, a hairline out, a note at the end. */
function Note({ from, to, text, o, anchor = 'start' }: { from: Pt; to: Pt; text: string; o: number; anchor?: 'start' | 'end' }) {
  if (o <= 0.001) return null;
  return (
    <g opacity={o}>
      <circle cx={from.x} cy={from.y} r={3} fill={ELECTRIC} />
      <path d={`M${from.x} ${from.y} L${to.x} ${to.y}`} stroke={ELECTRIC} strokeWidth={0.8} pathLength={1} strokeDasharray="1" strokeDashoffset={1 - o} />
      <text
        x={to.x + (anchor === 'start' ? 6 : -6)}
        y={to.y + 3}
        textAnchor={anchor}
        className="font-mono"
        fontSize={10}
        letterSpacing="0.1em"
        fill={ELECTRIC}
      >
        {text}
      </text>
    </g>
  );
}

/** A fabric swatch with a pinked bottom edge. */
function Swatch({ x, y, w, h, fill, label, rot, o }: { x: number; y: number; w: number; h: number; fill: string; label: string; rot: number; o: number }) {
  const teeth = Array.from({ length: Math.floor(w / 10) }, (_, i) => `L${x + w - i * 10 - 5} ${y + h + 6} L${x + w - (i + 1) * 10} ${y + h}`).join(' ');
  return (
    <g opacity={o} style={{ ...around, transform: `translateY(${(1 - o) * 24}px) rotate(${rot}deg)` }}>
      <path d={`M${x} ${y} H${x + w} V${y + h} ${teeth} Z`} fill={fill} stroke="rgba(0,0,0,0.18)" strokeWidth={1} />
      <text x={x} y={y - 7} className="font-mono" fontSize={9.5} letterSpacing="0.1em" fill={INK}>
        {label}
      </text>
    </g>
  );
}

// ── Component ────────────────────────────────────────────────────────────────
export default function HowCustom() {
  const cur = useRef<Anim>({ ...REST });
  const tgt = useRef<Anim>({ ...REST });
  const [v, setV] = useState<Anim>(REST);
  const frame = useRef<number | null>(null);
  const reduce = useRef(false);
  const dragging = useRef(false);
  const touched = useRef(false);
  const lastPointer = useRef<string>('mouse');
  const [active, setActive] = useState<ToolId | null>(null);
  const [wide, setWide] = useState(true);
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  // One damped loop for every animated value; it stops itself once everything settles.
  const step = useCallback(() => {
    const c = cur.current;
    const g = tgt.current;
    let moving = false;
    for (const k of Object.keys(c) as (keyof Anim)[]) {
      const rate = k === 't' ? (dragging.current ? 0.32 : 0.09) : k === 'px' || k === 'py' ? 0.07 : 0.14;
      const d = g[k] - c[k];
      if (reduce.current || Math.abs(d) < 0.0008) c[k] = g[k];
      else {
        c[k] += d * rate;
        moving = true;
      }
    }
    setV({ ...c });
    frame.current = moving ? requestAnimationFrame(step) : null;
  }, []);

  const drive = useCallback(
    (patch: Partial<Anim>) => {
      Object.assign(tgt.current, patch);
      if (frame.current == null) frame.current = requestAnimationFrame(step);
    },
    [step],
  );

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const wq = window.matchMedia('(min-width: 640px)');
    const sync = () => {
      reduce.current = mq.matches;
      setWide(wq.matches);
    };
    sync();
    mq.addEventListener('change', sync);
    wq.addEventListener('change', sync);
    return () => {
      mq.removeEventListener('change', sync);
      wq.removeEventListener('change', sync);
      if (frame.current != null) cancelAnimationFrame(frame.current);
    };
  }, []);

  // A single nudge on first sight, so it reads as something you can move.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        if (reduce.current || touched.current) return;
        drive({ t: 0.22 });
        window.setTimeout(() => {
          if (!touched.current) drive({ t: 0 });
        }, 1100);
      },
      { threshold: 0.45 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [drive]);

  // ── Scrubber ──
  const fromX = (clientX: number) => {
    const r = trackRef.current!.getBoundingClientRect();
    return clamp((clientX - r.left) / r.width);
  };
  const snap = () => drive({ t: Math.round(tgt.current.t * 4) / 4 });
  const goTo = (i: number) => {
    touched.current = true;
    drive({ t: clamp(i, 0, 4) / 4 });
  };

  // ── Try-it tools: hover on a mouse, tap to toggle on touch ──
  const preview = (id: ToolId | null) => {
    setActive(id);
    drive(Object.fromEntries(TOOLS.map((tool) => [tool.id, tool.id === id ? 1 : 0])) as Partial<Anim>);
  };

  // ── Everything below is derived from the animated values ──
  const t = v.t;
  // Each stage lands fully at its own stop on the scrubber (0, .25, .5, .75, 1).
  const deco = ease(0.07, 0.25, t);
  const adv = ease(0.32, 0.5, t);
  const recut = ease(0.57, 0.75, t);
  const e = ease(0.8, 1, t);
  const board = ease(0.88, 1, t);
  const measure = ease(0.92, 1, t);
  const notes = ease(0.95, 1, t);
  const payoff = ease(0.9, 1, t);

  const print = Math.max(deco, v.print);
  const emb = Math.max(deco, v.embroidery);
  const wash = Math.max(adv, v.wash);
  const patch = Math.max(adv, v.patches);
  const fit = Math.max(recut, v.fit);
  const explode = Math.max(e, v.construction * 0.16);
  const finish = 1 - e; // decoration fades as the garment becomes a pattern
  const seams = Math.max(adv * 0.7, v.construction, e);

  const g = cut(fit);
  const clothHex = mix(mix(BONE, DYED, deco), WASHED, wash * 0.65);
  const pieceFill = mix(clothHex, PAPER, e * 0.94);
  const edge = mix('#2A2320', ELECTRIC, Math.max(e, v.construction));
  const thread = mix(DYED, CREAM, deco);
  const stitch = mix(CREAM, ELECTRIC, Math.max(e, v.construction));
  const shade = mix(clothHex, '#000000', 0.28);

  // Zoom out as it breaks open; on a phone, start in close on the garment.
  const vb0 = wide ? [160, 20, 680, 740] : [200, 30, 600, 720];
  const vb1 = [0, 0, 1000, 800];
  const vb = vb0.map((n, i) => lerp(n, vb1[i], e)).join(' ');

  const piece = (dx: number, dy: number, rot: number, depth = 1) => ({
    ...around,
    transform: `translate(${dx * explode + v.px * depth * e * 18}px, ${dy * explode + v.py * depth * e * 12}px) rotate(${rot * explode}deg)`,
  });

  const stageIndex = t * 4;
  const upper = (s: -1 | 1): Pt => {
    const side = s === -1 ? g.L : g.R;
    const p = at(side.sh, side.co, 0.3);
    return { x: p.x - s * 14, y: p.y + 16 };
  };
  const band = (s: -1 | 1, k: number) => {
    const side = s === -1 ? g.L : g.R;
    const a = at(side.sh, side.co, k);
    const b = at(side.arm, side.ci, k);
    return `M${a.x} ${a.y} L${b.x} ${b.y}`;
  };

  const sleeveGroup = (s: -1 | 1) => {
    const side = s === -1 ? g.L : g.R;
    const u = upper(s);
    return (
      <g style={piece(130 * s, 70, 14 * s, 1.3)}>
        <path d={side.sleeve} fill={pieceFill} stroke={edge} strokeWidth={1.4} strokeLinejoin="round" />
        <path d={side.sleeve} fill="#fff" filter="url(#cs-wash)" opacity={wash * 0.45 * finish} />
        <path d={side.sleeve} fill="url(#cs-knit)" opacity={fit * 0.35 * finish} />
        {/* Appliqué bands near the cuff */}
        <g opacity={adv * finish}>
          <path d={band(s, 0.7)} stroke={CREAM} strokeWidth={9} />
          <path d={band(s, 0.79)} stroke={CREAM} strokeWidth={5} />
        </g>
        {s === -1 ? (
          // Embroidered monogram, upper arm
          <g opacity={emb * finish} style={{ ...around, transform: `scale(${1 + v.embroidery * 0.35})` }}>
            <circle cx={u.x} cy={u.y} r={15} fill="none" stroke={thread} strokeWidth={3} strokeDasharray="2.2 1.4" />
            <text x={u.x} y={u.y + 7} textAnchor="middle" className="font-serif" fontStyle="italic" fontSize={21} fill={thread}>
              S
            </text>
          </g>
        ) : (
          // Chenille patch, upper arm
          <g opacity={patch * finish} style={{ ...around, transform: `scale(${1 + v.patches * 0.3})` }}>
            <circle cx={u.x} cy={u.y} r={22} fill={CREAM} stroke="#C49A5A" strokeWidth={4} />
            <text x={u.x} y={u.y + 9} textAnchor="middle" className="font-serif" fontStyle="italic" fontSize={27} fill={DYED}>
              S
            </text>
          </g>
        )}
        <path d={`M${side.sh.x} ${side.sh.y} L${side.arm.x} ${side.arm.y}`} stroke={stitch} strokeWidth={1.3} strokeDasharray="4 3" opacity={seams} />
        <PatternMarks d={side.sleeve} c={side.mid} label={s === -1 ? 'SLEEVE · CUT 2' : ''} o={e} grain={110} />
        {s === -1 && (
          <Dim
            a={{ x: side.sh.x - 16, y: side.sh.y - 4 }}
            b={{ x: side.co.x - 16, y: side.co.y - 4 }}
            label="SLEEVE 62 CM"
            m={measure}
          />
        )}
      </g>
    );
  };

  const cuffGroup = (s: -1 | 1) => {
    const side = s === -1 ? g.L : g.R;
    return (
      <g style={piece(120 * s, 150, 28 * s, 1.6)}>
        <path d={side.cuff} fill={mix(clothHex, PAPER, e * 0.94)} stroke={edge} strokeWidth={1.2} strokeLinejoin="round" />
        <path d={side.cuff} fill="url(#cs-rib)" opacity={0.5 * finish} />
        <path d={side.cuff} fill="none" stroke={ELECTRIC} strokeDasharray="4 3" opacity={e} style={{ ...around, transform: 'scale(0.8)' }} vectorEffect="non-scaling-stroke" />
      </g>
    );
  };

  const chestY = 398 - fit * 14;

  return (
    <section
      ref={sectionRef}
      aria-labelledby="how-custom"
      className="relative overflow-hidden"
      style={{ background: mix('#1A2A5E', PAPER, e) }}
    >
      <div className="shell py-20 sm:py-28">
        <p className="label text-muted">You call the shots.</p>
        <h2 id="how-custom" className="caps mt-5 text-d1">
          How custom
          <br />
          are we talking?
        </h2>

        <div className="mt-12 grid gap-10 lg:mt-16 lg:grid-cols-[22rem_minmax(0,1fr)] lg:gap-x-10 lg:gap-y-10">
          {/* ── Readout + tools (beside the garment on desktop) ── */}
          <div className="order-2 flex min-w-0 flex-col lg:order-1 lg:row-span-2">
            <div className="grid min-h-[11rem] lg:min-h-[17rem]">
              {STAGES.map((s, i) => {
                const o = clamp(1 - Math.abs(stageIndex - i) * 1.8) * (i === 4 ? 1 - payoff : 1);
                return (
                  <div
                    key={s.n}
                    aria-hidden={o < 0.5}
                    className="[grid-area:1/1]"
                    style={{ opacity: o, transform: `translateY(${(stageIndex - i) * -10}px)`, pointerEvents: o < 0.5 ? 'none' : undefined }}
                  >
                    <p className="font-serif text-[clamp(4rem,8vw,7rem)] italic leading-[0.8] text-electric">{s.n}</p>
                    <p className="caps mt-4 text-d3">{s.name}</p>
                    <p className="mt-2 max-w-[30ch] text-[0.9375rem] text-muted">{s.line}</p>
                  </div>
                );
              })}
              {/* The payoff, in the same slot, where you're looking when you get there. */}
              <div
                aria-hidden={payoff < 0.5}
                className="[grid-area:1/1]"
                style={{ opacity: payoff, pointerEvents: payoff < 0.5 ? 'none' : undefined }}
              >
                <p className="label text-electric" style={{ transform: `translateY(${(1 - payoff) * 14}px)` }}>
                  You’re off the rack.
                </p>
                <p
                  className="caps mt-4 text-[clamp(2.75rem,5.2vw,4rem)] leading-[0.9] tracking-[-0.035em]"
                  style={{ transform: `translateY(${(1 - payoff) * 26}px)` }}
                >
                  Now we’re
                  <br />
                  making
                  <br />
                  clothes.
                </p>
              </div>
            </div>

            <div className="mt-8 lg:mt-auto">
              <p className="label text-muted">Play with it</p>
              <ul className="-mx-5 mt-3 flex gap-x-6 overflow-x-auto px-5 pb-2 lg:mx-0 lg:flex-col lg:gap-0 lg:overflow-visible lg:px-0 lg:pb-0">
                {TOOLS.map((tool) => {
                  const on = active === tool.id;
                  return (
                    <li key={tool.id} className="shrink-0">
                      <button
                        type="button"
                        aria-pressed={on}
                        onPointerDown={(ev) => (lastPointer.current = ev.pointerType)}
                        onPointerEnter={(ev) => ev.pointerType === 'mouse' && preview(tool.id)}
                        onPointerLeave={(ev) => ev.pointerType === 'mouse' && preview(null)}
                        onFocus={() => preview(tool.id)}
                        onBlur={() => preview(null)}
                        onClick={() => {
                          touched.current = true;
                          if (lastPointer.current === 'mouse') preview(tool.id);
                          else preview(on ? null : tool.id);
                        }}
                        className={`group flex items-baseline gap-3 py-1.5 text-left transition-colors duration-300 lg:py-1 ${on ? 'text-electric' : 'text-ink hover:text-electric'}`}
                      >
                        <span className="caps text-[1.125rem] tracking-[-0.01em] lg:text-[1.375rem]">{tool.label}</span>
                        <span
                          aria-hidden
                          className={`font-mono text-[12px] transition-all duration-300 ${on ? 'translate-x-0 opacity-100' : '-translate-x-1 opacity-0'}`}
                        >
                          →
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          {/* ── The garment ── */}
          <div className="order-1 min-w-0 lg:order-2">
            <div
              ref={stageRef}
              className="relative aspect-[5/6] w-full sm:aspect-[5/4] lg:aspect-[11/8]"
              onPointerMove={(ev) => {
                if (ev.pointerType !== 'mouse' || reduce.current) return;
                const r = ev.currentTarget.getBoundingClientRect();
                drive({ px: ((ev.clientX - r.left) / r.width - 0.5) * 2, py: ((ev.clientY - r.top) / r.height - 0.5) * 2 });
              }}
              onPointerLeave={() => drive({ px: 0, py: 0 })}
            >
              <svg viewBox={vb} className="absolute inset-0 h-full w-full" role="img" aria-label={`A hoodie at stage ${STAGES[Math.round(stageIndex)].n}: ${STAGES[Math.round(stageIndex)].name}`}>
                <defs>
                  <pattern id="cs-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M20 0H0V20" fill="none" stroke={ELECTRIC} strokeOpacity={0.08} strokeWidth={1} />
                  </pattern>
                  <pattern id="cs-grid-major" width="100" height="100" patternUnits="userSpaceOnUse">
                    <path d="M100 0H0V100" fill="none" stroke={ELECTRIC} strokeOpacity={0.18} strokeWidth={1} />
                  </pattern>
                  <pattern id="cs-knit" width="10" height="12" patternUnits="userSpaceOnUse">
                    <path d="M0 0L5 8L10 0" fill="none" stroke="rgba(0,0,0,0.35)" strokeWidth={0.8} />
                  </pattern>
                  <pattern id="cs-knit-big" width="22" height="26" patternUnits="userSpaceOnUse">
                    <rect width="22" height="26" fill={clothHex} />
                    <path d="M0 0L11 18L22 0" fill="none" stroke={shade} strokeWidth={4} />
                    <path d="M2 0L11 14L20 0" fill="none" stroke={mix(clothHex, '#FFFFFF', 0.22)} strokeWidth={1.4} />
                  </pattern>
                  <pattern id="cs-rib" width="6" height="10" patternUnits="userSpaceOnUse">
                    <path d="M3 0V10" stroke="rgba(0,0,0,0.3)" strokeWidth={1} />
                  </pattern>
                  <pattern id="cs-terry" width="9" height="9" patternUnits="userSpaceOnUse">
                    <rect width="9" height="9" fill={WASHED} />
                    <circle cx="4.5" cy="4.5" r="2.4" fill="none" stroke={mix(WASHED, '#FFFFFF', 0.28)} strokeWidth={1} />
                  </pattern>
                  <pattern id="cs-ribbed" width="7" height="10" patternUnits="userSpaceOnUse">
                    <rect width="7" height="10" fill={DYED} />
                    <path d="M2 0V10" stroke={mix(DYED, '#FFFFFF', 0.2)} strokeWidth={2} />
                  </pattern>
                  <pattern id="cs-twill" width="8" height="8" patternUnits="userSpaceOnUse">
                    <rect width="8" height="8" fill={CREAM} />
                    <path d="M0 8L8 0" stroke="rgba(0,0,0,0.14)" strokeWidth={1.4} />
                  </pattern>
                  {/* Mineral wash: mottled light patches, clipped to whatever it's applied to. */}
                  <filter id="cs-wash" x="0" y="0" width="100%" height="100%">
                    <feTurbulence type="fractalNoise" baseFrequency="0.016" numOctaves="3" seed="7" />
                    <feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  2.2 0 0 0 -0.95" />
                    <feComposite in2="SourceGraphic" operator="in" />
                  </filter>
                </defs>

                {/* The drafting table */}
                <g opacity={e}>
                  <rect x="-400" y="-100" width="1800" height="1000" fill="url(#cs-grid)" />
                  <rect x="-400" y="-100" width="1800" height="1000" fill="url(#cs-grid-major)" />
                </g>

                <g style={{ transform: `translate(${v.px * 8}px, ${v.py * 6}px)` }}>
                  {/* Material board: swatches, color references, trims */}
                  {board > 0.001 && (
                    <g>
                      <Swatch x={800} y={52} w={160} h={58} fill="url(#cs-terry)" label="01 LOOPBACK TERRY" rot={-3} o={ease(0, 0.6, board)} />
                      <Swatch x={806} y={148} w={150} h={46} fill="url(#cs-ribbed)" label="02 2×2 RIB" rot={2} o={ease(0.2, 0.8, board)} />
                      <Swatch x={812} y={230} w={140} h={26} fill="url(#cs-twill)" label="03 TWILL TAPE" rot={-1} o={ease(0.4, 1, board)} />
                      {[
                        { c: WASHED, name: 'WASHED OXBLOOD', ref: 'COLOR 01' },
                        { c: CREAM, name: 'BONE CREAM', ref: 'COLOR 02' },
                        { c: '#C49A5A', name: 'FELT TAN', ref: 'COLOR 03' },
                      ].map((chip, i) => {
                        const o = ease(0.15 + i * 0.2, 0.75 + i * 0.08, board);
                        return (
                          <g key={chip.ref} opacity={o} style={{ transform: `translateY(${(1 - o) * 18}px)` }}>
                            <rect x={28} y={40 + i * 78} width={92} height={62} fill="#1A2A5E" stroke="rgba(0,0,0,0.12)" />
                            <rect x={32} y={44 + i * 78} width={84} height={34} fill={chip.c} />
                            <text x={34} y={90 + i * 78} className="font-mono" fontSize={7.5} letterSpacing="0.08em" fill={INK}>
                              {chip.name}
                            </text>
                            <text x={34} y={99 + i * 78} className="font-mono" fontSize={7} letterSpacing="0.08em" fill="#6E6E6E">
                              {chip.ref}
                            </text>
                          </g>
                        );
                      })}
                      <g opacity={ease(0.6, 1, board)}>
                        <rect x={28} y={286} width={92} height={22} fill={CREAM} stroke="rgba(0,0,0,0.15)" />
                        <text x={74} y={301} textAnchor="middle" className="font-serif" fontStyle="italic" fontSize={12} fill={DYED}>
                          Sophie
                        </text>
                        <text x={28} y={322} className="font-mono" fontSize={7.5} letterSpacing="0.1em" fill={INK}>
                          WOVEN LABEL
                        </text>
                      </g>
                    </g>
                  )}

                  {/* Hood */}
                  <g style={piece(-240, -18, -9, 1.5)}>
                    <path d={g.hood} fill={pieceFill} stroke={edge} strokeWidth={1.4} strokeLinejoin="round" />
                    <path d={g.hood} fill="#fff" filter="url(#cs-wash)" opacity={wash * 0.45 * finish} />
                    <path d={g.hoodInner} fill={shade} opacity={finish} />
                    <PatternMarks d={g.hood} c={{ x: g.cx, y: g.neckY - 72 * g.h }} label="HOOD · CUT 2" o={e} grain={80} />
                  </g>

                  {sleeveGroup(-1)}
                  {sleeveGroup(1)}

                  {/* Body */}
                  <g style={piece(0, -10, 0, 0.6)}>
                    <path d={g.band} fill={pieceFill} stroke={edge} strokeWidth={1.2} opacity={(1 - fit) * finish} />
                    <path d={g.band} fill="url(#cs-rib)" opacity={(1 - fit) * 0.6 * finish} />
                    <path d={g.body} fill={pieceFill} stroke={edge} strokeWidth={1.4} strokeLinejoin="round" />
                    <path d={g.body} fill="#fff" filter="url(#cs-wash)" opacity={wash * 0.45 * finish} />
                    <path d={g.body} fill="url(#cs-knit)" opacity={Math.max(fit, v.fabric) * 0.35 * finish} />

                    {/* Screen print, softened by the wash */}
                    <g opacity={print * finish * (1 - wash * 0.25)} style={{ ...around, transform: `scale(${1 + v.print * 0.06})` }}>
                      <text x={g.cx} y={chestY} textAnchor="middle" className="font-serif" fontStyle="italic" fontSize={74} fill={thread}>
                        Sophie
                      </text>
                      <text x={g.cx} y={chestY + 28} textAnchor="middle" className="font-mono" fontSize={11} letterSpacing="0.34em" fill={thread}>
                        COLLECTION 01
                      </text>
                    </g>

                    {/* Drawcords and eyelets */}
                    <g opacity={finish}>
                      {[-1, 1].map((s) => (
                        <g key={s}>
                          <circle cx={g.cx + s * 24} cy={g.neckY + 24} r={3.2} fill="none" stroke={shade} strokeWidth={1.5} />
                          <path d={`M${g.cx + s * 24} ${g.neckY + 26} Q${g.cx + s * 30} ${g.neckY + 76} ${g.cx + s * 27} ${g.neckY + 124}`} stroke={mix(clothHex, '#FFFFFF', 0.35)} strokeWidth={3.5} fill="none" strokeLinecap="round" />
                          <rect x={g.cx + s * 27 - 2.5} y={g.neckY + 122} width={5} height={14} fill={INK} />
                        </g>
                      ))}
                    </g>

                    {/* Distressing and a woven label */}
                    <g opacity={adv * finish} stroke={CREAM} strokeWidth={1.3} strokeLinecap="round">
                      {[
                        [0, 0, 9, -3], [4, 5, 15, 2], [-2, 10, 7, 7], [30, -2, 38, -6], [34, 4, 44, 1],
                      ].map(([x1, y1, x2, y2], i) => (
                        <path key={i} d={`M${g.cx - g.w + 26 + x1} ${g.len - 34 + y1} L${g.cx - g.w + 26 + x2} ${g.len - 34 + y2}`} />
                      ))}
                    </g>
                    <g opacity={adv * finish}>
                      <rect x={g.cx + g.w - 62} y={g.len - 22} width={30} height={15} fill={CREAM} />
                      <text x={g.cx + g.w - 47} y={g.len - 11} textAnchor="middle" className="font-serif" fontStyle="italic" fontSize={10} fill={DYED}>
                        S
                      </text>
                    </g>

                    {/* Raw-edge crop */}
                    <g opacity={fit * finish} stroke={mix(clothHex, '#FFFFFF', 0.4)} strokeWidth={1}>
                      {Array.from({ length: Math.floor((g.w * 2 - 10) / 7) }, (_, i) => (
                        <path key={i} d={`M${g.cx - g.w + 8 + i * 7} ${g.len} v${4 + ((i * 7) % 5)}`} />
                      ))}
                    </g>

                    {/* Seams: contrast stitching first, construction lines at the end */}
                    <g opacity={seams} stroke={stitch} strokeWidth={1.3} strokeDasharray="4 3" fill="none">
                      <path d={`M${g.cx - g.w + 8} ${g.armY + 10} L${g.cx - g.w + 10} ${g.len - 8}`} />
                      <path d={`M${g.cx + g.w - 8} ${g.armY + 10} L${g.cx + g.w - 10} ${g.len - 8}`} />
                      <path d={`M${g.cx - g.w + 10} ${g.len - 10} L${g.cx + g.w - 10} ${g.len - 10} M${g.cx - g.w + 10} ${g.len - 16} L${g.cx + g.w - 10} ${g.len - 16}`} />
                      <path d={`M${g.cx - g.nw + 4} ${g.neckY + 6} Q${g.cx} ${g.neckY + 56} ${g.cx + g.nw - 4} ${g.neckY + 6}`} />
                    </g>

                    <PatternMarks d={g.body} c={{ x: g.cx, y: (g.neckY + g.len) / 2 + 60 }} label="FRONT · CUT 1 ON FOLD" o={e} grain={120} />
                    <Dim a={{ x: g.cx - g.w, y: g.armY - 4 }} b={{ x: g.cx + g.w, y: g.armY - 4 }} label="½ CHEST 64 CM" m={measure} />
                    <Dim a={{ x: g.cx + g.w + 22, y: g.R.sh.y }} b={{ x: g.cx + g.w + 22, y: g.len }} label="BODY 64 CM" m={measure} />
                  </g>

                  {/* Kangaroo pocket */}
                  <g style={piece(0, 190, 4, 1.8)}>
                    <path d={g.pocket} fill={pieceFill} stroke={edge} strokeWidth={1.3} strokeLinejoin="round" />
                    <path d={g.pocket} fill="#fff" filter="url(#cs-wash)" opacity={wash * 0.45 * finish} />
                    <path
                      d={`M${g.cx - 92 * g.k} ${g.pTop} Q${g.cx - 124 * g.k} ${g.pTop + 44} ${g.cx - 118 * g.k} ${g.pBot} M${g.cx + 92 * g.k} ${g.pTop} Q${g.cx + 124 * g.k} ${g.pTop + 44} ${g.cx + 118 * g.k} ${g.pBot}`}
                      stroke={shade}
                      strokeWidth={1.2}
                      fill="none"
                      opacity={finish}
                    />
                    <g opacity={adv * finish} stroke={CREAM} strokeWidth={1.3} strokeLinecap="round">
                      <path d={`M${g.cx + 70 * g.k} ${g.pTop + 4} l8 -5 M${g.cx + 76 * g.k} ${g.pTop + 8} l10 -2`} />
                    </g>
                    <path d={g.pocket} fill="none" stroke={stitch} strokeWidth={1.2} strokeDasharray="4 3" opacity={seams} style={{ ...around, transform: 'scale(0.94)' }} vectorEffect="non-scaling-stroke" />
                    <PatternMarks d={g.pocket} c={{ x: g.cx - 40, y: (g.pTop + g.pBot) / 2 }} label="POCKET · CUT 1" o={e} grain={60} />
                  </g>

                  {cuffGroup(-1)}
                  {cuffGroup(1)}

                  {/* Fabric, up close */}
                  {v.fabric > 0.001 && (
                    <g opacity={v.fabric}>
                      <circle cx={g.cx + 70} cy={g.armY + 20} r={92 * (0.85 + 0.15 * v.fabric)} fill="url(#cs-knit-big)" stroke={INK} strokeWidth={1.5} />
                      <circle cx={g.cx + 70} cy={g.armY + 20} r={92 * (0.85 + 0.15 * v.fabric) + 6} fill="none" stroke={INK} strokeWidth={0.8} />
                      <rect x={g.cx - 60} y={g.armY + 124} width={260} height={24} fill="#1A2A5E" stroke={INK} strokeWidth={1} />
                      <text x={g.cx + 70} y={g.armY + 140} textAnchor="middle" className="font-mono" fontSize={11} letterSpacing="0.12em" fill={INK}>
                        HEAVYWEIGHT LOOPBACK TERRY
                      </text>
                    </g>
                  )}

                  {/* Workshop notes (room for them only on a wider screen) */}
                  {wide && (
                    <g>
                      <Note from={{ x: g.L.sh.x, y: g.L.sh.y - 10 }} to={{ x: g.L.sh.x - 40, y: g.L.sh.y - 46 }} text="DROPPED SHOULDER" anchor="end" o={notes} />
                      <Note from={{ x: g.cx + 40, y: g.neckY + 70 }} to={{ x: 560, y: 150 }} text="GARMENT-DYED, MINERAL WASH" o={ease(0.2, 1, notes)} />
                      <Note from={{ x: g.cx + g.w - 30, y: g.len - 14 }} to={{ x: g.cx + g.w + 36, y: g.len + 30 }} text="RAW-EDGE CROP" o={ease(0.4, 1, notes)} />
                    </g>
                  )}
                </g>
              </svg>
            </div>

            {/* ── Scrubber ── */}
            <div className="mt-8">
              <div className="flex justify-between">
                <span className="label" style={{ color: mix('#0E1A47', '#9A9A9A', t) }}>Start with ours</span>
                <span className="label" style={{ color: mix('#9A9A9A', '#0E1A47', t) }}>Start from zero</span>
              </div>
              <div
                ref={trackRef}
                role="slider"
                tabIndex={0}
                aria-label="How custom"
                aria-valuemin={1}
                aria-valuemax={5}
                aria-valuenow={Math.round(stageIndex) + 1}
                aria-valuetext={STAGES[Math.round(stageIndex)].name}
                className="relative mt-2 h-14 cursor-grab touch-pan-y select-none active:cursor-grabbing"
                onPointerDown={(ev) => {
                  ev.currentTarget.setPointerCapture(ev.pointerId);
                  dragging.current = true;
                  touched.current = true;
                  drive({ t: fromX(ev.clientX) });
                }}
                onPointerMove={(ev) => dragging.current && drive({ t: fromX(ev.clientX) })}
                onPointerUp={() => {
                  dragging.current = false;
                  snap();
                }}
                onPointerCancel={() => {
                  dragging.current = false;
                  snap();
                }}
                onKeyDown={(ev) => {
                  const i = Math.round(tgt.current.t * 4);
                  if (ev.key === 'ArrowRight' || ev.key === 'ArrowUp') goTo(i + 1);
                  else if (ev.key === 'ArrowLeft' || ev.key === 'ArrowDown') goTo(i - 1);
                  else if (ev.key === 'Home') goTo(0);
                  else if (ev.key === 'End') goTo(4);
                  else return;
                  ev.preventDefault();
                }}
              >
                <div className="absolute inset-x-0 top-1/2 h-px bg-ink/20" />
                <div className="absolute left-0 top-1/2 h-[2px] -translate-y-1/2 bg-paper" style={{ width: `${t * 100}%` }} />
                {STAGES.map((s, i) => (
                  <div key={s.n} className="absolute top-1/2 h-3 w-px -translate-y-1/2 bg-ink/40" style={{ left: `${i * 25}%` }} />
                ))}
                <div className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2" style={{ left: `${t * 100}%` }}>
                  <div className="h-5 w-5 rounded-full bg-electric shadow-[0_0_0_4px_#1A2A5E]" />
                </div>
              </div>
              <div className="relative h-6">
                {STAGES.map((s, i) => {
                  const on = Math.round(stageIndex) === i;
                  return (
                    <button
                      key={s.n}
                      type="button"
                      onClick={() => goTo(i)}
                      className={`label absolute top-0 whitespace-nowrap transition-colors ${on ? 'text-electric' : 'text-muted hover:text-ink'}`}
                      style={{ left: `${i * 25}%`, transform: `translateX(${i === 0 ? '0' : i === 4 ? '-100%' : '-50%'})` }}
                    >
                      {s.n}
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* ── The two ends, and the two ways in ── */}
          <div className="order-3 grid min-w-0 grid-cols-1 gap-10 sm:grid-cols-2 lg:col-start-2">
            <div style={{ opacity: lerp(1, 0.5, t) }} className="transition-opacity">
              <p className="caps text-d3">Make ours yours.</p>
              <p className="mt-2 max-w-[34ch] text-[0.9375rem] text-muted">Start with a silhouette we’ve already perfected.</p>
              <Link href="/catalog" className="group mt-5 inline-flex items-center gap-3 border-b-2 border-ink pb-1 text-[0.9375rem] font-bold uppercase tracking-[0.04em] hover:border-electric hover:text-electric">
                Explore our garments
                <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">→</span>
              </Link>
            </div>
            <div style={{ opacity: lerp(0.5, 1, t) }} className="sm:text-right">
              <p className="caps text-d3">Make something that doesn’t exist.</p>
              <p className="mt-2 max-w-[34ch] text-[0.9375rem] text-muted sm:ml-auto">Fabric. Fit. Construction. Every last detail.</p>
              <Link href="/custom" className="group mt-5 inline-flex items-center gap-3 border-b-2 border-ink pb-1 text-[0.9375rem] font-bold uppercase tracking-[0.04em] hover:border-electric hover:text-electric">
                Build from scratch
                <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
