'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import Garment3D from './garment3d/Garment3D';
import type { Projected } from './garment3d/scene';
import Charge, { REJECTIONS, type Rejection } from './upcharge/Charge';
import Receipt from './upcharge/Receipt';
import { UPCHARGE, feeText, type Customization, type CustomizationId } from '@/lib/upcharge';

/**
 * The no-upcharge promise, told as a dare.
 *
 * The visitor gets a blank mockneck (in 3D, see ./garment3d) and a pile of options. Every option decorates the
 * garment and throws the fee another shop would charge at the price, which refuses
 * it. The board starts clean and gets messier with every attempt (annotations, a
 * growing ticket, struck-out fees piling up) while the price is the one thing on it
 * that never moves. Using every option ends the game.
 *
 * All copy and options come from `@/lib/upcharge`; the garment and where each
 * decoration lands from ./garment3d.
 */

const { price, options } = UPCHARGE;

type Flying = {
  key: number;
  option: Customization;
  from: { x: number; y: number };
  to: { x: number; y: number };
  rejection: Rejection;
};
type Phase = 'play' | 'burst' | 'sweep' | 'done';

/** Where struck-out fees settle on the board, in % of it. Clear of the price. */
const SCRAP_SPOTS = [
  { x: 4, y: 3, r: -8 },
  { x: 47, y: 1, r: -3 },
  { x: 94, y: 96, r: 7 },
  { x: 6, y: 97, r: 4 },
  { x: 66, y: 99, r: -6 },
  { x: 97, y: 44, r: -12 },
  { x: 3, y: 52, r: 13 },
  { x: 58, y: 4, r: 5 },
  { x: 30, y: 99, r: -4 },
  { x: 99, y: 70, r: 9 },
  { x: 2, y: 28, r: -14 },
  { x: 82, y: 98, r: 3 },
];

/** Where every fee lands for the finale, in % of the board. */
const BURST_SPOTS = [
  { x: 14, y: 16, r: -9 },
  { x: 72, y: 9, r: 7 },
  { x: 38, y: 44, r: -4 },
  { x: 86, y: 52, r: 12 },
  { x: 10, y: 74, r: 6 },
  { x: 55, y: 80, r: -11 },
  { x: 90, y: 90, r: 4 },
];

/** How far the garment leans as the board fills up. */
const LEAN = [0, 0, -1.5, -1.5, -2.5, -2.5, -3.5, -3.5];

/** Designer's notes, in % of the stage, beside the chest graphics. */
const NOTES = [
  { text: 'bigger?', x: 57, y: 55, r: -8 },
  { text: '↑ 1 in.', x: 63, y: 34, r: -5 },
  { text: 'yes.', x: 30, y: 48, r: 7 },
];

const fill = (s: string) => s.replace('{price}', `$${price}`);
const pad = (n: number) => String(n).padStart(2, '0');

export default function NoUpcharge() {
  const [applied, setApplied] = useState<CustomizationId[]>([]);
  const [attempts, setAttempts] = useState(0);
  const [flying, setFlying] = useState<Flying[]>([]);
  const [scraps, setScraps] = useState<{ key: number; fee: string }[]>([]);
  const [ghost, setGhost] = useState<{ key: number; value: number } | null>(null);
  const [phase, setPhase] = useState<Phase>('play');
  const [said, setSaid] = useState('');
  const [still, setStill] = useState(false);

  const board = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const priceEl = useRef<HTMLSpanElement>(null);
  const seq = useRef(0);
  const timers = useRef(new Set<number>());

  const later = useCallback((fn: () => void, ms: number) => {
    const t = window.setTimeout(() => {
      timers.current.delete(t);
      fn();
    }, ms);
    timers.current.add(t);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setStill(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    const pending = timers.current;
    return () => {
      mq.removeEventListener('change', sync);
      pending.forEach(clearTimeout);
    };
  }, []);

  const byId = (id: CustomizationId) => options.find((o) => o.id === id)!;
  const level = applied.length;
  const has = (id: CustomizationId) => applied.includes(id);

  const retort =
    phase === 'done'
      ? UPCHARGE.finale.kicker
      : attempts === 0
      ? ''
      : attempts <= UPCHARGE.retorts.length
        ? fill(UPCHARGE.retorts[attempts - 1])
        : fill(UPCHARGE.encores[(attempts - UPCHARGE.retorts.length - 1) % UPCHARGE.encores.length]);

  function scrap(fee: string) {
    setScraps((s) => [...s, { key: ++seq.current, fee }].slice(-SCRAP_SPOTS.length));
  }

  function pick(o: Customization, e: React.MouseEvent<HTMLButtonElement>) {
    const isNew = !applied.includes(o.id);
    const next = isNew ? [...applied, o.id] : applied;
    const n = attempts + 1;
    setApplied(next);
    setAttempts(n);
    setSaid(`${o.label}: ${feeText(o)} elsewhere. Here, ${o.verdict.toLowerCase()}. Your price: still $${price}.`);

    const b = board.current?.getBoundingClientRect();
    const p = priceEl.current?.getBoundingClientRect();
    if (still || !b || !p) {
      scrap(feeText(o));
    } else {
      const src = e.currentTarget.getBoundingClientRect();
      // Keyboard presses report no pointer position, so aim from the control itself.
      setFlying((f) => [
        ...f,
        {
          key: ++seq.current,
          option: o,
          from: { x: src.left + src.width / 2 - b.left, y: src.top + src.height / 2 - b.top },
          to: { x: p.right - p.width * 0.2 - b.left, y: p.top + p.height * 0.18 - b.top },
          rejection: REJECTIONS[(n - 1) % REJECTIONS.length],
        },
      ]);
    }

    if (isNew && next.length === options.length) {
      setSaid(`Everything added. Every fee refused. Your price: still $${price}. ${UPCHARGE.finale.headline.join(' ')}`);
      if (still) {
        setScraps([]);
        setPhase('done');
      } else {
        // Let the last tag land before everything else piles on.
        later(() => setPhase('burst'), 1000);
        later(() => setPhase('sweep'), 2000);
        later(() => {
          setScraps([]);
          setPhase('done');
        }, 2750);
      }
    }
  }

  function hit(f: Flying) {
    setGhost({ key: f.key, value: price + f.option.fee });
    priceEl.current?.animate(
      [{ transform: 'none' }, { transform: 'translate(0.012em, -0.01em)' }, { transform: 'none' }],
      { duration: 220, easing: 'ease-out' },
    );
  }

  function landed(f: Flying) {
    setFlying((all) => all.filter((x) => x.key !== f.key));
    scrap(feeText(f.option));
  }

  function reset() {
    timers.current.forEach(clearTimeout);
    timers.current.clear();
    setApplied([]);
    setAttempts(0);
    setFlying([]);
    setScraps([]);
    setGhost(null);
    setPhase('play');
    setSaid('Board cleared.');
  }

  const done = phase === 'done';

  // Leader lines end on the garment itself, wherever it has been turned to. Updated
  // straight on the DOM: this runs every frame the garment moves.
  const leaders = useRef<Partial<Record<CustomizationId, SVGLineElement | null>>>({});
  const ends = useRef<Partial<Record<CustomizationId, SVGCircleElement | null>>>({});
  const onAnchors = useCallback((a: Projected) => {
    for (const o of options) {
      const p = a[o.id];
      const line = leaders.current[o.id];
      const end = ends.current[o.id];
      if (!p || !line || !end) continue;
      line.setAttribute('x2', p.x.toFixed(2));
      line.setAttribute('y2', p.y.toFixed(2));
      line.style.opacity = p.facing ? '' : '0.35';
      end.setAttribute('cx', p.x.toFixed(2));
      end.setAttribute('cy', p.y.toFixed(2));
      end.style.opacity = p.facing ? '' : '0';
    }
  }, []);

  return (
    <section className="relative overflow-hidden bg-paper text-ink" aria-labelledby="upcharge-title">
      <div aria-hidden className="board-grid pointer-events-none absolute inset-0" />

      <div className="shell relative py-20 sm:py-28">
        {/* Board furniture: crop marks and a revision count that ticks with every attempt. */}
        <div aria-hidden className="label mb-10 flex items-center justify-between text-ash/35">
          <span className="flex items-center gap-3">
            <span className="crop-mark" />
            Board 03 / Pricing
          </span>
          <span className="tabular-nums">
            Rev. {pad(attempts)}
            <span className="crop-mark ml-3 inline-block -scale-x-100 align-middle" />
          </span>
        </div>

        <div ref={board} className="relative flex flex-col lg:grid lg:grid-cols-12 lg:gap-x-8">
          {/* Struck-out fees collect around the board as the visitor keeps trying. */}
          <div aria-hidden className="pointer-events-none absolute inset-0 z-0">
            {scraps.map((s, i) => {
              const spot = SCRAP_SPOTS[i % SCRAP_SPOTS.length];
              return (
                <span
                  key={s.key}
                  className={`scrap label absolute whitespace-nowrap text-[12px] text-ash/35 line-through decoration-electric decoration-2 ${
                    phase === 'sweep' ? 'sweep-out' : ''
                  }`}
                  style={{ left: `${spot.x}%`, top: `${spot.y}%`, '--r': `${spot.r}deg`, animationDelay: phase === 'sweep' ? `${i * 25}ms` : undefined } as React.CSSProperties}
                >
                  {s.fee}
                </span>
              );
            })}
          </div>

          {/* Heading */}
          <div className="relative z-10 order-1 lg:col-span-12 lg:row-start-1">
            <p className="label text-ash/50">{UPCHARGE.eyebrow}</p>
            <h2 id="upcharge-title" className="caps mt-5 whitespace-nowrap text-[clamp(2.5rem,10.5vw,8.25rem)] leading-[0.88] tracking-[-0.035em]">
              {UPCHARGE.headline.map((line) => (
                <span key={line} className="relative block w-fit">
                  {line}
                  {done && <span aria-hidden className="strike-bar absolute left-0 right-0 top-[46%] h-[0.07em] bg-electric" />}
                </span>
              ))}
            </h2>
            <p className="mt-6 font-serif text-d2 italic text-ash/60">{UPCHARGE.dare}</p>
          </div>

          {/* The price column. On a phone its two parts split around the garment. */}
          <div className="contents lg:relative lg:z-20 lg:col-span-5 lg:col-start-8 lg:row-start-2 lg:flex lg:flex-col lg:pt-[6%]">
            <div className="order-2 mt-12 lg:mt-0">
              <p className="label text-ash/50">Your price</p>
              <p className="relative mt-3 w-fit">
                <span
                  ref={priceEl}
                  className="block text-[clamp(6.5rem,15vw,15rem)] font-extrabold leading-[0.8] tracking-[-0.055em] tabular-nums"
                >
                  ${price}
                </span>
                {ghost && (
                  <span
                    key={ghost.key}
                    aria-hidden
                    className="ghost-price outlined pointer-events-none absolute left-0 top-0 text-[clamp(6.5rem,15vw,15rem)] font-extrabold leading-[0.8] tracking-[-0.055em] tabular-nums text-ash/80"
                    onAnimationEnd={() => setGhost((g) => (g?.key === ghost.key ? null : g))}
                  >
                    ${ghost.value}
                    <span className="ghost-strike absolute left-[-4%] right-[-4%] top-[42%] h-[0.08em] bg-electric" />
                  </span>
                )}
              </p>
              <p className="caps mt-5 h-[1.2em] text-d3" aria-hidden>
                <span className="clip">
                  <span key={attempts}>{retort}</span>
                </span>
              </p>
            </div>

            {level > 0 && (
              <div className="order-5 mt-14 flex justify-center lg:mt-12 lg:justify-start">
                <div className="receipt-in" style={{ transform: `rotate(${1.5 + level * 0.45}deg)` }}>
                  <Receipt price={price} garment={UPCHARGE.garment} lines={applied.map(byId)} />
                </div>
              </div>
            )}
          </div>

          {/* The garment, and the controls that live around it. */}
          <div className="relative z-10 order-3 mt-2 lg:col-span-7 lg:row-start-2 lg:mt-16">
            <div
              ref={stage}
              className="relative aspect-[5/4] w-full lg:aspect-square"
            >
              <Garment3D applied={applied} tilt={LEAN[level]} onAnchors={onAnchors} className="absolute inset-0" />

              {/* Leader lines from each control to where it lands on the garment. */}
              <svg aria-hidden viewBox="0 0 100 100" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 hidden h-full w-full lg:block">
                {options.map((o) => {
                  const on = has(o.id);
                  return (
                    <g key={o.id} className={`transition-[stroke] duration-300 ${on ? 'stroke-ash/70' : 'stroke-ash/25'}`}>
                      <line
                        ref={(el) => {
                          leaders.current[o.id] = el;
                        }}
                        x1={o.at.x}
                        y1={o.at.y}
                        x2={o.at.x}
                        y2={o.at.y}
                        vectorEffect="non-scaling-stroke"
                        strokeWidth="1"
                        strokeDasharray={on ? undefined : '3 4'}
                      />
                      <circle
                        ref={(el) => {
                          ends.current[o.id] = el;
                        }}
                        r="0.55"
                        cx={o.at.x}
                        cy={o.at.y}
                        className={on ? 'fill-paper' : 'fill-none'}
                        vectorEffect="non-scaling-stroke"
                        strokeWidth="1"
                      />
                    </g>
                  );
                })}
              </svg>

              {has('design') &&
                NOTES.map((n, i) => (
                  <span
                    key={n.text}
                    aria-hidden
                    className="note-in pointer-events-none absolute whitespace-nowrap font-serif text-[clamp(1rem,1.9vw,1.6rem)] italic leading-none text-[#9FB2E0]"
                    style={{ left: `${n.x}%`, top: `${n.y}%`, '--r': `${n.r}deg`, animationDelay: `${120 + i * 110}ms` } as React.CSSProperties}
                  >
                    {n.text}
                  </span>
                ))}

              {level >= 3 && (
                <>
                  <div aria-hidden className="pin-in absolute right-0 top-0 w-[4.5rem] rotate-[5deg] bg-white p-1.5 lg:hidden xl:right-[2%] xl:block">
                    <div className="aspect-square bg-electric" />
                    <p className="label mt-1.5 text-[9px] text-ink">PMS 2728 C</p>
                  </div>
                </>
              )}
            </div>

            <ul className="mt-8 grid grid-cols-2 gap-x-5 lg:pointer-events-none lg:absolute lg:inset-0 lg:mt-0 lg:block" aria-label="Customize the garment">
              {options.map((o, i) => {
                const on = has(o.id);
                const left = o.at.side === 'left';
                return (
                  <li
                    key={o.id}
                    className={`border-t border-ash/15 lg:pointer-events-auto lg:absolute lg:left-[var(--x)] lg:top-[var(--y)] lg:-mt-[15px] lg:border-0 ${left ? 'lg:-translate-x-full lg:text-right' : ''}`}
                    style={{ '--x': `${o.at.x}%`, '--y': `${o.at.y}%` } as React.CSSProperties}
                  >
                    <button
                      type="button"
                      onClick={(e) => pick(o, e)}
                      aria-pressed={on}
                      className={`control group flex min-h-11 w-full items-start gap-3 py-3 text-left lg:w-auto lg:py-1.5 ${
                        left ? 'lg:flex-row-reverse lg:text-right' : ''
                      }`}
                    >
                      <span
                        aria-hidden
                        className={`mt-[-2px] grid h-[18px] w-[18px] shrink-0 place-items-center border font-mono text-[13px] leading-none transition-all duration-150 group-hover:border-ink group-hover:bg-paper group-hover:text-ink group-active:scale-90 ${
                          on ? 'border-electric bg-electric text-ink' : 'border-ash/45 text-ink'
                        }`}
                      >
                        {on ? '✓' : '+'}
                      </span>
                      <span className="min-w-0">
                        <span className="label flex items-baseline gap-2 text-[12px] text-ink lg:inline-flex">
                          <span className="text-ash/35 lg:hidden">{pad(i + 1)}</span>
                          <span className="underline decoration-transparent underline-offset-4 transition-colors group-hover:decoration-ash/60">
                            {o.label}
                          </span>
                        </span>
                        {on && (
                          <span className="spec-in label mt-1.5 block max-w-[9.5rem] lg:max-w-[8rem] xl:max-w-[10rem] text-[10px] leading-[1.4] text-ash/45">
                            {o.spec}
                          </span>
                        )}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {done && (
            <div className="relative z-10 order-4 mt-20 lg:col-span-12 lg:row-start-3 lg:mt-20">
              <p className="label text-ash/50">
                <span className="clip"><span>{UPCHARGE.finale.kicker}</span></span>
              </p>
              <h3 className="caps mt-5 text-d0">
                <span className="clip"><span style={{ animationDelay: '120ms' }}>{UPCHARGE.finale.headline[0]}</span></span>
                <span className="clip">
                  <span className="font-serif font-normal normal-case italic" style={{ animationDelay: '220ms' }}>
                    {UPCHARGE.finale.headline[1]}
                  </span>
                </span>
              </h3>
              <div className="mt-10 flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-end">
                <p className="max-w-measure font-serif text-d3 italic text-ash/70">{UPCHARGE.finale.line}</p>
                <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
                  <Link href={UPCHARGE.finale.cta.href} className="btn-white">
                    {UPCHARGE.finale.cta.label} <span aria-hidden>→</span>
                  </Link>
                  <button type="button" onClick={reset} className="label min-h-11 text-ash/50 underline-offset-4 hover:text-ink hover:underline">
                    {UPCHARGE.finale.reset}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Every fee at once, then swept off the board. */}
          {(phase === 'burst' || phase === 'sweep') && (
            <div aria-hidden className="pointer-events-none absolute inset-0 z-30">
              {options.map((o, i) => {
                const spot = BURST_SPOTS[i % BURST_SPOTS.length];
                return (
                  <div
                    key={o.id}
                    className={`absolute ${phase === 'sweep' ? 'sweep-out' : 'burst-in'}`}
                    style={{ left: `${spot.x}%`, top: `${spot.y}%`, '--r': `${spot.r}deg`, animationDelay: `${i * (phase === 'sweep' ? 35 : 70)}ms` } as React.CSSProperties}
                  >
                    <div className="price-tag relative whitespace-nowrap bg-white py-2.5 pl-7 pr-4 text-ink shadow-[0_14px_40px_-12px_rgba(0,0,0,0.7)]">
                      <span className="block text-[clamp(2rem,4vw,3.5rem)] font-extrabold leading-none tracking-[-0.03em] line-through decoration-electric decoration-[6px]">
                        {feeText(o)}
                      </span>
                      <span className="label mt-1 block text-[10px] text-ink/60">{o.receipt}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {flying.map((f) => (
            <Charge
              key={f.key}
              fee={feeText(f.option)}
              label={f.option.receipt}
              from={f.from}
              to={f.to}
              rejection={f.rejection}
              onHit={() => hit(f)}
              onDone={() => landed(f)}
            />
          ))}
        </div>

        <p className="sr-only" aria-live="polite">{said}</p>
      </div>
    </section>
  );
}
