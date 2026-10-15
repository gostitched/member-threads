'use client';

import { useState } from 'react';
import StitchField from './StitchField';
import { CASES } from '@/lib/cases';

/**
 * Collection case studies as a set of full-width rows.
 *
 * One is open at a time. The panel is driven by the open row rather than by
 * hover alone, so it is reachable by keyboard and stays put on touch, where
 * there is no hover to hold it.
 */
export default function CaseStudies() {
  const [open, setOpen] = useState(0);

  return (
    <div className="border-t border-rule">
      {CASES.map((c, i) => {
        const isOpen = i === open;
        return (
          <article key={c.id} className="border-b border-rule">
            <h3>
              <button
                type="button"
                onClick={() => setOpen(isOpen ? -1 : i)}
                aria-expanded={isOpen}
                className="group flex w-full items-baseline gap-5 py-7 text-left sm:gap-8 sm:py-9"
              >
                <span className="label w-8 shrink-0 text-muted">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="flex-1">
                  <span className={`label block transition-colors ${isOpen ? 'text-uv' : 'text-muted'}`}>
                    {c.brand}
                  </span>
                  <span className="mt-3 block text-d2 font-extrabold tracking-tight">
                    {c.title}
                  </span>
                </span>
                <span
                  aria-hidden
                  className={`mt-1 shrink-0 transition-transform duration-300 ease-out ${
                    isOpen ? 'rotate-45 text-uv' : 'text-muted group-hover:text-ink'
                  }`}
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M10 1v18M1 10h18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                </span>
              </button>
            </h3>

            <div
              className={`grid transition-all duration-500 ease-out ${
                isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
              }`}
            >
              <div className="overflow-hidden">
                <div className="grid gap-8 pb-10 lg:grid-cols-[1fr_1fr_320px] lg:gap-10">
                  <div>
                    <p className="label text-muted">The ask</p>
                    <p className="mt-4 text-lead">{c.challenge}</p>
                  </div>
                  <div>
                    <p className="label text-muted">The collection</p>
                    <p className="mt-4 text-lead text-muted">{c.approach}</p>
                  </div>

                  <div className="relative min-h-[190px] overflow-hidden">
                    <StitchField fill />
                    {/* Scrim: the seams run straight through the figures
                        otherwise, and the small mono labels lose against them. */}
                    <div
                      aria-hidden
                      className="absolute inset-0"
                      style={{ background: 'linear-gradient(to top, rgba(248,246,241,0.92) 0%, rgba(248,246,241,0.6) 55%, transparent 100%)' }}
                    />
                    <dl className="relative grid h-full grid-cols-2 content-end gap-x-6 gap-y-5 p-7">
                      {c.metrics.map((m) => (
                        <div key={m.k}>
                          <dt className="label text-ink/50">{m.k}</dt>
                          <dd className="mt-1.5 text-[0.9375rem] font-semibold text-ink">{m.v}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                </div>

                <p className="label pb-9 text-muted">{c.sector}</p>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
