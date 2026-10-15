import { feeText, type Customization } from '@/lib/upcharge';

/**
 * The order ticket. It starts as a single line and prints a new one for every
 * option thrown at the garment, each fee struck out, while the total never moves.
 */
export default function Receipt({
  price,
  garment,
  lines,
  className = '',
  style,
}: {
  price: number;
  garment: string;
  lines: readonly Customization[];
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div className={`receipt relative w-full max-w-[21rem] bg-white font-mono text-ink ${className}`} style={style}>
      <div className="px-5 pb-6 pt-5 text-[11px] uppercase leading-[1.5] tracking-[0.06em]">
        <div className="flex items-baseline justify-between">
          <span className="font-bold tracking-[0.14em]">Member Threads</span>
          <span className="text-ink/50">Ticket Nº 0065</span>
        </div>
        <p className="text-ink/50">Studio order · Qty 1</p>

        <Rule />
        <Line label={garment} value={`$${price}`} />

        {lines.map((o) => (
          <div key={o.id} className="print-in grid">
            <div className="overflow-hidden">
              <Line
                label={o.receipt}
                value={
                  <>
                    <s className="mr-2 text-ink/40">{feeText(o)}</s>
                    <span className="font-bold text-electric">{o.verdict}</span>
                  </>
                }
              />
            </div>
          </div>
        ))}

        <Rule />
        <div className="flex items-baseline justify-between text-[13px] font-bold">
          <span>Your price</span>
          <span className="tabular-nums">${price}</span>
        </div>
      </div>
    </div>
  );
}

function Line({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline gap-2 py-[3px]">
      <span className="shrink-0">{label}</span>
      <span aria-hidden className="mb-[3px] min-w-4 flex-1 border-b border-dotted border-ink/35" />
      <span className="shrink-0 tabular-nums">{value}</span>
    </div>
  );
}

function Rule() {
  return <div aria-hidden className="my-3 border-t border-dashed border-ink/40" />;
}
