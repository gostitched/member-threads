/**
 * Kickoff to delivery, drawn to scale: design, sampling and production in one bar,
 * with the range between the earliest and latest date hatched. "6–8 weeks" is a
 * number; a bar you can hold against a calendar is a plan.
 */
export default function LeadTimeline({ lead }: { lead: { min: number; max: number } | null }) {
  if (!lead) return null;

  const { min, max } = lead;
  const pct = (days: number) => `${(days / max) * 100}%`;
  const weeksLow = Math.round(min / 7);
  const weeksHigh = Math.round(max / 7);

  const ticks: number[] = [];
  for (let d = 7; d <= max; d += 7) ticks.push(d);

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-16">
      <div>
        <p className="caps text-d3">
          {weeksLow === weeksHigh ? weeksLow : `${weeksLow}–${weeksHigh}`} weeks, start to delivery.
        </p>
        <p className="mt-4 max-w-[40ch] text-[0.9375rem] text-ink/75">
          Design, sampling and production included. Have a hard date, like a recruitment week or a conference? Tell
          us first and we plan backward from it.
        </p>
      </div>

      <div className="relative self-end">
        <div className="flex h-12 w-full overflow-hidden rounded-full bg-cream">
          {min > 0 && (
            <div className="flex h-full items-center rounded-full bg-ink px-5 text-paper" style={{ width: pct(min) }}>
              <span className="label truncate">Design · Sampling · Production</span>
            </div>
          )}
          {max > min && (
            <div
              className="h-full"
              style={{
                width: pct(max - min),
                background: 'repeating-linear-gradient(-45deg, rgba(19,51,39,0.28) 0 5px, transparent 5px 11px)',
              }}
              title="Range"
            />
          )}
        </div>

        {/* Week ticks. */}
        <div className="relative mt-3 h-5" aria-hidden>
          {ticks.map((d) => (
            <span
              key={d}
              className={`label absolute top-0 text-muted ${d === max ? '-translate-x-full' : '-translate-x-1/2'}`}
              style={{ left: pct(d) }}
            >
              W{d / 7}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
