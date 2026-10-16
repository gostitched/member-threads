import type { Metadata } from 'next';
import Link from 'next/link';
import { Arrow } from '@/components/SiteHeader';
import { FRAME } from '@/components/frame';
import '@/components/chrome/chrome.css';

export const metadata: Metadata = {
  title: 'Page not found',
};

const ROSTER = [
  { href: '/', label: 'Home', note: 'Start at the front' },
  { href: '/catalog', label: 'The catalog', note: 'Styles to start from' },
  { href: '/work', label: 'Collections', note: 'The members’ wall' },
  { href: '/quote', label: 'Start a collection', note: 'Tell us who it’s for' },
] as const;

/**
 * 404: the block "404" cut off by the right edge of the screen with a woven
 * "Not issued" label across it, the serif line, and the pages that are on the
 * roster, numbered.
 */
export default function NotFound() {
  return (
    <section className="band-paper relative overflow-hidden pb-24 lg:pb-32">
      <div className={`${FRAME} relative pt-8 sm:pt-12`}>
        <div className="relative">
          <p aria-hidden className="mt-404 t-mast enter -ml-[0.04em] select-none whitespace-nowrap text-ink">
            404
          </p>
          <span
            className="woven woven-beige woven-lg absolute bottom-[12%] left-[10%] rotate-[-4deg] sm:left-[16%]"
          >
            No. 404 · Not issued
          </span>
        </div>

        <div className="grid-12 mt-14 gap-y-12 lg:mt-20">
          <div className="col-span-4 sm:col-span-8 lg:col-span-5">
            <p className="t-eyebrow fg-muted">Error 404</p>
            <h1 className="t-h1 mt-5">
              This page isn’t on the <em>roster</em>.
            </h1>
            <p className="t-lead mt-6 max-w-[30ch]">Whatever was here has moved, or was never issued. These pages are.</p>
          </div>

          <nav aria-label="Pages on the roster" className="col-span-4 sm:col-span-8 lg:col-span-6 lg:col-start-7">
            <ol>
              {ROSTER.map((r, i) => (
                <li key={r.href}>
                  <span aria-hidden className="stitch-rule" />
                  <Link href={r.href} className="mt-menu-link group flex min-h-[72px] items-center gap-5 py-4">
                    <span className="t-spec w-6 shrink-0 fg-muted">{String(i + 1).padStart(2, '0')}</span>
                    <span className="mt-menu-name flex min-w-0 flex-1 flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
                      <span className="t-h2">{r.label}</span>
                      <span className="t-spec fg-muted">{r.note}</span>
                    </span>
                    <Arrow className="h-3.5 w-[18px] transition-transform duration-base ease-out group-hover:translate-x-1" />
                  </Link>
                </li>
              ))}
            </ol>
            <span aria-hidden className="stitch-rule" />
          </nav>
        </div>
      </div>
    </section>
  );
}
