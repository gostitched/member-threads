'use client';

import { useId } from 'react';
import { inkOn } from '@/lib/catalog/util';
import type { GarmentKind } from '@/lib/catalog/util';

// Re-exported so drawings elsewhere can name a silhouette without reaching into util.
export type { GarmentKind };

/**
 * A flat technical drawing of a garment, painted in a colourway.
 *
 * Stands in wherever a product has no photograph yet, so an unphotographed product
 * still reads as a specific thing in a specific colour rather than a grey box. Seams
 * are drawn as running stitches — the same motif the rest of the site uses — and the
 * fill animates between colourways, which is what makes hovering a card feel alive.
 *
 * Every shape is drawn front-on in a 400×400 box, centred, so any two drawings can
 * sit in the same grid.
 */

export type Part =
  /** The garment's own cloth: painted in the colourway. */
  | { t: 'body'; d: string }
  /** A contrast panel in a second material (varsity sleeves, jersey trim). */
  | { t: 'accent'; d: string }
  /** A panel a shade darker (pockets, cuffs, inside of a hood). */
  | { t: 'shade'; d: string }
  /** A running stitch along a seam. */
  | { t: 'stitch'; d: string }
  /** A hairline construction line (rib, fold). */
  | { t: 'line'; d: string; w?: number }
  /** Hardware: buttons, snaps, eyelets. */
  | { t: 'dot'; cx: number; cy: number; r: number };

export const SHAPES: Record<GarmentKind, Part[]> = {
  tee: [
    { t: 'body', d: 'M165 88C177 104 223 104 235 88L292 108L346 160L312 197L286 177L286 330Q200 338 114 330L114 177L88 197L54 160L108 108Z' },
    { t: 'line', d: 'M165 88C177 104 223 104 235 88', w: 7 },
    { t: 'stitch', d: 'M108 108L114 177M292 108L286 177' },
    { t: 'stitch', d: 'M116 318Q200 326 284 318' },
    { t: 'stitch', d: 'M62 168L95 190M338 168L305 190' },
  ],
  longsleeve: [
    { t: 'body', d: 'M165 88C177 104 223 104 235 88L292 108Q320 150 333 210L351 318L320 327L296 222L286 202L286 330Q200 338 114 330L114 202L104 222L80 327L49 318L67 210Q80 150 108 108Z' },
    { t: 'line', d: 'M165 88C177 104 223 104 235 88', w: 7 },
    { t: 'stitch', d: 'M108 108L114 202M292 108L286 202' },
    { t: 'stitch', d: 'M116 318Q200 326 284 318M52 305L82 313M348 305L318 313' },
  ],
  hoodie: [
    { t: 'body', d: 'M146 98C140 44 260 44 254 98Z' },
    { t: 'body', d: 'M150 92L108 110Q80 152 66 212L48 318L79 327L103 224L112 206L112 338Q200 346 288 338L288 206L297 224L321 327L352 318L334 212Q320 152 292 110L250 92C236 114 164 114 150 92Z' },
    { t: 'shade', d: 'M170 100C170 66 230 66 230 100C220 112 180 112 170 100Z' },
    { t: 'shade', d: 'M148 262L252 262L270 318L130 318Z' },
    { t: 'line', d: 'M186 112L183 164M214 112L217 164', w: 3 },
    { t: 'stitch', d: 'M148 262L252 262M114 324Q200 332 286 324M50 304L81 312M350 304L319 312' },
    { t: 'stitch', d: 'M160 92L112 206M240 92L288 206' },
  ],
  crewneck: [
    { t: 'body', d: 'M160 88C174 106 226 106 240 88L292 108Q320 150 333 210L351 318L320 327L296 222L288 204L288 336Q200 344 112 336L112 204L104 222L80 327L49 318L67 210Q80 150 108 108Z' },
    { t: 'line', d: 'M160 88C174 106 226 106 240 88', w: 10 },
    { t: 'stitch', d: 'M160 92L112 204M240 92L288 204' },
    { t: 'shade', d: 'M112 318Q200 326 288 318L288 336Q200 344 112 336Z' },
    { t: 'stitch', d: 'M52 305L82 313M348 305L318 313' },
  ],
  polo: [
    { t: 'body', d: 'M165 88L200 100L235 88L292 108L346 160L312 197L286 177L286 330Q200 338 114 330L114 177L88 197L54 160L108 108Z' },
    { t: 'shade', d: 'M165 86L186 124L200 100Z' },
    { t: 'shade', d: 'M235 86L214 124L200 100Z' },
    { t: 'line', d: 'M194 104L194 170L206 170L206 104', w: 2 },
    { t: 'dot', cx: 200, cy: 128, r: 3.5 },
    { t: 'dot', cx: 200, cy: 152, r: 3.5 },
    { t: 'stitch', d: 'M108 108L114 177M292 108L286 177M116 318Q200 326 284 318' },
  ],
  jacket: [
    { t: 'body', d: 'M165 84L200 96L235 84L292 106Q322 150 335 210L352 316L321 326L297 222L288 204L288 340L112 340L112 204L103 222L79 326L48 316L65 210Q78 150 108 106Z' },
    { t: 'shade', d: 'M165 82L146 124L194 112Z' },
    { t: 'shade', d: 'M235 82L254 124L206 112Z' },
    { t: 'line', d: 'M200 100L200 340', w: 2.5 },
    { t: 'dot', cx: 208, cy: 140, r: 3.5 },
    { t: 'dot', cx: 208, cy: 190, r: 3.5 },
    { t: 'dot', cx: 208, cy: 240, r: 3.5 },
    { t: 'dot', cx: 208, cy: 290, r: 3.5 },
    { t: 'line', d: 'M132 250L162 268M268 250L238 268', w: 3 },
    { t: 'stitch', d: 'M108 106L112 204M292 106L288 204M114 328L286 328' },
  ],
  // Three-quarter view from the front left: the crown, and the visor reaching out
  // towards the viewer's right.
  cap: [
    { t: 'body', d: 'M92 256C88 150 150 118 206 118C268 118 306 162 306 248C262 262 144 266 92 256Z' },
    { t: 'shade', d: 'M190 250C236 244 290 238 326 244C356 250 364 272 338 284C298 300 232 294 186 276C176 268 178 254 190 250Z' },
    { t: 'stitch', d: 'M206 122C178 160 168 206 170 256M206 122C236 160 252 204 256 252M206 122C156 150 126 200 120 254' },
    { t: 'stitch', d: 'M196 262C240 256 296 252 334 258' },
    { t: 'line', d: 'M92 256C144 266 262 262 306 248', w: 2 },
    { t: 'dot', cx: 206, cy: 120, r: 7 },
    { t: 'dot', cx: 184, cy: 176, r: 2.5 },
    { t: 'dot', cx: 238, cy: 178, r: 2.5 },
  ],
  beanie: [
    { t: 'body', d: 'M126 236C126 110 274 110 274 236Z' },
    { t: 'body', d: 'M116 226Q200 214 284 226L288 300Q200 312 112 300Z' },
    { t: 'line', d: 'M150 232L148 300M175 228L174 305M200 227L200 306M225 228L226 305M250 232L252 300', w: 1.5 },
    { t: 'stitch', d: 'M162 150L150 226M200 126L200 222M238 150L250 226' },
    { t: 'shade', d: 'M184 250L216 250L216 276L184 276Z' },
  ],
  tote: [
    { t: 'line', d: 'M150 162C150 70 192 70 192 162M208 162C208 70 250 70 250 162', w: 12 },
    { t: 'body', d: 'M108 158L292 158L304 340L96 340Z' },
    { t: 'stitch', d: 'M110 176L290 176' },
    { t: 'stitch', d: 'M150 158L150 200M192 158L192 200M208 158L208 200M250 158L250 200' },
    { t: 'stitch', d: 'M100 326L300 326' },
  ],
  pants: [
    { t: 'body', d: 'M128 70L272 70L275 96L288 330L294 356L216 356L212 330L200 150L188 330L184 356L106 356L112 330L125 96Z' },
    { t: 'shade', d: 'M128 70L272 70L275 96L125 96Z' },
    { t: 'shade', d: 'M112 330L188 330L184 356L106 356Z' },
    { t: 'shade', d: 'M212 330L288 330L294 356L216 356Z' },
    { t: 'line', d: 'M190 96L186 130M210 96L214 130', w: 3 },
    { t: 'stitch', d: 'M142 104L152 164M258 104L248 164' },
  ],
  shorts: [
    { t: 'body', d: 'M118 110L282 110L284 134L306 280L212 292L200 196L188 292L94 280L116 134Z' },
    { t: 'shade', d: 'M118 110L282 110L284 134L116 134Z' },
    { t: 'line', d: 'M190 134L186 164M210 134L214 164', w: 3 },
    { t: 'stitch', d: 'M98 266L186 277M302 266L214 277M136 142L146 198M264 142L254 198' },
  ],
  generic: [
    { t: 'body', d: 'M92 108L308 108L308 300L92 300Z' },
    { t: 'stitch', d: 'M106 122L294 122L294 286L106 286Z' },
    { t: 'shade', d: 'M92 300L308 300L292 318L108 318Z' },
  ],
};

export default function GarmentArt({
  kind,
  color,
  className = '',
  label,
}: {
  kind: GarmentKind;
  color: string;
  className?: string;
  /** Accessible name. Omit when the drawing is decorative next to a visible name. */
  label?: string;
}) {
  const uid = useId().replace(/:/g, '');
  const parts = SHAPES[kind];
  const bodies = parts.filter((p): p is Extract<Part, { t: 'body' }> => p.t === 'body');
  return (
    <svg
      viewBox="0 0 400 400"
      className={className}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <defs>
        <linearGradient id={`light-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.22" />
          <stop offset="0.55" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.2" />
        </linearGradient>
        <clipPath id={`cloth-${uid}`}>
          {bodies.map((b, i) => (
            <path key={i} d={b.d} />
          ))}
        </clipPath>
      </defs>

      {/* Ground shadow, so the garment sits on something. */}
      <ellipse cx="200" cy="362" rx="120" ry="9" fill="#000" opacity="0.07" />

      <GarmentParts parts={parts} color={color} />

      {/* Light from the top left, across the cloth only. */}
      <rect width="400" height="400" fill={`url(#light-${uid})`} clipPath={`url(#cloth-${uid})`} pointerEvents="none" />
    </svg>
  );
}

/**
 * Paints a garment's parts in a colourway: cloth, shaded panels, seams as running
 * stitches, hardware. Shared with the studio, which draws the same way at a larger size.
 */
export function GarmentParts({
  parts,
  color,
  accent = '#232323',
}: {
  parts: Part[];
  color: string;
  /** Paint for 'accent' panels. */
  accent?: string;
}) {
  const ink = inkOn(color);
  const onDark = ink === '#FFFFFF';
  const stitch = onDark ? 'rgba(255,255,255,0.55)' : 'rgba(23,23,23,0.35)';
  const hairline = onDark ? 'rgba(255,255,255,0.28)' : 'rgba(23,23,23,0.22)';
  const shade = onDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
  const outline = onDark ? 'rgba(0,0,0,0.45)' : 'rgba(23,23,23,0.28)';
  const paint = { fill: color, transition: 'fill 450ms cubic-bezier(0.16,1,0.3,1)' };

  return (
    <>
      {parts.map((p, i) => {
        switch (p.t) {
          case 'body':
            return <path key={i} d={p.d} style={paint} stroke={outline} strokeWidth="1.5" strokeLinejoin="round" />;
          case 'accent':
            return <path key={i} d={p.d} fill={accent} stroke="rgba(0,0,0,0.5)" strokeWidth="1.5" strokeLinejoin="round" />;
          case 'shade':
            return (
              <g key={i}>
                <path d={p.d} style={paint} stroke={outline} strokeWidth="1.2" strokeLinejoin="round" />
                <path d={p.d} fill={onDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.1)'} />
              </g>
            );
          case 'line':
            // A thick 'line' in the cloth colour is a rib or a strap; draw it painted, then outline it.
            return (p.w ?? 2) >= 6 ? (
              <g key={i}>
                <path d={p.d} fill="none" stroke={outline} strokeWidth={(p.w ?? 2) + 2.5} strokeLinecap="round" />
                <path d={p.d} fill="none" style={{ stroke: color, transition: paint.transition }} strokeWidth={p.w} strokeLinecap="round" />
                <path d={p.d} fill="none" stroke={shade} strokeWidth={p.w} strokeLinecap="round" />
              </g>
            ) : (
              <path key={i} d={p.d} fill="none" stroke={hairline} strokeWidth={p.w ?? 2} strokeLinecap="round" />
            );
          case 'stitch':
            return (
              <path key={i} d={p.d} fill="none" stroke={stitch} strokeWidth="1.6" strokeDasharray="5 5" strokeLinecap="round" />
            );
          case 'dot':
            return <circle key={i} cx={p.cx} cy={p.cy} r={p.r} fill={hairline} />;
        }
      })}
    </>
  );
}
