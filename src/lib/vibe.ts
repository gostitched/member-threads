import { useCallback, useSyncExternalStore } from 'react';
import type { CSSProperties } from 'react';
import { persisted } from './persisted';

/**
 * Hero "vibes", shown to people as Colorways 01–05: five palettes the kid can
 * switch between. `VIBES`, `vibeVars`
 * and `getVibe` are server-safe; `useVibe` is a client hook.
 */

export type VibeId = 'club' | 'racing' | 'miami' | 'ballet' | 'varsity';

/** A palette. All values are hex colors. `garment` = body fill, `rib` = cuffs/trim. */
export type Vibe = {
  id: VibeId;
  label: string;
  ground: string;
  ink: string;
  accent: string;
  garment: string;
  rib: string;
};

/** All vibes in display order. Miami is the default. */
export const VIBES: Vibe[] = [
  { id: 'club', label: 'Lily', ground: '#F8F6F1', ink: '#0E1A47', accent: '#C8336E', garment: '#F9A8C9', rib: '#C8336E' },
  { id: 'racing', label: 'Navy', ground: '#F8F6F1', ink: '#0E1A47', accent: '#A9CCF4', garment: '#0E1A47', rib: '#F9A8C9' },
  { id: 'miami', label: 'Sky', ground: '#F8F6F1', ink: '#0E1A47', accent: '#0E1A47', garment: '#A9CCF4', rib: '#0E1A47' },
  { id: 'ballet', label: 'Cream', ground: '#F8F6F1', ink: '#0E1A47', accent: '#C8336E', garment: '#F5EEDC', rib: '#A9CCF4' },
  { id: 'varsity', label: 'Berry', ground: '#F8F6F1', ink: '#0E1A47', accent: '#F8F6F1', garment: '#C8336E', rib: '#A9CCF4' },
];

/** Default vibe id (also the SSR value). */
export const DEFAULT_VIBE: VibeId = 'miami';

const isVibeId = (v: string): v is VibeId => VIBES.some((x) => x.id === v);

/** Look up a vibe by id; falls back to Miami. */
export function getVibe(id: string): Vibe {
  return VIBES.find((v) => v.id === id) ?? VIBES.find((v) => v.id === DEFAULT_VIBE)!;
}

/**
 * CSS custom properties for a vibe: --v-ground --v-ink --v-accent --v-garment
 * --v-rib. Spread on the wrapper, then use e.g. `bg-[var(--v-ground)]`.
 * @example <section style={vibeVars(vibe)} className="bg-[var(--v-ground)] text-[var(--v-ink)] transition-colors duration-[400ms]">
 */
export function vibeVars(v: Vibe): CSSProperties {
  return {
    '--v-ground': v.ground,
    '--v-ink': v.ink,
    '--v-accent': v.accent,
    '--v-garment': v.garment,
    '--v-rib': v.rib,
  } as CSSProperties;
}

const store = persisted('tms:vibe', (raw) => (isVibeId(raw) ? raw : ''));
const serverSnapshot = () => '';

/**
 * Shared, persisted vibe (localStorage 'tms:vibe'), live across components and
 * tabs. SSR/hydration render Miami. Client hook.
 * @example const { vibe, set } = useVibe(); set('racing');
 */
export function useVibe(): { vibe: Vibe; set(id: VibeId): void } {
  const id = useSyncExternalStore(store.subscribe, store.get, serverSnapshot);
  const set = useCallback((next: VibeId) => store.set(next), []);
  return { vibe: getVibe(id || DEFAULT_VIBE), set };
}
