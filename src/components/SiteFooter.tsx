import Link from 'next/link';
import { CONTACT, NAV, NAV_CTA } from '@/lib/site';
import { Wordmark } from '@/components/SiteHeader';
import { sentence } from '@/components/chrome/nav';
import { FRAME } from '@/components/frame';
import '@/components/chrome/chrome.css';

/** The group's Instagram accounts, listed in every brand's footer. */
const INSTAGRAMS = ['shopaltaratelier', 'themitzvahstudio', 'gostitched', 'celebrationcollectiveco', 'memberthreads'];

/**
 * Paper footer under a top rule: the wordmark and the email, two short link
 * columns, the legal line.
 */
export default function SiteFooter() {
  return (
    <footer className="relative overflow-hidden border-t border-rule bg-paper text-ink">
      <div className={FRAME}>
        <div className="grid gap-10 pb-10 pt-14 sm:grid-cols-[2fr_1fr_1fr] sm:pt-16">
          <div>
            <Link href="/" className="inline-flex" aria-label="Member Threads, home">
              <Wordmark size="footer" />
            </Link>
            <a href={`mailto:${CONTACT.email}`} className="mt-6 flex min-h-11 w-fit items-center text-[1.0625rem] font-medium text-ink">
              <span className="link-u">{CONTACT.email}</span>
            </a>
          </div>
          <Col title="Explore">
            {NAV.map((l) => (
              <FooterLink key={l.href} href={l.href}>
                {sentence(l.label)}
              </FooterLink>
            ))}
          </Col>
          <Col title="Company">
            <FooterLink href="/about">About</FooterLink>
            <FooterLink href="/custom">Fully custom</FooterLink>
            <FooterLink href={NAV_CTA.href}>{NAV_CTA.label}</FooterLink>
          </Col>
        </div>

        <div className="pb-10">
          <h2 className="font-sans text-[0.875rem] font-semibold tracking-normal text-ink">Instagram</h2>
          <ul className="mt-2 flex flex-wrap gap-x-6 sm:mt-3">
            {INSTAGRAMS.map((h) => (
              <li key={h}>
                <a href={`https://www.instagram.com/${h}/`} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center text-[0.9375rem] text-ink/85 transition-colors duration-quick hover:text-ink sm:min-h-9">
                  <span className="link-u">@{h}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>

        <p className="t-spec fg-muted border-t border-rule py-5">
          © {new Date().getFullYear()} Member Threads · <a href="https://gostitched.com" className="underline decoration-current/30 underline-offset-4 transition-colors hover:text-ink hover:decoration-current">A Stitched Group company</a>
        </p>
      </div>

    </footer>
  );
}

function Col({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="font-sans text-[0.875rem] font-semibold tracking-normal text-ink">{title}</h2>
      <ul className="mt-2 sm:mt-3">{children}</ul>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="inline-flex min-h-11 items-center text-[0.9375rem] text-ink/85 transition-colors duration-quick hover:text-ink sm:min-h-9">
        <span className="link-u">{children}</span>
      </Link>
    </li>
  );
}
