import type { Metadata } from 'next';
import Link from 'next/link';
import Reveal from '@/components/Reveal';
import { Arrow } from '@/components/SiteHeader';
import { FRAME } from '@/components/frame';
import { FOUNDER, OFFER, ORIGIN, STITCHED } from '@/lib/about';
import { SEGMENTS } from '@/lib/site';

export const metadata: Metadata = {
  title: 'About',
  description:
    'Why Member Threads exists, how it started, who we make collections for and how we work with Stitched Group.',
};

const FACTS = [
  { k: 'Minimum', v: '36 pieces per style' },
  { k: 'Design', v: 'Included, every collection' },
  { k: 'Pricing', v: 'One price, no upcharges' },
  { k: 'Parent company', v: 'Stitched Group' },
] as const;

/**
 * The title and intro with a row of plain facts; why we exist; the founder on
 * a cream band; who it's for as an indexed list; what every organization gets;
 * the Stitched Group note and the one pill.
 */
export default function AboutPage() {
  return (
    <>
      {/* Title */}
      <section className="bg-paper text-ink">
        <div className={`${FRAME} pb-16 pt-14 sm:pb-20 sm:pt-20 lg:pb-24 lg:pt-28`}>
          <p className="rise label text-ink/55">About Member Threads</p>
          <h1 className="caps mt-6 text-[clamp(2.75rem,7.6vw,7.25rem)] leading-[0.92] tracking-[-0.035em]">
            <span className="rise block" style={{ animationDelay: '60ms' }}>
              Apparel worth
            </span>
            <span
              className="rise block font-serif text-[1.02em] font-normal normal-case leading-[1.05] tracking-normal text-dusty [font-stretch:100%]"
              style={{ animationDelay: '160ms' }}
            >
              belonging to.
            </span>
          </h1>
          <p className="rise mt-10 max-w-[44rem] text-lead text-ink/75" style={{ animationDelay: '260ms' }}>
            {ORIGIN.intro}
          </p>

          <dl className="mt-16 grid grid-cols-2 gap-x-6 gap-y-8 border-t border-ink/15 pt-7 lg:mt-20 lg:grid-cols-4">
            {FACTS.map((f) => (
              <div key={f.k}>
                <dt className="label text-ink/50">{f.k}</dt>
                <dd className="mt-2 text-[1rem] font-medium leading-snug sm:text-[1.0625rem]">{f.v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Why */}
      <section className="bg-paper text-ink">
        <div className={`${FRAME} grid gap-6 border-t border-rule py-20 sm:py-24 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-10 lg:py-32`}>
          <p className="label text-ink/55">Why we exist</p>
          <Reveal>
            <p className="text-d2 font-display font-semibold tracking-[-0.025em] [font-stretch:105%]">{ORIGIN.why}</p>
            <p className="mt-8 max-w-[40rem] text-lead text-ink/70">{ORIGIN.whyBody}</p>
          </Reveal>
        </div>
      </section>

      {/* Founder */}
      <section className="bg-cream text-ink">
        <div className={`${FRAME} grid gap-12 py-20 sm:py-24 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:items-center lg:gap-20 lg:py-32`}>
          <figure className="mx-auto w-full max-w-[34rem] lg:mx-0">
            {FOUNDER.photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={FOUNDER.photo}
                alt={`${FOUNDER.name}, founder of Member Threads`}
                width={1200}
                height={1500}
                className="aspect-[4/5] w-full rounded-[4px] object-cover"
              />
            ) : (
              <div className="aspect-[4/5] w-full rounded-[4px] bg-beige" />
            )}
            <figcaption className="mt-4 flex items-baseline justify-between gap-4">
              <span className="text-[0.9375rem] font-medium">{FOUNDER.name}</span>
              <span className="label text-ink/55">{FOUNDER.role}</span>
            </figcaption>
          </figure>

          <Reveal>
            <p className="label text-ink/55">How it started</p>
            <h2 className="caps mt-5 text-d1">
              Started with
              <br />
              his own clubs.
            </h2>
            <div className="mt-10 max-w-[38rem] space-y-5 text-lead text-ink/75">
              {ORIGIN.story.map((p) => (
                <p key={p.slice(0, 24)}>{p}</p>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Who it's for */}
      <section className="bg-paper text-ink">
        <div className={`${FRAME} py-20 sm:py-24 lg:py-32`}>
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-10">
            <p className="label text-ink/55">Who it’s for</p>
            <h2 className="caps text-d1">
              Any group
              <br />
              with a name.
            </h2>
          </div>

          <ol className="mt-14 border-t border-ink/15 lg:mt-20">
            {SEGMENTS.map((s, i) => (
              <li key={s.id} className="border-b border-ink/15">
                <Reveal
                  delay={i * 50}
                  className="grid gap-3 py-8 lg:grid-cols-3 lg:gap-10 lg:py-10"
                >
                  <div className="flex items-baseline gap-5 lg:gap-6">
                    <span className="label text-ink/45">{String(i + 1).padStart(2, '0')}</span>
                    <h3 className="text-[1.25rem] font-semibold leading-tight tracking-[-0.012em] [font-family:var(--font-sans)] lg:text-[1.375rem]">
                      {s.title}
                    </h3>
                  </div>
                  <p className="text-[0.9375rem] leading-relaxed text-ink/70 pl-[2.6rem] lg:pl-0">{s.body}</p>
                  <p className="label leading-[1.7] text-ink/55 pl-[2.6rem] lg:pl-0">{s.pieces.join(' · ')}</p>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* What you get */}
      <section id="what-you-get" className="scroll-mt-20 bg-paper text-ink sm:scroll-mt-[84px] lg:scroll-mt-[92px]">
        <div className={`${FRAME} border-t border-rule py-20 sm:py-24 lg:py-32`}>
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-10">
            <p className="label text-ink/55">What you get</p>
            <h2 className="caps text-d1">
              Included,
              <br />
              every time.
            </h2>
          </div>
          <ul className="mt-14 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:mt-20 lg:grid-cols-4">
            {OFFER.map((o, i) => (
              <li key={o.title}>
                <Reveal delay={i * 60} className="h-full border-t-2 border-ink pt-6">
                  <span className="label text-ink/45">{String(i + 1).padStart(2, '0')}</span>
                  <h3 className="mt-6 text-[1.25rem] font-semibold leading-tight tracking-[-0.012em] [font-family:var(--font-sans)]">
                    {o.title}
                  </h3>
                  <p className="mt-3 text-[0.9375rem] leading-relaxed text-ink/70">{o.line}</p>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Stitched Group + CTA */}
      <section className="bg-paper text-ink">
        <div className={`${FRAME} pb-24 sm:pb-28 lg:pb-36`}>
          <Reveal className="grid gap-8 rounded-[4px] bg-cream p-8 sm:p-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-end lg:gap-16 lg:p-16">
            <div>
              <p className="label text-ink/55">How we’re built</p>
              <h2 className="caps mt-5 text-d2">{STITCHED.title}</h2>
            </div>
            <div>
              <p className="max-w-[36rem] text-lead text-ink/75">{STITCHED.body}</p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link href="/quote" className="btn-blue px-7">
                  Start a Collection <Arrow className="ml-1 h-3.5 w-[18px]" />
                </Link>
                <Link href="/catalog" className="btn-outline px-7">
                  Browse the Catalog
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
