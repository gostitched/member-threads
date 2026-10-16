'use client';

import Link from 'next/link';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import GarmentArt from './GarmentArt';
import PriceEstimator from './PriceEstimator';
import ProductMedia, { galleryOf } from './ProductMedia';
import type { CatalogProduct } from '@/lib/catalog/types';
import { entryPrice, flatBreaks, formatMoney, garmentKind, paintOf } from '@/lib/catalog/util';

const useIso = typeof window === 'undefined' ? useEffect : useLayoutEffect;

function Arrow() {
  return (
    <svg width="18" height="12" viewBox="0 0 18 12" fill="none" aria-hidden>
      <path d="M0 6h16M11 1l5 5-5 5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

/** Open the size chart's <details> on the way to it. */
function openSizeChart() {
  const d = document.getElementById('size-chart')?.querySelector('details');
  if (d) d.open = true;
}

/**
 * The top of a product page: the plates, and everything you would choose.
 *
 * Desktop: the gallery runs down columns 1–7 (a 2:3 plate of the piece, then the
 * line sheet of every colorway); the info column (9–12) sticks beside it. When the
 * info column is taller than the window it sticks by its bottom edge instead, so the
 * estimate and the button are never stranded below the fold.
 * Mobile: the plates are a horizontal snap strip, then the info.
 *
 * Choosing a colourway repaints the drawing. With photos, it only marks the choice.
 */
export default function ProductView({ product }: { product: CatalogProduct }) {
  const gallery = galleryOf(product);
  const photographed = gallery.length > 0;
  const [colorIndex, setColorIndex] = useState(0);
  const [imageIndex, setImageIndex] = useState(0);
  const colorway = product.colorways[colorIndex];
  const infoRef = useRef<HTMLDivElement>(null);
  const [stickTop, setStickTop] = useState<number | null>(null);

  // A colorway held on the rack arrives as ?color=<index>. Read after hydration.
  useEffect(() => {
    const n = Number(new URLSearchParams(window.location.search).get('color'));
    if (Number.isInteger(n) && n > 0 && n < product.colorways.length) setColorIndex(n);
  }, [product.colorways.length]);

  // Sticky by the top when the column fits the window, by the bottom when it doesn't.
  useIso(() => {
    const el = infoRef.current;
    if (!el) return;
    const measure = () => {
      const head = document.querySelector<HTMLElement>('body header')?.getBoundingClientRect().height ?? 72;
      const top = head + 32;
      const fit = window.innerHeight - el.offsetHeight - 32;
      setStickTop(Math.min(top, fit));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, []);

  const price = entryPrice(product);
  const breaks = flatBreaks(product.pricing);
  const kind = garmentKind(product);
  const hasChart = Object.keys(product.sizeChart).length > 0;
  // The dashboard's description is plain text with blank lines between paragraphs.
  const lead = (product.description ?? '').split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean)[0];
  const many = product.colorways.length > 1;
  const plateSpec = (
    [
      ['Weight', product.gsm ? `${product.gsm} gsm` : null],
      ['Colorways', product.colorways.length ? String(product.colorways.length).padStart(2, '0') : null],
      ['Minimum', product.minimumOrderQuantity ? `${product.minimumOrderQuantity} pieces` : null],
    ] as Array<[string, string | null]>
  ).filter((r): r is [string, string] => Boolean(r[1]));

  return (
    <div className="grid-12 gap-y-12">
      {/* ── Plates ──────────────────────────────────────────────────────── */}
      <div className="col-span-4 min-w-0 sm:col-span-8 lg:col-span-7">
        <div className="ct-strip lg:grid lg:gap-8">
          {/* I. The piece. */}
          <figure className="min-w-0">
            <div className="ct-plate aspect-[4/5] lg:aspect-[2/3]">
              <div className="absolute inset-x-[8%] bottom-[16%] top-[10%] lg:inset-x-[6%] lg:bottom-[24%] lg:top-[14%]">
                <ProductMedia product={product} imageIndex={imageIndex} colorIndex={colorIndex} size="full" priority />
              </div>
              <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-4 sm:p-6">
                <span className="t-spec fg-muted">Plate I</span>
                <span className="t-spec fg-muted">Front</span>
              </div>
              {product.sticker && <span className="woven absolute right-4 top-12 sm:right-6">{product.sticker}</span>}
              {/* The tech-pack line along the foot of the plate. */}
              {plateSpec.length > 0 && (
                <dl className="absolute inset-x-0 bottom-0 hidden grid-cols-3 border-t border-[var(--rule-c)] lg:grid">
                  {plateSpec.map(([k, v], i) => (
                    <div key={k} className={`px-6 pb-12 pt-4 ${i ? 'border-l border-[var(--rule-c)]' : ''}`}>
                      <dt className="t-spec fg-muted">{k}</dt>
                      <dd className="t-spec mt-1.5 text-ink">{v}</dd>
                    </div>
                  ))}
                </dl>
              )}
            </div>
            {/* The label sits across the plate's bottom edge, as a label crosses a seam. */}
            <div className="relative z-[1] -mt-[17px] flex items-center pl-4 sm:pl-6">
              <span className="woven-green woven woven-lg">
                {product.styleNumber && <span>{product.styleNumber}</span>}
                {product.styleNumber && colorway && <span aria-hidden>·</span>}
                {colorway && (
                  <span key={colorway.name} className="ct-tick">
                    {colorway.name}
                  </span>
                )}
              </span>
            </div>
          </figure>

          {/* II. The line sheet: every colorway at once. Picks the colour, too. */}
          {!photographed && many && (
            <figure className="min-w-0">
              <div className="ct-plate flex aspect-[4/5] flex-col p-4 sm:p-6">
                <div className="flex items-start justify-between">
                  <span className="t-spec fg-muted">Plate II</span>
                  <span className="t-spec fg-muted">Line sheet · {product.colorways.length} colorways</span>
                </div>
                <div
                  className="mt-4 grid min-h-0 flex-1 auto-rows-fr grid-cols-2 gap-x-2 gap-y-3"
                  role="group"
                  aria-label="Colorways"
                >
                  {product.colorways.map((c, i) => (
                    <button
                      key={`${c.name}-${i}`}
                      type="button"
                      onClick={() => setColorIndex(i)}
                      aria-pressed={colorIndex === i}
                      className={`group/c relative flex min-h-0 flex-col items-center justify-center gap-2 transition-opacity duration-[180ms] ${
                        colorIndex === i ? '' : 'opacity-80 hover:opacity-100'
                      }`}
                    >
                      <GarmentArt kind={kind} color={paintOf(c)} className="h-[78%] w-full min-h-0" />
                      <span
                        className={`t-spec flex items-center gap-1.5 ${colorIndex === i ? 'text-ink' : 'fg-muted'}`}
                      >
                        <i
                          aria-hidden
                          className={`block h-1.5 w-1.5 rounded-full bg-ink transition-transform duration-[180ms] ${
                            colorIndex === i ? 'scale-100' : 'scale-0'
                          }`}
                        />
                        {c.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </figure>
          )}

          {photographed && gallery.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {gallery.map((img, i) => (
                <button
                  key={img.url}
                  type="button"
                  onClick={() => setImageIndex(i)}
                  aria-label={`Show image ${i + 1}`}
                  aria-pressed={imageIndex === i}
                  className={`ct-plate h-20 w-20 shrink-0 p-2 ${imageIndex === i ? 'outline outline-1 outline-ink' : 'opacity-70 hover:opacity-100'}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.thumbUrl} alt="" className="h-full w-full object-contain mix-blend-multiply" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Choices ─────────────────────────────────────────────────────── */}
      <div
        ref={infoRef}
        className="col-span-4 min-w-0 sm:col-span-8 lg:sticky lg:col-span-4 lg:col-start-9 lg:self-start"
        style={{ top: stickTop ?? 120 }}
      >
        <div>
          <p className="t-spec fg-muted">{[product.styleNumber, product.category].filter(Boolean).join(' · ')}</p>
          <h1 className="t-h1 mt-4 [overflow-wrap:anywhere] lg:text-[clamp(2.5rem,3.6vw,3.75rem)]">{product.name}</h1>
          <p className="mt-5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="t-h3 num">
              {price ? `From ${formatMoney(price.cents, price.currency)}` : 'Priced with your collection'}
            </span>
            {price && (
              <span className="t-spec fg-muted">
                per piece{product.minimumOrderQuantity ? ` at ${product.minimumOrderQuantity}` : ''}
              </span>
            )}
          </p>
          {lead && <p className="t-lead mt-6 text-[1.1875rem] sm:text-[1.25rem]">{lead}</p>}

          {product.colorways.length > 0 && (
            <section className="mt-8 border-t border-[var(--rule-c)] pt-5" aria-labelledby="ct-colour">
              <div className="flex items-baseline justify-between gap-4">
                <h2 id="ct-colour" className="t-eyebrow">
                  Color
                </h2>
                <p className="t-spec" aria-live="polite">
                  {colorway?.name}
                </p>
              </div>
              <div className="-ml-[7px] mt-2 flex flex-wrap" role="radiogroup" aria-labelledby="ct-colour">
                {product.colorways.map((c, i) => (
                  <button
                    key={`${c.name}-${i}`}
                    type="button"
                    role="radio"
                    aria-checked={colorIndex === i}
                    tabIndex={colorIndex === i ? 0 : -1}
                    onClick={() => setColorIndex(i)}
                    onKeyDown={(e) => {
                      const d = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
                      if (!d) return;
                      e.preventDefault();
                      const n = (colorIndex + d + product.colorways.length) % product.colorways.length;
                      setColorIndex(n);
                      (e.currentTarget.parentElement?.children[n] as HTMLElement | undefined)?.focus();
                    }}
                    aria-label={c.name}
                    title={c.name}
                    className="ct-sw"
                  >
                    <i style={{ background: paintOf(c) }} />
                  </button>
                ))}
              </div>
            </section>
          )}

          {product.decorationMethods.length > 0 && (
            <section className="mt-6 border-t border-[var(--rule-c)] pt-5" aria-labelledby="ct-finishes">
              <h2 id="ct-finishes" className="t-eyebrow">
                Finishes
              </h2>
              <ul className="mt-3 flex flex-wrap gap-1.5">
                {product.decorationMethods.map((m) => (
                  <li key={m} className="tag">
                    {m}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {breaks.length > 0 && (
            <section className="mt-8" id="estimate">
              <PriceEstimator breaks={breaks} minimum={product.minimumOrderQuantity} />
            </section>
          )}

          <Link href="/quote" className="btn-blue mt-8 w-full justify-between">
            Start a collection <Arrow />
          </Link>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-x-6">
            {hasChart ? (
              <a href="#size-chart" onClick={openSizeChart} className="t-small inline-flex min-h-[44px] items-center">
                <span className="link-u">Size chart</span>
              </a>
            ) : product.sizeGuideUrl ? (
              <a href={product.sizeGuideUrl} target="_blank" rel="noopener noreferrer" className="t-small inline-flex min-h-[44px] items-center">
                <span className="link-u">Size guide</span>
              </a>
            ) : null}
            <p className="t-spec fg-muted">No setup fees · No upcharges</p>
          </div>
        </div>
      </div>
    </div>
  );
}
