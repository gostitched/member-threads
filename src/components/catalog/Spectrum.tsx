'use client';

import { useState } from 'react';
import { COLOR_FAMILIES, inkOn, type ColorFamily, type SpectrumSwatch } from '@/lib/catalog/util';

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
          className="flex h-[120px] w-full overflow-hidden"
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
                className="relative h-full min-w-[3px] cursor-pointer transition-[flex-grow,opacity] duration-500 ease-out"
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

        {/* The readout: what the stripe under the pointer is. */}
        <div
          className={`pointer-events-none absolute left-4 top-4 flex items-center gap-3 rounded-full px-4 py-2 transition-opacity duration-200 ${
            hovered ? 'opacity-100' : 'opacity-0'
          }`}
          style={hovered ? { background: hovered.hex, color: inkOn(hovered.hex) } : undefined}
          aria-hidden
        >
          {hovered && (
            <>
              <span className="text-[0.9375rem] font-semibold">{hovered.name}</span>
              <span className="text-[0.8125rem] opacity-70">{hovered.productName}</span>
            </>
          )}
        </div>
      </div>

      <div className="shell mt-7 flex flex-wrap gap-2" role="group" aria-label="Filter by color family">
        {COLOR_FAMILIES.filter((f) => familyCounts.get(f.id)).map((f) => {
          const on = active === f.id;
          return (
            <button
              key={f.id}
              type="button"
              aria-pressed={on}
              onClick={() => onPick(on ? null : f.id)}
              className={`flex min-h-[44px] items-center gap-2.5 rounded-full pl-1.5 pr-4 text-[0.875rem] font-semibold transition-colors duration-200 motion-reduce:transition-none ${
                on ? 'bg-paper text-ink' : 'bg-paper/10 text-paper hover:bg-paper/20'
              }`}
            >
              <span className="h-8 w-8 rounded-full" style={{ background: f.swatch }} />
              {f.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
