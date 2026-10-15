/**
 * The hero's still life: one sample collection for one organization, laid flat
 * on a cream plate the way a lookbook shoots it. A forest hoodie with an arched
 * tackle-twill name, a folded cream crewneck with a small embroidered script, a
 * dusty-blue cap and the swing tag. Drawn as SVG (no photography exists yet), so
 * it is lit, grained and shadowed to read as cloth rather than clip art.
 *
 * "Harbor Run Club" is a sample organization (DEFAULT_NAME in lib/name), not a
 * client. Server component.
 */

const C = {
  plate: '#EEE6D9',
  forest: '#1A4232',
  forestShade: '#0F2A1F',
  forestLine: 'rgba(238,230,217,0.16)',
  cream: '#F8F4EC',
  creamShade: '#E5DACA',
  creamLine: 'rgba(19,51,39,0.16)',
  dusty: '#25344A',
  dustyShade: '#172232',
  beige: '#C4B19A',
  ink: '#133327',
  paper: '#FBF8F2',
};

const DISPLAY = { fontFamily: 'var(--font-display)', fontWeight: 900, fontStretch: '125%' } as const;
const SCRIPT = { fontFamily: 'var(--font-serif)', fontWeight: 400 } as const;

/* Hoodie, front, flat: 600 × 640 local units. */
const HOODIE_HOOD = 'M205 122C190 22 410 22 395 122Z';
const HOODIE_BODY =
  'M205 118C180 126 150 132 128 142C100 156 86 190 80 230L44 488L46 540L112 546L114 494L148 290L152 300L152 560L150 612Q300 624 450 612L448 560L448 300L452 290L486 494L488 546L554 540L556 488L520 230C514 190 500 156 472 142C450 132 420 126 395 118C370 152 230 152 205 118Z';
const HOODIE_LINING = 'M238 126C232 64 368 64 362 126C334 150 266 150 238 126Z';
const HOODIE_POCKET = 'M210 418L390 418L424 548L176 548Z';

/* Crewneck, folded: 320 × 360 local units. */
const CREW_BODY = 'M2 46Q4 26 24 20L104 0C120 46 200 46 216 0L296 20Q316 26 318 46L318 318Q318 338 298 338L22 338Q2 338 2 318Z';
const CREW_NECK_INSIDE = 'M104 0C120 46 200 46 216 0C190 14 130 14 104 0Z';

/* Cap, three-quarter: 400 × 400 local units (after the catalog's drawing). */
const CAP_CROWN = 'M92 256C88 150 150 118 206 118C268 118 306 162 306 248C262 262 144 266 92 256Z';
const CAP_VISOR = 'M190 250C236 244 290 238 326 244C356 250 364 272 338 284C298 300 232 294 186 276C176 268 178 254 190 250Z';

function Ribs({ x0, x1, y0, y1, step, color }: { x0: number; x1: number; y0: number; y1: number; step: number; color: string }) {
  const lines = [];
  for (let x = x0; x <= x1; x += step) lines.push(`M${x} ${y0}L${x} ${y1}`);
  return <path d={lines.join('')} stroke={color} strokeWidth="1.4" fill="none" />;
}

export default function HeroStill({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1000 1150"
      className={`block h-auto w-full ${className}`}
      role="img"
      aria-label="A sample collection laid flat: a forest-green hoodie embroidered “Harbor Run Club”, a folded cream crewneck and a dusty-blue cap with a Member Threads swing tag."
    >
      <defs>
        <filter id="hs-shadow" x="-20%" y="-20%" width="140%" height="150%">
          <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#133327" floodOpacity="0.16" />
          <feDropShadow dx="0" dy="22" stdDeviation="22" floodColor="#133327" floodOpacity="0.2" />
        </filter>
        <filter id="hs-grain" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <linearGradient id="hs-light" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.14" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.22" />
        </linearGradient>
        <radialGradient id="hs-plate" cx="0.38" cy="0.32" r="0.9">
          <stop offset="0" stopColor="#F3ECE1" />
          <stop offset="1" stopColor="#E6DCCB" />
        </radialGradient>
        <clipPath id="hs-hoodie">
          <path d={HOODIE_HOOD} />
          <path d={HOODIE_BODY} />
        </clipPath>
        <clipPath id="hs-crew">
          <path d={CREW_BODY} />
        </clipPath>
        <clipPath id="hs-cap">
          <path d={CAP_CROWN} />
          <path d={CAP_VISOR} />
        </clipPath>
        <path id="hs-arc" d="M150 304Q300 206 450 304" />
        <path id="hs-cap-arc" d="M140 214Q200 176 262 212" />
      </defs>

      {/* The plate. */}
      <rect width="1000" height="1150" fill="url(#hs-plate)" />

      {/* Hoodie. */}
      <g transform="translate(64 150) rotate(-5 300 320) scale(1.16)" filter="url(#hs-shadow)">
        <path d={HOODIE_HOOD} fill={C.forest} />
        <path d={HOODIE_BODY} fill={C.forest} />
        <path d={HOODIE_LINING} fill={C.forestShade} />
        <path d="M244 128C266 146 334 146 356 128" stroke={C.forestLine} strokeWidth="1.5" strokeDasharray="5 5" fill="none" />
        {/* Drop shoulders and side seams, as running stitches. */}
        <path d="M206 120C190 150 160 190 150 292M394 120C410 150 440 190 450 292" stroke={C.forestLine} strokeWidth="1.5" strokeDasharray="6 6" fill="none" />
        {/* Kangaroo pocket. */}
        <path d={HOODIE_POCKET} fill="#173B2D" />
        <path d="M214 426L386 426M182 540L208 426M418 540L392 426" stroke={C.forestLine} strokeWidth="1.4" strokeDasharray="6 6" fill="none" />
        {/* Rib: hem and cuffs. */}
        <path d="M152 560Q300 572 448 560L450 612Q300 624 150 612Z" fill="#163A2C" />
        <Ribs x0={160} x1={442} y0={566} y1={612} step={8} color="rgba(0,0,0,0.22)" />
        <path d="M44 488L114 494L112 546L46 540Z" fill="#163A2C" />
        <path d="M556 488L486 494L488 546L554 540Z" fill="#163A2C" />
        <path d="M54 492L54 540M64 492L64 541M74 493L74 542M84 494L84 543M94 494L94 544M104 494L104 545M546 492L546 540M536 492L536 541M526 493L526 542M516 494L516 544M506 494L506 545M496 494L496 545" stroke="rgba(0,0,0,0.22)" strokeWidth="1.4" />
        {/* Drawcords, cream with metal-tipped aglets. */}
        <path d="M276 140C280 168 272 186 274 214" stroke={C.cream} strokeWidth="6" strokeLinecap="round" fill="none" />
        <path d="M324 140C322 166 332 186 330 208" stroke={C.cream} strokeWidth="6" strokeLinecap="round" fill="none" />
        <rect x="270.5" y="210" width="7" height="20" rx="2" fill={C.beige} transform="rotate(2 274 220)" />
        <rect x="326.5" y="204" width="7" height="20" rx="2" fill={C.beige} transform="rotate(-3 330 214)" />
        <circle cx="276" cy="140" r="5" fill={C.beige} />
        <circle cx="324" cy="140" r="5" fill={C.beige} />
        {/* Light across the cloth. */}
        <rect x="0" y="0" width="600" height="640" fill="url(#hs-light)" clipPath="url(#hs-hoodie)" />
        {/* Tackle-twill name on an arch, with an embroidered script under it. */}
        <text style={DISPLAY} fontSize="50" letterSpacing="2" fill={C.cream} stroke={C.beige} strokeWidth="6" strokeLinejoin="round" paintOrder="stroke">
          <textPath href="#hs-arc" startOffset="50%" textAnchor="middle">HARBOR</textPath>
        </text>
        <text x="304" y="346" textAnchor="middle" style={SCRIPT} fontSize="54" fill={C.beige} transform="rotate(-6 306 340)">
          Run Club
        </text>
      </g>

      {/* Cap. */}
      <g transform="translate(560 -28) rotate(8 200 200) scale(1.05)" filter="url(#hs-shadow)">
        <path d={CAP_CROWN} fill={C.dusty} />
        <path d={CAP_VISOR} fill={C.dustyShade} />
        <path d="M196 262C240 256 296 252 334 258" stroke="rgba(238,230,217,0.3)" strokeWidth="1.5" strokeDasharray="5 5" fill="none" />
        <path d="M206 122C178 160 168 206 170 256M206 122C236 160 252 204 256 252M206 122C156 150 126 200 120 254" stroke="rgba(238,230,217,0.18)" strokeWidth="1.5" strokeDasharray="5 5" fill="none" />
        <circle cx="206" cy="120" r="7" fill={C.dustyShade} />
        <rect x="0" y="0" width="400" height="400" fill="url(#hs-light)" clipPath="url(#hs-cap)" />
        <text style={DISPLAY} fontSize="26" letterSpacing="2" fill={C.beige}>
          <textPath href="#hs-cap-arc" startOffset="50%" textAnchor="middle">HRC</textPath>
        </text>
      </g>

      {/* Crewneck, folded, overlapping the hoodie's hem. */}
      <g transform="translate(560 650) rotate(4 160 180) scale(1.1)" filter="url(#hs-shadow)">
        <path d={CREW_BODY} fill={C.cream} />
        <path d={CREW_NECK_INSIDE} fill={C.creamShade} />
        <path d="M104 0C120 46 200 46 216 0" stroke="#EDE5D7" strokeWidth="16" fill="none" />
        <path d="M104 0C120 46 200 46 216 0" stroke={C.creamLine} strokeWidth="1" fill="none" />
        <path d="M96 4C114 58 206 58 224 4" stroke={C.creamLine} strokeWidth="1.4" strokeDasharray="5 5" fill="none" />
        {/* The folded-back sleeves show as two soft verticals. */}
        <path d="M2 236Q160 246 318 236L318 250Q160 260 2 250Z" fill="#000" fillOpacity="0.035" />
        <path d="M2 236Q160 246 318 236" stroke={C.creamLine} strokeWidth="1" fill="none" />
        <path d="M24 22L60 60M296 22L260 60" stroke="#000" strokeOpacity="0.05" strokeWidth="10" strokeLinecap="round" />
        <path d="M8 314Q160 324 312 314" stroke={C.creamLine} strokeWidth="1.4" strokeDasharray="5 5" fill="none" />
        <rect x="0" y="0" width="320" height="360" fill="url(#hs-light)" clipPath="url(#hs-crew)" opacity="0.7" />
        <text x="160" y="140" textAnchor="middle" style={SCRIPT} fontSize="52" fill={C.ink} transform="rotate(-6 160 130)">
          Harbor
        </text>
        <text x="160" y="178" textAnchor="middle" style={DISPLAY} fontSize="13" letterSpacing="5" fill={C.ink}>
          RUN CLUB
        </text>
      </g>

      {/* Swing tag on a cord. */}
      <g transform="translate(96 830) rotate(-9 80 120)" filter="url(#hs-shadow)">
        <path d="M80 18C70 -40 140 -70 190 -60" stroke={C.ink} strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M14 0L146 0Q156 0 156 10L156 236Q156 246 146 246L14 246Q4 246 4 236L4 10Q4 0 14 0Z" fill={C.paper} />
        <circle cx="80" cy="22" r="7" fill="url(#hs-plate)" stroke={C.ink} strokeOpacity="0.25" />
        <image href="/mt-logo.svg" x="26" y="48" width="108" height="44" preserveAspectRatio="xMidYMid meet" />
        <path d="M22 112L138 112" stroke={C.ink} strokeOpacity="0.2" />
        <text x="22" y="138" style={DISPLAY} fontSize="8.5" letterSpacing="1" fill={C.ink}>HARBOR RUN CLUB</text>
        <text x="22" y="160" fontFamily="var(--font-sans)" fontSize="11" fill={C.ink} fillOpacity="0.7">Hoodie · Forest</text>
        <text x="22" y="178" fontFamily="var(--font-sans)" fontSize="11" fill={C.ink} fillOpacity="0.7">Twill + embroidery</text>
        <path d="M22 204L138 204" stroke={C.ink} strokeOpacity="0.2" />
        <text x="22" y="226" style={DISPLAY} fontSize="8" letterSpacing="1.2" fill={C.ink} fillOpacity="0.6">STYLE 01 / 03</text>
      </g>

      {/* Grain over everything, a few percent. */}
      <rect width="1000" height="1150" filter="url(#hs-grain)" opacity="0.07" style={{ mixBlendMode: 'multiply' }} />
    </svg>
  );
}
