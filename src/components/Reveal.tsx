'use client';

import { useEffect, useRef, useState } from 'react';
import { register } from '@/lib/reveal';

/**
 * Reveals children once they reach the fold.
 *
 * Renders visible and only hides content confirmed to be below the fold when the
 * effect runs, so a section the reader already passed during hydration is never
 * flashed in and then hidden. See `@/lib/reveal` for why this is a position
 * check rather than an IntersectionObserver.
 */
export default function Reveal({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(true);
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight) return;

    setArmed(true);
    setShown(false);
    return register({ el, show: () => setShown(true) });
  }, []);

  const hidden = armed && !shown;

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-[opacity,transform] duration-[700ms] ease-out ${
        hidden ? 'translate-y-3 opacity-0' : 'translate-y-0 opacity-100'
      } ${className}`}
    >
      {children}
    </div>
  );
}
