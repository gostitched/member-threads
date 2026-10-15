import type { Metadata } from 'next';
import { Archivo, Yellowtail } from 'next/font/google';
import './globals.css';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import { SITE_URL } from '@/lib/site';

/**
 * Archivo stands in for both brand faces: at heavy weights and a wide
 * setting it plays The Bold Font (display caps, numerals); at text weights
 * it plays Acumin (body, nav, buttons, labels).
 */
const archivo = Archivo({
  subsets: ['latin'],
  variable: '--font-archivo',
  axes: ['wdth'],
  display: 'swap',
});

/** Yellowtail stands in for Billion Dreams: the script, used sparingly as an accent. */
const script = Yellowtail({
  subsets: ['latin'],
  variable: '--font-script',
  weight: '400',
  display: 'swap',
});

const TITLE = 'Member Threads | Custom Apparel Collections for Clubs, Teams & Organizations';
const DESCRIPTION =
  'Retail-quality custom apparel for clubs, companies, nonprofits, teams and associations. Pick the pieces, then customize the colors, fabric, fit and finish. From 36 pieces.';

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
  icons: { icon: '/favicon.svg?v=2', apple: '/favicon.svg?v=2' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${archivo.variable} ${script.variable}`}>
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
