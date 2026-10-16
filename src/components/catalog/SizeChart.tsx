'use client';

import { useState } from 'react';

const CM_PER_IN = 2.54;

/** Eighths reduced to lowest terms: 6/8 → 3/4. */
function reduce(n: number, d: number): [number, number] {
  while (n % 2 === 0 && d > 1) {
    n /= 2;
    d /= 2;
  }
  return [n, d];
}

/**
 * A mixed number, set by hand: whole number, then a raised numerator and lowered
 * denominator around a fraction slash.
 *
 * Not the Unicode vulgar fractions (¾, ⅜): in the mono face they are drawn at about
 * half the cap height and blur into one glyph at table size. These are real digits at
 * a readable size, and the accessible name is spelled out ("22 and 3/4").
 */
function Fraction({ whole, num, den }: { whole: number; num: number; den: number }) {
  return (
    <span aria-label={`${whole ? `${whole} and ` : ''}${num}/${den}`}>
      <span aria-hidden className="inline-flex items-baseline">
        {whole > 0 && <span>{whole}</span>}
        <span className={`inline-flex items-baseline font-sans font-semibold ${whole > 0 ? 'ml-[0.12em]' : ''}`}>
          <span className="relative -top-[0.4em] text-[0.72em] leading-none">{num}</span>
          <span className="mx-[0.04em] text-[0.8em] leading-none opacity-60">⁄</span>
          <span className="text-[0.72em] leading-none">{den}</span>
        </span>
      </span>
    </span>
  );
}

/**
 * Inches the way a spec sheet writes them: 22¾, not 22.75 (or worse, 22.8). Values that
 * are not a clean eighth — a converted centimetre figure, a typo — fall back to one
 * decimal rather than being silently rounded to a fraction they are not.
 */
function inches(value: number, exact: boolean): React.ReactNode {
  const eighths = Math.round(value * 8);
  if (exact && Math.abs(eighths / 8 - value) > 0.001) return decimal(value);
  const whole = Math.floor(eighths / 8);
  const rest = eighths % 8;
  if (rest === 0) return String(whole);
  const [num, den] = reduce(rest, 8);
  return <Fraction whole={whole} num={num} den={den} />;
}

function decimal(value: number): string {
  const r = Math.round(value * 10) / 10;
  return Number.isInteger(r) ? String(r) : r.toFixed(1);
}

/**
 * The size chart, readable in either unit.
 *
 * The dashboard stores it size-first — `{ "M": { "Chest": 27, "Length": 25.5 } }` — with
 * sizes and measurements already in the editor's order. It is drawn the way size charts
 * are read: sizes across, measurements down, and the size under the pointer lit down its
 * whole column, because the question a chart answers is "what is a Large".
 */
export default function SizeChart({
  chart,
  unit,
}: {
  chart: Record<string, Record<string, number>>;
  unit: 'in' | 'cm';
}) {
  const [shown, setShown] = useState<'in' | 'cm'>(unit);
  const [hot, setHot] = useState<string | null>(null);

  const sizes = Object.keys(chart).filter((s) => chart[s] && Object.keys(chart[s]).length > 0);
  const measurements = [...new Set(sizes.flatMap((s) => Object.keys(chart[s])))];
  if (sizes.length === 0 || measurements.length === 0) return null;

  const format = (v: number) => {
    if (shown === 'cm') return decimal(unit === 'cm' ? v : v * CM_PER_IN);
    return inches(unit === 'in' ? v : v / CM_PER_IN, unit === 'in');
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <p className="t-spec fg-muted">Measured flat · {shown === 'in' ? 'Inches' : 'Centimetres'}</p>
        <div className="flex gap-1.5" role="group" aria-label="Units">
          {(['in', 'cm'] as const).map((u) => (
            <button key={u} type="button" aria-pressed={shown === u} onClick={() => setShown(u)} className="chip min-w-[52px] px-3">
              {u}
            </button>
          ))}
        </div>
      </div>
      <div className="-mx-5 overflow-x-auto px-5 sm:mx-0 sm:px-0">
        <table className="w-full min-w-[520px] border-collapse text-left" onPointerLeave={() => setHot(null)}>
          <caption className="sr-only">
            Garment measurements by size, in {shown === 'in' ? 'inches' : 'centimetres'}, measured flat
          </caption>
          <thead>
            <tr className="border-b border-ink">
              <th scope="col" className="t-eyebrow fg-muted w-40 py-3 pr-4 font-semibold">
                Size
              </th>
              {sizes.map((s) => (
                <th
                  key={s}
                  scope="col"
                  onPointerEnter={() => setHot(s)}
                  className={`t-spec min-w-[3.25rem] px-1 py-3 text-center text-[13px] font-semibold transition-colors duration-[180ms] ${
                    hot === s ? 'bg-ink text-paper' : ''
                  }`}
                >
                  {s}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {measurements.map((m) => (
              <tr key={m} className="border-b border-[var(--rule-c)]">
                <th scope="row" className="t-small whitespace-nowrap py-3.5 pr-4 font-medium">
                  {m}
                </th>
                {sizes.map((s) => {
                  const v = chart[s][m];
                  return (
                    <td
                      key={s}
                      onPointerEnter={() => setHot(s)}
                      className={`num whitespace-nowrap px-1 py-3.5 text-center text-[15px] transition-colors duration-[180ms] ${
                        hot === s ? 'bg-cream text-ink' : 'text-ink/85'
                      }`}
                    >
                      {typeof v === 'number' ? format(v) : '—'}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
