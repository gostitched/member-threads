import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import type { CSSProperties, DragEvent as ReactDragEvent, MouseEvent as ReactMouseEvent, PointerEvent as ReactPointerEvent, RefObject } from 'react';

/**
 * Motion helpers. Everything here degrades to static under
 * `prefers-reduced-motion: reduce`. Hooks are client-only.
 */

const QUERY = '(prefers-reduced-motion: reduce)';

/**
 * Imperative check: true when the user asked for reduced motion.
 * Returns false on the server. For render logic prefer `useReducedMotion()`.
 */
export function reducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia(QUERY).matches;
}

function subscribeRM(cb: () => void) {
  if (typeof window === 'undefined' || !window.matchMedia) return () => {};
  const mq = window.matchMedia(QUERY);
  mq.addEventListener('change', cb);
  return () => mq.removeEventListener('change', cb);
}

/** Reactive reduced-motion flag. false during SSR/hydration (no mismatch), then live. */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribeRM, reducedMotion, () => false);
}

/** Pixels the pointer must travel before a press becomes a drag (below it, taps/clicks pass through). */
const DRAG_THRESHOLD = 5;

export type DragHandlers = {
  onPointerDown(e: ReactPointerEvent<HTMLElement>): void;
  onClickCapture(e: ReactMouseEvent<HTMLElement>): void;
  onDragStart(e: ReactDragEvent<HTMLElement>): void;
};

/**
 * Pointer drag. Spread all three onto one element:
 *   const { ref, style, handlers } = useDrag<HTMLDivElement>();
 *   <div ref={ref} style={style} {...handlers}>…</div>
 * - Moves with the CSS `translate` property, so it composes with the element's
 *   own `transform`/rotate classes. Merge `style` if you pass your own.
 * - `spring` (default true): springs back to rest on release. false: stays put.
 * - `touch` (default true): drag on touch too (sets touch-action:none, which
 *   blocks scroll starting on that element). Pass false for big elements that
 *   must keep tap/scroll behaviour on phones; touch then does nothing special.
 * - A press that moves < 5px is a normal tap/click; after a real drag the
 *   trailing click is swallowed so links don't fire.
 * - No-op under reduced motion (empty style, inert handlers).
 * - Raises z-index while dragging (only effective if the element is positioned).
 * - `dragging` is true while the pointer is held past the threshold.
 */
export function useDrag<T extends HTMLElement = HTMLElement>(o?: {
  spring?: boolean;
  touch?: boolean;
}): { ref: RefObject<T | null>; style: CSSProperties; handlers: DragHandlers; dragging: boolean } {
  const spring = o?.spring ?? true;
  const touch = o?.touch ?? true;
  const reduced = useReducedMotion();
  const ref = useRef<T | null>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const rest = useRef({ x: 0, y: 0 });
  const suppressClick = useRef(false);
  const cleanup = useRef<(() => void) | null>(null);

  useEffect(() => () => cleanup.current?.(), []);
  useEffect(() => {
    if (reduced) {
      cleanup.current?.();
      rest.current = { x: 0, y: 0 };
      setPos({ x: 0, y: 0 });
      setDragging(false);
    }
  }, [reduced]);

  const onPointerDown = useCallback(
    (e: ReactPointerEvent<HTMLElement>) => {
      if (reduced) return;
      if (e.button !== 0) return;
      if (e.pointerType === 'touch' && !touch) return;
      cleanup.current?.();
      suppressClick.current = false;
      const sx = e.clientX;
      const sy = e.clientY;
      const base = rest.current;
      let active = false;

      const move = (ev: PointerEvent) => {
        if (ev.pointerId !== e.pointerId) return;
        const dx = ev.clientX - sx;
        const dy = ev.clientY - sy;
        if (!active) {
          if (Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
          active = true;
          suppressClick.current = true;
          setDragging(true);
        }
        if (ev.cancelable) ev.preventDefault();
        setPos({ x: base.x + dx, y: base.y + dy });
      };
      const end = (ev: PointerEvent) => {
        if (ev.pointerId !== e.pointerId) return;
        stop();
        if (!active) return;
        setDragging(false);
        if (spring || ev.type === 'pointercancel') {
          rest.current = spring ? { x: 0, y: 0 } : base;
          setPos(rest.current);
        } else {
          rest.current = { x: base.x + ev.clientX - sx, y: base.y + ev.clientY - sy };
        }
      };
      const stop = () => {
        window.removeEventListener('pointermove', move);
        window.removeEventListener('pointerup', end);
        window.removeEventListener('pointercancel', end);
        cleanup.current = null;
      };
      window.addEventListener('pointermove', move, { passive: false });
      window.addEventListener('pointerup', end);
      window.addEventListener('pointercancel', end);
      cleanup.current = stop;
    },
    [reduced, spring, touch],
  );

  const onClickCapture = useCallback((e: ReactMouseEvent<HTMLElement>) => {
    if (!suppressClick.current) return;
    suppressClick.current = false;
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const onDragStart = useCallback(
    (e: ReactDragEvent<HTMLElement>) => {
      if (!reduced) e.preventDefault(); // no native image/link ghost drag
    },
    [reduced],
  );

  const style: CSSProperties = reduced
    ? {}
    : {
        translate: `${pos.x}px ${pos.y}px`,
        transition: dragging ? 'none' : 'translate 0.55s cubic-bezier(0.34, 1.56, 0.64, 1)',
        cursor: dragging ? 'grabbing' : 'grab',
        touchAction: touch ? 'none' : undefined,
        userSelect: 'none',
        WebkitUserSelect: 'none',
        zIndex: dragging ? 50 : undefined,
      };

  return { ref, style, handlers: { onPointerDown, onClickCapture, onDragStart }, dragging };
}

/**
 * Pointer-follow 3D tilt for `.tilt` cards (sets --tilt-x/--tilt-y on the
 * element). Mouse/pen only; inert under reduced motion.
 * @example const tilt = useTilt(); <div className="tilt" {...tilt}>
 */
export function useTilt(max = 8): {
  onPointerMove(e: ReactPointerEvent<HTMLElement>): void;
  onPointerLeave(e: ReactPointerEvent<HTMLElement>): void;
} {
  const reduced = useReducedMotion();
  const onPointerMove = useCallback(
    (e: ReactPointerEvent<HTMLElement>) => {
      if (reduced || e.pointerType === 'touch') return;
      const el = e.currentTarget;
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      el.style.setProperty('--tilt-x', `${(-py * max * 2).toFixed(2)}deg`);
      el.style.setProperty('--tilt-y', `${(px * max * 2).toFixed(2)}deg`);
    },
    [reduced, max],
  );
  const onPointerLeave = useCallback((e: ReactPointerEvent<HTMLElement>) => {
    e.currentTarget.style.removeProperty('--tilt-x');
    e.currentTarget.style.removeProperty('--tilt-y');
  }, []);
  return { onPointerMove, onPointerLeave };
}
