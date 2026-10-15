/**
 * Shared scheduler for scroll-reveal elements.
 *
 * Deliberately not an IntersectionObserver. An observer only fires when
 * intersection actually changes, so an element scrolled *past* faster than the
 * callback can run — a jump to the bottom, the End key, an anchor jump — never
 * fires again once it sits above the viewport, and stays invisible for good.
 * Checking positions on a rAF-throttled scroll pass cannot miss: anything at or
 * above the fold reveals, however the reader got there.
 *
 * One listener pair serves every element, and both are torn down once the last
 * element has revealed.
 */
type Item = { el: HTMLElement; show: () => void };

const items = new Set<Item>();
let scheduled = false;
let listening = false;

/** Reveal once the top edge crosses into the bottom 12% of the viewport. */
const THRESHOLD = 0.88;

function flush() {
  scheduled = false;
  const limit = window.innerHeight * THRESHOLD;
  for (const item of Array.from(items)) {
    if (item.el.getBoundingClientRect().top < limit) {
      items.delete(item);
      item.show();
    }
  }
  if (items.size === 0) teardown();
}

function schedule() {
  if (scheduled) return;
  scheduled = true;
  requestAnimationFrame(flush);
}

function teardown() {
  if (!listening) return;
  listening = false;
  window.removeEventListener('scroll', schedule);
  window.removeEventListener('resize', schedule);
}

export function register(item: Item): () => void {
  items.add(item);
  if (!listening) {
    listening = true;
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
  }
  schedule();
  return () => {
    items.delete(item);
    if (items.size === 0) teardown();
  };
}
