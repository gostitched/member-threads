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
  // The way out for anything not on the rack is the panel under it (one hang tag a page).
  if (!results.length) return [];
  return hang(results, narrowed, categories);
}
function hang(results: CatalogProduct[], narrowed: boolean, categories: Array<[string, number]>): Slot[] {
  if (narrowed) return results.map((p) => ({ p }));
  const featured = results.filter((p) => p.isFeatured);
  const slots: Slot[] = featured.map((p, i) => (i === 0 ? { p, sec: { name: 'Featured', count: featured.length, no: 0 } } : { p }));
  let no = 0;
  // Each section opens with a spec-line marker over its first piece, not a sign of its own.
  const section = (name: string, count: number, ps: CatalogProduct[]) => {
    if (!ps.length) return;
    no += 1;
    ps.forEach((p, i) => slots.push(i === 0 ? { p, sec: { name, count, no } } : { p }));
  };
  for (const [name, count] of categories)
    section(name, count, results.filter((p) => p.category === name && !p.isFeatured));
  const loose = results.filter((p) => !p.category);
  section('Other', loose.length, loose.filter((p) => !p.isFeatured));
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
  const mobileSearchRef = useRef<HTMLInputElement>(null);
  const [searchOpen, setSearchOpen] = useState(Boolean(initial.q));
  const [tucked, setTucked] = useState(false);
  const clearRef = useRef<() => void>(() => {});
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
  // Search reaches past the category: how many styles match the words alone.
  const wider = useMemo(() => {
    const terms = state.q.toLowerCase().split(/\s+/).filter(Boolean);
    if (!terms.length || !(state.category || state.family)) return 0;
    return indexed.filter(({ text }) => terms.every((t) => text.includes(t))).length;
  }, [indexed, state.q, state.category, state.family]);
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
        onClear: () => clearRef.current(),
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
    setSearchOpen(false);
    set({ category: null, family: null, q: '' }, 'category');
  }
  clearRef.current = clearAll;

  // The mobile search field takes focus as it opens.
  useEffect(() => {
    if (searchOpen) mobileSearchRef.current?.focus({ preventScroll: true });
  }, [searchOpen]);

  // Mobile: the bar tucks away while scrolling down the rack, and returns on the way up.
  useEffect(() => {
    let last = window.scrollY;
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const y = window.scrollY;
        const mobile = window.innerWidth < 640;
        const band = bandRef.current;
        const head = document.querySelector<HTMLElement>('body header')?.getBoundingClientRect().height ?? 72;
        // The bar is stuck once the marker just above it has scrolled under the header.
        const stuck = band ? band.getBoundingClientRect().top <= head + 1 : false;
        if (!mobile || Math.abs(y - last) < 6) return;
        setTucked(y > last && stuck && !searchOpen);
        last = y;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, [searchOpen]);


  // The toolbar sticks under the site header, whatever height the header is at this
  // breakpoint: measure it rather than hard-code it.
  const [headH, setHeadH] = useState<number | null>(null);
  useEffect(() => {
    const header = document.querySelector<HTMLElement>('body header');
    if (!header) return;
    const measure = () => setHeadH(Math.round(header.getBoundingClientRect().height));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(header);
    return () => ro.disconnect();
  }, []);
  const headVar = (headH !== null ? { ['--ct-head' as string]: `${headH}px` } : {}) as React.CSSProperties;

  const familyLabel = state.family ? COLOR_FAMILIES.find((f) => f.id === state.family)?.label ?? state.family : null;
  const board = `${state.q ? 'Search' : familyLabel ?? state.category ?? 'All'} ${results.length}`;
  const count = (
    <>
      <span className="num">{String(results.length).padStart(2, '0')}</span> {results.length === 1 ? 'style' : 'styles'}
      {state.family && (
        <button
          type="button"
          onClick={() => set({ family: null })}
          className="ml-3 inline-flex min-h-[44px] items-center gap-1.5 text-ink"
          aria-label={`Remove filter ${familyLabel}`}
        >
          <span className="link-u">{familyLabel}</span>
          <span aria-hidden>×</span>
        </button>
      )}
      {wider > results.length && (
        <button
          type="button"
          onClick={() => set({ category: null, family: null }, 'category')}
          className="link-arrow ml-3 text-ink"
        >
          <span className="link-u">
            {wider} {wider === 1 ? 'match' : 'matches'} in all styles
          </span>
          <span aria-hidden>→</span>
        </button>
      )}
    </>
  );

  const searchIcon = (
    <svg width="15" height="15" viewBox="0 0 13 13" aria-hidden className="shrink-0">
      <circle cx="5.5" cy="5.5" r="4.5" fill="none" stroke="currentColor" strokeWidth="1.3" />
      <path d="M9 9l3.2 3.2" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
  const chips = [['All', products.length] as [string, number], ...categories].map(([name, n]) => {
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
        className="chip shrink-0 whitespace-nowrap px-3.5"
      >
        {name}
        <span className="ct-chip-n">{String(n).padStart(2, '0')}</span>
      </button>
    );
  });
  const viewToggle = (
    <div className="flex items-center gap-1" role="group" aria-label="View">
      {(['rack', 'index'] as const).map((v, i) => (
        <span key={v} className="flex items-center gap-1">
          {i > 0 && (
            <span aria-hidden className="text-rule">
              /
            </span>
          )}
          <button type="button" aria-pressed={state.view === v} onClick={() => set({ view: v }, 'none')} className="ct-toggle">
            <span>{v === 'rack' ? 'Rack' : 'List'}</span>
          </button>
        </span>
      ))}
    </div>
  );
  const soundToggle =
    state.view === 'rack' ? (
      <button
        type="button"
        aria-pressed={soundOn}
        onClick={() => setSoundOn(rackRef.current?.toggleSound() ?? false)}
        className="ct-toggle gap-2 whitespace-nowrap"
      >
        <svg width="16" height="14" viewBox="0 0 16 14" aria-hidden fill="none">
          <path d="M1 5h3l4-3.5v11L4 9H1z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
          {soundOn ? (
            <path d="M11 4.5c1 1.4 1 3.6 0 5M13.2 2.5c2 2.6 2 6.4 0 9" stroke="currentColor" strokeWidth="1.3" />
          ) : (
            <path d="M11 5l4 4M15 5l-4 4" stroke="currentColor" strokeWidth="1.3" />
          )}
        </svg>
        <span className="sr-only sm:not-sr-only xl:sr-only 2xl:not-sr-only">Sound {soundOn ? 'on' : 'off'}</span>
      </button>
    ) : null;

  return (
    <div style={headVar}>
      {/* ── Colour ─────────────────────────────────────────────────────────── */}
      {/* Only when there is colour to explore: a heading over an empty band is noise. */}
      {swatches.length > 0 && (
        <section className="pb-10 sm:pb-14" aria-labelledby="ct-color">
          <div className="shell mb-5 flex items-baseline justify-between gap-6">
            <h2 id="ct-color" className="t-eyebrow">
              Shop by color
            </h2>
            <p className="t-spec fg-muted">{swatches.length} colorways</p>
          </div>
          <Spectrum swatches={swatches} familyCounts={familyCounts} active={state.family} onPick={pickFamily} />
        </section>
      )}

      {/* ── Toolbar ────────────────────────────────────────────────────────── */}
      {/* Mobile: the view controls sit above the bar, so the bar itself is one row. */}
      <div className="shell flex items-center justify-end gap-4 pb-1 sm:hidden">
        {viewToggle}
        {soundToggle}
      </div>
      <div ref={bandRef} style={{ scrollMarginTop: headH ?? 72 }} />
      <div
        ref={barRef}
        className="ct-bar sticky z-30 border-y border-[var(--rule-c)] bg-paper transition-transform duration-[420ms] ease-out motion-reduce:transition-none"
        style={tucked ? { transform: `translateY(calc(-100% - ${headH ?? 72}px))` } : undefined}
      >
        {/* Mobile: chips and a search icon that opens into a field. */}
        <div className="shell flex h-[52px] items-center gap-2 sm:hidden">
          {searchOpen ? (
            <>
              <label className="ct-search min-w-0 flex-1 text-ink">
                {searchIcon}
                <span className="sr-only">Search styles</span>
                <input
                  ref={mobileSearchRef}
                  type="search"
                  value={searchDraft}
                  onChange={(e) => setSearchDraft(e.target.value)}
                  autoComplete="off"
                  spellCheck={false}
                  placeholder="Search all styles"
                />
              </label>
              <button
                type="button"
                onClick={() => {
                  setSearchDraft('');
                  setSearchOpen(false);
                }}
                className="ct-toggle min-w-[44px] justify-center"
                aria-label="Close search"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
                  <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.4" />
                </svg>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                aria-expanded={false}
                aria-label="Search styles"
                className="ct-toggle -ml-2 min-w-[44px] shrink-0 justify-center text-ink"
              >
                {searchIcon}
              </button>
              <div
                className="-mr-5 flex min-w-0 flex-1 gap-1.5 overflow-x-auto py-1 pr-5 [mask-image:linear-gradient(to_right,#000_calc(100%-36px),transparent)] [scrollbar-width:none]"
                role="group"
                aria-label="Category"
              >
                {chips}
              </div>
            </>
          )}
        </div>

        <div className="shell hidden flex-wrap items-center gap-x-8 gap-y-1 py-2 sm:flex xl:flex-nowrap">
          <div
            className="-mx-8 flex min-w-0 flex-auto gap-1.5 overflow-x-auto px-8 py-1 [mask-image:linear-gradient(to_right,#000_calc(100%-44px),transparent)] [scrollbar-width:none] lg:-mx-14 lg:px-14 xl:mx-0 xl:px-0 xl:[mask-image:none]"
            role="group"
            aria-label="Category"
          >
            {chips}
          </div>

          <div className="flex w-full items-center justify-between gap-6 xl:w-auto xl:flex-none xl:justify-end">
            <label className="ct-search min-w-0 flex-1 text-ink sm:max-w-sm xl:w-44 xl:flex-none">
              {searchIcon}
              <span className="sr-only">Search all styles</span>
              <input
                ref={searchRef}
                type="search"
                value={searchDraft}
                onChange={(e) => setSearchDraft(e.target.value)}
                autoComplete="off"
                spellCheck={false}
                placeholder="Search styles"
              />
              <kbd className="ct-kbd hidden sm:inline-grid" aria-hidden>
                /
              </kbd>
            </label>
            {viewToggle}
            {soundToggle}
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
        <section className="shell sec-sm" aria-label="Styles as a list">
          <p className="rk-count mb-8" aria-live="polite">
            {count}
          </p>
          {results.length === 0 ? (
            <div className="flex flex-col items-start gap-6 border-y border-[var(--rule-c)] py-14 sm:py-20">
              <h2 className="t-h2">
                No styles <em>match</em>.
              </h2>
              <p className="t-lead max-w-measure">Try another search, or tell us what you need and we&rsquo;ll source it.</p>
              <div className="mt-2 flex flex-wrap gap-3">
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
