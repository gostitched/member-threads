import type { CustomizationId } from '@/lib/upcharge';

/**
 * The hoodie on the pricing board, front or back, with whatever has been thrown at it.
 *
 * Drawn in the same 400×400 box and flat technical style as the catalog's
 * GarmentArt, so the silhouette matches the rest of the site. Every decoration is a
 * self-contained entry in DECORATIONS: swap a drawing (or an <image> of real
 * artwork) there without touching the board. Each one mounts with `deco-in`, so a
 * decoration arrives the moment its control is pressed.
 */

const CLOTH = '#ECE9E1';
const OUTLINE = 'rgba(23,23,23,0.4)';
const STITCH = 'rgba(23,23,23,0.3)';
const SHADE = 'rgba(0,0,0,0.07)';
const INK = '#0E1A47';
const BLUE = '#2B5BD7';

const BODY =
  'M150 92L108 110Q80 152 66 212L48 318L79 327L103 224L112 206L112 338Q200 346 288 338L288 206L297 224L321 327L352 318L334 212Q320 152 292 110L250 92C236 114 164 114 150 92Z';
const SEAMS = 'M160 92L112 206M240 92L288 206M114 324Q200 332 286 324M50 304L81 312M350 304L319 312';

const serif = { fontFamily: 'var(--font-serif), Georgia, serif' };
const mono = { fontFamily: 'var(--font-mono), ui-monospace, monospace' };
const sans = { fontFamily: 'var(--font-sans), system-ui, sans-serif' };

type Side = 'front' | 'back';

/** Where the drawing's 400×400 box sits in the desktop stage, in % of the (square) stage. */
export const GARMENT_BOX = { left: 14, top: 2, size: 72 };

const DECORATIONS: Record<CustomizationId, { side: Side; art: React.ReactNode }> = {
  embroidery: {
    side: 'front',
    art: (
      <g>
        <circle cx="238" cy="150" r="16" fill="none" stroke={BLUE} strokeWidth="2.6" pathLength={1} className="deco-draw" />
        <circle cx="238" cy="150" r="12.5" fill="none" stroke={BLUE} strokeWidth="0.8" strokeDasharray="1.6 1.6" />
        <text x="238" y="157" textAnchor="middle" fontSize="20" fontStyle="italic" fill={BLUE} style={serif}>
          S
        </text>
      </g>
    ),
  },
  patch: {
    side: 'front',
    art: (
      <g transform="rotate(-9 152 170)">
        <circle cx="152" cy="170" r="21" fill={INK} />
        <circle cx="152" cy="170" r="18" fill="none" stroke={CLOTH} strokeWidth="1" strokeDasharray="2 2" />
        <text x="152" y="176" textAnchor="middle" fontSize="16" fontWeight="800" fill={CLOTH} style={sans}>
          65
        </text>
      </g>
    ),
  },
  art: {
    side: 'front',
    art: (
      <g>
        <circle cx="200" cy="212" r="36" fill={BLUE} />
        <g stroke={INK} strokeWidth="4.5" strokeLinecap="square">
          <path d="M214 170L214 246M176 208L252 208M187 181L241 235M241 181L187 235" />
        </g>
        <circle cx="214" cy="208" r="7" fill={CLOTH} />
      </g>
    ),
  },
  sleeve: {
    side: 'front',
    art: (
      <g>
        <path d="M104 172L79 302M86 168L61 298" stroke={BLUE} strokeWidth="3" />
        <g transform="translate(96 176) rotate(100.9)">
          <text x="0" y="3" fontSize="8.5" letterSpacing="1.6" fill={INK} style={mono}>
            EDITION 001 · EDITION 001
          </text>
        </g>
      </g>
    ),
  },
  location: {
    side: 'front',
    art: (
      <g>
        <text x="200" y="296" textAnchor="middle" fontSize="14" fontWeight="800" letterSpacing="-0.3" fill={INK} style={sans}>
          WHY NOT.
        </text>
        <path d="M172 303L228 303" stroke={BLUE} strokeWidth="1.4" strokeDasharray="3 2.5" />
      </g>
    ),
  },
  back: {
    side: 'back',
    art: (
      <g>
        <rect x="140" y="146" width="120" height="136" fill={BLUE} />
        <text x="200" y="168" textAnchor="middle" fontSize="8" letterSpacing="2" fill={CLOTH} style={mono}>
          DEPT. OF
        </text>
        <text x="200" y="214" textAnchor="middle" fontSize="33" fontWeight="800" letterSpacing="-1.5" fill={CLOTH} style={sans}>
          BETTER
        </text>
        <text x="200" y="244" textAnchor="middle" fontSize="23" fontWeight="800" letterSpacing="-1" fill={CLOTH} style={sans}>
          GARMENTS
        </text>
        <text x="200" y="270" textAnchor="middle" fontSize="7" letterSpacing="2" fill={CLOTH} style={mono}>
          EDITION 001
        </text>
      </g>
    ),
  },
  // A designer's markup rather than a decoration: guides, a measure, a correction.
  design: {
    side: 'front',
    art: (
      <g stroke={BLUE} fill="none" strokeWidth="0.9">
        <path d="M200 30L200 356" strokeDasharray="4 3" opacity="0.8" />
        <path d="M96 150L306 150" strokeDasharray="4 3" opacity="0.8" />
        <path d="M260 134L260 166M256 134L264 134M256 166L264 166" />
        <text x="266" y="153" fontSize="8" fill={BLUE} stroke="none" style={mono}>3.5&quot;</text>
        <circle cx="200" cy="58" r="30" strokeDasharray="2 3" />
      </g>
    ),
  },
};

export default function Garment({
  side,
  applied,
  className = '',
}: {
  side: Side;
  applied: readonly CustomizationId[];
  className?: string;
}) {
  const decorations = applied.filter((id) => DECORATIONS[id].side === side);

  return (
    <svg viewBox="0 0 400 400" className={className} aria-hidden>
      {side === 'front' ? (
        <>
          <path d="M146 98C140 44 260 44 254 98Z" fill={CLOTH} stroke={OUTLINE} strokeWidth="1.5" />
          <path d={BODY} fill={CLOTH} stroke={OUTLINE} strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M170 100C170 66 230 66 230 100C220 112 180 112 170 100Z" fill={SHADE} stroke={OUTLINE} strokeWidth="1.2" />
          <path d="M148 262L252 262L270 318L130 318Z" fill={SHADE} stroke={OUTLINE} strokeWidth="1.2" strokeLinejoin="round" />
          <path d="M186 112L183 164M214 112L217 164" stroke={OUTLINE} strokeWidth="2.5" strokeLinecap="round" />
          <path d="M148 262L252 262" stroke={STITCH} strokeWidth="1.5" strokeDasharray="5 5" fill="none" />
        </>
      ) : (
        <>
          <path d={BODY} fill={CLOTH} stroke={OUTLINE} strokeWidth="1.5" strokeLinejoin="round" />
          <path
            d="M144 112C118 92 128 40 200 38C272 40 282 92 256 112C236 104 164 104 144 112Z"
            fill={CLOTH}
            stroke={OUTLINE}
            strokeWidth="1.5"
          />
          <path d="M200 40L200 106" stroke={STITCH} strokeWidth="1.5" strokeDasharray="5 5" />
        </>
      )}
      <path d={SEAMS} stroke={STITCH} strokeWidth="1.5" strokeDasharray="5 5" fill="none" strokeLinecap="round" />

      {decorations.map((id) => (
        <g key={id} className="deco-in">
          {DECORATIONS[id].art}
        </g>
      ))}
    </svg>
  );
}
