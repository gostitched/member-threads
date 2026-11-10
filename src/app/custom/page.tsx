import type { Metadata } from 'next';
import Link from 'next/link';
import Reveal from '@/components/Reveal';
import { Arrow } from '@/components/SiteHeader';
import { CAPABILITIES } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Fully Custom',
  description:
    'When the piece isn’t in the catalog, we develop it from scratch for your organization: fabric, fit, construction, trims and labels.',
};

/**
 * What you decide on a fully custom piece.
 * [CONFIRM] the fabric, fit, construction and trim examples; whether fully custom
 * pieces carry the same 36-piece minimum (README "Before launch").
 */
const CHOOSE = [
  { title: 'Fabric', line: 'Heavyweight fleece, loopback terry, piqué, waffle knit, nylon shell.' },
  { title: 'Fit', line: 'Boxy, relaxed, classic or cropped, cut for the people who will wear it.' },
  { title: 'Construction', line: 'Contrast rib, raglan sleeves, side panels, quarter- or full-zip.' },
  { title: 'Trims & labels', line: 'A woven neck label with your crest, custom zipper pulls, hang tags.' },
] as const;

/**
 * Paper: the title and one line, four cream plates, then what we make and how we
 * finish it as quiet outlined tags. One button.
 */
export default function CustomPage() {
  return (
    <>
      <section className="bg-paper text-ink">
        <div className="shell pb-16 pt-12 sm:pb-24 sm:pt-16">
          <h1 className="t-display">
            <span className="enter block" style={{ ['--d' as string]: '60ms' }}>
              Describe the <em>piece.</em>
            </span>
          </h1>
          <p className="enter t-h2 mt-4" style={{ ['--d' as string]: '180ms' }}>
            We’ll develop it.
          </p>
          <p className="t-body mt-6 max-w-[40rem] text-ink/90">
            If it isn’t in the catalog, we develop it from scratch. A photo or one sentence is enough to start.
          </p>
        </div>
      </section>

      <section className="bg-paper pb-20 text-ink sm:pb-28">
        <div className="shell">
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
            {CHOOSE.map((c, i) => (
              <li key={c.title}>
                <Reveal delay={i * 60} className="h-full bg-cream p-6 sm:p-7">
                  <h2 className="t-h3">{c.title}</h2>
                  <p className="t-body mt-2 text-ink/90">{c.line}</p>
                </Reveal>
              </li>
            ))}
          </ul>

          <Reveal className="mt-14">
            <h2 className="font-sans text-[0.9375rem] font-semibold tracking-normal">Pieces we make</h2>
            <ul className="mt-4 flex flex-wrap gap-2">
              {CAPABILITIES.garments.map((g) => (
                <li key={g} className="tag">
                  {g}
                </li>
              ))}
            </ul>
            <h2 className="mt-10 font-sans text-[0.9375rem] font-semibold tracking-normal">Ways to finish it</h2>
            <ul className="mt-4 flex flex-wrap gap-2">
              {CAPABILITIES.decoration.map((d) => (
                <li key={d} className="tag">
                  {d}
                </li>
              ))}
            </ul>
          </Reveal>

          <div className="mt-12">
            <Link href="/quote" className="btn-blue">
              Describe the piece <Arrow className="h-[14px] w-[19px]" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
