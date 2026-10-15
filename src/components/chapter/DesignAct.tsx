'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useLayoutEffect, useRef, useState } from 'react';
import { register } from '@/lib/reveal';
import { ACT3 } from '@/lib/chapter';

/**
 * Act 02, one row: the question and our answer, then the collection on three
 * pale plates (blue, pink, cream). Phones swipe the plates.
 */

const PLATE = { blue: 'bg-electric-lit', pink: 'bg-pop-lit', cream: 'bg-cream' } as const;

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
  const c = ACT3.collection;

  return (
    <section aria-labelledby="design-title" className="chapter-design relative overflow-x-clip bg-paper text-ink">
      <div ref={row} data-in={rowIn} className="chapter-table shell relative grid gap-8 py-14 sm:py-16 lg:grid-cols-12 lg:items-center lg:gap-10">
        <div className="chapter-piece lg:col-span-4" style={{ '--from': '0 20px', '--d': '0ms' } as React.CSSProperties}>
          <h2 id="design-title" className="caps text-d2">{ACT3.ask}</h2>
          <p className="chapter-turn mt-3 text-uv">{ACT3.script}</p>
          <p className="mt-4 max-w-[26rem] text-lead text-ink/70">{ACT3.body}</p>
          <p className="label mt-6 text-muted">Example: The Sophie Collection →</p>
        </div>
        <Link
          href={c.href}
          aria-label="See the Sophie Collection, an example collection"
          className="-mx-5 flex snap-x snap-mandatory scroll-px-5 gap-3 overflow-x-auto px-5 pb-2 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-4 sm:overflow-visible sm:px-0 sm:pb-0 lg:col-span-8"
        >
          {c.pieces.map((p, i) => (
            <figure
              key={p.src}
              className="chapter-piece group w-[64%] shrink-0 snap-start sm:w-auto"
              style={{ '--from': '0 30px', '--d': `${120 + i * 120}ms` } as React.CSSProperties}
            >
              <div className={`relative aspect-[3/4] overflow-hidden rounded-3xl ${PLATE[p.plate]}`}>
                <Image src={p.src} alt={p.alt} fill unoptimized sizes="(min-width: 1024px) 22vw, (min-width: 640px) 32vw, 64vw" className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]" />
              </div>
              <figcaption className="mt-3 text-[0.9375rem] font-medium text-muted transition-colors group-hover:text-ink">{p.label}</figcaption>
            </figure>
          ))}
        </Link>
      </div>
    </section>
  );
}
