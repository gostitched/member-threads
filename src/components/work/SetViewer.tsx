'use client';

import Link from 'next/link';
import { Fragment, useEffect, useRef, useState } from 'react';
import { LOOKBOOK_KIND_LABELS, type LookbookPiece, type LookbookSet } from '@/lib/catalog/types';
import { layFlat } from './flatlay';

export const pieceName = (p: LookbookPiece) => p.label ?? LOOKBOOK_KIND_LABELS[p.kind] ?? LOOKBOOK_KIND_LABELS.other;

/**
 * A set, enlarged: the same flat-lay at full size on its own ground, with a Front/Back
 * switch (when the set has backs) and arrows to step through the wall. A piece made from
 * a catalog product links to it by name. Esc or a click outside closes it.
 */
export default function SetViewer({
  sets,
  grounds,
  index,
  onIndex,
  onClose,
}: {
  sets: LookbookSet[];
  grounds: Map<string, string>;
  index: number;
  onIndex: (i: number) => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [back, setBack] = useState(false);
  const s = sets[index];
  const names = s.pieces.map(pieceName).join(' + ');
  const placed = layFlat(s.pieces);
  const hasBack = s.pieces.some((p) => p.back);
  const step = (d: number) => onIndex((index + d + sets.length) % sets.length);

  useEffect(() => {
    const d = ref.current;
    if (d && !d.open) d.showModal();
  }, []);
  useEffect(() => setBack(false), [index]);
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') step(1);
      if (e.key === 'ArrowLeft') step(-1);
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  });

  return (
    <dialog
      ref={ref}
      aria-label={`${s.theme}: ${names}`}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && ref.current?.close()}
      className="set-viewer"
    >
      <div className="set-viewer-stage" data-back={back || undefined} style={{ background: grounds.get(s.id) }}>
        {s.pieces.map((p, i) => {
          const at = placed[i];
          const name = pieceName(p);
          return (
            <div
              key={p.id}
              className="set-piece"
              data-flip={p.back ? '' : undefined}
              style={{ left: `${at.left}%`, top: `${at.top}%`, width: `${at.width}%`, height: `${at.height}%`, rotate: `${at.rotate}deg`, zIndex: i === 0 ? 2 : 1 }}
            >
              <img src={p.front.url} alt={`${name}, front`} decoding="async" className="set-face is-front" />
              {p.back && <img src={p.back.url} alt={`${name}, back`} decoding="async" className="set-face is-back" />}
            </div>
          );
        })}
        {sets.length > 1 && (
          <>
            <button type="button" onClick={() => step(-1)} aria-label="Previous design" className="set-viewer-nav is-prev">
              <span aria-hidden>←</span>
            </button>
            <button type="button" onClick={() => step(1)} aria-label="Next design" className="set-viewer-nav is-next">
              <span aria-hidden>→</span>
            </button>
          </>
        )}
      </div>

      <div className="flex items-center gap-3 pt-3">
        <div className="min-w-0">
          <p className="t-spec text-muted">{s.theme}</p>
          <p className="t-body font-medium text-ink">
            {s.pieces.map((p, i) => (
              <Fragment key={p.id}>
                {i > 0 && ' + '}
                {p.product ? (
                  <Link href={`/catalog/${p.product.slug}`} className="set-viewer-piece">
                    {pieceName(p)}
                  </Link>
                ) : (
                  pieceName(p)
                )}
              </Fragment>
            ))}
          </p>
        </div>
        <div className="ml-auto flex shrink-0 items-center">
          {hasBack && (
            <div className="flex border border-[var(--rule-c)]" role="group" aria-label="Side">
              {(['Front', 'Back'] as const).map((label) => {
                const on = (label === 'Back') === back;
                return (
                  <button
                    key={label}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setBack(label === 'Back')}
                    className={`min-h-10 px-4 font-sans text-[0.875rem] font-medium ${on ? 'bg-ink text-paper' : 'text-ink'}`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <button type="button" onClick={() => ref.current?.close()} aria-label="Close" className="set-viewer-close">
        <svg aria-hidden viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="square">
          <path d="M3.5 3.5l9 9M12.5 3.5l-9 9" />
        </svg>
      </button>
    </dialog>
  );
}
