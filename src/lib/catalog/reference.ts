/**
 * Photographs on a product page.
 *
 * - `productPhotoFor`: a representative photograph of the style (role 'product' in the
 *   manifest, keyed by catalog slug). Shown as Plate I when it exists, always captioned
 *   as representative, never as the customer's piece.
 * - `referenceFor`: a licensed mood photo of the material or making, beside the specs,
 *   captioned "Reference".
 *
 * Each manifest image is used once across the site; the catalog owns the slugs below.
 */

import { PHOTOS, type Photo, type PhotoSlug } from '@/lib/photos';
import type { CatalogProduct } from './types';
import { garmentKind, type GarmentKind } from './util';

type Tagged = Photo & { product?: string };

export function productPhotoFor(slug: string): Photo | null {
  const all = Object.values(PHOTOS) as Tagged[];
  return all.find((p) => (p.role as string) === 'product' && p.product === slug) ?? null;
}

const BY_KIND: Partial<Record<GarmentKind, [PhotoSlug, string]>> = {
  tee: ['texture-green-jersey', 'Knit jersey, up close'],
  longsleeve: ['texture-green-jersey', 'Knit jersey, up close'],
  polo: ['texture-green-jersey', 'Knit jersey, up close'],
  rugby: ['texture-green-jersey', 'Knit jersey, up close'],
  hoodie: ['detail-rib-cuff-grey', 'Rib cuff, up close'],
  crewneck: ['detail-rib-cuff-grey', 'Rib cuff, up close'],
  quarterzip: ['detail-rib-cuff-grey', 'Rib cuff, up close'],
  pants: ['detail-rib-cuff-grey', 'Rib cuff, up close'],
  shorts: ['detail-rib-cuff-grey', 'Rib cuff, up close'],
  jacket: ['lifestyle-barn-walk', 'Made to be worn outside'],
  vest: ['lifestyle-barn-walk', 'Made to be worn outside'],
  cap: ['craft-embroidery-machine-cap', 'A cap on the embroidery machine'],
  fivepanel: ['craft-embroidery-machine-cap', 'A cap on the embroidery machine'],
  beanie: ['detail-knit-stack-window', 'Knits, stacked'],
  tote: ['texture-canvas', 'Woven canvas'],
};

export function referenceFor(p: CatalogProduct): { photo: Photo; caption: string } {
  const [slug, caption] = BY_KIND[garmentKind(p)] ?? ['detail-knit-stack-window', 'Cloth, stacked'];
  return { photo: PHOTOS[slug], caption };
}
