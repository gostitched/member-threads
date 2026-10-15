'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import GarmentArt from './GarmentArt';
import ProductMedia, { galleryOf } from './ProductMedia';
import type { CatalogProduct } from '@/lib/catalog/types';
import { formatMoney, garmentKind, entryPrice, paintOf } from '@/lib/catalog/util';

/**
 * The top of a product page: the stage, and everything you would choose.
 *
 * Choosing a colourway repaints the drawing (and, with photos, marks the choice);
 * the thumbnails under an unphotographed product are the colourways themselves, so
 * the gallery doubles as the colour picker.
 */
export default function ProductView({ product }: { product: CatalogProduct }) {
  const gallery = galleryOf(product);
  const photographed = gallery.length > 0;
  const [colorIndex, setColorIndex] = useState(0);
  const [imageIndex, setImageIndex] = useState(0);
  const colorway = product.colorways[colorIndex];

  // A colorway locked on the rack arrives as ?color=<index>. Read after hydration.
  useEffect(() => {
    const n = Number(new URLSearchParams(window.location.search).get('color'));
    if (Number.isInteger(n) && n > 0 && n < product.colorways.length) setColorIndex(n);
  }, [product.colorways.length]);
  const price = entryPrice(product);
  const kind = garmentKind(product);
  // The dashboard's description is plain text with blank lines between paragraphs.
  const paragraphs = (product.description ?? '').split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean);

  return (
    <div className="grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
      {/* ── Stage ───────────────────────────────────────────────────────── */}
      {/* min-w-0 on both columns: a grid item defaults to min-width:auto, so the
          scrolling thumbnail strip would otherwise widen the column past the screen. */}
      <div className="min-w-0 lg:sticky lg:top-[108px] lg:self-start">
        <div className="relative aspect-square overflow-hidden rounded-[28px] bg-cream">
          <div className="absolute inset-[9%]">
            <ProductMedia product={product} imageIndex={imageIndex} colorIndex={colorIndex} size="full" priority />
          </div>
          {product.styleNumber && <span className="label absolute left-6 top-6 text-ink/60">{product.styleNumber}</span>}
          {colorway && <span className="label absolute bottom-6 left-6 text-ink/60">{colorway.name}</span>}
          {product.sticker && (
            <span className="label absolute right-6 top-6 rounded-full bg-paper px-3 py-1.5 text-ink">{product.sticker}</span>
          )}
        </div>

        {/* One thumbnail is a picture of the picture above it; the strip starts at two. */}
        {(photographed ? gallery.length : product.colorways.length) > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {photographed
            ? gallery.map((img, i) => (
                <button
                  key={img.url}
                  type="button"
                  onClick={() => setImageIndex(i)}
                  aria-label={`Show image ${i + 1}`}
                  aria-pressed={imageIndex === i}
                  className={`h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-white p-2 transition-opacity ${imageIndex === i ? 'ring-2 ring-ink' : 'opacity-70 ring-1 ring-rule hover:opacity-100'}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.thumbUrl} alt="" className="h-full w-full object-contain mix-blend-multiply" />
                </button>
              ))
            : product.colorways.map((c, i) => (
                <button
                  key={`${c.name}-${i}`}
                  type="button"
                  onClick={() => setColorIndex(i)}
                  aria-label={c.name}
                  aria-pressed={colorIndex === i}
                  className={`h-20 w-20 shrink-0 rounded-2xl bg-cream p-2 transition-opacity ${colorIndex === i ? 'ring-[1.5px] ring-ink' : 'opacity-70 hover:opacity-100'}`}
                >
                  <GarmentArt kind={kind} color={paintOf(c)} className="h-full w-full" />
                </button>
              ))}
        </div>
        )}
      </div>

      {/* ── Choices ─────────────────────────────────────────────────────── */}
      {/* A column as tall as the stage, so the label sits on its top edge and the
          quote button's note on its bottom edge. */}
      <div className="min-w-0 lg:flex lg:flex-col">
        <p className="label text-muted">
          {[product.styleNumber, product.category].filter(Boolean).join(' · ')}
        </p>
        <h1 className="caps mt-4 text-[clamp(2.25rem,3.9vw,3.5rem)] leading-[0.95] [overflow-wrap:anywhere]">{product.name}</h1>
        <p className="mt-5 text-[1.25rem] font-semibold tabular-nums text-ink">
          {price ? `From ${formatMoney(price.cents, price.currency).replace(/\.00$/, '')}` : 'Priced with your collection'}
          <span className="ml-2 text-[0.9375rem] font-normal text-muted">
            per piece{product.minimumOrderQuantity ? ` at ${product.minimumOrderQuantity}` : ''}, design and decoration included
          </span>
        </p>
        {paragraphs.length > 0 && (
          <div className="mt-6 max-w-[52ch] space-y-4 border-t border-rule pt-6 text-lead text-ink/75">
            {paragraphs.map((para) => (
              <p key={para}>{para}</p>
            ))}
          </div>
        )}

        {product.colorways.length > 0 && (
          <section className="mt-8" aria-labelledby="colourways">
            <h2 id="colourways" className="flex items-baseline gap-3">
              <span className="label text-muted">Color</span>
              <span className="text-[0.9375rem] font-semibold text-ink">{colorway?.name}</span>
            </h2>
            {/* 32px round chips; the chosen one is ringed in ink. 44px hit area. */}
            <div className="mt-3 flex flex-wrap gap-1">
              {product.colorways.map((c, i) => (
                <button
                  key={`${c.name}-${i}`}
                  type="button"
                  onClick={() => setColorIndex(i)}
                  aria-label={c.name}
                  aria-pressed={colorIndex === i}
                  title={c.name}
                  className="group flex h-11 w-11 items-center justify-center rounded-full"
                >
                  <span
                    className={`block h-8 w-8 rounded-full transition-shadow duration-200 ${
                      colorIndex === i
                        ? 'shadow-[0_0_0_2px_theme(colors.paper),0_0_0_4px_theme(colors.ink)]'
                        : 'shadow-[inset_0_0_0_1px_theme(colors.ink/15%)] group-hover:shadow-[0_0_0_2px_theme(colors.paper),0_0_0_4px_theme(colors.ink/30%)]'
                    }`}
                    style={{ background: paintOf(c) }}
                  />
                </button>
              ))}
            </div>
          </section>
        )}

        {product.decorationMethods.length > 0 && (
          <section className="mt-7" aria-labelledby="finishes">
            <h2 id="finishes" className="label text-muted">
              Finishes
            </h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {product.decorationMethods.map((m) => (
                <li key={m} className="rounded-full bg-cream px-3.5 py-1.5 text-[0.8125rem] font-medium text-ink">
                  {m}
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className="mt-10 lg:mt-auto lg:pt-10">
          <div className="flex flex-wrap gap-3">
            <Link href="/quote" className="btn-blue">
              Start a collection <span aria-hidden>→</span>
            </Link>
            {Object.keys(product.sizeChart).length > 0 && (
              <a href="#size-chart" className="btn-outline">
                Size chart
              </a>
            )}
            {product.sizeGuideUrl && Object.keys(product.sizeChart).length === 0 && (
              <a href={product.sizeGuideUrl} target="_blank" rel="noopener noreferrer" className="btn-outline">
                Size guide
              </a>
            )}
          </div>
          <p className="mt-4 text-[0.8125rem] text-muted">
            {product.minimumOrderQuantity ? `Minimum ${product.minimumOrderQuantity} pieces, sizes mixed freely. ` : ''}
            No setup fees, no upcharges for customization.
          </p>
        </div>
      </div>
    </div>
  );
}
