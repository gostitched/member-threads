import Link from 'next/link';
import Reveal from '@/components/Reveal';
import { Arrow } from '@/components/SiteHeader';

/**
 * How it works: an editorial list. The heading and CTA hold the left column
 * (sticky on desktop); four numbered steps run down the right, each a raspberry
 * numeral, a heavy title and one plain sentence. Anchor for the header's
 * "How It Works" link (/#how).
 */
const STEPS = [
  {
    n: '01',
    title: ['Tell us your', 'vision.'],
    body: 'Share your event date, estimated quantity, and any themes or inspiration. A rough idea is plenty.',
  },
  {
    n: '02',
    title: ['Design it', 'with us.'],
    body: 'Our free design team brings your collection to life, working with you on colors, artwork, and custom details.',
  },
  {
    n: '03',
    title: ['Make it', 'official.'],
    body: 'Review your designs and quote, then confirm your sizes and quantities. All customization is included in your price.',
  },
  {
    n: '04',
    title: ['We make it.', 'You celebrate.'],
    body: 'We cut, sew, and customize your apparel, then deliver your collection for the big event.',
  },
] as const;

export default function HowItWorks() {
  return (
    <section
      id="how"
      aria-labelledby="how-title"
      className="scroll-mt-20 bg-paper py-20 text-ink sm:scroll-mt-24 sm:py-28 lg:scroll-mt-28"
    >
      <div className="shell grid gap-12 lg:grid-cols-12 lg:gap-10">
        <Reveal className="lg:col-span-5">
          <div className="lg:sticky lg:top-40">
            <h2 id="how-title" className="caps relative inline-block text-[clamp(3rem,7vw,6.25rem)] leading-[0.9]">
              How it
              <br />
              <span className="whitespace-nowrap">WOrks.</span>
            </h2>
            <p className="mt-5 font-sans text-[clamp(1.125rem,1.6vw,1.375rem)] font-medium text-ink">
              From your first idea to the big event.
            </p>
            <Link href="/quote" className="btn-blue mt-7 h-14 px-8 text-[1.0625rem]">
              Start Your Collection <Arrow className="ml-2 h-[18px] w-6" />
            </Link>
          </div>
        </Reveal>

        <ol className="border-t border-electric lg:col-span-7">
          {STEPS.map((s, i) => (
            <li key={s.n} className="border-b border-electric">
              <Reveal
                delay={i * 80}
                className="grid grid-cols-[auto_1fr] gap-x-5 gap-y-3 py-8 sm:grid-cols-[5.75rem_1.2fr_1fr] lg:grid-cols-[6rem_1.25fr_1fr] sm:items-center sm:gap-x-8 sm:py-10"
              >
                <span aria-hidden className="caps text-[clamp(3rem,5vw,4.5rem)] leading-none tracking-[-0.04em] text-uv">
                  {s.n}
                </span>
                <h3 className="font-display text-[clamp(1.5rem,2.2vw,2rem)] font-black leading-[0.98] tracking-[-0.025em]">
                  <span className="sr-only">Step {s.n}: </span>
                  {s.title[0]}
                  <br />
                  {s.title[1]}
                </h3>
                <p className="col-span-2 text-[1.0625rem] leading-[1.5] text-ink/85 sm:col-span-1">{s.body}</p>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
