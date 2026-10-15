'use client';

import { useEffect, useRef, useState } from 'react';
import StitchField from './StitchField';

/**
 * Full-bleed video backdrop with a graceful stand-in.
 *
 * Until a licensed clip is dropped in (see MEDIA in `@/lib/site`), this renders
 * the stitch field instead, so the section is designed and shipped rather than
 * blocked on footage. The moment a source exists it plays behind the content.
 *
 * Autoplay only works muted and inline, and it is suppressed entirely under
 * prefers-reduced-motion — a looping factory clip is exactly the kind of
 * background movement that setting exists to stop. The poster still shows.
 */
export default function MediaBackdrop({
  src,
  poster,
  className = '',
}: {
  src?: string;
  poster?: string;
  className?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [allowMotion, setAllowMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => setAllowMotion(!mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (allowMotion) {
      // A rejected autoplay promise is normal (power saving, data saver); the
      // poster carries the section on its own, so there is nothing to recover.
      v.play().catch(() => {});
    } else {
      v.pause();
    }
  }, [allowMotion, src]);

  if (!src) {
    return <StitchField fill tone="ink" className={className} />;
  }

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      <video
        ref={ref}
        muted
        loop
        playsInline
        preload="metadata"
        poster={poster}
        aria-hidden
        tabIndex={-1}
        className="h-full w-full object-cover"
      >
        <source src={src} />
      </video>
    </div>
  );
}
