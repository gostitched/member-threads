import type { Metadata } from 'next';
import { Rubik, Jost, DM_Mono, Instrument_Serif } from 'next/font/google';
import './globals.css';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import { SITE_URL } from '@/lib/site';

/** Display: chunky caps headlines, the wordmark, numerals. */
const display = Rubik({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['700', '900'],
  display: 'swap',
});

/** Body copy, navigation, buttons. */
const sans = Jost({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['400', '500', '600'],
  display: 'swap',
});

/** Labels: the studio / tech-pack voice. */
const mono = DM_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '500'],
  display: 'swap',
});

/** Used sparingly, in italic, as the one soft note against the heavy caps. */
const serif = Instrument_Serif({
  subsets: ['latin'],
  variable: '--font-serif',
  weight: '400',
  style: ['normal', 'italic'],
  display: 'swap',
});

const TITLE = 'Member Threads | Custom Bar & Bat Mitzvah Apparel Collections';
const DESCRIPTION =
  'Fully custom, fashion-quality apparel collections for Bar and Bat Mitzvahs. Designed around your kid, their colors and their weekend, then made from scratch.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: TITLE, template: '%s | Member Threads' },
  description: DESCRIPTION,
  openGraph: {
    title: { default: TITLE, template: '%s | Member Threads' },
    description: 'Their biggest day. Made to be worn long after. Custom Mitzvah collections, designed and made from scratch.',
    url: SITE_URL,
    siteName: 'Member Threads',
    type: 'website',
  },
  icons: { icon: '/favicon.svg?v=2', apple: '/favicon.svg?v=2' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable} ${mono.variable} ${serif.variable}`}>
      <body className="min-h-screen antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-ink focus:px-5 focus:py-2 focus:text-paper"
        >
          Skip to content
        </a>
        <SiteHeader />
        <main id="main">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
