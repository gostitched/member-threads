import { SLIP, named, type Custom } from '@/lib/chapter';
import { DEFAULT_NAME } from '@/lib/name';

export type SlipLine = { id: Custom; label: string };

/**
 * Sophie's tech pack on the table. Every step the visitor takes prints a line
 * (in the order they took them) and the slip grows downward; design and
 * development stay included. The line for the detail being pointed at lights up.
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
    <div className={`chapter-slip receipt relative ${className}`}>
      <header className="chapter-slip-text text-center">
        <p className="chapter-slip-brand">{SLIP.brand}</p>
        <p className="mt-[0.35em] text-muted">{named(SLIP.title, name)}</p>
      </header>
      <div className="chapter-slip-text chapter-slip-rule mt-[0.9em] flex justify-between pt-[0.6em] text-muted">
        <span>{SLIP.no}</span>
        <span>{SLIP.qty}</span>
      </div>
      <div className="chapter-slip-text chapter-slip-rule mt-[0.6em] flex justify-between py-[0.5em] font-semibold">
        <span>{SLIP.item}</span>
        <span>{SLIP.upcharge}</span>
      </div>
      <ul className="chapter-slip-rule py-[0.5em]" aria-label="Tech pack">
        {lines.map((r) => (
          <li key={r.id} data-lit={focus === r.id || undefined} className="chapter-slip-row chapter-slip-text chapter-slip-in">
            <span className="min-w-0">{r.label}</span>
            <span className="shrink-0">{SLIP.included}</span>
          </li>
        ))}
      </ul>
      <div className="chapter-slip-double pt-[0.8em]">
        <p className="chapter-slip-text mb-[0.5em] font-semibold">{SLIP.totalLabel}</p>
        <p className="chapter-slip-total text-uv">{SLIP.total}</p>
        <p className="chapter-slip-text mt-[0.6em] text-muted">{SLIP.note}</p>
      </div>
      <div aria-hidden className="chapter-slip-barcode mt-[0.9em]" />
      <p aria-hidden className="chapter-slip-text mt-[0.3em] text-center text-[0.8em] tracking-[0.4em] text-muted">{SLIP.code}</p>
    </div>
  );
}
