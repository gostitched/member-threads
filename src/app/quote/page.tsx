import type { Metadata } from 'next';
import RequestForm, { ForSticker, QuoteTitle } from '@/components/RequestForm';
import { CONTACT } from '@/lib/site';
import '@/components/chrome/chrome.css';

export const metadata: Metadata = {
  title: 'Start a Collection',
  description:
    'Tell us about your organization: your logo, your colors, who it’s for and when you need it. A designer reads every request.',
};

/**
 * A calm intake page: the display line (personalised once a name has been typed on
 * the home page), one line in the voice, one plain sentence; then the woven label,
 * the email, what the visitor picked in the catalog, and the request plate that
 * frames the Stitched form.
 */
export default async function QuotePage({ searchParams }: { searchParams: Promise<{ piece?: string }> }) {
  // Sent from the catalog: the pieces the visitor added, to paste into the brief.
  const { piece } = await searchParams;

  return (
    <>
      <section className="bg-paper text-ink">
        <div className="shell pb-12 pt-12 sm:pb-16 sm:pt-16">
          <QuoteTitle />
          {/* [CONFIRM] "a designer reads every request". */}
          <p className="enter t-lead mt-5 max-w-[40rem]" style={{ ['--d' as string]: '220ms' }}>
            A designer reads every request. Send your logo, your colors, how many people and your date.
          </p>
        </div>
      </section>

      <section className="bg-paper text-ink">
        <div className="shell pb-20">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <ForSticker />
            <p className="t-body text-ink/90 sm:ml-auto">
              Prefer email?{' '}
              <a href={`mailto:${CONTACT.email}`} className="inline-flex min-h-11 items-center font-medium">
                <span className="link-u">{CONTACT.email}</span>
              </a>
            </p>
          </div>

          {piece && (
            <div className="mb-6 max-w-3xl bg-cream p-6">
              <p className="t-small fg-muted">You picked</p>
              <p className="t-h3 mt-2">{piece.slice(0, 400)}</p>
              <p className="t-body mt-2 text-ink/90">Mention these in the form.</p>
            </div>
          )}

          <RequestForm />
        </div>
      </section>
    </>
  );
}
