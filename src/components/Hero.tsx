import Link from 'next/link';
import type { CSSProperties } from 'react';
import HeroStill from '@/components/home/HeroStill';
import { Arrow } from '@/components/SiteHeader';

/**
 * The hero: "Apparel your members actually want to wear" in heavy wide caps with
 * one script word, one line of copy, the pill and a quiet text link, then the
 * three promises. Beside it, a drawn still life of one sample collection (stacked
 * below lg). Shares the header's frame so every edge lines up with the logo and
 * the CTA. Server component.
 */

const d = (ms: number) => ({ animationDelay: `${ms}ms` }) as CSSProperties;

const PROMISES = ['From 36 pieces', 'Design included', 'No upcharges'] as const;

export default function Hero() {
  return (
    <section aria-labelledby="hero-title" className="relative overflow-x-clip bg-paper text-ink">
      <div className="mx-auto w-full max-w-[1536px] px-5 pt-10 sm:px-8 sm:pt-14 lg:px-14 lg:pt-0">
        {/* lg+: fills the first screen below the 92px header, capped so tall screens don't drift apart. */}
        <div className="lg:grid lg:min-h-[min(calc(100svh-92px),58rem)] lg:grid-cols-[minmax(0,1.08fr)_minmax(0,1fr)] lg:items-center lg:gap-14 lg:py-12 xl:gap-20">
          <div className="text-center lg:text-left">
            <p className="rise label text-ink/60" style={d(0)}>
              Custom apparel collections for organizations
            </p>

            <h1
              id="hero-title"
              className="caps mt-5 text-[clamp(2.5rem,10.6vw,4.25rem)] leading-[0.98] lg:leading-[0.9] tracking-[-0.035em] sm:mt-6 lg:mt-7 lg:text-[min(4.2vw,5.25rem)]"
            >
              <span className="rise block lg:whitespace-nowrap" style={d(40)}>Apparel your</span>
              <span className="rise block lg:whitespace-nowrap" style={d(100)}>
                members{' '}
                {/* The one script word: a baseball-jersey hand against the heavy caps. */}
                <span className="relative top-[0.04em] font-serif text-[0.92em] font-normal normal-case tracking-[0] text-uv">
                  actually
                </span>
              </span>
              <span className="rise block lg:whitespace-nowrap" style={d(160)}>want to wear.</span>
            </h1>

            <p
              className="rise mx-auto mt-6 max-w-[30rem] text-balance text-lead text-ink/75 sm:mt-8 lg:mx-0 lg:max-w-[31rem] lg:text-[1.1875rem]"
              style={d(240)}
            >
              Retail-quality collections for clubs, companies, teams and causes. Start from our catalog, make every
              piece your own, and get one clear price.
            </p>

            <div
              className="rise mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 sm:mt-10 lg:justify-start"
              style={d(320)}
            >
              <Link href="/quote" className="btn-blue h-14 px-8 text-[1.0625rem] lg:h-[3.75rem] lg:px-10">
                Start a Collection <Arrow className="ml-2 h-[16px] w-[22px]" />
              </Link>
              <Link
                href="/catalog"
                className="-my-3 inline-block py-3 text-[1rem] font-medium underline decoration-ink/25 underline-offset-[7px] transition-colors hover:decoration-ink"
              >
                Browse the Catalog
              </Link>
            </div>

            <ul
              className="rise mx-auto mt-10 flex max-w-[30rem] flex-wrap items-center justify-center gap-x-5 gap-y-2 border-t border-ink/15 pt-5 sm:gap-x-4 lg:mx-0 lg:mt-14 lg:justify-start"
              style={d(380)}
            >
              {PROMISES.map((t, i) => (
                <li key={t} className="label flex items-center whitespace-nowrap text-ink/80">
                  {i > 0 && <span aria-hidden className="mr-4 hidden h-1 w-1 rounded-full bg-beige sm:block" />}
                  {t}
                </li>
              ))}
            </ul>
          </div>

          {/* One sample collection, laid flat. */}
          <figure className="rise mx-auto mt-12 w-full max-w-[600px] sm:mt-16 lg:mt-0 lg:max-w-[640px] lg:justify-self-end" style={d(300)}>
            <div className="overflow-hidden rounded-[20px] bg-cream">
              <HeroStill className="mx-auto" />
            </div>
            <figcaption className="mt-4 flex items-baseline justify-between gap-4 text-ink/60">
              <span className="label">Sample collection · Harbor Run Club</span>
              <span className="label hidden sm:inline">Hoodie / Crewneck / Cap</span>
            </figcaption>
          </figure>
        </div>

        {/* Divider into the chapter: just below the fold on lg+. */}
        <div className="flex items-center gap-4 pt-20 sm:gap-6 sm:pt-24 lg:pt-6">
          <span aria-hidden className="h-px flex-1 bg-ink/20" />
          <span className="label whitespace-nowrap text-ink">Made to your standard</span>
          <span aria-hidden className="h-px flex-1 bg-ink/20" />
        </div>
      </div>
    </section>
  );
}
