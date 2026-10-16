'use client';

import GarmentArt from './GarmentArt';
import type { CatalogProduct } from '@/lib/catalog/types';
import { garmentKind, paintOf } from '@/lib/catalog/util';

/** The product images in display order: primary first, then the rest, then marketing shots. */
export function galleryOf(product: CatalogProduct) {
  const images = [...product.images].sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary));
  return [...images, ...product.marketingImages];
}

/** True when the product has at least one photograph to show. */
export function isPhotographed(product: CatalogProduct): boolean {
  return galleryOf(product).length > 0;
}

/**
 * A product's picture: its photograph when the dashboard has one, otherwise the
 * garment drawing painted in the chosen colourway. Photos cannot be recoloured, so
 * with a photo the colourway only changes the swatch selection, never the image.
 *
 * Photos are packshots on white. They are shown whole (`contain`, never cropped — a
 * cap's brim is the product) and multiplied onto the tile, so the white of the photo
 * becomes the tile's own ground instead of a white square sitting on grey. Callers
 * give photos and drawings the same inset, so both sit in a card the same way.
 */
export default function ProductMedia({
  product,
  colorIndex = 0,
  imageIndex = 0,
  size = 'thumb',
  className = '',
  priority = false,
  outlined = false,
}: {
  /** Firm ink edge on the drawing (see GarmentArt). */
  outlined?: boolean;
  product: CatalogProduct;
  colorIndex?: number;
  imageIndex?: number;
  size?: 'thumb' | 'full';
  className?: string;
  priority?: boolean;
}) {
  const gallery = galleryOf(product);
  const image = gallery[imageIndex] ?? gallery[0];

  if (image) {
    // The ash ground travels with the photo: a hover scale on any ancestor starts a new
    // stacking context, and a multiply with nothing beneath it inside that context
    // shows the photo's white square again. Photos only ever sit on ash tiles.
    return (
      <div className={`h-full w-full bg-white ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={size === 'thumb' ? image.thumbUrl : image.url}
          alt={image.alt ?? product.name}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          className="h-full w-full object-contain mix-blend-multiply"
        />
      </div>
    );
  }

  const colorway = product.colorways[colorIndex] ?? product.colorways[0];
  return (
    <GarmentArt
      kind={garmentKind(product)}
      color={paintOf(colorway)}
      className={`h-full w-full ${className}`}
      outlined={outlined}
      label={`${product.name}${colorway ? ` in ${colorway.name}` : ''}`}
    />
  );
}
