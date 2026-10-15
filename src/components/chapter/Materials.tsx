/** Small production trims for the chapter: mono tags, a woven label, a pantone chip. */

/** A small mono tag: index number, name, one line of detail. */
export function Tag({
  n,
  name,
  note,
  className = '',
  ...rest
}: { n?: string; name: string; note?: string } & React.HTMLAttributes<HTMLSpanElement> & { 'data-only'?: string }) {
  return (
    <span className={`chapter-tag ${className}`} {...rest}>
      {n && <span className="text-uv">{n}</span>}
      <span>{name}</span>
      {note && <span className="text-muted">{note}</span>}
    </span>
  );
}

/** A woven neck label: ink ground, paper mono, two lines. Set straight. */
export function Woven({ lines, className = '' }: { lines: string[]; className?: string }) {
  return (
    <span aria-hidden className={`chapter-woven ${className}`}>
      {lines.map((l) => <span key={l}>{l}</span>)}
    </span>
  );
}

/** A pantone chip: the colour, then its hex and name in mono. */
export function Chip({ hex, name, className = '' }: { hex: string; name: string; className?: string }) {
  return (
    <span className={`flex flex-col bg-white p-1.5 ${className}`}>
      <span aria-hidden className="block aspect-square" style={{ background: hex }} />
      <span className="label mt-1.5 block text-[10px] leading-tight text-ink">{name}</span>
      <span className="label block text-[10px] leading-tight text-muted">{hex}</span>
    </span>
  );
}
