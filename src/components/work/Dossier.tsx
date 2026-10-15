'use client';

import Link from 'next/link';
import { useEffect, useLayoutEffect, useRef } from 'react';
import Media from './Media';
import { PieceStamp, ShareButton, bandStyle, bandTheme } from './hype';
import { EASE_IN, EASE_OUT, REST, fromFrame, prefersReducedMotion } from './flip';
import { leadOf, specs, stripOf, type WorkAsset, type WorkItem } from '@/lib/work';

/** Rendered widths of the lead and the strip, shared with the wall's preloader. */
export const LEAD_SIZES = '(min-width: 1024px) 50vw, 94vw';
export const STRIP_SIZES = '(min-width: 1024px) 10vw, 24vw';

const whole = (a: WorkAsset) => a.kind === 'garment' || (a.kind === 'artifact' && !a.src);
/** Width over height: the photograph's own, else what its orientation implies. */
const ratioOf = (a: WorkAsset) =>
  a.width && a.height ? a.width / a.height : a.orientation === 'portrait' ? 0.8 : a.orientation === 'landscape' ? 1.25 : 1;

/**
 * The assembled collection: the bridge between the wall and the collection page.
 *
 * Its pictures are the same assets that were scattered across the wall, and on open
 * each one travels from where it sat on the wall into its place here (`from` holds the
 * wall rects), so the project visibly builds itself out of the collage. Closing runs
 * the same trip backwards, onto the wall rects `wallRect` reports at that moment.
 */
export default function Dossier({
  project,
  from,
  closing,
  onClose,
  onClosed,
  next,
  onNext,
  wallRect,
}: {
  project: WorkItem;
  from: Map<string, DOMRect> | null;
  closing: boolean;
  onClose: () => void;
  onClosed: () => void;
  next: WorkItem | null;
  onNext: (() => void) | null;
  wallRect: (assetId: string) => DOMRect | null;
}) {
  const root = useRef<HTMLDivElement>(null);
  const back = useRef<HTMLButtonElement>(null);
  const lead = leadOf(project);
  const strip = stripOf(project).slice(0, 4);
  const leadWhole = whole(lead);
  const r = ratioOf(lead);
  const band = bandTheme(project);

  // Lock the page behind, without the layout jumping by a scrollbar's width.
  useEffect(() => {
    const html = document.documentElement;
    const bar = window.innerWidth - html.clientWidth;
    html.style.overflow = 'hidden';
    html.style.paddingRight = bar ? `${bar}px` : '';
    return () => {
      html.style.overflow = '';
      html.style.paddingRight = '';
    };
  }, []);

  // Assemble.
  useLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    // Focus moves into the dialog; the ring shows only when the visitor is on a keyboard.
    const keyboard = document.activeElement?.matches(':focus-visible');
    (keyboard ? back.current : el)?.focus({ preventScroll: true });
    if (prefersReducedMotion()) return;
    const fade = el.querySelectorAll<HTMLElement>('[data-fade]');
    const bg = el.querySelector<HTMLElement>('[data-bg]');
    if (!from) {
      // Moving between projects inside the dossier: a quick settle, no flight.
      fade.forEach((f) => f.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 260, easing: EASE_OUT, fill: 'backwards' }));
      el.querySelectorAll<HTMLElement>('[data-d]').forEach((d, i) =>
        d.animate([{ opacity: 0, transform: 'translateY(12px)' }, { opacity: 1, transform: 'none' }], { duration: 380, delay: i * 30, easing: EASE_OUT, fill: 'backwards' }),
      );
      return;
    }
    bg?.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 320, delay: 90, easing: EASE_OUT, fill: 'backwards' });
    fade.forEach((f, i) =>
      f.animate([{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], { duration: 420, delay: 260 + i * 35, easing: EASE_OUT, fill: 'backwards' }),
    );
    el.querySelectorAll<HTMLElement>('[data-d]').forEach((d, i) => {
      const src = from.get(d.dataset.d!);
      const dst = d.getBoundingClientRect();
      if (!src) {
        d.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300, delay: 250, fill: 'backwards' });
        return;
      }
      d.animate([fromFrame(src, dst), REST], { duration: 620, delay: i * 28, easing: EASE_OUT, fill: 'backwards' });
    });
    // Only on the first open of this project; `from` is consumed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project.id]);

  // Disassemble.
  useEffect(() => {
    if (!closing) return;
    const el = root.current;
    if (!el || prefersReducedMotion()) {
      onClosed();
      return;
    }
    const vh = window.innerHeight;
    const anims: Animation[] = [];
    el.querySelectorAll<HTMLElement>('[data-fade]').forEach((f) =>
      anims.push(f.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 160, easing: EASE_IN, fill: 'forwards' })),
    );
    const bg = el.querySelector<HTMLElement>('[data-bg]');
    if (bg) anims.push(bg.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 360, delay: 90, easing: EASE_OUT, fill: 'forwards' }));
    el.querySelectorAll<HTMLElement>('[data-d]').forEach((d, i) => {
      const dst = wallRect(d.dataset.d!);
      const cur = d.getBoundingClientRect();
      if (dst && dst.bottom > -200 && dst.top < vh + 200) {
        anims.push(d.animate([REST, fromFrame(dst, cur)], { duration: 480, delay: i * 18, easing: EASE_OUT, fill: 'forwards' }));
      } else {
        anims.push(d.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, fill: 'forwards' }));
      }
    });
    let done = false;
    Promise.all(anims.map((a) => a.finished)).then(() => {
      if (!done) onClosed();
      done = true;
    });
    return () => { done = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [closing]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      ref={root}
      role="dialog"
      tabIndex={-1}
      aria-modal="true"
      aria-labelledby="wk-dossier-title"
      className={`fixed inset-0 z-[70] overflow-y-auto overscroll-contain outline-none ${closing ? 'pointer-events-none' : ''}`}
    >
      <div data-bg className="fixed inset-0 bg-paper" />

      {/* The hero band: a rounded panel washed with the collection's own first colour. */}
      <div data-fade className="relative mx-auto mt-3 w-[min(94vw,1480px)] rounded-[24px] bg-electric-lit text-ink lg:mt-5" style={bandStyle(band)}>
        <div className="px-5 pb-7 pt-3 lg:px-10 lg:pb-10 lg:pt-5">
          <div className="flex items-center justify-between">
            <button ref={back} type="button" onClick={onClose} className="group flex min-h-[44px] items-center gap-2 text-[0.9375rem] font-semibold text-ink/75 hover:text-ink">
              <span aria-hidden className="transition-transform duration-200 group-hover:-translate-x-1">←</span> All collections
            </button>
            {onNext && next && (
              <button type="button" onClick={onNext} className="min-h-[44px] text-right text-[0.9375rem] font-semibold text-ink/75 transition-colors hover:text-ink">
                Next <span aria-hidden>→</span>
              </button>
            )}
          </div>
          <div className="mt-5 flex flex-col gap-5 lg:mt-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <h2 id="wk-dossier-title" className="caps break-words text-d2">
                {project.title}
              </h2>
              <p className="mt-2 font-sans text-[clamp(1.125rem,1.5vw,1.375rem)] font-medium leading-none text-uv">
                {project.sector}
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-3">
              <PieceStamp w={project} />
              <ShareButton w={project} />
            </div>
          </div>
        </div>
      </div>

      <div className="relative mx-auto w-[min(94vw,1480px)] pb-16">
        {/* The lead takes its own proportions, so a portrait is never cropped to fit a
            landscape box; its height is held to the screen. */}
        <div className="mt-8 grid gap-8 lg:mt-10 lg:grid-cols-[auto_minmax(0,1fr)] lg:gap-[4.5vw]">
          <div
            className="relative w-full lg:h-[var(--lead-h)] lg:w-auto"
            style={{ aspectRatio: String(r), ['--lead-h' as string]: `min(64vh, ${(50 / r).toFixed(2)}vw)` }}
          >
            {leadWhole && <div data-fade className="wk-plate absolute inset-0" />}
            <div data-d={lead.id} className={`absolute overflow-hidden ${leadWhole ? 'inset-[8%]' : 'inset-0 rounded-[18px]'}`}>
              <Media asset={lead} sizes={LEAD_SIZES} eager />
            </div>
          </div>

          <div className="flex min-w-0 flex-col">
            {/* What's in it, as chips. */}
            <ul data-fade className="flex max-w-[40rem] flex-wrap gap-2">
              {(project.pieces ? project.pieces.map((p) => p.name) : specs(project).filter((m) => !/ pieces$/i.test(m))).map((n) => (
                <li key={n} className="wk-chip">{n}</li>
              ))}
            </ul>

            {/* The palette, as dots. */}
            {project.palette && (
              <ul data-fade className="mt-6 flex flex-wrap gap-2.5" aria-label="Palette">
                {project.palette.map((c) => (
                  <li key={c.name} title={c.name} className="h-8 w-8 rounded-full shadow-[0_0_0_2px_theme(colors.paper),0_0_0_3px_theme(colors.rule)]" style={{ background: c.hex }}>
                    <span className="sr-only">{c.name}</span>
                  </li>
                ))}
              </ul>
            )}

            {project.brief?.[0] && (
              <div data-fade className="mt-8 max-w-[34rem]">
                <p className="label text-muted">{project.brief[0].label}</p>
                <p className="mt-3 text-lead text-ink/75">{project.brief[0].text}</p>
              </div>
            )}

            <div data-fade className="mt-8">
              <Link href={`/work/${project.slug}`} className="btn-blue px-6 py-3 text-[0.9375rem]">
                See the full collection <span aria-hidden>→</span>
              </Link>
            </div>

            {/* The rest of the project, small, each at its own shape: previews, not tiles. */}
            {strip.length > 0 && (
              <ul className="mt-10 flex items-end gap-[1.4vw] lg:mt-auto lg:pt-8">
                {strip.map((a) => {
                  const cut = whole(a);
                  return (
                    <li
                      key={a.id}
                      className={`relative h-[clamp(84px,24vw,130px)] min-w-0 shrink lg:h-[clamp(96px,9.5vw,168px)] ${cut ? 'wk-plate' : ''}`}
                      style={{ aspectRatio: String(cut && !a.src ? 1 : ratioOf(a)) }}
                    >
                      <div data-d={a.id} className={`absolute overflow-hidden ${cut ? 'inset-[8%]' : 'inset-0 rounded-[12px]'}`}>
                        <Media asset={a} sizes={STRIP_SIZES} />
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
