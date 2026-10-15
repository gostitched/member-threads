'use client';

import { useMemo, useState } from 'react';
import type { PublicPriceBreak } from '@/lib/catalog/types';
import { formatMoney } from '@/lib/catalog/util';

/**
 * Price breaks as something you can feel: drag the quantity and watch the unit price
 * step down as it crosses each break.
 *
 * The slider is logarithmic because the interesting range is: 50 and 100 are as far
 * apart, in decision terms, as 500 and 1,000. A linear track would crush every small
 * order into its first centimetre.
 */
const MAX_QTY = 5000;

/** `breaks` is one flat ladder (see `flatBreaks`): decoration is in the price. */
export default function PriceEstimator({ breaks, minimum }: { breaks: PublicPriceBreak[]; minimum?: number | null }) {
  const ladder = useMemo(() => [...breaks].sort((a, b) => a.minQuantity - b.minQuantity), [breaks]);
  // Nobody can order below the minimum, so tiers that only apply under it are dropped
  // and the track starts at it.
  const tiers = ladder.filter((t, i) => !(minimum && ladder[i + 1] && ladder[i + 1].minQuantity <= minimum));
  const minQ = Math.max(minimum ?? 1, tiers[0]?.minQuantity ?? 1);
  // Reaches 5,000, or past the top break if a product's ladder goes higher.
  const maxQ = Math.max(MAX_QTY, Math.round((tiers[tiers.length - 1]?.minQuantity ?? minQ) * 1.6));
  const [pos, setPos] = useState(0);

  if (tiers.length === 0) return null;

  const qty = Math.round(Math.exp(Math.log(minQ) + pos * (Math.log(maxQ) - Math.log(minQ))));
  const active = [...tiers].reverse().find((t) => qty >= t.minQuantity) ?? tiers[0];
  const currency = active.currency;
  const top = tiers[0].unitPriceCents;

  return (
    <div>
      <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:items-end">
        <div>
          <p className="text-[0.875rem] text-muted">Quantity</p>
          <p className="mt-2 text-d1 font-extrabold tabular-nums">{qty.toLocaleString('en-US')}</p>
          <input
            type="range"
            min={0}
            max={1}
            step={0.001}
            value={pos}
            onChange={(e) => setPos(Number(e.target.value))}
            className="range mt-2"
            aria-label="Quantity"
            aria-valuetext={`${qty} units`}
          />
          <div className="mt-6 grid grid-cols-2 gap-6 border-t border-rule pt-5">
            <div>
              <p className="text-[0.875rem] text-muted">Per piece</p>
              <p className="mt-2 text-d3 font-semibold tabular-nums">{formatMoney(active.unitPriceCents, currency)}</p>
            </div>
            <div>
              <p className="text-[0.875rem] text-muted">Estimated total</p>
              <p className="mt-2 text-d3 font-semibold tabular-nums">{formatMoney(active.unitPriceCents * qty, currency)}</p>
            </div>
          </div>
        </div>

        {/* The breaks as bars: height is the unit price, the active tier is lit. */}
        <div className="flex h-48 items-end gap-2" aria-hidden>
          {tiers.map((t) => {
            const on = t === active;
            return (
              <div key={t.minQuantity} className="flex flex-1 flex-col items-center gap-2">
                <span className={`text-[0.75rem] font-semibold tabular-nums ${on ? 'text-uv' : 'text-muted'}`}>
                  {formatMoney(t.unitPriceCents, t.currency)}
                </span>
                <div
                  className={`w-full transition-colors duration-300 ${on ? 'bg-electric' : 'bg-ink/5'} rounded-t-md`}
                  style={{ height: `${Math.max(12, (t.unitPriceCents / top) * 150)}px` }}
                />
                <span className={`text-[0.75rem] tabular-nums ${on ? 'text-ink' : 'text-muted'}`}>
                  {Math.max(t.minQuantity, minQ).toLocaleString('en-US')}+
                </span>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
