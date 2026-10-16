'use client';

import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { hoodie, VIEW, type HoodieGeometry } from './geometry';
import { DEFAULT_NAME, YOUR_NAME, possessive } from '@/lib/name';
import { COLORWAYS, UNDYED, initial, type Colorway, type Custom, type Look } from '@/lib/chapter';

/**
 * The hoodie, drawn from its pieces and finished like cloth.
 *
 * Paint order is the garment's real stack, each piece with its own outline so no
 * line shows through a piece that sits over it:
 *
 *   sleeves → body → pocket → hem band + cuffs → hood exterior
 *   → hood liner (with its depth) → drape lines → front hood edges + neck
 *   → decoration and trims
 *
 * The body's top edge runs under the hood, so its outline is drawn open.
 *
 * `look` says what the visitor has built. Every option takes its colours from
 * the colourway (body, accent, print edge), so any combination is one the studio
 * would sign off. Until the colour step is taken the body is the undyed blank.
 * `focus` is the detail being pointed at: a dashed preview of where it goes,
 * never a change.
 */

/** Neutral greys for the metal aglets (light, mid, shadow). */
const METAL = ['#FFFFFF', '#C9CCD6', '#5C6584'];

/** The house cut: oversized, boxy, with a heavyweight band. Fixed: the details go on top of it. */
const CUT = { w: 48, l: -70, band: 128 };

/**
 * The chest wordmark: the organization's name in the script, embroidered, set
 * on a slight climb across the chest with a tail stitched under it (the
 * home page's one script moment). A long name breaks onto a second line and
 * everything is measured after layout, so it never runs into the sleeves.
 */
const MARK = { cx: 966, y: 1010, w: 620, h: 300, max: 200, rot: -6, x0: 636, x1: 1296 };

/** Split a name for the chest: one line up to 14 characters, else the most even two. */
function chestLines(name: string): string[] {
  const n = name.trim();
  const words = n.split(/\s+/);
  if (n.length <= 14 || words.length < 2) return [n];
  let best: [string, string] = [words[0], words.slice(1).join(' ')];
  for (let i = 1; i < words.length; i++) {
    const a = words.slice(0, i).join(' ');
    const b = words.slice(i).join(' ');
    if (Math.max(a.length, b.length) < Math.max(best[0].length, best[1].length)) best = [a, b];
  }
  return best;
}

/** The sleeve patch: a chenille initial on a round felt patch, set in from the sleeve's outer edge. */
const PATCH = { r: 80, letter: 104 };
const PATCH_AT = (g: HoodieGeometry) => `translate(${g.marks.sleeveL[0] + 16} ${g.marks.sleeveL[1] - 40}) rotate(-12)`;

/** The print: small, in raised puff ink, in the pocket's bottom-right corner (house cut). */
const PRINT = { text: 'SEASON 01', x: 1262, y: 1500, size: 34, r: 0 };
const CORDS = [
  { from: [916, 566], d: 'M916 566C914 610 911 650 907 690', tip: [907, 690], r: 3 },
  { from: [1016, 566], d: 'M1016 566C1018 600 1021 640 1026 676', tip: [1026, 676], r: -4 },
] as const;

/** The colourway the hoodie is in: the chosen one, or the undyed blank before the colour step. */
function colorway(look: Look): Colorway {
  const c = COLORWAYS[look.color] ?? COLORWAYS[0];
  return look.colorSet ? c : { ...c, body: UNDYED.body, edge: UNDYED.body, name: UNDYED.name };
}

export function describe(look: Look, name = DEFAULT_NAME) {
  const c = colorway(look);
  const bits = [
    look.embroidery && `${name} embroidered in an arched wordmark across the chest`,
    look.liner && `a ${c.linerName.toLowerCase()} ${look.linerStripe ? 'rugby-stripe' : 'jersey'} hood liner`,
    look.rib && 'contrast 2×2 rib at the hem and cuffs',
    look.print && 'Season 01 in small puff print on the pocket',
    look.patch && `a chenille ${initial(name)} patch on the sleeve`,
    look.trims && 'flat drawcords with metal aglets',
    look.construction && 'contrast topstitching',
  ].filter(Boolean);
  return (
    `${name === YOUR_NAME ? 'Your' : possessive(name).replace("'", '’')} oversized, boxy hoodie in ${look.colorSet ? `the ${c.name.toLowerCase()} colorway` : 'undyed'}, 400 GSM fleece` +
    (bits.length ? `, with ${bits.join(', ')}` : '') +
    '.'
  );
}

export default function Hoodie({
  look,
  focus = null,
  uid,
  className = '',
  label,
  name = DEFAULT_NAME,
}: {
  look: Look;
  /** The organization's name: the chest wordmark, and the patch initial. */
  name?: string;
  focus?: Custom | null;
  uid: string;
  className?: string;
  label?: string;
}) {
  const g = useMemo(() => hoodie(CUT), []);
  const c = colorway(look);
  const id = (s: string) => `${uid}-${s}`;
  const url = (s: string) => `url(#${id(s)})`;

  const rib = look.rib ? c.rib : c.body;
  const INK = c.line;
  const liner = look.liner ? c.liner : c.body;
  const heavy = true;
  const cuffs = g.cuffs.split('Z').filter(Boolean).map((p) => p + 'Z');
  const edge = { fill: 'none', stroke: INK, strokeWidth: heavy ? 4.2 : 3.2, strokeLinejoin: 'round', strokeLinecap: 'round' } as const;
  const fine = { ...edge, strokeWidth: heavy ? 3 : 2.5 } as const;
  const stitch = look.construction
    ? ({ fill: 'none', stroke: c.accent, strokeWidth: 4.2, strokeDasharray: '12 8', strokeLinecap: 'round' } as const)
    : ({ fill: 'none', stroke: INK, strokeOpacity: 0.5, strokeWidth: 2.2, strokeDasharray: '6 6' } as const);
  const ease = { transition: 'fill 0.5s cubic-bezier(0.16,1,0.3,1)' };

  /** A piece of cloth: colour, surface, shading, then its own outline. */
  const piece = (d: string, fill: string, shade?: string, outline = d) => (
    <g>
      <path d={d} style={{ ...ease, fill }} />
      <path d={d} fill={url('surface')} style={{ mixBlendMode: 'overlay' }} />
      {shade && <path d={d} fill={shade} />}
      <path d={outline} {...edge} />
    </g>
  );

  return (
    <svg
      viewBox={`${VIEW.x} ${VIEW.y} ${VIEW.size} ${VIEW.size}`}
      role="img"
      aria-label={label ?? describe(look, name)}
      className={`block h-auto w-full overflow-visible ${className}`}
      style={{ '--mark': c.mark } as React.CSSProperties}
    >
      <Defs uid={uid} c={c} heavy={heavy} g={g} />

      {/* ── Body and sleeves ─────────────────────────────────────────── */}
      {piece(g.sleeves[0], c.body, url('sleeveShadeL'))}
      {piece(g.sleeves[1], c.body, url('sleeveShadeR'))}
      {piece(g.body, c.body, url('sideShade'), g.bodyEdge)}
      {piece(g.pocket, c.body)}

      {/* Folds */}
      <g clipPath={url('all')} fill="none" strokeLinecap="round" filter={url('soft')} style={{ transition: 'opacity 0.5s' }}>
        {/* Kept soft and few: only the elbows and the blousing over the hem band. */}
        <g stroke="#000" strokeOpacity="0.1" strokeWidth="40">
          <path d="M300 1250C340 1290 380 1300 420 1290" />
          <path d="M1632 1250C1592 1290 1552 1300 1512 1290" />
          <path d={`M560 ${g.marks.hemTop - 30}C760 ${g.marks.hemTop - 10} 1170 ${g.marks.hemTop - 10} 1372 ${g.marks.hemTop - 30}`} />
        </g>
        <g stroke="#fff" strokeOpacity="0.1" strokeWidth="40">
          <path d="M600 520C560 560 520 640 490 720" />
          <path d="M1332 520C1372 560 1412 640 1442 720" />
        </g>
      </g>
      <path d={g.lines} {...fine} />
      <path d={g.stitches} {...stitch} className={look.construction ? 'chapter-run' : undefined} />

      {/* ── Rib ──────────────────────────────────────────────────────── */}
      <path d={g.hem} style={{ ...ease, fill: rib }} />
      <path d={g.hem} fill={url(look.rib ? 'rib2' : 'rib1')} />
      <path d={g.hem} {...edge} />
      {look.construction && <path d={g.hemStitch} {...stitch} className="chapter-run" />}
      {cuffs.map((p, i) => (
        <g key={i}>
          <path d={p} style={{ ...ease, fill: rib }} />
          <path d={p} fill={url(`${look.rib ? 'rib2' : 'rib1'}${i ? 'R' : 'L'}`)} />
          <path d={p} {...edge} />
        </g>
      ))}

      {/* ── Hood: the exterior, then the liner inside it ───────────────── */}
      {piece(g.hood, c.body, url('hoodShade'))}
      <path d={g.lining} style={{ ...ease, fill: liner }} />
      <path d={g.lining} fill={url(look.liner ? 'jersey' : 'surface')} style={look.liner ? undefined : { mixBlendMode: 'overlay' }} />
      {look.liner && look.linerStripe && <path d={g.lining} fill={url('stripe')} className="chapter-fade-in" />}
      <path d={g.lining} fill={url('linerDepth')} />
      {/* The back of the hood falls into shadow; blurred so it reads as depth, not a panel. */}
      <g clipPath={url('liner')}>
        <path d={g.linerBack} fill={url('linerBack')} filter={url('backSoft')} />
        {/* The exterior's rim throws a soft shadow onto the liner. */}
        <path d={g.lining} fill="none" stroke="#000" strokeOpacity="0.22" strokeWidth="46" filter={url('softer')} />
      </g>
      <path d={g.folds} fill="none" stroke={INK} strokeOpacity="0.4" strokeWidth="2.4" strokeLinecap="round" />
      <path d={g.lining} {...edge} />

      {/* ── Front hood edges and the neck, over everything they cross ──── */}
      <path d={g.neckLines} {...fine} />
      <path d={g.neckStitch} {...stitch} className={look.construction ? 'chapter-run' : undefined} />

      {/* ── Decoration ──────────────────────────────────────────────── */}
      {look.print && (
        // Puff print: one ink, raised a touch, in a heavy block face rather than the script.
        // The entrance animation scales about the box centre, so rotation lives on the child.
        <g className="chapter-add">
        <text
          x={PRINT.x}
          y={PRINT.y}
          transform={`rotate(${PRINT.r} ${PRINT.x} ${PRINT.y})`}
          textAnchor="end"
          fontFamily="var(--font-display)"
          fontWeight={800}
          fontSize={PRINT.size}
          letterSpacing="2"
          fill={c.accent}
          fillOpacity="0.95"
          filter={url('puff')}
        >
          {PRINT.text}
        </text>
        </g>
      )}
      {look.embroidery && <Wordmark name={name} uid={uid} />}
      {look.patch && (
        // Sewn onto the sleeve: clipped to the sleeve, so it wraps out of sight at the edge.
        <>
        <g clipPath={url('sleeveL')}>
          <g className="chapter-add">
            <g transform={PATCH_AT(g)} filter={url('raised')}>
              {/* Felt patch, a stitched edge, then the letter: felt outline under fuzzy chenille loops. */}
              <circle r={PATCH.r} fill={c.patch.felt} />
              <circle r={PATCH.r} fill={url('felt')} />
              <circle r={PATCH.r - 11} fill="none" stroke={c.patch.outline} strokeWidth="3" strokeDasharray="8 6" className="chapter-run" />
              <ChenilleS uid={uid} letter={initial(name)} fill={c.patch.letter} outline={c.patch.outline} />
            </g>
          </g>
        </g>
          {/* The sleeve's own outline, back over the patch where it wraps round. */}
          <path d={g.sleeves[0]} {...edge} />
        </>
      )}
      {look.trims &&
        CORDS.map((t) => (
          <g key={t.d} className="chapter-add">
            <circle cx={t.from[0]} cy={t.from[1]} r="12" fill={INK} stroke={url('metal')} strokeWidth="6" />
            <path d={t.d} fill="none" stroke={INK} strokeWidth="21" strokeLinecap="round" />
            <path d={t.d} fill="none" stroke={c.accent} strokeWidth="16" strokeLinecap="round" />
            <path d={t.d} fill="none" stroke="#fff" strokeOpacity="0.14" strokeWidth="16" strokeDasharray="3 7" />
            <rect x={t.tip[0] - 9} y={t.tip[1] - 6} width="18" height="62" rx="3" fill={url('metal')} stroke={INK} strokeWidth="2"
              transform={`rotate(${t.r} ${t.tip[0]} ${t.tip[1]})`} />
          </g>
        ))}

      <g className="chapter-marks"><Overlay focus={focus} g={g} id={id} /></g>
    </svg>
  );
}

function Defs({ uid, c, heavy, g }: { uid: string; c: Colorway; heavy: boolean; g: HoodieGeometry }) {
  const id = (s: string) => `${uid}-${s}`;
  const url = (s: string) => `url(#${id(s)})`;
  return (
    <defs>
      {/*
        The cloth's surface, blended over its colour. Heather is a soft mélange:
        fine fibre streaks along the knit and slow tonal drift, both low contrast,
        so it reads as cotton fleece in soft light rather than noise. Solid
        colours get only the brushed grain.
      */}
      <filter id={id('fibre')} x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.55 0.09" numOctaves="2" seed="5" stitchTiles="stitch" />
        <feColorMatrix values="1 0 0 0 0  1 0 0 0 0  1 0 0 0 0  0 0 0 0 1" />
      </filter>
      <filter id={id('drift')} x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.004" numOctaves="2" seed="9" stitchTiles="stitch" />
        <feColorMatrix values="1 0 0 0 0  1 0 0 0 0  1 0 0 0 0  0 0 0 0 1" />
      </filter>
      <pattern id={id('surface')} width="360" height="360" patternUnits="userSpaceOnUse">
        <rect width="360" height="360" filter={url('fibre')} opacity={c.heather ? 0.34 : 0.16} />
        {c.heather && <rect width="360" height="360" filter={url('drift')} opacity="0.16" />}
        {heavy && <rect width="360" height="360" fill="#000" opacity="0.04" />}
      </pattern>
      {/* Jersey: fine courses, smoother than the fleece. */}
      <pattern id={id('jersey')} width="12" height="7" patternUnits="userSpaceOnUse">
        <rect width="12" height="2.2" fill="#fff" fillOpacity="0.07" />
      </pattern>

      <filter id={id('soft')} x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="16" /></filter>
      <filter id={id('backSoft')} x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="9" /></filter>
      <filter id={id('softer')} x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="26" /></filter>
      <filter id={id('raised')} x="-10%" y="-20%" width="120%" height="140%">
        <feDropShadow dx="0" dy="3" stdDeviation="2.5" floodColor="#000" floodOpacity="0.4" />
      </filter>

      {/* Tonal 1×1 rib, and the heavy 2×2: pairs of wales with a gap. */}
      {(['', 'L', 'R'] as const).map((side) => {
        const t = side === 'L' ? 'rotate(20)' : side === 'R' ? 'rotate(-20)' : undefined;
        return (
          <g key={side}>
            <pattern id={id(`rib1${side}`)} width="9" height="10" patternUnits="userSpaceOnUse" patternTransform={t}>
              <rect width="3.5" height="10" fill="#000" fillOpacity="0.12" />
            </pattern>
            <pattern id={id(`rib2${side}`)} width="20" height="10" patternUnits="userSpaceOnUse" patternTransform={t}>
              <rect x="0" width="4" height="10" fill="#000" fillOpacity="0.2" />
              <rect x="7" width="4" height="10" fill="#000" fillOpacity="0.2" />
              <rect x="14" width="1.5" height="10" fill="#fff" fillOpacity="0.12" />
            </pattern>
          </g>
        );
      })}
      <pattern id={id('satin')} width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(38)">
        <rect width="7" height="7" fill={c.accent} />
        <rect width="2" height="7" fill="#fff" fillOpacity="0.16" />
      </pattern>

      <pattern id={id('satinEdge')} width="7" height="7" patternUnits="userSpaceOnUse">
        <rect width="7" height="7" fill={c.accent} />
        <rect width="7" height="7" fill="#000" fillOpacity="0.28" />
      </pattern>
      <filter id={id('raised-sm')} x="-10%" y="-20%" width="120%" height="140%">
        <feDropShadow dx="0" dy="2" stdDeviation="1.6" floodColor="#000" floodOpacity="0.32" />
      </filter>

      <linearGradient id={id('sideShade')} x1="0" x2="1">
        <stop offset="0" stopColor="#000" stopOpacity={heavy ? 0.32 : 0.24} />
        <stop offset="0.16" stopColor="#000" stopOpacity="0" />
        <stop offset="0.84" stopColor="#000" stopOpacity="0" />
        <stop offset="1" stopColor="#000" stopOpacity={heavy ? 0.32 : 0.24} />
      </linearGradient>
      <linearGradient id={id('sleeveShadeL')} x1="0" x2="1">
        <stop offset="0" stopColor="#fff" stopOpacity="0.08" />
        <stop offset="0.6" stopColor="#000" stopOpacity="0" />
        <stop offset="1" stopColor="#000" stopOpacity={heavy ? 0.34 : 0.26} />
      </linearGradient>
      <linearGradient id={id('sleeveShadeR')} x1="1" x2="0">
        <stop offset="0" stopColor="#fff" stopOpacity="0.08" />
        <stop offset="0.6" stopColor="#000" stopOpacity="0" />
        <stop offset="1" stopColor="#000" stopOpacity={heavy ? 0.34 : 0.26} />
      </linearGradient>
      <radialGradient id={id('hoodShade')} cx="0.5" cy="0.3" r="0.75">
        <stop offset="0.45" stopColor="#000" stopOpacity="0" />
        <stop offset="1" stopColor="#000" stopOpacity="0.3" />
      </radialGradient>
      {/* Inside the hood: lit at the rim, falling away toward the neck. */}
      <linearGradient id={id('linerDepth')} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#000" stopOpacity="0.04" />
        <stop offset="0.55" stopColor="#000" stopOpacity="0.14" />
        <stop offset="1" stopColor="#000" stopOpacity="0.38" />
      </linearGradient>
      <linearGradient id={id('linerBack')} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#000" stopOpacity="0.1" />
        <stop offset="1" stopColor="#000" stopOpacity="0.28" />
      </linearGradient>
      {/* The liner's rugby stripe: the body colour over the liner, a broad bar and a pin. */}
      <pattern id={id('stripe')} width="64" height="64" patternUnits="userSpaceOnUse" patternTransform="rotate(-8)">
        <rect y="0" width="64" height="22" fill={c.body} />
        <rect y="34" width="64" height="5" fill={c.body} />
      </pattern>
      <clipPath id={id('liner')}><path d={g.lining} /></clipPath>
      <clipPath id={id('all')}><path d={g.sleeves.join('') + g.body + g.hood + g.cuffs + g.hem} /></clipPath>
      <clipPath id={id('sleeveL')}><path d={g.sleeves[0]} /></clipPath>
      {/* Chenille: soft loops, and a slight displacement so the letter's edge is fuzzy. */}
      <pattern id={id('loops')} width="9" height="9" patternUnits="userSpaceOnUse">
        <circle cx="4.5" cy="4.5" r="3" fill="#fff" fillOpacity="0.3" />
        <circle cx="4.5" cy="4.5" r="3" fill="none" stroke="#000" strokeOpacity="0.12" strokeWidth="0.9" />
      </pattern>
      <filter id={id('fuzz')} x="-10%" y="-10%" width="120%" height="120%">
        <feTurbulence type="fractalNoise" baseFrequency="0.5" numOctaves="2" seed="7" />
        <feDisplacementMap in="SourceGraphic" scale="5" />
      </filter>
      <pattern id={id('felt')} width="6" height="6" patternUnits="userSpaceOnUse">
        <rect width="6" height="6" fill="#fff" fillOpacity="0.03" />
        <circle cx="2" cy="3" r="0.8" fill="#fff" fillOpacity="0.08" />
      </pattern>
      <filter id={id('puff')} x="-10%" y="-30%" width="120%" height="160%">
        <feDropShadow dx="0" dy="1.5" stdDeviation="1" floodColor="#000" floodOpacity="0.35" />
      </filter>
      <linearGradient id={id('metal')} x1="0" x2="1">
        <stop offset="0" stopColor={METAL[2]} />
        <stop offset="0.45" stopColor={METAL[0]} />
        <stop offset="1" stopColor={METAL[1]} />
      </linearGradient>
    </defs>
  );
}

/** The chenille initial: a felt outline, the letter, its loops, all through a slight fuzz. */
function ChenilleS({ uid, letter, fill, outline }: { uid: string; letter: string; fill: string; outline: string }) {
  const t = {
    y: PATCH.letter * 0.36,
    textAnchor: 'middle',
    fontFamily: 'var(--font-display)',
    fontWeight: 900,
    fontStretch: '112%',
    fontSize: PATCH.letter,
  } as const;
  return (
    <g>
      <text {...t} fill={outline} stroke={outline} strokeWidth="16" strokeLinejoin="round">{letter}</text>
      <g filter={`url(#${uid}-fuzz)`}>
        <text {...t} fill={fill}>{letter}</text>
        <text {...t} fill={`url(#${uid}-loops)`}>{letter}</text>
      </g>
    </g>
  );
}

/**
 * The organization's name across the chest in the script, satin-stitched in the
 * colorway's accent with a fine edge and a slight lift, so it reads as
 * embroidery rather than print. On first appearance the outline is sewn
 * (a stroke draw) and the satin fills in behind it; typing updates it live.
 */
function Wordmark({ name, uid }: { name: string; uid: string }) {
  const lines = chestLines(name);
  const longest = Math.max(...lines.map((l) => l.length), 1);
  const size = Math.round(Math.min(MARK.max, MARK.w / (longest * 0.42), lines.length > 1 ? 150 : MARK.max));
  const lead = size * 0.86;
  const ref = useRef<SVGGElement>(null);
  const [fit, setFit] = useState({ k: 1, w: MARK.w * 0.8 });

  // Measure after layout: shrink to the chest if the script runs wide, and size the tail to the name.
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const b = el.getBBox();
    if (!b.width) return;
    const k = Math.min(1, MARK.w / b.width, MARK.h / Math.max(b.height, 1));
    setFit((f) => (Math.abs(f.k - k) < 0.005 && Math.abs(f.w - b.width) < 1 ? f : { k, w: b.width }));
  }, [name, size]);

  const top = MARK.y - ((lines.length - 1) * lead) / 2;
  const face = {
    fontFamily: 'var(--font-script)',
    fontWeight: 400,
    fontSize: size,
    textAnchor: 'middle',
    fill: `url(#${uid}-satin)`,
    stroke: `url(#${uid}-satinEdge)`,
    strokeWidth: 2.4,
    strokeLinejoin: 'round',
    paintOrder: 'stroke',
  } as const;
  const tailW = fit.w * 0.86;
  const tailY = top + (lines.length - 1) * lead + size * 0.3;
  const tail = `M${MARK.cx - tailW / 2} ${tailY + 6}C${MARK.cx - tailW / 4} ${tailY + 26} ${MARK.cx + tailW / 4} ${tailY + 16} ${MARK.cx + tailW / 2} ${tailY - 22}`;

  return (
    <g filter={`url(#${uid}-raised-sm)`} className="chapter-sew-in">
      <g transform={`rotate(${MARK.rot} ${MARK.cx} ${MARK.y}) translate(${MARK.cx} ${MARK.y}) scale(${fit.k}) translate(${-MARK.cx} ${-MARK.y})`}>
        <g ref={ref}>
          {lines.map((l, i) => (
            <text key={i} {...face} x={MARK.cx + (lines.length > 1 ? (i ? 36 : -36) : 0)} y={top + i * lead}>
              {l}
            </text>
          ))}
        </g>
        <path d={tail} fill="none" stroke={`url(#${uid}-satin)`} strokeWidth={Math.max(7, size * 0.07)} strokeLinecap="round" className="chapter-tail" pathLength={1} />
      </g>
    </g>
  );
}

/** Dashed marks for the detail being pointed at: where it is, or where it would go. */
function Overlay({ focus, g, id }: { focus: Custom | null; g: HoodieGeometry; id: (s: string) => string }) {
  // A paper-coloured halo keeps the notes legible on any body colour.
  // Colours come from .chapter-marks in chapter.css (the light, with a ground-coloured halo on the notes).
  const text = { fontFamily: 'var(--font-mono)', fontSize: 28, letterSpacing: 3, strokeWidth: 9, paintOrder: 'stroke', strokeLinejoin: 'round' } as const;
  const line = { strokeWidth: 3, fill: 'none', strokeLinejoin: 'round' } as const;
  const trace = { ...line, strokeWidth: 4, strokeDasharray: '14 10' } as const;

  switch (focus) {
    case 'liner':
      return <path className="chapter-draw" d={g.lining} {...trace} />;
    case 'rib':
      return (
        <g className="chapter-draw">
          <path d={g.hem} {...trace} />
          <path d={g.cuffs} {...trace} />
        </g>
      );
    case 'trims':
      return (
        <g className="chapter-draw">
          {CORDS.map((t) => <path key={t.d} d={t.d} {...trace} />)}
        </g>
      );
    case 'embroidery':
      return <rect className="chapter-draw" x={MARK.x0 - 30} y={MARK.y - 190} width={MARK.x1 - MARK.x0 + 60} height="330" {...trace} />;
    case 'print':
      return (
        <g className="chapter-draw">
          <rect x={PRINT.x - 230} y={PRINT.y - 62} width="260" height="92" {...trace} />
          <text {...text} x={PRINT.x - 100} y={PRINT.y + 72} textAnchor="middle">POCKET · CORNER</text>
        </g>
      );
    case 'patch':
      return (
        <circle className="chapter-draw" r={PATCH.r + 12} {...trace} transform={PATCH_AT(g)} />
      );
    case 'construction': {
      const notes = [
        { at: g.marks.shoulder, label: 'DROP-SHOULDER SEAM', dx: -60, dy: -110 },
        { at: [700, g.marks.pocketTop + 80] as [number, number], label: 'KANGAROO POCKET', dx: -140, dy: 250 },
      ];
      return (
        <g className="chapter-draw">
          <path d={g.stitches + g.neckStitch + g.hemStitch} {...line} strokeWidth="3.5" strokeDasharray="10 8" />
          {notes.map((n) => (
            <g key={n.label}>
              <circle className="chapter-mark-dot" cx={n.at[0]} cy={n.at[1]} r="9" />
              <path {...line} strokeWidth="2.5" d={`M${n.at[0]} ${n.at[1]}L${n.at[0] + n.dx} ${n.at[1] + n.dy}`} />
              <text {...text} fontSize="24" x={n.at[0] + n.dx} y={n.at[1] + n.dy + (n.dy < 0 ? -12 : 34)} textAnchor="middle">{n.label}</text>
            </g>
          ))}
        </g>
      );
    }
    default:
      return null;
  }
}
