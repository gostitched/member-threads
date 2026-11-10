'use client';

import Image from 'next/image';
import { useMemo, useState } from 'react';
import Dropdown from '@/components/Dropdown';
import Ending from './Ending';
import WorkArt from './art';
import { INSPO, INSPO_THEMES, PIECE_GROUPS, type Inspo, type PieceGroup } from '@/lib/inspo';
import './work.css';

/**
 * Get Inspired: a wall of concept designs to browse. Nothing to open; what's shown is
 * what there is. Filter by organization and by piece. Every tile is a concept, drawn
 * for a made-up club, team, company or cause.
 */

const PAGE = 48;

const luminance = (hex: string) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

function Tile({ t }: { t: Inspo }) {
  const fills = !!t.src || t.art?.t === 'plate';
  return (
    <div className="cat-tile" style={{ '--span': Math.round(t.ratio * 12) } as React.CSSProperties}>
      <figure className="relative h-full overflow-hidden" style={{ background: t.ground }}>
        <div className={fills ? 'absolute inset-0' : 'absolute inset-x-[9%] bottom-[5%] top-[13%]'}>
          {t.src ? (
            <Image src={t.src} alt="" fill sizes="(min-width: 1536px) 19vw, (min-width: 1024px) 24vw, (min-width: 640px) 32vw, 48vw" className="object-cover" />
          ) : t.art ? (
            <WorkArt art={t.art} className="absolute inset-0 h-full w-full" />
          ) : null}
        </div>
        <figcaption
          className={`t-spec absolute ${
            fills ? 'left-2 top-2 bg-paper/95 px-2 py-1 text-ink' : `inset-x-3 top-2.5 ${luminance(t.ground) < 0.18 ? 'text-paper' : 'text-ink'}`
          }`}
        >
          <span className="sr-only">Concept design: </span>
          {t.theme} · {t.piece}
        </figcaption>
      </figure>
    </div>
  );
}

export default function Catalog() {
  const [theme, setTheme] = useState<string | null>(null);
  const [group, setGroup] = useState<PieceGroup | null>(null);
  const [shown, setShown] = useState(PAGE);

  const matches = useMemo(
    () => INSPO.filter((t) => (!theme || t.theme === theme) && (!group || t.group === group)),
    [theme, group],
  );
  // Only offer choices that lead somewhere, so a filter can never land on nothing.
  const themes = useMemo(() => INSPO_THEMES.filter((name) => INSPO.some((t) => t.theme === name && (!group || t.group === group))), [group]);
  const groups = useMemo(() => PIECE_GROUPS.filter((g) => INSPO.some((t) => t.group === g.id && (!theme || t.theme === theme))), [theme]);
  const choose = (next: () => void) => {
    next();
    setShown(PAGE);
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

      <div className="cat-frame">
        <div className="cat-wall">
          {matches.slice(0, shown).map((t) => <Tile key={t.id} t={t} />)}
        </div>
      </div>

      {matches.length > shown && (
        <div className="mt-8 flex justify-center">
          <button type="button" onClick={() => setShown((n) => n + PAGE)} className="btn-outline">
            Show more designs
          </button>
        </div>
      )}

      <Ending />
    </div>
  );
}
