import type { CatalogProduct, LookbookSet, PublicAsset } from './types';

/**
 * Photos through this site's own image optimizer instead of straight from the dashboard.
 *
 * A dashboard asset URL is a permission check that answers with a redirect to a storage
 * link signed for an hour: two round trips (about 0.5–0.8s) for every image, and nothing
 * a browser or CDN can keep for long. Asked by this site's server instead, with no
 * `Origin` (which the dashboard permits, as it does for the catalog JSON), each photo is
 * fetched once, cached for a month on the CDN under this site's own domain, and served
 * from there to everyone after. An asset's URL is per file, so a replaced photo is a new
 * URL and never a stale one.
 *
 * Widths must be in next.config's `deviceSizes`. Anything that isn't a dashboard asset
 * (a local drawing, a full URL elsewhere) passes through untouched.
 */
const THUMB = 640;
const FULL = 1200;

export function viaSite(url: string, width: number): string {
  if (!url.includes('/api/embed/v1/catalog/')) return url;
  return `/_next/image?url=${encodeURIComponent(url)}&w=${width}&q=75`;
}

const asset = <T extends Pick<PublicAsset, 'url' | 'thumbUrl'>>(a: T): T => ({
  ...a,
  url: viaSite(a.url, FULL),
  thumbUrl: viaSite(a.thumbUrl, THUMB),
});

export const fastProduct = (p: CatalogProduct): CatalogProduct => ({
  ...p,
  images: p.images.map(asset),
  marketingImages: p.marketingImages.map(asset),
});

export const fastSet = (s: LookbookSet): LookbookSet => ({
  ...s,
  pieces: s.pieces.map((piece) => ({ ...piece, front: asset(piece.front), back: piece.back ? asset(piece.back) : null })),
});
