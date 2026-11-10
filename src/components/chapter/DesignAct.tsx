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
 * pieces from one collection on square cream and beige plates (cols 5–12), each
 * carrying the organization's name the way that garment would. Phones swipe the
 * plates.
 */

const PLATE: Record<Piece['plate'], string> = {
  cream: 'bg-cream',
  beige: 'bg-beige',
  dusty: 'bg-dusty',
  green: 'bg-green',
};

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
    <section aria-labelledby="design-title" className="chapter-design relative overflow-x-clip bg-paper text-ink">
      <div ref={row} data-in={rowIn} className="chapter-table shell relative grid gap-10 py-16 sm:py-20 lg:grid-cols-12 lg:items-center lg:gap-10">
        <div className="chapter-piece lg:col-span-4" style={{ '--d': '0ms' } as React.CSSProperties}>
          <h2 id="design-title" className="t-h2">
            {a}
            <em>{em}</em>
            {b}
          </h2>
          <p className="t-body mt-6 max-w-[40ch] text-ink/85">{ACT3.body}</p>
          <Link href={ACT3.link.href} className="link-arrow mt-8 text-ink">
            <span className="link-u">{ACT3.link.label}</span>
            <Arrow />
          </Link>
        </div>

        <ul
          aria-label={`Example collection for ${name}`}
          className="-mx-5 flex snap-x snap-mandatory scroll-px-5 gap-3 overflow-x-auto px-5 pb-2 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-4 sm:overflow-visible sm:px-0 sm:pb-0 lg:col-span-8"
        >
          {c.pieces.map((p, i) => {
            const g: Drawn = { kind: p.kind, color: p.color, trim: p.trim, place: p.place, deco: decoFor(p, name) };
            return (
              <li
                key={p.kind}
                className="chapter-piece w-[64%] shrink-0 snap-start sm:w-auto"
                style={{ '--d': `${120 + i * 80}ms` } as React.CSSProperties}
              >
                <figure className="group">
                  <div className={`chapter-plate relative aspect-[3/4] overflow-hidden ${PLATE[p.plate]}`}>
                    <WorkArt
                      art={{ t: 'garment', g }}
                      label={`${p.label} for ${name}, ${p.spec.toLowerCase()}`}
                      className="chapter-piece-art absolute inset-[7%] h-[86%] w-[86%] transition-transform duration-base ease-out group-hover:scale-[1.03]"
                    />
                  </div>
                  <figcaption className="t-body mt-3 text-ink">{p.label}</figcaption>
                </figure>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
