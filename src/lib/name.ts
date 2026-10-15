import { useCallback, useSyncExternalStore } from 'react';
import { persisted } from './persisted';

/**
 * The organization's name, typed once on the home page and echoed everywhere.
 * Pure helpers are safe on the server; `useOrgName` is a client hook (call it
 * from a 'use client' component). No 'use client' directive here on purpose,
 * so server components can import DEFAULT_NAME / cleanName / possessive.
 */

/** Placeholder name shown until someone types one (also the SSR value). */
export const DEFAULT_NAME = 'Harbor Run Club';
/** What the garment shows when nobody has typed a name: a prompt, not a stand-in org. */
export const YOUR_NAME = 'Your Club';
/** Max characters for a name (use as the input's maxLength). */
export const NAME_MAX = 28;

/**
 * Light sanitizing while typing: keeps letters, digits, spaces, ' - & and ., drops leading
 * space, collapses runs, uppercases each word's first letter, caps at NAME_MAX.
 * Keeps a single trailing space so "Harbor " can become "Harbor Run Club".
 */
function sanitizeTyping(raw: string): string {
  return raw
    .replace(/[‘’`]/g, "'")
    .replace(/[^\p{L}\p{N}'&. -]/gu, '')
    .replace(/\s+/g, ' ')
    .replace(/^[ '&.-]+/, '')
    .replace(/(^|[ -])(\p{Ll})/gu, (_m, sep: string, c: string) => sep + c.toUpperCase())
    .slice(0, NAME_MAX);
}

/**
 * Display-ready name: letters, digits, space, ' - & and . only; Title Case (first
 * letter of each word/hyphen part uppercased, rest kept as typed); trimmed; ≤28 chars.
 * Returns '' when nothing usable is left.
 * @example cleanName('  delta 5k club!') // 'Delta 5k Club'
 */
export function cleanName(raw: string): string {
  return sanitizeTyping(raw).trim().replace(/[ '&-]+$/, '');
}

/**
 * English possessive. @example possessive('Harbor Run Club') // "Harbor Run Club's"; possessive('Alumni Associations') // "Alumni Associations'"
 */
export function possessive(n: string): string {
  const s = n.trim();
  if (!s) return s;
  return /s$/i.test(s) ? `${s}'` : `${s}'s`;
}

const store = persisted('mt:name', sanitizeTyping);
const serverSnapshot = () => '';

/**
 * Shared, persisted organization name (localStorage 'mt:name'). Every component using
 * it updates live, across components and tabs. SSR/hydration render DEFAULT_NAME.
 * - `name`: display name (cleaned), or DEFAULT_NAME when unset.
 * - `isDefault`: true when nobody has typed a name (render "YOUR" etc.).
 * - `raw`: the in-progress value; bind inputs to it: `value={raw}` (it keeps a
 *   trailing space while typing; `name` does not).
 * - `set(n)`: sanitizes and stores. `clear()`: back to default.
 * @example const { name, raw, set } = useOrgName(); <input value={raw} onChange={e => set(e.target.value)} maxLength={NAME_MAX} placeholder={DEFAULT_NAME} />
 */
export function useOrgName(): {
  name: string;
  raw: string;
  set(n: string): void;
  clear(): void;
  isDefault: boolean;
} {
  const raw = useSyncExternalStore(store.subscribe, store.get, serverSnapshot);
  const cleaned = cleanName(raw);
  const set = useCallback((n: string) => store.set(n), []);
  const clear = useCallback(() => store.clear(), []);
  return { name: cleaned || DEFAULT_NAME, raw, set, clear, isDefault: !cleaned };
}
