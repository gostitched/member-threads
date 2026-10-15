'use client';

import { useId } from 'react';
import { GarmentParts, SHAPES, type Part } from '@/components/catalog/GarmentArt';
import { inkOn } from '@/lib/catalog/util';
import type { Art, Deco, Drawn, DrawnKind, Pattern, Sticker } from '@/lib/work';

/**
 * Drawn versions of collection assets that have no photograph yet.
 *
 * Garments reuse the catalog's technical drawings, plus the few pieces the catalog
 * doesn't draw (quarter-zip, zip hoodie, singlet). Each is dressed the way the
 * collection describes it: contrast rib, a hood lining, a rope brim, then the
 * decoration (an arched collegiate wordmark in tackle twill, a small left-chest
 * embroidery, a club crest, a woven patch, a screen print). Plates are flat lays on a
 * coloured ground with a hang-tag or woven label laid on; macros blow the decoration
 * up on its cloth. All of it is SVG, so it costs nothing to download.
 */

type ExtraKind = 'quarterzip' | 'tank' | 'ziphoodie';

const EXTRA: Record<ExtraKind, Part[]> = {
  quarterzip: [
    { t: 'body', d: 'M156 84L108 108Q80 150 67 210L49 318L80 327L104 222L112 204L112 336Q200 344 288 336L288 204L296 222L320 327L351 318L333 210Q320 150 292 108L244 84C232 98 168 98 156 84Z' },
    { t: 'shade', d: 'M156 84L154 58Q200 50 246 58L244 84C232 98 168 98 156 84Z' },
    { t: 'line', d: 'M200 60L200 168', w: 3 },
    { t: 'dot', cx: 200, cy: 170, r: 4.5 },
    { t: 'stitch', d: 'M156 90L112 204M244 90L288 204' },
    { t: 'shade', d: 'M112 318Q200 326 288 318L288 336Q200 344 112 336Z' },
    { t: 'stitch', d: 'M52 305L82 313M348 305L318 313' },
  ],
  tank: [
    { t: 'body', d: 'M152 84L168 84Q200 128 232 84L248 84Q252 130 280 150L284 312Q200 322 116 312L120 150Q148 130 152 84Z' },
    { t: 'line', d: 'M150 162L149 308M175 152L175 314M200 134L200 316M225 152L225 314M250 162L251 308', w: 1.2 },
    { t: 'stitch', d: 'M120 300Q200 310 280 300' },
  ],
  ziphoodie: [
    { t: 'body', d: 'M146 98C140 44 260 44 254 98Z' },
    { t: 'body', d: 'M150 92L108 110Q80 152 66 212L48 318L79 327L103 224L112 206L112 338Q200 346 288 338L288 206L297 224L321 327L352 318L334 212Q320 152 292 110L250 92C236 114 164 114 150 92Z' },
    { t: 'shade', d: 'M170 100C170 66 230 66 230 100C220 112 180 112 170 100Z' },
    { t: 'shade', d: 'M148 262L193 262L193 318L130 318Z' },
    { t: 'shade', d: 'M207 262L252 262L270 318L207 318Z' },
    { t: 'line', d: 'M186 112L183 164M214 112L217 164', w: 3 },
    { t: 'line', d: 'M200 108L200 341', w: 3.5 },
    { t: 'stitch', d: 'M195 112L195 336M205 112L205 336' },
    { t: 'dot', cx: 200, cy: 148, r: 4.5 },
    { t: 'stitch', d: 'M114 324Q200 332 286 324M50 304L81 312M350 304L319 312' },
    { t: 'stitch', d: 'M160 92L112 206M240 92L288 206' },
  ],
};

const isExtra = (k: DrawnKind): k is ExtraKind => k in EXTRA;
const partsOf = (k: DrawnKind): Part[] => (isExtra(k) ? EXTRA[k] : SHAPES[k]);

/** Where decoration sits on each drawing: centre and the width it may take. */
const ANCHOR: Record<DrawnKind, { chest: [number, number, number]; left: [number, number, number] }> = {
  tee: { chest: [200, 178, 112], left: [238, 150, 36] },
  longsleeve: { chest: [200, 178, 112], left: [238, 150, 36] },
  hoodie: { chest: [200, 190, 104], left: [238, 152, 36] },
  ziphoodie: { chest: [200, 196, 104], left: [246, 160, 44] },
  crewneck: { chest: [200, 176, 118], left: [238, 146, 38] },
  quarterzip: { chest: [200, 196, 104], left: [244, 150, 38] },
  polo: { chest: [200, 184, 100], left: [244, 154, 30] },
  jacket: { chest: [200, 180, 100], left: [250, 150, 44] },
  cap: { chest: [196, 196, 74], left: [196, 196, 74] },
  shorts: { chest: [160, 236, 40], left: [244, 236, 30] },
  pants: { chest: [156, 156, 46], left: [246, 156, 46] },
  tote: { chest: [200, 250, 136], left: [200, 250, 104] },
  tank: { chest: [200, 198, 96], left: [228, 160, 30] },
};

/**
 * Contrast trim per drawing. Filled shapes are clipped to the cloth (cuffs, hem bands,
 * waistbands, a visor); stroked ones (`w`) sit on the edge (neck rib, handles, a bow).
 */
type Trim = { d: string; w?: number };
const TRIM: Partial<Record<DrawnKind, Trim[]>> = {
  hoodie: [
    { d: 'M48 318L79 327L82 312L50 303Z' }, { d: 'M352 318L321 327L318 312L350 303Z' },
    { d: 'M112 324Q200 332 288 324L288 338Q200 346 112 338Z' },
  ],
  ziphoodie: [
    { d: 'M48 318L79 327L82 312L50 303Z' }, { d: 'M352 318L321 327L318 312L350 303Z' },
    { d: 'M112 324Q200 332 288 324L288 338Q200 346 112 338Z' },
  ],
  crewneck: [
    { d: 'M160 88C174 106 226 106 240 88', w: 10 },
    { d: 'M49 318L80 327L83 313L51 304Z' }, { d: 'M351 318L320 327L317 313L349 304Z' },
    { d: 'M112 318Q200 326 288 318L288 336Q200 344 112 336Z' },
  ],
  tee: [{ d: 'M165 88C177 104 223 104 235 88', w: 7 }, { d: 'M58 163L91 194', w: 6 }, { d: 'M342 163L309 194', w: 6 }],
  polo: [{ d: 'M165 86L186 124L200 100Z' }, { d: 'M235 86L214 124L200 100Z' }, { d: 'M58 163L91 194', w: 6 }, { d: 'M342 163L309 194', w: 6 }],
  tank: [{ d: 'M168 84Q200 128 232 84', w: 5 }, { d: 'M152 84Q148 130 120 150', w: 5 }, { d: 'M248 84Q252 130 280 150', w: 5 }],
  shorts: [{ d: 'M118 110L282 110L284 134L116 134Z' }],
  pants: [{ d: 'M128 70L272 70L275 96L125 96Z' }, { d: 'M112 330L188 330L184 356L106 356Z' }, { d: 'M212 330L288 330L294 356L216 356Z' }],
  cap: [{ d: 'M190 250C236 244 290 238 326 244C356 250 364 272 338 284C298 300 232 294 186 276C176 268 178 254 190 250Z' }],
  tote: [{ d: 'M98 300L302 300L304 340L96 340Z' }, { d: 'M150 162C150 70 192 70 192 162M208 162C208 70 250 70 250 162', w: 12 }],
};

/** The inside of the hood. */
const LINING: Partial<Record<DrawnKind, string>> = {
  hoodie: 'M170 100C170 66 230 66 230 100C220 112 180 112 170 100Z',
  ziphoodie: 'M170 100C170 66 230 66 230 100C220 112 180 112 170 100Z',
};

/** Side-seam racing stripes on a bottom. */
const SIDE: Partial<Record<DrawnKind, string[]>> = {
  pants: ['M125 96L137 96L120 330L110 330Z', 'M275 96L263 96L280 330L290 330Z'],
  shorts: ['M116 134L128 134L108 281L94 280Z', 'M284 134L272 134L292 281L306 280Z'],
};

/** Where chest stripes cross a top (they run straight through the sleeves too). */
const STRIPE_Y: Partial<Record<DrawnKind, number>> = {
  tee: 246, crewneck: 246, hoodie: 238, ziphoodie: 238, longsleeve: 246, tank: 250,
};

const FONT = {
  block: { fontFamily: 'var(--font-display), var(--font-sans), system-ui, sans-serif', fontWeight: 800 },
  // Collegiate caps: the heavy wide display cut, outlined like tackle twill.
  varsity: { fontFamily: 'var(--font-display), var(--font-sans), system-ui, sans-serif', fontWeight: 900, fontStretch: '125%' },
  // The brand's baseball script, upright. An accent, used once per piece at most.
  script: { fontFamily: 'var(--font-serif), Georgia, serif', fontWeight: 400 },
  // A crest monogram: a bookish serif, the way a club's die is cut.
  mono: { fontFamily: 'Georgia, "Times New Roman", serif', fontWeight: 700 },
  chenille: { fontFamily: 'var(--font-display), var(--font-sans), system-ui, sans-serif', fontWeight: 800 },
  label: { fontFamily: 'var(--font-mono), ui-monospace, monospace', fontWeight: 600 },
};

// Brand chrome: green ink, beige tags, paper.
const INK = '#133327';
const POP = '#C4B19A';
const WHITE = '#FFFFFF';
const PAPER = '#F7F3EC';

const shade = (hex: string, amt: number) => {
  const n = parseInt(hex.slice(1), 16);
  const f = (c: number) => Math.max(0, Math.min(255, Math.round(c + amt * 255)));
  return `rgb(${f(n >> 16)},${f((n >> 8) & 255)},${f(n & 255)})`;
};

// ── decoration ──────────────────────────────────────────────────────────────

/**
 * A decoration drawn at (cx, cy), `w` wide. `big` is the macro version: satin stitch
 * texture, chenille pile, raised puff, print ink sitting in the knit.
 */
function DecoMark({ deco, cx, cy, w, big = false, uid }: { deco: Deco; cx: number; cy: number; w: number; big?: boolean; uid: string }) {
  if (deco.t === 'patch') {
    const h = w * 0.66;
    return (
      <g>
        {big && <rect x={cx - w / 2 + 3} y={cy - h / 2 + 5} width={w} height={h} rx={h * 0.12} fill="#000" opacity="0.28" filter={`url(#blur-${uid})`} />}
        <rect x={cx - w / 2} y={cy - h / 2} width={w} height={h} rx={h * 0.12} fill={deco.ground} />
        {big && <rect x={cx - w / 2} y={cy - h / 2} width={w} height={h} rx={h * 0.12} fill={`url(#weave-${uid})`} />}
        <rect
          x={cx - w / 2 + w * 0.025} y={cy - h / 2 + w * 0.025} width={w * 0.95} height={h - w * 0.05} rx={h * 0.1}
          fill="none" stroke={deco.ink} strokeWidth={w * 0.03} strokeDasharray={`${w * 0.012} ${w * 0.008}`}
        />
        {deco.lines.map((l, i) => (
          <text
            key={i} x={cx} y={cy - h * 0.06 + (i - (deco.lines.length - 1) / 2) * h * 0.34 + h * 0.12}
            textAnchor="middle" fontSize={h * 0.3} textLength={Math.min(w * 0.66, l.length * h * 0.24)} lengthAdjust="spacingAndGlyphs"
            style={FONT.block} fill={deco.ink}
          >
            {l}
          </text>
        ))}
      </g>
    );
  }

  if (deco.t === 'crest') {
    // A shield, an embroidered border, a serif monogram between two laurel sprigs.
    const h = w * 1.14;
    const x = cx - w / 2;
    const y = cy - h / 2;
    const shield = `M${x} ${y}L${x + w} ${y}L${x + w} ${y + h * 0.52}Q${x + w} ${y + h * 0.86} ${cx} ${y + h}Q${x} ${y + h * 0.86} ${x} ${y + h * 0.52}Z`;
    const s = w / 100;
    const sw = Math.max(0.8, s * 3.2);
    return (
      <g filter={big ? `url(#raise-${uid})` : undefined}>
        <path d={shield} fill={deco.ground} stroke={shade(deco.ground, -0.18)} strokeWidth={sw * 0.6} />
        <path
          d={shield} transform={`translate(${cx} ${cy}) scale(0.86) translate(${-cx} ${-cy})`}
          fill="none" stroke={deco.ink} strokeWidth={sw} strokeDasharray={big ? `${s * 3} ${s * 2}` : undefined}
        />
        <path
          d={`M${cx - 30 * s} ${y + h * 0.78}Q${cx - 40 * s} ${y + h * 0.5} ${cx - 26 * s} ${y + h * 0.3}M${cx + 30 * s} ${y + h * 0.78}Q${cx + 40 * s} ${y + h * 0.5} ${cx + 26 * s} ${y + h * 0.3}`}
          fill="none" stroke={deco.ink} strokeWidth={sw * 0.9} strokeLinecap="round" opacity="0.9"
        />
        {[0.38, 0.5, 0.62].map((t) => (
          <g key={t}>
            <ellipse cx={cx - 35 * s} cy={y + h * (t + 0.1)} rx={4.5 * s} ry={2 * s} transform={`rotate(-40 ${cx - 35 * s} ${y + h * (t + 0.1)})`} fill={deco.ink} />
            <ellipse cx={cx + 35 * s} cy={y + h * (t + 0.1)} rx={4.5 * s} ry={2 * s} transform={`rotate(40 ${cx + 35 * s} ${y + h * (t + 0.1)})`} fill={deco.ink} />
          </g>
        ))}
        <text x={cx} y={y + h * 0.68} textAnchor="middle" fontSize={h * 0.46} style={FONT.mono} fill={deco.ink}>
          {deco.letter}
        </text>
        {deco.words && w >= 26 && (
          <text x={cx} y={y + h * 0.2} textAnchor="middle" fontSize={h * 0.1} textLength={w * 0.5} lengthAdjust="spacingAndGlyphs" style={FONT.block} fill={deco.ink}>
            {deco.words}
          </text>
        )}
      </g>
    );
  }

  // Type.
  const face = FONT[deco.face];
  const n = deco.lines.length;
  const longest = Math.max(...deco.lines.map((l) => l.length));
  const chenille = deco.face === 'chenille';
  const wide = deco.face === 'varsity' || chenille;
  const size = deco.face === 'script' ? w / Math.max(3, longest * 0.42) : wide ? w / Math.max(3, longest * 0.62) : w / Math.max(2.2, longest * 0.66);
  const lead = size * (deco.face === 'script' ? 0.9 : 0.96);
  const embroidered = deco.tech === 'embroidery';
  const puff = deco.tech === 'puff';
  const twill = deco.tech === 'twill';
  const fillFor = (i: number) => (deco.ink2 && deco.face === 'block' && i === n - 1 ? deco.ink2 : deco.ink);
  const outline = deco.face === 'varsity' && deco.ink2 ? deco.ink2 : undefined;

  const lineProps = (i: number) => ({
    fill: big && embroidered && !chenille ? `url(#satin-${uid}-${i})` : fillFor(i),
    stroke: outline ?? (embroidered ? shade(fillFor(i), -0.22) : puff ? shade(fillFor(i), 0.16) : 'none'),
    strokeWidth: outline ? size * (twill ? 0.16 : 0.14) : embroidered ? size * (big ? 0.018 : 0.03) : puff ? size * 0.025 : 0,
    paintOrder: 'stroke' as const,
    strokeLinejoin: 'round' as const,
    style: face,
    opacity: deco.tech === 'print' ? 0.94 : 1,
  });

  /**
   * One line of type, with whatever sits under it: the felt, the puff's shadow. An
   * arched line is set letter by letter along a circle, each letter turned to the arc,
   * the way varsity lettering is cut.
   */
  type At = { x: number; y: number; tl: number; arch?: boolean };
  const line = (l: string, i: number, at: At) => {
    const text = (props: React.SVGProps<SVGTextElement>, key: string) => {
      if (!at.arch) {
        return (
          <text key={key} x={at.x} y={at.y} textAnchor="middle" fontSize={size} textLength={at.tl} lengthAdjust="spacingAndGlyphs" {...props}>
            {l}
          </text>
        );
      }
      const R = w * 0.9;
      const oy = at.y + Math.sqrt(R * R - (w / 2) ** 2);
      const span = at.tl / R;
      const chars = [...l];
      return (
        <g key={key}>
          {chars.map((ch, k) => {
            const a = -span / 2 + ((k + 0.5) * span) / chars.length;
            const x = at.x + R * Math.sin(a);
            const y = oy - R * Math.cos(a);
            return (
              <text key={k} x={x} y={y} textAnchor="middle" fontSize={size * 0.92} transform={`rotate(${(a * 180) / Math.PI} ${x} ${y})`} {...props}>
                {ch}
              </text>
            );
          })}
        </g>
      );
    };
    const under: React.ReactNode[] = [];
    if (chenille) {
      // Felt first, cut wide around the letter, then the chenille pile on top.
      under.push(text({ fill: deco.ink2 ?? shade(deco.ink, -0.3), stroke: deco.ink2 ?? shade(deco.ink, -0.3), strokeWidth: size * 0.26, strokeLinejoin: 'round', style: face }, 'felt'));
      if (big) under.push(text({ fill: 'none', stroke: shade(deco.ink2 ?? deco.ink, -0.25), strokeWidth: size * 0.018, strokeDasharray: `${size * 0.03} ${size * 0.02}`, style: face }, 'zig'));
      return (
        <g key={i}>
          {under}
          {text({ fill: deco.ink, stroke: shade(deco.ink, -0.12), strokeWidth: size * 0.025, strokeLinejoin: 'round', style: face, filter: big ? `url(#fuzz-${uid})` : undefined }, 'pile')}
          {big && text({ fill: `url(#pile-${uid})`, style: face, opacity: 0.55 }, 'tex')}
        </g>
      );
    }
    if (puff) {
      under.push(text({ fill: shade(fillFor(i), -0.35), opacity: 0.45, style: face, transform: `translate(${size * 0.02} ${size * 0.05})` }, 'shadow'));
    }
    return (
      <g key={i}>
        {under}
        {text(lineProps(i), 'ink')}
        {/* Tackle twill is cut cloth sewn down: a zigzag edge stitch just inside each letter. */}
        {twill && big && text({ fill: 'none', stroke: shade(fillFor(i), -0.28), strokeWidth: size * 0.012, strokeDasharray: `${size * 0.02} ${size * 0.014}`, style: face }, 'edge')}
      </g>
    );
  };

  const lines = deco.lines.map((l, i) => {
    const y = cy + (i - (n - 1) / 2) * lead + size * 0.34;
    const tl = Math.min(w, l.length * size * (deco.face === 'script' ? 0.5 : wide ? 0.66 : 0.7));
    // A lone arched line drops a little, so the top of the arch sits where a flat line would.
    if (deco.arch && i === 0) return line(l, i, { x: cx, y: n === 1 ? y + size * 0.3 : y, tl, arch: true });
    return line(l, i, { x: cx, y, tl });
  });

  return (
    <g filter={big && (embroidered || puff || twill) ? `url(#raise-${uid})` : undefined}>
      {big && (
        <defs>
          {embroidered && !chenille && deco.lines.map((_, i) => {
            const c = fillFor(i);
            return (
              <pattern key={i} id={`satin-${uid}-${i}`} patternUnits="userSpaceOnUse" width={size * 0.05} height={size * 0.05} patternTransform="rotate(-38)">
                <rect width={size * 0.05} height={size * 0.05} fill={c} />
                <rect width={size * 0.05} height={size * 0.018} fill={shade(c, -0.12)} />
                <rect y={size * 0.03} width={size * 0.05} height={size * 0.008} fill={shade(c, 0.1)} />
              </pattern>
            );
          })}
          {chenille && (
            <>
              <filter id={`fuzz-${uid}`} x="-5%" y="-5%" width="110%" height="110%">
                <feTurbulence type="fractalNoise" baseFrequency="0.55" numOctaves="2" seed="3" />
                <feDisplacementMap in="SourceGraphic" scale={size * 0.035} />
              </filter>
              <pattern id={`pile-${uid}`} patternUnits="userSpaceOnUse" width={size * 0.06} height={size * 0.06}>
                <circle cx={size * 0.03} cy={size * 0.03} r={size * 0.018} fill={shade(deco.ink, -0.1)} />
                <circle cx={size * 0.015} cy={size * 0.012} r={size * 0.008} fill={shade(deco.ink, 0.08)} />
              </pattern>
            </>
          )}
        </defs>
      )}
      {lines}
    </g>
  );
}

// ── patterns ────────────────────────────────────────────────────────────────

/** A pattern tile in the 400-unit garment space. */
function PatternTile({ id, p }: { id: string; p: Pattern }) {
  switch (p.t) {
    case 'check':
      return (
        <pattern id={id} patternUnits="userSpaceOnUse" width="26" height="26">
          <rect width="26" height="13" fill={p.ink} fillOpacity="0.5" />
          <rect width="13" height="26" fill={p.ink} fillOpacity="0.5" />
        </pattern>
      );
    case 'stripe':
      return (
        <pattern id={id} patternUnits="userSpaceOnUse" width="24" height="24">
          <rect width="9" height="24" fill={p.ink} />
          {p.ink2 && <rect x="15" width="2" height="24" fill={p.ink2} />}
        </pattern>
      );
  }
}

// ── garments ────────────────────────────────────────────────────────────────

/** A drawn garment as an SVG group in a 400×400 box. */
function DrawnGarment({ g, uid }: { g: Drawn; uid: string }) {
  const parts = partsOf(g.kind);
  const bodies = parts.filter((p): p is Extract<Part, { t: 'body' }> => p.t === 'body');
  const fills = parts.filter((p): p is Extract<Part, { t: 'body' | 'shade' | 'accent' }> => p.t === 'body' || p.t === 'shade' || p.t === 'accent');
  const seams = parts.filter((p) => p.t === 'stitch' || p.t === 'dot' || (p.t === 'line' && (p.w ?? 2) < 6));
  const onDark = inkOn(g.color) === '#FFFFFF';
  const [cx, cy, w] = ANCHOR[g.kind][g.place ?? 'chest'];
  const trims = g.trim ? TRIM[g.kind] ?? [] : [];
  const lining = g.lining && LINING[g.kind];
  const side = g.stripes && SIDE[g.kind];
  const band = g.stripes && !side ? STRIPE_Y[g.kind] : undefined;
  return (
    <g>
      <defs>
        <clipPath id={`cloth-${uid}`}>{bodies.map((b, i) => <path key={i} d={b.d} />)}</clipPath>
        <clipPath id={`fill-${uid}`}>{fills.map((b, i) => <path key={i} d={b.d} />)}</clipPath>
        <linearGradient id={`light-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity={onDark ? 0.14 : 0.3} />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity={onDark ? 0.3 : 0.18} />
        </linearGradient>
        <radialGradient id={`fold-${uid}`} cx="0.5" cy="0.62" r="0.55">
          <stop offset="0.55" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.12" />
        </radialGradient>
        <pattern id={`rib-${uid}`} patternUnits="userSpaceOnUse" width="4" height="4">
          <rect width="1.4" height="4" fill="#000" fillOpacity="0.12" />
        </pattern>
        {g.pattern && <PatternTile id={`pat-${uid}`} p={g.pattern} />}
      </defs>

      <GarmentParts parts={parts} color={g.color} />

      {/* The pattern in the cloth, then the seams again on top of it. */}
      {g.pattern && (
        <>
          <g clipPath={`url(#fill-${uid})`}>
            <rect width="400" height="400" fill={`url(#pat-${uid})`} />
          </g>
          <GarmentParts parts={seams} color={g.color} />
        </>
      )}

      {lining && (
        <g>
          <path d={lining} fill={g.lining} stroke="rgba(0,0,0,0.25)" strokeWidth="1.2" />
          <path d={lining} fill="#000" opacity="0.12" />
        </g>
      )}

      {band !== undefined && g.stripes && (
        <g clipPath={`url(#cloth-${uid})`}>
          {g.stripes.ink2 && <rect x="0" y={band - 16} width="400" height="5" fill={g.stripes.ink2} />}
          <rect x="0" y={band - 7} width="400" height="15" fill={g.stripes.ink} />
          {g.stripes.ink2 && <rect x="0" y={band + 12} width="400" height="5" fill={g.stripes.ink2} />}
        </g>
      )}
      {side && g.stripes && (
        <g clipPath={`url(#cloth-${uid})`}>
          {side.map((d, i) => (
            <path key={i} d={d} fill={g.stripes!.ink} stroke={g.stripes!.ink2} strokeWidth={g.stripes!.ink2 ? 2.5 : 0} />
          ))}
        </g>
      )}

      {trims.length > 0 && (
        <>
          <g clipPath={`url(#fill-${uid})`}>
            {trims.filter((t) => !t.w).map((t, i) => (
              <g key={i}>
                <path d={t.d} fill={g.trim} stroke="rgba(0,0,0,0.22)" strokeWidth="1.2" />
                <path d={t.d} fill={`url(#rib-${uid})`} />
              </g>
            ))}
          </g>
          {trims.filter((t) => t.w).map((t, i) => (
            <g key={i}>
              <path d={t.d} fill="none" stroke="rgba(0,0,0,0.3)" strokeWidth={t.w! + 2} strokeLinecap="round" strokeLinejoin="round" />
              <path d={t.d} fill="none" stroke={g.trim} strokeWidth={t.w} strokeLinecap="round" strokeLinejoin="round" />
            </g>
          ))}
        </>
      )}

      {g.rope && g.kind === 'cap' && (
        <g>
          <path d="M188 266C232 258 294 254 334 262" fill="none" stroke={shade(g.rope, -0.25)} strokeWidth="7.5" strokeLinecap="round" />
          <path d="M188 266C232 258 294 254 334 262" fill="none" stroke={g.rope} strokeWidth="5.5" strokeLinecap="round" />
          <path d="M188 266C232 258 294 254 334 262" fill="none" stroke={shade(g.rope, -0.3)} strokeWidth="5.5" strokeDasharray="2 4" />
        </g>
      )}

      {g.deco && <DecoMark deco={g.deco} cx={cx} cy={cy} w={w} uid={uid} />}
      {/* Light and a soft fold across the cloth only. */}
      <g clipPath={`url(#cloth-${uid})`} pointerEvents="none">
        <rect width="400" height="400" fill={`url(#light-${uid})`} />
        <rect width="400" height="400" fill={`url(#fold-${uid})`} />
      </g>
    </g>
  );
}

// ── stickers ────────────────────────────────────────────────────────────────

/**
 * A sticker or hang-tag on a flat lay. The outer group places it; the inner one is
 * free for the wall's hover wiggle (`.wk-sticker`), so CSS never fights the transform.
 */
function StickerMark({ s, ground }: { s: Sticker; ground: string }) {
  const fill = s.color ?? POP;
  const ink = s.ink ?? INK;
  const [head, ...rest] = s.lines;
  // Trims sit (nearly) square: a woven label straight, a swing tag within 3deg.
  const rot = Math.max(-3, Math.min(3, s.r));
  if (s.shape === 'round') {
    // A woven label: folded ends, two lines of tracked caps.
    const lw = Math.max(...s.lines.map((l) => l.length)) * 13 + 44;
    return (
      <g transform={`translate(${s.x} ${s.y})`}>
        <g className="wk-sticker">
          <rect x={-lw / 2} y={-30} width={lw} height={60} fill={s.color ?? INK} />
          <rect x={-lw / 2} y={-30} width={9} height={60} fill="#000" opacity="0.18" />
          <rect x={lw / 2 - 9} y={-30} width={9} height={60} fill="#000" opacity="0.18" />
          {s.lines.map((l, i) => (
            <text key={i} y={i === 0 ? -4 : 18} textAnchor="middle" fontSize={i === 0 ? 20 : 13} style={FONT.label} fill={s.ink ?? PAPER} fillOpacity={i === 0 ? 1 : 0.7} letterSpacing="0.14em">
              {l}
            </text>
          ))}
        </g>
      </g>
    );
  }
  // A hang-tag: clipped corners at the string end, a punched hole, a loop of string.
  const fs = 30;
  const wdt = Math.max(head.length * fs * 0.66, ...rest.map((l) => l.length * 14 * 0.7)) + 74;
  const h = rest.length ? 92 : 64;
  const x0 = -wdt / 2;
  const tag = `M${x0} ${-h / 2 + 16}L${x0 + 16} ${-h / 2}L${wdt / 2} ${-h / 2}L${wdt / 2} ${h / 2}L${x0 + 16} ${h / 2}L${x0} ${h / 2 - 16}Z`;
  const hx = x0 + 20;
  return (
    <g transform={`translate(${s.x} ${s.y}) rotate(${rot})`}>
      <g className="wk-sticker">
        <path d={`M${hx} 0C${hx - 30} -22 ${hx - 60} 26 ${hx - 96} 4`} fill="none" stroke="#fff" strokeOpacity="0.85" strokeWidth="2" />
        <path d={tag} fill={fill} />
        <circle cx={hx} cy="0" r="6" fill={ground} stroke={ink} strokeOpacity="0.3" />
        <line x1={x0 + 36} x2={x0 + 36} y1={-h / 2 + 10} y2={h / 2 - 10} stroke={ink} strokeOpacity="0.25" strokeDasharray="3 3" />
        <text x={x0 + 50} y={rest.length ? -4 : 11} fontSize={fs} style={FONT.block} fill={ink} letterSpacing="-0.01em">
          {head}
        </text>
        {rest.map((l, i) => (
          <text key={i} x={x0 + 51} y={24 + i * 16} fontSize="14" style={FONT.label} fill={ink} letterSpacing="0.14em">
            {l}
          </text>
        ))}
      </g>
    </g>
  );
}

// ── the renderer ─────────────────────────────────────────────────────────────

export default function WorkArt({ art, className = '', label }: { art: Art; className?: string; label?: string }) {
  const uid = useId().replace(/[:«»]/g, '');
  const a11y = label ? { role: 'img' as const, 'aria-label': label } : { 'aria-hidden': true as const };

  switch (art.t) {
    case 'garment':
      return (
        <svg viewBox="30 30 340 340" className={className} {...a11y}>
          <DrawnGarment g={art.g} uid={uid} />
        </svg>
      );

    case 'plate': {
      const [vw, vh] = art.tall ? [600, 800] : [800, 600];
      return (
        <svg viewBox={`0 0 ${vw} ${vh}`} preserveAspectRatio="xMidYMid slice" className={className} {...a11y}>
          <defs>
            <radialGradient id={`key-${uid}`} cx="0.3" cy="0.2" r="0.95">
              <stop offset="0" stopColor="#fff" stopOpacity="0.22" />
              <stop offset="0.6" stopColor="#fff" stopOpacity="0" />
              <stop offset="1" stopColor="#000" stopOpacity="0.22" />
            </radialGradient>
            <filter id={`drop-${uid}`} x="-20%" y="-20%" width="140%" height="150%">
              <feDropShadow dx="6" dy="16" stdDeviation="14" floodColor="#000" floodOpacity="0.28" />
            </filter>
            {art.stripe && (
              <pattern id={`cabana-${uid}`} patternUnits="userSpaceOnUse" width="96" height="96" patternTransform="rotate(90)">
                <rect width="48" height="96" fill={art.stripe} />
              </pattern>
            )}
          </defs>
          <rect width={vw} height={vh} fill={art.ground} />
          {art.stripe && <rect width={vw} height={vh} fill={`url(#cabana-${uid})`} />}
          {art.items.map((it, i) => (
            <g key={i} transform={`translate(${it.x} ${it.y}) rotate(${it.r}) scale(${it.s}) translate(-200 -200)`} filter={`url(#drop-${uid})`}>
              <DrawnGarment g={it.g} uid={`${uid}p${i}`} />
            </g>
          ))}
          <rect width={vw} height={vh} fill={`url(#key-${uid})`} />
          {art.stickers?.map((s, i) => <StickerMark key={i} s={s} ground={art.ground} />)}
        </svg>
      );
    }

    case 'macro': {
      const onDark = inkOn(art.cloth) === '#FFFFFF';
      const script = art.deco.t === 'type' && art.deco.face === 'script';
      const big = art.deco.t === 'crest' ? 240 : script ? 340 : art.deco.t === 'type' && art.deco.lines.length > 1 ? 330 : 390;
      return (
        <svg viewBox="0 0 400 400" preserveAspectRatio="xMidYMid slice" className={className} {...a11y}>
          <defs>
            <pattern id={`knit-${uid}`} patternUnits="userSpaceOnUse" width="5" height="7">
              <path d="M0 0L2.5 3.5L5 0M0 7L2.5 3.5L5 7" fill="none" stroke={onDark ? '#fff' : '#000'} strokeOpacity={onDark ? 0.07 : 0.06} strokeWidth="1.2" />
            </pattern>
            <pattern id={`weave-${uid}`} patternUnits="userSpaceOnUse" width="4" height="4">
              <rect width="4" height="2" fill="#fff" fillOpacity="0.06" />
            </pattern>
            <linearGradient id={`sheen-${uid}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#fff" stopOpacity={art.satin ? 0.35 : 0.12} />
              <stop offset="0.45" stopColor="#fff" stopOpacity="0" />
              <stop offset="0.7" stopColor="#fff" stopOpacity={art.satin ? 0.22 : 0} />
              <stop offset="1" stopColor="#000" stopOpacity="0.22" />
            </linearGradient>
            <filter id={`raise-${uid}`} x="-10%" y="-10%" width="120%" height="130%">
              <feDropShadow dx="1.5" dy="3" stdDeviation="2" floodColor="#000" floodOpacity="0.35" />
            </filter>
            <filter id={`blur-${uid}`}><feGaussianBlur stdDeviation="6" /></filter>
          </defs>
          <rect width="400" height="400" fill={art.cloth} />
          {!art.satin && <rect width="400" height="400" fill={`url(#knit-${uid})`} />}
          <DecoMark deco={art.deco} cx={art.deco.t === 'type' && art.deco.lines.length === 1 && !script ? 230 : 200} cy={205} w={big} big uid={uid} />
          <rect width="400" height="400" fill={`url(#sheen-${uid})`} />
        </svg>
      );
    }

    case 'swatch':
      return (
        <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" className={className} {...a11y}>
          <rect width="100" height="100" fill={PAPER} />
          <rect x="0" y="0" width="100" height="70" fill={art.color} />
          <text x="8" y="86" fontSize="9" style={{ ...FONT.label, letterSpacing: '0.1em' }} fill={INK}>
            {art.name.toUpperCase()}
          </text>
        </svg>
      );

    case 'spool':
      return (
        <svg viewBox="0 0 100 100" className={className} {...a11y}>
          <rect x="26" y="8" width="48" height="8" rx="2" fill="#D9CBB0" />
          <rect x="26" y="84" width="48" height="8" rx="2" fill="#C9B998" />
          <rect x="30" y="16" width="40" height="68" fill={art.color} />
          {Array.from({ length: 22 }, (_, i) => (
            <line key={i} x1="30" x2="70" y1={18 + i * 3} y2={19.5 + i * 3} stroke="#fff" strokeOpacity="0.12" strokeWidth="1" />
          ))}
          <rect x="30" y="16" width="12" height="68" fill="#fff" opacity="0.12" />
        </svg>
      );

    case 'patch':
      return (
        <svg viewBox="0 0 100 100" className={className} {...a11y}>
          <defs>
            <pattern id={`weave-${uid}`} patternUnits="userSpaceOnUse" width="2" height="2">
              <rect width="2" height="1" fill="#fff" fillOpacity="0.05" />
            </pattern>
            <filter id={`blur-${uid}`}><feGaussianBlur stdDeviation="2" /></filter>
          </defs>
          <g transform="rotate(-6 50 50)">
            <DecoMark deco={art.deco} cx={50} cy={50} w={88} big uid={uid} />
          </g>
        </svg>
      );

    case 'tag': {
      const fill = art.color ?? POP;
      const ink = art.ink ?? INK;
      return (
        <svg viewBox="0 0 100 100" className={className} {...a11y}>
          <g transform="rotate(-10 50 50)">
            <path d="M14 50C4 40 8 28 20 30" fill="none" stroke={INK} strokeOpacity="0.5" strokeWidth="0.8" />
            <path d="M22 34L32 24L88 24L88 76L32 76L22 66Z" fill={fill} />
            <circle cx="30" cy="50" r="3" fill={PAPER} stroke={ink} strokeOpacity="0.3" strokeWidth="0.5" />
            {art.lines.map((l, i) => (
              <text key={i} x="38" y={i ? 52 + i * 10 : 50} fontSize={i ? 5 : 11} style={i ? { ...FONT.label, letterSpacing: '0.14em' } : FONT.block} fill={ink}>
                {l}
              </text>
            ))}
          </g>
        </svg>
      );
    }

    case 'label': {
      // A woven neck label: folded ends, a fine weave, the type woven in.
      const [top, bottom] = art.lines;
      return (
        <svg viewBox="0 0 100 100" className={className} {...a11y}>
          <defs>
            <pattern id={`woven-${uid}`} patternUnits="userSpaceOnUse" width="1.6" height="1.6">
              <rect width="1.6" height="0.8" fill="#fff" fillOpacity="0.07" />
            </pattern>
          </defs>
          <g transform="rotate(-7 50 50)">
            <rect x="8" y="33" width="84" height="36" fill="#000" opacity="0.2" transform="translate(1.5 2.5)" />
            <rect x="8" y="33" width="84" height="36" fill={art.ground} />
            <rect x="8" y="33" width="7" height="36" fill="#000" opacity="0.22" />
            <rect x="85" y="33" width="7" height="36" fill="#000" opacity="0.22" />
            <rect x="8" y="33" width="84" height="36" fill={`url(#woven-${uid})`} />
            {top && (
              <text x="50" y="49" textAnchor="middle" fontSize="9" textLength={Math.min(62, top.length * 6)} lengthAdjust="spacingAndGlyphs" style={FONT.block} fill={art.ink}>
                {top}
              </text>
            )}
            {bottom && (
              <text x="50" y="60" textAnchor="middle" fontSize="4.6" style={{ ...FONT.label, letterSpacing: '0.16em' }} fill={art.ink} fillOpacity="0.85">
                {bottom}
              </text>
            )}
          </g>
        </svg>
      );
    }
  }
}
