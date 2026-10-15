'use client';

import { useId, type SVGProps } from 'react';
import { draw, type Cue, SEW } from '@/lib/thread';

/**
 * The studio thread: one strand of hot pink, drawn as real thread rather than a
 * vector line.
 *
 * Three strokes share one path: a soft shadow offset down and right so the strand
 * sits on the surface, the pink body, and a thin highlight up and left that
 * rounds it. A `float` is thread laid across the surface; `running` and `loose`
 * are stitches, where the gaps are the thread passing underneath.
 *
 * Drawing on is done with a mask rather than the path's own dash offset, so the
 * stitch pattern and the reveal don't fight over `stroke-dasharray`.
 *
 * It is a brand detail, not a section-specific one: drop it into any SVG to
 * underline a headline or stitch around an image. Use it sparingly.
 */
export type Stitch = 'float' | 'running' | 'loose';

const DASH: Record<Stitch, string | undefined> = {
  float: undefined,
  running: '6 4.5',
  // Uneven on purpose: a hand stitch, not a machine one.
  loose: '11 6 16 5 7 10 13 4 8 7',
};

export default function Thread({
  d,
  cue = 'done',
  at = 0,
  dur = 1000,
  ease = SEW,
  stitch = 'float',
  width = 2.2,
  dash,
  ...rest
}: {
  d: string;
  cue?: Cue;
  at?: number;
  dur?: number;
  ease?: string;
  stitch?: Stitch;
  /** Stroke width in the SVG's own units. */
  width?: number;
  /** Override the stitch pattern, in the SVG's units. */
  dash?: string;
} & Omit<SVGProps<SVGPathElement>, 'd'>) {
  const id = `thread-${useId().replace(/[^\w-]/g, '')}`;
  const pattern = dash ?? DASH[stitch];

  return (
    <g aria-hidden>
      <mask id={id} maskUnits="userSpaceOnUse" x={-1e4} y={-1e4} width={2e4} height={2e4}>
        <path
          d={d}
          pathLength={1}
          fill="none"
          stroke="#fff"
          strokeWidth={width * 6}
          style={draw(cue, at, dur, ease)}
        />
      </mask>
      <g mask={`url(#${id})`} fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path
          d={d}
          stroke="#000"
          strokeOpacity={0.65}
          strokeWidth={width + 1.6}
          strokeDasharray={pattern}
          transform="translate(0.9 1.7)"
        />
        <path d={d} stroke="var(--thread)" strokeWidth={width} strokeDasharray={pattern} {...rest} />
        {stitch === 'float' && (
          // Ply twist: barely there, but it stops a long float reading as a vector line.
          <path d={d} stroke="#000" strokeOpacity={0.28} strokeWidth={width * 0.9} strokeDasharray="1.1 2.6" />
        )}
        <path
          d={d}
          stroke="var(--thread-hi)"
          strokeOpacity={0.6}
          strokeWidth={width * 0.34}
          strokeDasharray={pattern}
          transform="translate(-0.3 -0.45)"
        />
      </g>
    </g>
  );
}
