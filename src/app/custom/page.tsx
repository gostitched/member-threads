import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import Reveal from '@/components/Reveal';
import Photo from '@/components/chrome/Photo';
import { Arrow } from '@/components/SiteHeader';
import { FRAME } from '@/components/frame';
import { CAPABILITIES, CAPABILITY_ROWS } from '@/lib/site';
import '@/components/chrome/chrome.css';

export const metadata: Metadata = {
  title: 'Fully Custom',
  description:
    'When the piece isn’t in the catalog, we develop it from scratch for your organization: fabric, fit, construction, trims and labels.',
};

/**
 * What you decide on a fully custom piece. `pin` places its number on the
 * working drawing (percent of the 1600 × 1100 sheet).
 */
const CHOOSE = [
  { title: 'Fabric', line: 'Heavyweight fleece, loopback terry, piqué, waffle knit, nylon shell.', pin: { x: 32.5, y: 27 } },
  { title: 'Fit', line: 'Boxy, relaxed, classic or cropped, cut for the people who will wear it.', pin: { x: 18.6, y: 34.5 } },
  { title: 'Construction', line: 'Contrast rib, raglan sleeves, side panels, quarter- or full-zip.', pin: { x: 50, y: 78 } },
  { title: 'Trims & labels', line: 'A woven neck label with your crest, custom zipper pulls, hang tags.', pin: { x: 17.5, y: 55 } },
] as const;

const INDEX_PREFIX = { garments: 'P', decoration: 'F' } as const;
const INDEX_TITLE = { garments: 'What we make', decoration: 'How we finish it' } as const;

/**
 * The tech-pack page. The display line beside a swatch plate; the working
 * drawing pinned to cream with numbered callouts, keyed to a hairline table
 * of the four decisions; the capabilities as a numbered index of pieces and
 * finishes under three craft plates; the way in.
 */
export default function CustomPage() {
  return (
    <>
      {/* ---- Opening ---- */}
      <section className="band-paper overflow-hidden">
        <div className={`${FRAME} grid-12 pb-20 pt-10 sm:pt-14 lg:pb-28 lg:pt-16`}>
          <div className="col-span-4 sm:col-span-8 lg:col-span-7 lg:pt-16">
            <p className="enter t-eyebrow fg-muted">Fully custom · Development</p>
            <h1 className="t-display mt-5">
              <span className="enter block" style={{ ['--d' as string]: '80ms' }}>
                Beyond the
              </span>
              <span className="enter block" style={{ ['--d' as string]: '160ms' }}>
                <em>catalog</em>.
              </span>
            </h1>
            <p className="enter t-lead mt-8 max-w-[36ch] lg:mt-10" style={{ ['--d' as string]: '240ms' }}>
              Most collections start from our catalog. When the piece you have in mind isn’t there, we develop it from
              scratch for your organization: the fabric, the fit, the construction and every trim.
            </p>
            <p className="enter t-body mt-5 max-w-[44ch] text-ink/90" style={{ ['--d' as string]: '300ms' }}>
              A reference photo or a sentence is enough to start.
            </p>
            <div className="enter mt-10" style={{ ['--d' as string]: '360ms' }}>
              <Link href="/quote" className="btn-blue">
                Describe the piece <Arrow className="h-3.5 w-[18px]" />
              </Link>
            </div>
          </div>

          <figure className="relative col-span-4 -mx-5 mt-16 sm:col-span-6 sm:col-start-3 sm:mx-0 lg:col-span-4 lg:col-start-9 lg:mr-[calc(-1*max(3.5rem,(100vw_-_1536px)/2_+_3.5rem))] lg:mt-0">
            <Photo
              slug="craft-fabric-swatches"
              ratio="tall"
              priority
              sizes="(min-width: 1536px) 560px, (min-width: 1024px) 36vw, (min-width: 640px) 75vw, 100vw"
            />
            <span className="woven woven-green woven-lg absolute -bottom-4 left-5 z-10 sm:-left-6 lg:-left-10">
              From 36 · Design included
            </span>
          </figure>
        </div>
      </section>

      {/* ---- The working drawing ---- */}
      <section className="band-cream sec" aria-labelledby="decide-title">
        <div className={FRAME}>
          <div className="grid-12 gap-y-6">
            <p className="t-eyebrow fg-muted col-span-4 sm:col-span-8 lg:col-span-3">No. 01 / What you decide</p>
            <h2 id="decide-title" className="t-h1 col-span-4 sm:col-span-8 lg:col-span-8">
              Every detail, your <em>call</em>.
            </h2>
          </div>

          <figure className="mt-14 lg:mt-20">
            <div className="relative">
              <Image
                src="/chapter/harbor-working-drawing.svg"
                alt="Working drawing of a club hoodie: flat sketch with measurements, embroidery and trim notes, and colour cards"
                width={1600}
                height={1100}
                sizes="(min-width: 1536px) 1424px, 92vw"
                className="lift block h-auto w-full"
                unoptimized
              />
              {CHOOSE.map((c, i) => (
                <span
                  key={c.title}
                  aria-hidden
                  className="mt-pin t-spec flex h-7 w-7 items-center justify-center bg-cream text-ink sm:h-9 sm:w-9"
                  style={{ left: `${c.pin.x}%`, top: `${c.pin.y}%` }}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
              ))}
            </div>
            <figcaption className="caption">Working drawing · Style MT-HD01 · An example sheet</figcaption>
          </figure>

          <ol className="mt-14 border-t border-[var(--rule-c)] lg:mt-20">
            {CHOOSE.map((c, i) => (
              <li key={c.title} className="border-b border-[var(--rule-c)]">
                <Reveal delay={i * 60} className="grid-12 items-baseline gap-y-2 py-6 lg:py-8">
                  <span className="t-block col-span-1 text-[clamp(1.25rem,2vw,1.75rem)] text-beige-deep sm:col-span-1">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <h3 className="t-h3 col-span-3 sm:col-span-3 lg:col-span-4 lg:col-start-3">{c.title}</h3>
                  <p className="t-body col-span-3 col-start-2 text-ink/90 sm:col-span-4 sm:col-start-5 lg:col-span-6 lg:col-start-7">
                    {c.line}
                  </p>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ---- The index ---- */}
      <section className="band-paper sec" aria-labelledby="index-title">
        <div className={FRAME}>
          <div className="grid-12 gap-y-6">
            <p className="t-eyebrow fg-muted col-span-4 sm:col-span-8 lg:col-span-3">No. 02 / The index</p>
            <h2 id="index-title" className="t-h1 col-span-4 sm:col-span-8 lg:col-span-8">
              What we make, and how we <em>finish</em> it.
            </h2>
          </div>

          {/* Three craft plates, staggered. */}
          <div className="grid-12 mt-14 gap-y-10 lg:mt-20">
            <figure className="col-span-2 sm:col-span-3 lg:col-span-4">
              <Photo slug="detail-chenille-numerals" ratio="square" motion="wipe-in" sizes="(min-width: 1024px) 31vw, (min-width: 640px) 36vw, 48vw" />
              <figcaption className="caption">Chenille</figcaption>
            </figure>
            <figure className="col-span-2 mt-16 sm:col-span-3 sm:mt-24 lg:col-span-4 lg:mt-32">
              <Photo slug="detail-embroidery-needle" ratio="portrait" motion="wipe-in" sizes="(min-width: 1024px) 31vw, (min-width: 640px) 36vw, 48vw" />
              <figcaption className="caption">Satin stitch</figcaption>
            </figure>
            <figure className="col-span-3 col-start-2 sm:col-span-2 sm:col-start-7 sm:mt-10 lg:col-span-4 lg:col-start-9 lg:mt-12">
              <Photo slug="detail-fabric-rolls" ratio="square" motion="wipe-in" sizes="(min-width: 1024px) 31vw, (min-width: 640px) 24vw, 72vw" />
              <figcaption className="caption">Cotton, by the roll</figcaption>
            </figure>
          </div>

          <div className="grid-12 mt-20 gap-y-16 lg:mt-28">
            {CAPABILITY_ROWS.map((row, r) => (
              <div
                key={row.key}
                className={`col-span-4 sm:col-span-8 lg:col-span-6 ${r ? 'lg:col-span-5 lg:col-start-8' : 'lg:col-span-5'}`}
              >
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="t-h2">{INDEX_TITLE[row.key]}</h3>
                  <p className="t-spec fg-muted">
                    {row.label} · {String(CAPABILITIES[row.key].length).padStart(2, '0')}
                  </p>
                </div>
                <ol className="mt-6 border-t border-ink">
                  {CAPABILITIES[row.key].map((item, i) => (
                    <li key={item} className="flex items-baseline gap-5 border-b border-rule py-3.5">
                      <span className="t-spec w-10 shrink-0 fg-muted">
                        {INDEX_PREFIX[row.key]}-{String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="t-body text-[18px]">{item}</span>
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- The way in ---- */}
      <section className="band-paper sec pt-0">
        <div className={FRAME}>
          <span aria-hidden className="stitch-rule draw-in" />
          <div className="grid-12 gap-y-8 pt-16 lg:pt-24">
            <h2 className="t-h1 col-span-4 sm:col-span-8 lg:col-span-7">
              Have a piece in <em>mind</em>?
            </h2>
            <div className="col-span-4 sm:col-span-6 lg:col-span-4 lg:col-start-9">
              <p className="t-lead">Tell us what it is and who it’s for. Your designer takes it from there.</p>
              <Link href="/quote" className="btn-blue mt-10">
                Describe the piece <Arrow className="h-3.5 w-[18px]" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
