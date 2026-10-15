import type { CSSProperties } from 'react';
import type { WorkItem } from '@/lib/work';

/**
 * A collection's hero band. Server-safe (no 'use client').
 *
 * A light rounded panel in the brand cream. Type on it is always the brand green.
 */
export type BandTheme = { tint: string | null };

export function bandTheme(w: WorkItem): BandTheme {
  return { tint: w.palette?.[0]?.hex ?? null };
}

// The band stays brand cream: an org's own colours live in the garments and the
// palette, never in the page chrome. `tint` is kept for callers that want it.
export const bandStyle = (_t: BandTheme): CSSProperties => ({});
