'use client';

import DesignAct from './DesignAct';
import Finale from './Finale';
import Stage from './Stage';
import { ACT1 } from '@/lib/chapter';
import './chapter.css';

/**
 * The chapter between the hero and the intro.
 *
 *   01  Yours, down to the stitch: on paper over a faint cutting-mat grid. The signature hoodie on
 *       its cream drawing sheet, eight details as square chips with
 *       dashed leaders, the organization's name (the page's one script moment)
 *       and colorway under it, and the tech pack printing every step at +$0.
 *   02  Don't know what you want yet? One row: the line, and three drawn pieces
 *       from one collection carrying the same name.
 *   ──  The finale: one green panel, three lines, one button.
 *
 * The organization's name (typed under the hoodie) runs through all of it.
 * Content lives in `@/lib/chapter`.
 */
export default function Chapter({ receipt = false }: { receipt?: boolean }) {
  const [a, em, b] = ACT1.title;
  return (
    <>
      <section aria-labelledby="why-title" className="chapter-ground board-grid relative overflow-x-clip bg-paper pb-16 pt-10 text-ink sm:pt-12 lg:pb-20">
        <div className="shell relative text-center">
          <h2 id="why-title" className="t-h1">
            {a}
            <em>{em}</em>
            {b}
          </h2>
          <p className="t-lead mx-auto mt-5 max-w-[40rem] text-balance text-ink/80">
            {ACT1.lead.lead}
            <strong className="font-semibold text-ink">{ACT1.lead.mark}</strong>
            {ACT1.lead.rest}
          </p>
          <p className="t-small fg-muted mx-auto mt-3">{ACT1.hint}</p>
        </div>
        <div className="mt-10 lg:mt-12">
          <Stage receipt={receipt} />
        </div>
      </section>

      <DesignAct />

      <Finale />
    </>
  );
}
