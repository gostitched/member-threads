import Image from 'next/image';
import Link from 'next/link';
import type { CSSProperties } from 'react';
import hoodies from '../../public/hero/hoodies.png';
import { Arrow } from '@/components/SiteHeader';

/**
 * The hero: "YOUR PARTY. / YOUR COLLECTION." in chunky navy caps, one line of copy,
 * one navy pill and the promises, beside two staggered lookbook crops on a
 * baby-blue plate (stacked and centred below lg). Shares the header's container so
 * every edge lines up with the logo and the CTA. Server component.
 */

const d = (ms: number) => ({ animationDelay: `${ms}ms` }) as CSSProperties;

/**
 * The source photo is a 1398×478 panoramic strip, too wide and too small to fill
 * a column. So it is shown as two portrait 4:5 "lookbook" crops, one per hoodie,
 * each a 320×472 window (nearly the strip's full height) onto the strip (the baked-in tag stays out of frame and
 * is set in type instead). Each crop is a window: the image is scaled so the
 * window fills the tile, then shifted into place.
 */
const SRC = { w: 1398, h: 478 };
const CROP_W = 320;
const CROP_H = 472;
const crop = (x: number, y: number): CSSProperties => ({
  width: `${(SRC.w / CROP_W) * 100}%`,
  left: `${(-x / CROP_W) * 100}%`,
  top: `${(-y / CROP_H) * 100}%`,
});

const TILES = [
  {
    key: 'jack',
    style: crop(272, 3),
    alt: 'A baby-blue hoodie printed “Jack’s After Party” with a hand-drawn star.',
    wrap: '',
  },
  {
    key: 'lily',
    style: crop(820, 0),
    alt: 'A pink hoodie printed “the lily club” with a heart, beside a cream tee with two stars.',
    wrap: 'translate-y-[12%]',
  },
] as const;

export default function Hero() {
  return (
    <section aria-labelledby="hero-title" className="relative overflow-x-clip bg-paper text-ink">
      {/* Same container as the header, so the headline and photo line up with the logo and the CTA. */}
      <div className="mx-auto w-full max-w-[1536px] px-5 pt-8 sm:px-8 sm:pt-12 lg:px-14 lg:pt-0">
        {/* lg+: fills the first screen below the 92px header, content centred; capped so very tall screens don't drift apart. */}
        <div className="lg:relative lg:grid lg:min-h-[min(calc(100svh-92px),56rem)] lg:grid-cols-[minmax(0,1.12fr)_minmax(0,1fr)] lg:items-center lg:gap-10 lg:pb-16 lg:pt-8 xl:gap-14">
          <div>
            <h1
              id="hero-title"
              className="caps text-center text-[clamp(2.75rem,13vw,5.5rem)] leading-[0.86] tracking-[-0.04em] lg:text-left lg:text-[min(6.5vw,7.0625rem)]"
            >
              <span className="rise block whitespace-nowrap" style={d(40)}>
                YOUR PARTY.
              </span>
              {/* The soft note against the heavy caps, tucked up under the first line. */}
              <span className="rise mt-[0.06em] block whitespace-nowrap font-serif text-[0.9em] font-normal normal-case italic leading-[0.95] tracking-[-0.01em] text-uv" style={d(120)}>
                your collection.
              </span>
            </h1>

            <p
              className="rise mx-auto mt-5 max-w-[24rem] text-balance text-center font-sans text-[clamp(1.0625rem,1.45vw,1.5rem)] font-normal leading-[1.45] tracking-[-0.008em] text-ink/75 sm:mt-7 sm:max-w-[34rem] lg:mx-0 lg:mt-8 lg:max-w-[33rem] lg:text-left lg:[@media(min-height:820px)]:mt-12"
              style={d(220)}
            >
              Custom apparel for Bar &amp; Bat Mitzvahs, designed around you and made to wear long after the party.
            </p>

            <div className="rise relative z-10 mt-7 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 sm:mt-9 lg:mt-10 lg:justify-start lg:[@media(min-height:820px)]:mt-14" style={d(300)}>
              <Link href="/quote" className="btn-blue h-14 px-8 text-[1.0625rem] lg:h-16 lg:px-11 lg:text-[1.25rem]">
                Create Your Collection <Arrow className="ml-2 h-[18px] w-6" />
              </Link>
              <Link
                href="/catalog"
                className="-my-3 inline-block py-3 text-[1rem] font-medium underline decoration-ink/30 underline-offset-[6px] transition-colors hover:decoration-ink lg:text-[1.1875rem]"
              >
                Browse The Goods
              </Link>
            </div>

            {/* The promises: premium quality, unlimited customization, Jewish owned. */}
            <ul
              className="rise relative z-10 mx-auto mt-6 flex max-w-[24rem] flex-col items-center gap-y-2.5 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-x-5 lg:flex-col lg:items-start xl:flex-row xl:justify-start font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-ink/85 sm:max-w-none sm:gap-x-6 lg:text-[0.75rem] lg:mx-0 lg:mt-9 lg:[@media(min-height:820px)]:mt-12 lg:gap-x-7"
              style={d(360)}
            >
              {['Premium Quality', 'Unlimited Customization', 'Jewish Owned'].map((t) => (
                <li key={t} className="flex items-center gap-2 whitespace-nowrap">
                  <svg aria-hidden viewBox="0 0 16 16" className="h-[11px] w-[11px] shrink-0 text-uv"><path d="M3 8.5l3 3 7-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  {t}
                </li>
              ))}
            </ul>
          </div>

          {/* The product: two lookbook crops, staggered on a baby-blue plate. */}
          <div className="rise relative mx-auto mt-12 w-full max-w-[640px] lg:mx-0 pb-[9%] sm:mt-16 lg:mt-0 lg:max-w-none lg:pb-[7%]" style={d(380)}>
            <div aria-hidden className="absolute bottom-0 left-[14%] right-0 top-[16%] rounded-[18px] bg-electric sm:rounded-[22px] lg:left-[10%] lg:top-[18%]" />
            <div className="relative grid grid-cols-2 gap-3 pr-[4%] sm:gap-5 lg:pr-[5%]">
              {TILES.map((t) => (
                <div key={t.key} className={t.wrap}>
                  <div className="relative aspect-[40/59] overflow-hidden rounded-[16px] bg-cream shadow-[0_1px_0_rgba(14,26,71,0.04),0_18px_40px_-24px_rgba(14,26,71,0.35)] sm:rounded-[18px]">
                    <Image
                      src={hoodies}
                      alt={t.alt}
                      priority
                      quality={90}
                      sizes="1400px"
                      className="absolute h-auto max-w-none"
                      style={t.style}
                    />
                  </div>
                </div>
              ))}
            </div>
            <p className="absolute bottom-[3%] left-[2%] -rotate-[4deg] whitespace-nowrap rounded-[6px] bg-pop px-3.5 py-2 font-sans text-[0.875rem] font-medium leading-none text-ink shadow-[0_10px_24px_-14px_rgba(14,26,71,0.45)] sm:bottom-[4%] sm:px-4 sm:py-2.5 sm:text-[1rem]">
              Made to wear on repeat.
            </p>
          </div>

          {/* Scroll cue: lg+ and only when there's room under the content. */}
          <div aria-hidden className="rise absolute bottom-7 left-[calc(50%-0.5px)] hidden h-11 w-px overflow-hidden bg-ink/15 lg:[@media(min-height:760px)_and_(max-height:987px)]:block" style={d(700)}>
            <span className="scroll-cue block h-1/2 w-full bg-ink/60" />
          </div>
        </div>

        {/* Divider: sits just below the fold on lg+, so the first screen is the hero alone. */}
        <div className="mx-auto flex max-w-[1052px] items-center gap-4 pb-0 pt-16 sm:gap-6 lg:pt-8">
          <span aria-hidden className="h-px flex-1 bg-ink/70" />
          <span className="whitespace-nowrap font-sans text-[0.8125rem] font-medium uppercase tracking-[0.18em] text-ink sm:text-[0.9375rem]">
            Let’s make it yours
          </span>
          <span aria-hidden className="h-px flex-1 bg-ink/70" />
        </div>
      </div>
    </section>
  );
}
