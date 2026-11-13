'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import Dropdown from '@/components/Dropdown';
import { Arrow } from '@/components/SiteHeader';
import type { LookbookSet } from '@/lib/catalog/types';
import { GROUNDS, GROUP_OF, PIECE_GROUPS, type PieceGroup } from '@/lib/lookbook';
import Ending from './Ending';
import { layFlat } from './flatlay';
import SetViewer, { pieceName } from './SetViewer';
import './work.css';

/**
 * Get Inspired: the lookbook, one card per set, laid flat, front first. Hover (or tap
 * the See back pill) to see the back; click to enlarge. Filter by organization and by
 * piece. Sets come from the dashboard, in its order.
 */

const PAGE = 48;

function SetCard({ s, ground, onOpen }: { s: LookbookSet; ground: string; onOpen: () => void }) {
  const [back, setBack] = useState(false);
  const names = s.pieces.map(pieceName).join(' + ');
  const placed = layFlat(s.pieces);
  const hasBack = s.pieces.some((p) => p.back);
  return (
    <figure className="set-card" data-back={back || undefined} style={{ background: ground }}>
      {s.pieces.map((p, i) => {
        const at = placed[i];
        return (
          <div
            key={p.id}
            className="set-piece"
            data-flip={p.back ? '' : undefined}
            style={{ left: `${at.left}%`, top: `${at.top}%`, width: `${at.width}%`, height: `${at.height}%`, rotate: `${at.rotate}deg`, zIndex: i === 0 ? 2 : 1 }}
          >
            <img src={p.front.thumbUrl} alt="" loading="lazy" decoding="async" className="set-face is-front" />
            {p.back && <img src={p.back.thumbUrl} alt="" loading="lazy" decoding="async" className="set-face is-back" />}
          </div>
        );
      })}
      <figcaption className="t-spec absolute inset-x-3 top-2.5 text-ink">
        {s.theme} · {names}
      </figcaption>
      <button type="button" onClick={onOpen} className="set-open" aria-label={`Enlarge ${s.theme}: ${names}`} />
      {hasBack && (
        <button type="button" aria-pressed={back} onClick={() => setBack((b) => !b)} className="set-flip">
          {back ? 'See front' : 'See back'}
          <span className="sr-only"> of {names}</span>
        </button>
      )}
    </figure>
  );
}

export default function Catalog({ sets }: { sets: LookbookSet[] }) {
  const [theme, setTheme] = useState<string | null>(null);
  const [group, setGroup] = useState<PieceGroup | null>(null);
  const [shown, setShown] = useState(PAGE);
  const [open, setOpen] = useState<number | null>(null);

  // A set keeps its ground whatever the filters show.
  const grounds = useMemo(() => new Map(sets.map((s, i) => [s.id, GROUNDS[i % GROUNDS.length]])), [sets]);
  const allThemes = useMemo(() => [...new Set(sets.map((s) => s.theme))].sort((a, b) => a.localeCompare(b)), [sets]);
  const has = (s: LookbookSet, g: PieceGroup | null) => !g || s.pieces.some((p) => GROUP_OF[p.kind] === g);
  const matches = useMemo(() => sets.filter((s) => (!theme || s.theme === theme) && has(s, group)), [sets, theme, group]);
  // Only offer choices that lead somewhere, so a filter can never land on nothing.
  const themes = useMemo(() => allThemes.filter((name) => sets.some((s) => s.theme === name && has(s, group))), [allThemes, sets, group]);
  const groups = useMemo(() => PIECE_GROUPS.filter((g) => sets.some((s) => has(s, g.id) && (!theme || s.theme === theme))), [sets, theme]);
  const choose = (next: () => void) => {
    next();
    setShown(PAGE);
    setOpen(null);
  };

  return (
    <div className="wk">
      <header className="pb-6 pt-6 lg:pt-0">
        <h1 className="t-h1">
          Get <em>inspired.</em>
        </h1>
        <p className="t-lead mt-4 max-w-[52ch] text-balance">
          See something your members would wear? Start from it. Every design here is a concept, and yours is made to your spec.
        </p>
      </header>

      {sets.length === 0 ? (
        <div className="flex flex-col items-start gap-5 bg-cream p-10 sm:p-16">
          <p className="t-h2">New designs are on the way.</p>
          <Link href="/quote" className="btn-blue">
            Start a collection <Arrow className="h-[14px] w-[19px]" />
          </Link>
        </div>
      ) : (
        <>
          <div className="relative flex flex-wrap items-center gap-2 pb-5">
            <Dropdown
              label="Filter by organization"
              all="All Organizations"
              value={theme ?? ''}
              options={themes.map((t) => ({ value: t, label: t }))}
              onChange={(v) => choose(() => setTheme(v || null))}
            />
            <Dropdown
              label="Filter by piece"
              all="All Pieces"
              value={group ?? ''}
              options={groups.map((g) => ({ value: g.id, label: g.label }))}
              onChange={(v) => choose(() => setGroup((v as PieceGroup) || null))}
            />
            {(theme || group) && (
              <button
                type="button"
                onClick={() => choose(() => { setTheme(null); setGroup(null); })}
                className="min-h-11 px-2 font-sans text-[0.9375rem] font-medium text-ink"
              >
                <span className="link-u">Clear</span>
              </button>
            )}
            <p role="status" className="t-spec num ml-auto whitespace-nowrap text-muted">
              {matches.length} {matches.length === 1 ? 'design' : 'designs'}
            </p>
          </div>

          <div className="set-grid">
            {matches.slice(0, shown).map((s, i) => (
              <SetCard key={s.id} s={s} ground={grounds.get(s.id)!} onOpen={() => setOpen(i)} />
            ))}
          </div>

          {matches.length > shown && (
            <div className="mt-8 flex justify-center">
              <button type="button" onClick={() => setShown((n) => n + PAGE)} className="btn-outline">
                Show more designs
              </button>
            </div>
          )}

          {open !== null && matches[open] && (
            <SetViewer sets={matches} grounds={grounds} index={open} onIndex={setOpen} onClose={() => setOpen(null)} />
          )}
        </>
      )}

      <Ending />
    </div>
  );
}
