import type { Metadata } from 'next';
import Link from 'next/link';
import Reveal from '@/components/Reveal';
import { CAPABILITIES } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Fully custom',
  description: 'Any piece, developed from scratch for your Bar or Bat Mitzvah collection: fabric, fit, construction, trims and labels.',
};

/** What you decide on a fully custom piece. */
const CHOOSE = [
  { title: 'Fabric', line: 'Heavy fleece, waffle, satin, terry.' },
  { title: 'Fit', line: 'Oversized, cropped, boxy, baby.' },
  { title: 'Construction', line: 'Contrast rib, foldover waist, raglan sleeves.' },
  { title: 'Trims & labels', line: 'Zipper pulls, cords, a woven label with their name.' },
] as const;

/**
 * Paper band, four white tiles, then what we make (pale-blue chips) and how
 * we finish it (pale-pink chips). One button.
 */
export default function CustomPage() {
  return (
    <>
      <section
        className="bg-paper text-ink"
      >
        <div className="shell pb-16 pt-12 sm:pb-24 sm:pt-16">
          <h1 className="caps text-d1">
            <span className="rise block" style={{ animationDelay: '60ms' }}>
              Describe the piece.
            </span>
          </h1>
          <p
            className="rise mt-3 font-sans text-[clamp(1.375rem,2.1vw,1.875rem)] font-medium leading-[1.1] tracking-[-0.015em] text-uv"
            style={{ animationDelay: '180ms' }}
          >
            We’ll develop it.
          </p>
          <p className="mt-6 max-w-[34rem] text-[0.9375rem] leading-relaxed text-ink/70">
            If it isn’t on the rack, we make it from scratch. A screenshot or one sentence from your kid is enough to start.
          </p>
        </div>
      </section>

      <section className="bg-paper pb-20 text-ink sm:pb-28">
        <div className="shell">
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
            {CHOOSE.map((c, i) => (
              <li key={c.title}>
                <Reveal
                  delay={i * 60}
                  className="h-full rounded-3xl bg-white p-6 ring-1 ring-rule sm:p-7"
                >
                  <h2 className="text-[1.0625rem] font-sans font-semibold">{c.title}</h2>
                  <p className="mt-2 text-[0.9375rem] leading-relaxed text-ink/70">{c.line}</p>
                </Reveal>
              </li>
            ))}
          </ul>

          <Reveal className="mt-14">
            <h2 className="text-[0.9375rem] font-semibold text-ink/70 [font-family:var(--font-sans)]">Pieces we make</h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {CAPABILITIES.garments.map((g) => (
                <li key={g} className="rounded-full bg-electric-lit px-3.5 py-1.5 text-[0.8125rem] text-ink">
                  {g}
                </li>
              ))}
            </ul>
            <h2 className="mt-8 text-[0.9375rem] font-semibold text-ink/70 [font-family:var(--font-sans)]">Ways to finish it</h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {CAPABILITIES.decoration.map((d) => (
                <li
                  key={d}
                  className="rounded-full bg-pop-lit px-3.5 py-1.5 text-[0.8125rem] text-ink"
                >
                  {d}
                </li>
              ))}
            </ul>
          </Reveal>

          <div className="mt-12">
            <Link href="/quote" className="btn-blue">
              Describe the piece <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
