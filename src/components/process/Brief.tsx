import Thread from '@/components/thread/Thread';
import { G } from './garment';
import { PROCESS_ASSETS } from '@/lib/process';
import { fade, type Cue } from '@/lib/thread';

/**
 * 01 / BRIEF — the idea as it actually arrives: a phone screenshot and a sketch on
 * whatever paper was nearby, with notes in the margin. Deliberately unfinished.
 *
 * The thread enters the section here and loosely stitches along the sketch's
 * sleeve and hem. The stitch is uneven because the idea is.
 */

// Seeded, so the server and the client draw the same wobble.
function rng(seed: number) {
  let s = seed;
  return () => ((s = (s * 16807) % 2147483647) / 2147483647) * 2 - 1;
}

/** A pencil line through `pts`: jittered, smoothed, a touch overshot at the ends. */
export function pencil(pts: [number, number][], seed: number, wobble = 2.2) {
  const r = rng(seed);
  const p = pts.map(([x, y]) => [x + r() * wobble, y + r() * wobble] as const);
  let d = `M${(p[0][0] + r() * 3).toFixed(1)} ${(p[0][1] + r() * 3).toFixed(1)}`;
  for (let i = 1; i < p.length; i++) {
    const [x0, y0] = p[i - 1];
    const [x1, y1] = p[i];
    const mx = (x0 + x1) / 2 + r() * wobble;
    const my = (y0 + y1) / 2 + r() * wobble;
    d += ` Q${mx.toFixed(1)} ${my.toFixed(1)} ${x1.toFixed(1)} ${y1.toFixed(1)}`;
  }
  return d;
}

// The garment, as someone would draw it from memory: narrower, a bit lopsided.
const OUTLINE: [number, number][] = [
  [146, 92], [104, 110], [92, 170], [80, 236], [100, 245], [118, 170], [121, 300],
  [219, 302], [223, 170], [241, 244], [262, 236], [250, 170], [237, 108], [194, 92],
];
const SKETCH = [
  pencil(OUTLINE, 7),
  pencil(OUTLINE, 19, 3),
  pencil([[146, 92], [170, 113], [194, 92]], 3),
  pencil([[151, 96], [170, 106], [190, 96]], 11, 1.5),
  pencil([[121, 290], [219, 292]], 5, 1.5),
].join(' ');

// A logo, scribbled, and the circle around it.
const SCRIBBLE =
  'M196 142 q4 -8 8 0 t8 0 t8 -2 M200 150 q6 3 14 -1 M188 146 C188 128 226 126 227 144 C228 160 190 162 186 146 C185 138 196 131 207 132';

/** The loose first stitch: in from the left, down the sleeve, along the hem, out. */
const STITCH =
  'M-16 112 C20 104 72 96 108 114 C100 152 92 198 82 242 C96 262 110 284 126 296 C160 308 192 294 226 306 C262 316 300 296 356 290';

export default function Brief({ seen, sew, uid }: { seen: Cue; sew: Cue; uid: string }) {
  return (
    <div aria-hidden className="relative" style={fade(seen, 0, 700)}>
      {/* The reference: a screenshot someone saved months ago. */}
      <div className="absolute -right-[16%] -top-[10%] w-[44%] rotate-[5deg] rounded-[14px] border border-ash/10 bg-[#202020] p-1.5 shadow-[0_24px_40px_-12px_rgba(0,0,0,0.7)]">
        <div className="flex items-center justify-between px-2 pb-1 pt-0.5 font-mono text-[7px] text-ash/45">
          <span>9:41</span>
          <span>●●●</span>
        </div>
        <div className="relative aspect-[9/13] overflow-hidden rounded-[9px] bg-[#2b2b2b]">
          {PROCESS_ASSETS.reference ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={PROCESS_ASSETS.reference} alt="" className="h-full w-full object-cover" />
          ) : (
            <svg viewBox="0 0 600 868" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
              <defs>
                <filter id={`${uid}-blur`}><feGaussianBlur stdDeviation="9" /></filter>
                <linearGradient id={`${uid}-ref`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#5b5750" />
                  <stop offset="1" stopColor="#3a3835" />
                </linearGradient>
              </defs>
              <rect width="600" height="868" fill="#343230" />
              <g transform="translate(0 110)" filter={`url(#${uid}-blur)`}>
                <path d={G.silhouette} fill={`url(#${uid}-ref)`} />
              </g>
              <rect y="760" width="600" height="108" fill="#1f1f1f" />
              <rect x="40" y="792" width="260" height="14" rx="7" fill="#444" />
              <rect x="40" y="820" width="170" height="12" rx="6" fill="#333" />
            </svg>
          )}
        </div>
        <p className="px-1.5 pb-0.5 pt-1.5 font-mono text-[7px] uppercase tracking-[0.1em] text-ash/45">IMG_4471.PNG</p>
      </div>

      {/* The sketch, on a torn-off sheet. */}
      <div className="relative -rotate-[2.5deg] bg-white shadow-[0_30px_50px_-20px_rgba(0,0,0,0.8)]">
        <svg viewBox="0 0 340 400" className="block h-auto w-full overflow-visible">
          <defs>
            <pattern id={`${uid}-dots`} width="14" height="14" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="0.8" fill="#171717" fillOpacity="0.14" />
            </pattern>
          </defs>
          <rect width="340" height="400" fill={`url(#${uid}-dots)`} />

          {PROCESS_ASSETS.sketch ? (
            <image href={PROCESS_ASSETS.sketch} width="340" height="400" preserveAspectRatio="xMidYMid meet" />
          ) : (
            <g fill="none" stroke="#1A1A22" strokeLinecap="round" strokeLinejoin="round">
              <path d={SKETCH} strokeWidth="1.3" strokeOpacity="0.72" />
              <path d={SCRIBBLE} strokeWidth="1.1" strokeOpacity="0.8" />
              {/* margin notes */}
              <g fill="#1A1A22" stroke="none" fontFamily="var(--font-serif)" fontStyle="italic">
                <text x="160" y="190" fontSize="17">her name here ↑</text>
                <text x="18" y="342" fontSize="17" transform="rotate(-4 18 342)">sleeves baggier</text>
                <text x="196" y="364" fontSize="17" transform="rotate(3 196 364)">cream, not white</text>
              </g>
              <path d="M52 326 C46 300 58 276 76 262 M70 258 L77 261 L75 268" strokeWidth="1.1" strokeOpacity="0.75" />
              <path d="M196 370 Q250 377 300 368" strokeWidth="1" strokeOpacity="0.6" />
            </g>
          )}

          <Thread d={STITCH} cue={sew} at={900} dur={1200} stitch="loose" width={2.3} data-in data-out />
        </svg>
      </div>
    </div>
  );
}
