'use client';

import { useEffect, useRef, useState } from 'react';
import type { CustomizationId } from '@/lib/upcharge';
import { CAMERA } from './config';
import type { GarmentScene, Projected } from './scene';

/**
 * The 3D mockneck, living directly on the pricing board: a transparent canvas the
 * size of the stage, so the board's grid shows through and nothing frames it.
 *
 * Three.js is only fetched as the section approaches the viewport. Until the scene
 * is ready, a shaded still of the same garment (computed from the same shape, so the
 * swap is seamless) holds its place. Rendering pauses whenever the board is off
 * screen, and between interactions.
 */

type Props = {
  applied: readonly CustomizationId[];
  /** The board leans a little as it fills up; degrees. */
  tilt?: number;
  /** Where each annotation anchor is, in % of this element. Called as the garment moves. */
  onAnchors?: (a: Projected) => void;
  /** Must position the element (`relative`, `absolute inset-0`, …). */
  className?: string;
};

export default function Garment3D({ applied, tilt = 0, onAnchors, className = 'relative' }: Props) {
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const still = useRef<HTMLCanvasElement>(null);
  const scene = useRef<GarmentScene | null>(null);
  const anchorsCb = useRef(onAnchors);
  anchorsCb.current = onAnchors;
  const drag = useRef<{ id: number; x: number; y: number; moved: boolean } | null>(null);

  const [ready, setReady] = useState(false);
  const [touched, setTouched] = useState(false);
  const [backSide, setBackSide] = useState(false);
  const [checkBack, setCheckBack] = useState(false);
  const prevApplied = useRef<readonly CustomizationId[]>([]);

  // Shaded still, drawn straight away from the garment's own shape.
  useEffect(() => {
    let cancelled = false;
    import('./still').then(({ drawStill }) => {
      if (!cancelled && still.current) drawStill(still.current, CAMERA);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Load the 3D scene once the board is near, and pause it whenever it's far.
  useEffect(() => {
    const el = wrap.current;
    const cv = canvas.current;
    if (!el || !cv) return;
    let alive = true;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const lowPower =
      window.matchMedia('(max-width: 767px)').matches ||
      (navigator as Navigator & { deviceMemory?: number }).deviceMemory! <= 4 ||
      navigator.hardwareConcurrency <= 4;

    const start = async () => {
      const { GarmentScene } = await import('./scene');
      if (!alive) return;
      let s: GarmentScene;
      try {
        s = new GarmentScene({
          canvas: cv,
          lowPower,
          reducedMotion: reduced,
          onAnchors: (a) => anchorsCb.current?.(a),
          onTurned: (yaw) => setBackSide(Math.abs(yaw) > Math.PI / 2),
        });
      } catch {
        return; // No WebGL: the still stays.
      }
      scene.current = s;
      const r = el.getBoundingClientRect();
      s.setSize(r.width, r.height);
      await s.load();
      if (!alive) return s.dispose();
      s.setApplied(prevApplied.current);
      s.setTilt(tilt);
      setReady(true);
    };

    const near = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          near.disconnect();
          start();
        }
      },
      { rootMargin: '800px 0px' },
    );
    near.observe(el);
    const onScreen = new IntersectionObserver(([e]) => scene.current?.setVisible(e.isIntersecting), { rootMargin: '120px 0px' });
    onScreen.observe(el);
    const resize = new ResizeObserver(([e]) => scene.current?.setSize(e.contentRect.width, e.contentRect.height));
    resize.observe(el);

    return () => {
      alive = false;
      near.disconnect();
      onScreen.disconnect();
      resize.disconnect();
      scene.current?.dispose();
      scene.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Decorations. A new back print while we're looking at the front gets a small
  // turn toward it and a pointer; the visitor does the rest.
  useEffect(() => {
    const added = applied.filter((id) => !prevApplied.current.includes(id));
    prevApplied.current = applied;
    const s = scene.current;
    s?.setApplied(applied);
    if ((added.includes('back') || added.includes('location')) && s && Math.abs(s.yawNow) < Math.PI / 2) {
      s.nudge(s.yawNow >= 0 ? 0.45 : -0.45);
      setCheckBack(true);
    }
  }, [applied]);

  useEffect(() => {
    if (backSide) setCheckBack(false);
  }, [backSide]);

  useEffect(() => {
    scene.current?.setTilt(tilt);
  }, [tilt]);

  // ── Pointer: drag to turn it, hover for a little give ──
  const down = (e: React.PointerEvent) => {
    if (!scene.current) return;
    drag.current = { id: e.pointerId, x: e.clientX, y: e.clientY, moved: false };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    scene.current.dragStart();
  };
  const move = (e: React.PointerEvent) => {
    const s = scene.current;
    if (!s) return;
    const d = drag.current;
    const r = wrap.current!.getBoundingClientRect();
    if (d && d.id === e.pointerId) {
      const dx = e.clientX - d.x;
      const dy = e.clientY - d.y;
      d.x = e.clientX;
      d.y = e.clientY;
      if (!d.moved && Math.abs(dx) + Math.abs(dy) > 2) {
        d.moved = true;
        setTouched(true);
      }
      s.dragBy(dx, dy, r.width);
    } else if (e.pointerType === 'mouse') {
      s.hover(((e.clientX - r.left) / r.width) * 2 - 1, ((e.clientY - r.top) / r.height) * 2 - 1);
    }
  };
  const up = (e: React.PointerEvent) => {
    if (drag.current?.id !== e.pointerId) return;
    drag.current = null;
    scene.current?.dragEnd();
  };

  const design = applied.includes('design');

  return (
    // Positioned by the caller (it must be `relative` or `absolute`): the overlays sit inside it.
    <div ref={wrap} className={className}>
      <canvas
        ref={still}
        aria-hidden
        className={`pointer-events-none absolute inset-0 h-full w-full transition-opacity duration-700 ${ready ? 'opacity-0' : 'opacity-100'}`}
      />
      <canvas
        ref={canvas}
        role="img"
        aria-label="A blank heather grey oversized mockneck sweatshirt. Drag to turn it around."
        className={`absolute inset-0 h-full w-full cursor-grab touch-pan-y select-none transition-opacity duration-700 active:cursor-grabbing ${
          ready ? 'opacity-100' : 'opacity-0'
        }`}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
        onPointerLeave={(e) => e.pointerType === 'mouse' && !drag.current && scene.current?.hover(0, 0)}
      />

      {/* Designer's markup on the board, around the garment rather than on it. */}
      {design && (
        <svg aria-hidden viewBox="0 0 100 100" preserveAspectRatio="none" className="note-in pointer-events-none absolute inset-0 h-full w-full">
          <line x1="50" y1="16" x2="50" y2="70" stroke="#5B74C9" strokeWidth="1" strokeDasharray="5 4" vectorEffect="non-scaling-stroke" />
          <line x1="29.7" y1="67.5" x2="70.3" y2="67.5" stroke="#5B74C9" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          <line x1="29.7" y1="66.1" x2="29.7" y2="68.9" stroke="#5B74C9" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          <line x1="70.3" y1="66.1" x2="70.3" y2="68.9" stroke="#5B74C9" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        </svg>
      )}
      {design && (
        <>
          <span className="note-in label pointer-events-none absolute left-1/2 top-[67.5%] -translate-x-1/2 -translate-y-1/2 bg-paper px-2 text-[10px] text-[#9FB2E0]">
            Body 24 in / boxy
          </span>
          <span className="note-in label pointer-events-none absolute left-[44%] top-[2%] rotate-[-4deg] border border-[#5B74C9] px-2 py-1 text-[10px] text-[#9FB2E0]">
            Rev / 02
          </span>
        </>
      )}

      {/* First-view instruction, gone after the first turn. */}
      <p
        aria-hidden
        className={`label pointer-events-none absolute bottom-[12%] left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] text-ash/45 transition-opacity duration-700 ${
          ready && !touched && !checkBack ? 'opacity-100' : 'opacity-0'
        }`}
      >
        Drag to inspect ↔
      </p>
      <p
        aria-live="polite"
        className={`label pointer-events-none absolute bottom-[12%] left-1/2 -translate-x-1/2 whitespace-nowrap text-[11px] text-[#9FB2E0] transition-opacity duration-500 ${
          checkBack ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {checkBack ? 'Check the back →' : ''}
      </p>
    </div>
  );
}
