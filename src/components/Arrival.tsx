'use client';

import { useLayoutEffect } from 'react';

/**
 * Landing on `/#<id>` from another page: instead of loading at the top and smooth-
 * scrolling the whole home page past the reader, jump straight to the section and
 * play its entrance (`[data-arrive]` in globals.css): the heading rises, the stitch
 * rules sew in, the steps follow. Runs before paint and before the router's own hash
 * scroll, which then lands on the same spot instantly.
 */
export default function Arrival({ id }: { id: string }) {
  useLayoutEffect(() => {
    if (window.location.hash !== `#${id}`) return;
    const section = document.getElementById(id);
    if (!section) return;
    const html = document.documentElement;
    html.style.scrollBehavior = 'auto';
    section.scrollIntoView({ block: 'start' });
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) section.dataset.arrive = '';
    // Hand smooth scrolling back once the router has made its own (now instant) jump.
    const raf = requestAnimationFrame(() => requestAnimationFrame(() => html.style.removeProperty('scroll-behavior')));
    const done = window.setTimeout(() => delete section.dataset.arrive, 1800);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(done);
      html.style.removeProperty('scroll-behavior');
    };
  }, [id]);
  return null;
}
