'use client';

import type { CSSProperties, ReactNode } from 'react';
import { useDrag } from '@/lib/motion';

export type StickerTone = 'pop' | 'sky' | 'ink' | 'white' | 'vibe' | 'lime' | 'electric' | 'cream';
/**
 * Garment trims. `label` woven neck label · `chip` pantone chip · `care` care
 * strip · `tag` swing tag on a string · `pip` 28px size circle · `pill` flat
 * mono pill. `round` is retired and renders as a `pill`.
 */
export type StickerShape = 'label' | 'chip' | 'care' | 'tag' | 'pip' | 'pill' | 'round';

const TONES: Record<StickerTone, string> = {
  pop: 'bg-pop text-ink',
  sky: 'bg-electric text-ink',
  ink: 'bg-ink text-paper',
  white: 'bg-white text-ink ring-1 ring-inset ring-rule',
  vibe: 'bg-[var(--v-garment,theme(colors.electric))] text-ink',
  lime: 'bg-electric-lit text-ink',
  electric: 'bg-electric text-ink',
  cream: 'bg-cream text-ink',
};

/** The tone each trim wears when none is given. */
const DEFAULT_TONE: Record<StickerShape, StickerTone> = {
  label: 'ink',
  chip: 'white',
  care: 'white',
  tag: 'ink',
  pip: 'ink',
  pill: 'pop',
  round: 'pop',
};

const MONO = 'font-mono text-[11px] font-normal uppercase leading-[1.25] tracking-[0.12em]';

/** Wash symbols, drawn small: the care strip's joke is that it's real. */
export function CareSymbols() {
  return (
    <span aria-hidden className="flex items-center gap-1.5 opacity-80">
      {/* Wash tub, cold */}
      <svg viewBox="0 0 22 16" className="h-3.5 w-5">
        <path d="M2 4l2 10h14l2-10" fill="none" stroke="currentColor" strokeWidth="1.3" />
        <path d="M2 4c3 2 5 2 6.5 0s5-2 6.5 0 4 2 5 0" fill="none" stroke="currentColor" strokeWidth="1.3" />
        <circle cx="11" cy="10" r="1" fill="currentColor" />
      </svg>
      {/* No bleach */}
      <svg viewBox="0 0 18 16" className="h-3.5 w-4">
        <path d="M9 2L16.5 14.5H1.5Z" fill="none" stroke="currentColor" strokeWidth="1.3" />
        <path d="M3 15L15 1M3 1l12 14" stroke="currentColor" strokeWidth="1.1" />
      </svg>
      {/* Tumble low */}
      <svg viewBox="0 0 16 16" className="h-3.5 w-3.5">
        <rect x="1" y="1" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.3" />
        <circle cx="8" cy="8" r="4.5" fill="none" stroke="currentColor" strokeWidth="1.3" />
        <circle cx="8" cy="8" r="0.9" fill="currentColor" />
      </svg>
      {/* Iron low */}
      <svg viewBox="0 0 20 16" className="h-3.5 w-4">
        <path d="M2 13h16c0-5-3-8-8-8H6L4 5" fill="none" stroke="currentColor" strokeWidth="1.3" />
        <circle cx="11" cy="9.5" r="0.9" fill="currentColor" />
      </svg>
    </span>
  );
}

/**
 * A garment trim (was: sticker). Flat, set straight, no outline, no shadow.
 * Client component.
 * - `shape`: 'label' (woven neck label: ink rect, mono, put 2 lines in children)
 *   | 'chip' (pantone chip: `color` square over a hex + name strip)
 *   | 'care' (paper care strip with wash symbols, tiny mono)
 *   | 'tag' (swing tag with a punched hole and string)
 *   | 'pip' (28px size circle; 1–3 characters)
 *   | 'pill' (default; flat mono pill) | 'round' (retired: renders as a pill).
 * - `tone`: 'pop' | 'sky' | 'ink' | 'white' (paper) | 'vibe' (--v-accent/--v-ink)
 *   | 'lime' | 'electric' | 'cream'. Defaults per shape (label/pip ink, chip/care/tag paper, pill pop).
 * - `color` (chip only): the swatch color, shown with its hex. `code`: chip
 *   code override (defaults to the hex).
 * - `rotate`: resting angle (keep within ±3; at most one tilted element per viewport).
 * - `draggable`: drag with pointer, springs back (useDrag). Taps still click through.
 * - `slap`: plays `.slap` on mount; remount (change `key`) to replay.
 * - `className` → the trim face; `wrapperClassName` / `style` → the outer (positioning).
 * Copy is production-true: "100% THEIRS", "WASH COLD", "SIZE / ALL", "REV 02".
 * @example <Sticker shape="label">THE SOPHIE COLLECTION<br />DROP 005</Sticker>
 * @example <Sticker shape="chip" color="var(--thread)">Laser</Sticker>
 */
export function Sticker({
  tone,
  shape = 'pill',
  rotate = 0,
  draggable = false,
  slap = false,
  color,
  code,
  className = '',
  wrapperClassName = '',
  style,
  children,
}: {
  tone?: StickerTone;
  shape?: StickerShape;
  rotate?: number;
  draggable?: boolean;
  slap?: boolean;
  color?: string;
  code?: ReactNode;
  className?: string;
  wrapperClassName?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  const drag = useDrag<HTMLSpanElement>();
  const face = { '--r': `${rotate}deg`, transform: 'rotate(var(--r))' } as CSSProperties;
  const t = TONES[tone ?? DEFAULT_TONE[shape]];
  const anim = slap ? 'slap' : '';

  let body: ReactNode;
  switch (shape) {
    case 'label':
      body = (
        <span className={`relative inline-flex flex-col px-3.5 py-2.5 ${t} ${MONO} ${anim} ${className}`} style={face}>
          {/* Folded ends, where it's sewn in. */}
          <span aria-hidden className="absolute inset-y-0 left-0 w-[3px] bg-current opacity-20" />
          <span aria-hidden className="absolute inset-y-0 right-0 w-[3px] bg-current opacity-20" />
          {children}
        </span>
      );
      break;
    case 'chip': {
      const hex = color?.toUpperCase();
      body = (
        <span className={`inline-flex w-[8.5rem] flex-col ${t} ${MONO} ${anim} ${className}`} style={face}>
          <span aria-hidden className="block h-16 w-full" style={{ background: color ?? 'currentColor' }} />
          <span className="flex flex-col gap-0.5 px-2.5 pb-2.5 pt-2 text-[10px]">
            <span className="font-medium">{children}</span>
            <span className="opacity-60">{code ?? hex}</span>
          </span>
        </span>
      );
      break;
    }
    case 'care':
      body = (
        <span
          className={`inline-flex flex-col gap-1.5 px-3 pb-2.5 pt-2 ${t} font-mono text-[10px] uppercase leading-[1.3] tracking-[0.12em] ${anim} ${className}`}
          style={face}
        >
          <CareSymbols />
          {children}
        </span>
      );
      break;
    case 'tag':
      body = (
        <span className={`relative inline-flex flex-col pt-10 ${anim}`} style={face}>
          {/* The string. */}
          <svg aria-hidden viewBox="0 0 40 44" className="absolute left-1/2 top-0 h-11 w-10 -translate-x-1/2 overflow-visible">
            <path d="M20 44C20 30 6 22 10 8S30 2 26 -4" fill="none" stroke="currentColor" strokeWidth="1.2" className="text-ink/40" />
          </svg>
          <span
            className={`relative inline-flex min-w-[7.5rem] flex-col items-center px-4 pb-4 pt-7 text-center ${t} ${MONO} ${className}`}
            style={{ clipPath: 'polygon(14px 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 0 100%, 0 14px)' }}
          >
            <span aria-hidden className="absolute left-1/2 top-2.5 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-paper ring-1 ring-rule" />
            {children}
          </span>
        </span>
      );
      break;
    case 'pip':
      body = (
        <span
          className={`inline-grid h-7 min-w-7 place-items-center rounded-full px-1 font-mono text-[10px] uppercase leading-none tracking-[0.06em] ${t} ${anim} ${className}`}
          style={face}
        >
          {children}
        </span>
      );
      break;
    default:
      body = (
        <span className={`inline-flex items-center rounded-full px-3.5 py-1.5 ${t} ${MONO} ${anim} ${className}`} style={face}>
          {children}
        </span>
      );
  }

  return (
    <span
      ref={draggable ? drag.ref : undefined}
      className={`inline-block ${draggable ? 'cursor-grab active:cursor-grabbing' : ''} ${wrapperClassName}`}
      style={draggable ? { ...style, ...drag.style } : style}
      {...(draggable ? drag.handlers : {})}
    >
      {body}
    </span>
  );
}

/** Hand-drawn five-point star: chubby, a touch uneven. */
const STAR_PATH =
  'M11.57 2.45 L14.70 8.72 L21.07 9.85 L16.74 13.74 L18.01 20.24 L11.63 17.22 L5.65 20.41 L7.76 13.87 L1.97 9.10 L9.19 8.70Z';

/**
 * Star doodle. Colour comes from `currentColor` (set `text-*` on it).
 * - `variant`: 'fill' (solid, rounded corners) | 'outline' (stroke only).
 * - `strokeWidth`: outline weight in viewBox units (24 box). Default 2.5.
 * - `rotate`: degrees. Decorative: aria-hidden.
 * @example <Star variant="outline" className="h-16 w-16 text-uv-lit" rotate={15} />
 */
export function Star({
  variant = 'fill',
  strokeWidth = 2.5,
  rotate = 0,
  className = '',
  style,
}: {
  variant?: 'fill' | 'outline';
  strokeWidth?: number;
  rotate?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const fill = variant === 'fill';
  return (
    <svg
      aria-hidden
      focusable="false"
      viewBox="-1 -1 26 26"
      className={className}
      style={rotate ? { transform: `rotate(${rotate}deg)`, ...style } : style}
    >
      <path
        d={STAR_PATH}
        fill={fill ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth={fill ? 2 : strokeWidth}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default Sticker;
