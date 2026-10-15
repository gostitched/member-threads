import type { Metadata } from 'next';
import RequestForm, { ForSticker, QuoteTitle } from '@/components/RequestForm';
import { CONTACT } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Start a collection',
  description: 'Tell us about your day: the kid, the date, the colors. You’ll work with a real person, not an automated system.',
};

export default async function QuotePage({ searchParams }: { searchParams: Promise<{ piece?: string }> }) {
  // Sent from the studio on the home page: what the visitor built, to paste into the brief.
  const { piece } = await searchParams;

  return (
    <>
      <section className="bg-paper text-ink">
        <div className="shell pb-12 pt-12 sm:pb-16 sm:pt-16">
          <QuoteTitle />
          <p
            className="rise mt-4 font-sans text-[clamp(1.375rem,2.1vw,1.875rem)] font-medium leading-[1.1] tracking-[-0.015em] text-uv"
            style={{ animationDelay: '220ms' }}
          >
            You’ll work with a real person, not an automated system.
          </p>
          <p className="mt-5 max-w-[36rem] text-[0.9375rem] leading-relaxed text-ink/70">
            The kid, the date, the colors, what they’re into. Screenshots are perfect.
          </p>
        </div>
      </section>

      <section className="bg-paper text-ink">
        <div className="shell pb-20">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <ForSticker />
            <p className="text-[0.875rem] text-muted sm:ml-auto">
              Prefer email?{' '}
              <a href={`mailto:${CONTACT.email}`} className="text-electric-deep underline-offset-4 hover:underline">
                {CONTACT.email}
              </a>
            </p>
          </div>

          {piece && (
            <div className="mb-6 max-w-3xl rounded-3xl bg-white p-6 ring-1 ring-rule">
              <p className="text-[0.875rem] text-muted">You picked</p>
              <p className="caps mt-2 text-d3">{piece.slice(0, 200)}</p>
              <p className="mt-2 text-[0.9375rem] text-ink/70">Mention it in the form and your designer will start from there.</p>
            </div>
          )}

          <RequestForm />
        </div>
      </section>
    </>
  );
}
