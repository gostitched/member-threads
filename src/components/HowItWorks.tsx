import Link from 'next/link';
import Arrival from '@/components/Arrival';
import Reveal from '@/components/Reveal';
import { Arrow } from '@/components/SiteHeader';

/**
 * How it works: an editorial list. The heading and the primary hold the left
 * column (sticky on desktop); four numbered steps run down the right, each a
 * block numeral, a two-line serif title and one plain sentence, joined by a
 * running stitch. Anchor for the header's "How it works" link (/#how); arriving
 * there from another page lands on it and plays its entrance (`Arrival`).
 */
// [CONFIRM] 04: approved pieces are saved per organization for reorders (matches FAQ 05).
const STEPS = [
  {
    n: '01',
    title: ['Tell us about', 'your group.'],
    body: 'Your logo, your colors, how many people and when you need it. A few screenshots is plenty.',
  },
  {
    n: '02',
    title: ['Design it', 'with us.'],
    body: 'Pick styles from the catalog. Your designer builds them into one collection.',
  },
  {
    n: '03',
    title: ['Approve', 'one price.'],
    body: 'Review the proofs and one quote for everything. The price you approve is the price you pay.',
  },
  {
    n: '04',
    title: ['We make it.', 'You wear it.'],
    body: 'We make and deliver it. Every piece is saved on file for reorders.',
  },
] as const;

export default function HowItWorks() {
  // The negative scroll margin cancels most of the section's top padding (the page's
  // scroll-padding already clears the header), so the anchor lands on the heading.
  return (
    <section id="how" aria-labelledby="how-title" className="scroll-mt-[-56px] bg-paper py-20 text-ink sm:scroll-mt-[-84px] sm:py-28">
      <Arrival id="how" />
      <div className="shell grid gap-12 lg:grid-cols-12 lg:gap-10">
        <Reveal className="lg:col-span-5">
          <div className="lg:sticky lg:top-40">
            <h2 id="how-title" className="arrive-rise t-h1 text-[clamp(2.5rem,4.8vw,4.75rem)]">
              How it <em>works.</em>
            </h2>
            <p className="arrive-fade t-lead mt-5 max-w-[30ch]">From a logo to a finished collection, with one designer.</p>
            <Link href="/quote" className="arrive-fade btn-blue mt-8">
              Start a collection <Arrow className="h-[14px] w-[19px]" />
            </Link>
          </div>
        </Reveal>

        <ol className="lg:col-span-7">
          {STEPS.map((s, i) => (
            <li key={s.n} className="arrive-step" style={{ '--i': i } as React.CSSProperties}>
              {i === 0 && <span aria-hidden className="stitch-rule arrive-sew" />}
              <Reveal
                delay={i * 80}
                className="grid grid-cols-[auto_1fr] gap-x-5 gap-y-3 py-8 sm:grid-cols-[5.75rem_1.2fr_1fr] sm:items-center sm:gap-x-8 sm:py-10 lg:grid-cols-[6rem_1.25fr_1fr]"
              >
                <span aria-hidden className="t-block text-[clamp(2.75rem,4.6vw,4rem)] text-beige-deep">
                  {s.n}
                </span>
                <h3 className="t-h3">
                  <span className="sr-only">Step {s.n}: </span>
                  {s.title[0]}
                  <br />
                  {s.title[1]}
                </h3>
                <p className="t-body col-span-2 text-ink/90 sm:col-span-1">{s.body}</p>
              </Reveal>
              <span aria-hidden className="stitch-rule arrive-sew" />
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
