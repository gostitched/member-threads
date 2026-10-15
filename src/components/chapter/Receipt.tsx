import { SLIP, named, type Custom } from '@/lib/chapter';
import { DEFAULT_NAME } from '@/lib/name';

export type SlipLine = { id: Custom; label: string };

/**
 * The tech pack on the table. Every step the visitor takes prints a line (in
 * the order they took them) and the slip grows downward; the upcharge column
 * stays at +$0. The line for the detail being pointed at lights up.
 */
export default function Receipt({
  lines,
  focus,
  name = DEFAULT_NAME,
  className = '',
}: {
  lines: SlipLine[];
  focus: Custom | null;
  name?: string;
  className?: string;
}) {
  return (
    <div className={`chapter-slip relative ${className}`}>
      <header className="chapter-slip-head">
        <div className="flex items-center justify-between gap-3">
          <p className="chapter-slip-brand">{SLIP.brand}</p>
          <p className="chapter-slip-text text-muted">{SLIP.kicker}</p>
        </div>
        <p className="chapter-slip-org mt-[0.9em]">{named(SLIP.title, name)}</p>
      </header>
      <dl className="chapter-slip-text chapter-slip-rule mt-[0.9em] grid grid-cols-2 gap-x-3 gap-y-[0.15em] pt-[0.7em] text-muted">
        <dt className="sr-only">Style</dt><dd>{SLIP.no}</dd>
        <dt className="sr-only">Fabric</dt><dd className="text-right">{SLIP.qty}</dd>
        <dt className="sr-only">Fit</dt><dd>{SLIP.fit}</dd>
        <dt className="sr-only">Minimum</dt><dd className="text-right">{SLIP.min}</dd>
      </dl>
      <div className="chapter-slip-text chapter-slip-rule mt-[0.7em] flex justify-between py-[0.5em] font-semibold">
        <span>{SLIP.item}</span>
        <span>{SLIP.upcharge}</span>
      </div>
      <ul className="chapter-slip-rule py-[0.4em]" aria-label="Tech pack">
        {lines.length === 0 && <li className="chapter-slip-text py-[0.18em] text-ink/35">Tap a detail to add it</li>}
        {lines.map((r) => (
          <li key={r.id} data-lit={focus === r.id || undefined} className="chapter-slip-row chapter-slip-text chapter-slip-in">
            <span className="min-w-0">{r.label}</span>
            <span className="shrink-0">{SLIP.included}</span>
          </li>
        ))}
      </ul>
      <div className="chapter-slip-total-row chapter-slip-rule flex items-end justify-between gap-3 pt-[0.8em]">
        <p className="chapter-slip-text font-semibold">{SLIP.totalLabel}</p>
        <p className="chapter-slip-total">{SLIP.total}</p>
      </div>
      <p className="chapter-slip-text mt-[0.7em] normal-case tracking-normal text-muted">{SLIP.note}</p>
      <p aria-hidden className="chapter-slip-code mt-[1em]">{SLIP.code}</p>
    </div>
  );
}
