/**
 * The site's stand-in for photography.
 *
 * The brand mark is an "S" drawn as a running stitch, so the visual language is
 * built from the same construction: dashed strokes on a saturated ground, drawn
 * on first paint and then left still. Pure SVG + CSS — nothing to load, and it
 * scales to any panel size.
 */
export default function StitchField({
  className = '',
  tone = 'blue',
  fill = false,
}: {
  className?: string;
  tone?: 'blue' | 'ink' | 'ash';
  /**
   * Absolutely fill the nearest positioned ancestor, for use as a backdrop.
   * Passing `absolute` through `className` instead would not work: the root
   * already sets `relative`, Tailwind emits `.relative` after `.absolute`, so
   * the field would stay in flow and push the content it is meant to sit behind
   * out of the container.
   */
  fill?: boolean;
}) {
  const ground = tone === 'blue' ? '#2B5BD7' : tone === 'ink' ? '#0E1A47' : '#F3F3F3';
  const line = tone === 'ash' ? 'rgba(23,23,23,0.22)' : 'rgba(255,255,255,0.5)';
  const glow = tone === 'ash' ? 'rgba(14,122,74,0.14)' : 'rgba(255,255,255,0.16)';

  return (
    <div
      className={`${fill ? 'absolute inset-0' : 'relative'} overflow-hidden ${className}`}
      style={{ backgroundColor: ground }}
    >
      {/* Slow drifting light. Large and low-contrast so it reads as depth. */}
      <div
        aria-hidden
        className="animate-drift absolute -inset-1/4 will-change-transform"
        style={{ background: `radial-gradient(45% 45% at 35% 40%, ${glow}, transparent 70%)` }}
      />
      <svg
        aria-hidden
        viewBox="0 0 400 300"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full"
      >
        {/* Running-stitch seams, drawn on load at staggered delays. */}
        {[0, 1, 2, 3, 4].map((i) => (
          <path
            key={i}
            d={`M -40 ${70 + i * 44} C 90 ${20 + i * 44}, 180 ${130 + i * 44}, 300 ${64 + i * 44} S 440 ${34 + i * 44}, 480 ${88 + i * 44}`}
            fill="none"
            stroke={line}
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="9 11"
            pathLength={1}
            style={{
              strokeDasharray: '0.02 0.024',
              strokeDashoffset: 1,
              animation: `stitch 2.4s cubic-bezier(0.16,1,0.3,1) ${i * 0.13}s forwards`,
            }}
          />
        ))}
      </svg>
    </div>
  );
}
