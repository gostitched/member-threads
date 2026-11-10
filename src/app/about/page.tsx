import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import Reveal from '@/components/Reveal';
import { Arrow } from '@/components/SiteHeader';
import { FOUNDER, OFFER, ORIGIN, STITCHED } from '@/lib/about';
import { CONTACT } from '@/lib/site';

export const metadata: Metadata = {
  title: 'About',
  description:
    'How Member Threads started, who makes the collections, and what every organization gets: a dedicated designer, one clear price and reorders on file.',
};

/**
 * Paper: the title, the intro, the founder. Then what every organization gets,
 * as four cream plates, the Stitched Group note, and one button.
 */
export default function AboutPage() {
  return (
    <>
      <section className="bg-paper text-ink">
        <div className="shell grid gap-10 pb-16 pt-12 sm:pb-24 sm:pt-16 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-center lg:gap-16">
          <div>
            <h1 className="t-display">
              <span className="enter block" style={{ ['--d' as string]: '60ms' }}>
                Started for the clubs
              </span>
              <span className="enter block" style={{ ['--d' as string]: '140ms' }}>
                we were <em>in.</em>
              </span>
            </h1>
            <p className="t-lead mt-8 max-w-[40rem]">{ORIGIN.intro}</p>
            <p className="t-body mt-5 max-w-[40rem] text-ink/90">{ORIGIN.story[0].body}</p>
          </div>

          <figure className="max-w-[18rem]">
            {FOUNDER.photo ? (
              <div className="photo grade grain relative aspect-[4/5]">
                <Image src={FOUNDER.photo} alt={FOUNDER.name} width={FOUNDER.width} height={FOUNDER.height} sizes="18rem" priority />
              </div>
            ) : (
              <div className="aspect-[4/5] w-full bg-cream" />
            )}
            <figcaption className="caption">
              {FOUNDER.name}, {FOUNDER.role.toLowerCase()}
            </figcaption>
          </figure>
        </div>
      </section>

      <section id="what-you-get" className="scroll-mt-20 bg-paper pb-20 text-ink sm:pb-28">
        <div className="shell">
          <Reveal>
            <h2 className="t-h1">
              What you <em>get.</em>
            </h2>
          </Reveal>
          <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
            {OFFER.map((p, i) => (
              <li key={p.title}>
                <Reveal delay={i * 60} className="h-full bg-cream p-6 sm:p-7">
                  <h3 className="t-h3">{p.title}</h3>
                  <p className="t-body mt-2 text-ink/90">{p.line}</p>
                </Reveal>
              </li>
            ))}
          </ul>

          <div id="stitched" className="mt-14 max-w-[44rem] scroll-mt-28">
            <h2 className="t-h3">{STITCHED.title}</h2>
            <p className="t-body mt-3 text-ink/90">{STITCHED.body}</p>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
            <Link href="/quote" className="btn-blue">
              Start a collection <Arrow className="h-[14px] w-[19px]" />
            </Link>
            <a href={`mailto:${CONTACT.email}`} className="inline-flex min-h-11 items-center text-[15px] font-medium">
              <span className="link-u">{CONTACT.email}</span>
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
