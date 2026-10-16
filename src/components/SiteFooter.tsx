import Link from 'next/link';
import { CONTACT, NAV, NAV_CTA } from '@/lib/site';
import { Arrow } from '@/components/SiteHeader';
import { sentence } from '@/components/chrome/nav';
import { FRAME } from '@/components/frame';

const EXPLORE = [...NAV.filter((n) => n.href !== '/about'), { href: '/custom', label: 'Fully custom' }];
const COMPANY = [
  { href: '/about', label: 'About' },
  { href: '/about#stitched', label: 'Stitched Group' },
  { href: NAV_CTA.href, label: NAV_CTA.label },
];

const MAST = 'THREADS'.split('');

/**
 * The closing moment, on green-deep. The sign-off line and the light button;
 * a running stitch; the link columns with beige eyebrows; then the block
 * "THREADS" in cream, edge to edge, cropped by the bottom of the page like a
 * name across a chest cut by the hem. Its letters rise out of the hem as the
 * footer comes into view (scroll timeline; static elsewhere).
 */
export default function SiteFooter() {
  return (
    <footer className="band-green relative overflow-hidden bg-[#0D241B]" aria-labelledby="footer-title">
      <div className={FRAME}>
        {/* Sign-off */}
        <div className="grid-12 gap-y-10 pb-14 pt-20 sm:pt-24 lg:pb-20 lg:pt-32">
          <h2 id="footer-title" className="t-h1 col-span-4 sm:col-span-8 lg:col-span-8">
            Ready when your <em>members</em> are.
          </h2>
          <div className="col-span-4 flex flex-col items-start gap-8 sm:col-span-6 lg:col-span-4 lg:justify-end">
            <p className="t-body max-w-[34ch] text-cream/85">
              Tell us who it’s for and when you need it. A designer reads every request.
            </p>
            <Link href={NAV_CTA.href} className="btn-white">
              {NAV_CTA.label} <Arrow className="h-3.5 w-[18px]" />
            </Link>
          </div>
        </div>

        <span aria-hidden className="stitch-rule draw-in" />

        {/* Columns */}
        <div className="grid-12 gap-y-12 py-14 lg:py-20">
          <div className="col-span-4 sm:col-span-8 lg:col-span-5">
            <p className="t-h3 max-w-[22ch] text-cream">
              Custom apparel collections for clubs, companies, nonprofits, teams and associations.
            </p>
            <p className="t-spec mt-6 text-beige">From 36 pieces per style · Design included</p>
          </div>

          <Col title="Explore" className="col-span-2 lg:col-span-2 lg:col-start-7">
            {EXPLORE.map((l) => (
              <FooterLink key={l.href} href={l.href}>
                {sentence(l.label)}
              </FooterLink>
            ))}
          </Col>
          <Col title="Company" className="col-span-2 lg:col-span-2">
            {COMPANY.map((l) => (
              <FooterLink key={l.href} href={l.href}>
                {l.label === NAV_CTA.label ? sentence(l.label) : l.label}
              </FooterLink>
            ))}
          </Col>
          <Col title="Contact" className="col-span-4 sm:col-span-4 lg:col-span-2">
            <li>
              <a href={`mailto:${CONTACT.email}`} className="mt-foot-link break-all">
                <span>{CONTACT.email}</span>
              </a>
            </li>
          </Col>
        </div>

        {/* Legal + label */}
        <div className="flex flex-col-reverse items-start gap-5 border-t border-cream/15 py-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="t-spec fg-muted">© {new Date().getFullYear()} Member Threads. All rights reserved.</p>
          {/* [CONFIRM] "Est. 2023" as the brand's founding line (DESIGN.md). */}
          <span className="woven woven-beige">Est. 2023 · A Stitched Group company</span>
        </div>
      </div>

      {/* The mast. Decorative: the name is already on the page. */}
      <div aria-hidden className="mt-mast-wrap t-mast mt-8 select-none px-3 text-cream sm:px-5 lg:px-8" style={{ fontSize: 'clamp(3rem, 15vw, 24rem)' }}>
        <div className="mt-mast">
          {MAST.map((c, i) => (
            <span key={i} style={{ ['--i' as string]: i }}>
              {c}
            </span>
          ))}
        </div>
      </div>
    </footer>
  );
}

function Col({ title, className = '', children }: { title: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={className}>
      <h3 className="t-eyebrow text-beige">{title}</h3>
      <ul className="mt-4 sm:mt-5">{children}</ul>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="mt-foot-link">
        <span>{children}</span>
      </Link>
    </li>
  );
}
