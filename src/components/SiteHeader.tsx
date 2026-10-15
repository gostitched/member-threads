'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { NAV, NAV_CTA } from '@/lib/site';

/**
 * Always on paper: a hairline appears once you scroll, never transparent.
 * Stacked wordmark left, three links centred (md+), one navy pill right.
 * Mobile: a paper menu with navy caps links and the same pill.
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
      <div className="mx-auto grid h-[72px] w-full max-w-[1536px] grid-cols-[1fr_auto] items-center gap-6 px-5 sm:h-[84px] sm:px-8 md:grid-cols-[1fr_auto_1fr] lg:h-[92px] lg:px-14">
        <Link
          href="/"
          className="flex min-h-11 items-center justify-self-start"
          onClick={() => setOpen(false)}
          aria-label="The Mitzvah Studio, home"
        >
          <Wordmark />
        </Link>

        <nav className="hidden items-center gap-10 md:flex lg:gap-12" aria-label="Main">
          {NAV.map((item) => {
            const active = item.href.startsWith('/#') ? false : pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className="group relative whitespace-nowrap py-2 font-sans text-[1.0625rem] font-medium tracking-[-0.005em] text-ink transition-colors hover:text-blue"
              >
                {item.label}
                <span
                  aria-hidden
                  className={`absolute bottom-0.5 left-0 h-[2px] w-full origin-left rounded-full bg-electric transition-transform duration-300 ease-out ${
                    active ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                  }`}
                />
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 justify-self-end">
          <Link href={NAV_CTA.href} className="btn-blue hidden h-11 min-h-0 whitespace-nowrap px-5 text-[1rem] sm:inline-flex lg:h-12 lg:px-7 lg:text-[1.0625rem]">
            {NAV_CTA.label} <Arrow className="ml-1 h-4 w-5" />
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
            className="-mr-2 flex h-11 w-11 items-center justify-center md:hidden"
          >
            <span className="relative block h-3 w-6">
              <span className={`absolute left-0 block h-[2px] w-6 rounded-full bg-current transition-transform duration-300 ease-out ${open ? 'top-1.5 rotate-45' : 'top-0'}`} />
              <span className={`absolute left-0 block h-[2px] w-6 rounded-full bg-current transition-transform duration-300 ease-out ${open ? 'top-1.5 -rotate-45' : 'top-3'}`} />
            </span>
          </button>
        </div>
      </div>

      {open && (
        <div
          id="mobile-menu"
          className="fixed inset-x-0 bottom-0 top-[72px] z-40 flex flex-col overflow-y-auto bg-paper text-ink sm:top-[84px] md:hidden"
        >
          <nav className="shell flex flex-1 flex-col pt-6" aria-label="Main">
            {NAV.map((item, i) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rise border-b border-rule py-4"
                style={{ animationDelay: `${40 + i * 50}ms` }}
              >
                <span className="caps text-[2.25rem] leading-none tracking-[-0.03em]">{item.label}</span>
              </Link>
            ))}
            <Link href={NAV_CTA.href} onClick={() => setOpen(false)} className="btn-blue mt-8 h-14 w-full text-[1.0625rem]">
              {NAV_CTA.label} <Arrow className="ml-1 h-4 w-5" />
            </Link>
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

/**
 * The primary logo (`public/tms-logo.svg`, the brand file as supplied). The
 * link around it carries the name, so the image itself is decorative.
 */
export function Wordmark({ size = 'header' }: { size?: 'header' | 'footer' }) {
  const h = size === 'header' ? 'h-11 sm:h-[52px] lg:h-14' : 'h-16 sm:h-20';
  // eslint-disable-next-line @next/next/no-img-element -- a static SVG; next/image adds nothing here
  return <img src="/tms-logo.svg" alt="" width={460} height={180} className={`block w-auto ${h}`} />;
}
