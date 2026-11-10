import type { Metadata } from 'next';
import Link from 'next/link';
import './catalog.css';
import CollectionBuilder from '@/components/catalog/CollectionBuilder';
import { Arrow } from '@/components/SiteHeader';
import { getCatalog } from '@/lib/catalog/api';

export const metadata: Metadata = {
  title: 'Catalog',
  description:
    'Build your collection from the Member Threads catalog: hoodies, crewnecks, quarter-zips, polos, jerseys, sweats and hats for clubs, companies, nonprofits and teams. From 36 pieces per style, design included.',
};

export default async function CatalogPage() {
  const catalog = await getCatalog();
  const { products } = catalog;

  return (
    <div>
      {products.length > 0 ? (
        <section className="mx-auto w-full max-w-[1536px] px-5 sm:px-8 lg:px-14 lg:pt-9">
          <CollectionBuilder products={products} />
        </section>
      ) : (
        <section className="shell pb-24 pt-10">
          <h1 className="sr-only">Catalog</h1>
          <div className="flex flex-col items-start gap-5 bg-cream p-10 sm:p-16">
            <p className="t-h2">
              {catalog.source === 'unavailable' ? 'Tell us about your organization.' : 'New pieces are on the way.'}
            </p>
            <p className="t-lead max-w-measure">
              {catalog.source === 'unavailable'
                ? 'The catalog isn’t loading right now. Describe the piece and we’ll develop it with you.'
                : 'We’re still adding styles. Describe the piece and we’ll develop it with you.'}
            </p>
            <Link href="/custom" className="btn-blue">
              Describe the piece <Arrow className="h-[14px] w-[19px]" />
            </Link>
          </div>
        </section>
      )}

      {/* The way out for anything that isn't in the catalog: a cream plate, one line, one button. */}
      <section className="mx-auto w-full max-w-[1536px] px-5 pb-14 pt-10 sm:px-8 lg:px-14 lg:pb-20 lg:pt-12">
        <div className="relative flex flex-col items-start gap-8 overflow-hidden bg-cream px-6 py-12 text-ink sm:px-12 sm:py-16 lg:flex-row lg:items-end lg:justify-between lg:px-16">
          <h2 className="t-h1 relative max-w-[16ch]">
            Need a piece that isn’t <em>here?</em>
          </h2>
          <Link href="/custom" className="btn-blue shrink-0">
            Describe the piece <Arrow className="h-[14px] w-[19px]" />
          </Link>
        </div>
      </section>
    </div>
  );
}
