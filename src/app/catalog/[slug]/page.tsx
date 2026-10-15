import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
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
      `${product.name}, designed into a custom Bar or Bat Mitzvah collection by Member Threads. Design included.`,
    ...(image ? { openGraph: { images: [{ url: image.url }] } } : {}),
  };
}

const SIZE_LADDER = ['2XS', 'XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL', '6XL'];

/** One run of sizes: unbroken, it collapses to its ends ("S–2XL"); otherwise it is listed. */
function runLabel(codes: string[]): string {
  const at = codes.map((c) => SIZE_LADDER.indexOf(c));
  const unbroken = codes.length > 2 && at.every((n, i) => n >= 0 && (i === 0 || n === at[i - 1] + 1));
  return unbroken ? `${codes[0]}–${codes[codes.length - 1]}` : codes.join(', ');
}

/**
 * Sizes, youth and adult as two runs ("Youth XS–XL · Adult S–2XL"): a guest list is
 * both. Youth sizes are coded with a leading Y (YXS, YM). Sizes only: bigger sizes cost
 * the same, so no upcharges are shown.
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

/** The few facts a parent asks about; the rest is for the call. */
function specRows(p: CatalogProduct): Array<[string, string]> {
  const rows: Array<[string, string | null]> = [
    ['Sizes', sizesLabel(p)],
    ['Fabric', p.fabric],
    ['Weight', p.gsm ? `${p.gsm} gsm` : null],
    ['Fit', p.fit],
    ['Turnaround', leadTimeLabel(p)],
    ['Minimum', p.minimumOrderQuantity ? `${p.minimumOrderQuantity} pieces` : null],
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
      <div className="shell pb-16 pt-4 sm:pt-6">
        <nav aria-label="Breadcrumb" className="mb-8 text-[0.9375rem] font-semibold text-muted">
          <Link href="/catalog" className="inline-flex min-h-[44px] items-center gap-2 hover:text-ink">
            <span aria-hidden>←</span> All pieces
          </Link>
        </nav>
        <ProductView product={product} />
      </div>

      {(specs.length > 0 || breaks.length > 0) && (
        <section className={`shell grid gap-4 pb-16 [&>*]:min-w-0 ${specs.length && breaks.length ? 'lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]' : ''}`}>
          {specs.length > 0 && (
            <div className="rounded-3xl bg-white p-6 ring-1 ring-rule sm:p-8">
              <h2 className="caps text-d3">The details.</h2>
              <dl className="mt-5">
                {specs.map(([k, v]) => (
                  <div key={k} className="flex items-baseline justify-between gap-6 border-t border-rule py-3.5">
                    <dt className="shrink-0 text-[0.875rem] text-muted">{k}</dt>
                    <dd className="text-right text-[0.9375rem]">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
          {breaks.length > 0 && (
            <div className="rounded-3xl bg-white p-6 ring-1 ring-rule sm:p-8">
              <h2 className="caps text-d3">Order more, pay less.</h2>
              <div className="mt-5">
                <PriceEstimator breaks={breaks} minimum={product.minimumOrderQuantity} />
              </div>
            </div>
          )}
        </section>
      )}

      {hasChart && (
        <section className="shell pb-16">
          <details className="group rounded-3xl bg-white p-6 ring-1 ring-rule sm:p-8">
            <summary className="caps flex min-h-[44px] cursor-pointer list-none items-center justify-between text-d3 [&::-webkit-details-marker]:hidden">
              Size chart
              <span aria-hidden className="text-uv transition-transform duration-200 group-open:rotate-45 motion-reduce:transition-none">+</span>
            </summary>
            <div className="mt-6">
              <SizeChart chart={product.sizeChart} unit={product.sizeChartUnit} />
            </div>
          </details>
        </section>
      )}

      {related.length > 0 && (
        <section className="shell pb-20 sm:pb-28">
          <div className="mb-8 flex items-end justify-between gap-6">
            <h2 className="caps text-d2">Goes with it.</h2>
            <Link href="/catalog" className="text-[0.9375rem] font-semibold text-electric-deep underline-offset-4 hover:underline">
              Every piece →
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
