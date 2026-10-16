import type { Metadata } from 'next';
import RequestForm, { ForSticker, QuoteTitle } from '@/components/RequestForm';
import { FRAME } from '@/components/frame';
import { CONTACT } from '@/lib/site';
import '@/components/chrome/chrome.css';

export const metadata: Metadata = {
  title: 'Start a Collection',
  description:
    'Tell us about your organization: your logo, your colors, who it’s for and when you need it. A designer reads every request.',
};

const NEXT = [
  { title: 'We review your request', line: 'Your pieces, quantities and date. If the timeline is tight, we tell you on day one.' },
  { title: 'Meet your designer', line: 'One person shapes the collection with you, from first sketch to final proof.' },
  { title: 'Approve, then we make it', line: 'You sign off on every piece and one clear price before anything is produced.' },
] as const;

const ASSURANCES = ['Design included', 'No upcharges', 'From 36 per style'] as const;

/**
 * A calm intake page. The display line (personalised once a name has been
 * typed on the home page) with the lead beside it; then two columns: the
 * three next steps and the woven reassurances, sticky on the left; the
 * request plate on the right, which frames the Stitched form.
 */
export default async function QuotePage({ searchParams }: { searchParams: Promise<{ piece?: string }> }) {
  // Sent from the studio on the home page: what the visitor built, to paste into the brief.
  const { piece } = await searchParams;

  return (
    <section className="band-paper pb-24 lg:pb-32">
      <div className={FRAME}>
        <div className="grid-12 gap-y-8 pb-14 pt-10 sm:pt-14 lg:pb-20 lg:pt-20">
          <div className="col-span-4 sm:col-span-8 lg:col-span-8">
            <p className="enter t-eyebrow fg-muted">Start a collection · Intake</p>
            <div className="mt-5">
              <QuoteTitle />
            </div>
          </div>
          <p
            className="enter t-lead col-span-4 sm:col-span-6 lg:col-span-4 lg:self-end"
            style={{ ['--d' as string]: '240ms' }}
          >
            Your logo, your colors, roughly how many people and when you need it. A designer reads every request, and you
            hear back from a person.
          </p>
        </div>

        <div className="grid-12 gap-y-14 border-t border-rule pt-10 lg:pt-14">
          <aside className="order-2 col-span-4 sm:col-span-8 lg:order-1 lg:col-span-4" aria-label="What happens next">
            <div className="lg:sticky lg:top-[124px]">
              <div className="mb-10 empty:hidden">
                <ForSticker />
              </div>

              <p className="t-eyebrow fg-muted">What happens next</p>
              <ol className="mt-6">
                {NEXT.map((n, i) => (
                  <li key={n.title} className="grid grid-cols-[3.25rem_minmax(0,1fr)] gap-x-4 border-t border-rule py-6">
                    <span className="t-block text-[1.5rem] text-beige-deep">{String(i + 1).padStart(2, '0')}</span>
                    <div>
                      <h2 className="t-h3">{n.title}</h2>
                      <p className="t-body mt-2 text-ink/90">{n.line}</p>
                    </div>
                  </li>
                ))}
              </ol>

              <ul className="mt-4 flex flex-wrap gap-2.5" aria-label="Good to know">
                {ASSURANCES.map((g) => (
                  <li key={g} className="woven woven-beige">
                    {g}
                  </li>
                ))}
              </ul>
              <p className="t-small mt-6 max-w-[40ch] text-ink/80">Sizes mix within a style.</p>
            </div>
          </aside>

          <div className="order-1 col-span-4 min-w-0 sm:col-span-8 lg:order-2 lg:col-span-8">
            {piece && (
              <div className="mb-8 flex flex-col items-start gap-3 border-b border-rule pb-8">
                <span className="woven woven-green">You picked</span>
                <p className="t-h2">{piece.slice(0, 200)}</p>
                <p className="t-body text-ink/90">Mention it in the form and your designer will start from there.</p>
              </div>
            )}
            <RequestForm />
            <p className="t-body mt-6 text-ink/90">
              Prefer email? Write to{' '}
              <a href={`mailto:${CONTACT.email}`} className="link-u font-medium">
                {CONTACT.email}
              </a>{' '}
              with your organization, the pieces and your date.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
