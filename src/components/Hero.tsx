import Image from 'next/image';
import Link from 'next/link';
import type { CSSProperties } from 'react';
import RosterLabel from '@/components/home/RosterLabel';
import { Arrow } from '@/components/SiteHeader';
import { PHOTOS } from '@/lib/photos';

/**
 * The hero: the page's one display headline in the serif, "actually" in italic,
 * one line of copy, the primary and a quiet link, then the three promises. Beside it two staggered portrait photographs on a square
 * beige plate (stacked and centred below lg), with the woven label ("Made for …") across
 * the plate's corner (it takes the organization's name once someone types it in
 * the chapter). Shares the header's container so every edge lines up with the
 * logo and the button. Server component (the label is a client island).
 */

const d = (ms: number) => ({ '--d': `${ms}ms` }) as CSSProperties;

const PROMISES = ['Premium Quality', 'Unlimited Customization', 'No Upcharges'] as const;

const TILES = [
  { photo: PHOTOS['hero-field-trio-portrait'], wrap: '' },
  { photo: PHOTOS['segment-athletic-run-club'], wrap: 'translate-y-[12%]' },
] as const;

export default function Hero() {
  return (
    <section aria-labelledby="hero-title" className="relative overflow-x-clip bg-paper text-ink">
      <div className="mx-auto w-full max-w-[1536px] px-5 pt-8 sm:px-8 sm:pt-12 lg:px-14 lg:pt-0">
        {/* lg+: fills the first screen below the 92px header, content centred; capped so very tall screens don't drift apart. */}
        <div className="lg:relative lg:grid lg:min-h-[min(calc(100svh-92px),56rem)] lg:grid-cols-[minmax(0,1.12fr)_minmax(0,1fr)] lg:items-center lg:gap-16 lg:pb-16 lg:pt-8 xl:gap-24">
          <div>
            <h1
              id="hero-title"
              className="t-display text-center text-[clamp(2.5rem,10.5vw,4.5rem)] lg:text-left lg:text-[min(4.2vw,5.25rem)]"
            >
              <span className="enter block lg:whitespace-nowrap" style={d(40)}>
                Apparel your members
              </span>
              <span className="enter block lg:whitespace-nowrap" style={d(120)}>
                <em>actually</em> want to wear.
              </span>
            </h1>

            <p
              className="enter t-lead mx-auto mt-6 max-w-[24rem] text-balance text-center sm:mt-8 sm:max-w-[34rem] lg:mx-0 lg:max-w-[33rem] lg:text-left lg:[@media(min-height:820px)]:mt-10"
              style={d(220)}
            >
              Made like the brands they already buy, with your name on it.
            </p>

            <div
              className="enter relative z-10 mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 sm:mt-10 lg:justify-start lg:[@media(min-height:820px)]:mt-12"
              style={d(300)}
            >
              <Link href="/quote" className="btn-blue">
                Start a collection <Arrow className="h-[14px] w-[19px]" />
              </Link>
              <Link href="/catalog" className="link-arrow">
                <span className="link-u">Browse the catalog</span>
                <Arrow className="h-[12px] w-[16px]" />
              </Link>
            </div>

            {/* The promises. */}
            <ul
              aria-label="Every collection"
              className="enter t-uniform fg-muted relative z-10 mt-8 flex flex-col items-center gap-y-2 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-x-3 lg:mt-10 lg:justify-start lg:[@media(min-height:820px)]:mt-12"
              style={d(360)}
            >
              {PROMISES.map((t, i) => (
                <li key={t} className="flex items-center gap-3 whitespace-nowrap">
                  {i > 0 && <span aria-hidden className="hidden sm:inline">·</span>}
                  {t}
                </li>
              ))}
            </ul>
          </div>

          {/* Two portraits, staggered on a square beige plate. */}
          <div className="enter relative mx-auto mt-12 w-full max-w-[640px] pb-[9%] sm:mt-16 lg:mx-0 lg:mt-0 lg:max-w-none lg:pb-[7%]" style={d(380)}>
            <div aria-hidden className="absolute bottom-0 left-[14%] right-0 top-[16%] bg-beige lg:left-[10%] lg:top-[18%]" />
            <div className="relative grid grid-cols-2 gap-3 pr-[4%] sm:gap-5 lg:pr-[5%]">
              {TILES.map(({ photo, wrap }) => (
                <div key={photo.src} className={wrap}>
                  <div className="photo grade grain relative aspect-[40/59]">
                    <Image
                      src={photo.src}
                      width={photo.width}
                      height={photo.height}
                      alt={photo.alt}
                      priority
                      sizes="(min-width: 1536px) 22vw, (min-width: 1024px) 24vw, 46vw"
                      style={{ objectPosition: photo.objectPosition }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <RosterLabel className="absolute bottom-[3%] left-[2%] max-w-[min(92%,24rem)] sm:bottom-[4%]" />
          </div>

        </div>

        {/* Divider: sits just below the fold on lg+, so the first screen is the hero alone. */}
        <div className="mx-auto flex max-w-[1052px] items-center gap-4 pb-0 pt-16 sm:gap-6 lg:pt-8">
          <span aria-hidden className="h-px flex-1 bg-ink/40" />
          <span className="t-eyebrow whitespace-nowrap text-ink">Try it on the signature hoodie</span>
          <span aria-hidden className="h-px flex-1 bg-ink/40" />
        </div>
      </div>
    </section>
  );
}
