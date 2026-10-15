/**
 * The catalog explorer's filter state, and how it reads from and writes to the URL.
 * Shared by the server page (initial render) and the client explorer.
 */

import { COLOR_FAMILIES, type ColorFamily } from './util';

export type ViewKey = 'rack' | 'index';

export interface ExplorerState {
  category: string | null;
  family: ColorFamily | null;
  q: string;
  view: ViewKey;
}

const FAMILY_IDS = new Set<string>(COLOR_FAMILIES.map((f) => f.id));

/** Parse the URL's filter params. Unknown values are dropped rather than trusted. */
export function parseExplorerState(params: Record<string, string | string[] | undefined>): ExplorerState {
  const one = (k: string) => {
    const v = params[k];
    return (Array.isArray(v) ? v[0] : v)?.trim() || null;
  };
  const family = one('color');
  return {
    category: one('category'),
    family: family && FAMILY_IDS.has(family) ? (family as ColorFamily) : null,
    q: one('q')?.slice(0, 80) ?? '',
    view: one('view') === 'index' ? 'index' : 'rack',
  };
}
