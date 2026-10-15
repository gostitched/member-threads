/**
 * A titled section on the paper ground. `tone="raised"` (or the legacy
 * 'ash' / 'cream' / 'electric') sits it on the warm ash ground instead.
 */
export default function Section({
  id,
  eyebrow,
  title,
  intro,
  children,
  tone = 'night',
  className = '',
}: {
  /** Anchor target, e.g. `planners` for /about#planners. */
  id?: string;
  eyebrow?: string;
  title?: React.ReactNode;
  intro?: string;
  children: React.ReactNode;
  tone?: 'night' | 'raised' | 'light' | 'ash' | 'ink' | 'electric' | 'cream';
  className?: string;
}) {
  const raised = tone === 'raised' || tone === 'ash' || tone === 'cream' || tone === 'electric';

  return (
    <section id={id} className={`${raised ? 'bg-ash' : 'bg-paper'} text-ink ${id ? 'scroll-mt-20' : ''} ${className}`}>
      <div className="shell py-20 sm:py-24">
        {(eyebrow || title) && (
          <div className="mb-10 sm:mb-12">
            {eyebrow && <p className="text-[0.875rem] text-muted">{eyebrow}</p>}
            {title && <h2 className="caps mt-3 max-w-4xl text-d1">{title}</h2>}
            {intro && <p className="mt-5 max-w-measure text-[0.9375rem] leading-relaxed text-ink/70">{intro}</p>}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}
