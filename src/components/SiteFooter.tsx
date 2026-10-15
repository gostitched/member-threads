import Link from 'next/link';
import { CONTACT } from '@/lib/site';
import { Wordmark } from '@/components/SiteHeader';

/**
 * Paper footer under a top rule: stacked wordmark and email, two short link
 * columns, the legal line.
 */
export default function SiteFooter() {
  return (
    <footer className="relative border-t border-rule bg-paper text-ink">
      <div className="shell">
        <div className="grid gap-10 pb-10 pt-14 sm:grid-cols-[2fr_1fr_1fr] sm:pt-16">
          <div>
            <Link href="/" className="inline-flex" aria-label="Member Threads, home">
              <Wordmark size="footer" />
            </Link>
            <a
              href={`mailto:${CONTACT.email}`}
              className="mt-6 block w-fit font-sans text-[1.125rem] font-medium text-ink transition-colors hover:text-uv"
            >
              {CONTACT.email}
            </a>
          </div>
          <Col title="Explore">
            <FooterLink href="/#how">How It Works</FooterLink>
            <FooterLink href="/catalog">The Goods</FooterLink>
            <FooterLink href="/work">Get Inspired</FooterLink>
          </Col>
          <Col title="Studio">
            <FooterLink href="/about">About</FooterLink>
            <FooterLink href="/custom">Fully custom</FooterLink>
            <FooterLink href="/quote">Start Creating</FooterLink>
          </Col>
        </div>

        <p className="border-t border-rule py-5 text-[0.8125rem] text-muted">
          © {new Date().getFullYear()} Member Threads · A Stitched brand · Jewish owned
        </p>
      </div>
    </footer>
  );
}

function Col({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[0.8125rem] font-medium text-ink">{title}</p>
      <ul className="mt-2 sm:mt-3 sm:space-y-1">{children}</ul>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="inline-flex min-h-11 items-center text-[0.9375rem] text-muted transition-colors hover:text-ink sm:min-h-0 sm:py-1">
        {children}
      </Link>
    </li>
  );
}
