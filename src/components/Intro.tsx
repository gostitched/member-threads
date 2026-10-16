import Image from 'next/image';
import Reveal from '@/components/Reveal';
import { PHOTOS } from '@/lib/photos';
import '@/components/home/home.css';

/**
 * What Member Threads is, for a buyer landing cold. The idea made explicit as
 * a contrast: "Printed on" (a blank, a logo pressed flat, at rest in duotone)
 * against "Sewn in" (chenille at macro, in full grade), staggered down the
 * grid. Then three principles in columns divided by hairlines, and a closing
 * line. Server component.
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

const blank = PHOTOS['texture-canvas'];
const sewn = PHOTOS['detail-chenille-numerals'];

export default function Intro() {
  return (
    <section aria-labelledby="intro-title" className="sec bg-paper text-ink">
      <div className="shell">
        {/* Headline cols 1–7, lead cols 8–12 on the headline's last line. */}
        <div className="grid-12 items-end gap-y-6">
          <div className="col-span-4 sm:col-span-8 lg:col-span-7">
            <p className="t-eyebrow fg-muted">What we do</p>
            <h2 id="intro-title" className="t-h1 mt-5">
              Not merch. <em>A collection.</em>
            </h2>
          </div>
          <p className="t-lead col-span-4 max-w-measure sm:col-span-7 lg:col-span-5 lg:pb-1">
            We make custom collections the way a label makes a season: considered pieces, one point of view, finished
            properly. You bring the organization. We handle design, production and delivery.
          </p>
        </div>

        {/* Printed on / Sewn in. */}
        <div className="grid-12 mt-16 gap-y-14 sm:mt-20 lg:mt-24">
          <figure className="col-span-3 sm:col-span-4 lg:col-span-5">
            <div className="relative">
              <div className="drift-in photo duo grain aspect-[4/5]">
                <Image
                  src={blank.src}
                  width={blank.width}
                  height={blank.height}
                  alt={blank.alt}
                  sizes="(min-width: 1024px) 36vw, (min-width: 640px) 48vw, 75vw"
                  style={{ objectPosition: blank.objectPosition }}
                />
                {/* The logo, pressed flat onto it. */}
                <span aria-hidden className="intro-print">
                  <span className="stamp-grain border-2 border-current px-5 py-3 font-display text-[clamp(1.25rem,2.4vw,2rem)] font-black uppercase leading-none tracking-[-0.01em] text-ink/70 [font-stretch:125%]">
                    Logo
                  </span>
                </span>
              </div>
              <span className="woven absolute -top-3 left-4">Printed on</span>
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
              <span className="woven-green woven absolute -top-3 left-4">Sewn in</span>
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

        <Reveal className="home-gap">
          <span aria-hidden className="draw-in stitch-rule w-24" />
          <p className="t-h2 mt-8 max-w-[22ch]">
            Pieces your members keep reaching for, <em>season after season.</em>
          </p>
        </Reveal>
      </div>
    </section>
  );
}
