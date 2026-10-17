'use client';

import DesignAct from './DesignAct';
import Finale from './Finale';
import Stage from './Stage';
import { ACT1 } from '@/lib/chapter';
import './chapter.css';

/**
 * The chapter between the hero and the intro.
 *
 *   01  Not a blank: a full-width cream band. The house hoodie on its drawing
 *       sheet, eight details as numbered square chips with dashed leaders, the
 *       organization's name (the page's one script moment) and colorway beside
 *       it, and the tech pack printing every step at +$0.
 *   02  Don't know what you want yet? One row on paper: the line, and three
 *       drawn pieces from one collection carrying the same name.
 *   ──  The close: a second cream band, three serif lines and a hang tag that
 *       drops in on its string with the name on it.
 *
 * The organization's name (typed beside the hoodie) runs through all of it.
 * Content lives in `@/lib/chapter`.
 */
export default function Chapter({ receipt = false }: { receipt?: boolean }) {
  const [a, em, b] = ACT1.title;
  return (
    <>
      <section aria-labelledby="why-title" className="chapter-ground band-cream sec relative overflow-x-clip">
        <div className="shell">
          <div className="grid-12 items-end gap-y-6">
            <div className="col-span-4 sm:col-span-8 lg:col-span-7">
              <p className="t-eyebrow fg-muted">{ACT1.eyebrow}</p>
              <h2 id="why-title" className="t-h1 mt-5">
                {a}
                <em>{em}</em>
                {b}
              </h2>
            </div>
            <div className="col-span-4 sm:col-span-7 lg:col-span-5 lg:col-start-8 lg:pb-[0.35rem] xl:col-span-4 xl:col-start-9">
              <p className="t-lead max-w-measure">{ACT1.lead}</p>
            </div>
          </div>
        </div>
        <div className="mt-12 lg:mt-20">
          <Stage receipt={receipt} />
        </div>
      </section>

      <DesignAct />

      <Finale />
    </>
  );
}
