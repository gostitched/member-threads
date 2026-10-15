import type { CSSProperties } from 'react';

/**
 * Timing for the thread motif.
 *
 * A cue is where a group of animated elements stands. 'done' is the finished
 * drawing: the server render, reduced motion, or a part of the page the reader
 * was already past on load. 'idle' is armed but not started. A timed cue starts
 * `base` ms after it was set, with every duration and offset scaled by `k`.
 *
 * Everything runs on CSS transitions, so once a cue has played there is nothing
 * left running: the drawing simply sits in its final state.
 */
export type Cue = 'done' | 'idle' | { base: number; k: number };

/** Thread being pulled: eases in, lands softly. */
export const SEW = 'cubic-bezier(0.45, 0.05, 0.25, 1)';
/** Things settling into place. */
export const SETTLE = 'cubic-bezier(0.16, 1, 0.3, 1)';
/** Machine pace: nearly constant speed. */
export const MACHINE = 'cubic-bezier(0.3, 0.1, 0.7, 0.9)';

const kebab = (s: string) => s.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);

/** Draw a `pathLength={1}` path on from its start to its end. */
export function draw(cue: Cue, at: number, dur: number, ease = SEW): CSSProperties {
  if (cue === 'done') return { strokeDasharray: '1 1', strokeDashoffset: 0 };
  if (cue === 'idle') return { strokeDasharray: '1 1', strokeDashoffset: 1, transition: 'none' };
  return {
    strokeDasharray: '1 1',
    strokeDashoffset: 0,
    transition: `stroke-dashoffset ${dur * cue.k}ms ${ease} ${cue.base + at * cue.k}ms`,
  };
}

/** Move from `from` to `to`. `to` is the resting state, and what 'done' shows. */
export function shift(
  cue: Cue,
  at: number,
  dur: number,
  from: CSSProperties,
  to: CSSProperties,
  ease = SETTLE,
): CSSProperties {
  if (cue === 'done') return to;
  if (cue === 'idle') return { ...from, transition: 'none' };
  const delay = cue.base + at * cue.k;
  return {
    ...to,
    transition: Object.keys(to)
      .map((p) => `${kebab(p)} ${dur * cue.k}ms ${ease} ${delay}ms`)
      .join(', '),
  };
}

export const fade = (cue: Cue, at: number, dur: number, to = 1, from = 0) =>
  shift(cue, at, dur, { opacity: from }, { opacity: to });

/** Fade up from just below. Only for elements nothing is measured against. */
export const rise = (cue: Cue, at: number, dur = 800) =>
  shift(cue, at, dur, { opacity: 0, transform: 'translateY(14px)' }, { opacity: 1, transform: 'none' });
