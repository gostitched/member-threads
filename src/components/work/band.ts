import type { CSSProperties } from 'react';
import type { WorkItem } from '@/lib/work';

/**
 * A collection's hero band. Server-safe (no 'use client').
 *
 * A light rounded panel: the collection's first palette colour, washed into paper.
 * Type on it is always navy.
 */
export type BandTheme = { tint: string | null };

export function bandTheme(w: WorkItem): BandTheme {
  return { tint: w.palette?.[0]?.hex ?? null };
}

export const bandStyle = (t: BandTheme): CSSProperties =>
  t.tint ? { background: `color-mix(in srgb, ${t.tint} 22%, #F8F6F1)` } : {};
