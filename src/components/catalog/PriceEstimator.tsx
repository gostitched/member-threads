'use client';

import { useId, useMemo, useState } from 'react';
import type { PublicPriceBreak } from '@/lib/catalog/types';
import { formatMoney } from '@/lib/catalog/util';

/**
 * The price ladder, and a quantity you can set against it.
 *
 * The ladder reads first, as a hairline table (36 / 72 / 144 / 300+), because that is
 * the answer most buyers want; the tier your quantity lands in is marked. Under it,
 * the quantity: a stepper for an exact headcount and a slider for feel. The slider is
 * logarithmic: 36 to 72 matters as much, in decision terms, as 300 to 600.
 */
const MAX_QTY = 1000;
const HARD_MAX = 99999;

/** `breaks` is one flat ladder (see `flatBreaks`): decoration is in the price. */
export default function PriceEstimator({ breaks, minimum }: { breaks: PublicPriceBreak[]; minimum?: number | null }) {
  const id = useId();
  const ladder = useMemo(() => [...breaks].sort((a, b) => a.minQuantity - b.minQuantity), [breaks]);
  // Nobody can order below the minimum, so tiers that only apply under it are dropped
  // and the track starts at it.
  const tiers = ladder.filter((t, i) => !(minimum && ladder[i + 1] && ladder[i + 1].minQuantity <= minimum));
  const minQ = Math.max(minimum ?? 1, tiers[0]?.minQuantity ?? 1);
  const maxQ = Math.max(MAX_QTY, Math.round((tiers[tiers.length - 1]?.minQuantity ?? minQ) * 1.6));
  const [qty, setQty] = useState(minQ);
  const [draft, setDraft] = useState<string | null>(null);

  if (tiers.length === 0) return null;

  const L = (n: number) => Math.log(n);
  const posOf = (q: number) => Math.min(1, Math.max(0, (L(q) - L(minQ)) / (L(maxQ) - L(minQ))));
  const qtyAt = (pos: number) => Math.round(Math.exp(L(minQ) + pos * (L(maxQ) - L(minQ))));
  const clamp = (q: number) => Math.min(HARD_MAX, Math.max(minQ, Math.round(q) || minQ));

  const activeIndex = tiers.reduce((at, t, i) => (qty >= Math.max(t.minQuantity, minQ) ? i : at), 0);
  const active = tiers[activeIndex];
  const next = tiers[activeIndex + 1];
  const currency = active.currency;
  const total = active.unitPriceCents * qty;
  const pos = posOf(qty);

  const commitDraft = () => {
    if (draft === null) return;
    setQty(clamp(Number(draft.replace(/[^\d]/g, ''))));
    setDraft(null);
  };

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 id={`${id}-h`} className="t-eyebrow">
          Price per piece
        </h2>
        <p className="t-spec fg-muted">Design + decoration included</p>
      </div>

      {/* The ladder. Each tier's quantity is a button that sets the order to it. */}
      <table className="mt-4 w-full border-collapse border-t border-ink text-left" aria-labelledby={`${id}-h`}>
        <thead className="sr-only">
          <tr>
            <th scope="col">Pieces</th>
            <th scope="col">Price per piece</th>
          </tr>
        </thead>
        <tbody>
          {tiers.map((t, i) => {
            const on = i === activeIndex;
            const from = Math.max(t.minQuantity, minQ);
            const upTo = tiers[i + 1] ? tiers[i + 1].minQuantity - 1 : null;
            return (
              <tr key={t.minQuantity} className="ct-tier border-b border-[var(--rule-c)]" data-on={on}>
                <th scope="row" className="p-0 font-normal">
                  <button
                    type="button"
                    onClick={() => setQty(from)}
                    aria-pressed={on}
                    className="flex w-full items-center gap-3 py-2.5 pl-4 text-left"
                  >
                    <span className="t-spec num">
                      {from.toLocaleString('en-US')}
                      {upTo ? `–${upTo.toLocaleString('en-US')}` : '+'}
                    </span>
                    <span className="t-spec fg-muted">pieces</span>
                  </button>
                </th>
                <td className="py-2.5 pr-4 text-right">
                  <span className={`num text-[17px] ${on ? 'font-semibold' : ''}`}>{formatMoney(t.unitPriceCents, t.currency)}</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Quantity: exact, then by feel. */}
      <div className="mt-7 flex items-center justify-between gap-4">
        <label htmlFor={`${id}-q`} className="t-eyebrow">
          Quantity
        </label>
        <div className="ct-stepper flex items-center gap-2">
          <button type="button" onClick={() => setQty((q) => clamp(q - 1))} disabled={qty <= minQ} aria-label="One fewer piece">
            <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden>
              <path d="M1 6h10" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </button>
          <input
            id={`${id}-q`}
            type="number"
            inputMode="numeric"
            min={minQ}
            max={HARD_MAX}
            value={draft ?? qty}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commitDraft}
            onKeyDown={(e) => e.key === 'Enter' && commitDraft()}
            aria-describedby={`${id}-note`}
          />
          <button type="button" onClick={() => setQty((q) => clamp(q + 1))} aria-label="One more piece">
            <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden>
              <path d="M1 6h10M6 1v10" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </button>
        </div>
      </div>

      <div className="ct-range mt-2">
        <span className="ct-range-track" aria-hidden />
        <span className="ct-range-fill" style={{ left: 13, width: `calc(${pos} * (100% - 26px))` }} aria-hidden />
        {tiers.slice(1).map((t) => (
          <span
            key={t.minQuantity}
            className="ct-range-tick"
            style={{ left: `calc(13px + ${posOf(t.minQuantity)} * (100% - 26px))` }}
            aria-hidden
          />
        ))}
        <input
          type="range"
          min={0}
          max={1}
          step={0.001}
          value={pos}
          onChange={(e) => {
            setDraft(null);
            setQty(qtyAt(Number(e.target.value)));
          }}
          className="range"
          aria-label="Quantity, by slider"
          aria-valuetext={`${qty.toLocaleString('en-US')} pieces`}
        />
      </div>
      <div className="t-spec fg-muted -mt-1 flex justify-between" aria-hidden>
        <span>{minQ}</span>
        <span>{maxQ.toLocaleString('en-US')}+</span>
      </div>

      {/* The estimate. */}
      <div className="mt-6 border-t border-ink pt-5" aria-live="polite">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="t-eyebrow">Estimate</p>
            <p className="t-spec fg-muted mt-2 num">
              {qty.toLocaleString('en-US')} × {formatMoney(active.unitPriceCents, currency)}
            </p>
          </div>
          <p className="t-block num text-right text-[clamp(2rem,2.6vw,2.5rem)]">
            <span key={total} className="ct-tick">
              {formatMoney(total, currency)}
            </span>
          </p>
        </div>
        <p id={`${id}-note`} className="t-small fg-muted mt-4">
          {next ? (
            <>
              Add {(next.minQuantity - qty).toLocaleString('en-US')} more for{' '}
              <span className="text-ink">{formatMoney(next.unitPriceCents, next.currency)}</span> a piece.{' '}
            </>
          ) : null}
          Sizes mix freely. An estimate, not a quote.
        </p>
      </div>
    </div>
  );
}
