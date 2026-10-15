import type { CSSProperties } from 'react';

/**
 * One heavyweight crewneck, front view, in a 600 × 620 box.
 *
 * The technical flat in DESIGN, the outline in MADE and the finished garment all
 * share this geometry, so the drawing visibly becomes the product instead of
 * being swapped for a different picture.
 */
export const BOX = { w: 600, h: 620 };

export const G = {
  silhouette:
    'M236 70 Q190 78 140 98 C110 150 84 300 66 420 L62 470 L130 478 L132 432 C140 360 152 290 160 236 L166 540 L168 584 L432 584 L434 540 L440 236 C448 290 460 360 468 432 L470 478 L538 470 L534 420 C516 300 490 150 460 98 Q410 78 364 70 Q300 46 236 70 Z',
  sleeveL: 'M140 98 C110 150 84 300 66 420 L132 432 C140 360 152 290 160 236 Q150 170 140 98 Z',
  sleeveR: 'M460 98 C490 150 516 300 534 420 L468 432 C460 360 448 290 440 236 Q450 170 460 98 Z',
  /** Collar rib band, including the sliver at the back. Fill with evenodd. */
  rib: 'M236 70 Q300 46 364 70 Q300 134 236 70 Z M252 66 Q300 112 348 66 Q300 64 252 66 Z',
  opening: 'M252 66 Q300 64 348 66 Q300 112 252 66 Z',
  collarSeam: 'M236 70 Q300 134 364 70',
  collarEdge: 'M252 66 Q300 112 348 66',
  armholeL: 'M140 98 Q150 170 160 236',
  armholeR: 'M460 98 Q450 170 440 236',
  cuffL: 'M66 420 L132 432 L130 478 L62 470 Z',
  cuffR: 'M534 420 L468 432 L470 478 L538 470 Z',
  cuffSeamL: 'M66 420 L132 432',
  cuffSeamR: 'M534 420 L468 432',
  hem: 'M166 540 L434 540 L432 584 L168 584 Z',
  hemSeam: 'M166 540 L434 540',
  /** Cover-stitch just inside each rib seam. */
  topstitch: 'M170 547 L430 547 M68 427 L131 438 M532 427 L469 438 M240 77 Q300 142 360 77',
  /** 2.5" left-chest embroidery. */
  emb: { x: 360, y: 180, w: 46, h: 22 },
};

/** Knit rib lines on the cuffs and hem, as a flat would draw them. */
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
function ribTicks() {
  const out: string[] = [];
  for (let x = 176; x <= 424; x += 8) out.push(`M${x} 548 L${x} 580`);
  for (const [a, b, c, d] of [
    [[66, 420], [132, 432], [62, 470], [130, 478]],
    [[534, 420], [468, 432], [538, 470], [470, 478]],
  ] as const) {
    for (let t = 0.08; t < 0.95; t += 0.12) {
      out.push(`M${lerp(a[0], b[0], t).toFixed(1)} ${(lerp(a[1], b[1], t) + 6).toFixed(1)} L${lerp(c[0], d[0], t).toFixed(1)} ${(lerp(c[1], d[1], t) - 3).toFixed(1)}`);
    }
  }
  return out.join(' ');
}
export const RIB_TICKS = ribTicks();

/**
 * The garment as a technical flat: hairline outline, seams, cover-stitch and rib.
 * `outlineStyle` lets the caller draw the outline on; `detailStyle` fades the rest.
 */
export function TechFlat({
  stroke = 'currentColor',
  weight = 1.3,
  outlineStyle,
  detailStyle,
  ticks = true,
}: {
  stroke?: string;
  weight?: number;
  outlineStyle?: CSSProperties;
  detailStyle?: CSSProperties;
  ticks?: boolean;
}) {
  return (
    <g fill="none" stroke={stroke} strokeLinejoin="round" strokeLinecap="round">
      <path d={G.silhouette} strokeWidth={weight} pathLength={1} style={outlineStyle} />
      <g style={detailStyle}>
        <path d={`${G.collarSeam} ${G.collarEdge} ${G.armholeL} ${G.armholeR} ${G.cuffSeamL} ${G.cuffSeamR} ${G.hemSeam}`} strokeWidth={weight * 0.8} />
        <path d="M252 66 Q300 64 348 66" strokeWidth={weight * 0.6} strokeOpacity={0.6} />
        <path d={G.topstitch} strokeWidth={weight * 0.55} strokeDasharray="3 2.6" strokeOpacity={0.7} />
        {ticks && <path d={RIB_TICKS} strokeWidth={weight * 0.4} strokeOpacity={0.45} />}
        <path d="M300 112 L300 540" strokeWidth={weight * 0.4} strokeDasharray="10 5 2 5" strokeOpacity={0.35} />
      </g>
    </g>
  );
}
