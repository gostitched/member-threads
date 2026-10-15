'use client';

import DesignAct from './DesignAct';
import Finale from './Finale';
import Stage from './Stage';
import { useOrgName } from '@/lib/name';
import { ACT1, named } from '@/lib/chapter';
import './chapter.css';

/**
 * The chapter between the hero and how it works.
 *
 *   01  Not a blank: the house hoodie on a cream plate, eight details to tap,
 *       the organization's name and colorway under it, the tech pack beside.
 *   02  Don't know what you want yet? One row: the line, and three pieces.
 *   ──  The close: one dusty-blue band, three lines, one button.
 *
 * The organization's name (typed under the hoodie) runs through all of it.
 * Content lives in `@/lib/chapter`.
 */
export default function Chapter({ receipt = false }: { receipt?: boolean }) {
  const { name, isDefault } = useOrgName();
  return (
    <>
      <section aria-labelledby="why-title" className="chapter-ground relative overflow-x-clip bg-paper pb-12 pt-14 text-ink sm:pt-20 lg:pb-10">
        <div className="shell relative text-center">
          <p className="label text-muted">{ACT1.eyebrow}</p>
          <h2 id="why-title" className="caps mt-4 text-d1">
            {ACT1.title}
          </h2>
          <p className="mx-auto mt-5 max-w-[38rem] text-balance text-lead text-ink/75">
            {ACT1.body.lead}
            <strong className="font-semibold text-ink">{ACT1.body.mark}</strong>
            {ACT1.body.rest}
          </p>
          <p className="mx-auto mt-3 max-w-[34rem] text-balance text-[0.875rem] text-muted">{named(ACT1.hint, name, isDefault)}</p>
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
