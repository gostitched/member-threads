import Link from 'next/link';
import { CONTACT, NAV, NAV_CTA } from '@/lib/site';
import { Arrow, Wordmark } from '@/components/SiteHeader';
import { FRAME } from '@/components/frame';

const EXPLORE = [...NAV.filter((n) => n.href !== '/about'), { href: '/custom', label: 'Fully Custom' }];
const COMPANY = [
  { href: '/about', label: 'About' },
  { href: NAV_CTA.href, label: NAV_CTA.label },
];

/**
 * The closing brand moment: a full-bleed dusty-blue band, cream type, the
 * primary logo in cream (as on the brand board). A sign-off line with the one
 * pill, then the logo and a short line beside two link columns and contact,
 * then the legal line with the Stitched Group credit.
 */
export default function SiteFooter() {
  return (
    <footer className="relative bg-dusty text-cream">
      <div className={FRAME}>
        <div className="flex flex-col gap-8 border-b border-cream/15 pb-14 pt-20 sm:pt-24 lg:flex-row lg:items-end lg:justify-between lg:pb-16 lg:pt-28">
          <p className="caps text-d1 text-cream">
            <span className="lg:whitespace-nowrap">Better than merch.</span>
            <br />
            <span className="font-serif text-[1.08em] font-normal normal-case tracking-normal text-beige [font-stretch:100%]">
              made to be kept.
            </span>
          </p>
          <Link
            href={NAV_CTA.href}
            className="btn h-14 w-fit shrink-0 bg-cream px-8 text-[1rem] text-ink hover:bg-beige"
          >
            {NAV_CTA.label} <Arrow className="ml-1 h-3.5 w-[18px]" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-12 py-14 sm:grid-cols-3 lg:grid-cols-[minmax(0,1.6fr)_repeat(3,minmax(0,1fr))] lg:gap-10 lg:py-16">
          <div className="col-span-2 sm:col-span-3 lg:col-span-1">
            <Link href="/" className="inline-flex text-cream transition-colors hover:text-beige" aria-label="Member Threads, home">
              <Wordmark size="footer" />
            </Link>
            <p className="mt-7 max-w-[30ch] text-[0.9375rem] leading-relaxed text-cream/70">
              Custom apparel collections for clubs, companies, nonprofits, teams and associations.
            </p>
          </div>

          <Col title="Explore">
            {EXPLORE.map((l) => (
              <FooterLink key={l.href} href={l.href}>
                {l.label}
              </FooterLink>
            ))}
          </Col>
          <Col title="Company">
            {COMPANY.map((l) => (
              <FooterLink key={l.href} href={l.href}>
                {l.label}
              </FooterLink>
            ))}
          </Col>
          <Col title="Contact" className="col-span-2 sm:col-span-1">
            <li>
              <a
                href={`mailto:${CONTACT.email}`}
                className="inline-flex min-h-11 items-center text-[0.9375rem] text-cream/80 underline decoration-cream/30 underline-offset-[5px] transition-colors hover:text-cream hover:decoration-cream sm:min-h-0 sm:py-1"
              >
                {CONTACT.email}
              </a>
            </li>
            <li className="pt-1 text-[0.9375rem] leading-relaxed text-cream/60 sm:pt-2">From 36 pieces per style.</li>
          </Col>
        </div>

        <div className="flex flex-col gap-2 border-t border-cream/15 py-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="label text-cream/55">© {new Date().getFullYear()} Member Threads</p>
          <p className="label text-cream/55">A Stitched Group company</p>
        </div>
      </div>
    </footer>
  );
}

function Col({ title, className = '', children }: { title: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={className}>
      <p className="label text-beige">{title}</p>
      <ul className="mt-3 sm:mt-5 sm:space-y-1.5">{children}</ul>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link
        href={href}
        className="inline-flex min-h-11 items-center text-[0.9375rem] text-cream/80 transition-colors hover:text-cream sm:min-h-0 sm:py-1"
      >
        {children}
      </Link>
    </li>
  );
}
