'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CONTACT, NAV, NAV_CTA } from '@/lib/site';
import { FRAME } from '@/components/frame';


function isActive(pathname: string, href: string) {
  if (href.startsWith('/#')) return false;
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Paper header, sticky. A hairline appears once you scroll. Logo left, four
 * tracked caps links centred (md+), the one green pill right. Heights stay
 * 72 / 84 / 92px: the home hero sizes itself against them.
 * Mobile: a full-height paper sheet with an indexed link list, the pill and
 * the contact line.
 */
export default function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  // Close the menu on navigation.
  useEffect(() => setOpen(false), [pathname]);

  return (
    <header
      className={`sticky top-0 z-50 bg-paper text-ink transition-shadow duration-300 ${
        scrolled || open ? 'shadow-[inset_0_-1px_0_theme(colors.rule)]' : ''
      }`}
    >
      <div className={`${FRAME} grid h-[72px] grid-cols-[1fr_auto] items-center gap-6 sm:h-[84px] md:grid-cols-[1fr_auto_1fr] lg:h-[92px]`}>
        <Link
          href="/"
          className="-my-1 flex min-h-11 items-center justify-self-start text-ink transition-colors duration-300 hover:text-dusty"
          onClick={() => setOpen(false)}
          aria-label="Member Threads, home"
        >
          <Wordmark />
        </Link>

        <nav className="hidden items-center gap-9 md:flex lg:gap-14" aria-label="Main">
          {NAV.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={`group relative whitespace-nowrap py-2 font-sans text-[0.8125rem] font-semibold uppercase tracking-[0.14em] transition-colors duration-200 hover:text-dusty ${
                  active ? 'text-ink' : 'text-ink/80'
                }`}
              >
                {item.label}
                <span
                  aria-hidden
                  className={`absolute -bottom-0.5 left-0 h-px w-full origin-left bg-current transition-transform duration-300 ease-out ${
                    active ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                  }`}
                />
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 justify-self-end">
          <Link
            href={NAV_CTA.href}
            className="btn-blue hidden h-11 min-h-0 whitespace-nowrap px-6 text-[0.9375rem] sm:inline-flex lg:h-12 lg:px-7"
          >
            {NAV_CTA.label} <Arrow className="ml-1 h-3.5 w-[18px]" />
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
            className="-mr-2.5 flex h-11 w-11 items-center justify-center md:hidden"
          >
            <span className="relative block h-3 w-7">
              <span className={`absolute left-0 block h-[1.5px] w-7 bg-current transition-transform duration-300 ease-out ${open ? 'top-1.5 rotate-45' : 'top-0'}`} />
              <span className={`absolute left-0 block h-[1.5px] w-7 bg-current transition-transform duration-300 ease-out ${open ? 'top-1.5 -rotate-45' : 'top-3'}`} />
            </span>
          </button>
        </div>
      </div>

      {open && (
        <div
          id="mobile-menu"
          className="fixed inset-x-0 bottom-0 top-[72px] z-40 flex flex-col overflow-y-auto bg-paper text-ink sm:top-[84px] md:hidden"
        >
          <nav className={`${FRAME} flex flex-1 flex-col pb-8 pt-4`} aria-label="Main">
            <ul className="border-t border-rule">
              {NAV.map((item, i) => {
                const active = isActive(pathname, item.href);
                return (
                  <li key={item.href} className="rise border-b border-rule" style={{ animationDelay: `${40 + i * 50}ms` }}>
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      aria-current={active ? 'page' : undefined}
                      className="flex items-baseline gap-4 py-5"
                    >
                      <span className="label w-6 text-ink/45">{String(i + 1).padStart(2, '0')}</span>
                      <span className={`caps text-[1.75rem] leading-none ${active ? 'text-dusty' : ''}`}>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
            <Link
              href={NAV_CTA.href}
              onClick={() => setOpen(false)}
              className="rise btn-blue mt-8 h-14 w-full text-[1rem]"
              style={{ animationDelay: '260ms' }}
            >
              {NAV_CTA.label} <Arrow className="ml-1 h-3.5 w-[18px]" />
            </Link>
            <div className="mt-auto flex flex-col gap-2 pt-12">
              <a href={`mailto:${CONTACT.email}`} className="text-[0.9375rem] font-medium text-ink underline-offset-4 hover:underline">
                {CONTACT.email}
              </a>
              <p className="label text-ink/50">A Stitched Group company</p>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

/** The thin, long arrow every pill ends with. */
export function Arrow({ className = 'h-4 w-5' }: { className?: string }) {
  return (
    <svg aria-hidden focusable="false" viewBox="0 0 24 18" className={`shrink-0 ${className}`} fill="none">
      <path d="M1.5 9h20M14 1.75 21.5 9 14 16.25" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const WORDMARK_SIZES = {
  header: 'h-12 sm:h-[56px] lg:h-[62px]',
  footer: 'h-20 sm:h-24 lg:h-28',
} as const;

/**
 * The primary logo, script "Member" over block "THREADS". Inlined from
 * `public/mt-logo.svg` (path data unchanged) so it takes `currentColor`:
 * green on paper in the header, cream on dusty blue in the footer, per the
 * brand board. The surrounding link carries the name; the drawing is decorative.
 */
export function Wordmark({ size = 'header', className = '' }: { size?: keyof typeof WORDMARK_SIZES; className?: string }) {
  return (
    <svg
      aria-hidden
      focusable="false"
      viewBox="0 0 351.66 143.7"
      className={`block w-auto shrink-0 ${WORDMARK_SIZES[size]} ${className}`}
      fill="currentColor"
    >
      {LOGO_PATHS.map((d, i) => (
        <path key={i} d={d} />
      ))}
      {LOGO_POLYGONS.map((p, i) => (
        <polygon key={`p${i}`} points={p} />
      ))}
    </svg>
  );
}

/** Path data copied verbatim from public/mt-logo.svg (viewBox 0 0 351.66 143.7). */
const LOGO_PATHS = [
  'M134.46,86.13c-7.32,8.48-22.13,19.47-29.23,11.71-1.77-1.94-2.53-5.28-1.76-8.33,1.94-7.7,4.89-14.77,8.67-21.84l15.5-28.99c-11.6,12.53-21.07,25.35-31,38.5-2.94,3.9-5.71,7.67-9.64,10.45-2.66,1.88-7.17,2.15-9.46-.14-5.38-5.38,3.37-28.63,5.42-39.38-5.73,8.93-9.95,17.49-14.59,26.55l-22.89,44.66c-2.99,5.84-5.97,11.25-9.85,16.41-2.52,3.35-6.98,5.5-10.98,4.66-1.81-.38-3.7-1.79-4.3-2.96-.87-1.69-.34-4.35.6-5.93l11.74-19.48,27.5-48.04,22.47-37.26c-13.25,1.94-28.47,14.14-38.09,22.86-6.71,6.09-12.34,12.88-17.39,20.39-3.84,5.69-9.46,16.01-6.09,19.45,3.59,3.66,12.98-4.85,17.67-11.59.54-.77,1.9-1.62,2.8-1.29-.13,11.34-12.12,23.13-22.41,28.06-4.35,2.08-9.05,1.73-13.17-.64C2.44,101.89.06,97.37,0,92.52c-.09-7.7,2.98-14.71,7.37-21.04,13.72-19.82,34.43-37.52,56.08-48.1,10.56-5.16,26.74-10.37,36.73-5.56,2.24,1.08,4.14,3.88,3.52,6.55l-8.27,35.46c8.24-10.98,16.47-20.91,25.69-30.63,2.96-3.12,5.75-6.03,8.93-8.84,2.14-1.89,4-4.12,6.4-5.82,2.65-1.88,12.45-2.13,14.86,2.61,1.03,2.02,1.15,5.3-.06,7.4l-19.19,33.23c-4.43,8.3-8.5,16.27-11.65,25.09l.33,3.09c.26,2.44,9.55-2.56,13.78-7.49,2.44-11.49,9.01-21.3,19.15-27.08,7.8-4.44,16.67-3.26,18,2.25,2.64,10.92-12.26,22.04-23.71,24.31-.79,1.65-.99,4.6.16,6.04,2.6,3.22,12.04-3.56,16.72-8.13,12.68-12.36,14.97-22.59,19.41-26.95,2.29-2.25,9.1-3.51,10.46-2.03.35.38.3,1.85.07,2.34l-3.74,7.7c4.97-4.42,8.6-8.89,14.28-11.86,2.09-1.09,5.63-1.72,7.17.03,2.18,2.46.05,5.14-.64,8.27l9.62-9.32c1.32-1.28,4.45-2.52,6.14-2.31,3.17.4,4.17,4.03,2.96,6.71-3.39,7.52-7.41,14.54-10.02,23.01,4.51-2.1,8.09-6.05,9.92-10.29,7.84-18.06,16.13-36.55,28.04-51.97,4.85-6.27,12.8-11.97,17.51-7.64,1.29,1.19,2.21,4.17,1.63,6.21-4.74,16.67-19.98,31.65-31.83,44.82-4.77,5.3-8.22,17.14-5.86,19.3,2.27,2.09,9.12-5.64,11.66-11.01-5.46-5.96-.66-15.59,6.69-18.98,1.41-.65,3.93-.58,5.01.26,3.99,3.08,1.48,10.49-.69,16.35l4.12-1.38c4.04-10.97,14.03-22.68,25.53-22.18,2.41.11,5.14,1.64,5.93,3.77,3.43,9.26-9.94,20.74-20.86,22.25-.45.9-.82,2.75-.82,3.76s1.61,2.71,2.74,2.66c9.88-.46,21.32-15.42,26.71-24.56-4.86-3.96-2.63-12.34,2.82-15.67,2.18-1.33,5.78-1.9,7.61.16,1.85,2.09.65,4.61-.43,8.09l10.23-2.6c1.24-.31,3.73.4,4.56,1.21.94.92,1.3,3.93.47,5.11l-6.63,9.39c-3.81,5.39-10.2,17.5-7.57,19.97,2.1,1.98,9.87-4.34,14.02-8.16,7.5-6.9,13.47-14.71,19.85-23.01,1.29,2.53.72,4.98-.28,7.28-5.95,13.63-26.53,39.69-40.56,37.29-4.34-.74-7.26-3.7-7.22-8.22.05-5.33,1.42-10.72,4.32-15.2l9.49-14.65-5.34.36c-5.05,7.83-9.99,15.01-16.18,21.72-7.34,7.96-20.05,14.72-27.03,8.19-2.98-2.79-3.46-6.37-3-10.95l-5.71,1.02c-2.83,4.48-5.62,8.67-9.52,11.95-5.97,5.03-14.4,8.62-19.27,3.74-1.75-1.76-2.16-4.11-2.31-7.08-4.78,5.2-11.75,13.43-17.27,9.84-5.81-3.78,1.97-17.6,5.07-25.07-4.97,3.79-8.59,8.11-11.25,13.25l-6.23,12.05c-1.53,2.96-4.2,5.15-7.66,4.64-8.89-1.3,3.37-19.06,6.56-28.11-6.56,4.98-11.65,10.87-15.42,17.83l-5.42,10c-1.7,3.14-7.72,5.16-9.94,2.12-1.76-3.46,1.97-6.74,2.77-10.61-6.79,6.86-14.66,16.54-25.38,16.1-5.08-.21-8.77-3.22-9.66-8.66ZM265.89,18.68c.73-1.27,1.03-3.07.7-4.53-7.18,7.44-12.04,16.42-16.27,26.12,6.33-6.51,11.03-13.64,15.57-21.59ZM279.06,54.77c4.37-1.3,6.69-3.34,9.44-5.93,1.05-1.64,2.2-4.1,2.06-5.88-4.17-1.72-9.59,6.54-11.51,11.81ZM162.66,57.15l-3.14.49c-4.65,3.85-7.93,8.14-9.48,13.92,6.63-2.76,14.04-8.5,12.62-14.41Z',
  'M286.17,126.26c-.01,3.77-2.05,7.5-4.8,9.34-3.7,2.47-7.91,2.5-12.12,2.42l-17.83-.34-.05-49c7.5-.28,14.81-.58,22.14-.12,7.56.47,12.28,6.38,12.73,13.58l-.07,24.13ZM271.18,123.67l.15-18.4c0-1.08-1.09-2.9-2-3.24-.85-.32-2.78-.12-3.64.35l.08,22.76c1.63.72,5.4.11,5.42-1.46Z',
  'M325.01,130.5c-1.78,11.35-14.83,11.04-25.83,8.56-4.84-1.09-9.16-5.01-9.36-9.99l-.29-6.9,14.48,1.27c.25,1.81.46,3,.93,3.93.42.83,2.58,1.17,3.58.74.66-.29,1.42-2.07,1.27-2.78-.18-.82-1.27-2.32-2.09-2.63l-9.33-3.48c-6.74-2.52-9.38-8.13-8.96-15.08.3-5.05,1.33-10.23,6.46-12.63,6.24-2.91,19.3-1.11,24.22,3.41,4.03,3.7,5.06,9.32,4.01,14.38l-14.41-1.79c.17-2.12-.19-3.92-1.13-4.44-1.41-.77-3.34-.27-3.92.88-.48.96.05,3.69,1.08,4.1l12.24,4.93c6.61,2.66,8.22,10.07,7.06,17.51Z',
  'M231.35,131.58l-8.1.22-1.15,7.13-15.4,1.19,10.17-46.94,21.61-3.31,10.04,47.84-16.11.66-1.07-6.8ZM229.7,119.77l-2.18-13.95-2.5,14.19,4.68-.24Z',
  'M170.55,142.72l-15.2.73-.26-8.8c-.03-1.06-.29-2.97-1.11-3.36s-3.02-.36-4.12-.19l-.03,12.31-14.48.3.04-40.57,11.39-.99,13.45-1.17c3.58-.31,7.6,1.82,9.06,5.08,1.43,3.21,1.34,7.09.93,10.47-.44,3.63-2.25,5.75-5.83,7.84,8.23,2.17,4.33,9.36,6.15,18.35ZM154.85,119.48c1.01-1.61.89-4.41.05-5.78-.81-1.32-3.9-1.27-4.95-.36l-.08,7.32c1.34.14,4.3-.09,4.98-1.17Z',
  'M201.44,123.16l-13.3,1.79c-.22,1.18-.22,2.93-.06,4.4l16.01-1.65.08,12.6-30.68,2.48.06-43.3,30.9-4.47.21,12.42-16.46,2.42-.04,4.11,13.36-1.77-.07,10.94Z',
];
const LOGO_POLYGONS = [
  '132.01 143.69 117.05 143.44 117.18 135.93 117.26 129.85 111 129.58 110.96 143.44 96.51 142.97 96.66 102.78 111.24 103.28 110.91 117.52 117.06 117.63 117.35 103.55 131.99 103.21 131.97 117.92 132.01 143.69',
  '83.72 143.05 69.23 143.15 69.27 114.03 60.53 113.19 60.48 98.83 93.12 102.49 93.14 115.72 83.9 115.09 83.72 143.05',
];
