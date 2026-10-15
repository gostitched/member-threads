/**
 * Approval to delivery, drawn to scale: production, with its range hatched.
 * Samples are made only on request, so they aren't drawn. "21–28 days" is a number; a bar you can hold against a calendar is a plan.
 */
export default function LeadTimeline({ lead }: { lead: { min: number; max: number } | null }) {
  if (!lead) return null;

  const min = lead.min;
  const max = lead.max;
  const total = max;
  const pct = (days: number) => `${(days / total) * 100}%`;
  const weeksLow = Math.round(min / 7);
  const weeksHigh = Math.round(total / 7);

  const ticks: number[] = [];
  for (let d = 7; d < total; d += 7) ticks.push(d);

  return (
    <div>
      <p className="text-d3 font-semibold">
        About {weeksLow === weeksHigh ? weeksLow : `${weeksLow}–${weeksHigh}`} weeks from approval to delivery.
      </p>

      <div className="relative mt-8">
        <div className="flex h-14 w-full">
          {min > 0 && (
            <div className="flex h-full items-center bg-electric px-3 text-ink" style={{ width: pct(min) }}>
              <span className="label truncate">Production · {min === max ? `${min}d` : `${min}–${max}d`}</span>
            </div>
          )}
          {max > min && (
            <div
              className="h-full"
              style={{
                width: pct(max - min),
                background:
                  'repeating-linear-gradient(-45deg, rgba(14,122,74,0.55) 0 6px, rgba(14,122,74,0.15) 6px 12px)',
              }}
              title="Production range"
            />
          )}
        </div>

        {/* Week ticks. */}
        <div className="relative mt-2 h-5" aria-hidden>
          {ticks.map((d) => (
            <span
              key={d}
              className="absolute top-0 -translate-x-1/2 font-mono text-[10px] text-muted"
              style={{ left: pct(d) }}
            >
              W{d / 7}
            </span>
          ))}
        </div>
      </div>

      <p className="mt-4 max-w-measure text-[0.875rem] text-muted">
        Timing starts when you approve the designs. Tell us the date of the event and we&rsquo;ll plan
        backwards from the day it has to arrive.
      </p>
    </div>
  );
}
