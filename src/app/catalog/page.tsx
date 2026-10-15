import type { Metadata } from 'next';
import Link from 'next/link';
import { Star } from '@/components/Sticker';
import './catalog.css';
import CatalogExplorer from '@/components/catalog/CatalogExplorer';
import { getCatalog } from '@/lib/catalog/api';
import { parseExplorerState } from '@/lib/catalog/explorer-state';

export const metadata: Metadata = {
  description:
    'The pieces a Bar or Bat Mitzvah collection is built from: 420 GSM hoodies, PJ pants with the event art in the pattern, racing jerseys, rope-brim dance-floor hats. One collection price, design included.',
};

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
      <h1 className="sr-only">Pieces</h1>

      {products.length > 0 ? (
        <CatalogExplorer products={products} initial={initial} />
      ) : (
        <section className="shell pb-24">
          <div className="flex flex-col items-start gap-5 rounded-3xl bg-white p-10 ring-1 ring-rule sm:p-16">
            <p className="caps text-d2">
              {catalog.source === 'unavailable' ? 'Tell us about the event.' : 'New pieces are on the way.'}
            </p>
            <p className="max-w-measure text-lead text-muted">
              {catalog.source === 'unavailable'
                ? "The rack isn't loading right now. Describe the piece and we'll develop it from scratch."
                : "We're still hanging the rack. Describe the piece and we'll develop it from scratch."}
            </p>
            <Link href="/custom" className="btn-blue">
              Describe the piece
            </Link>
          </div>
        </section>
      )}

      {/* The way out for anything that isn't on the rack: a pale-blue panel, one line, one button. */}
      <section className="shell pb-16 pt-8 sm:pb-24">
        <div className="relative flex flex-col items-start gap-8 overflow-hidden rounded-[32px] bg-electric-lit px-6 py-12 text-ink sm:px-12 sm:py-16 lg:flex-row lg:items-end lg:justify-between lg:px-16">
          <Star variant="fill" rotate={-12} className="pointer-events-none absolute -right-3 -top-3 h-20 w-20 text-electric sm:right-10 sm:top-8 sm:h-24 sm:w-24" />
          <h2 className="caps relative max-w-[16ch] text-d1">Need a piece that isn&rsquo;t here?</h2>
          <Link href="/custom" className="btn-blue shrink-0">
            Describe the piece <span aria-hidden>→</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
