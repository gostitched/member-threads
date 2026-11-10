'use client';

import Link from 'next/link';
import { useLayoutEffect, useRef, useState } from 'react';
import { register } from '@/lib/reveal';
import { possessive, useOrgName } from '@/lib/name';
import { FINALE } from '@/lib/chapter';

/**
 * The chapter's close: one square green panel (the home page's one dark band),
 * three serif lines ("Your name. / Your colors. / Your collection.") with the
 * organization's name taking "Your" once it is typed, set in italic; one line
 * under it and the light button. It settles in as it arrives; with reduced motion it is simply there.
 */

const Arrow = () => (
  <svg width="18" height="12" viewBox="0 0 18 12" fill="none" aria-hidden>
    <path d="M0 6h16M11 1l5 5-5 5" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

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

  const who = isDefault ? 'Your' : possessive(name).replace("'", '’');

  return (
    <section aria-labelledby="finale-title" className="bg-paper py-12 text-ink sm:py-16">
      <div className="shell">
        <div ref={ref} data-in={shown} className="chapter-finale band-green relative overflow-hidden px-5 pb-16 pt-20 text-center sm:px-10 sm:py-24">
          <h2 id="finale-title" className="t-h1 mx-auto max-w-[18ch]">
            {FINALE.lines.map((l, i) => (
              <span key={i} className="chapter-finale-line block" style={{ '--d': `${i * 80}ms` } as React.CSSProperties}>
                <em key={who} className="chapter-reweave">{who}</em> {l.split(' ').slice(1).join(' ')}
              </span>
            ))}
          </h2>
          <p className="chapter-finale-after t-lead mx-auto mt-6 text-cream/90">{FINALE.body}</p>
          <Link href={FINALE.primary.href} className="chapter-finale-after btn-white mt-10">
            {FINALE.primary.label}
            <Arrow />
          </Link>
        </div>
      </div>
    </section>
  );
}
