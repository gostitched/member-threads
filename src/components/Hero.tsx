import Image from 'next/image';
import Link from 'next/link';
import type { CSSProperties } from 'react';
import RosterLabel from '@/components/home/RosterLabel';
import { Arrow } from '@/components/SiteHeader';
import { PHOTOS } from '@/lib/photos';
import '@/components/home/home.css';

/**
 * The hero. The page's one display headline, in the serif with one italic
 * word, a lead, one primary and a quiet link, then the three promises joined
 * by a running stitch. Beside it a tall photograph bleeds off the right edge
 * with the roster label sewn across its corner (it takes the organization's
 * name once someone types it in the chapter).
 *
 * Phone: headline, lead and CTA in the first screen; the photo full-bleed
 * under them, the label straddling its top edge, the promises as a three-
 * column spec table beneath. Server component (the label is a client island).
 */

const d = (ms: number) => ({ '--d': `${ms}ms` }) as CSSProperties;

const PROMISES = ['From 36 pieces', 'Design included', 'No upcharges'] as const;

const photo = PHOTOS['hero-field-trio-portrait'];

export default function Hero() {
  return (
    <section aria-labelledby="hero-title" className="hero relative overflow-x-clip bg-paper text-ink">
      <div className="shell">
        <div className="hero-grid grid-12 content-start pt-8 sm:pt-12 lg:pt-12">
          {/* The words: cols 1–8, the last one crosses into the photo. */}
          <div className="col-span-4 flex flex-col sm:col-span-8 lg:col-start-1 lg:col-end-9 lg:row-start-1">
            <p className="enter t-eyebrow fg-muted" style={d(0)}>
              Custom collections for organizations
            </p>

            <h1 id="hero-title" className="hero-title t-display mt-5 lg:mt-8">
              <span className="enter block" style={d(80)}>
                Apparel your
              </span>
              <span className="enter block" style={d(160)}>
                members <em>actually</em>
              </span>
              <span className="enter block" style={d(240)}>
                want to wear.
              </span>
            </h1>

            <p className="enter t-lead mt-6 max-w-[34ch] sm:mt-8" style={d(320)}>
              Retail-quality collections for clubs, companies, teams and causes. Start from our catalog, make every
              piece your own, and get one clear price.
            </p>

            <div className="enter mt-8 flex flex-wrap items-center gap-x-8 gap-y-2 sm:mt-10" style={d(400)}>
              <Link href="/quote" className="btn-blue w-full sm:w-auto">
                Start a collection <Arrow className="h-[14px] w-[19px]" />
              </Link>
              <Link href="/catalog" className="link-arrow text-[15px] font-medium">
                <span className="link-u">Browse the catalog</span>
                <Arrow className="h-[12px] w-[16px]" />
              </Link>
            </div>
          </div>

          {/* The photograph: 4:5 full-bleed on a phone, 2:3 bleeding right on desktop. */}
          <figure className="relative col-span-4 mt-14 sm:col-span-8 sm:mt-16 lg:col-start-9 lg:col-end-13 lg:row-span-2 lg:row-start-1 lg:mt-0">
            <div className="hero-bleed relative">
              <div className="hero-photo photo grade grain aspect-[4/5] lg:aspect-[2/3]">
                <Image
                  src={photo.src}
                  width={photo.width}
                  height={photo.height}
                  alt={photo.alt}
                  priority
                  sizes="(min-width: 1536px) 36vw, (min-width: 1024px) 38vw, 100vw"
                  style={{ objectPosition: photo.objectPosition }}
                />
              </div>
              <RosterLabel className="enter hero-label" />
            </div>
            <figcaption className="caption">Fleece hoodies and sweats in heather, mint and slate</figcaption>
          </figure>

          {/* The promises. */}
          <ul
            aria-label="Every collection"
            className="enter hero-proof hairline col-span-4 mt-10 t-spec sm:col-span-8 lg:col-start-1 lg:col-end-8 lg:row-start-2 lg:mt-14 lg:self-end"
            style={d(480)}
          >
            {PROMISES.map((t) => (
              <li key={t}>
                <span aria-hidden className="stitch-rule" />
                {t}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
