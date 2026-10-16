'use client';

import Link from 'next/link';
import { useLayoutEffect, useRef, useState } from 'react';
import { register } from '@/lib/reveal';
import { YOUR_NAME, useOrgName } from '@/lib/name';
import { useVibe } from '@/lib/vibe';
import { COLORWAYS, FINALE, colorwayIndex } from '@/lib/chapter';

/**
 * The chapter's close: a full-bleed cream band (the home page's one dark band
 * is the roster further down). Three serif lines set like roster rows, each
 * numbered and sewn under with a running stitch that runs off the left edge;
 * then the lead, one primary and a sentence-case link. Beside them, the page's
 * one hang tag drops in on a string from the band's top edge, carrying the
 * organization's name and colorway. With reduced motion it is simply there.
 */

const Arrow = () => (
  <svg width="18" height="12" viewBox="0 0 18 12" fill="none" aria-hidden>
    <path d="M0 6h16M11 1l5 5-5 5" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

function HangTag({ name, color }: { name: string; color: number }) {
  const cw = COLORWAYS[color];
  return (
    <div className="chapter-tag lift">
      <span aria-hidden className="chapter-tag-hole" />
      <span role="img" aria-label="Member Threads" className="chapter-logo-ink mx-auto mt-9 block h-10 w-[96px]" />
      <span aria-hidden className="stitch-rule mt-6" />
      <p className="t-eyebrow fg-muted mt-6">{FINALE.madeFor}</p>
      <p key={name} className="chapter-tag-name chapter-reweave mt-3">{name}</p>
      <dl className="mt-6 grid gap-2 text-left">
        <div className="hairline flex justify-between gap-3 pt-2">
          <dt className="t-spec fg-muted">Style</dt>
          <dd className="t-spec text-right">{FINALE.tag.style}</dd>
        </div>
        <div className="hairline flex justify-between gap-3 pt-2">
          <dt className="t-spec fg-muted">Colorway</dt>
          <dd key={cw.id} className="t-spec chapter-fade-in inline-flex items-center gap-1.5">
            <span aria-hidden className="chapter-slip-sw" style={{ background: cw.body }} />
            {cw.name}
          </dd>
        </div>
        <div className="hairline flex justify-between gap-3 pt-2">
          <dt className="t-spec fg-muted">Minimum</dt>
          <dd className="t-spec text-right">{FINALE.tag.min}</dd>
        </div>
      </dl>
    </div>
  );
}

export default function Finale() {
  const { name: typed, isDefault } = useOrgName();
  const name = isDefault ? YOUR_NAME : typed;
  const { vibe } = useVibe();
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(true);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight * 0.85) return;
    setShown(false);
    return register({ el, show: () => setShown(true) });
  }, []);

  const last = FINALE.lines.length - 1;

  return (
    <section aria-labelledby="finale-title" className="chapter-close band-cream sec-lg relative overflow-hidden">
      <div ref={ref} data-in={shown} className="chapter-finale shell relative">
        <div className="grid-12 items-start gap-y-16">
          <div className="col-span-4 sm:col-span-8 lg:col-span-7 lg:self-center">
            <h2 id="finale-title" className="chapter-finale-title">
              {FINALE.lines.map((l, i) => {
                const words = l.split(' ');
                const tail = words.pop()!;
                return (
                  <span key={l} className="chapter-finale-row" style={{ '--d': `${i * 80}ms`, '--i': i } as React.CSSProperties}>
                    <span aria-hidden className="chapter-finale-no t-spec fg-muted num">{String(i + 1).padStart(2, '0')}</span>
                    <span className="chapter-finale-line t-h2">
                      {words.join(' ')} {i === last ? <em>{tail}</em> : tail}
                    </span>
                    <span aria-hidden className="chapter-finale-stitch stitch-rule" />
                  </span>
                );
              })}
            </h2>
            <p className="chapter-finale-after t-lead mt-12 max-w-[36ch]">{FINALE.body}</p>
            <div className="chapter-finale-after mt-10 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-8">
              <Link href={FINALE.primary.href} className="btn-blue">
                {FINALE.primary.label}
                <Arrow />
              </Link>
              <Link href={FINALE.secondary.href} className="link-arrow chapter-link">
                <span className="link-u">{FINALE.secondary.label}</span>
                <Arrow />
              </Link>
            </div>
          </div>

          <div className="order-first col-span-4 flex justify-center sm:col-span-8 lg:order-none lg:col-span-4 lg:col-start-8 lg:justify-center lg:pt-4">
            <div className="chapter-tag-hang">
              <span aria-hidden className="chapter-tag-string" />
              <div className="chapter-tag-swing">
                <HangTag name={name} color={colorwayIndex(vibe.id)} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
