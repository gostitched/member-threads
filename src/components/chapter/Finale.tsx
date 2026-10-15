'use client';

import Link from 'next/link';
import { useLayoutEffect, useRef, useState } from 'react';
import { register } from '@/lib/reveal';
import { useOrgName } from '@/lib/name';
import { FINALE, named } from '@/lib/chapter';

/**
 * The chapter’s close: one full-bleed green band. The cream logo, three
 * lines at d1 ("YOUR NAME. / YOUR COLORS. / YOUR COLLECTION.") with "Your" in
 * beige, the organization's name signed under them in the script once it's
 * typed, one line, and the cream pill. It settles in as it arrives; with
 * reduced motion it is simply there.
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

  return (
    <section aria-labelledby="finale-title" className="chapter-band relative overflow-hidden bg-green text-cream">
      <div ref={ref} data-in={shown} className="chapter-finale shell relative py-20 text-center sm:py-28">
        <span aria-hidden className="chapter-logo mx-auto block h-12 w-[118px] sm:h-14 sm:w-[138px]" />
        <h2 id="finale-title" className="caps chapter-finale-title mt-10 text-[clamp(1.625rem,6.6vw,2.75rem)] leading-[0.95] sm:mt-12 sm:text-d1">
          {FINALE.lines.map(([your, rest]) => (
            <span key={rest} className="block">
              <span className="text-beige">{your}</span> {rest}
            </span>
          ))}
        </h2>
        {!isDefault && (
          <p className="chapter-sign mx-auto mt-6 flex max-w-full items-baseline justify-center gap-3 sm:mt-7">
            <span className="label shrink-0 text-cream/60">{FINALE.madeFor}</span>
            <span key={name} className="chapter-name-slap truncate pb-1 font-serif text-[clamp(1.75rem,3.2vw,2.5rem)] leading-none text-beige">
              {name}
            </span>
          </p>
        )}
        <p className="mx-auto mt-6 max-w-[30rem] text-balance text-lead text-cream/75">{FINALE.body}</p>
        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
          <Link href={FINALE.primary.href} className="btn h-14 bg-cream px-8 text-[1rem] text-ink hover:bg-paper">
            {named(FINALE.primary.label, name, isDefault || name.length > 16)} <span aria-hidden>→</span>
          </Link>
          <Link href={FINALE.secondary.href} className="btn h-14 px-7 text-[1rem] text-cream shadow-[inset_0_0_0_1.5px_theme(colors.cream/0.45)] hover:shadow-[inset_0_0_0_1.5px_theme(colors.cream)]">
            {FINALE.secondary.label}
          </Link>
        </div>
      </div>
    </section>
  );
}
