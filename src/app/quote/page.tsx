import type { Metadata } from 'next';
import RequestForm, { ForSticker, QuoteTitle } from '@/components/RequestForm';
import { FRAME } from '@/components/frame';
import { CONTACT } from '@/lib/site';

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

const GOOD_TO_KNOW = ['From 36 pieces per style', 'Sizes mix within a style', 'Design included', 'No upcharges for customization'] as const;

export default async function QuotePage({ searchParams }: { searchParams: Promise<{ piece?: string }> }) {
  // Sent from the studio on the home page: what the visitor built, to paste into the brief.
  const { piece } = await searchParams;

  return (
    <>
      <section className="bg-paper text-ink">
        <div className={`${FRAME} pb-14 pt-14 sm:pb-16 sm:pt-20 lg:pb-20 lg:pt-28`}>
          <p className="rise label text-ink/55">Start a collection</p>
          <div className="mt-6">
            <QuoteTitle />
          </div>
          <div className="rise mt-10 grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:gap-16" style={{ animationDelay: '260ms' }}>
            <p className="max-w-[40rem] text-lead text-ink/75">
              Your logo, your colors, roughly how many people and when you need it. A brand guide or a few screenshots is
              plenty. A designer reads every request; you’ll hear back from a person, not an automated system.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-paper text-ink">
        <div className={`${FRAME} grid gap-12 border-t border-rule pb-24 pt-10 sm:pt-12 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:gap-16 lg:pb-32`}>
          <div className="min-w-0">
            {piece && (
              <div className="mb-6 flex flex-col gap-2 rounded-[4px] bg-cream p-6 sm:p-7">
                <p className="label text-ink/55">You picked</p>
                <p className="caps text-d3">{piece.slice(0, 200)}</p>
                <p className="text-[0.9375rem] text-ink/70">Mention it in the form and your designer will start from there.</p>
              </div>
            )}
            <RequestForm />
          </div>

          <aside>
            <div className="lg:sticky lg:top-[124px]">
              <div className="mb-8 empty:hidden">
                <ForSticker />
              </div>

              <p className="label text-ink/55">What happens next</p>
              <ol className="mt-5 border-t border-ink/15">
                {NEXT.map((n, i) => (
                  <li key={n.title} className="grid grid-cols-[2.25rem_minmax(0,1fr)] border-b border-ink/15 py-5">
                    <span className="label pt-1 text-ink/45">{String(i + 1).padStart(2, '0')}</span>
                    <div>
                      <p className="text-[1rem] font-semibold leading-snug">{n.title}</p>
                      <p className="mt-1.5 text-[0.9375rem] leading-relaxed text-ink/70">{n.line}</p>
                    </div>
                  </li>
                ))}
              </ol>

              <p className="label mt-10 text-ink/55">Good to know</p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {GOOD_TO_KNOW.map((g) => (
                  <li key={g} className="rounded-full bg-cream px-3.5 py-1.5 text-[0.8125rem] font-medium">
                    {g}
                  </li>
                ))}
              </ul>

              <p className="mt-10 text-[0.9375rem] text-ink/70">
                Prefer email?{' '}
                <a
                  href={`mailto:${CONTACT.email}`}
                  className="font-medium text-ink underline decoration-ink/30 underline-offset-4 transition-colors hover:text-dusty hover:decoration-dusty"
                >
                  {CONTACT.email}
                </a>
              </p>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
