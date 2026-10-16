'use client';

import Link from 'next/link';
import { useLayoutEffect, useRef, useState } from 'react';
import WorkArt from '@/components/work/art';
import { register } from '@/lib/reveal';
import { YOUR_NAME, useOrgName } from '@/lib/name';
import { ACT3, initial, lockup, type Piece } from '@/lib/chapter';
import type { Deco, Drawn } from '@/lib/work';

/**
 * Act 02, one row on paper: the question and our answer (cols 1–4), then three
 * pieces from one collection on square cream and beige plates (cols 6–12),
 * staggered down the grid like a contact sheet, each carrying the
 * organization's name the way that garment would. Phones swipe the plates.
 */

const PLATE: Record<Piece['plate'], string> = {
  cream: 'bg-cream',
  beige: 'bg-beige',
  dusty: 'bg-dusty',
  green: 'bg-green',
};

/** Vertical offsets on desktop: a stagger, so the row reads as laid out by hand. */
const OFFSET = ['lg:mt-0', 'lg:mt-24', 'lg:mt-12'];

/** The organization's name, set on a piece the way that garment would carry it. */
function decoFor(p: Piece, name: string): Deco {
  const upper = name.toUpperCase();
  switch (p.deco) {
    case 'crest':
      return { t: 'crest', letter: initial(name), ground: p.ink2 ?? p.color, ink: p.ink, words: upper };
    case 'script':
      return { t: 'type', lines: [name], face: 'script', tech: 'embroidery', ink: p.ink };
    case 'varsity':
      return { t: 'type', lines: lockup(name).filter(Boolean), face: 'varsity', tech: 'embroidery', ink: p.ink, ink2: p.ink2, arch: true };
    case 'block':
    default:
      return { t: 'type', lines: lockup(name).filter(Boolean), face: 'block', tech: 'embroidery', ink: p.ink };
  }
}

function useSettle() {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(true);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight) return;
    setShown(false);
    return register({ el, show: () => setShown(true) });
  }, []);
  return [ref, shown] as const;
}

const Arrow = () => (
  <svg width="18" height="12" viewBox="0 0 18 12" fill="none" aria-hidden>
    <path d="M0 6h16M11 1l5 5-5 5" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

export default function DesignAct() {
  const [row, rowIn] = useSettle();
  const { name: typed, isDefault } = useOrgName();
  const name = isDefault ? YOUR_NAME : typed;
  const c = ACT3.collection;
  const [a, em, b] = ACT3.ask;

  return (
    <section aria-labelledby="design-title" className="chapter-design band-paper sec relative overflow-x-clip">
      <div ref={row} data-in={rowIn} className="chapter-table shell">
        <div className="grid-12 gap-y-12">
          <div className="chapter-piece col-span-4 sm:col-span-6 lg:col-span-4 lg:pt-4" style={{ '--d': '0ms' } as React.CSSProperties}>
            <p className="t-eyebrow fg-muted">{ACT3.eyebrow}</p>
            <h2 id="design-title" className="t-h2 mt-5">
              {a}
              <em>{em}</em>
              {b}
            </h2>
            <p className="t-body mt-7 max-w-[40ch] text-ink/85">{ACT3.body}</p>
            <Link href={ACT3.link.href} className="link-arrow t-spec mt-8 text-ink">
              <span className="link-u">{ACT3.link.label}</span>
              <Arrow />
            </Link>
          </div>

          <ul
            aria-label={`Example collection for ${name}`}
            className="chapter-rail col-span-4 sm:col-span-8 lg:col-span-7 lg:col-start-6"
          >
            {c.pieces.map((p, i) => {
              const g: Drawn = { kind: p.kind, color: p.color, trim: p.trim, place: p.place, deco: decoFor(p, name) };
              return (
                <li
                  key={p.kind}
                  className={`chapter-piece ${OFFSET[i]}`}
                  style={{ '--d': `${120 + i * 80}ms` } as React.CSSProperties}
                >
                  <figure className="group">
                    <div className={`chapter-plate relative aspect-[4/5] overflow-hidden ${PLATE[p.plate]}`}>
                      <WorkArt
                        art={{ t: 'garment', g }}
                        label={`${p.label} for ${name}, ${p.spec.toLowerCase()}`}
                        className="chapter-piece-art absolute inset-[7%] h-[86%] w-[86%]"
                      />
                      <span aria-hidden className="t-spec absolute left-3 top-3 text-ink">{String(i + 1).padStart(2, '0')}</span>
                    </div>
                    <figcaption className="mt-4">
                      <span className="t-h3 block">{p.label}</span>
                      <span className="t-spec fg-muted mt-1.5 block">{p.spec}</span>
                    </figcaption>
                  </figure>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
