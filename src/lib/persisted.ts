/**
 * Tiny localStorage-backed store shared by `useOrgName` and `useVibe`.
 *
 * - Reads/writes are wrapped in try/catch (private mode, blocked storage); an
 *   in-memory copy keeps the value working for the session regardless.
 * - Same-tab fan-out via a `CustomEvent(key)` on window; other tabs via the
 *   native `storage` event.
 * - Designed for `useSyncExternalStore`: `get` is cached and stable.
 */
export type PersistedStore = {
  subscribe(cb: () => void): () => void;
  get(): string;
  set(v: string): void;
  clear(): void;
};

export function persisted(key: string, sanitize: (raw: string) => string): PersistedStore {
  let cache: string | null = null;

  const read = (): string => {
    try {
      const v = window.localStorage.getItem(key);
      return v == null ? '' : sanitize(v);
    } catch {
      return '';
    }
  };

  const emit = () => {
    try {
      window.dispatchEvent(new CustomEvent(key));
    } catch {
      /* noop */
    }
  };

  return {
    subscribe(cb) {
      const onLocal = () => cb();
      const onStorage = (e: StorageEvent) => {
        if (e.key !== null && e.key !== key) return;
        cache = read();
        cb();
      };
      window.addEventListener(key, onLocal);
      window.addEventListener('storage', onStorage);
      return () => {
        window.removeEventListener(key, onLocal);
        window.removeEventListener('storage', onStorage);
      };
    },
    get() {
      if (cache === null) cache = read();
      return cache;
    },
    set(v) {
      const next = sanitize(v);
      if (next === cache) return;
      cache = next;
      try {
        if (next) window.localStorage.setItem(key, next);
        else window.localStorage.removeItem(key);
      } catch {
        /* storage unavailable: in-memory value still fans out */
      }
      emit();
    },
    clear() {
      cache = '';
      try {
        window.localStorage.removeItem(key);
      } catch {
        /* noop */
      }
      emit();
    },
  };
}
