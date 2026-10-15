import Link from 'next/link';
import Reveal from './Reveal';
import { DESIGN_STEPS } from '@/lib/site';

/**
 * The free design offer, given its own full-bleed section.
 *
 * It is the single hardest thing for a competitor to match, so it gets the
 * accent ground and a headline of its own rather than a bullet in a list.
 */
export default function FreeDesign() {
  return (
    <section className="bg-electric text-ink">
      <div className="shell py-20 sm:py-28">
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <div>
            <p className="label text-ash/50">Included at no cost</p>
            <h2 className="caps mt-5 max-w-3xl text-d1">
              Your design is
              <br />
              <span className="font-serif font-normal normal-case italic">free, start to finish.</span>
            </h2>
          </div>
          <p className="max-w-measure text-lead text-ash/75">
            You work with a graphic designer on our team who turns your idea into a file that's
            ready for production. There's no hourly rate or art fee, and you
            revise it until it's right.
          </p>
        </div>

        <ol className="mt-16 grid gap-px bg-ink/5 sm:grid-cols-2 lg:grid-cols-4">
          {DESIGN_STEPS.map((step, i) => (
            <Reveal key={step.n} delay={i * 70} className="bg-electric">
              <li className="flex h-full flex-col p-7 lg:p-8">
                <span className="label text-ash/50">{step.n}</span>
                <h3 className="mt-6 text-d3 font-extrabold tracking-tight">{step.title}</h3>
                <p className="mt-3 text-[0.9375rem] leading-relaxed text-ash/70">{step.body}</p>
              </li>
            </Reveal>
          ))}
        </ol>

        <div className="mt-14">
          <Link href="/quote" className="btn-white">Start your design, free</Link>
        </div>
      </div>
    </section>
  );
}
