import Thread from '@/components/thread/Thread';
import { BOX, G, TechFlat } from './garment';
import { PROCESS_ASSETS } from '@/lib/process';
import { draw, fade, MACHINE, type Cue } from '@/lib/thread';

/**
 * 04 / MADE — the payoff. Everything before this is flat and documentary; this is
 * the first thing that looks physical.
 *
 * The thread arrives at a technical outline of the garment and runs a satin fill
 * across it, back and forth, top to bottom, like an embroidery machine. The fill
 * is a mask: a short way behind its leading edge the finished garment shows
 * through, so a band of green stitching sweeps down and leaves the real thing
 * behind. Two masks on the same zigzag, one a beat behind the other, do all of it.
 * The thread then leaves from the hem and runs out of the section.
 */

// Satin fill passes: edge to edge, each a row lower, past the garment's bounds.
const ROW = 30;
const ZIGZAG = (() => {
  let d = 'M20 30';
  for (let i = 1, y = 30; y < BOX.h; i++) {
    y = 30 + i * ROW;
    d += ` L${i % 2 ? 580 : 20} ${y}`;
  }
  return d;
})();

const SWEEP_AT = 1000;
const SWEEP = 2100;
/** How far the finished garment trails the stitching. */
const LAG = 330;

export const MADE_SPAN = SWEEP_AT + LAG + SWEEP + 900;

export default function Made({ seen, sew, uid }: { seen: Cue; sew: Cue; uid: string }) {
  const id = (s: string) => `${uid}-${s}`;
  const band = { fill: 'none', stroke: '#fff', strokeWidth: ROW * 2.3, strokeLinejoin: 'round' as const };

  return (
    <svg aria-hidden viewBox={`0 0 ${BOX.w} ${BOX.h}`} className="block h-auto w-full overflow-visible">
      <defs>
        <clipPath id={id('sil')}>
          <path d={G.silhouette} />
        </clipPath>
        <mask id={id('lead')} maskUnits="userSpaceOnUse" x="-50" y="-50" width="700" height="720">
          <path d={ZIGZAG} pathLength={1} {...band} style={draw(sew, SWEEP_AT, SWEEP, MACHINE)} />
        </mask>
        <mask id={id('lag')} maskUnits="userSpaceOnUse" x="-50" y="-50" width="700" height="720">
          <path d={ZIGZAG} pathLength={1} {...band} style={draw(sew, SWEEP_AT + LAG, SWEEP, MACHINE)} />
        </mask>
        {/* Satin stitches: court-green with fine light and dark stripes at a slant. */}
        <radialGradient id={id('studio')} cx="0.5" cy="0.45" r="0.5">
          <stop offset="0" stopColor="#fff" stopOpacity="0.07" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <pattern id={id('satin')} width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(-28)">
          <rect width="5" height="5" fill="var(--thread)" />
          <rect width="1.2" height="5" fill="var(--thread-hi)" fillOpacity="0.55" />
          <rect x="3.2" width="0.9" height="5" fill="#000" fillOpacity="0.35" />
        </pattern>
      </defs>

      {/* What the thread arrives at. Covered by the garment as it appears, then gone. */}
      <g style={{ color: '#E8E5DD', ...fade(sew, SWEEP_AT + LAG + SWEEP, 700, 0, 1) }}>
        <g style={fade(seen, 0, 800, 0.55)}>
          <TechFlat weight={1.1} ticks={false} />
        </g>
      </g>

      {/* The stitching, on its way across. Cleared once the garment has covered it,
          so a supplied photo with a slightly different outline shows no green fringe. */}
      <g
        mask={`url(#${id('lead')})`}
        clipPath={`url(#${id('sil')})`}
        style={fade(sew, SWEEP_AT + LAG + SWEEP, 400, 0, 1)}
      >
        <rect x="0" y="0" width={BOX.w} height={BOX.h} fill={`url(#${id('satin')})`} />
      </g>

      {/* Studio falloff behind the finished piece. Faded, not masked: revealed row
          by row, a soft glow shows hard edges. */}
      <ellipse
        cx="300" cy="320" rx="330" ry="340"
        fill={`url(#${id('studio')})`}
        style={fade(sew, SWEEP_AT + LAG, SWEEP)}
      />

      {/* And what it leaves behind. */}
      <g mask={`url(#${id('lag')})`}>
        {PROCESS_ASSETS.made ? (
          <image href={PROCESS_ASSETS.made} width={BOX.w} height={BOX.h} preserveAspectRatio="xMidYMid meet" />
        ) : (
          <Render id={id} />
        )}
      </g>

      {/* Where the thread comes in (left shoulder) and goes out (hem). */}
      <path d="M142 100 L156 110" fill="none" stroke="none" data-in />
      <Thread d="M432 584 C438 600 450 612 470 620" cue={sew} at={SWEEP_AT + LAG + SWEEP} dur={200} width={1.8} data-out />
    </svg>
  );
}

/**
 * Stand-in for the garment photo: a bone heavyweight crew, lit from the upper
 * left, with folds, rib, fleece grain and a court-green chest embroidery. Replace it
 * by setting PROCESS_ASSETS.made.
 */
function Render({ id }: { id: (s: string) => string }) {
  const clip = `url(#${id('sil')})`;
  const { emb } = G;
  const soft = `url(#${id('soft')})`;

  return (
    <g>
      <defs>
        <linearGradient id={id('body')} x1="0" y1="0" x2="0.25" y2="1">
          <stop offset="0" stopColor="#F8F6F1" />
          <stop offset="0.55" stopColor="#E4DDCF" />
          <stop offset="1" stopColor="#CFC6B5" />
        </linearGradient>
        <linearGradient id={id('sleeve')} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#C9BFAD" />
          <stop offset="0.55" stopColor="#E6DFD2" />
          <stop offset="1" stopColor="#D6CDBD" />
        </linearGradient>
        <radialGradient id={id('light')} cx="0.38" cy="0.28" r="0.7">
          <stop offset="0" stopColor="#fff" stopOpacity="0.5" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <pattern id={id('rib')} width="3.4" height="10" patternUnits="userSpaceOnUse">
          <rect width="3.4" height="10" fill="#D9D1C1" />
          <rect width="1.3" height="10" fill="#000" fillOpacity="0.1" />
          <rect x="1.6" width="0.6" height="10" fill="#fff" fillOpacity="0.35" />
        </pattern>
        <pattern id={id('ribL')} width="3.4" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(-80)" href={`#${id('rib')}`} />
        <pattern id={id('ribR')} width="3.4" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(80)" href={`#${id('rib')}`} />
        <pattern id={id('embsatin')} width="2.4" height="2.4" patternUnits="userSpaceOnUse" patternTransform="rotate(-35)">
          <rect width="2.4" height="2.4" fill="var(--thread)" />
          <rect width="0.7" height="2.4" fill="var(--thread-hi)" fillOpacity="0.7" />
        </pattern>
        <filter id={id('soft')} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="9" />
        </filter>
        <filter id={id('soft2')} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="3.5" />
        </filter>
        <filter id={id('grain')} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.95" numOctaves="2" seed="8" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
      </defs>

      <path d={G.silhouette} fill={`url(#${id('body')})`} />

      <g clipPath={clip}>
        <path d={G.sleeveL} fill={`url(#${id('sleeve')})`} />
        <path d={G.sleeveR} fill={`url(#${id('sleeve')})`} transform="translate(600 0) scale(-1 1)" opacity="0.92" />

        {/* Volume: edges fall into shadow. */}
        <path d={G.silhouette} fill="none" stroke="#5E5443" strokeWidth="30" strokeOpacity="0.42" filter={soft} />

        {/* Folds. */}
        <g fill="none" stroke="#5E5443" strokeLinecap="round" filter={soft}>
          <path d="M170 250 Q212 300 216 392" strokeWidth="12" strokeOpacity="0.32" />
          <path d="M430 250 Q392 296 388 380" strokeWidth="12" strokeOpacity="0.28" />
          <path d="M300 150 Q294 330 306 520" strokeWidth="34" strokeOpacity="0.07" />
          <path d="M98 296 Q118 312 142 300" strokeWidth="7" strokeOpacity="0.35" />
          <path d="M84 362 Q104 376 134 368" strokeWidth="7" strokeOpacity="0.3" />
          <path d="M502 300 Q482 314 458 302" strokeWidth="7" strokeOpacity="0.3" />
          <path d="M518 366 Q496 378 466 370" strokeWidth="7" strokeOpacity="0.28" />
          <path d="M182 522 Q230 506 264 526 Q300 542 338 524 Q382 506 420 524" strokeWidth="9" strokeOpacity="0.22" />
          <path d="M150 104 Q156 170 166 240" strokeWidth="5" strokeOpacity="0.3" />
          <path d="M450 104 Q444 170 434 240" strokeWidth="5" strokeOpacity="0.3" />
        </g>

        {/* Light. */}
        <g fill="none" stroke="#fff" strokeLinecap="round" filter={soft}>
          <path d="M232 170 Q262 262 250 430" strokeWidth="30" strokeOpacity="0.28" />
          <path d="M122 170 Q108 262 94 380" strokeWidth="12" strokeOpacity="0.32" />
          <path d="M360 300 Q372 380 364 470" strokeWidth="22" strokeOpacity="0.14" />
        </g>
        <rect width="600" height="620" fill={`url(#${id('light')})`} />

        {/* Rib: collar, cuffs, hem. */}
        <path d={G.rib} fillRule="evenodd" fill={`url(#${id('rib')})`} />
        <path d={G.cuffL} fill={`url(#${id('ribL')})`} />
        <path d={G.cuffR} fill={`url(#${id('ribR')})`} />
        <path d={G.hem} fill={`url(#${id('rib')})`} />
        <path d={G.hem} fill="#4a4033" fillOpacity="0.1" />
        <path d={G.opening} fill="#6E6556" />
        <path d="M252 66 Q300 64 348 66 Q300 80 252 66 Z" fill="#3F382E" fillOpacity="0.6" />

        {/* Seam shadows and cover-stitch. */}
        <g fill="none" stroke="#3F382E" strokeLinecap="round">
          <path d={G.collarSeam} strokeWidth="6" strokeOpacity="0.28" filter={`url(#${id('soft2')})`} transform="translate(0 4)" />
          <path d={`${G.armholeL} ${G.armholeR} ${G.cuffSeamL} ${G.cuffSeamR} ${G.hemSeam} ${G.collarSeam}`} strokeWidth="1" strokeOpacity="0.4" />
          <path d={G.topstitch} strokeWidth="0.8" strokeOpacity="0.45" strokeDasharray="2.6 2" />
        </g>

        {/* Loopback grain. */}
        <rect width="600" height="620" filter={`url(#${id('grain')})`} opacity="0.13" style={{ mixBlendMode: 'multiply' }} />
      </g>

      {/* Chest embroidery: the same court-green as the thread that made it. */}
      <g transform={`translate(${emb.x + emb.w / 2} ${emb.y + emb.h - 5})`}>
        <text textAnchor="middle" fontFamily="var(--font-serif)" fontStyle="italic" fontSize="21" fill="#000" fillOpacity="0.35" transform="translate(0.5 0.9)">
          Sophie
        </text>
        <text textAnchor="middle" fontFamily="var(--font-serif)" fontStyle="italic" fontSize="21" fill={`url(#${id('embsatin')})`} stroke="var(--thread)" strokeWidth="0.35">
          Sophie
        </text>
      </g>
    </g>
  );
}
