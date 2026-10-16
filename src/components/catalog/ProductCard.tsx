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
      // No border, no card: the cream plate is the field, the grid's gap does the spacing.
      className={`group relative flex h-full flex-col ${featured ? 'lg:col-span-2 lg:row-span-2' : ''}`}
      onPointerEnter={(e) => e.pointerType === 'mouse' && setHovering(true)}
      onPointerLeave={() => {
        setHovering(false);
        setPinned(null);
        setCycle(0);
      }}
    >
      <Link href={`/catalog/${product.slug}`} className="flex flex-1 flex-col outline-none">
        <div className="ct-plate is-stitchable aspect-[4/5] group-focus-visible:outline group-focus-visible:outline-2 group-focus-visible:outline-offset-2 group-focus-visible:outline-[var(--focus)]">
          {/* Photo or drawing, the same inset either way. A second photo crossfades in
              on hover; a lone photo or a drawing lifts slightly instead. */}
          <div
            className={`absolute inset-[12%] transition-[transform,opacity] duration-[900ms] ease-out group-hover:-translate-y-1 group-hover:scale-[1.025] motion-reduce:transition-none ${
              gallery[1] ? 'group-hover:opacity-0' : ''
            }`}
          >
            <ProductMedia product={product} colorIndex={colorIndex} size={featured ? 'full' : 'thumb'} />
          </div>
          {photographed && gallery[1] && (
            <div className="absolute inset-[12%] opacity-0 transition-opacity duration-[420ms] ease-out group-hover:opacity-100">
              <ProductMedia product={product} imageIndex={1} size={featured ? 'full' : 'thumb'} />
            </div>
          )}

          <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-4 sm:p-5">
            <span className="t-spec fg-muted">{product.styleNumber}</span>
            {product.sticker && <span className="woven">{product.sticker}</span>}
          </div>

          {colors[colorIndex] && (
            <span
              className="t-spec fg-muted pointer-events-none absolute bottom-4 left-4 translate-y-1 opacity-0 transition-[opacity,transform] duration-[180ms] group-hover:translate-y-0 group-hover:opacity-100 sm:bottom-5 sm:left-5"
              aria-hidden
            >
              {colors[colorIndex].name}
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col pt-4">
          {product.category && <p className="t-spec fg-muted">{product.category}</p>}
          <h3 className={`mt-1.5 ${featured ? 't-h2' : 't-h3'}`}>
            <span className="link-u bg-[length:0%_1px] transition-[background-size] duration-[420ms] ease-[cubic-bezier(0.7,0,0.2,1)] group-hover:bg-[length:100%_1px]">
              {product.name}
            </span>
          </h3>
          <p className="t-spec mt-2.5">
            {price ? (
              <>
                <span className="fg-muted">From </span>
                <span className="num">{formatMoney(price.cents, price.currency)}</span>
              </>
            ) : (
              <span className="fg-muted">Priced with your collection</span>
            )}
          </p>
          {featured && product.description && <p className="t-body mt-3 max-w-measure">{product.description}</p>}
        </div>
      </Link>

      {colors.length > 1 && (
        <div className="-ml-[13px] flex flex-wrap items-center pt-1" role="group" aria-label={`${product.name} colorways`}>
          {colors.slice(0, MAX_DOTS).map((c, i) => (
            <button
              key={`${c.name}-${i}`}
              type="button"
              title={c.name}
              aria-label={`Preview ${c.name}`}
              aria-pressed={colorIndex === i && (hovering || pinned !== null)}
              onPointerEnter={() => setPinned(i)}
              onFocus={() => setPinned(i)}
              onClick={() => setPinned(i)}
              className="ct-sw !h-11 !w-11 [&>i]:!h-3.5 [&>i]:!w-3.5"
            >
              <i style={{ background: c.hex ?? '#C9C9C9' }} />
            </button>
          ))}
          {colors.length > MAX_DOTS && <span className="t-spec fg-muted ml-1">+{colors.length - MAX_DOTS}</span>}
        </div>
      )}
    </article>
  );
}
