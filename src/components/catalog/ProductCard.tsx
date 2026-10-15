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
      className={`group relative flex h-full flex-col overflow-hidden rounded-3xl bg-white ring-1 ring-rule ${featured ? 'lg:col-span-2 lg:row-span-2' : ''}`}
      onPointerEnter={(e) => e.pointerType === 'mouse' && setHovering(true)}
      onPointerLeave={() => {
        setHovering(false);
        setPinned(null);
        setCycle(0);
      }}
    >
      <Link href={`/catalog/${product.slug}`} className="flex flex-1 flex-col focus-visible:outline-none">
        <div className="relative aspect-square overflow-hidden">
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

          <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-4">
            <span />
            {product.sticker && (
              <span className="rounded-full bg-uv-lit px-3 py-1.5 text-[0.75rem] font-semibold text-ink">{product.sticker}</span>
            )}
          </div>

          {colors[colorIndex] && (
            <span
              className="pointer-events-none absolute bottom-4 left-4 translate-y-2 rounded-full bg-ink/5 px-3 py-1.5 text-[0.75rem] font-semibold text-ink opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100"
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

        <div className="flex flex-1 flex-col gap-3 p-5 sm:p-6">
          <div className="flex items-baseline justify-between gap-4">
            <h3 className={`font-semibold tracking-tight ${featured ? 'text-d3' : 'text-[1.125rem]'} group-hover:text-electric-deep`}>
              {product.name}
            </h3>
            {price ? (
              <p className="shrink-0 text-[0.9375rem] tabular-nums">
                <span className="text-muted">from </span>
                {formatMoney(price.cents, price.currency)}
              </p>
            ) : (
              <p className="shrink-0 text-[0.8125rem] text-muted">In collection</p>
            )}
          </div>
          {featured && product.description && (
            <p className="max-w-measure text-[0.9375rem] leading-relaxed text-muted">{product.description}</p>
          )}
        </div>
      </Link>

      {colors.length > 0 && (
        <div className="flex items-center gap-1.5 px-5 pb-5 sm:px-6 sm:pb-6" role="group" aria-label={`${product.name} colorways`}>
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
              className={`h-5 w-5 rounded-full border transition-transform duration-200 hover:scale-125 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue ${
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
