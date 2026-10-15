'use client';

import Link from 'next/link';
import { useLayoutEffect, useRef, useState } from 'react';
import { Star } from '@/components/Sticker';
import { register } from '@/lib/reveal';
import { possessive, useOrgName } from '@/lib/name';
import { FINALE, named } from '@/lib/chapter';

/**
 * The chapter's close: one rounded pale-blue panel, three navy lines at d1
 * ("{NAME}'S NAME. / COLORS. / COLLECTION.") with the name in raspberry, one
 * line under it, the navy pill, and one outlined pink star. It settles in as it
 * arrives; with reduced motion it is simply there.
 */
export default function Finale() {
  const { name, isDefault } = useOrgName();
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(true);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight) return;
    setShown(false);
    return register({ el, show: () => setShown(true) });
  }, []);

  const who = isDefault ? 'YOUR' : possessive(name).replace("'", '’').toUpperCase();

  return (
    <section aria-labelledby="finale-title" className="bg-paper py-12 text-ink sm:py-16">
      <div className="shell">
        <div
          ref={ref}
          data-in={shown}
          className="chapter-finale relative overflow-hidden rounded-[32px] bg-electric-lit px-4 pb-14 pt-20 text-center sm:px-10 sm:py-20"
        >
          <Star
            variant="outline"
            rotate={15}
            className="pointer-events-none absolute right-5 top-5 h-11 w-11 text-uv-lit sm:right-[9%] sm:top-12 sm:h-20 sm:w-20"
          />
          <h2 id="finale-title" className="caps chapter-finale-title text-[clamp(1.5rem,6.8vw,2.25rem)] leading-[0.95] sm:text-d1">
            {FINALE.lines.map((l, i) => (
              <span key={i} className="block">
                <span key={who} className="chapter-name-slap text-uv">{who}</span>
                {l.replace('{name’s}', '').toUpperCase()}
              </span>
            ))}
          </h2>
          <p className="chapter-turn mt-5 text-ink/70">{FINALE.script}</p>
          <Link href={FINALE.primary.href} className="btn-blue mt-8 h-14 px-8 text-[1.0625rem]">
            {named(FINALE.primary.label, name, isDefault)} <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
