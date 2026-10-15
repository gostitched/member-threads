import { useCallback, useSyncExternalStore } from 'react';
import type { CSSProperties } from 'react';
import { persisted } from './persisted';

/**
 * Hero "vibes", shown to people as Colorways 01–05: five palettes an
 * organization can switch between, all drawn from the brand board. `VIBES`, `vibeVars`
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

/** All vibes in display order. Forest (id 'miami'; ids are frozen) is the default. */
export const VIBES: Vibe[] = [
  { id: 'club', label: 'Cream', ground: '#F7F3EC', ink: '#133327', accent: '#133327', garment: '#EEE6D9', rib: '#133327' },
  { id: 'racing', label: 'Navy', ground: '#F7F3EC', ink: '#133327', accent: '#C4B19A', garment: '#223041', rib: '#C4B19A' },
  { id: 'miami', label: 'Forest', ground: '#F7F3EC', ink: '#133327', accent: '#C4B19A', garment: '#133327', rib: '#EEE6D9' },
  { id: 'ballet', label: 'Sand', ground: '#F7F3EC', ink: '#133327', accent: '#133327', garment: '#C4B19A', rib: '#223041' },
  { id: 'varsity', label: 'Heather', ground: '#F7F3EC', ink: '#133327', accent: '#223041', garment: '#A8A9A4', rib: '#133327' },
];

/** Default vibe id (also the SSR value). */
export const DEFAULT_VIBE: VibeId = 'miami';

const isVibeId = (v: string): v is VibeId => VIBES.some((x) => x.id === v);

/** Look up a vibe by id; falls back to Forest. */
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

const store = persisted('mt:vibe', (raw) => (isVibeId(raw) ? raw : ''));
const serverSnapshot = () => '';

/**
 * Shared, persisted vibe (localStorage 'mt:vibe'), live across components and
 * tabs. SSR/hydration render Forest. Client hook.
 * @example const { vibe, set } = useVibe(); set('racing');
 */
export function useVibe(): { vibe: Vibe; set(id: VibeId): void } {
  const id = useSyncExternalStore(store.subscribe, store.get, serverSnapshot);
  const set = useCallback((next: VibeId) => store.set(next), []);
  return { vibe: getVibe(id || DEFAULT_VIBE), set };
}
