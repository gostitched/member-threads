/**
 * Kickoff to delivery, drawn to scale: design, sampling and production as one run of
 * stitches, with the range between the earliest and latest delivery hatched. "6–8
 * weeks" is a number; a line you can hold against a calendar is a plan.
 *
 * Drawn for the product page's green band: it reads its colours from the band.
 */
const WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'];
const word = (n: number) => WORDS[n] ?? String(n);
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export default function LeadTimeline({ lead }: { lead: { min: number; max: number } | null }) {
  if (!lead) return null;

  const { min, max } = lead;
  const pct = (days: number) => `${(days / max) * 100}%`;
  const weeksLow = Math.round(min / 7);
  const weeksHigh = Math.round(max / 7);
  const span = weeksLow === weeksHigh ? cap(word(weeksLow)) : `${cap(word(weeksLow))} to ${word(weeksHigh)}`;

  const ticks: number[] = [];
  for (let d = 7; d <= max; d += 7) ticks.push(d);

  return (
    <div className="grid-12 gap-y-14">
      <div className="col-span-4 sm:col-span-8 lg:col-span-5">
        <p className="t-eyebrow text-beige">Timeline</p>
        <h2 className="t-h1 mt-5">
          {span} weeks, <em>start</em> to delivery.
        </h2>
        <p className="t-body mt-7 max-w-[44ch] text-cream/90">
          Design, sampling and production included. Have a hard date, like a recruitment week or a conference? Tell
          us first and we plan backward from it.
        </p>
      </div>

      <figure className="col-span-4 self-end sm:col-span-8 lg:col-span-6 lg:col-start-7">
        <figcaption className="sr-only">
          Kickoff to delivery in {weeksLow === weeksHigh ? weeksLow : `${weeksLow} to ${weeksHigh}`} weeks, design,
          sampling and production included.
        </figcaption>
        <div aria-hidden>
          {/* Milestones over the line. */}
          <div className="relative h-14">
            <span className="t-spec absolute left-0 top-0 text-cream">Kickoff</span>
            <span className="t-spec absolute top-0 -translate-x-full text-right text-cream" style={{ left: pct(max) }}>
              Delivery
            </span>
            <span className="t-spec absolute top-5 -translate-x-full whitespace-nowrap text-right fg-muted" style={{ left: pct(max) }}>
              Week {weeksLow === weeksHigh ? weeksLow : `${weeksLow}–${weeksHigh}`}
            </span>
          </div>

          {/* The run: a solid stitch to the earliest date, hatching to the latest. */}
          <div className="relative h-12">
            <span className="absolute left-0 top-0 h-full w-px bg-cream" />
            <span className="absolute top-0 h-full w-px bg-cream" style={{ left: `calc(${pct(max)} - 1px)` }} />
            <div
              className="draw-in absolute left-0 top-1/2 h-[3px] -translate-y-1/2"
              style={{
                width: pct(min),
                backgroundImage: 'repeating-linear-gradient(90deg, #C4B19A 0 10px, transparent 10px 15px)',
              }}
            />
            {max > min && (
              <div className="ct-hatch-lt absolute top-1/2 h-6 -translate-y-1/2" style={{ left: pct(min), width: pct(max - min) }} />
            )}
          </div>

          {/* Week ticks. */}
          <div className="relative mt-2 h-8 border-t border-[var(--rule-c)]">
            {ticks.map((d) => (
              <span
                key={d}
                className={`t-spec absolute top-3 fg-muted ${d === max ? '-translate-x-full' : '-translate-x-1/2'}`}
                style={{ left: pct(d) }}
              >
                W{d / 7}
              </span>
            ))}
          </div>

          <div className="t-spec mt-6 flex flex-wrap gap-x-8 gap-y-2 text-cream">
            <span className="flex items-center gap-2">
              <i className="block h-[3px] w-6" style={{ backgroundImage: 'repeating-linear-gradient(90deg, #C4B19A 0 6px, transparent 6px 9px)' }} />
              Design · Sampling · Production
            </span>
            {max > min && (
              <span className="flex items-center gap-2">
                <i className="ct-hatch-lt block h-3 w-6" />
                Delivery window
              </span>
            )}
          </div>
        </div>
      </figure>
    </div>
  );
}
