import type { ReactNode } from 'react';

export type MarqueeTone = 'pop' | 'ink' | 'electric' | 'sky' | 'vibe' | 'lime' | 'clear';

const TONES: Record<MarqueeTone, string> = {
  pop: 'bg-pop text-ink',
  ink: 'bg-ink text-paper',
  electric: 'bg-electric text-ink',
  sky: 'bg-electric text-ink',
  vibe: 'bg-[var(--v-garment,theme(colors.electric))] text-ink',
  lime: 'bg-electric-lit text-ink',
  clear: 'bg-transparent',
};

/**
 * Full-bleed scrolling strip between sections. Server-safe (no client JS).
 * - `items`: strings (or nodes, e.g. a butter italic span); joined by `separator` (default "·").
 * - `tone`: 'pop' (UV, default) | 'ink' | 'electric' (laser blue, ink type) | 'sky' | 'lime'
 *   | 'vibe' (reads --v-accent/--v-ink)
 *   | 'clear' (transparent; set color via className, e.g. footer `text-ash/15`).
 * - `size`: 'sm' (mono caps ticker, default) | 'xl' (`.marquee-xl` mega line).
 * - `reverse`: scroll left-to-right. `speed`: seconds per loop (default sm 48, xl 72).
 * - `outline`: render items as `.outline` ghost type (handy with size="xl").
 * The track is duplicated (second copy aria-hidden) and runs on the existing
 * `marquee` keyframes; under reduced motion it sits still. Height comes from
 * type alone, so there is no layout shift.
 * @example <Marquee items={['420 GSM', 'CHENILLE', 'PUFF PRINT']} tone="pop" />
 */
export function Marquee({
  items,
  tone = 'pop',
  size = 'sm',
  reverse = false,
  speed,
  outline = false,
  separator = '·',
  className = '',
}: {
  items: ReactNode[];
  tone?: MarqueeTone;
  size?: 'sm' | 'xl';
  reverse?: boolean;
  speed?: number;
  outline?: boolean;
  separator?: ReactNode;
  className?: string;
}) {
  if (items.length === 0) return null;
  const xl = size === 'xl';
  // Each copy must be at least as wide as the viewport for a seamless -50% loop.
  const repeat = Math.max(1, Math.ceil((xl ? 3 : 10) / items.length));
  const run = Array.from({ length: repeat }, () => items).flat();
  const duration = speed ?? (xl ? 72 : 48);

  const copy = (hidden: boolean) => (
    <div
      className={`flex shrink-0 items-center ${xl ? 'marquee-xl' : 'font-mono text-[12px] uppercase leading-none tracking-[0.14em] sm:text-[13px]'}`}
      aria-hidden={hidden || undefined}
    >
      {run.map((item, i) => (
        <span key={i} className="flex items-center">
          <span className={outline ? 'outline' : undefined}>{item}</span>
          <span aria-hidden className={xl ? 'mx-[0.3em] opacity-40' : 'mx-5 opacity-50'}>
            {separator}
          </span>
        </span>
      ))}
    </div>
  );

  return (
    <div className={`relative w-full overflow-hidden ${TONES[tone]} ${xl ? 'py-[1.5vw]' : 'py-3.5'} ${className}`}>
      <div
        className={`marquee-track flex w-max ${reverse ? 'animate-marquee-rev' : 'animate-marquee'}`}
        style={{ animationDuration: `${duration}s` }}
      >
        {copy(false)}
        {copy(true)}
      </div>
    </div>
  );
}

export default Marquee;
