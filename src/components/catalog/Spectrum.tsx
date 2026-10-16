'use client';

import { useState } from 'react';
import { COLOR_FAMILIES, type ColorFamily, type SpectrumSwatch } from '@/lib/catalog/util';

/**
 * Every colourway in the catalog as one continuous band, sorted by hue.
 *
 * It is the page's way in for someone who starts from a colour rather than a garment:
 * hover a stripe to see what it is and whose it is, click it to see every style that
 * comes in that colour family. The legend underneath does the same thing for anyone
 * who would rather read than hover, and it is what a keyboard reaches.
 */
export default function Spectrum({
  swatches,
  familyCounts,
  active,
  onPick,
}: {
  swatches: SpectrumSwatch[];
  familyCounts: Map<string, number>;
  active: ColorFamily | null;
  onPick: (family: ColorFamily | null) => void;
}) {
  const [hover, setHover] = useState<number | null>(null);
  if (swatches.length === 0) return null;
  const hovered = hover !== null ? swatches[hover] : null;

  return (
    <div>
      <div className="relative">
        <div
          className="flex h-[72px] w-full overflow-hidden sm:h-[96px] lg:h-[112px]"
          onPointerLeave={() => setHover(null)}
          aria-hidden
        >
          {swatches.map((s, i) => {
            const dimmed = active !== null && s.family !== active;
            return (
              <div
                key={s.hex}
                onPointerEnter={() => setHover(i)}
                onClick={() => onPick(active === s.family ? null : s.family)}
                className="relative h-full min-w-[3px] cursor-pointer transition-[flex-grow,opacity] duration-[420ms] ease-out motion-reduce:transition-none"
                style={{
                  background: s.hex,
                  flexGrow: hover === i ? 7 : hover !== null && Math.abs(hover - i) === 1 ? 2.2 : 1,
                  flexBasis: 0,
                  opacity: dimmed ? 0.14 : 1,
                }}
              />
            );
          })}
        </div>

        {/* The readout: what the stripe under the pointer is, on a woven label. */}
        <div
          className={`woven pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 gap-3 transition-opacity duration-[180ms] sm:left-8 lg:left-14 ${
            hovered ? 'opacity-100' : 'opacity-0'
          }`}
          aria-hidden
        >
          {hovered && (
            <>
              <i className="block h-3 w-3 rounded-full" style={{ background: hovered.hex, boxShadow: 'inset 0 0 0 1px rgba(19,51,39,.2)' }} />
              <span>{hovered.name}</span>
              <span className="opacity-60">{hovered.productName}</span>
            </>
          )}
        </div>
      </div>

      <div className="shell mt-6 flex flex-wrap gap-2" role="group" aria-label="Filter by color family">
        {COLOR_FAMILIES.filter((f) => familyCounts.get(f.id)).map((f) => {
          const on = active === f.id;
          return (
            <button
              key={f.id}
              type="button"
              aria-pressed={on}
              onClick={() => onPick(on ? null : f.id)}
              className="chip gap-2.5 pl-3"
            >
              <i
                className="block h-4 w-4 rounded-full"
                style={{ background: f.swatch, boxShadow: on ? '0 0 0 1.5px rgba(244,239,230,.8)' : 'inset 0 0 0 1px rgba(19,51,39,.16)' }}
              />
              {f.label}
              <span className="ct-chip-n">{String(familyCounts.get(f.id) ?? 0).padStart(2, '0')}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
