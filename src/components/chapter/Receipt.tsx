import { SLIP, COLORWAYS, named, type Custom, type Look } from '@/lib/chapter';
import { DEFAULT_NAME } from '@/lib/name';

export type SlipLine = { id: Custom; no: string; label: string };

/**
 * The tech pack on the table: a real spec sheet, square, on paper, with the
 * site's one shadow (`.lift`). Header with the house mark, style and revision;
 * the organization in the block face; the base spec as a hairline grid; the
 * neck label as it will be woven (it re-weaves when the name changes); then a
 * numbered line per detail, in the order chosen, every one at +$0. The line
 * for the detail being pointed at lights up, and pointing at a line lights the
 * detail. The total never moves.
 */
export default function Receipt({
  lines,
  focus,
  name = DEFAULT_NAME,
  look,
  rev = 0,
  onReset,
  setHover,
  className = '',
}: {
  lines: SlipLine[];
  focus: Custom | null;
  name?: string;
  look: Look;
  rev?: number;
  onReset?: () => void;
  setHover?: (id: Custom | null) => void;
  className?: string;
}) {
  const cw = COLORWAYS[look.color];
  return (
    <article aria-label={`Tech pack for ${name}`} className={`chapter-slip lift relative ${className}`}>
      <header className="flex items-start justify-between gap-4">
        <span role="img" aria-label={SLIP.brand} className="chapter-logo-ink block h-9 w-[86px]" />
        <div className="text-right">
          <p className="t-spec">{SLIP.kicker}</p>
          <p className="t-spec fg-muted num mt-0.5">
            {SLIP.no} · Rev. <span key={rev} className="chapter-tick inline-block">{String(rev).padStart(2, '0')}</span>
          </p>
        </div>
      </header>

      <div className="hairline mt-5 pt-4">
        <p className="t-spec fg-muted">Organization</p>
        <p className="chapter-slip-org mt-2">{named(SLIP.title, name)}</p>
      </div>

      <dl className="chapter-slip-specs mt-5">
        {SLIP.specs.map(([k, v]) => (
          <div key={k}>
            <dt className="t-spec fg-muted">{k}</dt>
            <dd className="t-spec mt-1">
              {k === 'Colorway' ? (
                <span key={cw.id} className="chapter-fade-in inline-flex items-center gap-1.5">
                  <span aria-hidden className="chapter-slip-sw" style={{ background: cw.body }} />
                  {v.replace('{color}', cw.name)}
                </span>
              ) : (
                v
              )}
            </dd>
          </div>
        ))}
      </dl>

      <div className="hairline mt-0 flex items-center justify-between gap-3 py-4">
        <p className="t-spec fg-muted shrink-0">{SLIP.label}</p>
        <span className="chapter-necklabel woven woven-green">
          <span key={name} className="chapter-reweave chapter-woven-name">{name}</span>
        </span>
      </div>

      <div className="hairline">
        <div className="t-spec fg-muted flex justify-between py-2.5">
          <span>No. · {SLIP.item}</span>
          <span>{SLIP.upcharge}</span>
        </div>
        <ul aria-label="Details added" className="chapter-slip-lines">
          {lines.length === 0 && <li className="t-spec fg-muted py-1.5">{SLIP.empty}</li>}
          {lines.map((r) => (
            <li
              key={r.id}
              data-lit={focus === r.id || undefined}
              onPointerEnter={(e) => e.pointerType === 'mouse' && setHover?.(r.id)}
              onPointerLeave={(e) => e.pointerType === 'mouse' && setHover?.(null)}
              className="chapter-slip-row t-spec"
            >
              <span aria-hidden className="fg-muted num w-6 shrink-0">{r.no}</span>
              <span className="chapter-print min-w-0 flex-1">{r.label}</span>
              <span className="num shrink-0">{SLIP.included}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="hairline mt-2 flex items-end justify-between gap-3 pt-4">
        <div>
          <p className="t-spec">{SLIP.totalLabel}</p>
          <p className="t-spec fg-muted num mt-1">{String(lines.length).padStart(2, '0')} details</p>
        </div>
        <p className="chapter-slip-total num">{SLIP.total}</p>
      </div>
      <p className="t-small mt-4 max-w-[34ch]">{SLIP.note}</p>

      <div className="mt-5 flex items-center justify-between gap-3">
        <span aria-hidden className="chapter-slip-code t-spec fg-muted">{SLIP.code}</span>
        {onReset && lines.length > 1 && (
          <button type="button" onClick={onReset} className="link-u t-spec chapter-reset">
            Start over
          </button>
        )}
      </div>
    </article>
  );
}
