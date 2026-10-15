'use client';

import DesignAct from './DesignAct';
import Finale from './Finale';
import Stage from './Stage';
import { useKidName } from '@/lib/name';
import { ACT1, named } from '@/lib/chapter';
import './chapter.css';

/**
 * The chapter between the hero and how it works.
 *
 *   01  Not a blank: their hoodie on a pale-blue plate, five details to tap,
 *       and the name + colorway under it.
 *   02  Don't know what you want? One row: the line, and three pieces.
 *   ──  The finale: one pale-blue panel, three lines, one button.
 *
 * The kid's name (typed under the hoodie) runs through all of it. Content lives in
 * `@/lib/chapter`.
 */
export default function Chapter({ receipt = false }: { receipt?: boolean }) {
  const { name, isDefault } = useKidName();
  return (
    <>
      <section aria-labelledby="why-title" className="chapter-ground relative overflow-x-clip bg-paper pb-12 pt-8 text-ink sm:pt-10 lg:pb-8">
        <div className="shell relative text-center">
          <h2 id="why-title" className="caps text-d1">
            Not A blank.
          </h2>
          <p className="mx-auto mt-4 max-w-[40rem] text-balance text-lead text-ink/80">
            {ACT1.body.lead}
            <strong className="font-semibold text-ink">{ACT1.body.mark}</strong>
            {ACT1.body.rest}
          </p>
          <p className="mx-auto mt-2 max-w-[30rem] text-[0.9375rem] text-muted">{named(ACT1.hint, name, isDefault)}</p>
        </div>
        <div className="mt-8 lg:mt-10">
          <Stage receipt={receipt} />
        </div>
      </section>

      <DesignAct />

      <Finale />
    </>
  );
}
