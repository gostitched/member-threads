'use client';

import Link from 'next/link';
import { useEffect, useLayoutEffect, useRef } from 'react';
import WorkArt from './art';
import { ShareButton } from './hype';
import { EASE_IN, EASE_OUT, REST, fromFrame, prefersReducedMotion } from './flip';
import { Arrow, ArrowBack, MoodPhoto } from './ui';
import { CASES } from '@/lib/cases';
import { categoryOf, drop, pieces, scheduleOf, type WorkItem } from '@/lib/work';

const FOCUSABLE = 'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * The dossier: one collection pulled off the wall and opened over it.
 *
 * The wall tile's photograph travels into the dossier's frame on open (`from` is its
 * rect) and back onto the tile on close (`wallRect` reports where the tile sits then),
 * re-cropping as it goes, never stretching. Everything else rises in once.
 *
 * A modal dialog: focus moves in, Tab stays inside, Escape and the back button close it,
 * and focus returns to the tile that opened it (the wall handles that).
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
  from: DOMRect | null;
  closing: boolean;
  onClose: () => void;
  onClosed: () => void;
  next: WorkItem | null;
  onNext: (() => void) | null;
  wallRect: (pid: string) => DOMRect | null;
}) {
  const root = useRef<HTMLDivElement>(null);
  const back = useRef<HTMLButtonElement>(null);
  const study = CASES.find((c) => c.id === project.caseId);
  const rows = scheduleOf(project);
  const cat = categoryOf(project);

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
    el.scrollTop = 0;
    back.current?.focus({ preventScroll: true });
    if (prefersReducedMotion()) return;
    const bg = el.querySelector<HTMLElement>('[data-bg]');
    const photo = el.querySelector<HTMLElement>('[data-d]');
    const fades = el.querySelectorAll<HTMLElement>('[data-fade]');
    if (from && photo) {
      bg?.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 320, easing: EASE_OUT, fill: 'backwards' });
      photo.animate([fromFrame(from, photo.getBoundingClientRect()), REST], { duration: 760, easing: 'cubic-bezier(0.7, 0, 0.2, 1)', fill: 'backwards' });
      fades.forEach((f, i) =>
        f.animate([{ opacity: 0, transform: 'translateY(16px)' }, { opacity: 1, transform: 'none' }], {
          duration: 620, delay: 320 + i * 60, easing: EASE_OUT, fill: 'backwards',
        }),
      );
    } else {
      // Arriving by link, or moving to the next collection: a quick settle.
      [photo, ...Array.from(fades)].forEach((f, i) =>
        f?.animate([{ opacity: 0, transform: 'translateY(12px)' }, { opacity: 1, transform: 'none' }], {
          duration: 520, delay: i * 50, easing: EASE_OUT, fill: 'backwards',
        }),
      );
    }
    // `from` is only for the first open of this project.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project.id]);

  // Disassemble: the photo goes back to its tile.
  useEffect(() => {
    if (!closing) return;
    const el = root.current;
    if (!el || prefersReducedMotion()) {
      onClosed();
      return;
    }
    const anims: Animation[] = [];
    el.querySelectorAll<HTMLElement>('[data-fade]').forEach((f) =>
      anims.push(f.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 180, easing: EASE_IN, fill: 'forwards' })),
    );
    const bg = el.querySelector<HTMLElement>('[data-bg]');
    if (bg) anims.push(bg.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 380, delay: 160, easing: EASE_OUT, fill: 'forwards' }));
    const photo = el.querySelector<HTMLElement>('[data-d]');
    const dst = wallRect(project.id);
    const vh = window.innerHeight;
    if (photo) {
      const cur = photo.getBoundingClientRect();
      anims.push(
        dst && dst.bottom > -100 && dst.top < vh + 100
          ? photo.animate([REST, fromFrame(dst, cur)], { duration: 560, easing: 'cubic-bezier(0.7, 0, 0.2, 1)', fill: 'forwards' })
          : photo.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 220, fill: 'forwards' }),
      );
    }
    let done = false;
    Promise.all(anims.map((a) => a.finished)).then(() => {
      if (!done) onClosed();
      done = true;
    });
    return () => {
      done = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [closing]);

  // Escape closes; Tab stays inside the dialog.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== 'Tab' || !root.current) return;
      const list = Array.from(root.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((n) => n.offsetParent !== null);
      if (!list.length) return;
      const firstEl = list[0];
      const lastEl = list[list.length - 1];
      if (e.shiftKey && (document.activeElement === firstEl || document.activeElement === root.current)) {
        e.preventDefault();
        lastEl.focus();
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
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
      <div data-bg className="wk-dossier fixed inset-0" />

      {/* ── Top bar ── */}
      <div data-fade className="relative">
        <div className="shell flex min-h-[72px] items-center justify-between gap-4 hairline-b">
          <button ref={back} type="button" onClick={onClose} className="link-arrow group text-[14px] font-medium">
            <ArrowBack className="h-3 w-4 transition-transform duration-base ease-out group-hover:-translate-x-1" />
            <span className="link-u">All collections</span>
          </button>
          <span className="woven hidden sm:inline-flex">{drop(project.no)} · Concept collection</span>
          {onNext && next ? (
            <button type="button" onClick={onNext} className="link-arrow text-[14px] font-medium">
              <span className="link-u">
                Next<span className="hidden sm:inline">: {next.title}</span>
              </span>
              <Arrow />
            </button>
          ) : (
            <span />
          )}
        </div>
      </div>

      {/* ── The collection ── */}
      <div className="relative shell grid-12 gap-y-10 pb-16 pt-8 lg:pb-24 lg:pt-14">
        <figure className="col-span-4 sm:col-span-8 lg:col-span-7">
          <div data-d className="relative">
            {project.mood && (
              <MoodPhoto slug={project.mood.wall} ratio="landscape" treatment="grade" priority sizes="(min-width: 1536px) 860px, (min-width: 1024px) 56vw, 92vw" />
            )}
            <span className="wk-no woven woven-green">{drop(project.no)}</span>
          </div>
          <figcaption data-fade className="caption">Mood reference, not this organization or its collection</figcaption>
        </figure>

        <div className="col-span-4 flex flex-col sm:col-span-8 lg:col-span-4 lg:col-start-9">
          <p data-fade className="t-spec text-muted">{cat?.title}</p>
          <h2 data-fade id="wk-dossier-title" className="t-h1 mt-4">{project.title}</h2>
          <p data-fade className="t-spec mt-4">{project.sector}</p>
          {study && <p data-fade className="t-lead mt-8">{study.challenge}</p>}

          <dl data-fade className="mt-10 hairline-b">
            <Row k="Pieces" v={pieces(project) ?? '—'} />
            <Row k="Styles" v={String(rows.length).padStart(2, '0')} />
            <Row k="Decoration" v={project.method} />
            {project.palette && (
              <div className="hairline flex items-center justify-between gap-4 py-3">
                <dt className="t-spec text-muted">Palette</dt>
                <dd>
                  <ul className="flex gap-1.5">
                    {project.palette.map((c) => (
                      <li key={c.name} title={c.name} className="h-5 w-5 rounded-full shadow-[inset_0_0_0_1px_rgba(19,51,39,0.14)]" style={{ background: c.hex }}>
                        <span className="sr-only">{c.name}</span>
                      </li>
                    ))}
                  </ul>
                </dd>
              </div>
            )}
          </dl>

          <div data-fade className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
            <Link href={`/work/${project.slug}`} className="btn-blue">
              See the full collection <Arrow />
            </Link>
            <ShareButton w={project} />
          </div>
        </div>

        {/* ── The pieces, as flats ── */}
        <section data-fade aria-labelledby="wk-dossier-pieces" className="col-span-4 mt-6 sm:col-span-8 lg:col-span-12 lg:mt-12">
          <div className="hairline flex items-baseline justify-between pt-5">
            <h3 id="wk-dossier-pieces" className="t-spec">The pieces</h3>
            <p className="t-spec text-muted">{String(rows.length).padStart(2, '0')} styles · Drawn flats</p>
          </div>
          <ul className="wk-strip -mx-5 mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-6 sm:px-0 lg:gap-8 lg:grid-cols-5">
            {rows.map((r) => (
              <li key={r.no} className="w-[62vw] shrink-0 snap-start sm:w-auto">
                <div className="relative aspect-square bg-cream">
                  {r.flat?.art && (
                    <div className="absolute inset-[10%]">
                      <WorkArt art={r.flat.art} label={r.flat.alt} className="h-full w-full" />
                    </div>
                  )}
                </div>
                <p className="t-spec mt-3 flex justify-between gap-3">
                  <span><span className="text-muted">{r.no}</span> {r.name}</span>
                  {r.count && <span className="num">{r.count}</span>}
                </p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="hairline flex items-baseline justify-between gap-4 py-3">
      <dt className="t-spec text-muted">{k}</dt>
      <dd className="t-spec num text-right">{v}</dd>
    </div>
  );
}
