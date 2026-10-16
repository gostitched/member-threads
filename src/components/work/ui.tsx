import Image from 'next/image';
import { Fragment } from 'react';
import { PHOTOS, type PhotoSlug } from '@/lib/photos';
import { RATIO } from '@/lib/design';

/**
 * Small, server-safe pieces shared by the wall, the dossier and the collection pages.
 */

/** The trailing arrow every primary CTA and arrow link ends on. */
export function Arrow({ className = 'h-3 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 12" className={className} fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M0 6h14.5M9.5 1l5 5-5 5" />
    </svg>
  );
}

export function ArrowBack({ className = 'h-3 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 12" className={className} fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M16 6H1.5M6.5 1l-5 5 5 5" />
    </svg>
  );
}

/** A headline with one *word* in italic, the house emphasis. */
export function Em({ text }: { text: string }) {
  const parts = text.split('*');
  return (
    <>
      {parts.map((p, i) => (i % 2 ? <em key={i}>{p}</em> : <Fragment key={i}>{p}</Fragment>))}
    </>
  );
}

/** Strip the emphasis markers, for metadata and labels. */
export const plain = (text: string) => text.replace(/\*/g, '');

// Frames used here, written out so Tailwind always ships them:
// aspect-[4/5] aspect-[2/3] aspect-square aspect-[3/2] aspect-[21/9] lg:aspect-[21/9]
export type Ratio = keyof typeof RATIO;

/**
 * A mood photograph from the manifest, in one of the approved frames.
 *
 * `treatment="release"` stacks the duotone over the graded photo; the wall's CSS fades
 * the duotone out on hover and focus, so the picture comes into colour. Both layers ask
 * for the same file, so the second costs nothing.
 */
export function MoodPhoto({
  slug,
  ratio,
  sizes,
  treatment = 'grade',
  priority = false,
  wipe = false,
  className = '',
  alt,
  position,
}: {
  slug: PhotoSlug;
  ratio: Ratio;
  sizes: string;
  treatment?: 'grade' | 'duo' | 'release';
  priority?: boolean;
  /** Uncover bottom-up as it enters the viewport. */
  wipe?: boolean;
  className?: string;
  /** Override the manifest alt (pass '' when a surrounding link already names it). */
  alt?: string;
  /** Override the manifest focal point. */
  position?: string;
}) {
  const p = PHOTOS[slug];
  const img = (cls = '', hidden = false) => (
    <Image
      src={p.src}
      width={p.width}
      height={p.height}
      alt={hidden ? '' : alt ?? p.alt}
      aria-hidden={hidden || undefined}
      sizes={sizes}
      priority={priority}
      className={cls}
      style={{ objectPosition: position ?? p.objectPosition }}
    />
  );
  if (treatment === 'release') {
    return (
      <div className={`relative overflow-hidden ${RATIO[ratio]} ${wipe ? 'wipe-in' : ''} ${className}`}>
        <div className="photo grade grain absolute inset-0">{img('wk-img')}</div>
        <div className="wk-duo photo duo absolute inset-0" aria-hidden>{img('wk-img', true)}</div>
      </div>
    );
  }
  return (
    <div className={`photo ${treatment} grain ${RATIO[ratio]} ${wipe ? 'wipe-in' : ''} ${className}`}>{img('wk-img')}</div>
  );
}
