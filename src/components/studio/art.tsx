import type { ArtId } from '@/lib/studio';

/**
 * Demo artwork, one piece per technique, each drawn in a 100×100 box centred on
 * (50, 50). Stand-ins for a client's own art: they only have to show what the
 * process does to a mark.
 *
 * Every piece paints with the colours it is given, so an engine can render the
 * same geometry as material (thread, foil, ink) or as a white mask of itself.
 * Strokes an engine may trace carry the `st-trace` class and `pathLength={1}`.
 */

export type ArtPaint = {
  /** The mark's main material. */
  fill: string;
  /** Outlines and second colour. */
  ink: string;
  /** Third colour, for pieces that need one. */
  alt: string;
  /** Used to make gradient ids unique per instance. */
  uid: string;
};

const sans = { fontFamily: 'var(--font-sans), system-ui, sans-serif', fontWeight: 900 } as const;
const serif = { fontFamily: 'var(--font-serif), Georgia, serif' } as const;

const PETAL = 'M50 50C41 37 41 19 50 13C59 19 59 37 50 50Z';

/** Points on a heart, for stones. Computed once. */
const HEART = Array.from({ length: 28 }, (_, i) => {
  const t = (i / 28) * Math.PI * 2;
  const x = 16 * Math.sin(t) ** 3;
  const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
  return [50 + x * 2.4, 47 - y * 2.4] as const;
});
const HEART_INNER = [
  [38, 38], [50, 46], [62, 38], [44, 56], [56, 56], [50, 66], [30, 34], [70, 34],
] as const;

export const ART: Record<ArtId, { tall?: boolean; render: (p: ArtPaint) => React.ReactNode }> = {
  // Embroidered daisy: petals outlined in satin stitch around a filled centre.
  daisy: {
    render: ({ fill, alt }) => (
      <g>
        {[0, 60, 120, 180, 240, 300].map((a) => (
          <path key={a} d={PETAL} transform={`rotate(${a} 50 50)`} className="st-fill" fill={alt} />
        ))}
        {[0, 60, 120, 180, 240, 300].map((a) => (
          <path
            key={`s${a}`}
            d={PETAL}
            transform={`rotate(${a} 50 50)`}
            className="st-trace"
            pathLength={1}
            fill="none"
            stroke={fill}
            strokeWidth="4"
            strokeLinejoin="round"
          />
        ))}
        <circle cx="50" cy="50" r="8.5" className="st-fill" fill={fill} />
        <circle cx="50" cy="50" r="8.5" fill="none" stroke={alt} strokeWidth="1" strokeDasharray="1.4 1.4" className="st-fill" />
      </g>
    ),
  },

  // Bubble lettering for puff: soft counters, thick outline.
  bubble: {
    render: ({ fill, ink }) => (
      <g transform="rotate(-6 50 50)">
        <text
          x="50" y="62" textAnchor="middle" fontSize="36" letterSpacing="-1.5"
          style={sans} fill={fill} stroke={ink} strokeWidth="3.2" strokeLinejoin="round" paintOrder="stroke"
        >
          SOFT
        </text>
      </g>
    ),
  },

  // Two-colour screen print: a striped sun over a horizon, set over a name.
  sunset: {
    render: ({ fill, alt, uid }) => (
      <g>
        <defs>
          <mask id={`sun-${uid}`}>
            <rect width="100" height="100" fill="#fff" />
            {[46, 53, 59, 64].map((y, i) => (
              <rect key={y} x="0" y={y} width="100" height={1.6 + i * 0.7} fill="#000" />
            ))}
          </mask>
        </defs>
        <circle cx="50" cy="46" r="27" fill={alt} mask={`url(#sun-${uid})`} />
        <rect x="14" y="68" width="72" height="2.4" fill={fill} />
        <text x="50" y="86" textAnchor="middle" fontSize="11.5" letterSpacing="1.8" style={sans} fill={fill}>
          STUDIO 003
        </text>
      </g>
    ),
  },

  // Round woven patch with a merrowed edge and type around the ring.
  badge: {
    render: ({ fill, alt, uid }) => (
      <g>
        <defs>
          <path id={`ring-${uid}`} d="M50 50m-31 0a31 31 0 1 1 62 0a31 31 0 1 1-62 0" />
        </defs>
        <circle cx="50" cy="50" r="46" fill={fill} />
        <circle cx="50" cy="50" r="44" fill="none" stroke={alt} strokeWidth="3.6" strokeDasharray="0.9 1.1" />
        <circle cx="50" cy="50" r="23" fill="none" stroke={alt} strokeWidth="0.8" />
        <text fontSize="8.4" letterSpacing="2.2" style={sans} fill={alt}>
          <textPath href={`#ring-${uid}`}>MEMBER THREADS • MADE TO ORDER •</textPath>
        </text>
        <path d="M50 36L53.6 45.4L63.6 45.9L55.8 52.2L58.4 61.9L50 56.4L41.6 61.9L44.2 52.2L36.4 45.9L46.4 45.4Z" fill={alt} />
      </g>
    ),
  },

  // Foil crest: a serif numeral between rules.
  crest: {
    render: ({ fill }) => (
      <g fill={fill}>
        <text x="50" y="36" textAnchor="middle" fontSize="15" fontStyle="italic" style={serif}>No.</text>
        <text x="50" y="72" textAnchor="middle" fontSize="40" style={serif}>003</text>
        <rect x="18" y="80" width="64" height="1.6" />
        <path d="M50 86l2 3.6 4 .6-2.9 2.8.7 4-3.8-1.9-3.8 1.9.7-4-2.9-2.8 4-.6z" />
      </g>
    ),
  },

  // Arched athletic type, the kind that looks best cracked.
  athletic: {
    render: ({ fill, uid }) => (
      <g fill={fill}>
        <defs>
          <path id={`arch-${uid}`} d="M8 52Q50 18 92 52" />
        </defs>
        <text fontSize="15.5" letterSpacing="0.6" textAnchor="middle" style={sans}>
          <textPath href={`#arch-${uid}`} startOffset="50%">ATHLETIC</textPath>
        </text>
        <text x="50" y="80" textAnchor="middle" fontSize="27" letterSpacing="-0.5" style={sans}>DEPT.</text>
        <rect x="26" y="86" width="48" height="2" />
      </g>
    ),
  },

  // Debossed seal: ring, monogram, rule.
  seal: {
    render: ({ fill, uid }) => (
      <g fill={fill}>
        <defs>
          <path id={`seal-${uid}`} d="M50 50m-34 0a34 34 0 1 1 68 0a34 34 0 1 1-68 0" />
        </defs>
        <circle cx="50" cy="50" r="44" fill="none" stroke={fill} strokeWidth="3" />
        <text fontSize="8" letterSpacing="3" style={sans}>
          <textPath href={`#seal-${uid}`}>MADE TO ORDER • MADE TO ORDER •</textPath>
        </text>
        <text x="50" y="63" textAnchor="middle" fontSize="36" fontStyle="italic" style={serif}>S</text>
      </g>
    ),
  },

  // Faceted star for metallic ink.
  star: {
    render: ({ fill, ink }) => (
      <g>
        <path d="M50 6L62 38L96 39L69 60L79 93L50 73L21 93L31 60L4 39L38 38Z" fill={fill} stroke={ink} strokeWidth="1.2" strokeLinejoin="round" />
        <path d="M50 6L50 73M4 39L69 60M96 39L31 60M21 93L62 38M79 93L38 38" stroke={ink} strokeWidth="0.6" opacity="0.5" />
      </g>
    ),
  },

  // Full-colour DTG: a photographic sky, sun and water.
  photo: {
    render: ({ uid }) => (
      <g>
        <defs>
          <linearGradient id={`sky-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#A9CCF4" />
            <stop offset="0.45" stopColor="#E86FA3" />
            <stop offset="0.7" stopColor="#F7A24A" />
            <stop offset="1" stopColor="#1C2A6B" />
          </linearGradient>
          <radialGradient id={`glow-${uid}`} cx="0.5" cy="0.6" r="0.5">
            <stop offset="0" stopColor="#FFF4A3" />
            <stop offset="1" stopColor="#FFF4A3" stopOpacity="0" />
          </radialGradient>
          <clipPath id={`frame-${uid}`}>
            <rect x="8" y="8" width="84" height="84" rx="3" />
          </clipPath>
        </defs>
        <g clipPath={`url(#frame-${uid})`}>
          <rect x="8" y="8" width="84" height="84" fill={`url(#sky-${uid})`} />
          <circle cx="50" cy="62" r="30" fill={`url(#glow-${uid})`} />
          <circle cx="50" cy="62" r="12" fill="#FFF2C9" />
          <path d="M8 66Q30 60 50 66T92 66V92H8Z" fill="#17215C" opacity="0.92" />
          {[70, 75, 80, 85].map((y, i) => (
            <rect key={y} x={40 - i * 3} y={y} width={20 + i * 6} height="1.2" fill="#FFD98A" opacity={0.7 - i * 0.14} />
          ))}
        </g>
      </g>
    ),
  },

  // Appliqué numerals: cut cloth, zigzag sewn down.
  numerals: {
    render: ({ fill, alt }) => (
      <g>
        <text x="50" y="80" textAnchor="middle" fontSize="70" letterSpacing="-4" style={sans} fill={fill} className="st-fill">
          03
        </text>
        <text
          x="50" y="80" textAnchor="middle" fontSize="70" letterSpacing="-4" style={sans}
          fill="none" stroke={alt} strokeWidth="1.3" strokeDasharray="1.6 1.2" className="st-trace-text"
        >
          03
        </text>
      </g>
    ),
  },

  // Sleeve hit: set vertically to run down the arm.
  sleeve: {
    tall: true,
    render: ({ fill }) => (
      <text
        x="50" y="50" textAnchor="middle" dominantBaseline="central" fontSize="9.6" letterSpacing="2.4"
        transform="rotate(90 50 50)" style={sans} fill={fill}
      >
        MEMBER THREADS
      </text>
    ),
  },

  // Rhinestone heart: a ring of stones with a few set inside.
  heart: {
    render: ({ fill, ink }) => (
      <g>
        {[...HEART, ...HEART_INNER].map(([x, y], i) => (
          <g key={i} className="st-stone" style={{ animationDelay: `${i * 16}ms` }}>
            <circle cx={x} cy={y} r="3" fill={fill} stroke={ink} strokeWidth="0.5" />
            <circle cx={x - 0.9} cy={y - 0.9} r="0.9" fill="#fff" />
          </g>
        ))}
      </g>
    ),
  },

  // Laser etch: contour lines inside a ring.
  etch: {
    render: ({ fill }) => (
      <g fill="none" stroke={fill} strokeWidth="1.1" strokeLinecap="round">
        <circle cx="50" cy="50" r="42" className="st-trace" pathLength={1} />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <path
            key={i}
            className="st-trace"
            pathLength={1}
            d={`M${14 + i * 2} ${30 + i * 8}Q${34} ${22 + i * 8} ${50} ${32 + i * 8}T${86 - i * 2} ${30 + i * 8}`}
          />
        ))}
      </g>
    ),
  },

  // Chenille letter: felt on felt, outlined twice.
  letter: {
    render: ({ fill, ink, alt }) => {
      const type = { x: 50, y: 88, textAnchor: 'middle' as const, fontSize: 98, style: { ...serif, fontWeight: 700 }, strokeLinejoin: 'round' as const };
      return (
        <g>
          <text {...type} fill={ink} stroke={ink} strokeWidth="11">S</text>
          <text {...type} fill={fill} stroke={alt} strokeWidth="5" paintOrder="stroke">S</text>
        </g>
      );
    },
  },

  // Discharge: soft, pale type that reads as dye lifted out of the cloth.
  discharge: {
    render: ({ fill }) => (
      <g fill={fill}>
        <text x="50" y="46" textAnchor="middle" fontSize="23" letterSpacing="-0.6" style={sans}>OFF</text>
        <text x="50" y="72" textAnchor="middle" fontSize="23" letterSpacing="-0.6" style={sans}>DUTY</text>
      </g>
    ),
  },

  // Tackle twill: arched block letters, two layers of cloth.
  twill: {
    render: ({ fill, alt, ink, uid }) => (
      <g>
        <defs>
          <path id={`twill-${uid}`} d="M4 64Q50 26 96 64" />
        </defs>
        <text fontSize="21" textAnchor="middle" style={sans} fill={fill} stroke={alt} strokeWidth="4.5" paintOrder="stroke" strokeLinejoin="round">
          <textPath href={`#twill-${uid}`} startOffset="50%">STUDIO</textPath>
        </text>
        <text fontSize="21" textAnchor="middle" style={sans} fill="none" stroke={ink} strokeWidth="0.8" strokeDasharray="1.2 1" className="st-trace-text">
          <textPath href={`#twill-${uid}`} startOffset="50%">STUDIO</textPath>
        </text>
      </g>
    ),
  },
};
