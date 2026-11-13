import type { Metadata } from 'next';
import Catalog from '@/components/work/Catalog';
import { getCatalog, getLookbook } from '@/lib/catalog/api';
import type { LookbookSet } from '@/lib/catalog/types';

export const metadata: Metadata = {
  title: 'Get Inspired',
  description:
    'Concept collections for clubs, teams, companies and causes: hoodies, quarter-zips, polos, jerseys and caps, drawn in each organization’s colors. Browse by organization and by piece.',
};

export const revalidate = 60;

/**
 * The lookbook. A failed read during `next build` renders the empty wall (the page is
 * regenerated within a minute); at runtime it throws, so the last good page stays up.
 */
async function loadSets(): Promise<LookbookSet[]> {
  try {
    return await getLookbook();
  } catch (error) {
    if (process.env.NEXT_PHASE === 'phase-production-build') {
      console.error('[lookbook] read failed during build; rendering empty', error);
      return [];
    }
    throw error;
  }
}

export default async function WorkPage() {
  const [sets, catalog] = await Promise.all([loadSets(), getCatalog()]);
  // Only link pieces whose product is on this site's catalog, so "Make this" never 404s.
  const slugs = new Set(catalog.products.map((p) => p.slug));
  const linked = sets.map((s) => ({
    ...s,
    pieces: s.pieces.map((p) => (p.product && !slugs.has(p.product.slug) ? { ...p, product: null } : p)),
  }));

  return (
    // Same edges as the site header, so the wall lines up with the logo and the button.
    <div className="overflow-x-clip">
      <section className="mx-auto w-full max-w-[1536px] px-5 pb-14 sm:px-8 lg:px-14 lg:pb-20 lg:pt-9">
        <Catalog sets={linked} />
      </section>
    </div>
  );
}
