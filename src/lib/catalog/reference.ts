/**
 * The reference photograph beside a style's specifications.
 *
 * There is no product photography yet: the drawings are the product images. These are
 * licensed mood photos of materials and making, chosen per style for the cloth or finish
 * it is built from, and always captioned "Reference" so no one reads one as the piece.
 */

import { PHOTOS, type Photo, type PhotoSlug } from '@/lib/photos';
import type { CatalogProduct } from './types';
import { garmentKind, type GarmentKind } from './util';

const BY_KIND: Partial<Record<GarmentKind, [PhotoSlug, string]>> = {
  tee: ['texture-green-jersey', 'Cotton jersey'],
  longsleeve: ['texture-green-jersey', 'Cotton jersey'],
  polo: ['detail-embroidery-needle', 'Satin-stitch embroidery'],
  quarterzip: ['detail-embroidery-needle', 'Satin-stitch embroidery'],
  rugby: ['detail-fabric-rolls', 'Cotton on the roll'],
  jacket: ['craft-cutting-fabric', 'Cloth at the cutting table'],
  vest: ['craft-cutting-fabric', 'Cloth at the cutting table'],
  pants: ['detail-folded-stack-warm', 'Sweats, folded'],
  shorts: ['detail-folded-stack-warm', 'Sweats, folded'],
  cap: ['craft-embroidery-machine-cap', 'A cap on the embroidery machine'],
  fivepanel: ['craft-embroidery-machine-cap', 'A cap on the embroidery machine'],
  beanie: ['detail-knit-stack-window', 'Knits, stacked'],
  tote: ['texture-canvas', 'Woven canvas'],
};

export function referenceFor(p: CatalogProduct): { photo: Photo; caption: string } {
  // A finish that photographs well wins over the cloth.
  if (p.decorationMethods.some((m) => /chenille/i.test(m))) {
    return { photo: PHOTOS['detail-chenille-numerals'], caption: 'Chenille appliqué' };
  }
  const [slug, caption] = BY_KIND[garmentKind(p)] ?? ['craft-thread-cones', 'Thread, before it is stitched'];
  return { photo: PHOTOS[slug], caption };
}
