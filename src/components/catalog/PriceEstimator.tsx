'use client';

import { useMemo, useState } from 'react';
import type { PublicPriceBreak } from '@/lib/catalog/types';
import { formatMoney } from '@/lib/catalog/util';

/**
 * The price ladder, and a quantity you can drag across it.
 *
 * The tiers read first, as a row (36 / 72 / 144 / 300+), because that is the answer
 * most buyers want. The slider underneath turns it into a total for their headcount.
 * It is logarithmic: 36 to 72 matters as much, in decision terms, as 300 to 600.
 */
const MAX_QTY = 1000;

/** `breaks` is one flat ladder (see `flatBreaks`): decoration is in the price. */
export default function PriceEstimator({ breaks, minimum }: { breaks: PublicPriceBreak[]; minimum?: number | null }) {
  const ladder = useMemo(() => [...breaks].sort((a, b) => a.minQuantity - b.minQuantity), [breaks]);
  // Nobody can order below the minimum, so tiers that only apply under it are dropped
  // and the track starts at it.
  const tiers = ladder.filter((t, i) => !(minimum && ladder[i + 1] && ladder[i + 1].minQuantity <= minimum));
  const minQ = Math.max(minimum ?? 1, tiers[0]?.minQuantity ?? 1);
  const maxQ = Math.max(MAX_QTY, Math.round((tiers[tiers.length - 1]?.minQuantity ?? minQ) * 1.6));
  const [pos, setPos] = useState(0);

  if (tiers.length === 0) return null;

  const qty = Math.round(Math.exp(Math.log(minQ) + pos * (Math.log(maxQ) - Math.log(minQ))));
  const active = [...tiers].reverse().find((t) => qty >= t.minQuantity) ?? tiers[0];
  const currency = active.currency;
  const last = tiers[tiers.length - 1];

  return (
    <div>
      {/* The ladder. Each tier is a button that jumps the slider to it. */}
      <div className="grid border-y border-rule" style={{ gridTemplateColumns: `repeat(${tiers.length}, minmax(0, 1fr))` }}>
        {tiers.map((t, i) => {
          const on = t === active;
          const q = Math.max(t.minQuantity, minQ);
          return (
            <button
              key={t.minQuantity}
              type="button"
              aria-pressed={on}
              onClick={() => setPos((Math.log(q) - Math.log(minQ)) / (Math.log(maxQ) - Math.log(minQ)))}
              className={`relative flex flex-col items-start gap-2 px-3 py-4 text-left transition-colors duration-200 sm:px-4 ${
                i > 0 ? 'border-l border-rule' : ''
              } ${on ? 'bg-cream' : 'hover:bg-cream/50'}`}
            >
              <span className="label text-muted">
                {q.toLocaleString('en-US')}
                {t === last ? '+' : ''}
              </span>
              <span className="text-[1.125rem] font-semibold tabular-nums sm:text-[1.375rem]">
                {formatMoney(t.unitPriceCents, t.currency)}
              </span>
              <span aria-hidden className={`absolute inset-x-0 top-0 h-[2px] ${on ? 'bg-ink' : 'bg-transparent'}`} />
            </button>
          );
        })}
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-[1fr_auto] sm:items-end">
        <div>
          <div className="flex items-baseline justify-between gap-4">
            <p className="label text-muted">Quantity</p>
            <p className="text-[0.8125rem] text-muted">Sizes mix freely</p>
          </div>
          <p className="mt-2 text-d2 font-black tabular-nums">{qty.toLocaleString('en-US')}</p>
          <input
            type="range"
            min={0}
            max={1}
            step={0.001}
            value={pos}
            onChange={(e) => setPos(Number(e.target.value))}
            className="range mt-3"
            aria-label="Quantity"
            aria-valuetext={`${qty} pieces`}
          />
        </div>
        <div className="grid grid-cols-2 gap-6 border-t border-rule pt-5 sm:min-w-[15rem] sm:border-l sm:border-t-0 sm:pl-6 sm:pt-0">
          <div>
            <p className="label text-muted">Per piece</p>
            <p className="mt-2 text-[1.25rem] font-semibold tabular-nums">{formatMoney(active.unitPriceCents, currency)}</p>
          </div>
          <div>
            <p className="label text-muted">Estimate</p>
            <p className="mt-2 text-[1.25rem] font-semibold tabular-nums">
              {formatMoney(active.unitPriceCents * qty, currency)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
