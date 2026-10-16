'use client';

import Link from 'next/link';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import Dossier from './Dossier';
import WorkArt from './art';
import { EASE_OUT, prefersReducedMotion, rectsBy } from './flip';
import { Arrow, MoodPhoto, type Ratio } from './ui';
import { CATEGORIES, categoryOf, drop, pad3, pieces, scheduleOf, type WorkCategory, type WorkItem } from '@/lib/work';
import { NAME_MAX, YOUR_NAME, possessive, useOrgName } from '@/lib/name';
import './work.css';

/**
 * The members' wall: every concept collection as one tile on an asymmetric grid.
 *
 * REST    photos sit in duotone, each with its roster number sewn across the top edge
 *         and its product flat on a cream plate across the bottom corner.
 * HOVER   the tile releases into full colour; the flat lifts.
 * FILTER  segment chips; tiles that stay slide to their new places.
 * OPEN    a tile opens the dossier (./Dossier) over the wall, its photo travelling into
 *         place; the URL becomes /work?project=<slug> so back closes it. The tile is a
 *         real link to /work/<slug>, so a modified click or no script still goes there.
 * CLOSE   the org-name line: the next roster number is theirs.
 */

type Filter = 'all' | WorkCategory;
type Open = { pid: string; from: DOMRect | null };

/** Frame per position on the wall. Spans and offsets live in work.css (.wk-pos-*). */
const POS: { ratio: Ratio; side: 'left' | 'right'; sizes: string }[] = [
  { ratio: 'portrait', side: 'right', sizes: '(min-width: 1536px) 640px, (min-width: 1024px) 42vw, (min-width: 640px) 75vw, 92vw' },
  { ratio: 'landscape', side: 'left', sizes: '(min-width: 1536px) 760px, (min-width: 1024px) 50vw, (min-width: 640px) 75vw, 70vw' },
  { ratio: 'square', side: 'right', sizes: '(min-width: 1536px) 500px, (min-width: 1024px) 33vw, (min-width: 640px) 75vw, 92vw' },
  { ratio: 'tall', side: 'left', sizes: '(min-width: 1536px) 640px, (min-width: 1024px) 42vw, (min-width: 640px) 75vw, 70vw' },
  { ratio: 'portrait', side: 'right', sizes: '(min-width: 1536px) 500px, (min-width: 1024px) 33vw, (min-width: 640px) 75vw, 92vw' },
];
const POS_CLASS = ['wk-pos-0', 'wk-pos-1', 'wk-pos-2', 'wk-pos-3', 'wk-pos-4', 'wk-pos-5'];

export default function WorkWall({ projects }: { projects: WorkItem[] }) {
  const [filter, setFilter] = useState<Filter>('all');
  const [open, setOpen] = useState<Open | null>(null);
  const [closing, setClosing] = useState(false);

  const shown = useMemo(() => (filter === 'all' ? projects : projects.filter((p) => p.category === filter)), [projects, filter]);

  const wallRef = useRef<HTMLDivElement>(null);
  const before = useRef<Map<string, DOMRect> | null>(null);
  const pushed = useRef(false);
  const lastFocus = useRef<HTMLElement | null>(null);

  // ── filter ───────────────────────────────────────────────────────────────

  const choose = (f: Filter) => {
    if (f === filter) return;
    before.current = rectsBy(wallRef.current, 'data-tile');
    setFilter(f);
  };

  // Tiles that stay slide to their new places; the ones arriving rise in.
  useLayoutEffect(() => {
    const prev = before.current;
    before.current = null;
    const el = wallRef.current;
    if (!prev || !el || prefersReducedMotion()) return;
    let n = 0;
    el.querySelectorAll<HTMLElement>('[data-tile]').forEach((node) => {
      const dst = node.getBoundingClientRect();
      const src = prev.get(node.dataset.tile!);
      if (src) {
        node.animate([{ transform: `translate(${src.left - dst.left}px, ${src.top - dst.top}px)` }, { transform: 'none' }], { duration: 620, easing: EASE_OUT });
      } else {
        node.animate([{ opacity: 0, transform: 'translateY(24px)' }, { opacity: 1, transform: 'none' }], {
          duration: 620, delay: 60 + n++ * 80, easing: EASE_OUT, fill: 'backwards',
        });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  // ── open / close ─────────────────────────────────────────────────────────

  const photoRect = (pid: string) =>
    wallRef.current?.querySelector<HTMLElement>(`[data-flip="${pid}"]`)?.getBoundingClientRect() ?? null;

  const openProject = useCallback(
    (pid: string, animate = true) => {
      const project = projects.find((p) => p.id === pid);
      if (!project) return;
      lastFocus.current = document.activeElement as HTMLElement | null;
      const from = animate && !prefersReducedMotion() ? photoRect(pid) : null;
      if (animate) {
        window.history.pushState({ wk: project.slug }, '', `?project=${project.slug}`);
        pushed.current = true;
      }
      setOpen({ pid, from });
    },
    [projects],
  );

  const startClose = useCallback(() => setClosing(true), []);

  const finishClose = useCallback(() => {
    setClosing(false);
    setOpen(null);
    lastFocus.current?.focus({ preventScroll: true });
  }, []);

  const requestClose = useCallback(() => {
    if (closing) return;
    if (pushed.current) {
      pushed.current = false;
      window.history.back(); // popstate closes it
    } else {
      window.history.replaceState(null, '', window.location.pathname);
      startClose();
    }
  }, [closing, startClose]);

  // Back/forward, and arriving on /work?project=… directly.
  useEffect(() => {
    const sync = () => {
      const slug = new URLSearchParams(window.location.search).get('project');
      const project = slug ? projects.find((p) => p.slug === slug) : undefined;
      if (!project && open && !closing) {
        pushed.current = false;
        startClose();
      } else if (project && !open) {
        openProject(project.id, false);
      } else if (project && open && project.id !== open.pid) {
        setOpen({ pid: project.id, from: null });
      }
    };
    window.addEventListener('popstate', sync);
    return () => window.removeEventListener('popstate', sync);
  }, [projects, open, closing, startClose, openProject]);

  useEffect(() => {
    const slug = new URLSearchParams(window.location.search).get('project');
    const project = slug ? projects.find((p) => p.slug === slug) : undefined;
    if (project) openProject(project.id, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openItem = open ? projects.find((p) => p.id === open.pid) : undefined;
  const openIndex = openItem ? projects.indexOf(openItem) : -1;
  const next = openIndex >= 0 && projects.length > 1 ? projects[(openIndex + 1) % projects.length] : null;

  const counts = useMemo(() => {
    const m = new Map<WorkCategory, number>();
    for (const p of projects) m.set(p.category, (m.get(p.category) ?? 0) + 1);
    return m;
  }, [projects]);

  const first = projects[0]?.no ?? 1;
  const last = projects[projects.length - 1]?.no ?? projects.length;

  return (
    <div className="wk">
      {/* ── Header ── */}
      <header className="shell pb-16 pt-14 lg:pb-24 lg:pt-24">
        <div className="grid-12 items-end gap-y-8">
          <div className="col-span-4 sm:col-span-8 lg:col-span-8">
            <p className="t-spec enter flex items-center gap-3 text-muted">
              <span>Collections</span>
              <span aria-hidden className="stitch-rule w-10" />
              <span>{drop(first)}–{pad3(last)}</span>
            </p>
            <h1 className="t-display mt-5 lg:mt-6">
              <span className="enter block" style={{ ['--d' as string]: '80ms' }}>The members’</span>
              <span className="enter block" style={{ ['--d' as string]: '160ms' }}><em>wall</em>.</span>
            </h1>
          </div>
          <p className="t-lead enter col-span-4 max-w-[34ch] sm:col-span-6 lg:col-span-4 lg:pb-3" style={{ ['--d' as string]: '240ms' }}>
            Five concept collections, one for each kind of organization we make for. Worked examples, not clients: the pieces, the palette, the finishes and the count.
          </p>
        </div>

        <div className="hairline mt-12 flex flex-col gap-4 pt-5 lg:mt-20 lg:flex-row lg:items-center lg:justify-between">
          <Filters filter={filter} onChoose={choose} counts={counts} total={projects.length} />
          <p className="t-spec text-muted" aria-live="polite">
            Showing {pad3(shown.length).slice(1)} of {pad3(projects.length).slice(1)}
          </p>
        </div>
      </header>

      {/* ── The wall ── */}
      <div className="shell pb-[var(--sec)]">
        <div ref={wallRef} className="wk-wall grid-12" data-n={shown.length}>
          {shown.map((p, i) => (
            <Tile key={p.id} p={p} i={i} onOpen={() => openProject(p.id)} hidden={open?.pid === p.id} />
          ))}
          <Reserved i={shown.length} no={projects.length + 1} />
        </div>
      </div>

      <Ending count={projects.length} />

      {open && openItem && (
        <Dossier
          key="dossier"
          project={openItem}
          from={open.from}
          closing={closing}
          onClose={requestClose}
          onClosed={finishClose}
          next={next}
          onNext={
            next
              ? () => {
                  window.history.replaceState({ wk: next.slug }, '', `?project=${next.slug}`);
                  setOpen({ pid: next.id, from: null });
                }
              : null
          }
          wallRect={photoRect}
        />
      )}
    </div>
  );
}

// ── a tile ──────────────────────────────────────────────────────────────────

function Tile({ p, i, onOpen, hidden }: { p: WorkItem; i: number; onOpen: () => void; hidden: boolean }) {
  const pos = POS[i % POS.length];
  const flat = scheduleOf(p)[0]?.flat;
  const cat = categoryOf(p);
  return (
    <article data-tile={p.id} className={`wk-tile relative ${POS_CLASS[i]}`}>
      <Link
        href={`/work/${p.slug}`}
        scroll={false}
        className="wk-tile-link"
        aria-label={`${drop(p.no)}, ${p.title}. ${p.sector}. Open the collection`}
        onClick={(e) => {
          if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
          e.preventDefault();
          onOpen();
        }}
      >
        <div className="relative">
          <span className="wk-no woven">{drop(p.no)} · Concept</span>
          <div data-flip={p.id} style={{ visibility: hidden ? 'hidden' : undefined }}>
            {p.mood ? (
              <MoodPhoto slug={p.mood.wall} ratio={pos.ratio} sizes={pos.sizes} treatment="release" alt="" priority={i < 2} />
            ) : null}
          </div>
          {flat?.art && (
            <div className="wk-flat" data-side={pos.side} aria-hidden>
              <div className="absolute inset-[8%]">
                <WorkArt art={flat.art} className="h-full w-full" />
              </div>
            </div>
          )}
        </div>
        <div className="wk-cap mt-6 sm:mt-7" data-side={pos.side}>
          <h2 className="wk-title t-h3 flex items-baseline gap-3">
            <span>{p.title}</span>
            <Arrow className="h-3 w-4 shrink-0 self-center" />
          </h2>
          <p className="t-spec mt-2 text-muted">
            {cat?.label} · {pieces(p)} pieces · {p.method}
          </p>
        </div>
      </Link>
    </article>
  );
}

/** The slot after the last collection: the next roster number, held open. */
function Reserved({ i, no }: { i: number; no: number }) {
  return (
    <article className={`wk-tile relative ${POS_CLASS[Math.min(i, 5)]}`}>
      <a href="#your-collection" className="wk-tile-link group">
        <div className="wk-reserved text-ink">
          <span className="woven woven-beige relative z-[1] self-start">{drop(no)} · Reserved</span>
          <p className="t-h2 relative z-[1] max-w-[12ch]">
            Yours, <em>next</em>.
          </p>
        </div>
        <p className="t-spec mt-6 flex items-center gap-3 text-muted sm:mt-7">
          Put your name on it
          <Arrow className="h-3 w-4 transition-transform duration-base ease-out group-hover:translate-x-1" />
        </p>
      </a>
    </article>
  );
}

// ── filters ─────────────────────────────────────────────────────────────────

function Filters({
  filter,
  onChoose,
  counts,
  total,
}: {
  filter: Filter;
  onChoose: (f: Filter) => void;
  counts: Map<WorkCategory, number>;
  total: number;
}) {
  const tabs: { id: Filter; label: string; title?: string; n: number }[] = [
    { id: 'all', label: 'All', n: total },
    ...CATEGORIES.filter((c) => counts.get(c.id)).map((c) => ({ id: c.id, label: c.label, title: c.title, n: counts.get(c.id) ?? 0 })),
  ];
  return (
    <div className="-mx-5 overflow-x-auto px-5 [scrollbar-width:none] sm:mx-0 sm:px-0">
      <ul className="flex items-center gap-2 whitespace-nowrap" aria-label="Filter collections by who they’re for">
        {tabs.map((t) => (
          <li key={t.id}>
            <button type="button" onClick={() => onChoose(t.id)} aria-pressed={t.id === filter} title={t.title} className="chip">
              {t.label}
              <span className="t-spec opacity-60">{String(t.n).padStart(2, '0')}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * The wall ends on the next roster number: theirs. The organization's name is typed
 * straight into the line; it's the same name everywhere on the site.
 */
function Ending({ count }: { count: number }) {
  const { name, raw, set, isDefault } = useOrgName();
  const chars = Math.max((raw || YOUR_NAME).length, 5);
  return (
    <section id="your-collection" aria-labelledby="wk-yours" className="band-cream sec scroll-mt-20">
      <div className="shell grid-12 items-end gap-y-12">
        <div className="col-span-4 sm:col-span-8 lg:col-span-8">
          <span className="woven woven-green">{drop(count + 1)} · Reserved</span>
          <h2 id="wk-yours" className="t-h1 mt-8">
            <span className="block">The</span>
            <label className="block">
              <span className="sr-only">Your organization’s name</span>
              <input
                type="text"
                value={raw}
                onChange={(e) => set(e.target.value)}
                maxLength={NAME_MAX}
                placeholder={YOUR_NAME}
                autoComplete="organization"
                autoCapitalize="words"
                spellCheck={false}
                enterKeyHint="done"
                size={chars}
                style={{ width: `min(100%, ${chars * 0.86 + 0.4}em)` }}
                className="wk-name t-block block max-w-full rounded-none bg-transparent py-[0.12em] text-[clamp(2.25rem,6.4vw,6rem)] text-ink"
              />
            </label>
            <span className="block">collection.</span>
          </h2>
        </div>
        <div className="col-span-4 sm:col-span-6 lg:col-span-4">
          <p className="t-body max-w-[34ch]">
            Type your organization’s name. Tell us who it’s for, and we’ll design the pieces around it.
          </p>
          <p className="t-spec mt-5 text-muted">From 36 per style · Design included · One clear price</p>
          <Link href="/quote" className="btn-blue mt-10 w-full sm:w-auto">
            {isDefault ? 'Start your collection' : `Start ${possessive(name).replace("'", '’')} collection`}
            <Arrow className="h-3 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

