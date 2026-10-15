'use client';

import { useRef, useState } from 'react';
import Reveal from '@/components/Reveal';
import { CONTACT, FAQ, type FaqItem } from '@/lib/site';

/**
 * The questions, on a raised panel. Each sits over a stitched seam with a loose
 * thread at its right end; pulling it (the whole row is the button) unpicks the
 * stitches and the panel parts, showing the answer beneath. One seam open at a
 * time; the thread in the opening sews it shut. The heading and a way to ask
 * something else hold the left column, mirroring How it works.
 *
 * All motion is CSS (`.inside-*` in globals.css), driven by `data-open`.
 */
export default function Faq() {
  const [open, setOpen] = useState<number | null>(null);
  const questions = useRef<(HTMLButtonElement | null)[]>([]);

  const close = (i: number) => {
    setOpen(null);
    // The close thread is about to go inert, so hand focus back to its question.
    questions.current[i]?.focus();
  };

  return (
    <section aria-labelledby="faq-title" className="inside-garment overflow-x-clip pb-24 pt-4 sm:pb-32 lg:pb-40">
      <div className="mx-auto grid w-full max-w-[1536px] grid-cols-[minmax(0,1fr)] gap-10 px-5 sm:px-8 lg:grid-cols-12 lg:gap-10 lg:px-14">
        <Reveal className="lg:col-span-5">
          <div className="lg:sticky lg:top-36">
            <p className="label text-ink/60">Questions</p>
            <h2 id="faq-title" className="caps mt-5 text-[clamp(2rem,4vw,3.75rem)] leading-[0.95] tracking-[-0.03em]">
              Good to know.
            </h2>
            <p className="mt-6 max-w-[26rem] text-lead text-ink/75">
              Straight answers on price, minimums, timing and reorders. Pull a thread to open one.
            </p>
            <p className="mt-8 text-[0.9375rem] text-ink/60">
              Something else?{' '}
              <a
                href={`mailto:${CONTACT.email}`}
                className="font-medium text-ink underline decoration-ink/25 underline-offset-[5px] transition-colors hover:decoration-ink"
              >
                {CONTACT.email}
              </a>
            </p>
          </div>
        </Reveal>

        <div className="inside-label lg:col-span-7">
          {FAQ.map((item, i) => (
            <Entry
              key={item.number}
              item={item}
              isOpen={open === i}
              onToggle={() => setOpen(open === i ? null : i)}
              onClose={() => close(i)}
              buttonRef={(el) => {
                questions.current[i] = el;
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function Entry({
  item,
  isOpen,
  onToggle,
  onClose,
  buttonRef,
}: {
  item: FaqItem;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  buttonRef: (el: HTMLButtonElement | null) => void;
}) {
  const qid = `faq-q-${item.number}`;
  const aid = `faq-a-${item.number}`;

  return (
    <div className="inside-entry" data-open={isOpen}>
      <h3>
        <button
          ref={buttonRef}
          id={qid}
          type="button"
          aria-expanded={isOpen}
          aria-controls={aid}
          onClick={onToggle}
          className="inside-q group block w-full text-left"
        >
          <span className="inside-q-row">
            <span className="inside-q-text block">{item.question}</span>
          </span>
          <span aria-hidden className="relative block">
            <Seam />
          </span>
        </button>
      </h3>

      <div id={aid} role="region" aria-labelledby={qid} inert={!isOpen} className="inside-under">
        <div className="min-h-0 overflow-hidden">
          <div className="inside-under-body">
            <div className="inside-answer flex flex-wrap items-end justify-between gap-x-10 gap-y-4">
              <div className="min-w-0">
                <p className="caps text-d3 text-ink">{item.answer}</p>
                <p className="mt-3 max-w-[44ch] text-[0.9375rem] leading-relaxed text-ink/70">{item.line}</p>
              </div>
              <button type="button" onClick={onClose} className="inside-close">
                <span className="label">Close</span>
                <svg viewBox="0 0 72 22" className="h-[22px] w-[60px]" fill="none" aria-hidden>
                  <path
                    d="M2 11 C 12 3, 18 19, 28 11 S 44 3, 52 11 S 64 17, 70 9"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Stitches rendered per seam; smaller screens show fewer (see the count classes). */
const STITCHES = 64;

/**
 * A running stitch. Each stitch is its own element so it can be pulled out in
 * sequence; the needle holes stay behind when it goes.
 */
function Seam() {
  return (
    <span className="inside-seam pr-[4.75rem] sm:pr-24">
      <span className="inside-stitches">
        {Array.from({ length: STITCHES }, (_, i) => (
          <span
            key={i}
            className={`inside-st ${i >= 44 ? 'hidden lg:block' : i >= 26 ? 'hidden sm:block' : ''}`}
            style={{ '--i': i } as React.CSSProperties}
          >
            <i />
          </span>
        ))}
      </span>
      <span className="inside-tail">
        <svg viewBox="0 0 64 30" fill="none" className="h-[30px] w-[64px] overflow-visible">
          <path
            className="inside-tail-thread"
            d="M1 15 C 16 15, 22 14, 30 17 S 44 27, 52 22 S 60 10, 62 14"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        </svg>
      </span>
    </span>
  );
}
