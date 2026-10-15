/**
 * Moving one box onto another without distorting what's in it.
 *
 * A plain FLIP scales x and y separately, which squashes a photo whenever the two
 * boxes have different proportions. Instead the element is scaled uniformly (enough
 * to cover the source box) and clipped back to the source's proportions, so the
 * picture only ever re-crops as it travels.
 */

export const EASE_OUT = 'cubic-bezier(0.16, 1, 0.3, 1)';
export const EASE_IN = 'cubic-bezier(0.55, 0, 0.75, 0.2)';

/** Keyframe that makes `el` (laid out at `dst`) look like it sits at `src`. */
export function fromFrame(src: DOMRect, dst: DOMRect): Keyframe {
  const s = Math.max(src.width / dst.width, src.height / dst.height) || 1;
  const cx = Math.max(0, (dst.width - src.width / s) / 2);
  const cy = Math.max(0, (dst.height - src.height / s) / 2);
  const dx = src.left + src.width / 2 - (dst.left + dst.width / 2);
  const dy = src.top + src.height / 2 - (dst.top + dst.height / 2);
  return { transform: `translate(${dx}px, ${dy}px) scale(${s})`, clipPath: `inset(${cy}px ${cx}px)` };
}

export const REST: Keyframe = { transform: 'translate(0px, 0px) scale(1)', clipPath: 'inset(0px 0px)' };

export function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Rects of every `[attr]` element under `root`, keyed by the attribute's value. */
export function rectsBy(root: Element | null, attr: string) {
  const out = new Map<string, DOMRect>();
  root?.querySelectorAll<HTMLElement>(`[${attr}]`).forEach((el) => out.set(el.getAttribute(attr)!, el.getBoundingClientRect()));
  return out;
}
