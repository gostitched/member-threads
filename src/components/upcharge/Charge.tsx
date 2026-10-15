'use client';

import { useEffect, useRef } from 'react';

/**
 * A fake upcharge: a price tag that flies at the price, hits it, and gets thrown
 * out.
 *
 * Positions are in px relative to the board, measured by the parent at the moment
 * of the click. Motion runs on the Web Animations API because the path depends on
 * where the control and the price happen to be. There are several ways to lose,
 * so pressing the same control twice doesn't play the same joke twice.
 */

export const REJECTIONS = ['bounce', 'strike', 'stamp', 'drag', 'cross'] as const;
export type Rejection = (typeof REJECTIONS)[number];

type Point = { x: number; y: number };

const FLIGHT_MS = 420;

const at = (p: Point, extra = '') => `translate(${p.x}px, ${p.y}px) ${extra}`;

export default function Charge({
  fee,
  label,
  from,
  to,
  rejection,
  onHit,
  onDone,
}: {
  fee: string;
  label: string;
  from: Point;
  to: Point;
  rejection: Rejection;
  onHit: () => void;
  onDone: () => void;
}) {
  const box = useRef<HTMLDivElement>(null);
  const strike = useRef<HTMLSpanElement>(null);
  const stamp = useRef<HTMLSpanElement>(null);
  const cross = useRef<HTMLSpanElement>(null);

  // The parent's callbacks change identity every render; the animation must not restart.
  const hit = useRef(onHit);
  const done = useRef(onDone);
  hit.current = onHit;
  done.current = onDone;

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const running: Animation[] = [];
    let live = true;
    const play = (target: Element | null, frames: Keyframe[], opts: KeyframeAnimationOptions) => {
      if (!target) return Promise.resolve();
      const a = target.animate(frames, { fill: 'forwards', ...opts });
      running.push(a);
      return a.finished.then(() => undefined, () => undefined);
    };

    // A shallow arc, so it reads as thrown rather than slid.
    const peak = { x: (from.x + to.x) / 2, y: Math.min(from.y, to.y) - 70 };

    (async () => {
      await play(
        el,
        [
          { transform: at(from, 'rotate(-10deg) scale(0.85)'), opacity: 0 },
          { transform: at(peak, 'rotate(6deg) scale(1.08)'), opacity: 1, offset: 0.5 },
          { transform: at(to, 'rotate(-4deg) scale(1)'), opacity: 1 },
        ],
        { duration: FLIGHT_MS, easing: 'cubic-bezier(0.45, 0, 0.3, 1)' },
      );
      if (!live) return;
      hit.current();

      switch (rejection) {
        case 'bounce':
          await play(
            el,
            [
              { transform: at(to, 'rotate(-4deg) scale(1)'), opacity: 1 },
              { transform: at(to, 'rotate(-2deg) scale(1.2, 0.78)'), offset: 0.08, easing: 'ease-out' },
              { transform: at({ x: to.x + 110, y: to.y - 90 }, 'rotate(28deg)'), offset: 0.34, easing: 'ease-in' },
              { transform: at({ x: to.x + 240, y: to.y + 720 }, 'rotate(170deg)'), opacity: 1 },
            ],
            { duration: 820 },
          );
          break;
        case 'strike':
          await play(strike.current, [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], {
            duration: 150,
            easing: 'cubic-bezier(0.2, 0, 0, 1)',
          });
          await play(
            el,
            [
              { transform: at(to, 'rotate(-4deg)'), opacity: 1 },
              { transform: at({ x: to.x, y: to.y + 40 }, 'rotate(-9deg)'), opacity: 0 },
            ],
            { duration: 260, delay: 140, easing: 'ease-in' },
          );
          break;
        case 'stamp':
          await play(
            stamp.current,
            [
              { opacity: 0, transform: 'translate(-50%, -50%) rotate(-18deg) scale(2.8)' },
              { opacity: 1, transform: 'translate(-50%, -50%) rotate(-11deg) scale(1)' },
            ],
            { duration: 130, easing: 'cubic-bezier(0.55, 0, 1, 0.45)' },
          );
          await play(
            el,
            [
              { transform: at(to, 'rotate(-4deg) scale(1)'), opacity: 1 },
              { transform: at(to, 'rotate(-4deg) scale(0.94)'), opacity: 1, offset: 0.1 },
              { transform: at(to, 'rotate(-4deg) scale(0.94)'), opacity: 1, offset: 0.55 },
              { transform: at(to, 'rotate(-4deg) scale(0.9)'), opacity: 0 },
            ],
            { duration: 520 },
          );
          break;
        case 'drag':
          await play(
            el,
            [
              { transform: at(to, 'rotate(-4deg)') },
              { transform: at({ x: to.x - 28, y: to.y }, 'rotate(-9deg)'), offset: 0.3, easing: 'cubic-bezier(0.7, 0, 1, 0.6)' },
              { transform: at({ x: to.x + window.innerWidth, y: to.y + 30 }, 'rotate(6deg)') },
            ],
            { duration: 560, delay: 90 },
          );
          break;
        case 'cross':
          await play(cross.current, [{ transform: 'scale(0)', opacity: 0 }, { transform: 'scale(1)', opacity: 1 }], {
            duration: 120,
            easing: 'cubic-bezier(0.2, 0, 0, 1.4)',
          });
          await play(
            el,
            [
              { transform: at(to, 'rotate(-4deg) scale(1)'), opacity: 1 },
              { transform: at(to, 'rotate(24deg) scale(0)'), opacity: 0 },
            ],
            { duration: 240, delay: 160, easing: 'cubic-bezier(0.55, 0, 1, 0.45)' },
          );
          break;
      }
      if (live) done.current();
    })();

    return () => {
      live = false;
      running.forEach((a) => a.cancel());
    };
    // Measured once at the click; later re-renders must not re-throw the tag.
  }, []);

  return (
    <div
      ref={box}
      className="pointer-events-none absolute left-0 top-0 z-40 will-change-transform"
      style={{ transform: at(from), opacity: 0 }}
      aria-hidden
    >
      <div className="relative -translate-x-1/2 -translate-y-1/2">
        <div className="price-tag whitespace-nowrap bg-white py-2 pl-6 pr-3 text-ink shadow-[0_10px_30px_-10px_rgba(0,0,0,0.6)]">
          <span className="block text-[1.75rem] font-extrabold leading-none tracking-[-0.03em] sm:text-[2.25rem]">{fee}</span>
          <span className="label mt-1 block text-[10px] text-ink/60">{label}</span>
        </div>

        <span ref={strike} className="absolute left-3 right-1 top-[38%] h-[3px] origin-left scale-x-0 bg-electric" />
        <span
          ref={stamp}
          className="label absolute left-1/2 top-1/2 border-2 border-electric bg-white/80 px-2 py-1 text-[13px] font-bold tracking-[0.18em] text-electric opacity-0"
        >
          Included
        </span>
        <span ref={cross} className="absolute inset-0 opacity-0">
          <span className="absolute left-1/2 top-1/2 h-[4px] w-[120%] -translate-x-1/2 -translate-y-1/2 rotate-[24deg] bg-electric" />
          <span className="absolute left-1/2 top-1/2 h-[4px] w-[120%] -translate-x-1/2 -translate-y-1/2 -rotate-[24deg] bg-electric" />
        </span>
      </div>
    </div>
  );
}
