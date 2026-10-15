'use client';

import './rack/rack.css';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import IndexView from './IndexView';
import Spectrum from './Spectrum';
import { createRack, type Rack, type RunMode, type Slot } from './rack/engine';
import type { CatalogProduct } from '@/lib/catalog/types';
import type { ExplorerState, ViewKey } from '@/lib/catalog/explorer-state';
import { COLOR_FAMILIES, countBy, productFamilies, spectrum, type ColorFamily } from '@/lib/catalog/util';

function toQuery(s: ExplorerState): string {
  const p = new URLSearchParams();
  if (s.category) p.set('category', s.category);
  if (s.family) p.set('color', s.family);
  if (s.q) p.set('q', s.q);
  if (s.view !== 'rack') p.set('view', s.view);
  const q = p.toString();
  return q ? `?${q}` : '';
}

function haystack(p: CatalogProduct): string {
  return [
    p.name,
    p.category,
    p.styleNumber,
    p.fabric,
    p.fit,
    p.description,
    ...p.tags,
    ...p.decorationMethods,
    ...p.colorways.map((c) => c.name),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

/**
 * The rack's order when nothing narrows it: the featured styles up front, one of each,
 * then the rest section by section, each behind a plate with its name.
 */
function buildSlots(results: CatalogProduct[], narrowed: boolean, categories: Array<[string, number]>): Slot[] {
  // The tag for ordering something the rack doesn't carry. The rack hangs it on its first run.
  if (!results.length) return [];
  return [...hang(results, narrowed, categories), { cta: true }];
}
function hang(results: CatalogProduct[], narrowed: boolean, categories: Array<[string, number]>): Slot[] {
  if (narrowed) return results.map((p) => ({ p }));
  const slots: Slot[] = results.filter((p) => p.isFeatured).map((p) => ({ p }));
  const section = (id: string, name: string, count: number, ps: CatalogProduct[]) => {
    if (!ps.length) return;
    slots.push({ div: { id, name, count } });
    for (const p of ps) slots.push({ p });
  };
  for (const [name, count] of categories)
    section(name, name, count, results.filter((p) => p.category === name && !p.isFeatured));
  const loose = results.filter((p) => !p.category);
  section('other', 'Other', loose.length, loose.filter((p) => !p.isFeatured));
  return slots;
}

/** The NOW SHOWING board: each cell rolls through a few glyphs before it lands. */
const FLAP_LEN = 16;
const FLAP_CHARS = 'ABCDEFGHIJKLMNOPRSTUVWXYZ0123456789/';
function FlapBoard({ text }: { text: string }) {
  const target = text.toUpperCase().padEnd(FLAP_LEN, ' ').slice(0, FLAP_LEN);
  const [cells, setCells] = useState(() => [...target].map((c) => ({ c, spin: false })));
  const shown = useRef(cells);
  shown.current = cells;

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const timers: number[] = [];
    const put = (i: number, c: string, spin: boolean) =>
      setCells((cs) => cs.map((x, j) => (j === i ? { c, spin } : x)));
    [...target].forEach((ch, i) => {
      if (shown.current[i]?.c === ch && !shown.current[i]?.spin) return;
      if (reduce) return put(i, ch, false);
      let n = 2 + (i % 3);
      const step = () => {
        if (n-- <= 0) return put(i, ch, false);
        put(i, FLAP_CHARS[(Math.random() * FLAP_CHARS.length) | 0], true);
        timers.push(window.setTimeout(step, 30));
      };
      timers.push(window.setTimeout(step, i * 18));
    });
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [target]);

  return (
    <span className="rk-flap">
      {cells.map((x, i) => (
        <span key={i} className={`rk-fc${x.spin ? ' is-spin' : ''}`}>
          {x.c === ' ' ? ' ' : x.c}
        </span>
      ))}
    </span>
  );
}

/**
 * The catalog: every style hung on one rack, and the same pieces as a spec sheet.
 *
 * Categories, colour and search narrow what hangs; changing them runs the conveyor
 * (see rack/engine.ts). The filters live in the URL so a rack can be shared.
 */
/** Smooth scrolling, unless the visitor asked for less motion. */
const smooth = (): ScrollBehavior =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';

export default function CatalogExplorer({
  products,
  initial,
}: {
  products: CatalogProduct[];
  initial: ExplorerState;
}) {
  const router = useRouter();
  const [state, setState] = useState<ExplorerState>(initial);
  const [searchDraft, setSearchDraft] = useState(initial.q);
  const [mounted, setMounted] = useState(false);
  const [soundOn, setSoundOn] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const bandRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const rowsRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const plateRef = useRef<HTMLDivElement>(null);
  const rackRef = useRef<Rack | null>(null);
  const routerRef = useRef(router);
  routerRef.current = router;
  // How the next change should run: set by whatever makes the change.
  const nextRun = useRef<RunMode>('search');
  const woke = useRef(false);
  const introduced = useRef(false);
  const shownView = useRef<ViewKey | null>(null);

  const set = (patch: Partial<ExplorerState>, run: RunMode = 'search') => {
    nextRun.current = run;
    setState((s) => ({ ...s, ...patch }));
  };

  // Keep the URL shareable without adding a history entry per change.
  useEffect(() => {
    const next = `${window.location.pathname}${toQuery(state)}`;
    if (next !== `${window.location.pathname}${window.location.search}`) window.history.replaceState(window.history.state, '', next);
  }, [state]);

  // Debounce typing into the filter.
  useEffect(() => {
    const t = window.setTimeout(() => {
      const q = searchDraft.trim();
      setState((s) => {
        if (s.q === q) return s;
        nextRun.current = 'search';
        return { ...s, q };
      });
    }, 260);
    return () => window.clearTimeout(t);
  }, [searchDraft]);

  // "/" jumps to search, the way most catalogs and docs sites do.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (e.key !== '/' || target?.closest('input, textarea, select, [contenteditable]')) return;
      e.preventDefault();
      searchRef.current?.focus();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const indexed = useMemo(() => products.map((p) => ({ p, text: haystack(p), families: productFamilies(p) })), [products]);
  const swatches = useMemo(() => spectrum(products), [products]);
  const familyCounts = useMemo(() => countBy(products, (p) => productFamilies(p)), [products]);
  const categories = useMemo(
    // In catalog order (Map keeps first appearance), so Fleece leads, not Bags.
    () => [...countBy(products, (p) => (p.category ? [p.category] : [])).entries()],
    [products]
  );

  const results = useMemo(() => {
    const terms = state.q.toLowerCase().split(/\s+/).filter(Boolean);
    return indexed
      .filter(({ p, text, families }) => {
        if (state.category && p.category !== state.category) return false;
        if (state.family && !families.has(state.family)) return false;
        return terms.every((t) => text.includes(t));
      })
      .map(({ p }) => p)
      // The dashboard already orders featured first; keep its order, but make sure.
      .sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured));
  }, [indexed, state.category, state.family, state.q]);

  const narrowed = Boolean(state.category || state.family || state.q);
  const slots = useMemo(() => buildSlots(results, narrowed, categories), [results, narrowed, categories]);
  // What streams past between one rack and the next: stock from elsewhere in the catalog.
  const pool = useMemo(
    () => (state.category ? products.filter((p) => p.category !== state.category) : products),
    [products, state.category]
  );

  useEffect(() => {
    const rack = createRack(
      { section: sectionRef.current!, rows: rowsRef.current!, head: headRef.current!, bar: barRef.current!, plate: plateRef.current! },
      {
        onHover: (href) => routerRef.current.prefetch(href),
        onOpen: (href) => routerRef.current.push(href),
      }
    );
    rackRef.current = rack;
    introduced.current = false;
    shownView.current = null;
    setMounted(true);
    return () => {
      rack.destroy();
      rackRef.current = null;
    };
  }, []);

  useEffect(() => {
    const rack = rackRef.current;
    if (!rack) return;
    if (state.view !== 'rack') {
      shownView.current = state.view;
      return;
    }
    if (rack.slots === slots && shownView.current === 'rack') return;
    const run: RunMode = !introduced.current ? 'intro' : shownView.current !== 'rack' ? 'none' : nextRun.current;
    introduced.current = true;
    shownView.current = 'rack';
    nextRun.current = 'search';
    rack.show(slots, pool, run);
  }, [slots, pool, state.view, mounted]);

  function pickCategory(category: string | null) {
    if (category === state.category) return;
    const run: RunMode = woke.current ? 'category' : 'wake';
    woke.current = true;
    set({ category }, state.view === 'rack' ? run : 'none');
  }

  function pickFamily(family: ColorFamily | null) {
    set({ family });
    // Bring the rack into view when the pick came from the band above it.
    const top = bandRef.current?.getBoundingClientRect().top ?? 0;
    if (family && top > window.innerHeight * 0.6) bandRef.current?.scrollIntoView({ behavior: smooth(), block: 'start' });
  }

  function clearAll() {
    setSearchDraft('');
    set({ category: null, family: null, q: '' }, 'category');
  }

  const familyLabel = state.family ? COLOR_FAMILIES.find((f) => f.id === state.family)?.label ?? state.family : null;
  const board = `${state.q ? 'Search' : familyLabel ?? state.category ?? 'All'} ${results.length}`;
  const count = (
    <>
      <b>{results.length}</b> {results.length === 1 ? 'style' : 'styles'}
      {state.family && (
        <button type="button" onClick={() => set({ family: null })} className="ml-3 text-uv hover:underline" aria-label={`Remove filter ${familyLabel}`}>
          {familyLabel} ×
        </button>
      )}
    </>
  );

  return (
    <div>
      {/* ── Colour ─────────────────────────────────────────────────────────── */}
      {/* Only when there is colour to explore: a heading over an empty band is noise. */}
      {swatches.length > 0 && (
        <section className="pb-8 text-ink sm:pb-10">
          <div className="shell mb-5 flex items-baseline justify-between gap-6">
            <h2 className="label text-ink">Shop by color</h2>
            <p className="label hidden text-muted sm:block">{swatches.length} colorways</p>
          </div>
          <Spectrum swatches={swatches} familyCounts={familyCounts} active={state.family} onPick={pickFamily} />
        </section>
      )}

      {/* ── Toolbar ────────────────────────────────────────────────────────── */}
      <div ref={bandRef} className="scroll-mt-[72px] sm:scroll-mt-[84px] lg:scroll-mt-[108px]" />
      <div ref={barRef} className="sticky top-[72px] z-30 border-b border-rule bg-paper/90 backdrop-blur-xl sm:top-[84px] lg:top-[108px]">
        <div className="shell flex flex-wrap items-center gap-x-7 gap-y-1 py-2.5">
          <div
            className="-mx-5 flex min-w-0 flex-auto gap-2 overflow-x-auto py-1 px-5 [mask-image:linear-gradient(to_right,#000_calc(100%-44px),transparent)] [scrollbar-width:none] sm:mx-0 sm:px-0 lg:[mask-image:none]"
            role="group"
            aria-label="Category"
          >
            {['All', ...categories.map(([name]) => name)].map((name) => {
              const on = name === 'All' ? state.category === null : state.category === name;
              return (
                <button
                  key={name}
                  type="button"
                  aria-pressed={on}
                  onClick={(e) => {
                    e.currentTarget.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: smooth() });
                    pickCategory(name === 'All' ? null : name);
                  }}
                  className="rk-cat"
                >
                  {name}
                </button>
              );
            })}
          </div>

          <div className="flex w-full items-center justify-between gap-6 lg:w-auto lg:justify-end">
            <label className="flex min-w-0 flex-1 items-center gap-2 rounded-full bg-ink/5 px-4 py-1.5 text-ink focus-within:ring-2 focus-within:ring-blue lg:flex-none">
              <svg width="13" height="13" viewBox="0 0 13 13" aria-hidden className="shrink-0">
                <circle cx="5.5" cy="5.5" r="4.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
                <path d="M9 9l3.2 3.2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
              <span className="sr-only">Search styles</span>
              <input
                ref={searchRef}
                type="search"
                value={searchDraft}
                onChange={(e) => setSearchDraft(e.target.value)}
                autoComplete="off"
                spellCheck={false}
                placeholder="Search styles"
                className="w-full min-w-0 bg-transparent py-1 text-[0.875rem] outline-none placeholder:text-ink/40 lg:w-40 [&::-webkit-search-cancel-button]:appearance-none"
              />
            </label>

            <div className="flex items-center gap-1.5 text-[0.875rem] font-semibold text-muted" role="group" aria-label="View">
              {(['rack', 'index'] as const).map((v, i) => (
                <span key={v} className="flex items-center gap-1.5">
                  {i > 0 && <span aria-hidden>/</span>}
                  <button
                    type="button"
                    aria-pressed={state.view === v}
                    onClick={() => set({ view: v }, 'none')}
                    className={`py-2.5 capitalize ${state.view === v ? 'text-ink' : 'hover:text-ink'}`}
                  >
                    {v === 'rack' ? 'Rack' : 'List'}
                  </button>
                </span>
              ))}
            </div>

            {state.view === 'rack' && (
              <button
                type="button"
                aria-pressed={soundOn}
                onClick={() => setSoundOn(rackRef.current?.toggleSound() ?? false)}
                className={`whitespace-nowrap py-2.5 text-[0.875rem] font-semibold ${soundOn ? 'text-uv' : 'text-muted hover:text-ink'}`}
              >
                Sound {soundOn ? 'on' : 'off'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── The rack ───────────────────────────────────────────────────────── */}
      <section ref={sectionRef} className="rk" hidden={state.view !== 'rack'} aria-label="Styles on the rack">
        <div ref={headRef} className="rk-head">
          <p className="rk-count" aria-live="polite">
            {count}
          </p>
          <div ref={plateRef} className="rk-plate" aria-hidden>
            <span className="rk-led" />
            <FlapBoard text={board} />
          </div>
        </div>
        <div ref={rowsRef} className="rk-rows" />
        {/* Before the rack is hung (and for anything that reads rather than looks), a plain list. */}
        {!mounted && (
          <ul className="sr-only">
            {results.map((p) => (
              <li key={p.slug}>
                <a href={`/catalog/${encodeURIComponent(p.slug)}`}>{p.name}</a>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ── The same, as a spec sheet ─────────────────────────────────────── */}
      {state.view === 'index' && (
        <section className="shell py-10 sm:py-14">
          <p className="rk-count mb-6" aria-live="polite">
            {count}
          </p>
          {results.length === 0 ? (
            <div className="flex flex-col items-start gap-5 border-y border-rule py-14 sm:py-20">
              <p className="caps text-d2">No styles match.</p>
              <p className="max-w-measure text-lead text-muted">Try another search, or tell us what you need and we&rsquo;ll source it.</p>
              <div className="flex flex-wrap gap-3">
                <button type="button" onClick={clearAll} className="btn-outline">
                  Clear filters
                </button>
                <a href="/quote" className="btn-blue">
                  Start a collection
                </a>
              </div>
            </div>
          ) : (
            <IndexView products={results} />
          )}
        </section>
      )}
    </div>
  );
}
