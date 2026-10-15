'use client';

import Image, { getImageProps } from 'next/image';
import { preload } from 'react-dom';
import WorkArt from './art';
import type { WorkAsset } from '@/lib/work';

/**
 * One Work asset at the size of its box: the photograph when there is one, the drawn
 * stand-in otherwise. Garments are shown whole; photos and details are cropped to the
 * box around their focal point. Never stretched.
 *
 * `sizes` is the rendered width as a CSS length, so the browser picks a right-sized
 * AVIF/WebP from next/image's set rather than the original.
 */
export default function Media({
  asset,
  sizes,
  eager = false,
  labelled = true,
  className = '',
}: {
  asset: WorkAsset;
  sizes: string;
  eager?: boolean;
  /** False when a surrounding control already names the project. */
  labelled?: boolean;
  className?: string;
}) {
  const whole = asset.kind === 'garment' || asset.kind === 'artifact';

  if (asset.src) {
    return (
      <Image
        src={asset.src}
        alt={labelled ? asset.alt : ''}
        fill
        sizes={sizes}
        priority={eager}
        loading={eager ? undefined : 'lazy'}
        className={className}
        style={{ objectFit: whole ? 'contain' : 'cover', objectPosition: asset.focal ?? '50% 50%' }}
      />
    );
  }
  if (!asset.art) return null;
  return <WorkArt art={asset.art} label={labelled ? asset.alt : undefined} className={`absolute inset-0 h-full w-full ${className}`} />;
}

/**
 * Start fetching the file `<Media asset sizes>` will ask for, without rendering it:
 * the same srcset and sizes, so the browser picks the same candidate and the later
 * render is a cache hit. Drawn stand-ins cost nothing and are skipped.
 */
export function preloadAsset(asset: WorkAsset, sizes: string) {
  if (!asset.src) return;
  const { props } = getImageProps({ src: asset.src, alt: '', fill: true, sizes });
  preload(props.src, { as: 'image', imageSrcSet: props.srcSet, imageSizes: props.sizes, fetchPriority: 'low' });
}
