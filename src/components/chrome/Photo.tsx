import Image from 'next/image';
import { PHOTOS, type PhotoSlug } from '@/lib/photos';
import { RATIO, TREATMENT_CLASS, type PhotoTreatment } from '@/lib/design';

/**
 * A manifest photo in an approved frame: ratio + treatment + grain, the
 * focal point as object-position, real `sizes`. Mood images only: never
 * caption them as customers, our studio or the founder.
 */
export default function Photo({
  slug,
  ratio = 'portrait',
  treatment = 'grade',
  sizes,
  motion,
  priority = false,
  className = '',
}: {
  slug: PhotoSlug;
  ratio?: keyof typeof RATIO;
  treatment?: PhotoTreatment;
  sizes: string;
  motion?: 'wipe-in' | 'drift-in';
  priority?: boolean;
  className?: string;
}) {
  const p = PHOTOS[slug];
  return (
    <div className={`${TREATMENT_CLASS[treatment]} ${RATIO[ratio]} ${motion ?? ''} ${className}`}>
      <Image
        src={p.src}
        alt={p.alt}
        width={p.width}
        height={p.height}
        sizes={sizes}
        priority={priority}
        style={{ objectPosition: p.objectPosition }}
      />
    </div>
  );
}
