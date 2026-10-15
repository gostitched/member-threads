import Thread from '@/components/thread/Thread';
import { G, TechFlat } from './garment';
import { PROCESS_ASSETS } from '@/lib/process';
import { draw, fade, MACHINE, type Cue } from '@/lib/thread';

/**
 * 02 / DESIGN — the same idea as a development drawing. A handful of believable
 * callouts, no more: a few make it feel real, twenty make it look generated.
 *
 * The thread tightens up here. It runs a clean, even stitch along the shoulders,
 * the collar seam, down the side and along the hem, and leaves from the hem.
 */

/** Shoulders, collar seam, right armhole, side seam, hem. */
const STITCH = `M140 98 Q190 78 236 70 Q300 134 364 70 Q410 78 460 98 Q450 170 440 236 L434 540 L166 540`;

const { emb } = G;
const PAPER = '#E8E5DD';

export default function Design({ seen, sew, uid }: { seen: Cue; sew: Cue; uid: string }) {
  const mono = { fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.1em' } as const;
  // Callouts arrive one at a time once the outline is down.
  const note = (i: number) => fade(seen, 1100 + i * 140, 500);

  return (
    <svg aria-hidden viewBox="-40 -30 700 680" className="block h-auto w-full overflow-visible" style={{ color: PAPER }}>
      <defs>
        <filter id={`${uid}-fleece`} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="3" />
          <feColorMatrix values="0 0 0 0 0.55  0 0 0 0 0.53  0 0 0 0 0.5  0 0 0 0 1" />
        </filter>
      </defs>

      {PROCESS_ASSETS.flat ? (
        <image href={PROCESS_ASSETS.flat} width="600" height="620" style={fade(seen, 200, 900)} />
      ) : (
        <TechFlat
          weight={1.5}
          outlineStyle={draw(seen, 150, 1300, MACHINE)}
          detailStyle={fade(seen, 900, 700, 0.85)}
        />
      )}

      <g fill={PAPER} stroke={PAPER} style={mono}>
        {/* Embroidery placement, with its callout. */}
        <g style={note(0)}>
          <rect x={emb.x} y={emb.y} width={emb.w} height={emb.h} fill="none" strokeWidth="0.9" strokeDasharray="3 2.5" />
          <path d={`M${emb.x + emb.w} ${emb.y + 4} L520 132 L620 132`} fill="none" strokeWidth="0.7" strokeOpacity="0.6" />
          <text x="524" y="124" stroke="none">2.5" CHEST EMB.</text>
          <text x="524" y="148" stroke="none" fillOpacity="0.55">PANTONE 2767 C</text>
        </g>

        {/* Chest width. */}
        <g style={note(1)}>
          <path d="M166 262 L434 262 M172 257 L166 262 L172 267 M428 257 L434 262 L428 267" fill="none" strokeWidth="0.8" strokeOpacity="0.7" />
          <text x="300" y="254" stroke="none" textAnchor="middle" fillOpacity="0.7">22"</text>
        </g>

        {/* Body length, outside the left sleeve. Desktop only: it crowds a phone. */}
        <g style={note(2)} className="max-sm:hidden">
          <path d="M-8 58 L-8 584 M-13 64 L-8 58 L-3 64 M-13 578 L-8 584 L-3 578" fill="none" strokeWidth="0.8" strokeOpacity="0.7" />
          <text x="-16" y="321" stroke="none" textAnchor="middle" fillOpacity="0.7" transform="rotate(-90 -16 321)">28"</text>
          <path d="M-14 58 L230 58 M-14 584 L150 584" fill="none" strokeWidth="0.5" strokeOpacity="0.3" strokeDasharray="2 3" />
        </g>

        {/* Shoulder notches. */}
        <path d="M134 90 L146 106 M466 90 L454 106" fill="none" strokeWidth="1" style={note(1)} />

        {/* Revision tag. */}
        <text x="620" y="-6" stroke="none" textAnchor="end" style={note(3)}>REV / 02</text>

        {/* Swatch. */}
        <g style={note(3)}>
          <rect x="470" y="606" width="40" height="40" filter={`url(#${uid}-fleece)`} stroke="none" />
          <rect x="470" y="606" width="40" height="40" fill="none" strokeWidth="0.7" strokeOpacity="0.5" />
          <text x="522" y="622" stroke="none">420 GSM</text>
          <text x="522" y="640" stroke="none" fillOpacity="0.55">LOOPBACK FLEECE</text>
        </g>
      </g>

      <Thread d={STITCH} cue={sew} at={950} dur={1300} stitch="running" width={2.5} dash="7 5" data-in data-out />
    </svg>
  );
}
