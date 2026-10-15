'use client';

import { useEffect, useRef, useState } from 'react';
import { CAPABILITIES } from '@/lib/site';
import { STUDIO_GARMENTS, TECHNIQUES, type StudioGarment as Garment } from '@/lib/studio';
import StudioGarment, { place } from './StudioGarment';

const pad = (n: number) => String(n).padStart(2, '0');

/** Garment types we make that the studio has no drawing for yet. */
const ALSO = CAPABILITIES.garments.filter(
  (name) => !STUDIO_GARMENTS.some((g) => g.name.toLowerCase() === name.toLowerCase() || g.single.toLowerCase() === name.toLowerCase()),
);

/**
 * VIEW ALL: the canvas turns into an editorial index for anyone who came looking
 * for something specific. Numbered rows in big type; hovering one floats a
 * preview by the cursor; clicking picks it and goes back to the canvas.
 */
export default function StudioIndex({
  kind,
  garment,
  stack,
  onPickGarment,
  onToggleTech,
  onClose,
}: {
  kind: 'what' | 'how';
  garment: Garment;
  stack: string[];
  onPickGarment: (id: string) => void;
  onToggleTech: (id: string) => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const floatRef = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<string | null>(null);

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    ref.current?.querySelector<HTMLButtonElement>('button[data-row]')?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      opener?.focus?.();
    };
  }, [onClose]);

  const onMove = (e: React.PointerEvent) => {
    const box = ref.current?.getBoundingClientRect();
    if (!box || !floatRef.current) return;
    floatRef.current.style.transform = `translate3d(${e.clientX - box.left + 24}px, ${e.clientY - box.top + ref.current!.scrollTop - 90}px, 0)`;
  };

  const rows =
    kind === 'what'
      ? STUDIO_GARMENTS.map((g) => ({ id: g.id, title: g.name, sub: g.technicalLabel.join(' / '), on: g.id === garment.id }))
      : TECHNIQUES.map((t) => ({ id: t.id, title: `${t.verb}.`, sub: t.technical, on: stack.includes(t.id) }));

  const preview = (() => {
    if (!hover) return null;
    if (kind === 'what') {
      const g = STUDIO_GARMENTS.find((x) => x.id === hover)!;
      return { g, placed: [] };
    }
    const t = TECHNIQUES.find((x) => x.id === hover)!;
    const zone = place(garment, [t]).get(t.id) ?? null;
    return { g: garment, placed: [{ tech: t, zone, fresh: true, preview: false }] };
  })();

  return (
    <div
      ref={ref}
      role="dialog"
      aria-modal="true"
      aria-label={kind === 'what' ? 'All garments' : 'All techniques'}
      onPointerMove={onMove}
      className="st-pop absolute inset-0 z-50 overflow-y-auto bg-white px-5 pb-16 pt-6 sm:px-8 lg:px-8"
    >
      <div className="flex items-baseline justify-between border-b border-ink pb-4">
        <p className="label text-muted">
          {kind === 'what' ? 'Index / garments' : 'Index / techniques'} — {pad(rows.length)}
        </p>
        <button type="button" onClick={onClose} className="label text-ink hover:text-electric" data-cursor="Close">
          Back to the canvas ✕
        </button>
      </div>

      <ol className="grid gap-x-12 lg:grid-cols-2">
        {rows.map((r, i) => (
          <li key={r.id} className="border-b border-rule">
            <button
              type="button"
              data-row
              data-cursor={kind === 'what' ? 'Try on' : r.on ? 'On' : 'Add'}
              aria-pressed={r.on}
              onPointerEnter={() => setHover(r.id)}
              onPointerLeave={() => setHover(null)}
              onFocus={() => setHover(r.id)}
              onBlur={() => setHover(null)}
              onClick={() => (kind === 'what' ? onPickGarment(r.id) : onToggleTech(r.id))}
              className="group flex w-full items-baseline gap-5 py-3 text-left"
            >
              <span className="label w-6 shrink-0 text-muted">{pad(i + 1)}</span>
              <span
                className={`caps text-[clamp(1.75rem,3.2vw,3rem)] leading-none tracking-[-0.03em] transition-colors group-hover:text-electric ${
                  r.on ? 'text-electric' : ''
                }`}
              >
                {r.title}
              </span>
              <span className="label ml-auto hidden text-right text-muted sm:block">{r.on ? '↳ On your piece' : r.sub}</span>
            </button>
          </li>
        ))}
      </ol>

      {kind === 'what' && ALSO.length > 0 && (
        <p className="mt-10 max-w-3xl text-[0.9375rem] text-muted">
          <span className="label mr-2 text-ink">Also made</span>
          {ALSO.join(', ')}. And anything else, made from scratch.
        </p>
      )}

      {/* Preview that follows the cursor. */}
      <div ref={floatRef} className="pointer-events-none absolute left-0 top-0 z-10 hidden w-[200px] lg:block" aria-hidden>
        {preview && (
          <div key={hover} className="st-pop aspect-square w-full bg-white/90">
            <StudioGarment garment={preview.g} placed={preview.placed} label="" />
          </div>
        )}
      </div>
    </div>
  );
}
