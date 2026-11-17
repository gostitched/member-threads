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

  // Side by side from lg: the headline, the lede, the label and the email on the left
  // (held in view while the form scrolls), the form on the right. Stacked below that.
  // The form draws its own 20px inset on every side, so it's pulled out by that much
  // to line its fields up with the headline.
  return (
    <section className="bg-paper text-ink">
      <div className="shell grid gap-12 pb-20 pt-12 sm:pt-16 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <QuoteTitle />
          {/* [CONFIRM] "a designer reads every request". */}
          <p className="enter t-lead mt-5 max-w-[40rem]" style={{ ['--d' as string]: '220ms' }}>
            A designer reads every request. Send your logo, your colors, how many people and your date.
          </p>
          <div className="mt-8 flex flex-col items-start gap-5">
            <ForSticker />
            <p className="t-body text-ink/90">
              Prefer email?{' '}
              <a href={`mailto:${CONTACT.email}`} className="inline-flex min-h-11 items-center font-medium">
                <span className="link-u">{CONTACT.email}</span>
              </a>
            </p>
          </div>
        </div>
        <div className="lg:pt-3">
          {piece && (
            <div className="mb-6 bg-cream p-6">
              <p className="t-small fg-muted">You picked</p>
              <p className="t-h3 mt-2">{piece.slice(0, 400)}</p>
              <p className="t-body mt-2 text-ink/90">Mention these in the form.</p>
            </div>
          )}
          <div className="-mx-5 -mt-4">
            <RequestForm />
          </div>
        </div>
      </div>
    </section>
  );
}
