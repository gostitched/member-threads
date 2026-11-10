import type { Metadata } from 'next';
import { Archivo, Big_Shoulders, Hanken_Grotesk, Newsreader, Yellowtail, DM_Mono } from 'next/font/google';
import './globals.css';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import { SITE_URL } from '@/lib/site';

/**
 * Type system (see DESIGN.md, "Type"). Three voices, like a club's printed matter:
 *
 * - Newsreader (OFL): the voice. Headlines, leads, pull quotes. The optical-size
 *   axis keeps it crisp at 120px and readable at 20px. Italic is the emphasis.
 * - Archivo (OFL): the uniform. At 900 and full width it is the block "THREADS"
 *   caps of the logo (`.t-mast`, `.caps`, numerals). Display only.
 * - Hanken Grotesk (OFL): the sans at text sizes. Body, captions, filters, labels
 *   and spec lines (`--font-sans`, `--font-mono`).
 * - Big Shoulders (OFL; the Text cut, via its optical-size axis): the varsity. Tall condensed caps for the short UI
 *   lines: nav, buttons, labels, chips, the promises. Never for sentences.
 * - Yellowtail (OFL): the script, standing in for Billion Dreams. Rare.
 */
const archivo = Archivo({
  subsets: ['latin'],
  variable: '--font-archivo',
  axes: ['wdth'],
  display: 'swap',
});

/** Hanken Grotesk: the sans at text sizes (body, UI, captions, labels). */
const hanken = Hanken_Grotesk({
  subsets: ['latin'],
  variable: '--font-hanken',
  display: 'swap',
});

const varsity = Big_Shoulders({
  subsets: ['latin'],
  variable: '--font-varsity',
  axes: ['opsz'],
  display: 'swap',
});

const newsreader = Newsreader({
  subsets: ['latin'],
  variable: '--font-newsreader',
  style: ['normal', 'italic'],
  axes: ['opsz'],
  display: 'swap',
});

const script = Yellowtail({
  subsets: ['latin'],
  variable: '--font-script',
  weight: '400',
  display: 'swap',
});

const TITLE = 'Member Threads | Custom Apparel Collections for Clubs, Teams & Organizations';
const DESCRIPTION =
  'Retail-quality custom apparel for clubs, companies, nonprofits, teams and associations. Pick the pieces, then customize the colors, fabric, fit and finish. From 36 pieces.';

/** DM Mono: the tech-pack receipt only, as on The Mitzvah Studio. */
const mono = DM_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-receipt', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: TITLE, template: '%s | Member Threads' },
  description: DESCRIPTION,
  openGraph: {
    title: { default: TITLE, template: '%s | Member Threads' },
    description: 'Apparel your members actually want to wear. Custom collections for organizations, designed and made from the fabric up.',
    url: SITE_URL,
    siteName: 'Member Threads',
    type: 'website',
  },
  icons: { icon: '/mt-icon.svg', apple: '/mt-icon.svg' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${mono.variable} ${archivo.variable} ${hanken.variable} ${varsity.variable} ${newsreader.variable} ${script.variable}`}>
      <body className="min-h-screen antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-ink focus:px-5 focus:py-3 focus:text-paper t-eyebrow"
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
