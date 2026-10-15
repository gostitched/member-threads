'use client';

import { useId } from 'react';
import { GarmentParts } from '@/components/catalog/GarmentArt';
import type { StudioGarment as Garment, Technique, Zone, ZoneId } from '@/lib/studio';
import { ART, type ArtPaint } from './art';
import { DRAWINGS } from './drawings';

/** Blank cloth: a warm undyed cotton, so every technique has something to act on. */
export const CLOTH = '#E7E3DA';

const CREAM = '#F6F3EC';
const INK = '#0E1A47';

export type Placed = {
  tech: Technique;
  /** Null for cloth treatments, which cover the whole piece. */
  zone: ZoneId | null;
  /** Plays its arrival. Marks already on the piece just sit there. */
  fresh: boolean;
  /** Hovered, not yet added. */
  preview: boolean;
};

/**
 * Gives each mark a zone on this garment, in the order they were added: the first
 * free zone in the technique's own preference list, then any free zone at all. When
 * the garment is full the mark doesn't fit and is left off (the recipe still lists
 * it). Recomputed per garment, so a stack carries over when the piece changes.
 */
export function place(garment: Garment, techs: Technique[]): Map<string, ZoneId | null> {
  const taken = new Set<ZoneId>();
  const out = new Map<string, ZoneId | null>();
  // Fallbacks: any free square zone, and only then a sleeve.
  const all = (Object.keys(garment.zones) as ZoneId[]).sort(
    (a, b) => Number(!!garment.zones[a]!.tall) - Number(!!garment.zones[b]!.tall),
  );
  for (const t of techs) {
    if (t.layer === 'cloth') {
      out.set(t.id, null);
      continue;
    }
    const zone = [...(t.zones ?? []), ...all].find((z) => garment.zones[z] && !taken.has(z));
    if (zone) {
      taken.add(zone);
      out.set(t.id, zone);
    }
  }
  return out;
}

/**
 * The garment on the studio canvas: the piece, then any cloth treatments through
 * it, then the marks on top, each arriving the way its process works.
 */
export default function StudioGarment({
  garment,
  placed,
  stripping = false,
  label,
}: {
  garment: Garment;
  placed: Placed[];
  /** Everything is coming off: marks fly away in turn. */
  stripping?: boolean;
  label: string;
}) {
  const uid = useId().replace(/:/g, '');
  const parts = DRAWINGS[garment.drawing];
  const cloth = placed.filter((p) => p.tech.layer === 'cloth');
  const marks = placed.filter((p) => p.tech.layer === 'mark' && p.zone);
  const clothMask = `cloth-${uid}`;

  return (
    // Only the cloth itself takes the pointer (for dragging). Masks don't limit hit
    // testing, so treatments that spill past the garment would otherwise swallow
    // clicks meant for the words around it.
    <svg viewBox="0 0 400 400" className="pointer-events-none block h-full w-full overflow-visible" role="img" aria-label={label}>
      <defs>
        <mask id={clothMask} maskUnits="userSpaceOnUse" x="0" y="0" width="400" height="400">
          {garment.frontAsset ? (
            // eslint-disable-next-line jsx-a11y/alt-text
            <image href={garment.frontAsset} width="400" height="400" style={{ maskType: 'alpha' } as React.CSSProperties} />
          ) : (
            parts.map((p, i) =>
              p.t === 'body' || p.t === 'accent' || p.t === 'shade' ? <path key={i} d={p.d} fill="#fff" /> : null,
            )
          )}
        </mask>
        <linearGradient id={`light-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.28" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.16" />
        </linearGradient>
        {/* Grain, so the cloth reads as cloth and not as a flat fill. */}
        <filter id={`grain-${uid}`} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="3" />
          <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.55 0" />
        </filter>
        <Materials uid={uid} />
      </defs>

      <ellipse cx="200" cy="366" rx="128" ry="8" fill="#000" opacity="0.06" />

      {garment.frontAsset ? (
        // eslint-disable-next-line jsx-a11y/alt-text
        <image href={garment.frontAsset} width="400" height="400" />
      ) : (
        <g style={{ pointerEvents: 'visiblePainted' }}>
          <GarmentParts parts={parts} color={CLOTH} accent={garment.accent} />
        </g>
      )}

      <g mask={`url(#${clothMask})`}>
        <rect width="400" height="400" filter={`url(#grain-${uid})`} opacity="0.16" style={{ mixBlendMode: 'multiply' }} />
        {cloth.map((p, i) => (
          <g key={p.tech.id} className={stripping ? 'st-strip-cloth' : undefined} style={{ animationDelay: `${(cloth.length - i) * 45}ms` }}>
            <Cloth p={p} uid={`${uid}-${p.tech.id}`} root={uid} garment={garment} />
          </g>
        ))}
      </g>

      {marks.map((p, i) => (
        <MarkAt
          key={p.tech.id}
          p={p}
          zone={garment.zones[p.zone!]!}
          uid={`${uid}-${p.tech.id}`}
          root={uid}
          strip={stripping ? (marks.length - i) * 55 : null}
        />
      ))}

      <rect width="400" height="400" fill={`url(#light-${uid})`} mask={`url(#${clothMask})`} pointerEvents="none" />
    </svg>
  );
}

/** Gradients and filters the engines share, defined once per garment. */
function Materials({ uid }: { uid: string }) {
  return (
    <>
      <linearGradient id={`foil-${uid}`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#7A5A14" />
        <stop offset="0.3" stopColor="#D9B75A" />
        <stop offset="0.55" stopColor="#8E6A1E" />
        <stop offset="0.8" stopColor="#E6C872" />
        <stop offset="1" stopColor="#6F5214" />
      </linearGradient>
      <linearGradient id={`silver-${uid}`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#8E939C" />
        <stop offset="0.4" stopColor="#E6E8EC" />
        <stop offset="0.7" stopColor="#A3A8B1" />
        <stop offset="1" stopColor="#D5D8DE" />
      </linearGradient>
      <linearGradient id={`sheen-${uid}`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#fff" stopOpacity="0" />
        <stop offset="0.5" stopColor="#fff" stopOpacity="0.95" />
        <stop offset="1" stopColor="#fff" stopOpacity="0" />
      </linearGradient>
      <filter id={`puff-${uid}`} x="-20%" y="-20%" width="140%" height="150%">
        <feGaussianBlur in="SourceAlpha" stdDeviation="1.8" result="b" />
        <feSpecularLighting in="b" surfaceScale="4" specularConstant="0.75" specularExponent="16" lightingColor="#fff" result="s">
          <feDistantLight azimuth="225" elevation="40" />
        </feSpecularLighting>
        <feComposite in="s" in2="SourceAlpha" operator="in" result="s2" />
        <feComposite in="SourceGraphic" in2="s2" operator="arithmetic" k1="0" k2="1" k3="0.7" k4="0" result="lit" />
        <feDropShadow in="lit" dx="1.4" dy="2.4" stdDeviation="1.6" floodOpacity="0.3" />
      </filter>
      <filter id={`lift-${uid}`} x="-20%" y="-20%" width="140%" height="150%">
        <feDropShadow dx="0.8" dy="1.8" stdDeviation="1.2" floodOpacity="0.28" />
      </filter>
      {/* Speckle for distressing: black flecks wherever the noise runs high. */}
      <filter id={`fleck-${uid}`} x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.55" numOctaves="3" seed="8" />
        <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  1.6 0 0 0 -0.62" />
        <feComponentTransfer>
          <feFuncA type="discrete" tableValues="0 1" />
        </feComponentTransfer>
      </filter>
      <filter id={`swirl-${uid}`} x="-10%" y="-10%" width="120%" height="120%">
        <feTurbulence type="turbulence" baseFrequency="0.011" numOctaves="2" seed="11" result="t" />
        <feDisplacementMap in="SourceGraphic" in2="t" scale="70" xChannelSelector="R" yChannelSelector="G" />
        <feGaussianBlur stdDeviation="1.2" />
      </filter>
      <filter id={`mottle-${uid}`} x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.016" numOctaves="4" seed="21" />
        <feColorMatrix values="0 0 0 0 0.16  0 0 0 0 0.17  0 0 0 0 0.2  -1.9 0 0 0 1.25" />
      </filter>
      <pattern id={`aop-${uid}`} width="30" height="30" patternUnits="userSpaceOnUse" patternTransform="rotate(-14)">
        <path d="M8 3l1.8 4.6 4.9.3-3.8 3.1 1.2 4.8L8 13.1l-4.1 2.7 1.2-4.8L1.3 7.9l4.9-.3z" fill={INK} />
        <circle cx="23" cy="22" r="2.2" fill="#2B5BD7" />
        <path d="M17 28h9" stroke={INK} strokeWidth="1.2" />
      </pattern>
    </>
  );
}

/** Positions one mark in its zone and hands it to its engine. */
function MarkAt({
  p,
  zone,
  uid,
  root,
  strip,
}: {
  p: Placed;
  zone: Zone;
  uid: string;
  root: string;
  strip: number | null;
}) {
  const art = ART[p.tech.art!];
  // Square art on a sleeve shrinks to the sleeve's width; a sleeve hit that lands
  // somewhere square turns to read across.
  const s = ((zone.tall && !art.tall ? zone.w * 0.44 : zone.w) / 100);
  const turn = art.tall && !zone.tall ? -90 : 0;
  const tilt = p.tech.engine === 'slap' ? (p.tech.id.length % 2 ? 2.5 : -2.5) : 0;
  const at = `translate(${zone.x} ${zone.y}) rotate(${(zone.r ?? 0) + turn + tilt}) scale(${s}) translate(-50 -50)`;

  return (
    <g transform={at}>
      <g
        className={strip !== null ? 'st-strip' : undefined}
        style={strip !== null ? { animationDelay: `${strip}ms` } : undefined}
      >
        <g className={p.fresh ? 'st-anim' : undefined} opacity={p.preview ? 0.92 : 1}>
          <Engine p={p} uid={uid} root={root} />
        </g>
        {p.preview && <CropMarks tall={!!zone.tall && !!art.tall} />}
      </g>
    </g>
  );
}

/** Blue corner marks around a mark being tried on. */
function CropMarks({ tall }: { tall: boolean }) {
  const [x0, x1] = tall ? [36, 64] : [-4, 104];
  const [y0, y1] = [-4, 104];
  const l = 9;
  return (
    <path
      d={`M${x0} ${y0 + l}V${y0}H${x0 + l}M${x1 - l} ${y0}H${x1}V${y0 + l}M${x1} ${y1 - l}V${y1}H${x1 - l}M${x0 + l} ${y1}H${x0}V${y1 - l}`}
      fill="none"
      stroke="#2B5BD7"
      strokeWidth="1.6"
      vectorEffect="non-scaling-stroke"
      className="st-crop"
    />
  );
}

function Engine({ p, uid, root }: { p: Placed; uid: string; root: string }) {
  const t = p.tech;
  const art = ART[t.art!];
  const paint = (fill: string, over: Partial<ArtPaint> = {}): ArtPaint => ({ fill, ink: INK, alt: CREAM, uid, ...over });
  const color = t.color ?? INK;
  const self = (fill = '#fff') => art.render(paint(fill, { ink: fill, alt: fill }));
  const maskOf = (id: string) => (
    <mask id={id} maskUnits="userSpaceOnUse" x="-20" y="-20" width="140" height="140">
      {self()}
    </mask>
  );

  switch (t.engine) {
    case 'stitch':
      return <g className="st-e-stitch">{art.render(paint(color, t.id === 'twill' ? { alt: CREAM, ink: CREAM } : {}))}</g>;

    case 'puff':
      return (
        <g className="st-e-puff" filter={`url(#puff-${root})`}>
          {art.render(paint(color))}
        </g>
      );

    case 'sweep':
      return (
        <g className="st-e-sweep">
          <mask id={`sq-${uid}`} maskUnits="userSpaceOnUse" x="-20" y="-20" width="140" height="140">
            <rect className="st-squeegee" x="-10" y="-10" width="120" height="120" fill="#fff" />
          </mask>
          <g mask={`url(#sq-${uid})`} style={t.id === 'discharge' ? { mixBlendMode: 'screen' } : undefined}>
            {art.render(paint(color, { alt: t.id === 'print' ? '#D8452B' : CREAM }))}
          </g>
          <rect className="st-blade" x="-8" y="-10" width="3" height="120" fill={INK} />
        </g>
      );

    case 'slap':
      return (
        <g className="st-e-slap" filter={`url(#lift-${root})`}>
          {art.render(paint(color))}
        </g>
      );

    case 'foil':
      return (
        <g className="st-e-foil">
          {maskOf(`fm-${uid}`)}
          {art.render(paint(`url(#foil-${root})`))}
          <g mask={`url(#fm-${uid})`}>
            <rect className="st-sheen" x="-40" y="-10" width="26" height="120" fill={`url(#sheen-${root})`} transform="skewX(-18)" />
          </g>
        </g>
      );

    case 'erode':
      return (
        <g className="st-e-erode">
          <mask id={`er-${uid}`} maskUnits="userSpaceOnUse" x="-10" y="-10" width="120" height="120">
            <rect x="-10" y="-10" width="120" height="120" fill="#fff" />
            <rect className="st-flecks" x="-10" y="-10" width="120" height="120" filter={`url(#fleck-${root})`} />
          </mask>
          <g mask={`url(#er-${uid})`}>{art.render(paint(color))}</g>
        </g>
      );

    case 'press':
      // Light from the top left: a pressed-in mark is shadowed on its upper edges
      // and catches light on its lower ones.
      return (
        <g className="st-e-press">
          <g transform="translate(-0.9 -0.9)">{self('rgba(0,0,0,0.3)')}</g>
          <g transform="translate(0.9 0.9)">{self('rgba(255,255,255,0.85)')}</g>
          {self('#DAD5CA')}
        </g>
      );

    case 'metal':
      return (
        <g className="st-e-metal">
          {maskOf(`mm-${uid}`)}
          {art.render(paint(`url(#silver-${root})`, { ink: '#7E838C' }))}
          <g mask={`url(#mm-${uid})`}>
            <rect className="st-metal-light" x="-40" y="-10" width="34" height="120" fill={`url(#sheen-${root})`} />
          </g>
        </g>
      );

    case 'scan':
      return (
        <g className="st-e-scan">
          <mask id={`sc-${uid}`} maskUnits="userSpaceOnUse" x="-10" y="-10" width="120" height="120">
            <rect className="st-passes" x="-10" y="-10" width="120" height="120" fill="#fff" />
          </mask>
          <g mask={`url(#sc-${uid})`}>{art.render(paint(color))}</g>
          <rect className="st-scanbar" x="4" y="0" width="92" height="1.4" fill="#2B5BD7" />
        </g>
      );

    case 'glint':
      return (
        <g className="st-e-glint">
          {art.render(paint(color, { ink: '#9AA0AA' }))}
          {[[34, 27], [67, 55], [50, 72]].map(([x, y], i) => (
            <path
              key={i}
              className="st-sparkle"
              style={{ animationDelay: `${600 + i * 900}ms` }}
              d={`M${x} ${y - 6}L${x + 1} ${y - 1}L${x + 6} ${y}L${x + 1} ${y + 1}L${x} ${y + 6}L${x - 1} ${y + 1}L${x - 6} ${y}L${x - 1} ${y - 1}Z`}
              fill="#fff"
            />
          ))}
        </g>
      );

    case 'burn':
      return <g className="st-e-burn">{art.render(paint(color))}</g>;

    default:
      return null;
  }
}

/** A cloth treatment, drawn across the whole piece. */
function Cloth({ p, uid, root, garment }: { p: Placed; uid: string; root: string; garment: Garment }) {
  // Treatments spread out from the middle of the front.
  const c = garment.zones.center ?? garment.zones.chest ?? { x: 200, y: 210, w: 80 };
  const spread = (id: string, body: React.ReactNode) => (
    <>
      <mask id={id} maskUnits="userSpaceOnUse" x="0" y="0" width="400" height="400">
        <circle className="st-spread" cx={c.x} cy={c.y} r="330" fill="#fff" />
      </mask>
      <g mask={`url(#${id})`}>{body}</g>
    </>
  );

  let body: React.ReactNode = null;
  switch (p.tech.engine) {
    case 'dye': {
      const rings = ['#F29BC0', '#5C7CFA', '#A9CCF4', '#7CD3B0'];
      body = spread(
        `dy-${uid}`,
        <g filter={`url(#swirl-${root})`} opacity="0.82" style={{ mixBlendMode: 'multiply' }}>
          {Array.from({ length: 22 }, (_, i) => (
            <circle key={i} cx={c.x} cy={c.y} r={340 - i * 15.5} fill={rings[i % rings.length]} />
          ))}
        </g>,
      );
      break;
    }
    case 'sublimate':
      body = spread(
        `sb-${uid}`,
        <>
          <linearGradient id={`sg-${uid}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#FF4F9A" />
            <stop offset="0.45" stopColor="#FFB14A" />
            <stop offset="1" stopColor="#2F4BFF" />
          </linearGradient>
          <rect width="400" height="400" fill={`url(#sg-${uid})`} opacity="0.78" style={{ mixBlendMode: 'multiply' }} />
        </>,
      );
      break;
    case 'wash':
      body = (
        <g className="st-wash">
          <rect width="400" height="400" filter={`url(#mottle-${root})`} opacity="0.5" style={{ mixBlendMode: 'multiply' }} />
        </g>
      );
      break;
    case 'flood':
      body = (
        <>
          <mask id={`fl-${uid}`} maskUnits="userSpaceOnUse" x="0" y="0" width="400" height="400">
            <rect className="st-flood" x="40" y="40" width="320" height="320" fill="#fff" />
          </mask>
          <rect width="400" height="400" fill={`url(#aop-${root})`} opacity="0.62" mask={`url(#fl-${uid})`} style={{ mixBlendMode: 'multiply' }} />
        </>
      );
      break;
  }
  return <g className={p.fresh ? 'st-anim' : undefined}>{body}</g>;
}
