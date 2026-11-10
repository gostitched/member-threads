'use client';

import Link from 'next/link';
import Dropdown from '@/components/Dropdown';
import { Arrow } from '@/components/SiteHeader';
import { useEffect, useMemo, useRef, useState } from 'react';
import GarmentArt from './GarmentArt';
import { galleryOf } from './ProductMedia';
import type { CatalogProduct } from '@/lib/catalog/types';
import { garmentKind } from '@/lib/catalog/util';
import './collection-builder.css';

/**
 * The catalog: every piece the dashboard publishes to this site, grouped and tinted by
 * kind, each on a square plate. Visitors add pieces to a tray and
 * take the list to the quote form. Each tile still opens its piece page. A photo that
 * fails to load falls back to its drawing.
 */

/**
 * Tints, all from the board: cream, oat, and beige, green and dusty blue let down with
 * paper. Quiet enough that the drawing (or the photo) carries the tile.
 */
const GROUPS: { label: string; tint: string; cats: string[] }[] = [
  { label: 'Hoodies & Crewnecks', tint: '#EEE6D9', cats: ['Hoodies', 'Zip Hoodies', 'Crewnecks', 'Quarter Zips', 'Track Jackets'] },
  { label: 'Tees & Tanks', tint: '#E4DACA', cats: ['T-Shirts', 'Baby Tees', 'Long Sleeve T-Shirts', 'Tank Tops', 'Crop Tops'] },
  { label: 'Jerseys & Polos', tint: '#E1D6C8', cats: ['Jerseys', 'Polos'] },
  { label: 'Sweats & Leggings', tint: '#DDDCD3', cats: ['Sweatpants', 'Track Pants', 'Leggings'] },
  { label: 'Shorts & Skirts', tint: '#DFDCD5', cats: ['Athletic Shorts', 'Sweatshorts', 'Skirts'] },
  { label: 'Loungewear', tint: '#E9E2D6', cats: ['Loungewear'] },
  { label: 'Hats', tint: '#EEE6D9', cats: ['Hats'] },
];
/** Anything the dashboard adds in a category we haven't grouped yet still shows up. */
const OTHER = { label: 'More Pieces', tint: '#EAE4D9' };

function groupsOf(products: CatalogProduct[]) {
  const known = new Set(GROUPS.flatMap((g) => g.cats));
  const out = GROUPS.map((g) => ({ label: g.label, tint: g.tint, items: products.filter((p) => g.cats.includes(p.category ?? '')) }));
  out.push({ ...OTHER, items: products.filter((p) => !known.has(p.category ?? '')) });
  return out.filter((g) => g.items.length > 0);
}

function Picture({ product, color }: { product: CatalogProduct; color: string }) {
  const [failed, setFailed] = useState(false);
  const img = useRef<HTMLImageElement>(null);
  const image = galleryOf(product)[0];
  // An image can fail before the page hydrates, when onError isn't listening yet.
  useEffect(() => {
    if (img.current?.complete && !img.current.naturalWidth) setFailed(true);
  }, []);
  if (image && !failed) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img ref={img} src={image.thumbUrl} alt="" loading="lazy" decoding="async" onError={() => setFailed(true)} className="h-full w-full object-contain mix-blend-multiply" />;
  }
  return <GarmentArt kind={garmentKind(product)} color={color} className="h-full w-full" />;
}

export default function CollectionBuilder({ products }: { products: CatalogProduct[] }) {
  const groups = useMemo(() => groupsOf(products), [products]);
  const [value, setValue] = useState('');
  const shown = useMemo(() => {
    const gs = value ? groups.filter((g) => g.label === value) : groups;
    return gs.flatMap((g) => g.items.map((product) => ({ product, tint: g.tint })));
  }, [groups, value]);

  const [picked, setPicked] = useState<string[]>([]);
  const toggle = (slug: string) => setPicked((all) => (all.includes(slug) ? all.filter((s) => s !== slug) : [...all, slug]));
  const chosen = picked.map((slug) => products.find((p) => p.slug === slug)).filter((p): p is CatalogProduct => !!p);
  const quote = `/quote?piece=${encodeURIComponent(chosen.map((p) => p.name).join(', '))}`;

  return (
    <div className={chosen.length ? 'pb-28' : ''}>
      <header className="pb-6 pt-6 lg:pt-0">
        <h1 className="t-h1">
          Build your <em>collection.</em>
        </h1>
        <p className="t-lead mt-4 max-w-[52ch] text-balance">
          Add the pieces you want. Your designer turns them into one collection.
        </p>
      </header>

      <div className="relative flex flex-wrap items-center gap-2 pb-5">
        <Dropdown
          label="Filter by piece"
          all="All Pieces"
          value={value}
          onChange={setValue}
          options={groups.map((g) => ({ value: g.label, label: g.label, count: g.items.length }))}
        />
        <p role="status" className="t-spec num ml-auto whitespace-nowrap text-muted">
          {shown.length} {shown.length === 1 ? 'piece' : 'pieces'}
        </p>
      </div>

      <ul className="cb-grid">
        {shown.map(({ product, tint }) => {
          const on = picked.includes(product.slug);
          return (
            <li key={product.slug} className="relative">
              <Link href={`/catalog/${product.slug}`} className="cb-tile">
                <span className="cb-tile-pic" style={{ background: tint }}>
                  <Picture product={product} color={tint} />
                </span>
                <span className="cb-tile-name">{product.name}</span>
              </Link>
              <button
                type="button"
                aria-pressed={on}
                aria-label={`${on ? 'Remove' : 'Add'} ${product.name}`}
                onClick={() => toggle(product.slug)}
                className={`cb-add ${on ? 'is-on' : ''}`}
              >
                <svg aria-hidden viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
                  {on ? <path d="m3 8.5 3.2 3.2L13 5" /> : <path d="M8 3v10M3 8h10" />}
                </svg>
              </button>
            </li>
          );
        })}
      </ul>

      {chosen.length > 0 && (
        <aside aria-label="Your collection" className="cb-tray">
          <p className="t-spec whitespace-nowrap">
            {chosen.length} {chosen.length === 1 ? 'piece' : 'pieces'}
          </p>
          <ul className="cb-tray-list">
            {chosen.map((p) => (
              <li key={p.slug}>
                <button type="button" onClick={() => toggle(p.slug)} aria-label={`Remove ${p.name}`} className="cb-tray-pic">
                  <Picture product={p} color="#F4EFE6" />
                </button>
              </li>
            ))}
          </ul>
          <Link href={quote} className="btn-white btn-sm shrink-0">
            Start this collection <Arrow className="h-3 w-4" />
          </Link>
        </aside>
      )}
    </div>
  );
}
