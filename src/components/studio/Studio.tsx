'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  CANVAS_GARMENTS,
  CANVAS_TECHNIQUES,
  STUDIO_COPY as COPY,
  STUDIO_GARMENTS,
  TECHNIQUES,
  type StudioGarment as Garment,
  type Technique,
  type ZoneId,
} from '@/lib/studio';
import { DRAWINGS } from './drawings';
import StudioGarment, { place, type Placed } from './StudioGarment';
import StudioIndex from './StudioIndex';
import StudioClosing from './StudioClosing';
import { HOW_SLOTS, MORE_SLOT, SIZE, WHAT_SLOTS, type Slot } from './layout';
import './studio.css';

type Mode = 'what' | 'how';

const GARMENT = new Map(STUDIO_GARMENTS.map((g) => [g.id, g]));
const TECH = new Map(TECHNIQUES.map((t) => [t.id, t]));
const pad = (n: number) => String(n).padStart(2, '0');

/** How long a newly added technique keeps playing its arrival. */
const FRESH_MS = 1600;

function reducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function shuffle<T>(xs: T[]): T[] {
  const a = [...xs];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** The recipe as a sentence, for the quote link and the finale. */
export function recipeOf(garment: Garment, techs: Technique[]) {
  return [garment.single, ...techs.map((t) => t.technical)].join(' + ');
}

/**
 * THE STUDIO.
 *
 * Replaces the old capability rows with something to play with: pick a garment,
 * then stack techniques on it and watch the piece get made. Hover previews, click
 * commits; every control is a real button, so focus previews and Enter commits.
 * The canvas gets busier as the piece does, and once it's clearly a piece, the
 * section offers to make it.
 */
export default function Studio() {
  const [mode, setMode] = useState<Mode>('what');
  const [garmentId, setGarmentId] = useState('hoodie');
  const [peekGarment, setPeekGarment] = useState<string | null>(null);
  const [stack, setStack] = useState<string[]>([]);
  const [peekTech, setPeekTech] = useState<string | null>(null);
  const [fresh, setFresh] = useState<Set<string>>(() => new Set());
  const [stripping, setStripping] = useState(false);
  const [index, setIndex] = useState<Mode | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [nowKey, setNowKey] = useState(0);
  const [said, setSaid] = useState('');
  const [busy, setBusy] = useState(false);

  const canvasRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const cursorLabelRef = useRef<HTMLSpanElement>(null);
  const dragRef = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);

  const later = useCallback((fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  }, []);
  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);
  useEffect(() => clearTimers, [clearTimers]);

  const garment = GARMENT.get(garmentId)!;
  const shown = GARMENT.get(peekGarment ?? garmentId)!;
  const techs = stack.map((id) => TECH.get(id)!);
  const count = techs.length;

  // What's on the piece right now: the stack, plus whatever is being tried on.
  const placed: Placed[] = useMemo(() => {
    const trying = mode === 'how' && peekTech && !stack.includes(peekTech) ? peekTech : null;
    const list = [...stack, ...(trying ? [trying] : [])].map((id) => TECH.get(id)!);
    const zones = place(shown, list);
    return list
      .filter((t) => zones.has(t.id))
      .map((t) => ({
        tech: t,
        zone: zones.get(t.id) ?? null,
        fresh: t.id === trying || fresh.has(t.id),
        preview: t.id === trying,
      }));
  }, [stack, peekTech, mode, shown, fresh]);

  // ── actions ────────────────────────────────────────────────────────────────

  const markFresh = useCallback(
    (id: string) => {
      setFresh((s) => new Set(s).add(id));
      later(() => setFresh((s) => {
        const n = new Set(s);
        n.delete(id);
        return n;
      }), FRESH_MS);
    },
    [later],
  );

  const enterHow = useCallback(() => {
    setMode((m) => {
      if (m !== 'how') setNowKey((k) => k + 1);
      return 'how';
    });
    setPeekGarment(null);
  }, []);

  const selectGarment = useCallback(
    (id: string, fromKeyboard = false) => {
      clearTimers();
      setBusy(false);
      setGarmentId(id);
      setPeekGarment(null);
      setSaid(`${GARMENT.get(id)!.single} selected. Now pick how to decorate it.`);
      // Let the underline land before the words clear out.
      later(() => {
        enterHow();
        if (fromKeyboard) {
          later(() => canvasRef.current?.querySelector<HTMLButtonElement>('[data-tech]:not([disabled])')?.focus(), 300);
        }
      }, reducedMotion() ? 0 : 380);
    },
    [clearTimers, enterHow, later],
  );

  const toggleTech = useCallback(
    (id: string) => {
      const t = TECH.get(id)!;
      setStack((s) => {
        if (s.includes(id)) {
          setSaid(`Removed ${t.technical}.`);
          return s.filter((x) => x !== id);
        }
        markFresh(id);
        setSaid(`Added ${t.technical}. ${s.length + 1} on the piece.`);
        return [...s, id];
      });
      setPeekTech(null);
    },
    [markFresh],
  );

  const burn = useCallback(() => {
    clearTimers();
    setBusy(false);
    setNote(null);
    setStripping(true);
    later(() => {
      setStack([]);
      setStripping(false);
      setMode('what');
      setSaid('Cleared. Back to a blank piece.');
    }, reducedMotion() ? 0 : 420 + count * 55);
  }, [clearTimers, count, later]);

  /** Flip through the rail, land somewhere, then throw techniques at it. */
  const surprise = useCallback(() => {
    clearTimers();
    setIndex(null);
    setNote(null);
    setStack([]);
    setBusy(true);
    setMode('what');
    const quick = reducedMotion();
    const rail = shuffle(STUDIO_GARMENTS.slice(0, CANVAS_GARMENTS).map((g) => g.id).filter((id) => id !== garmentId));
    const flips = quick ? [] : rail.slice(0, 7);
    const land = rail[7] ?? rail[0];
    let t = 0;
    flips.forEach((id, i) => {
      t += 60 + i * 12;
      later(() => setPeekGarment(id), t);
    });
    t += quick ? 0 : 140;
    later(() => {
      setGarmentId(land);
      setPeekGarment(null);
      enterHow();
    }, t);

    // Mostly marks, at most one cloth treatment, so the piece stays a piece.
    const marks = shuffle(TECHNIQUES.filter((x) => x.layer === 'mark' && x.id !== 'sleeve'));
    const cloth = shuffle(TECHNIQUES.filter((x) => x.layer === 'cloth'));
    const n = 3 + Math.floor(Math.random() * 3);
    const pick = [...marks.slice(0, n - 1), ...(Math.random() < 0.6 ? cloth.slice(0, 1) : marks.slice(n - 1, n))];
    t += quick ? 0 : 520;
    pick.forEach((x, i) => {
      later(() => {
        setStack((s) => [...s, x.id]);
        markFresh(x.id);
      }, t + i * (quick ? 0 : 280));
    });
    later(() => {
      setBusy(false);
      setNote(COPY.surprised);
      setSaid(`Surprise: ${GARMENT.get(land)!.single} with ${pick.map((x) => x.technical).join(', ')}.`);
      later(() => setNote(null), 2600);
    }, t + pick.length * (quick ? 0 : 280) + 200);
  }, [clearTimers, enterHow, garmentId, later, markFresh]);

  // ── pointer: parallax, metallic light, cursor label ────────────────────────

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    const el = canvasRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const mx = (e.clientX - r.left) / r.width;
    const my = (e.clientY - r.top) / r.height;
    el.style.setProperty('--st-mx', mx.toFixed(3));
    el.style.setProperty('--st-px', ((mx - 0.5) * 2).toFixed(3));
    el.style.setProperty('--st-py', ((my - 0.5) * 2).toFixed(3));

    const cur = cursorRef.current;
    if (!cur || e.pointerType !== 'mouse') return;
    cur.style.transform = `translate3d(${e.clientX - r.left}px, ${e.clientY - r.top}px, 0)`;
    const target = (e.target as HTMLElement).closest<HTMLElement>('[data-cursor]');
    const label = target?.dataset.cursor ?? '';
    if (cursorLabelRef.current && cursorLabelRef.current.textContent !== label) cursorLabelRef.current.textContent = label;
    cur.classList.toggle('has-label', !!label);
    cur.classList.add('is-on');
    el.classList.add('st-cursor-on');
  }, []);

  const onPointerLeave = useCallback(() => {
    cursorRef.current?.classList.remove('is-on');
    canvasRef.current?.classList.remove('st-cursor-on');
    canvasRef.current?.style.setProperty('--st-px', '0');
    canvasRef.current?.style.setProperty('--st-py', '0');
  }, []);

  // ── garment drag: a little give, then it springs home ──────────────────────

  const drag = useRef<{ x: number; y: number; id: number } | null>(null);
  const onGarmentDown = (e: React.PointerEvent) => {
    if (e.pointerType === 'touch' || !dragRef.current) return;
    drag.current = { x: e.clientX, y: e.clientY, id: e.pointerId };
    dragRef.current.classList.remove('st-spring');
    dragRef.current.setPointerCapture(e.pointerId);
  };
  const onGarmentMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId || !dragRef.current) return;
    // Rubber-banded: follows the hand at first, then resists, never past 30px.
    const give = (v: number) => 30 * Math.tanh(v / 60);
    dragRef.current.style.transform = `translate3d(${give(e.clientX - d.x)}px, ${give(e.clientY - d.y)}px, 0) rotate(${give(e.clientX - d.x) / 15}deg)`;
  };
  const onGarmentUp = (e: React.PointerEvent) => {
    if (!drag.current || drag.current.id !== e.pointerId || !dragRef.current) return;
    drag.current = null;
    dragRef.current.classList.add('st-spring');
    dragRef.current.style.transform = '';
  };

  // ── derived bits for the canvas ────────────────────────────────────────────

  const chaos = count;
  const piece = recipeOf(garment, techs);
  const quoteHref = `/quote?piece=${encodeURIComponent(piece)}`;
  const garmentWords = STUDIO_GARMENTS.slice(0, CANVAS_GARMENTS);
  const techWords = TECHNIQUES.slice(0, CANVAS_TECHNIQUES);
  const moreGarments = STUDIO_GARMENTS.length - CANVAS_GARMENTS;
  const moreTechs = TECHNIQUES.length - CANVAS_TECHNIQUES;
  const shownIndex = STUDIO_GARMENTS.indexOf(shown) + 1;

  const garmentButton = (g: Garment, i: number, layout: 'canvas' | 'rail') => {
    const selected = g.id === garmentId;
    return (
      <button
        type="button"
        aria-pressed={selected}
        data-cursor={selected ? 'Selected' : 'Try on'}
        onPointerEnter={(e) => e.pointerType === 'mouse' && setPeekGarment(g.id)}
        onPointerLeave={(e) => e.pointerType === 'mouse' && setPeekGarment(null)}
        onFocus={(e) => e.currentTarget.matches(':focus-visible') && setPeekGarment(g.id)}
        onBlur={() => setPeekGarment(null)}
        onClick={(e) => selectGarment(g.id, e.detail === 0)}
        className={`caps group relative whitespace-nowrap text-left ${layout === 'rail' ? 'py-2' : ''}`}
      >
        <span className={`st-verb ${selected ? 'st-underline' : ''} ${peekGarment === g.id ? 'text-electric' : ''}`}>
          {g.name}
        </span>
        <sup className="label ml-1 align-super text-[9px] text-muted">{pad(i + 1)}</sup>
        {selected && (
          <span className="label st-pop absolute left-0 top-full mt-2 flex items-center gap-1.5 whitespace-nowrap text-electric [writing-mode:horizontal-tb]">
            <span className="inline-block h-[5px] w-[5px] bg-electric" aria-hidden />
            Selected
          </span>
        )}
      </button>
    );
  };

  const techButton = (t: Technique, i: number, layout: 'canvas' | 'rail') => {
    const on = stack.includes(t.id);
    const hot = peekTech === t.id;
    return (
      <button
        type="button"
        data-tech={t.id}
        aria-pressed={on}
        data-cursor={on ? 'Remove' : 'Add'}
        data-hot={hot || undefined}
        disabled={busy}
        onPointerEnter={(e) => e.pointerType === 'mouse' && setPeekTech(t.id)}
        onPointerLeave={(e) => e.pointerType === 'mouse' && setPeekTech(null)}
        onFocus={(e) => e.currentTarget.matches(':focus-visible') && setPeekTech(t.id)}
        onBlur={() => setPeekTech(null)}
        onClick={() => toggleTech(t.id)}
        className={`caps st-fx-${t.engine} relative whitespace-nowrap text-left disabled:cursor-default ${on ? 'st-on' : ''} ${layout === 'rail' ? 'py-2' : ''}`}
      >
        <span className="st-verb">{t.verb}.</span>
        <span className="label mt-2 block text-[9.5px] font-normal normal-case tracking-[0.1em] text-muted">
          <span className="uppercase">{pad(i + 1)} / {t.technical}</span>
        </span>
      </button>
    );
  };

  return (
    <section id="studio" aria-labelledby="studio-title" className="relative overflow-hidden bg-white">
      {/* ── opening ── */}
      <div className="shell pb-14 pt-24 sm:pb-20 sm:pt-36">
        <div className="flex items-baseline justify-between gap-6">
          <p className="label text-muted">{COPY.eyebrow}</p>
          <p className="label hidden text-muted sm:block">{COPY.eyebrowRight}</p>
        </div>
        <h2 id="studio-title" className="caps mt-10 text-d0 sm:mt-14">
          {COPY.headline.map((l) => (
            <span key={l} className="block">{l}</span>
          ))}
          <span className="mt-2 block font-serif font-normal normal-case italic text-electric">{COPY.script}</span>
        </h2>
      </div>

      {/* ── chapters: WHAT / HOW ── */}
      <div className="shell hidden lg:block">
        <div className="grid grid-cols-2 gap-6 border-t border-ink pt-6 sm:gap-10">
          {(['what', 'how'] as const).map((m) => {
            const c = COPY[m];
            const active = mode === m;
            return (
              <button
                key={m}
                type="button"
                aria-pressed={active}
                onClick={() => (m === 'how' ? enterHow() : setMode('what'))}
                className="group text-left"
              >
                <span className="label flex items-center gap-2 text-muted">
                  <span className={active ? 'text-electric' : ''}>{c.n} /</span>
                  {active && <span className="inline-block h-[5px] w-[5px] bg-electric" aria-hidden />}
                </span>
                <span
                  className={`caps mt-3 block text-[clamp(2.5rem,7.5vw,7rem)] leading-[0.84] tracking-[-0.045em] transition-colors ${
                    active ? 'text-ink' : 'outlined text-ink/40 group-hover:text-ink'
                  }`}
                >
                  {c.label}
                </span>
                <span className={`mt-3 block text-[0.9375rem] transition-colors ${active ? 'text-ink' : 'text-muted'}`}>
                  {m === 'how' && active ? `${COPY.now.join(' ')}` : c.line}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── the canvas ── */}
      <div
        ref={canvasRef}
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
        className="st-canvas relative mx-auto flex max-w-[1680px] flex-col px-5 sm:px-8 lg:mt-4 lg:block lg:h-[clamp(700px,94vh,960px)] lg:px-0"
      >
        {/* Chaos, behind everything: the table fills up as the piece does. */}
        <ChaosLayer chaos={chaos} garment={garment} techs={techs} />

        {/* Phase two arrives over the canvas and gets out of the way. */}
        {mode === 'how' && nowKey > 0 && (
          <div
            key={nowKey}
            aria-hidden
            className="st-now pointer-events-none absolute inset-x-0 top-[30%] z-[5] hidden text-center lg:block"
          >
            <p className="caps text-[clamp(4rem,11vw,12rem)] leading-[0.82] tracking-[-0.05em] text-ink/[0.07]">
              {COPY.now[0]}
              <br />
              {COPY.now[1]}
            </p>
          </div>
        )}

        {/* Words: art-directed on desktop. Both sets are always there; the idle
            one has left the canvas and is out of the tab order. */}
        <div className="hidden lg:block">
          <WordSet active={mode === 'what'} slots={WHAT_SLOTS} label="Garments">
            {garmentWords.map((g, i) => garmentButton(g, i, 'canvas'))}
          </WordSet>
          <WordSet active={mode === 'how'} slots={HOW_SLOTS} label="Techniques">
            {techWords.map((t, i) => techButton(t, i, 'canvas'))}
          </WordSet>
          <MoreLink
            slot={MORE_SLOT[mode]}
            n={mode === 'what' ? moreGarments : moreTechs}
            onClick={() => setIndex(mode)}
          />
        </div>

        {/* The piece. */}
        <div className="pointer-events-none relative z-20 order-1 mx-auto aspect-square w-full max-w-[560px] lg:absolute lg:left-1/2 lg:top-[4%] lg:h-[86%] lg:w-auto lg:max-w-none lg:-translate-x-1/2">
          <div
            ref={dragRef}
            data-cursor="Drag"
            onPointerDown={onGarmentDown}
            onPointerMove={onGarmentMove}
            onPointerUp={onGarmentUp}
            onPointerCancel={onGarmentUp}
            className="st-drag relative h-full w-full select-none"
          >
            <div className="st-parallax h-full w-full">
              <div className="st-float h-full w-full">
                <div key={shown.id} className="st-garment-in relative h-full w-full">
                  <StudioGarment
                    garment={shown}
                    placed={placed}
                    stripping={stripping}
                    label={`${shown.single}${count ? `, with ${techs.map((t) => t.technical).join(', ')}` : ', blank'}`}
                  />
                  <Callouts placed={placed} garment={shown} />
                </div>
              </div>
            </div>
          </div>

          {/* Hovering a garment: a quiet tech note, not a product description. */}
          <div
            key={shown.id}
            className="label st-pop pointer-events-none absolute left-1/2 top-[96%] hidden -translate-x-1/2 whitespace-nowrap text-muted lg:flex lg:gap-3"
            aria-hidden
          >
            <span className="text-ink">{shown.single} / {pad(shownIndex)}</span>
            {shown.technicalLabel.map((l) => (
              <span key={l}>· {l}</span>
            ))}
          </div>

          {note && (
            <p className="caps st-pop pointer-events-none absolute -right-4 top-[46%] z-30 rotate-[-4deg] bg-electric px-3 py-2 text-[clamp(1rem,1.6vw,1.5rem)] text-ink">
              {note}
            </p>
          )}
        </div>

        {/* Utilities: small, top right. */}
        <div className="relative z-40 order-3 mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 lg:absolute lg:right-8 lg:top-auto lg:bottom-[3%] lg:mt-0 lg:justify-end">
          <button type="button" onClick={surprise} className="label group text-left" data-cursor="Go">
            <span className="text-muted">{COPY.lazy} </span>
            <span className="text-ink underline-offset-4 group-hover:text-electric group-hover:underline">{COPY.surprise} →</span>
          </button>
          <button type="button" onClick={() => setIndex(mode)} className="label text-ink underline-offset-4 hover:text-electric hover:underline" data-cursor="Open">
            View all / {pad(mode === 'what' ? STUDIO_GARMENTS.length : TECHNIQUES.length)}
          </button>
          {count > 0 && (
            <button type="button" onClick={burn} className="label st-pop text-ink underline-offset-4 hover:text-electric hover:underline" data-cursor="Burn">
              {COPY.reset} ↺
            </button>
          )}
        </div>

        {/* Mobile: WHAT/HOW rails under the garment, oversized, swipeable. */}
        <div className="order-2 lg:hidden">
          <div className="mt-6 grid grid-cols-2 border-t border-ink pt-3">
            {(['what', 'how'] as const).map((m) => (
              <button
                key={m}
                type="button"
                aria-pressed={mode === m}
                onClick={() => (m === 'how' ? enterHow() : setMode('what'))}
                className="text-left"
              >
                <span className={`label ${mode === m ? 'text-electric' : 'text-muted'}`}>{COPY[m].n} /</span>
                <span className={`caps block text-[2.5rem] leading-[0.9] tracking-[-0.04em] ${mode === m ? '' : 'outlined text-ink/40'}`}>
                  {COPY[m].label}
                </span>
                <span className="mt-1 block text-[0.8125rem] text-muted">{m === 'how' && mode === 'how' ? COPY.now.join(' ') : COPY[m].line}</span>
              </button>
            ))}
          </div>
          <div className="st-rail -mx-5 mt-6 flex scroll-px-5 gap-8 overflow-x-auto px-5 pb-9 sm:scroll-px-8 text-[clamp(2.25rem,11vw,3.5rem)] sm:-mx-8 sm:px-8">
            {mode === 'what'
              ? STUDIO_GARMENTS.map((g, i) => <div key={g.id} className="shrink-0">{garmentButton(g, i, 'rail')}</div>)
              : TECHNIQUES.map((t, i) => <div key={t.id} className="shrink-0">{techButton(t, i, 'rail')}</div>)}
          </div>
          <p className="label text-muted">Swipe for more →</p>
        </div>

        {/* Recipe: bottom left. */}
        <Recipe garment={garment} techs={techs} />

        {/* Payoff: the canvas notices you made something. */}
        <div className="relative z-40 order-5 mb-10 mt-6 lg:absolute lg:bottom-[11%] lg:right-8 lg:mb-0 lg:mt-0 lg:text-right">
          {count >= 3 && count < 5 && <p className="caps st-pop text-d3">{COPY.okay}</p>}
          {count >= 5 && (
            <div className="st-pop">
              <p className="caps text-d3">{COPY.piece}</p>
              <p className="mt-2 text-[0.9375rem] text-muted">{COPY.want}</p>
              <Link href={quoteHref} className="label mt-3 inline-block text-electric underline underline-offset-4">
                {COPY.cta} →
              </Link>
            </div>
          )}
        </div>

        {/* The custom cursor. Decorative: every control works without it. */}
        <div ref={cursorRef} className="st-cursor hidden lg:block" aria-hidden>
          <div className="st-cursor-dot" />
          <span ref={cursorLabelRef} className="st-cursor-label label" />
        </div>

        {index && (
          <StudioIndex
            kind={index}
            garment={garment}
            stack={stack}
            onPickGarment={(id) => {
              setIndex(null);
              selectGarment(id);
            }}
            onToggleTech={(id) => {
              setIndex(null);
              enterHow();
              if (!stack.includes(id)) toggleTech(id);
            }}
            onClose={() => setIndex(null)}
          />
        )}

        <p className="sr-only" aria-live="polite">{said}</p>
      </div>

      {/* ── finale: it's a piece now ── */}
      <div className={`st-collapse ${count >= 4 ? 'is-open' : ''}`} aria-hidden={count < 4}>
        <div>
          <div className="shell border-t border-rule py-16 sm:py-24">
            <p className="label text-muted">{COPY.youPicked}</p>
            <p className="caps mt-4 text-d3">
              {[garment.single, ...techs.map((t) => t.technical)].map((w, i) => (
                <span key={w}>
                  {i > 0 && <span className="text-electric"> / </span>}
                  {w}
                </span>
              ))}
            </p>
            <div className="mt-12 flex flex-col items-start justify-between gap-10 lg:flex-row lg:items-end">
              <p className="caps text-d0">
                {COPY.canMake[0]}
                <br />
                <span className="font-serif font-normal normal-case italic text-electric">{COPY.canMake[1]}</span>
              </p>
              <Link href={quoteHref} className="btn-blue" tabIndex={count < 4 ? -1 : undefined}>
                {COPY.ctaProject} →
              </Link>
            </div>
          </div>
        </div>
      </div>

      <StudioClosing garment={count > 0 ? garment : null} placed={placed.filter((p) => !p.preview).map((p) => ({ ...p, fresh: false }))} />
    </section>
  );
}

// ── pieces ─────────────────────────────────────────────────────────────────

function slotStyle(s: Slot): React.CSSProperties {
  const style: React.CSSProperties = { top: `${s.y}%` };
  if (s.x !== undefined) style.left = `${s.x}%`;
  if (s.r !== undefined) style.right = `${s.r}%`;
  return style;
}

/**
 * One vocabulary on the canvas. Each word gets a slot; when the set leaves, each
 * word is pushed outward from where it sits, so the canvas clears from the middle.
 */
function WordSet({
  active,
  slots,
  label,
  children,
}: {
  active: boolean;
  slots: Slot[];
  label: string;
  children: React.ReactNode[];
}) {
  return (
    <div role="group" aria-label={label} aria-hidden={!active} inert={!active}>
      {children.map((child, i) => {
        const s = slots[i % slots.length];
        const left = s.x !== undefined ? s.x < 50 : false;
        const push = left ? '-12vw' : '12vw';
        return (
          <div
            key={i}
            className={`st-word caps absolute z-10 ${SIZE[s.size]} ${s.vertical ? 'st-vertical' : ''} ${active ? '' : 'st-away'} ${
              s.r !== undefined ? 'text-right' : ''
            }`}
            style={{
              ...slotStyle(s),
              ['--ox' as string]: push,
              ['--oy' as string]: `${(i % 3) * 14 - 14}px`,
              transitionDelay: active ? `${120 + i * 28}ms` : `${i * 12}ms`,
            }}
          >
            {child}
          </div>
        );
      })}
    </div>
  );
}

function MoreLink({ slot, n, onClick }: { slot: Slot; n: number; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-cursor="Open"
      className="label absolute z-10 text-ink underline-offset-4 hover:text-electric hover:underline"
      style={slotStyle(slot)}
    >
      + {n} more
    </button>
  );
}

/**
 * Leader lines from each mark to the edge of the garment, with the process name.
 * The newest (or the one being tried on) is blue; the rest are muted.
 */
function Callouts({ placed, garment }: { placed: Placed[]; garment: Garment }) {
  const marks = placed.filter((p) => p.zone).slice(-5);
  const newest = marks[marks.length - 1]?.tech.id;
  // Nudge labels on the same side apart so they never stack.
  const sides: Record<'l' | 'r', number[]> = { l: [], r: [] };
  const rows = marks.map((p) => {
    const z = garment.zones[p.zone as ZoneId]!;
    const side: 'l' | 'r' = z.x <= 200 ? 'l' : 'r';
    let y = z.y;
    while (sides[side].some((u) => Math.abs(u - y) < 22)) y += 22;
    sides[side].push(y);
    return { p, z, side, y };
  });

  return (
    <div className="pointer-events-none absolute inset-0 hidden lg:block" aria-hidden>
      {rows.map(({ p, z, side, y }) => {
        const hot = p.tech.id === newest;
        const x = (z.x / 400) * 100;
        // The line stops at the mark's edge so it never crosses the artwork.
        const reach = ((z.tall ? z.w * 0.22 : z.w / 2) / 400) * 100;
        const top = (y / 400) * 100;
        const edge = 3;
        const inner = side === 'l' ? x - reach : x + reach;
        return (
          <div
            key={p.tech.id}
            className={`st-pop absolute ${hot ? 'z-10 text-electric' : 'text-ink/50'}`}
            style={{ top: `${top}%`, left: 0, right: 0 }}
          >
            <span
              className={`absolute top-0 h-px bg-current ${side === 'l' ? 'st-draw-x-r' : 'st-draw-x'}`}
              style={side === 'l' ? { left: `${edge}%`, right: `${100 - inner}%` } : { left: `${inner}%`, right: `${edge}%` }}
            />
            <span className="absolute top-0 h-[5px] w-[5px] -translate-y-1/2 bg-current" style={{ left: `${side === 'l' ? edge : 100 - edge}%` }} />
            <span
              className={`label absolute bottom-0 mb-1 whitespace-nowrap bg-white/90 px-1 ${side === 'l' ? 'text-left' : 'text-right'}`}
              style={side === 'l' ? { left: `${edge}%` } : { right: `${edge}%` }}
            >
              {p.tech.technical}
            </span>
            {hot && (
              <span
                className={`label absolute top-0 mt-1.5 whitespace-nowrap bg-white/90 px-1 text-muted`}
                style={side === 'l' ? { left: `${edge}%` } : { right: `${edge}%` }}
              >
                {p.tech.microcopy}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

/** The product developer's running notes. */
function Recipe({ garment, techs }: { garment: Garment; techs: Technique[] }) {
  // Keeps to six lines so it never climbs into the canvas; the oldest fold away.
  const hidden = Math.max(0, techs.length - 6);
  return (
    <div className="label relative z-40 order-4 mt-8 text-muted lg:absolute lg:bottom-[3%] lg:left-8 lg:mt-0">
      <p className="text-ink">Your piece / {pad(techs.length)}</p>
      <p className="mt-3 text-ink">{garment.single}</p>
      {hidden > 0 && <p className="mt-1">+ {hidden} earlier</p>}
      {techs.slice(hidden).map((t, i, shown) => (
        <p key={t.id} className={`st-pop mt-1 ${i === shown.length - 1 ? 'text-electric' : ''}`}>
          + {t.technical}
        </p>
      ))}
      {techs.length === 0 && <p className="mt-1">+ nothing yet</p>}
    </div>
  );
}

/**
 * The table filling up. One mark: callouts only. Two: a colour chip and the grid.
 * Three: crop marks, a placement line, the construction notes. Five: a swatch, a
 * back sketch, a crosshair, and the recipe written large behind the piece. All of
 * it stays out of the way of the garment and never takes a click.
 */
function ChaosLayer({ chaos, garment, techs }: { chaos: number; garment: Garment; techs: Technique[] }) {
  return (
    <div className="pointer-events-none absolute inset-0 hidden lg:block" aria-hidden>
      <div className={`st-grid absolute inset-0 transition-opacity duration-700 ${chaos >= 2 ? 'opacity-100' : 'opacity-0'}`} />

      {chaos >= 2 && (
        <div className="st-pop absolute left-[62%] top-[7%] z-[15] w-[84px] rotate-[3deg] bg-white p-1.5 shadow-[0_6px_18px_-10px_rgba(0,0,0,0.45)]">
          <div className="h-[46px] bg-electric" />
          <p className="label mt-1.5 whitespace-nowrap text-[9px] text-ink">PMS 2728 C</p>
        </div>
      )}

      {chaos >= 3 && (
        <>
          {[
            'left-6 top-4 border-l border-t',
            'right-6 top-4 border-r border-t',
            'left-6 bottom-4 border-b border-l',
            'right-6 bottom-4 border-b border-r',
          ].map((c) => (
            <span key={c} className={`st-pop absolute h-4 w-4 border-ink/50 ${c}`} />
          ))}
          <div className="st-pop absolute left-[33%] right-[33%] top-[92.5%] z-[15] flex items-center gap-2 text-ink/60">
            <span className="h-3 w-px bg-current" />
            <span className="st-draw-x h-px flex-1 bg-current" />
            <span className="label text-[9px]">Placement / centre front</span>
            <span className="st-draw-x h-px flex-1 bg-current" />
            <span className="h-3 w-px bg-current" />
          </div>
        </>
      )}

      {chaos >= 5 && (
        <>
          <p className="caps st-pop absolute inset-x-0 top-[14%] z-0 text-center text-[clamp(4rem,10vw,11rem)] leading-[0.82] tracking-[-0.05em] text-ink/[0.05]">
            {techs.slice(0, 3).map((t) => (
              <span key={t.id} className="block">{t.verb}</span>
            ))}
          </p>
          <div className="st-pop absolute bottom-[6%] left-[27%] z-[15] h-[120px] w-[150px] -rotate-[7deg]">
            <div className="st-swatch absolute inset-0" />
            <div className="st-tape absolute -top-2 left-1/2 h-4 w-14 -translate-x-1/2 rotate-[4deg]" />
            <p className="label absolute bottom-2 left-2 text-[9px] text-ink/70">Swatch / A</p>
          </div>
          <div className="st-pop absolute right-[27%] top-[62%] z-[15] w-[96px] rotate-[2deg] border border-ink/25 bg-white/80 p-2">
            <svg viewBox="0 0 400 400" className="h-auto w-full -scale-x-100 opacity-60">
              <MiniSketch garment={garment} />
            </svg>
            <p className="label mt-1 text-[9px] text-ink/70">Back / ref.</p>
          </div>
          <svg className="st-pop absolute left-1/2 top-[48%] z-[25] h-8 w-8 -translate-x-1/2 -translate-y-1/2 text-electric" viewBox="0 0 32 32">
            <circle cx="16" cy="16" r="7" fill="none" stroke="currentColor" strokeWidth="1" />
            <path d="M16 0v11M16 21v11M0 16h11M21 16h11" stroke="currentColor" strokeWidth="1" />
          </svg>
        </>
      )}
    </div>
  );
}

/** Outline-only version of the drawing, for the back reference card. */
function MiniSketch({ garment }: { garment: Garment }) {
  if (garment.backAsset) {
    // eslint-disable-next-line jsx-a11y/alt-text
    return <image href={garment.backAsset} width="400" height="400" />;
  }
  return <SketchPaths drawing={garment.drawing} />;
}

function SketchPaths({ drawing }: { drawing: Garment['drawing'] }) {
  return (
    <g fill="none" stroke="#0E1A47" strokeWidth="4" strokeLinejoin="round">
      {DRAWINGS[drawing].map((p, i) =>
        p.t === 'body' || p.t === 'accent' || p.t === 'shade' ? <path key={i} d={p.d} /> : null,
      )}
    </g>
  );
}
