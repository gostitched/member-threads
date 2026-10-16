import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import '../catalog.css';
import LeadTimeline from '@/components/catalog/LeadTimeline';
import ProductCard from '@/components/catalog/ProductCard';
import ProductView from '@/components/catalog/ProductView';
import SizeChart from '@/components/catalog/SizeChart';
import { getCatalog, getProduct } from '@/lib/catalog/api';
import type { CatalogProduct } from '@/lib/catalog/types';
import { referenceFor } from '@/lib/catalog/reference';
import { leadTimeLabel } from '@/lib/catalog/util';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const found = await getProduct((await params).slug);
  if (!found) return {};
  const { product } = found;
  const image = product.images.find((i) => i.isPrimary) ?? product.images[0];
  return {
    // The first paragraph only: product descriptions run to two.
    description:
      product.description?.split(/\n\s*\n/)[0] ??
      `${product.name}, customized for your organization by Member Threads. From 36 pieces, design included.`,
    ...(image ? { openGraph: { images: [{ url: image.url }] } } : {}),
  };
}

/** 42–56 days reads as "6–8 weeks" when both ends are whole weeks. */
function weeksLabel(lt: { min: number; max: number }): string {
  if (lt.min % 7 || lt.max % 7) return lt.min === lt.max ? `${lt.min} days` : `${lt.min}–${lt.max} days`;
  return lt.min === lt.max ? `${lt.min / 7} weeks` : `${lt.min / 7}–${lt.max / 7} weeks`;
}

const SIZE_LADDER = ['2XS', 'XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL', '6XL'];

/** One run of sizes: unbroken, it collapses to its ends ("S–2XL"); otherwise it is listed. */
function runLabel(codes: string[]): string {
  const at = codes.map((c) => SIZE_LADDER.indexOf(c));
  const unbroken = codes.length > 2 && at.every((n, i) => n >= 0 && (i === 0 || n === at[i - 1] + 1));
  return unbroken ? `${codes[0]}–${codes[codes.length - 1]}` : codes.join(', ');
}

/**
 * Sizes as one run ("XS–3XL"). Youth sizes, if a style ever carries them, are coded
 * with a leading Y and shown as their own run. Bigger sizes cost the same, so no
 * upcharges are shown.
 */
function sizesLabel(p: CatalogProduct): string | null {
  if (p.sizeMode === 'one_size') return 'One size';
  if (p.sizes.length === 0) return null;
  const codes = p.sizes.map((s) => s.code.toUpperCase().replace(/^XXS$/, '2XS').replace(/^XXL$/, '2XL'));
  const youth = codes.filter((c) => /^Y./.test(c)).map((c) => c.slice(1));
  const adult = codes.filter((c) => !/^Y./.test(c));
  if (youth.length === 0) return runLabel(adult);
  return [`Youth ${runLabel(youth)}`, adult.length ? `Adult ${runLabel(adult)}` : null].filter(Boolean).join(' · ');
}

/** The facts a buyer compares; the rest is for the call. */
function specRows(p: CatalogProduct): Array<[string, string]> {
  const rows: Array<[string, string | null]> = [
    ['Sizes', sizesLabel(p)],
    ['Fabric', p.fabric],
    ['Weight', p.gsm ? `${p.gsm} gsm` : null],
    ['Fit', p.fit],
    ['Finishes', p.decorationMethods.length ? p.decorationMethods.join(', ') : null],
    ['Minimum', p.minimumOrderQuantity ? `${p.minimumOrderQuantity} pieces per style` : null],
    ['Lead time', p.leadTimeDays ? weeksLabel(p.leadTimeDays) : leadTimeLabel(p)],
    ['Care', p.careInstructions],
    ['Origin', p.countryOfOrigin],
  ];
  return rows.filter((r): r is [string, string] => Boolean(r[1]));
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const [found, catalog] = await Promise.all([getProduct(slug), getCatalog()]);
  if (!found) notFound();
  const { product } = found;

  const specs = specRows(product);
  const hasChart = Object.keys(product.sizeChart).length > 0;
  const more = (product.description ?? '').split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean).slice(1);
  const ref = referenceFor(product);
  const others = catalog.products.filter((p) => p.slug !== product.slug);
  const related = [
    ...others.filter((p) => p.category && p.category === product.category),
    ...others.filter((p) => !p.category || p.category !== product.category),
  ].slice(0, 3);

  return (
    <div className="ct-scope">
      <div className="shell pt-6 sm:pt-10">
        <nav aria-label="Breadcrumb" className="mb-4 sm:mb-8">
          <ol className="t-spec flex flex-wrap items-center gap-x-2.5">
            <li>
              <Link href="/catalog" className="fg-muted inline-flex min-h-[44px] items-center hover:text-ink">
                Catalog
              </Link>
            </li>
            {product.category && (
              <>
                <li aria-hidden className="fg-muted">/</li>
                <li>
                  <Link
                    href={`/catalog?category=${encodeURIComponent(product.category)}`}
                    className="fg-muted inline-flex min-h-[44px] items-center hover:text-ink"
                  >
                    {product.category}
                  </Link>
                </li>
              </>
            )}
            <li aria-hidden className="fg-muted">/</li>
            <li aria-current="page">{product.name}</li>
          </ol>
        </nav>
        <ProductView product={product} />
      </div>

      {/* ── The details ───────────────────────────────────────────────────── */}
      {specs.length > 0 && (
        <section id="details" className="shell sec-sm scroll-mt-28" aria-labelledby="ct-details">
          <hr className="stitch-rule draw-in" />
          <div className="grid-12 mt-14 gap-y-12 sm:mt-20 lg:mt-24">
            <div className="col-span-4 sm:col-span-8 lg:col-span-4">
              <p className="t-eyebrow fg-muted">Specifications · {product.styleNumber}</p>
              <h2 id="ct-details" className="t-h2 mt-5">
                The <em>details</em>.
              </h2>
              {more.map((para) => (
                <p key={para} className="t-body mt-6 max-w-[46ch]">
                  {para}
                </p>
              ))}
              <figure className="mt-10 hidden w-[78%] lg:block">
                <div className="photo grade grain wipe-in aspect-square">
                  <Image
                    src={ref.photo.src}
                    alt={ref.photo.alt}
                    width={ref.photo.width}
                    height={ref.photo.height}
                    sizes="(min-width: 1536px) 340px, 24vw"
                    style={{ objectPosition: ref.photo.objectPosition }}
                  />
                </div>
                <figcaption className="caption">Reference · {ref.caption}</figcaption>
              </figure>
            </div>
            <dl className="col-span-4 border-t border-ink sm:col-span-8 lg:col-span-7 lg:col-start-6">
              {specs.map(([k, v]) => (
                <div
                  key={k}
                  className="grid grid-cols-[6.5rem_minmax(0,1fr)] gap-x-6 border-b border-[var(--rule-c)] py-4 sm:grid-cols-[10rem_minmax(0,1fr)] sm:py-5"
                >
                  <dt className="t-spec fg-muted pt-[0.3em]">{k}</dt>
                  <dd className="t-body">{v}</dd>
                </div>
              ))}
            </dl>
            <figure className="col-span-4 sm:col-span-5 lg:hidden">
              <div className="photo grade grain aspect-square">
                <Image
                  src={ref.photo.src}
                  alt={ref.photo.alt}
                  width={ref.photo.width}
                  height={ref.photo.height}
                  sizes="(min-width: 640px) 60vw, 100vw"
                  style={{ objectPosition: ref.photo.objectPosition }}
                />
              </div>
              <figcaption className="caption">Reference · {ref.caption}</figcaption>
            </figure>
          </div>
        </section>
      )}

      {/* ── Timeline: the page's one dark band ────────────────────────────── */}
      {product.leadTimeDays && (
        <section className="band-green sec" aria-label="Timeline">
          <div className="shell">
            <LeadTimeline lead={product.leadTimeDays} />
          </div>
        </section>
      )}

      {/* ── Size chart ────────────────────────────────────────────────────── */}
      {hasChart && (
        <section id="size-chart" className="shell sec-sm scroll-mt-28 pb-0">
          <details className="group border-y border-ink">
            <summary className="ct-sum flex min-h-[88px] cursor-pointer items-center justify-between gap-6 py-4">
              <span className="flex flex-wrap items-baseline gap-x-5 gap-y-1">
                <span className="t-h2">
                  Size <em>chart</em>
                </span>
                <span className="t-spec fg-muted">
                  {runSummary(product)}
                </span>
              </span>
              <span aria-hidden className="ct-plus shrink-0" />
            </summary>
            <div className="pb-10 pt-2">
              <SizeChart chart={product.sizeChart} unit={product.sizeChartUnit} />
            </div>
          </details>
        </section>
      )}

      {/* ── Pairs well with ───────────────────────────────────────────────── */}
      {related.length > 0 && (
        <section className="shell sec-sm overflow-x-clip" aria-labelledby="ct-pairs">
          <div className="mb-10 flex items-end justify-between gap-6 sm:mb-14">
            <div>
              <p className="t-eyebrow fg-muted">Build the collection</p>
              <h2 id="ct-pairs" className="t-h2 mt-4">
                Pairs <em>well</em> with.
              </h2>
            </div>
            <Link href="/catalog" className="link-arrow t-small shrink-0 font-semibold">
              <span className="link-u">All styles</span>
              <svg width="18" height="12" viewBox="0 0 18 12" fill="none" aria-hidden>
                <path d="M0 6h16M11 1l5 5-5 5" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </Link>
          </div>
          <div className="ct-strip sm:grid sm:grid-cols-3 sm:gap-6 lg:gap-8">
            {related.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

/** "XS–3XL · 3 measurements", for the size chart's closed state. */
function runSummary(p: CatalogProduct): string {
  const sizes = Object.keys(p.sizeChart);
  const m = new Set(sizes.flatMap((s) => Object.keys(p.sizeChart[s] ?? {}))).size;
  const run = sizesLabel(p);
  return [run, m ? `${m} measurements` : null].filter(Boolean).join(' · ');
}
