import type { Metadata } from 'next';
import Link from 'next/link';
import './catalog.css';
import CatalogExplorer from '@/components/catalog/CatalogExplorer';
import { getCatalog } from '@/lib/catalog/api';
import { parseExplorerState } from '@/lib/catalog/explorer-state';

export const metadata: Metadata = {
  description:
    'The Member Threads catalog: heavyweight hoodies, quarter-zips, polos, rugbys, outerwear and hats for clubs, companies, nonprofits and teams. Customized to your organization from 36 pieces per style, design included.',
};

/** Matches site.ts: the minimum, what's included, the lead time. */
const FACTS: Array<[string, string]> = [
  ['Minimum', '36 per style'],
  ['Design', 'Included'],
  ['Lead time', '6–8 weeks'],
];

/** "MT-01 – MT-14", from the style numbers on file. */
function styleRange(products: Array<{ styleNumber: string | null }>): string {
  const nos = products.map((p) => p.styleNumber).filter((n): n is string => Boolean(n)).sort();
  return nos.length > 1 ? `${nos[0]} – ${nos[nos.length - 1]}` : nos[0] ?? '';
}

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [catalog, params] = await Promise.all([getCatalog(), searchParams]);
  const { products } = catalog;
  const initial = parseExplorerState(params);

  return (
    <div>
      <header className="shell pb-10 pt-10 sm:pb-14 sm:pt-16">
        <p className="label text-muted">
          {products.length > 0 ? `${products.length} styles · ${styleRange(products)}` : 'Member Threads'}
        </p>
        <h1 className="caps mt-4 text-d0">Catalog</h1>
        <div className="mt-8 grid gap-8 border-t border-ink pt-6 sm:mt-10 lg:grid-cols-12 lg:gap-10">
          <p className="max-w-[46ch] text-lead text-ink/75 lg:col-span-6">
            Established styles, chosen for how they wear. Start from one, then change the color, fabric, fit and
            finish until it belongs to your organization.
          </p>
          <dl className="grid grid-cols-3 gap-4 lg:col-span-5 lg:col-start-8">
            {FACTS.map(([k, v]) => (
              <div key={k}>
                <dt className="label text-muted">{k}</dt>
                <dd className="mt-2 text-[0.9375rem] font-semibold">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </header>

      {products.length > 0 ? (
        <CatalogExplorer products={products} initial={initial} />
      ) : (
        <section className="shell pb-24">
          <div className="flex flex-col items-start gap-5 border-y border-rule py-14 sm:py-20">
            <p className="caps text-d2">
              {catalog.source === 'unavailable' ? 'The catalog is offline.' : 'New styles are on the way.'}
            </p>
            <p className="max-w-measure text-lead text-muted">
              {catalog.source === 'unavailable'
                ? "The catalog isn't loading right now. Tell us what your organization needs and we'll build it with you."
                : "We're adding styles now. Tell us what your organization needs and we'll build it with you."}
            </p>
            <Link href="/quote" className="btn-blue">
              Start a collection
            </Link>
          </div>
        </section>
      )}

      {/* The way out for anything that isn't in the catalog. */}
      <section className="shell pb-20 pt-10 sm:pb-28">
        <div className="grid gap-8 rounded-[28px] bg-cream px-6 py-12 sm:px-12 sm:py-16 lg:grid-cols-12 lg:items-end lg:px-16">
          <div className="lg:col-span-8">
            <p className="label text-muted">Beyond the catalog</p>
            <h2 className="caps mt-4 max-w-[18ch] text-d1">Need a style that isn&rsquo;t here?</h2>
            <p className="mt-5 max-w-[48ch] text-lead text-ink/75">
              Most collections start from these styles, not all of them. Tell us what you have in mind and your
              designer will source it.
            </p>
          </div>
          <div className="lg:col-span-4 lg:flex lg:justify-end">
            <Link href="/quote" className="btn-blue shrink-0">
              Start a collection <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
