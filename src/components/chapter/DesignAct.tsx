'use client';

import Link from 'next/link';
import { useLayoutEffect, useRef, useState } from 'react';
import WorkArt from '@/components/work/art';
import { register } from '@/lib/reveal';
import { YOUR_NAME, useOrgName } from '@/lib/name';
import { ACT3, initial, lockup, type Piece } from '@/lib/chapter';
import type { Deco, Drawn } from '@/lib/work';

/**
 * Act 02, one row: the question and our answer, then three pieces from one
 * collection on cream, dusty-blue and beige plates, each carrying the
 * organization's name the way that garment would. Phones swipe the plates.
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

export default function DesignAct() {
  const [row, rowIn] = useSettle();
  const { name: typed, isDefault } = useOrgName();
  const name = isDefault ? YOUR_NAME : typed;
  const c = ACT3.collection;

  return (
    <section aria-labelledby="design-title" className="chapter-design relative overflow-x-clip bg-paper text-ink">
      <div ref={row} data-in={rowIn} className="chapter-table shell relative grid gap-10 border-t border-rule py-16 sm:py-20 lg:grid-cols-12 lg:items-center lg:gap-12 lg:py-24">
        <div className="chapter-piece lg:col-span-4" style={{ '--from': '0 20px', '--d': '0ms' } as React.CSSProperties}>
          <p className="label text-muted">Design help, included</p>
          <h2 id="design-title" className="caps mt-4 text-d2">{ACT3.ask}</h2>
          <p className="mt-4 font-serif text-[clamp(1.75rem,2.6vw,2.25rem)] leading-[1.1] text-uv">{ACT3.script}</p>
          <p className="mt-5 max-w-[26rem] text-lead text-ink/70">{ACT3.body}</p>
          <Link href={ACT3.link.href} className="label group mt-8 inline-flex items-center gap-2 border-b border-ink/30 pb-1 text-ink transition-colors hover:border-ink">
            {ACT3.link.label}
            <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-0.5">→</span>
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
                className="chapter-piece w-[68%] shrink-0 snap-start sm:w-auto"
                style={{ '--from': '0 30px', '--d': `${120 + i * 120}ms` } as React.CSSProperties}
              >
                <figure className="group">
                  <div className={`chapter-plate relative aspect-[4/5] overflow-hidden rounded-[20px] ${PLATE[p.plate]}`}>
                    <WorkArt
                      art={{ t: 'garment', g }}
                      label={`${p.label} for ${name}, ${p.spec.toLowerCase()}`}
                      className="chapter-piece-art absolute inset-[5%] h-[90%] w-[90%] transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                    />
                  </div>
                  <figcaption className="mt-3.5">
                    <span className="block text-[0.9375rem] font-semibold text-ink">{p.label}</span>
                    <span className="label mt-1.5 block text-[10px] text-muted">{p.spec}</span>
                  </figcaption>
                </figure>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
