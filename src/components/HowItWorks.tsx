import Link from 'next/link';
import Reveal from '@/components/Reveal';
import { Arrow } from '@/components/SiteHeader';

/**
 * How it works: an editorial list. The heading and CTA hold the left column
 * (sticky on desktop); four numbered steps run down the right, each a numeral,
 * a heavy title and one plain sentence. Anchor for the header's "How It Works"
 * link (/#how).
 */
// [CONFIRM] 04: approved pieces are saved per organization for reorders (matches FAQ 05).
const STEPS = [
  {
    n: '01',
    title: ['Tell us about', 'your group.'],
    body: 'Your logo, your colors, roughly how many people and when you need it. A brand guide or a few screenshots is plenty.',
  },
  {
    n: '02',
    title: ['Design it', 'with us.'],
    body: 'Pick styles from the catalog and your designer builds them into one collection: colors, fabric, artwork, embroidery and fit.',
  },
  {
    n: '03',
    title: ['Approve one', 'price.'],
    body: 'Review the proofs and a single quote for the whole collection. Customization is included, so the price you approve is the price you pay.',
  },
  {
    n: '04',
    title: ['We make it.', 'You wear it.'],
    body: 'We produce and deliver the collection. Every approved piece is saved to your organization, so next season starts where this one left off.',
  },
] as const;

export default function HowItWorks() {
  return (
    <section
      id="how"
      aria-labelledby="how-title"
      className="scroll-mt-20 bg-paper py-20 text-ink sm:scroll-mt-24 sm:py-28 lg:scroll-mt-28 lg:py-32"
    >
      <div className="mx-auto grid w-full max-w-[1536px] grid-cols-[minmax(0,1fr)] gap-12 px-5 sm:px-8 lg:grid-cols-12 lg:gap-10 lg:px-14">
        <Reveal className="lg:col-span-5">
          <div className="lg:sticky lg:top-36">
            <p className="label text-ink/60">How it works</p>
            <h2 id="how-title" className="caps mt-5 text-[clamp(2rem,4vw,3.75rem)] leading-[0.95] tracking-[-0.03em]">
              Four steps.
              <br />
              One collection.
            </h2>
            <p className="mt-6 max-w-[26rem] text-lead text-ink/75">
              From a logo and a rough idea to a finished collection, with one designer and one price the whole way.
            </p>
            <Link href="/quote" className="btn-blue mt-9 h-14 px-8 text-[1.0625rem]">
              Start a Collection <Arrow className="ml-2 h-[16px] w-[22px]" />
            </Link>
          </div>
        </Reveal>

        <ol className="border-t border-ink/15 lg:col-span-7">
          {STEPS.map((s, i) => (
            <li key={s.n} className="border-b border-ink/15">
              <Reveal
                delay={i * 80}
                className="grid grid-cols-[3rem_1fr] gap-x-4 gap-y-3 py-8 sm:grid-cols-[5rem_1fr_1.15fr] sm:items-baseline sm:gap-x-8 sm:py-10 lg:py-12"
              >
                <span aria-hidden className="caps text-[1.75rem] leading-none tracking-[-0.03em] text-uv sm:text-[2.25rem]">
                  {s.n}
                </span>
                <h3 className="caps text-[1.375rem] leading-[1.02] lg:text-[1.625rem]">
                  <span className="sr-only">Step {s.n}: </span>
                  {s.title[0]}
                  <br />
                  {s.title[1]}
                </h3>
                <p className="col-start-2 text-[1rem] leading-[1.6] text-ink/75 sm:col-start-auto">{s.body}</p>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
