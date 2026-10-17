import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import './catalog.css';
import CatalogExplorer from '@/components/catalog/CatalogExplorer';
import { getCatalog } from '@/lib/catalog/api';
import { parseExplorerState } from '@/lib/catalog/explorer-state';
import { PHOTOS } from '@/lib/photos';

export const metadata: Metadata = {
  title: 'Catalog',
  description:
    'The Member Threads catalog: heavyweight hoodies, quarter-zips, polos, rugbys, outerwear and hats for clubs, companies, nonprofits and teams. Customized to your organization from 36 pieces per style, design included.',
};

/** Matches site.ts: the minimum, what's included, the lead time. */
const FACTS: Array<[string, string]> = [
  ['Minimum', '36 per style'],
  ['Design', 'Included'],
  ['Lead time', '6–8 weeks'],
];

/** What an organization changes on an established style. Kept to what the site already says. */
const CHANGES: Array<[string, string]> = [
  // [CONFIRM] custom (off-catalog) colors are offered on every style.
  ['Color', 'Body, trims and thread, from the colorways on the style or your own.'],
  ['Fabric', 'Weight and hand, chosen with your designer.'],
  ['Fit', 'Cut and length, within the established pattern.'],
  ['Graphics', 'Your marks, drawn up by your designer. Design is included.'],
  ['Embroidery', 'Satin stitch, chenille, woven patches and labels.'],
];

/** "MT-01 – MT-14", from the style numbers on file. */
function styleRange(products: Array<{ styleNumber: string | null }>): string {
  const nos = products.map((p) => p.styleNumber).filter((n): n is string => Boolean(n)).sort();
  return nos.length > 1 ? `${nos[0]} – ${nos[nos.length - 1]}` : nos[0] ?? '';
}

/** The next number on the roster: the style that isn't on the rack yet. */
function nextStyle(products: Array<{ styleNumber: string | null }>): string {
  const n = Math.max(0, ...products.map((p) => Number(/(\d+)$/.exec(p.styleNumber ?? '')?.[1] ?? 0)));
  return `MT-${String(n + 1).padStart(2, '0')}`;
}

function Arrow() {
  return (
    <svg width="18" height="12" viewBox="0 0 18 12" fill="none" aria-hidden>
      <path d="M0 6h16M11 1l5 5-5 5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [catalog, params] = await Promise.all([getCatalog(), searchParams]);
  const { products } = catalog;
  const initial = parseExplorerState(params);
  const range = styleRange(products);
  const cloth = PHOTOS['detail-fabric-rolls'];

  return (
    <div className="ct-scope">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="shell pb-12 pt-10 sm:pb-16 sm:pt-14 lg:pt-16">
        <div className="hairline-b flex items-center justify-between gap-4 pb-4">
          <p className="t-spec fg-muted enter">
            {products.length > 0 ? `Catalog · ${products.length} styles` : 'Catalog'}
          </p>
          {range && <span className="woven enter" style={{ ['--d' as string]: '80ms' }}>Roster {range}</span>}
        </div>

        <div className="grid-12 mt-10 gap-y-8 sm:mt-14 lg:mt-16 lg:items-end">
          <h1 className="t-display col-span-4 sm:col-span-8 lg:col-span-7">
            <span className="enter block" style={{ ['--d' as string]: '80ms' }}>
              The <em>catalog</em>.
            </span>
          </h1>
          <p
            className="t-lead enter col-span-4 max-w-measure sm:col-span-6 lg:col-span-4 lg:col-start-9 lg:pb-[0.35em]"
            style={{ ['--d' as string]: '240ms' }}
          >
            Established styles, chosen for how they wear. Start from one, then change the color, fabric, fit and
            finish until it belongs to your organization.
          </p>
        </div>

        <dl className="ct-facts mt-12 grid grid-cols-3 border-y border-[var(--rule-c)] sm:mt-16">
          {FACTS.map(([k, v], i) => (
            <div key={k} className={`py-5 sm:py-6 ${i === 0 ? 'pr-3 sm:pr-6' : 'px-3 sm:px-6'}`}>
              <dt className="t-eyebrow fg-muted">{k}</dt>
              <dd className="t-h3 mt-3">{v}</dd>
            </div>
          ))}
        </dl>
      </header>

      {products.length > 0 ? (
        <CatalogExplorer products={products} initial={initial} />
      ) : (
        <section className="shell sec-sm">
          <div className="flex flex-col items-start gap-6 border-y border-[var(--rule-c)] py-14 sm:py-20">
            <h2 className="t-h1">
              {catalog.source === 'unavailable' ? (
                <>
                  The catalog is <em>offline</em>.
                </>
              ) : (
                <>
                  New styles are <em>on the way</em>.
                </>
              )}
            </h2>
            <p className="t-lead max-w-measure">
              {catalog.source === 'unavailable'
                ? "The catalog isn't loading right now. Tell us what your organization needs and we'll build it with you."
                : "We're adding styles now. Tell us what your organization needs and we'll build it with you."}
            </p>
            <Link href="/quote" className="btn-blue mt-4">
              Start a collection <Arrow />
            </Link>
          </div>
        </section>
      )}

      {/* ── The way out for anything that isn't in the catalog ─────────────── */}
      <section className="sec overflow-x-clip" aria-labelledby="ct-beyond">
        <div className="shell grid-12 items-center gap-y-14">
          <div className="col-span-4 sm:col-span-8 lg:col-span-6">
            <p className="t-eyebrow fg-muted">Beyond the catalog</p>
            <h2 id="ct-beyond" className="t-h1 mt-5 max-w-[13ch]">
              Need a style that <em>isn&rsquo;t</em> here?
            </h2>
            <p className="t-lead mt-7 max-w-[44ch]">
              Most collections start from these styles, not all of them. Tell us what you have in mind and your
              designer will source it.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
              <Link href="/quote" className="btn-blue">
                Start a collection <Arrow />
              </Link>
              <Link href="/custom" className="link-arrow t-small font-semibold">
                <span className="link-u">How customization works</span> <Arrow />
              </Link>
            </div>
          </div>

          {/* The next number on the roster, unissued: a blank hang tag on its string. */}
          <div className="col-span-4 flex justify-center sm:col-span-8 lg:col-span-5 lg:col-start-8" aria-hidden>
            <div className="ct-hang flex flex-col items-center">
              <svg width="2" height="96" viewBox="0 0 2 96" className="relative z-[1] -mb-[24px] block text-ink/55">
                <path d="M1 0v96" stroke="currentColor" strokeWidth="1.5" />
              </svg>
              <div className="ct-hangtag">
                <div className="flex items-baseline justify-between">
                  <span className="t-spec fg-muted">Style</span>
                  <span className="t-spec fg-muted">Unissued</span>
                </div>
                <p className="t-block mt-3 text-[3.25rem]">{nextStyle(products)}</p>
                <hr className="stitch-rule mt-5" />
                <p className="t-script mt-6 text-[2.5rem] text-dusty">Yours next</p>
                <dl className="t-spec mt-7 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2">
                  <dt className="fg-muted">Sourced by</dt>
                  <dd className="text-right">Your designer</dd>
                  <dt className="fg-muted">Minimum</dt>
                  <dd className="text-right">36 pieces</dd>
                  <dt className="fg-muted">Design</dt>
                  <dd className="text-right">Included</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* ── How a style becomes yours ──────────────────────────────────────── */}
      <section className="band-cream sec overflow-x-clip" aria-labelledby="ct-change">
        <div className="shell grid-12 gap-y-12">
          <figure className="col-span-4 sm:col-span-6 lg:col-span-5">
            <div className="ct-bleed-l">
              <div className="photo grade grain wipe-in aspect-[4/5]">
                <Image
                  src={cloth.src}
                  alt={cloth.alt}
                  width={cloth.width}
                  height={cloth.height}
                  sizes="(min-width: 1536px) 680px, (min-width: 1024px) 45vw, (min-width: 640px) 75vw, 100vw"
                  style={{ objectPosition: cloth.objectPosition }}
                />
              </div>
            </div>
            <figcaption className="caption">Reference · Cotton on the roll, before it is a collection</figcaption>
          </figure>

          <div className="col-span-4 sm:col-span-8 lg:col-span-6 lg:col-start-7 lg:pt-6">
            <p className="t-eyebrow fg-muted">Every style is a starting point</p>
            <h2 id="ct-change" className="t-h1 mt-5 max-w-[14ch]">
              Start from the style. <em>Change</em> the rest.
            </h2>
            <p className="t-lead mt-7 max-w-measure">
              Each piece is an established pattern with a known fit and fabric. Your designer takes it from there.
            </p>
            <ol className="mt-12 border-t border-[var(--rule-c)]">
              {CHANGES.map(([k, v], i) => (
                <li
                  key={k}
                  className="grid grid-cols-[2.5rem_minmax(0,1fr)] items-baseline gap-x-4 border-b border-[var(--rule-c)] py-5 sm:grid-cols-[3rem_9rem_minmax(0,1fr)]"
                >
                  <span className="t-spec fg-muted">{String(i + 1).padStart(2, '0')}</span>
                  <span className="t-h3">{k}</span>
                  <span className="t-body col-start-2 mt-1 text-ink/85 sm:col-start-3 sm:mt-0">{v}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

    </div>
  );
}
