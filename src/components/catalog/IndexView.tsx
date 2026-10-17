'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import ProductMedia from './ProductMedia';
import type { CatalogProduct } from '@/lib/catalog/types';
import { formatMoney, leadTimeLabel, entryPrice } from '@/lib/catalog/util';

const DASH = '—';

interface Column {
  key: string;
  label: string;
  align?: 'right';
  /** True when this product has something to show in the column. */
  has: (p: CatalogProduct) => boolean;
  cell: (p: CatalogProduct) => React.ReactNode;
}

/**
 * The columns, each able to say whether a product fills it. A column no product fills
 * is dropped rather than drawn as a stack of dashes — the table shows what the catalog
 * actually specifies, and grows columns as the dashboard fills them in.
 */
const COLUMNS: Column[] = [
  {
    key: 'style',
    label: 'No.',
    has: (p) => Boolean(p.styleNumber),
    cell: (p) => <span className="t-spec fg-muted">{p.styleNumber ?? DASH}</span>,
  },
  {
    key: 'fabric',
    label: 'Fabric',
    has: (p) => Boolean(p.fabric),
    cell: (p) => <span className="t-small text-ink/85">{p.fabric ?? DASH}</span>,
  },
  {
    key: 'weight',
    label: 'Weight',
    has: (p) => Boolean(p.gsm),
    cell: (p) => <span className="t-spec">{p.gsm ? `${p.gsm} gsm` : DASH}</span>,
  },
  {
    key: 'moq',
    label: 'Minimum',
    has: (p) => Boolean(p.minimumOrderQuantity),
    cell: (p) => <span className="t-spec">{p.minimumOrderQuantity ?? DASH}</span>,
  },
  {
    key: 'lead',
    label: 'Lead time',
    has: (p) => Boolean(p.leadTimeDays),
    cell: (p) => <span className="t-spec">{leadTimeLabel(p) ?? DASH}</span>,
  },
  {
    key: 'colours',
    label: 'Colorways',
    has: (p) => p.colorways.length > 0,
    cell: (p) =>
      p.colorways.length ? (
        <span className="flex items-center gap-1.5">
          <span className="sr-only">{p.colorways.map((c) => c.name).join(', ')}</span>
          {p.colorways.slice(0, 8).map((c, i) => (
            <span
              key={i}
              aria-hidden
              title={c.name}
              className="h-3.5 w-3.5 rounded-full shadow-[inset_0_0_0_1px_rgba(19,51,39,0.16)]"
              style={{ background: c.hex ?? '#C9C9C9' }}
            />
          ))}
        </span>
      ) : (
        DASH
      ),
  },
  {
    key: 'price',
    label: 'From, at 36',
    align: 'right',
    has: (p) => Boolean(entryPrice(p)),
    cell: (p) => {
      const price = entryPrice(p);
      return price ? (
        <span className="t-spec num text-[13px]">{formatMoney(price.cents, price.currency)}</span>
      ) : (
        <span className="t-spec fg-muted">With collection</span>
      );
    },
  },
];

/**
 * The catalog as a spec sheet: one row per piece, the numbers a buyer compares side by
 * side. With a mouse, the product floats beside the cursor as you run down the list,
 * so the table never feels like a spreadsheet with the pictures removed.
 */
export default function IndexView({ products }: { products: CatalogProduct[] }) {
  const router = useRouter();
  const [preview, setPreview] = useState<CatalogProduct | null>(null);
  const floater = useRef<HTMLDivElement>(null);
  // A column every style answers the same way (minimum, lead time) is said once in
  // the page header instead of repeated down the table.
  const uniform = (key: string, of: (p: CatalogProduct) => unknown) =>
    COLUMNS.some((c) => c.key === key) && new Set(products.map((p) => JSON.stringify(of(p)))).size <= 1;
  const same: Record<string, boolean> = {
    moq: uniform('moq', (p) => p.minimumOrderQuantity),
    lead: uniform('lead', (p) => p.leadTimeDays),
  };
  const columns = COLUMNS.filter((c) => products.some(c.has) && !(products.length > 1 && same[c.key]));
  // Style number sits before the name; everything else after it.
  const styleCol = columns.find((c) => c.key === 'style');
  const restCols = columns.filter((c) => c.key !== 'style');

  function follow(e: React.PointerEvent) {
    if (e.pointerType !== 'mouse' || !floater.current) return;
    floater.current.style.transform = `translate3d(${e.clientX + 28}px, ${e.clientY - 110}px, 0)`;
  }

  return (
    <div className="relative" onPointerMove={follow} onPointerLeave={() => setPreview(null)}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] border-collapse text-left">
          <thead>
            <tr className="border-b border-ink">
              {styleCol && <th scope="col" className="t-eyebrow fg-muted w-[5.5rem] py-3 pr-4 font-semibold">{styleCol.label}</th>}
              <th scope="col" className="t-eyebrow fg-muted py-3 pr-4 font-semibold">Style</th>
              {restCols.map((c) => (
                <th
                  key={c.key}
                  scope="col"
                  className={`t-eyebrow fg-muted py-3 pr-4 font-semibold last:pr-0 ${c.align === 'right' ? 'text-right' : ''}`}
                >
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr
                key={p.slug}
                onPointerEnter={(e) => e.pointerType === 'mouse' && setPreview(p)}
                onClick={() => router.push(`/catalog/${p.slug}`)}
                className="group cursor-pointer border-b border-[var(--rule-c)] transition-colors duration-[180ms] hover:bg-cream"
              >
                {styleCol && <td className="py-5 pr-4 align-baseline">{styleCol.cell(p)}</td>}
                <td className="py-5 pr-4 align-baseline">
                  <Link
                    href={`/catalog/${p.slug}`}
                    onClick={(e) => e.stopPropagation()}
                    className="t-h3 inline-block transition-transform duration-[180ms] ease-out group-hover:translate-x-2 motion-reduce:transform-none"
                  >
                    {p.name}
                  </Link>
                  {p.category && <span className="t-spec fg-muted ml-3 hidden whitespace-nowrap sm:inline">{p.category}</span>}
                </td>
                {restCols.map((c) => (
                  <td
                    key={c.key}
                    className={`py-5 pr-4 align-baseline last:pr-0 ${c.align === 'right' ? 'text-right' : ''} ${
                      c.key === 'fabric' ? 'max-w-[220px]' : ''
                    }`}
                  >
                    {c.cell(p)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* The floating preview. Fixed-position and pointer-transparent; mouse only. */}
      <div
        ref={floater}
        aria-hidden
        className={`ct-plate pointer-events-none fixed left-0 top-0 z-30 hidden aspect-[4/5] w-56 transition-opacity duration-[180ms] lg:block ${
          preview ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {preview && (
          <>
            <div className="absolute inset-[12%]">
              <ProductMedia product={preview} />
            </div>
            <span className="t-spec fg-muted absolute left-3 top-3">{preview.styleNumber}</span>
          </>
        )}
      </div>
    </div>
  );
}
