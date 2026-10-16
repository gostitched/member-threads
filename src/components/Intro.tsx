import Image from 'next/image';
import Reveal from '@/components/Reveal';
import { PHOTOS } from '@/lib/photos';
import '@/components/home/home.css';

/**
 * What Member Threads is, for a buyer landing cold. The idea made explicit as
 * a contrast: "Printed on" (a drawn stock blank, a logo pressed flat)
 * against "Sewn in" (chenille at macro, in full grade), staggered down the
 * grid. Then three principles in columns divided by hairlines. Server
 * component.
 */

// [CONFIRM] 01: every style is cut and sewn to spec (not decorated stock blanks).
const PRINCIPLES = [
  {
    n: '01',
    title: 'Made from the fabric up',
    body: 'We cut and sew to your spec: your choice of fabric, weight, color and fit. Not a stock blank with a logo pressed on.',
  },
  {
    n: '02',
    title: 'Every detail customizable',
    body: 'Embroidery, chenille, woven labels, custom trims and Pantone-matched colors, all in one clear price with no upcharges.',
  },
  {
    n: '03',
    title: 'Design team included',
    body: 'A designer turns your logo, colors and a few references into a cohesive collection, and revises it with you until it is right.',
  },
] as const;

const sewn = PHOTOS['detail-chenille-numerals'];

export default function Intro() {
  return (
    <section aria-labelledby="intro-title" className="sec bg-paper text-ink">
      <div className="shell">
        {/* A stepped header (not the eyebrow-left / lead-right of the roster
            that follows): headline cols 1–8, the lead dropped to cols 7–12. */}
        <div className="grid-12 gap-y-8">
          <div className="col-span-4 sm:col-span-8 lg:col-span-8">
            <p className="t-eyebrow fg-muted">What we do</p>
            <h2 id="intro-title" className="t-h1 mt-5">
              Made to be <em>kept.</em>
            </h2>
          </div>
          <p className="t-lead col-span-4 max-w-measure sm:col-span-6 sm:col-start-3 lg:col-span-6 lg:col-start-7">
            We make custom collections the way a label makes a season: considered pieces, one point of view, finished
            properly. You bring the organization. We handle design, production and delivery.
          </p>
        </div>

        {/* Printed on / Sewn in. */}
        <div className="grid-12 mt-16 gap-y-14 sm:mt-20 lg:mt-24">
          <figure className="col-span-3 sm:col-span-4 lg:col-span-5">
            <div className="relative">
              {/* A drawing, not a photo: the generic blank, flat, a logo pressed on. */}
              <div className="photo grain aspect-[4/5] bg-cream">
                <svg viewBox="0 0 400 500" className="absolute inset-0 h-full w-full" role="img" aria-label="Drawing of a plain stock T-shirt with a rectangular logo printed flat on the chest">
                  <path
                    d="M128 92 L170 76 Q200 100 230 76 L272 92 L348 150 L318 204 L290 190 L290 436 L110 436 L110 190 L82 204 L52 150 Z"
                    fill="#E2D8C7"
                    stroke="#133327"
                    strokeOpacity="0.35"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />
                  <path d="M170 76 Q200 112 230 76" fill="none" stroke="#133327" strokeOpacity="0.35" strokeWidth="1.5" />
                  <g opacity="0.55">
                    <rect x="162" y="168" width="76" height="38" fill="none" stroke="#133327" strokeWidth="3" />
                    <text x="200" y="194" textAnchor="middle" fontFamily="var(--font-display)" fontWeight="900" fontSize="20" fill="#133327" letterSpacing="1">
                      LOGO
                    </text>
                  </g>
                </svg>
              </div>
              <span className="woven woven-beige woven-lg absolute -top-4 left-4">Printed on</span>
            </div>
            <figcaption className="caption">A stock blank, a logo pressed flat on the front</figcaption>
          </figure>

          <figure className="col-span-4 sm:col-span-8 lg:col-start-7 lg:col-end-13 lg:mt-40">
            <div className="relative">
              <div className="drift-in photo grade grain aspect-[3/2]">
                <Image
                  src={sewn.src}
                  width={sewn.width}
                  height={sewn.height}
                  alt={sewn.alt}
                  sizes="(min-width: 1536px) 46vw, (min-width: 1024px) 48vw, 100vw"
                  style={{ objectPosition: sewn.objectPosition }}
                />
              </div>
              <span className="woven-green woven woven-lg absolute -top-4 left-4">Sewn in</span>
            </div>
            <figcaption className="caption">Chenille numerals, stitched into twill</figcaption>
          </figure>
        </div>

        {/* Three principles. */}
        <ul className="intro-pillars home-gap hairline grid gap-y-12 pt-10 md:grid-cols-3 md:gap-y-0">
          {PRINCIPLES.map((c, i) => (
            <li key={c.n} className="md:px-8 md:first:pl-0 md:last:pr-0 lg:px-10">
              <Reveal delay={i * 80}>
                <span aria-hidden className="t-block text-beige-deep">
                  {c.n}
                </span>
                <h3 className="t-h3 mt-6 md:mt-12">{c.title}</h3>
                <p className="t-body mt-4 max-w-[38ch] text-ink/90">{c.body}</p>
              </Reveal>
            </li>
          ))}
        </ul>

      </div>
    </section>
  );
}
