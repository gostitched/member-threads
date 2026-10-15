import type { Metadata } from 'next';
import Link from 'next/link';
import { Arrow } from '@/components/SiteHeader';
import { FRAME } from '@/components/frame';

export const metadata: Metadata = {
  title: 'Page not found',
};

const LINKS = [
  { href: '/catalog', label: 'Browse the Catalog' },
  { href: '/work', label: 'See Collections' },
  { href: '/about', label: 'About Member Threads' },
] as const;

/** Branded 404: the same title treatment as the secondary pages, three ways back, the one pill. */
export default function NotFound() {
  return (
    <section className="bg-paper text-ink">
      <div className={`${FRAME} grid gap-14 pb-24 pt-14 sm:pt-20 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:items-end lg:gap-16 lg:pb-32 lg:pt-28`}>
        <div>
          <p className="rise label text-ink/55">Error 404</p>
          <h1 className="caps mt-6 text-[clamp(2.75rem,7.6vw,7.25rem)] leading-[0.92] tracking-[-0.035em]">
            <span className="rise block" style={{ animationDelay: '60ms' }}>
              Not in the
            </span>
            <span
              className="rise block font-serif text-[1.02em] font-normal normal-case leading-[1.05] tracking-normal text-dusty [font-stretch:100%]"
              style={{ animationDelay: '160ms' }}
            >
              collection.
            </span>
          </h1>
          <p className="rise mt-10 max-w-[34rem] text-lead text-ink/75" style={{ animationDelay: '260ms' }}>
            The page you’re looking for has moved or doesn’t exist. Here are a few places to pick up from.
          </p>
          <div className="rise mt-10 flex flex-wrap gap-3" style={{ animationDelay: '320ms' }}>
            <Link href="/" className="btn-blue px-7">
              Back to home <Arrow className="ml-1 h-3.5 w-[18px]" />
            </Link>
            <Link href="/quote" className="btn-outline px-7">
              Start a Collection
            </Link>
          </div>
        </div>

        <ul className="border-t border-ink/15">
          {LINKS.map((l) => (
            <li key={l.href} className="border-b border-ink/15">
              <Link
                href={l.href}
                className="group flex items-center justify-between py-5 text-[1rem] font-medium transition-colors hover:text-dusty"
              >
                {l.label}
                <Arrow className="h-3.5 w-[18px] transition-transform duration-300 ease-out group-hover:translate-x-1" />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
