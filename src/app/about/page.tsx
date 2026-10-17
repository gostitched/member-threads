import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import Reveal from '@/components/Reveal';
import Photo from '@/components/chrome/Photo';
import { Arrow } from '@/components/SiteHeader';
import { FRAME } from '@/components/frame';
import { FOUNDER, OFFER, ORIGIN, STITCHED } from '@/lib/about';
import { SEGMENTS } from '@/lib/site';
import '@/components/chrome/chrome.css';

export const metadata: Metadata = {
  title: 'About',
  description:
    'Why Member Threads exists, how it started, who we make collections for and how we work with Stitched Group.',
};

const FACTS = [
  { k: 'Minimum', v: 'pieces per style', n: '36' },
  { k: 'Design', v: 'Included, every collection' },
  { k: 'Pricing', v: 'One price, no upcharges' },
  { k: 'Parent company', v: 'Stitched Group' },
] as const;

/** Cell dividers for the facts table: 2 columns on phones, 4 on desktop. */
const FACT_CELL = ['pl-0', 'border-l pl-4 lg:pl-8', 'pl-0 lg:border-l lg:pl-8', 'border-l pl-4 lg:pl-8'] as const;


/**
 * An editorial story page. The founder line in the display serif beside the
 * founder (the one real portrait on the site) with a woven label across the
 * top corner; the facts as a hairline table. Why we exist, set against two craft
 * plates. The story as roster rows. What every organization gets, on cream.
 * Stitched Group in the page's one green band. Who it's for as the roster,
 * and the way in.
 */
export default function AboutPage() {
  return (
    <>
      {/* ---- Opening ---- */}
      <section className="band-paper overflow-hidden">
        <div className={`${FRAME} grid-12 pt-10 sm:pt-14 lg:pt-16`}>
          <div className="col-span-4 sm:col-span-8 lg:col-span-7 lg:pt-16">
            <p className="enter t-eyebrow fg-muted" style={{ ['--d' as string]: '0ms' }}>
              About · No. 001
            </p>
            <h1 className="t-display mt-5 max-w-[11ch]">
              <span className="enter block" style={{ ['--d' as string]: '80ms' }}>
                Started for
              </span>
              <span className="enter block" style={{ ['--d' as string]: '160ms' }}>
                our <em>own</em> clubs.
              </span>
            </h1>
            <p className="enter t-lead mt-8 max-w-[34ch] lg:mt-10" style={{ ['--d' as string]: '240ms' }}>
              {ORIGIN.intro}
            </p>
          </div>

          {/* Founder: 4:5, bleeds off the right edge on desktop. */}
          <figure className="relative col-span-4 -mx-5 mt-14 sm:col-span-6 sm:col-start-3 sm:mx-0 lg:col-span-5 lg:col-start-8 lg:mr-[calc(-1*max(3.5rem,(100vw_-_1536px)/2_+_3.5rem))] lg:mt-0">
            {FOUNDER.photo ? (
              /* Head and shoulders: the frame zooms to the face so the stole and its marks fall out of frame. */
              <div className="photo grade grain aspect-[4/5]">
                <Image
                  src={FOUNDER.photo}
                  alt={`${FOUNDER.name}, founder of Member Threads, smiling`}
                  width={FOUNDER.width}
                  height={FOUNDER.height}
                  priority
                  sizes="(min-width: 1024px) 1200px, 100vw"
                  className="mt-founder"
                />
              </div>
            ) : (
              <div className="aspect-[4/5] bg-cream" />
            )}
            <span className="woven woven-lg absolute -top-4 left-5 z-10 sm:-left-6 lg:-left-10">
              No. 001 · {FOUNDER.name}, {FOUNDER.role.toLowerCase()}
            </span>
          </figure>

          <dl className="col-span-4 mt-20 grid grid-cols-2 border-t border-rule sm:col-span-8 lg:col-span-12 lg:mt-24 lg:grid-cols-4">
            {FACTS.map((f, i) => (
              <div key={f.k} className={`border-b border-rule py-6 pr-4 lg:border-b-0 lg:py-8 ${FACT_CELL[i]}`}>
                <dt className="t-eyebrow fg-muted">{f.k}</dt>
                <dd className="mt-3 flex items-baseline gap-2">
                  {'n' in f && <span className="t-block">{f.n}</span>}
                  <span className="t-h3">{f.v}</span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ---- Why we exist ---- */}
      <section className="band-paper sec">
        <div className={`${FRAME} grid-12 gap-y-10`}>
          <p className="t-eyebrow fg-muted col-span-4 sm:col-span-8 lg:col-span-3">No. 01 / Why we exist</p>
          <Reveal className="col-span-4 sm:col-span-8 lg:col-span-8">
            <h2 className="t-h2 max-w-[24ch]">{ORIGIN.why}</h2>
            <p className="t-body mt-8 max-w-[62ch] text-ink/90">{ORIGIN.whyBody}</p>
          </Reveal>

          <figure className="col-span-4 mt-6 sm:col-span-5 lg:col-span-7 lg:mt-16">
            <Photo
              slug="lifestyle-fence-pair"
              ratio="landscape"
              motion="wipe-in"
              sizes="(min-width: 1536px) 860px, (min-width: 1024px) 56vw, (min-width: 640px) 60vw, 100vw"
            />
            <figcaption className="caption">Worn by choice</figcaption>
          </figure>
          <figure className="col-span-3 col-start-2 sm:col-span-3 sm:col-start-6 sm:mt-24 lg:col-span-4 lg:col-start-9 lg:mt-48">
            <Photo
              slug="detail-folded-stack-warm"
              ratio="portrait"
              motion="wipe-in"
              sizes="(min-width: 1536px) 480px, (min-width: 1024px) 31vw, (min-width: 640px) 36vw, 75vw"
            />
            <figcaption className="caption">Kept, not handed out</figcaption>
          </figure>
        </div>
      </section>

      {/* ---- How it started: the roster rows ---- */}
      <section className="band-paper sec pt-0">
        <div className={`${FRAME} grid-12 gap-y-14`}>
          <div className="col-span-4 sm:col-span-8 lg:col-span-4">
            <div className="lg:sticky lg:top-[132px]">
              <p className="t-eyebrow fg-muted">No. 02 / How it started</p>
              <h2 className="t-h1 mt-5">
                From one club to <em>every</em> kind.
              </h2>
            </div>
          </div>
          <ol className="relative col-span-4 sm:col-span-8 lg:col-span-7 lg:col-start-6">
            {ORIGIN.story.map((s, i) => (
              <li key={s.title} className="grid grid-cols-[4.5rem_minmax(0,1fr)] gap-x-4 sm:grid-cols-[8rem_minmax(0,1fr)] sm:gap-x-8">
                <span aria-hidden className="stitch-rule draw-in col-span-2 mb-8" />
                <p className="t-block pt-1 text-beige-deep">{String(i + 1).padStart(2, '0')}</p>
                <Reveal delay={i * 80} className="pb-14 lg:pb-20">
                  <p className="t-spec fg-muted">{s.when}</p>
                  <h3 className="t-h3 mt-3">{s.title}</h3>
                  <p className="t-body mt-4 max-w-[52ch] text-ink/90">{s.body}</p>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ---- What you get ---- */}
      <section id="what-you-get" className="band-cream sec scroll-mt-[72px] sm:scroll-mt-[84px] lg:scroll-mt-[92px]">
        <div className={FRAME}>
          <div className="grid-12 gap-y-6">
            <p className="t-eyebrow fg-muted col-span-4 sm:col-span-8 lg:col-span-3">No. 03 / Included</p>
            <h2 className="t-h1 col-span-4 sm:col-span-8 lg:col-span-8">
              Included, every <em>time</em>.
            </h2>
          </div>
          <ul className="mt-16 grid gap-y-12 sm:grid-cols-2 lg:mt-24 lg:grid-cols-4">
            {OFFER.map((o, i) => (
              <li key={o.title} className={`border-t border-[var(--rule-c)] pt-6 sm:pr-8 lg:border-t-0 lg:pt-0 ${i ? 'lg:border-l lg:pl-8' : ''}`}>
                <Reveal delay={i * 80}>
                  <span className="t-block text-beige-deep">{String(i + 1).padStart(2, '0')}</span>
                  <h3 className="t-h3 mt-8">{o.title}</h3>
                  <p className="t-body mt-3 text-ink/90">{o.line}</p>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ---- Stitched Group: the page's green band ---- */}
      <section id="stitched" className="band-green sec scroll-mt-[72px] overflow-hidden sm:scroll-mt-[84px] lg:scroll-mt-[92px]">
        <div className={`${FRAME} grid-12 items-center gap-y-12`}>
          <figure className="col-span-4 -ml-5 sm:col-span-5 sm:-ml-8 lg:col-span-5 lg:ml-[calc(-1*max(3.5rem,(100vw_-_1536px)/2_+_3.5rem))]">
            <Photo
              slug="craft-thread-cones"
              ratio="portrait"
              motion="drift-in"
              sizes="(min-width: 1536px) 680px, (min-width: 1024px) 44vw, (min-width: 640px) 62vw, 100vw"
            />
          </figure>
          <Reveal className="col-span-4 sm:col-span-8 lg:col-span-6 lg:col-start-7">
            <p className="t-eyebrow text-beige">No. 04 / How we’re built</p>
            <h2 className="t-h1 mt-5">
              Part of Stitched <em>Group</em>.
            </h2>
            <p className="t-body mt-8 max-w-[56ch] text-cream/90">{STITCHED.body}</p>
            <dl className="mt-10 border-t border-[var(--rule-c)]">
              {STITCHED.split.map((r) => (
                <div key={r.k} className="grid gap-1 border-b border-[var(--rule-c)] py-4 sm:grid-cols-[11rem_minmax(0,1fr)] sm:gap-6">
                  <dt className="t-spec text-beige">{r.k}</dt>
                  <dd className="t-body text-cream">{r.v}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </section>

      {/* ---- Who it's for: the roster ---- */}
      <section className="band-paper sec">
        <div className={FRAME}>
          <div className="grid-12 gap-y-6">
            <p className="t-eyebrow fg-muted col-span-4 sm:col-span-8 lg:col-span-3">No. 05 / The roster</p>
            <div className="col-span-4 sm:col-span-8 lg:col-span-8">
              <h2 className="t-h1">
                Any group with a <em>name</em>.
              </h2>
              <p className="t-lead mt-6 max-w-[34ch]">If you have 36 people who’d wear it, we can make it.</p>
            </div>
          </div>

          <ol className="mt-14 border-t border-rule lg:mt-20">
            {SEGMENTS.map((s, i) => (
              <li key={s.id} className="border-b border-rule">
                <div className="grid-12 items-baseline gap-y-1 py-5 lg:py-6">
                  <span className="t-spec fg-muted col-span-1">{String(i + 1).padStart(2, '0')}</span>
                  <h3 className="t-h3 col-span-3 sm:col-span-3 lg:col-span-4">{s.label}</h3>
                  <p className="t-body col-span-3 col-start-2 text-ink/90 sm:col-span-4 sm:col-start-5 lg:col-span-7 lg:col-start-6">
                    {s.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-12 flex flex-wrap items-center gap-x-10 gap-y-2">
            <Link href="/catalog" className="link-arrow text-[15px] font-medium">
              <span className="link-u">Browse the catalog</span> <Arrow className="h-3 w-4" />
            </Link>
            <Link href="/work" className="link-arrow text-[15px] font-medium">
              <span className="link-u">See the collections</span> <Arrow className="h-3 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
