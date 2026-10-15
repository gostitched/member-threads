'use client';

import Link from 'next/link';
import { forwardRef, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import Dossier, { LEAD_SIZES, STRIP_SIZES } from './Dossier';
import Media, { preloadAsset } from './Media';
import { EASE_IN, EASE_OUT, REST, fromFrame, prefersReducedMotion, rectsBy } from './flip';
import { linkPoints, links, panelSpot } from './geometry';
import { layoutStream, layoutWall, type Layout, type Placed } from '@/lib/work-layout';
import { CATEGORIES, leadOf, pieces, stripOf, type WorkCategory, type WorkItem } from '@/lib/work';
import { NAME_MAX, possessive, useOrgName } from '@/lib/name';
import { useDrag } from '@/lib/motion';
import { Star } from '@/components/Sticker';
import './work.css';

/**
 * The Collections wall.
 *
 * DEFAULT  every collection, as one composed collage.
 * HOVER    one piece → the rest of the wall recedes, that collection's pieces come
 *          forward, green thread joins them, and the collection is named in the space left.
 * CLICK    the collection assembles itself out of the collage into a dossier (./Dossier).
 * CASE     the dossier links on to /work/[slug].
 *
 * Hover, keyboard focus and a first tap all reach the same highlight; nothing depends
 * on hover. The wall is still when nobody is touching it.
 */

type Filter = 'all' | WorkCategory;
type Active = { pid: string; anchor: string | null; via: 'pointer' | 'focus' | 'tap'; spot: { x: number; y: number } };
type Open = { pid: string; from: Map<string, DOMRect> | null };

const U = (n: number) => `calc(var(--u) * ${n})`;
const PANEL = { w: 27, h: 17 };
/** Depth of the ink header band on the desktop wall, in wall units. */
const BAND = 15;

export default function WorkWall({ projects }: { projects: WorkItem[] }) {
  const [filter, setFilter] = useState<Filter>('all');
  const [active, setActive] = useState<Active | null>(null);
  const [open, setOpen] = useState<Open | null>(null);
  const [closing, setClosing] = useState(false);

  const shown = useMemo(() => (filter === 'all' ? projects : projects.filter((p) => p.category === filter)), [projects, filter]);
  const desk = useMemo(() => layoutWall(shown), [shown]);
  const stream = useMemo(() => layoutStream(desk), [desk]);

  const deskRef = useRef<HTMLDivElement>(null);
  const streamRef = useRef<HTMLDivElement>(null);
  const leaveTimer = useRef<number | undefined>(undefined);
  const switchTimer = useRef<number | undefined>(undefined);
  const touch = useRef(false);
  const away = useRef<Animation[]>([]);
  const before = useRef<Map<string, DOMRect> | null>(null);
  const pushed = useRef(false);
  const lastFocus = useRef<HTMLElement | null>(null);
  const warmed = useRef(new Set<string>());

  /**
   * Once someone reaches for a project, fetch what its assembled view will show at the
   * size it will show it: the lead and the strip, nothing else. Once per project.
   */
  const warm = useCallback(
    (pid: string) => {
      if (warmed.current.has(pid)) return;
      warmed.current.add(pid);
      const p = projects.find((x) => x.id === pid);
      if (!p) return;
      preloadAsset(leadOf(p), LEAD_SIZES);
      stripOf(p).forEach((a) => preloadAsset(a, STRIP_SIZES));
    },
    [projects],
  );

  /** Only one of the two compositions is displayed at a time. */
  const canvas = useCallback(() => {
    const d = deskRef.current;
    return d && d.offsetParent !== null ? { el: d, layout: desk } : { el: streamRef.current, layout: stream };
  }, [desk, stream]);

  // ── highlight ────────────────────────────────────────────────────────────

  const activate = useCallback(
    (pid: string, anchor: string | null, via: Active['via']) => {
      window.clearTimeout(leaveTimer.current);
      if (open) return;
      warm(pid);
      const { el, layout } = canvas();
      if (!el) return;
      const r = el.getBoundingClientRect();
      const u = r.width / 100;
      const header = 120;
      const members = layout.items.filter((p) => p.project.id === pid);
      const spot = panelSpot(
        members,
        { top: (header - r.top) / u, bottom: (window.innerHeight - r.top) / u },
        PANEL,
        layout.h,
        linkPoints(links(members)),
      );
      setActive((a) => (a && a.pid === pid && a.via === via ? { ...a, anchor: a.anchor ?? anchor } : { pid, anchor, via, spot }));
    },
    [canvas, open, warm],
  );

  const release = useCallback((delay = 160) => {
    window.clearTimeout(leaveTimer.current);
    leaveTimer.current = window.setTimeout(() => setActive(null), delay);
  }, []);

  useEffect(() => () => {
    window.clearTimeout(leaveTimer.current);
    window.clearTimeout(switchTimer.current);
  }, []);

  // A panel placed for one scroll position is wrong for another.
  useEffect(() => {
    if (!active || active.via === 'tap') return;
    const off = () => setActive(null);
    window.addEventListener('scroll', off, { passive: true, once: true });
    return () => window.removeEventListener('scroll', off);
  }, [active]);

  // Everything else on the page dims with the wall, the site header included.
  useEffect(() => {
    document.body.toggleAttribute('data-wk-dim', !!active);
    return () => document.body.removeAttribute('data-wk-dim');
  }, [active]);

  // ── filter ───────────────────────────────────────────────────────────────

  const choose = (f: Filter) => {
    if (f === filter) return;
    before.current = rectsBy(canvas().el, 'data-asset');
    setActive(null);
    setFilter(f);
  };

  // The pieces that stay slide to their new places; the ones arriving fade up.
  useLayoutEffect(() => {
    const prev = before.current;
    before.current = null;
    const el = canvas().el;
    if (!prev || !el || prefersReducedMotion()) return;
    const vh = window.innerHeight;
    let n = 0;
    el.querySelectorAll<HTMLElement>('[data-asset]').forEach((node) => {
      const dst = node.getBoundingClientRect();
      if (dst.top > vh + 100) return;
      const src = prev.get(node.dataset.asset!);
      if (src) {
        node.animate([fromFrame(src, dst), REST], { duration: 620, easing: EASE_OUT });
      } else {
        node.animate([{ opacity: 0, transform: 'scale(0.96)' }, { opacity: 1, transform: 'none' }], {
          duration: 480, delay: 90 + n++ * 14, easing: EASE_OUT, fill: 'backwards',
        });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  // ── open / close ─────────────────────────────────────────────────────────

  const openProject = useCallback(
    (pid: string, animate = true) => {
      const project = projects.find((p) => p.id === pid);
      if (!project) return;
      window.clearTimeout(leaveTimer.current);
      lastFocus.current = document.activeElement as HTMLElement | null;
      const el = canvas().el;
      const reduced = !animate || prefersReducedMotion();
      let from: Map<string, DOMRect> | null = null;

      if (el && !reduced) {
        from = new Map();
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        // Everything that isn't this project leaves the frame, each piece out the
        // side it's nearest to; this project's pieces are handed to the dossier.
        el.querySelectorAll<HTMLElement>('[data-asset], [data-away]').forEach((node) => {
          const r = node.getBoundingClientRect();
          if (node.dataset.project === pid && node.dataset.asset) {
            from!.set(node.dataset.asset, r);
            return;
          }
          if (r.bottom < 0 || r.top > vh) return;
          const dx = r.left + r.width / 2 - vw / 2;
          const dy = r.top + r.height / 2 - vh / 2;
          const len = Math.hypot(dx, dy) || 1;
          const push = vw * 0.32;
          away.current.push(
            node.animate(
              [{ transform: 'none', opacity: 1 }, { transform: `translate(${(dx / len) * push}px, ${(dy / len) * push * 0.55}px) scale(0.97)`, opacity: 0 }],
              { duration: 420, easing: EASE_IN, fill: 'both' },
            ),
          );
        });
      }

      setActive(null);
      if (animate) {
        window.history.pushState({ wk: project.slug }, '', `?project=${project.slug}`);
        pushed.current = true;
      }
      setOpen({ pid, from });
    },
    [projects, canvas],
  );

  const startClose = useCallback(() => {
    setClosing(true);
    away.current.forEach((a) => {
      a.updatePlaybackRate(1.15);
      a.reverse();
    });
  }, []);

  const finishClose = useCallback(() => {
    away.current.forEach((a) => a.cancel());
    away.current = [];
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

  const openIndex = open ? shown.findIndex((p) => p.id === open.pid) : -1;
  const openProjectItem = open ? projects.find((p) => p.id === open.pid) : undefined;
  const next = openIndex >= 0 && shown.length > 1 ? shown[(openIndex + 1) % shown.length] : null;

  const wallRect = useCallback(
    (assetId: string) => canvas().el?.querySelector<HTMLElement>(`[data-asset="${assetId}"]`)?.getBoundingClientRect() ?? null,
    [canvas],
  );

  // ── pointer plumbing shared by both compositions ─────────────────────────

  const handlers = {
    enter: (p: Placed, e: React.PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      window.clearTimeout(switchTimer.current);
      // Switching projects waits for the pointer to settle for a beat, so crossing
      // other work on the way to the panel's button doesn't swap the project out.
      if (active && active.pid !== p.project.id) {
        window.clearTimeout(leaveTimer.current);
        switchTimer.current = window.setTimeout(() => activate(p.project.id, p.asset.id, 'pointer'), 90);
      } else {
        activate(p.project.id, p.asset.id, 'pointer');
      }
    },
    leave: (e: React.PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      window.clearTimeout(switchTimer.current);
      release();
    },
    down: (e: React.PointerEvent) => {
      touch.current = e.pointerType !== 'mouse';
    },
    click: (p: Placed) => {
      // A first tap highlights; only a tap on a project already highlighted by a tap
      // opens it. (The tap also focuses the piece's button, which highlights it "by
      // focus" a moment earlier — that doesn't count as the first tap.)
      if (touch.current && !(active?.pid === p.project.id && active.via === 'tap')) {
        activate(p.project.id, p.asset.id, 'tap');
        return;
      }
      openProject(p.project.id);
    },
    focus: (p: Placed) => activate(p.project.id, p.asset.id, 'focus'),
    blur: () => release(60),
    panelEnter: () => {
      window.clearTimeout(leaveTimer.current);
      window.clearTimeout(switchTimer.current);
    },
    panelLeave: (e: React.PointerEvent) => e.pointerType === 'mouse' && release(),
    dismiss: () => setActive(null),
    open: (pid: string) => openProject(pid),
  };

  const counts = useMemo(() => {
    const m = new Map<WorkCategory, number>();
    for (const p of projects) m.set(p.category, (m.get(p.category) ?? 0) + 1);
    return m;
  }, [projects]);

  const filters = (
    <Filters filter={filter} onChoose={choose} counts={counts} />
  );

  return (
    <div className="wk">
      {/* ── Desktop: the composed collage, headline set into its first band ── */}
      <div className="hidden lg:block">
        <Canvas
          ref={deskRef}
          layout={desk}
          mode="desk"
          active={active}
          openPid={open?.pid ?? null}
          h={handlers}
          head={
            <>
              {/* The header band: a pale-blue rounded panel behind the headline. */}
              <div aria-hidden className="wk-band" style={{ height: `calc(${U(BAND)} + 1.25rem)` }} />
              <h1 data-away className="absolute left-0" style={{ top: U(1.2) }}>
                <span className="clip">
                  <span className="caps block text-d1 text-ink" style={{ animationDelay: '60ms' }}>
                    Collections
                  </span>
                </span>
                <span className="clip mt-2">
                  <span className="block font-sans text-[clamp(1.125rem,1.5vw,1.375rem)] font-medium leading-none text-uv" style={{ animationDelay: '150ms' }}>
                    Drag them around.
                  </span>
                </span>
              </h1>
              <div data-away className="absolute right-0" style={{ top: U(1.4) }}>
                {filters}
              </div>
            </>
          }
        />
      </div>

      {/* ── Phone and tablet: a vertical editorial stream ── */}
      <div className="lg:hidden">
        <div className="mb-8 mt-4 overflow-hidden rounded-[24px] bg-electric-lit pb-5 pt-7 text-ink">
          <h1 className="px-5">
            <span className="clip"><span className="caps block text-d1">Collections</span></span>
          </h1>
          <div className="mt-5 overflow-x-auto px-5 py-1 [scrollbar-width:none]">{filters}</div>
        </div>
        <Canvas ref={streamRef} layout={stream} mode="stream" active={active} openPid={open?.pid ?? null} h={handlers} />
      </div>

      {/* Phone: the project named in a bar, since there's no negative space to spare. */}
      {active?.via === 'tap' && (
        <MobilePanel project={projects.find((p) => p.id === active.pid)!} onOpen={() => openProject(active.pid)} onClose={() => setActive(null)} />
      )}

      <Ending />

      {open && openProjectItem && (
        <Dossier
          key="dossier"
          project={openProjectItem}
          from={open.from}
          closing={closing}
          onClose={requestClose}
          onClosed={finishClose}
          next={next && next.id !== open.pid ? next : null}
          onNext={
            next && next.id !== open.pid
              ? () => {
                  window.history.replaceState({ wk: next.slug }, '', `?project=${next.slug}`);
                  setOpen({ pid: next.id, from: null });
                }
              : null
          }
          wallRect={wallRect}
        />
      )}
    </div>
  );
}

// ── the canvas ──────────────────────────────────────────────────────────────

type Handlers = {
  enter: (p: Placed, e: React.PointerEvent) => void;
  leave: (e: React.PointerEvent) => void;
  down: (e: React.PointerEvent) => void;
  click: (p: Placed) => void;
  focus: (p: Placed) => void;
  blur: () => void;
  panelEnter: () => void;
  panelLeave: (e: React.PointerEvent) => void;
  dismiss: () => void;
  open: (pid: string) => void;
};

const Canvas = forwardRef<
  HTMLDivElement,
  { layout: Layout; mode: 'desk' | 'stream'; active: Active | null; openPid: string | null; h: Handlers; head?: React.ReactNode }
>(function Canvas({ layout, mode, active, openPid, h, head }, ref) {
  const desk = mode === 'desk';
  const on = active?.pid ?? null;
  const members = useMemo(() => (on ? layout.items.filter((p) => p.project.id === on) : []), [layout, on]);
  const paths = useMemo(() => (desk && on ? links(members) : []), [desk, on, members]);
  const project = members[0]?.project;
  const firstOf = new Set<string>();

  return (
    <div
      ref={ref}
      className={`wk-canvas relative ${desk ? 'wk-desk' : 'wk-stream'}`}
      data-active={on ? '' : undefined}
      style={{ height: U(layout.h) }}
    >
      {head}

      {/* The rest of the page drops back behind the project. */}
      <div className="wk-dim" data-on={on ? '' : undefined} onClick={h.dismiss} aria-hidden />

      {layout.items.map((p) => {
        const mine = p.project.id === on;
        // One control per project, on its first piece in reading order; the other
        // pieces respond to the pointer but stay out of the tab order.
        const primary = !firstOf.has(p.project.id);
        firstOf.add(p.project.id);
        return <Piece key={p.asset.id} p={p} mine={mine} primary={primary} desk={desk} hidden={openPid === p.project.id} h={h} />;
      })}

      {/* Credits: a few pieces carry their collection's number and name, like picture credits. */}
      {layout.items.filter((p) => p.credit).map((p) => (
        <p
          key={`c-${p.asset.id}`}
          data-away
          aria-hidden
          className={`wk-credit ${p.credit === 'left' || p.credit === 'below-end' ? 'text-right' : ''} ${p.project.id === on ? 'is-on' : ''} ${
            desk && (p.credit === 'below' || p.credit === 'below-end' ? p.y + p.h + 0.9 : p.credit === 'right-end' ? p.y + p.h - 3 : p.y + 0.3) < BAND ? 'on-ink' : ''
          }`}
          style={{
            left: p.credit === 'right' || p.credit === 'right-end' ? U(p.x + p.w + 1.1) : p.credit === 'left' ? U(p.x - 1.1) : p.credit === 'below-end' ? U(p.x + p.w) : U(p.x + (desk ? 0.2 : 0)),
            top: p.credit === 'below' || p.credit === 'below-end' ? U(p.y + p.h + (desk ? 0.9 : 2.4)) : p.credit === 'right-end' ? `calc(${U(p.y + p.h)} - 3.9em)` : U(p.y + 0.3),
            transform: p.credit === 'left' || p.credit === 'below-end' ? 'translateX(-100%)' : undefined,
          }}
        >
          {p.project.title}
        </p>
      ))}

      {/* The lines that join a project's pieces. */}
      {desk && on && (
        <svg key={on} className="wk-lines" viewBox={`0 0 100 ${layout.h}`} aria-hidden>
          {paths.map((l, i) => (
            <g key={i} style={{ animationDelay: `${i * 35}ms` }}>
              <path d={l.d} pathLength={1} />
              <rect x={l.a.x - 0.22} y={l.a.y - 0.22} width={0.44} height={0.44} />
              <rect x={l.b.x - 0.22} y={l.b.y - 0.22} width={0.44} height={0.44} />
            </g>
          ))}
        </svg>
      )}

      {/* The project, named in the space the dimmed work leaves. */}
      {desk && on && project && active && active.via !== 'tap' && (
        <div
          key={`p-${on}`}
          className="wk-panel"
          style={{ left: U(active.spot.x), top: U(active.spot.y), width: U(PANEL.w) }}
          role="status"
        >
          <p className="caps text-d3 text-ink">{project.title}</p>
          <p className="mt-2 text-[0.9375rem] text-muted">
            {project.sector}
            {pieces(project) ? ` · ${pieces(project)} pieces` : ''}
          </p>
          <button
            type="button"
            onClick={() => h.open(project.id)}
            onPointerEnter={h.panelEnter}
            onPointerLeave={h.panelLeave}
            onFocus={h.panelEnter}
            onBlur={h.blur}
            className="btn-blue pointer-events-auto mt-5 px-5 py-2.5 text-[0.9375rem]"
          >
            View collection <span aria-hidden>→</span>
          </button>
        </div>
      )}
    </div>
  );
});

/**
 * One piece on the wall. It can be picked up and dragged with a mouse or pen, and
 * springs back to its place on release; on a phone a touch stays a tap (and a scroll).
 */
function Piece({ p, mine, primary, desk, hidden, h }: { p: Placed; mine: boolean; primary: boolean; desk: boolean; hidden: boolean; h: Handlers }) {
  const drag = useDrag<HTMLDivElement>({ touch: false });
  return (
    <div
      ref={drag.ref}
      data-asset={p.asset.id}
      data-project={p.project.id}
      className={`wk-item ${p.role === 'garment' ? 'is-cut' : p.asset.kind === 'artifact' && !p.asset.art?.t.match(/swatch|box/) ? 'is-cut' : 'is-rect'} ${p.asset.src ? 'is-photo' : ''} ${mine ? 'is-on' : ''} ${drag.dragging ? 'is-held' : ''}`}
      style={{
        ...drag.style,
        left: U(p.x), top: U(p.y), width: U(p.w), height: U(p.h),
        zIndex: drag.dragging ? 200 : mine ? 60 + p.z : p.z,
        visibility: hidden ? 'hidden' : undefined,
      }}
      onPointerEnter={(e) => h.enter(p, e)}
      onPointerLeave={h.leave}
      onPointerDown={(e) => {
        h.down(e);
        drag.handlers.onPointerDown(e);
      }}
      onClickCapture={drag.handlers.onClickCapture}
      onDragStart={drag.handlers.onDragStart}
      onClick={() => h.click(p)}
    >
      {primary && (
        <button
          type="button"
          className="wk-hit"
          aria-label={`${p.project.title}, ${p.project.sector}. Open collection`}
          onFocus={() => h.focus(p)}
          onBlur={h.blur}
        />
      )}
      <div className="wk-lift">
        <div className="wk-media">
          <Media
            asset={p.asset}
            labelled={false}
            eager={p.eager && p.role !== 'bit'}
            sizes={desk ? `${(p.w * 0.94).toFixed(1)}vw` : `${Math.round(p.w)}vw`}
          />
        </div>
      </div>
    </div>
  );
}

// ── pieces ──────────────────────────────────────────────────────────────────

function Filters({
  filter,
  onChoose,
  counts,
}: {
  filter: Filter;
  onChoose: (f: Filter) => void;
  counts: Map<WorkCategory, number>;
}) {
  const tabs: { id: Filter; label: string }[] = [
    { id: 'all', label: 'All' },
    ...CATEGORIES.filter((c) => counts.get(c.id)).map((c) => ({ id: c.id, label: c.label })),
  ];
  return (
    <nav aria-label="Filter collections by category">
      <ul className="flex items-center gap-2 whitespace-nowrap">
        {tabs.map((t) => {
          const on = t.id === filter;
          return (
            <li key={t.id}>
              <button
                type="button"
                onClick={() => onChoose(t.id)}
                aria-pressed={on}
                className={`flex min-h-[40px] items-center rounded-full px-4 text-[0.875rem] font-semibold transition-colors duration-200 motion-reduce:transition-none ${
                  on ? 'bg-ink text-paper' : 'bg-ink/5 text-ink hover:bg-ink/10'
                }`}
              >
                {t.label}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function MobilePanel({ project, onOpen, onClose }: { project: WorkItem; onOpen: () => void; onClose: () => void }) {
  return (
    <div className="wk-sheet fixed inset-x-3 bottom-3 z-[65] rounded-3xl bg-white p-4 text-ink shadow-[0_0_0_1px_theme(colors.rule),0_12px_32px_rgba(14,26,71,0.12)] lg:hidden" role="status">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="caps text-[1.375rem] leading-[0.95] tracking-tight">{project.title}</p>
          <p className="mt-1.5 text-[0.875rem] text-muted">{project.sector}</p>
        </div>
        <button type="button" onClick={onClose} aria-label="Clear" className="-mr-2 -mt-2 flex h-11 w-11 shrink-0 items-center justify-center text-ink/60">
          ✕
        </button>
      </div>
      <button type="button" onClick={onOpen} className="btn-blue mt-4 w-full py-3 text-[0.9375rem]">
        View collection <span aria-hidden>→</span>
      </button>
    </div>
  );
}

/**
 * The wall ends on the next collection: theirs. The name is typed straight into the
 * headline in raspberry; same name everywhere on the site.
 */
function Ending() {
  const { name, raw, set, isDefault } = useOrgName();
  // The input sizes to what's typed, so the name sits in the line like set type.
  const chars = Math.max((raw || 'Your name').length, 4);
  return (
    <section aria-label="Your collection" className="wk-next relative mt-16 overflow-hidden rounded-[32px] bg-electric-lit text-ink lg:mt-10">
      <Star variant="outline" rotate={15} className="pointer-events-none absolute right-[6%] top-10 hidden h-20 w-20 text-uv-lit md:block lg:h-28 lg:w-28" />
      <div className="relative px-6 py-14 sm:px-10 lg:px-16 lg:py-20">
        <h2 className="caps text-d1">
          <span className="block">The</span>
          <label className="block">
            <span className="sr-only">Name</span>
            <input
              type="text"
              value={raw}
              onChange={(e) => set(e.target.value)}
              maxLength={NAME_MAX}
              placeholder="Your name"
              autoComplete="off"
              autoCapitalize="words"
              spellCheck={false}
              enterKeyHint="done"
              size={chars}
              style={{ width: `min(100%, ${chars * 0.74 + 0.3}em)` }}
              className="wk-name caps block max-w-full rounded-none border-b-[0.06em] border-uv/40 bg-transparent pb-[0.04em] uppercase leading-[0.95] text-uv caret-uv outline-none placeholder:text-ink/25"
            />
          </label>
          <span className="block">Collection.</span>
        </h2>
        <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-5">
          <p className="font-sans text-[clamp(1.25rem,1.8vw,1.625rem)] font-medium leading-none text-ink">could be next.</p>
          <Link href="/quote" className="btn-blue">
            {isDefault ? 'Start your collection' : `Start ${possessive(name).replace("'", '’')} collection`} <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
