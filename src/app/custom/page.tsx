import type { Metadata } from 'next';
import Link from 'next/link';
import Reveal from '@/components/Reveal';
import { Arrow } from '@/components/SiteHeader';
import { FRAME } from '@/components/frame';
import { CAPABILITIES, CAPABILITY_ROWS } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Fully Custom',
  description:
    'When the piece isn’t in the catalog, we develop it from scratch for your organization: fabric, fit, construction, trims and labels.',
};

/** What you decide on a fully custom piece. */
const CHOOSE = [
  { title: 'Fabric', line: 'Heavyweight fleece, loopback terry, piqué, waffle knit, nylon shell.' },
  { title: 'Fit', line: 'Boxy, relaxed, classic or cropped, cut for the people who will wear it.' },
  { title: 'Construction', line: 'Contrast rib, raglan sleeves, side panels, quarter- or full-zip.' },
  { title: 'Trims & labels', line: 'A woven neck label with your crest, custom zipper pulls, hang tags.' },
] as const;

/**
 * The title and one paragraph; the four decisions on a fully custom piece;
 * what we make and how we finish it as two labelled lists on a cream band;
 * the one pill.
 */
export default function CustomPage() {
  return (
    <>
      <section className="bg-paper text-ink">
        <div className={`${FRAME} pb-16 pt-14 sm:pb-20 sm:pt-20 lg:pb-24 lg:pt-28`}>
          <p className="rise label text-ink/55">Fully custom</p>
          <h1 className="caps mt-6 text-[clamp(2.75rem,7.6vw,7.25rem)] leading-[0.92] tracking-[-0.035em]">
            <span className="rise block" style={{ animationDelay: '60ms' }}>
              Beyond the
            </span>
            <span
              className="rise block font-serif text-[1.02em] font-normal normal-case leading-[1.05] tracking-normal text-dusty [font-stretch:100%]"
              style={{ animationDelay: '160ms' }}
            >
              catalog.
            </span>
          </h1>
          <div className="rise mt-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-10" style={{ animationDelay: '260ms' }}>
            <p className="max-w-[40rem] text-lead text-ink/75 lg:col-start-2">
              Most collections start from our catalog. When the piece you have in mind isn’t there, we develop it from
              scratch for your organization: the fabric, the fit, the construction and every trim. A reference photo or a
              sentence is enough to start.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-paper text-ink">
        <div className={`${FRAME} border-t border-rule py-20 sm:py-24 lg:py-28`}>
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-10">
            <p className="label text-ink/55">What you decide</p>
            <h2 className="caps text-d1">
              Every detail,
              <br />
              your call.
            </h2>
          </div>
          <ul className="mt-14 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:mt-20 lg:grid-cols-4">
            {CHOOSE.map((c, i) => (
              <li key={c.title}>
                <Reveal delay={i * 60} className="h-full border-t-2 border-ink pt-6">
                  <span className="label text-ink/45">{String(i + 1).padStart(2, '0')}</span>
                  <h3 className="mt-6 text-[1.25rem] font-semibold leading-tight tracking-[-0.012em] [font-family:var(--font-sans)]">
                    {c.title}
                  </h3>
                  <p className="mt-3 text-[0.9375rem] leading-relaxed text-ink/70">{c.line}</p>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-cream text-ink">
        <div className={`${FRAME} py-20 sm:py-24 lg:py-28`}>
          {CAPABILITY_ROWS.map((row, r) => (
            <Reveal
              key={row.key}
              delay={r * 80}
              className={`grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-10 ${r ? 'mt-16 lg:mt-20' : ''}`}
            >
              <div>
                <p className="label text-ink/55">{row.label}</p>
                <h2 className="caps mt-4 text-d3">{row.key === 'garments' ? 'What we make' : 'How we finish it'}</h2>
              </div>
              <ul className="grid grid-cols-1 gap-x-10 border-t border-ink/15 sm:grid-cols-2 lg:grid-cols-3">
                {CAPABILITIES[row.key].map((item) => (
                  <li key={item} className="border-b border-ink/15 py-3.5 text-[0.9375rem] font-medium">
                    {item}
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="bg-paper text-ink">
        <div className={`${FRAME} flex flex-col gap-8 py-20 sm:py-24 lg:flex-row lg:items-end lg:justify-between lg:py-28`}>
          <div>
            <h2 className="caps text-d1">Have a piece in mind?</h2>
            <p className="mt-5 max-w-[34rem] text-lead text-ink/70">
              Tell us what it is and who it’s for. Your designer takes it from there.
            </p>
          </div>
          <Link href="/quote" className="btn-blue h-14 w-fit shrink-0 px-8 text-[1rem]">
            Describe the piece <Arrow className="ml-1 h-3.5 w-[18px]" />
          </Link>
        </div>
      </section>
    </>
  );
}
