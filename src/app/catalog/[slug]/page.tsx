import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import LeadTimeline from '@/components/catalog/LeadTimeline';
import PriceEstimator from '@/components/catalog/PriceEstimator';
import ProductCard from '@/components/catalog/ProductCard';
import ProductView from '@/components/catalog/ProductView';
import SizeChart from '@/components/catalog/SizeChart';
import { getCatalog, getProduct } from '@/lib/catalog/api';
import type { CatalogProduct } from '@/lib/catalog/types';
import { flatBreaks, leadTimeLabel } from '@/lib/catalog/util';

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
    ['Minimum', p.minimumOrderQuantity ? `${p.minimumOrderQuantity} pieces per style` : null],
    ['Lead time', p.leadTimeDays ? weeksLabel(p.leadTimeDays) : leadTimeLabel(p)],
    ['Care', p.careInstructions],
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
  const breaks = flatBreaks(product.pricing);
  const others = catalog.products.filter((p) => p.slug !== product.slug);
  const related = [
    ...others.filter((p) => p.category && p.category === product.category),
    ...others.filter((p) => !p.category || p.category !== product.category),
  ].slice(0, 3);

  return (
    <div>
      <div className="shell pb-16 pt-8 sm:pb-24 sm:pt-14">
        <nav aria-label="Breadcrumb" className="mb-8 sm:mb-10">
          <ol className="label flex flex-wrap items-center gap-x-2 text-muted">
            <li>
              <Link href="/catalog" className="inline-flex min-h-[44px] items-center hover:text-ink">
                Catalog
              </Link>
            </li>
            {product.category && (
              <>
                <li aria-hidden>/</li>
                <li>
                  <Link
                    href={`/catalog?category=${encodeURIComponent(product.category)}`}
                    className="inline-flex min-h-[44px] items-center hover:text-ink"
                  >
                    {product.category}
                  </Link>
                </li>
              </>
            )}
            <li aria-hidden>/</li>
            <li className="text-ink" aria-current="page">
              {product.name}
            </li>
          </ol>
        </nav>
        <ProductView product={product} />
      </div>

      {(specs.length > 0 || breaks.length > 0) && (
        <section className="shell pb-16 sm:pb-24">
          <div
            className={`grid gap-12 border-t border-ink pt-10 sm:pt-14 lg:gap-16 [&>*]:min-w-0 ${
              specs.length && breaks.length ? 'lg:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)]' : ''
            }`}
          >
            {specs.length > 0 && (
              <div>
                <h2 className="label text-muted">Specifications</h2>
                <dl className="mt-6">
                  {specs.map(([k, v]) => (
                    <div key={k} className="grid grid-cols-[7.5rem_1fr] gap-6 border-t border-rule py-4 first:border-t-0 first:pt-0">
                      <dt className="text-[0.875rem] text-muted">{k}</dt>
                      <dd className="text-[0.9375rem]">{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
            {breaks.length > 0 && (
              <div>
                <h2 className="label text-muted">Price per piece</h2>
                <p className="mt-6 max-w-[46ch] text-[0.9375rem] text-ink/75">
                  One price per piece, with design, decoration and custom color included. Mix sizes freely; the price
                  follows the total for this style.
                </p>
                <div className="mt-8">
                  <PriceEstimator breaks={breaks} minimum={product.minimumOrderQuantity} />
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {product.leadTimeDays && (
        <section className="shell pb-16 sm:pb-24">
          <div className="border-t border-ink pt-10 sm:pt-14">
            <h2 className="label text-muted">Timeline</h2>
            <div className="mt-6">
              <LeadTimeline lead={product.leadTimeDays} />
            </div>
          </div>
        </section>
      )}

      {hasChart && (
        <section id="size-chart" className="shell scroll-mt-28 pb-16 sm:pb-24">
          <details className="group border-y border-ink">
            <summary className="flex min-h-[72px] cursor-pointer list-none items-center justify-between gap-6 [&::-webkit-details-marker]:hidden">
              <span className="flex items-baseline gap-4">
                <span className="label text-muted">Fit</span>
                <span className="caps text-d3">Size chart</span>
              </span>
              <span aria-hidden className="text-[1.5rem] leading-none text-ink transition-transform duration-200 group-open:rotate-45 motion-reduce:transition-none">
                +
              </span>
            </summary>
            <div className="pb-8 pt-2">
              <SizeChart chart={product.sizeChart} unit={product.sizeChartUnit} />
            </div>
          </details>
        </section>
      )}

      {related.length > 0 && (
        <section className="shell pb-20 sm:pb-28">
          <div className="mb-8 flex items-end justify-between gap-6 sm:mb-10">
            <div>
              <p className="label text-muted">Build the collection</p>
              <h2 className="caps mt-3 text-d2">Pairs well with</h2>
            </div>
            <Link href="/catalog" className="label inline-flex min-h-[44px] items-center text-ink underline-offset-4 hover:underline">
              All styles →
            </Link>
          </div>
          <div className="grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
