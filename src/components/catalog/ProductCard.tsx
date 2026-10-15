'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import ProductMedia, { galleryOf } from './ProductMedia';
import type { CatalogProduct } from '@/lib/catalog/types';
import { formatMoney, entryPrice } from '@/lib/catalog/util';

const CYCLE_MS = 850;
const MAX_DOTS = 7;

/**
 * One product in the grid.
 *
 * Hovering it plays through its colourways (a drawn product) or crossfades to its
 * second photograph (a photographed one); hovering a swatch pins that colourway. On
 * touch there is no hover, so the swatches are the whole interaction — they are real
 * buttons, and the card itself is a link.
 */
export default function ProductCard({
  product,
  featured = false,
  focusFamilyHexes,
}: {
  product: CatalogProduct;
  featured?: boolean;
  /** Colourways in the active colour family, shown first when a family filter is on. */
  focusFamilyHexes?: Set<string>;
}) {
  const [hovering, setHovering] = useState(false);
  const [pinned, setPinned] = useState<number | null>(null);
  const [cycle, setCycle] = useState(0);
  const gallery = galleryOf(product);
  const photographed = gallery.length > 0;
  const colors = product.colorways;

  // With a colour family filter on, open on a colourway from that family.
  const familyStart = focusFamilyHexes
    ? Math.max(0, colors.findIndex((c) => c.hex && focusFamilyHexes.has(c.hex.toLowerCase())))
    : 0;

  useEffect(() => {
    if (!hovering || pinned !== null || photographed || colors.length < 2) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = window.setInterval(() => setCycle((n) => n + 1), CYCLE_MS);
    return () => window.clearInterval(timer);
  }, [hovering, pinned, photographed, colors.length]);

  const colorIndex = pinned ?? (colors.length ? (familyStart + cycle) % colors.length : 0);
  const price = entryPrice(product);

  return (
    <article
      // No border, no card: the ash plate is the field, the grid's gap does the spacing.
      className={`group relative flex h-full flex-col ${featured ? 'lg:col-span-2 lg:row-span-2' : ''}`}
      onPointerEnter={(e) => e.pointerType === 'mouse' && setHovering(true)}
      onPointerLeave={() => {
        setHovering(false);
        setPinned(null);
        setCycle(0);
      }}
    >
      <Link href={`/catalog/${product.slug}`} className="flex flex-1 flex-col focus-visible:outline-none">
        <div className="relative aspect-[4/5] overflow-hidden rounded-[22px] bg-cream">
          {/* Photo or drawing, the same inset either way. A second photo crossfades in
              on hover; a lone photo or a drawing lifts slightly instead. */}
          <div
            className={`absolute inset-[10%] transition-all duration-700 ease-out group-hover:scale-[1.04] ${
              gallery[1] ? 'group-hover:opacity-0' : ''
            }`}
          >
            <ProductMedia product={product} colorIndex={colorIndex} size={featured ? 'full' : 'thumb'} />
          </div>
          {photographed && gallery[1] && (
            <div className="absolute inset-[10%] opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-100">
              <ProductMedia product={product} imageIndex={1} size={featured ? 'full' : 'thumb'} />
            </div>
          )}

          <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-5">
            <span className="label text-ink/55">{product.styleNumber}</span>
            {product.sticker && <span className="label rounded-full bg-paper px-3 py-1.5 text-ink">{product.sticker}</span>}
          </div>

          {colors[colorIndex] && (
            <span
              className="label pointer-events-none absolute bottom-5 left-5 translate-y-2 text-ink/60 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100"
              aria-hidden
            >
              {colors[colorIndex].name}
            </span>
          )}

          <span
            aria-hidden
            className="absolute bottom-4 right-4 flex h-10 w-10 translate-y-2 items-center justify-center rounded-full bg-ink text-paper opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100"
          >
            →
          </span>
        </div>

        <div className="flex flex-1 flex-col gap-2 pt-4">
          <div className="flex items-baseline justify-between gap-4">
            <h3 className={`font-semibold tracking-tight ${featured ? 'text-d3' : 'text-[1.0625rem]'} underline-offset-4 group-hover:underline`}>
              {product.name}
            </h3>
            {price ? (
              <p className="shrink-0 text-[0.9375rem] tabular-nums">
                <span className="text-muted">from </span>
                {formatMoney(price.cents, price.currency)}
              </p>
            ) : (
              <p className="shrink-0 text-[0.8125rem] text-muted">With your collection</p>
            )}
          </div>
          {product.category && <p className="text-[0.8125rem] text-muted">{product.category}</p>}
          {featured && product.description && (
            <p className="max-w-measure text-[0.9375rem] leading-relaxed text-muted">{product.description}</p>
          )}
        </div>
      </Link>

      {colors.length > 0 && (
        <div className="flex items-center gap-1.5 pt-3" role="group" aria-label={`${product.name} colorways`}>
          {colors.slice(0, MAX_DOTS).map((c, i) => (
            <button
              key={`${c.name}-${i}`}
              type="button"
              title={c.name}
              aria-label={`Preview ${c.name}`}
              aria-pressed={colorIndex === i}
              onPointerEnter={() => setPinned(i)}
              onFocus={() => setPinned(i)}
              onClick={() => setPinned(i)}
              className={`h-4 w-4 rounded-full border transition-transform duration-200 hover:scale-125 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue ${
                colorIndex === i && (hovering || pinned !== null) ? 'scale-125 border-ink' : 'border-ink/15'
              }`}
              style={{ background: c.hex ?? '#C9C9C9' }}
            />
          ))}
          {colors.length > MAX_DOTS && (
            <span className="ml-1 text-[0.75rem] text-muted">+{colors.length - MAX_DOTS}</span>
          )}
        </div>
      )}
    </article>
  );
}
