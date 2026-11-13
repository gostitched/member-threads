/**
 * Reading the catalog. Server-side only.
 *
 * ── WHERE IT COMES FROM ──────────────────────────────────────────────────────
 * The pieces come from the Stitched dashboard by default. Set
 * `CATALOG_SOURCE=local` to serve Member Threads' own list in `local.ts` instead
 * (drawn in each colorway, no network), which is kept so switching is one
 * environment variable, not a rewrite.
 *
 * Products live in the dashboard, and this site sees only what the dashboard lets it:
 * a product appears here once it is ACTIVE and PUBLISHED to this site (the product's
 * Publishing tab, `product_site_placements`). The dashboard decides which site is
 * asking from the embed key, and its `catalog_public_*` views return that site's
 * placements and nothing else. There is no fallback content: an empty answer renders
 * as an empty catalog. This file asks the dashboard's
 * public embed API for them — the same endpoints the dashboard's catalog web
 * component uses — from the server, so the page is rendered with real content (and
 * indexable) rather than filled in by a script after load.
 *
 * ── THE KEY ──────────────────────────────────────────────────────────────────
 * Catalog reads require an embed key; a keyless read is refused. The key is public by
 * design (it sits in page source wherever the catalog is embedded). It is
 * `STITCHED_CATALOG_KEY`, else `NEXT_PUBLIC_EMBED_KEY` (`EMBED_KEY`, the one the request
 * form uses). There is no key in code: never another site's. Without one, nothing is
 * read and the catalog and lookbook render empty.
 *
 * Server-side requests carry no `Origin`, which the dashboard's allowlist permits;
 * browsers never call the API from this site, so no CORS entry is involved.
 *
 * ── CACHING ──────────────────────────────────────────────────────────────────
 * Live: the dashboard calls `/api/revalidate` after every catalog save, which drops
 * everything tagged `CATALOG_TAG`, so a change shows up here within seconds. The
 * 60-second timer is the fallback for a ping that never arrives.
 */

import { APP_URL, EMBED_KEY } from '@/lib/site';
import { LOCAL_CATALOG } from './local';
import type { Catalog, CatalogBrand, CatalogProduct, CatalogSource, Lookbook, LookbookSet } from './types';

/** The dashboard is the default; `CATALOG_SOURCE=local` serves the local list. */
const LIVE = process.env.CATALOG_SOURCE?.trim().toLowerCase() !== 'local';

/** `STITCHED_CATALOG_KEY`, else `NEXT_PUBLIC_EMBED_KEY` (`EMBED_KEY` in `@/lib/site`), else none. */
const KEY = process.env.STITCHED_CATALOG_KEY?.trim() || EMBED_KEY;
const NO_KEY = 'no embed key: set STITCHED_CATALOG_KEY or NEXT_PUBLIC_EMBED_KEY';
const REVALIDATE_SECONDS = 60;
/** Every catalog read carries this tag; `/api/revalidate` drops them all at once. */
export const CATALOG_TAG = 'stitched-catalog';
const PAGE_SIZE = 100;
/** A catalog is dozens of products; this only stops a misbehaving `more` flag looping forever. */
const MAX_PAGES = 20;

function endpoint(path: string, params: Record<string, string> = {}): string {
  const url = new URL(`/api/embed/v1/catalog${path}`, APP_URL);
  url.searchParams.set('key', KEY);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  return url.toString();
}

interface ProductsResponse {
  catalog: { brand: CatalogBrand };
  products: CatalogProduct[];
  page: { more: boolean };
}

async function getJson<T>(url: string): Promise<{ status: number; body: T | null }> {
  const response = await fetch(url, { next: { revalidate: REVALIDATE_SECONDS, tags: [CATALOG_TAG] } });
  if (!response.ok) return { status: response.status, body: null };
  return { status: response.status, body: (await response.json()) as T };
}

const nothing = (source: CatalogSource, brand: CatalogBrand | null): Catalog => ({ source, brand, products: [] });

/** Every product placed on this site, featured first as the dashboard orders them. */
export async function getCatalog(): Promise<Catalog> {
  if (!LIVE) return LOCAL_CATALOG;
  if (!KEY) {
    console.warn(`[catalog] ${NO_KEY}`);
    return nothing('unavailable', null);
  }
  const products: CatalogProduct[] = [];
  let brand: CatalogBrand | null = null;

  try {
    for (let page = 0; page < MAX_PAGES; page++) {
      const { status, body } = await getJson<ProductsResponse>(
        endpoint('/products', { limit: String(PAGE_SIZE), offset: String(page * PAGE_SIZE) })
      );
      if (!body) {
        console.error('[catalog] the dashboard refused the catalog read', { status });
        return nothing('unavailable', null);
      }
      brand = body.catalog.brand;
      products.push(...body.products);
      if (!body.page.more) break;
    }
  } catch (error) {
    console.error('[catalog] could not reach the dashboard', { appUrl: APP_URL, error });
    return nothing('unavailable', null);
  }

  if (products.length === 0) return nothing('empty', brand);
  return { source: 'live', brand, products };
}

/** One product, or null when it is not on this site. */
export async function getProduct(slug: string): Promise<{ product: CatalogProduct; source: CatalogSource } | null> {
  const catalog = await getCatalog();
  // The list already holds the full DTO, and is cached; a second request would only
  // repeat it. Fall through to the single-product endpoint for a slug the list missed
  // (placed in the last minute).
  const listed = catalog.products.find((p) => p.slug === slug);
  if (listed) return { product: listed, source: catalog.source };
  if (!LIVE || !KEY) return null;

  try {
    const { body } = await getJson<{ product: CatalogProduct }>(endpoint(`/products/${encodeURIComponent(slug)}`));
    return body ? { product: body.product, source: 'live' } : null;
  } catch {
    return null;
  }
}

/**
 * The lookbook's published sets for this site, in the dashboard's order. Read live
 * whatever `CATALOG_SOURCE` says: there is no local lookbook. No key reads nothing.
 * Throws when the dashboard refuses or can't be reached, so the page keeps its last good
 * render instead of going blank.
 */
export async function getLookbook(): Promise<LookbookSet[]> {
  if (!KEY) {
    console.warn(`[lookbook] ${NO_KEY}`);
    return [];
  }
  let result: Awaited<ReturnType<typeof getJson<Lookbook>>>;
  try {
    result = await getJson<Lookbook>(endpoint('/lookbook'));
  } catch (error) {
    throw new Error(`[lookbook] could not reach the dashboard at ${APP_URL}`, { cause: error });
  }
  if (!result.body) throw new Error(`[lookbook] the dashboard refused the lookbook read (${result.status})`);
  return [...result.body.sets]
    .sort((a, b) => a.sort - b.sort)
    .map((set) => ({ ...set, pieces: [...set.pieces].sort((a, b) => a.position - b.position) }));
}
