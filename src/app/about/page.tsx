import type { Metadata } from 'next';
import Link from 'next/link';
import Reveal from '@/components/Reveal';
import { FOUNDER, ORIGIN, PLANNERS } from '@/lib/about';
import { CONTACT } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Studio',
  description: 'How Member Threads started, who makes the collections, and how we work with planners.',
};

/**
 * Paper band: the title, one paragraph, the founder. Then the four things
 * planners get, as white tiles, and one button.
 */
export default function AboutPage() {
  return (
    <>
      <section className="bg-paper text-ink">
        <div className="shell grid gap-10 pb-16 pt-12 sm:pb-24 sm:pt-16 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-center lg:gap-16">
          <div>
            <h1 className="caps text-d1">
              <span className="rise block" style={{ animationDelay: '60ms' }}>
                A fashion studio
              </span>
            </h1>
            <p
              className="rise mt-3 font-sans text-[clamp(1.375rem,2.1vw,1.875rem)] font-medium leading-[1.1] tracking-[-0.015em] text-uv"
              style={{ animationDelay: '180ms' }}
            >
              for one weekend.
            </p>
            <p className="mt-6 max-w-[40rem] text-[0.9375rem] leading-relaxed text-ink/70">{ORIGIN.intro}</p>
          </div>

          <figure className="max-w-[18rem]">
            {FOUNDER.photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={FOUNDER.photo}
                alt={FOUNDER.name}
                className="aspect-[4/5] w-full rounded-3xl object-cover ring-1 ring-rule"
              />
            ) : (
              <div className="aspect-[4/5] w-full rounded-3xl bg-electric-lit" />
            )}
            <figcaption className="mt-3 text-[0.875rem] text-muted">
              {FOUNDER.name}, {FOUNDER.role.toLowerCase()}
            </figcaption>
          </figure>
        </div>
      </section>

      <section id="planners" className="scroll-mt-20 bg-paper pb-20 text-ink sm:pb-28">
        <div className="shell">
          <Reveal>
            <h2 className="caps text-d2">For planners.</h2>
          </Reveal>
          <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
            {PLANNERS.map((p, i) => (
              <li key={p.title}>
                <Reveal
                  delay={i * 60}
                  className="h-full rounded-3xl bg-white p-6 ring-1 ring-rule sm:p-7"
                >
                  <h3 className="text-[1.0625rem] font-sans font-semibold">{p.title}</h3>
                  <p className="mt-2 text-[0.9375rem] leading-relaxed text-ink/70">{p.line}</p>
                </Reveal>
              </li>
            ))}
          </ul>

          <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
            <Link href="/quote" className="btn-blue">
              Start Creating <span aria-hidden="true">→</span>
            </Link>
            <a href={`mailto:${CONTACT.email}`} className="text-[0.9375rem] text-electric-deep underline-offset-4 hover:underline">
              {CONTACT.email}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
