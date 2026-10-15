'use client';

import { useLayoutEffect, useRef, useState } from 'react';
import Reveal from '@/components/Reveal';
import Thread from '@/components/thread/Thread';
import { register } from '@/lib/reveal';
import { PROCESS, type StageId } from '@/lib/process';
import { fade, rise, type Cue } from '@/lib/thread';
import Brief from './Brief';
import Design from './Design';
import Quote from './Quote';
import Made, { MADE_SPAN } from './Made';

/**
 * How it works, as one piece of editorial art rather than a timeline.
 *
 * A single court-green thread wanders across the section and makes each stage as it
 * passes: it loosely stitches a rough sketch (BRIEF), runs a clean seam around a
 * technical flat (DESIGN), stitches a production ticket down so it can be stamped
 * (QUOTE), and satin-fills an outline until the finished garment shows through
 * (MADE). Then it runs out of the section.
 *
 * Nothing here is interactive and nothing loops. Each stage cues once as it
 * reaches the fold; the thread plays through and the section goes still. Stage
 * content ('seen') appears the moment its stage is reached, so a fast scroller
 * reads all four; only the thread's work ('sew') queues behind the stage before
 * it, and speeds up when it has fallen behind.
 *
 * Inside each artifact the thread is local SVG. Between artifacts it is one
 * overlay, whose legs are measured from where each artifact's stitching starts
 * and ends (and which way it is heading), so the strand is continuous at any
 * size without hand-tuned paths per breakpoint.
 */

const ORDER: StageId[] = ['brief', 'design', 'quote', 'made'];

/** How long each stage's thread work takes, for queueing the next one. */
const SPAN: Record<StageId, number> = { brief: 2150, design: 2300, quote: 2550, made: MADE_SPAN };
/** Travel into a stage. */
const TRAVEL = 950;
/** When the thread leaves MADE for the edge of the section. */
const EXIT_AT = MADE_SPAN - 700;

type Cues = Record<StageId, { seen: Cue; sew: Cue }>;
const DONE = { seen: 'done', sew: 'done' } as const;

type End = { x: number; y: number; dx: number; dy: number };
type Route = { w: number; h: number; legs: string[]; holes: { x: number; y: number }[] };

export default function Process() {
  const root = useRef<HTMLElement>(null);
  const [cues, setCues] = useState<Cues>({ brief: DONE, design: DONE, quote: DONE, made: DONE });
  const [route, setRoute] = useState<Route | null>(null);

  // Measure the thread's route between artifacts, and keep it measured.
  useLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    const measure = () => setRoute(trace(el));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    document.fonts?.ready.then(measure);
    return () => ro.disconnect();
  }, []);

  // Arm the stages still below the fold. Runs before paint, so nothing flashes.
  useLayoutEffect(() => {
    const el = root.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const pending = ORDER.flatMap((id) => {
      const trigger = el.querySelector<HTMLElement>(`[data-trigger="${id}"]`);
      return trigger && trigger.getBoundingClientRect().top >= window.innerHeight ? [{ id, trigger }] : [];
    });
    if (!pending.length) return;

    setCues((c) => {
      const next = { ...c };
      for (const { id } of pending) next[id] = { seen: 'idle', sew: 'idle' };
      return next;
    });

    let queue = 0;
    const offs = pending.map(({ id, trigger }) =>
      register({
        el: trigger,
        show: () => {
          // Queue behind the stage before, but never by much: someone scrolling
          // fast is looking at this stage, not waiting on the last one.
          const now = performance.now();
          const lag = Math.min(Math.max(0, queue - now), 700);
          const start = now + lag;
          const k = lag > 300 ? 0.6 : 1;
          queue = start + SPAN[id] * k;
          setCues((c) => ({ ...c, [id]: { seen: { base: 0, k: 1 }, sew: { base: lag, k } } }));
        },
      }),
    );
    return () => offs.forEach((off) => off());
  }, []);

  const s = PROCESS.stages;
  const legCue = [cues.brief.sew, cues.design.sew, cues.quote.sew, cues.made.sew, cues.made.sew];
  const legAt = [0, 0, 0, 0, EXIT_AT];

  return (
    <section ref={root} className="textile relative overflow-hidden text-ink">
      <header className="shell relative pt-24 sm:pt-32">
        <Reveal>
          <p className="label text-ash/60">{PROCESS.eyebrow}</p>
        </Reveal>
        <Reveal delay={80}>
          <h2 className="caps mt-6 text-[clamp(2.35rem,8.4vw,7.25rem)] leading-[0.88] tracking-[-0.035em]">
            {PROCESS.headline[0]}
            <br />
            {PROCESS.headline[1]}
          </h2>
        </Reveal>
        <Reveal delay={160}>
          <p className="mt-5 font-serif text-d2 italic text-uv sm:ml-[18%] lg:ml-[44%]">{PROCESS.note}</p>
        </Reveal>
      </header>

      <div className="shell pb-24 pt-20 sm:pb-32 lg:pt-24">
        <ol className="relative flex flex-col lg:block lg:aspect-[1216/1900]">
          {/* 01 — small, a little left: the idea as it arrives. */}
          <li>
            <div
              data-trigger="brief"
              className="relative z-10 ml-[3%] w-[70%] max-w-[330px] lg:absolute lg:left-[1.5%] lg:top-0 lg:ml-0 lg:w-[26%] lg:max-w-none"
            >
              <Brief seen={cues.brief.seen} sew={cues.brief.sew} uid="pb" />
            </div>
            <Caption
              id="brief"
              seen={cues.brief.seen}
              className="ml-[3%] mt-12 max-w-[20rem] lg:absolute lg:left-[1.5%] lg:top-[24.5%] lg:ml-0 lg:mt-0 lg:w-[25%]"
            />
          </li>

          {/* 02 — larger and central: the idea made precise. */}
          <li>
            <div
              data-trigger="design"
              className="relative z-10 ml-auto mt-24 w-[94%] max-w-[560px] lg:absolute lg:left-[41%] lg:top-[4.5%] lg:mt-0 lg:w-[50%] lg:max-w-none"
            >
              <Design seen={cues.design.seen} sew={cues.design.sew} uid="pd" />
            </div>
            <Caption
              id="design"
              big
              seen={cues.design.seen}
              className="ml-auto mt-10 max-w-[20rem] text-right lg:absolute lg:left-[70%] lg:top-[37%] lg:mt-0 lg:w-[28%] lg:max-w-none lg:text-left"
            />
          </li>

          {/* 03 — compact, offset: a physical ticket. */}
          <li>
            <div
              data-trigger="quote"
              className="relative z-10 ml-[8%] mt-24 w-max lg:absolute lg:left-[10%] lg:top-[41%] lg:ml-0 lg:mt-0"
            >
              <Quote seen={cues.quote.seen} sew={cues.quote.sew} />
            </div>
            <Caption
              id="quote"
              seen={cues.quote.seen}
              className="ml-[8%] mt-14 lg:absolute lg:left-[36%] lg:top-[45%] lg:ml-0 lg:mt-0 lg:w-[22%]"
            />
          </li>

          {/* 04 — the payoff: bigger than everything before it, off the grid. */}
          <li>
            <div
              data-made
              className="relative z-10 -mr-[16%] ml-[-6%] mt-16 w-[122%] max-w-none sm:mx-auto sm:w-[100%] sm:max-w-[680px] lg:absolute lg:left-[39.5%] lg:top-[51%] lg:mx-0 lg:mt-0 lg:w-[66%] lg:max-w-none"
            >
              {/* Cue MADE once a good part of it is on screen, not at its top edge. */}
              <span data-trigger="made" aria-hidden className="pointer-events-none absolute inset-x-0 top-[34%] h-px" />
              <Made seen={cues.made.seen} sew={cues.made.sew} uid="pm" />
            </div>
            <div
              className="relative z-30 mt-4 lg:absolute lg:left-[1.5%] lg:top-[84%] lg:mt-0 lg:w-[60%]"
              style={rise(cues.made.seen, 400)}
            >
              <p className="label text-ash/60">
                {s.made.n} / {s.made.name}
              </p>
              <h3 className="caps mt-5 text-d1">{s.made.title}</h3>
              <p className="mt-4 font-serif text-d2 italic text-uv">{s.made.note}</p>
            </div>
          </li>
        </ol>
      </div>

      {/* The thread between artifacts, and out of the section. */}
      {route && (
        <svg
          aria-hidden
          className="pointer-events-none absolute inset-0 z-20 h-full w-full"
          viewBox={`0 0 ${route.w} ${route.h}`}
        >
          {route.legs.map((d, i) => (
            <Thread key={i} d={d} cue={legCue[i]} at={legAt[i]} dur={i === 4 ? 900 : TRAVEL} width={2.2} />
          ))}
          {/* Where the strand goes into the surface and comes back out. */}
          {route.holes.map((h, i) => {
            // Holes alternate in/out: an in lands at the end of leg i/2, an out
            // leaves at the start of the leg after it.
            const n = Math.floor((i + 1) / 2);
            return (
              <circle
                key={i}
                cx={h.x}
                cy={h.y}
                r={2}
                fill="#000"
                fillOpacity={0.55}
                style={fade(legCue[n], legAt[n] + (i % 2 ? 0 : TRAVEL), 200)}
              />
            );
          })}
        </svg>
      )}
    </section>
  );
}

function Caption({ id, seen, big = false, className }: { id: StageId; seen: Cue; big?: boolean; className: string }) {
  const s = PROCESS.stages[id];
  return (
    <div className={`relative z-30 ${className}`} style={rise(seen, 300)}>
      <p className="label text-ash/60">
        {s.n} / {s.name}
      </p>
      <h3 className={`caps mt-4 ${big ? 'text-d2' : 'text-d3'}`}>{s.title}</h3>
      <p className="mt-3 text-[0.9375rem] leading-snug text-ash/70">{s.note}</p>
    </div>
  );
}

// ── Route ───────────────────────────────────────────────────────────────────

/** A point `len` along an SVG path, in `box` coordinates. */
function at(el: SVGGeometryElement, len: number, box: DOMRect) {
  const p = el.getPointAtLength(len);
  const m = el.getScreenCTM();
  if (!m) return { x: 0, y: 0 };
  return { x: m.a * p.x + m.c * p.y + m.e - box.left, y: m.b * p.x + m.d * p.y + m.f - box.top };
}

function end(el: SVGGeometryElement, box: DOMRect, which: 'head' | 'tail'): End {
  const L = el.getTotalLength();
  const [a, b] = which === 'head' ? [at(el, 0, box), at(el, Math.min(4, L), box)] : [at(el, Math.max(0, L - 4), box), at(el, L, box)];
  const n = Math.hypot(b.x - a.x, b.y - a.y) || 1;
  const p = which === 'head' ? a : b;
  return { x: p.x, y: p.y, dx: (b.x - a.x) / n, dy: (b.y - a.y) / n };
}

/**
 * Thread from one end to the next: leaves along the direction it was heading,
 * arrives along the direction it will continue, and sags a little in between
 * the way a loose strand does.
 */
function leg(a: End, b: End) {
  const dist = Math.hypot(b.x - a.x, b.y - a.y);
  const k = Math.min(380, Math.max(40, dist * 0.42));
  const sag = dist * 0.07;
  const f = (n: number) => n.toFixed(1);
  return `M${f(a.x)} ${f(a.y)} C${f(a.x + a.dx * k)} ${f(a.y + a.dy * k + sag)} ${f(b.x - b.dx * k)} ${f(b.y - b.dy * k + sag)} ${f(b.x)} ${f(b.y)}`;
}

function trace(section: HTMLElement): Route | null {
  const box = section.getBoundingClientRect();
  const ends = ORDER.map((id) => {
    const stage = id === 'made' ? section.querySelector('[data-made]') : section.querySelector(`[data-trigger="${id}"]`);
    const i = stage?.querySelector<SVGGeometryElement>('[data-in]');
    const o = stage?.querySelector<SVGGeometryElement>('[data-out]');
    return i && o ? { in: end(i, box, 'head'), out: end(o, box, 'tail') } : null;
  });
  if (ends.some((e) => !e)) return null;
  const [b, d, q, m] = ends as { in: End; out: End }[];

  // In from the left edge, above the sketch; out past the bottom-right corner.
  const enter: End = { x: -30, y: Math.max(40, b.in.y - 200), dx: 1, dy: 0.35 };
  const leave: End = { x: box.width + 40, y: box.height + 40, dx: 0.6, dy: 0.8 };

  return {
    w: box.width,
    h: box.height,
    legs: [leg(enter, b.in), leg(b.out, d.in), leg(d.out, q.in), leg(q.out, m.in), leg(m.out, leave)],
    holes: [b.in, b.out, d.in, d.out, q.in, q.out, m.in, m.out],
  };
}
