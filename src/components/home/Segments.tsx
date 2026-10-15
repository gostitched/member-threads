import Link from 'next/link';
import { Arrow } from '@/components/SiteHeader';
import { SEGMENTS } from '@/lib/site';

/**
 * Who we make it for: the page's one full-bleed dusty-blue band, cream type.
 * Five audiences as an editorial index: numeral, name, one line on what they
 * order it for, and the pieces they typically order. Server component.
 */
export default function Segments() {
  return (
    <section aria-labelledby="segments-title" className="bg-dusty py-20 text-cream sm:py-28 lg:py-32">
      <div className="mx-auto w-full max-w-[1536px] px-5 sm:px-8 lg:px-14">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-10">
          <div className="lg:col-span-7">
            <p className="label text-beige">Who we make it for</p>
            <h2 id="segments-title" className="caps mt-5 text-[clamp(2rem,4vw,3.75rem)] leading-[0.95] tracking-[-0.03em]">
              Built for every kind of{' '}
              <span className="font-serif text-[1.08em] font-normal normal-case tracking-[0] text-beige">membership.</span>
            </h2>
          </div>
          <p className="max-w-[34rem] text-lead text-cream/70 lg:col-span-5 lg:pb-1">
            If a group of people wears it together, it belongs in a collection. These are the organizations we make
            for most, and what they tend to order.
          </p>
        </div>

        <ol className="mt-14 border-t border-cream/15 sm:mt-16">
          {SEGMENTS.map((s, i) => (
            <li
              key={s.id}
              className="grid grid-cols-[2.5rem_1fr] gap-x-4 gap-y-4 border-b border-cream/15 py-8 sm:grid-cols-[4rem_1fr] sm:gap-x-6 sm:py-10 lg:grid-cols-[4rem_minmax(0,3.2fr)_minmax(0,4fr)_minmax(0,4fr)] lg:items-baseline lg:gap-x-10"
            >
              <span aria-hidden className="label pt-1 text-beige lg:pt-0">
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3 className="caps text-[1.375rem] leading-[1.02] lg:text-[1.625rem]">{s.label}</h3>
              <p className="col-start-2 max-w-[38ch] text-[1rem] leading-[1.6] text-cream/70 lg:col-start-auto">
                <span className="sr-only">{s.title}. </span>
                {s.body}
              </p>
              <ul aria-label="Typical pieces" className="col-start-2 flex flex-wrap gap-2 lg:col-start-auto">
                {s.pieces.map((p) => (
                  <li
                    key={p}
                    className="rounded-full px-3 py-1.5 text-[0.75rem] font-medium leading-none tracking-[0.01em] text-cream/85 ring-1 ring-inset ring-cream/25"
                  >
                    {p}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>

        <div className="mt-12 flex flex-col items-start gap-6 sm:mt-14 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-[36rem] text-[1rem] leading-[1.6] text-cream/70">
            Don’t see yours? If you have 36 people who would wear it, we can make it.
          </p>
          <Link href="/quote" className="btn h-14 bg-cream px-8 text-[1.0625rem] text-ink hover:bg-paper">
            Start a Collection <Arrow className="ml-2 h-[16px] w-[22px]" />
          </Link>
        </div>
      </div>
    </section>
  );
}
