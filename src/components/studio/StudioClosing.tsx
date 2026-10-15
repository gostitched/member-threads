'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { STUDIO_COPY as COPY, type StudioGarment as Garment } from '@/lib/studio';
import StudioGarment, { type Placed } from './StudioGarment';

/**
 * After the canvas, room to breathe. Whatever the visitor made stays for a beat,
 * then slides off as the real message comes in: we've just shown how much we
 * make, and the pieces we haven't made yet are the ones we want.
 */
export default function StudioClosing({ garment, placed }: { garment: Garment | null; placed: Placed[] }) {
  const ref = useRef<HTMLDivElement>(null);

  // Scroll progress through the block drives the garment out; a CSS variable
  // keeps it off React's render path.
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (window.innerHeight * 0.85 - r.top) / (window.innerHeight * 0.7)));
      el.style.setProperty('--p', p.toFixed(3));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={ref} className="relative overflow-hidden border-t border-rule" style={{ ['--p' as string]: 1 }}>
      <div className="shell relative py-28 sm:py-40">
        {garment && (
          <div
            aria-hidden
            className="pointer-events-none absolute right-[-4%] top-1/2 hidden aspect-square w-[40%] max-w-[520px] lg:block"
            style={{
              transform: 'translate3d(calc(var(--p) * 60%), -50%, 0) rotate(calc(var(--p) * 8deg))',
              opacity: 'calc(1 - var(--p) * 0.85)',
            }}
          >
            <StudioGarment garment={garment} placed={placed} label="" />
          </div>
        )}

        <div className="relative max-w-3xl">
          <p className="label text-muted">{COPY.closing.eyebrow}</p>
          <p className="caps mt-6 text-[clamp(5rem,17vw,16rem)] leading-[0.8] tracking-[-0.055em]">{COPY.closing.big}</p>
          <p className="mt-4 font-serif text-[clamp(2rem,4.4vw,4rem)] italic leading-none text-electric">
            {COPY.closing.script}
          </p>
          <p className="mt-10 max-w-measure text-lead text-muted">{COPY.closing.body}</p>
          <Link href="/custom" className="btn-ink mt-10">
            {COPY.closing.cta} →
          </Link>
        </div>
      </div>
    </div>
  );
}
