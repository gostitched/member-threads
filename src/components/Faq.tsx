'use client';

import { useRef, useState, type CSSProperties } from 'react';
import Reveal from '@/components/Reveal';
import { CONTACT, FAQ, type FaqItem } from '@/lib/site';
import '@/components/home/home.css';

/**
 * Questions, answered. Straight on the paper, no panel. Each question sits
 * over a running stitch with a loose thread at its right end; pulling it (the
 * whole row is the button) unpicks the stitches right to left and the answer
 * opens beneath: the one-glance answer in the serif, the plain sentence under
 * it. One seam open at a time; the thread in the opening sews it shut. The
 * heading and a way to ask something else hold the sticky left column.
 *
 * All motion is CSS (`.seam-*` in home/home.css), driven by `data-open`.
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
    <section aria-labelledby="faq-title" className="sec overflow-x-clip bg-paper text-ink">
      <div className="shell grid-12">
        <Reveal className="col-span-4 sm:col-span-8 lg:col-span-4">
          <div className="lg:sticky lg:top-[calc(var(--header-h)+4rem)]">
            <p className="t-eyebrow fg-muted">Questions</p>
            <h2 id="faq-title" className="t-h1 mt-5">
              Questions, <em>answered.</em>
            </h2>
            <p className="t-lead mt-6 max-w-[30ch] sm:mt-8">
              Straight answers on price, minimums, timing and reorders. Pull a thread to open one.
            </p>
            <p className="t-body mt-8 text-ink/90">
              Something else?{' '}
              <a href={`mailto:${CONTACT.email}`} className="inline-flex min-h-[44px] items-center font-medium">
                <span className="link-u">{CONTACT.email}</span>
              </a>
            </p>
          </div>
        </Reveal>

        <div className="col-span-4 mt-12 sm:col-span-8 lg:col-start-6 lg:col-end-13 lg:mt-0">
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
    <div className="seam-entry" data-open={isOpen}>
      <h3>
        <button
          ref={buttonRef}
          id={qid}
          type="button"
          aria-expanded={isOpen}
          aria-controls={aid}
          onClick={onToggle}
          className="seam-q"
        >
          <span className="seam-q-row">
            <span aria-hidden className="t-spec fg-muted">
              {item.number}
            </span>
            <span className="seam-q-text t-h3">{item.question}</span>
          </span>
          <Seam />
        </button>
      </h3>

      <div id={aid} role="region" aria-labelledby={qid} inert={!isOpen} className="seam-under">
        <div className="min-h-0 overflow-hidden">
          <div className="seam-answer grid grid-cols-[2.25rem_minmax(0,1fr)] gap-x-3 pb-6 pt-6 sm:grid-cols-[3.5rem_minmax(0,1fr)] sm:pb-8">
            <div className="col-start-2">
              <p className="t-h2">{item.answer}</p>
              <p className="t-body mt-4 max-w-[62ch] text-ink/90">{item.line}</p>
              <button type="button" onClick={onClose} className="seam-close mt-6">
                <svg viewBox="0 0 72 22" className="h-[22px] w-[60px]" fill="none" aria-hidden>
                  <path
                    d="M2 11 C 12 3, 18 19, 28 11 S 44 3, 52 11 S 64 17, 70 9"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
                <span className="t-eyebrow">Close</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Stitches rendered per seam; smaller screens show fewer (see the count classes). */
const STITCHES = 60;

/**
 * A running stitch. Each stitch is its own element so it can be pulled out in
 * sequence; the needle holes stay behind when it goes.
 */
function Seam() {
  return (
    <span aria-hidden className="seam">
      <span className="seam-stitches">
        {Array.from({ length: STITCHES }, (_, i) => (
          <span
            key={i}
            className={`seam-st ${i >= 44 ? 'hidden lg:block' : i >= 26 ? 'hidden sm:block' : ''}`}
            style={{ '--i': i } as CSSProperties}
          >
            <i />
          </span>
        ))}
      </span>
      <span className="seam-tail">
        <svg viewBox="0 0 64 30" fill="none" className="h-[30px] w-[64px] overflow-visible">
          <path
            className="seam-tail-thread"
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
