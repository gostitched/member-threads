'use client';

import { useCallback, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import Hoodie from './Hoodie';
import { VIEW } from './geometry';
import Receipt, { type SlipLine } from './Receipt';
import { register } from '@/lib/reveal';
import { NAME_MAX, YOUR_NAME, useOrgName } from '@/lib/name';
import { useVibe } from '@/lib/vibe';
import {
  ACT1, BLANK, CALLOUTS, COLORWAYS, LINER_STARS, colorwayIndex, isOn, named,
  type Callout, type Custom, type Look,
} from '@/lib/chapter';

/**
 * Act 01's toy: their hoodie on a pale-blue plate, seven details to tap.
 *
 * Each callout (a white pill; navy once it's on) switches a detail on or off
 * (colour steps through the colorways, and the site's colorway with it, via
 * `useVibe`; the hood liner goes off → solid → stars → off). Pointing at one
 * previews where it goes. Under the hoodie: the
 * name pill (the chest script, shared with the finale and /quote) and the five
 * colorway dots. The tech-pack slip sits top left on the board (under the chips on a phone).
 *
 * Desktop lays it out as one board with leaders; a phone gets the hoodie, the
 * name, the colorway dots and the details as chips.
 */

// ── Board layout, in board units (1600 × 1000) ──────────────────────────────

const U = { w: 1600, h: 1060 };
type Box = { x: number; y: number; w: number; h?: number };
const at = ({ x, y, w, h }: Box): React.CSSProperties => ({
  left: `${(x / U.w) * 100}%`,
  top: `${(y / U.h) * 100}%`,
  width: `${(w / U.w) * 100}%`,
  ...(h !== undefined ? { height: `${(h / U.h) * 100}%` } : {}),
});

const GARMENT = { x: 380, y: 10, size: 840 };
/** The pale-blue plate behind the garment and the name row. */
const PLATE = { x: 400, y: 0, w: 800, h: 1050 };
/** Matches the house cut in Hoodie. */
const CUT = { w: 48, l: -70 };

/** A callout's anchor on the board. */
function anchor(c: Callout): [number, number] {
  let [x, y] = c.at;
  if (c.rides === 'side') x += x < 966 ? -CUT.w : CUT.w;
  if (c.rides === 'hem') y += CUT.l;
  const k = GARMENT.size / VIEW.size;
  return [GARMENT.x + (x - VIEW.x) * k, GARMENT.y + (y - VIEW.y) * k];
}

/** Where each label sits. Left labels end at x; right labels start at x. */
const LABEL: Partial<Record<Custom, [number, number]>> = {
  construction: [350, 325], patch: [350, 450], color: [350, 570], rib: [350, 777],
  liner: [1250, 61], embroidery: [1250, 362], print: [1250, 470],
};
const LABEL_W = 260;

function lineOf(c: Callout, look: Look, name: string, you = false) {
  const cw = COLORWAYS[look.color];
  const line = c.id === 'liner' && look.linerStars ? LINER_STARS.line : c.line;
  return named(line.replace('{color}', cw.name).replace('{liner}', cw.linerName), name, you);
}

/** The last detail that went on, and a counter so the chip and bump replay. */
type Burst = { id: Custom | null; n: number };

export default function Stage({ receipt = false }: { receipt?: boolean }) {
  const uid = useId().replace(/:/g, '');
  const [look, setLook] = useState<Look>(BLANK);
  const [order, setOrder] = useState<Custom[]>([]);
  const [focus, setHover] = useState<Custom | null>(null);
  const [said, setSaid] = useState('');
  const [burst, setBurst] = useState<Burst>({ id: null, n: 0 });
  const { name: typed, isDefault: you } = useOrgName();
  /** What the garment and tag show: the typed name, or a prompt. */
  const name = you ? YOUR_NAME : typed;
  const { vibe, set: setVibe } = useVibe();
  const ci = colorwayIndex(vibe.id);
  const nameRef = useRef(name);
  nameRef.current = name;
  const ciRef = useRef(ci);
  ciRef.current = ci;

  const apply = useCallback((id: Custom, step: (l: Look) => Look) => {
    setLook((l) => {
      const next = step(l);
      const on = isOn(next, id);
      setOrder((o) => (on ? (o.includes(id) ? o : [...o, id]) : o.filter((x) => x !== id)));
      const c = CALLOUTS.find((x) => x.id === id)!;
      const who = nameRef.current;
      setSaid(on ? `${lineOf(c, next, who)}: on.` : `${named(c.word, who)}: off.`);
      setBurst((b) => ({ id: on ? id : null, n: b.n + 1 }));
      return next;
    });
  }, []);

  // Colour steps through the colorways (and the site's colorway with it);
  // everything else switches on or off.
  const pick = useCallback(
    (i: number) => {
      setVibe(COLORWAYS[i].id);
      apply('color', (l) => ({ ...l, colorSet: true, color: i }));
    },
    [apply, setVibe],
  );
  const press = useCallback(
    (id: Custom) => {
      if (id === 'color') return pick((ciRef.current + 1) % COLORWAYS.length);
      // The liner has a second step: solid, then stars, then off.
      if (id === 'liner') {
        return apply(id, (l) => (!l.liner ? { ...l, liner: true, linerStars: false } : !l.linerStars ? { ...l, linerStars: true } : { ...l, liner: false, linerStars: false }));
      }
      apply(id, (l) => ({ ...l, [id]: !l[id] }));
    },
    [apply, pick],
  );

  // The garment always wears the site's colorway (the hero can change it too).
  const shown = useMemo(() => ({ ...look, color: ci }), [look, ci]);
  const lines: SlipLine[] = useMemo(
    () => order.map((id) => ({ id, label: lineOf(CALLOUTS.find((c) => c.id === id)!, shown, name) })),
    [order, shown, name],
  );
  const shared: Shared = { look: shown, focus, uid, press, pick, setHover, burst, name, lines };

  return (
    <>
      <p aria-live="polite" className="sr-only">{said}</p>
      <div className="hidden lg:block"><Board {...shared} /></div>
      <div className="lg:hidden"><Stacked {...shared} /></div>
    </>
  );
}

type Shared = {
  look: Look;
  focus: Custom | null;
  uid: string;
  press: (id: Custom) => void;
  pick: (i: number) => void;
  burst: Burst;
  name: string;
  lines: SlipLine[];
  setHover: (id: Custom | null) => void;
};

/** One detail. A real button: pointing previews it, pressing adds (or removes) it. */
function Step({
  c,
  look,
  focus,
  press,
  setHover,
  burst,
  name,
  variant,
  align = 'left',
  className = '',
  style,
}: Pick<Shared, 'look' | 'focus' | 'press' | 'setHover' | 'burst' | 'name'> & {
  c: Callout;
  variant: 'board' | 'chip';
  align?: 'left' | 'right';
  className?: string;
  style?: React.CSSProperties;
}) {
  const on = isOn(look, c.id);
  const color = c.id === 'color';
  const cw = COLORWAYS[look.color];
  const word = named(c.word, name);
  return (
    <button
      type="button"
      aria-pressed={color ? undefined : on}
      aria-label={color ? `Color: ${cw.name}. Change color.` : `${word}: ${c.add}. ${on ? 'Remove' : 'Add'}.`}
      data-active={focus === c.id || undefined}
      data-on={on || undefined}
      onPointerEnter={(e) => e.pointerType === 'mouse' && setHover(c.id)}
      onPointerLeave={(e) => e.pointerType === 'mouse' && setHover(null)}
      onFocus={() => setHover(c.id)}
      onBlur={() => setHover(null)}
      onClick={() => press(c.id)}
      className={`${variant === 'board' ? 'chapter-callout' : 'chapter-chip'} ${align === 'right' ? 'text-right' : 'text-left'} ${className}`}
      style={style}
    >
      <span className={`chapter-callout-head ${align === 'right' ? 'flex-row-reverse' : ''}`}>
        <span aria-hidden className="chapter-callout-dot" />
        <span>{word}</span>
      </span>
    </button>
  );
}

/** Replays the garment's little bump on every press: the class name alternates, so the animation restarts. */
const bump = (b: Burst) => (b.n === 0 ? '' : b.n % 2 ? 'chapter-bump-a' : 'chapter-bump-b');

/**
 * Four flat dots, the site's colorways minus Berry (too close to Lily in a row
 * this small; still reachable from the hero, and shown here while it's current),
 * then a rainbow "any color" mark. The mark is not a control: it only says the
 * dots are examples. 34px targets, 22px dots.
 */
function Colorways({ look, pick, className = '' }: Pick<Shared, 'look' | 'pick'> & { className?: string }) {
  return (
    <div role="group" aria-label={ACT1.colorways} className={`flex items-center justify-center gap-0.5 ${className}`}>
      {COLORWAYS.map((c, i) => {
        const current = look.color === i;
        if (c.id === 'varsity' && !current) return null;
        return (
          <button
            key={c.id}
            type="button"
            aria-pressed={current}
            aria-label={`Colorway: ${c.name}`}
            onClick={() => pick(i)}
            data-current={current || undefined}
            className="chapter-swatch"
            style={{ '--sw': c.body } as React.CSSProperties}
          >
            <span aria-hidden className="chapter-swatch-dot" />
          </button>
        );
      })}
      <span className="chapter-anycolor">
        <span aria-hidden className="chapter-anycolor-dot" />
        {ACT1.anyColor}
      </span>
    </div>
  );
}

/** The name input: the chest script, the finale and /quote all read it. */
function NameField({ className = '' }: { className?: string }) {
  const { raw, set, clear } = useOrgName();
  return (
    <div className={`chapter-name relative flex h-10 w-[12rem] items-center rounded-full bg-white ${className}`}>
      <input
        type="text"
        value={raw}
        onChange={(e) => set(e.target.value)}
        maxLength={NAME_MAX}
        placeholder="Your name"
        aria-label="Name"
        autoComplete="off"
        autoCapitalize="words"
        spellCheck={false}
        enterKeyHint="done"
        className="caps h-full w-full rounded-full bg-transparent pl-4 pr-10 text-[0.9375rem] text-ink caret-uv placeholder:text-ink/40 focus-visible:outline-none"
      />
      {raw && (
        <button
          type="button"
          onClick={clear}
          aria-label="Clear the name"
          className="absolute right-0.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-ink/50 transition-colors hover:text-ink"
        >
          <svg viewBox="0 0 16 16" className="h-3 w-3" aria-hidden>
            <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      )}
    </div>
  );
}

function Board({ look, focus, uid, press, pick, setHover, burst, name, lines }: Shared) {
  const board = useRef<HTMLDivElement>(null);
  const [entered, setEntered] = useState(true);

  // Arm the entrance only if the board starts below the fold; before paint, so
  // nothing flashes. With reduced motion it simply renders finished.
  useLayoutEffect(() => {
    const el = board.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight) return;
    setEntered(false);
    return register({ el, show: () => setEntered(true) });
  }, []);

  const shown = CALLOUTS.filter((c) => LABEL[c.id]);

  return (
    <div className="shell max-w-[1240px]">
      <div
        ref={board}
        data-in={entered}
        data-focus={focus ?? undefined}
        className="chapter-board relative mx-auto w-full"
        style={{ aspectRatio: `${U.w} / ${U.h}` }}
      >
        <div aria-hidden className="chapter-plate-01 absolute rounded-[28px] bg-electric-lit" style={at(PLATE)} />

        {/* The slip, bottom right beside the garment, so it prints in view of every step. */}
        <div className="chapter-obj chapter-slip-wrap" style={{ ...at({ x: 1270, y: 575, w: 330 }), '--r': '1deg', '--from': '40px 0', '--d': '450ms' } as React.CSSProperties}>
          <Receipt lines={lines} focus={focus} name={name} />
        </div>

        <div className="chapter-garment absolute" style={at({ x: GARMENT.x, y: GARMENT.y, w: GARMENT.size, h: GARMENT.size })}>
          <div className={bump(burst)}>
            <Hoodie look={look} focus={focus} uid={`${uid}-d`} name={name} />
          </div>
        </div>
        <div className="chapter-namerow absolute z-30 flex items-center justify-center gap-3" style={at({ x: PLATE.x, y: 900, w: PLATE.w })}>
          <NameField />
          <Colorways look={look} pick={pick} />
        </div>

        {/* Leaders */}
        <svg aria-hidden viewBox={`0 0 ${U.w} ${U.h}`} className="pointer-events-none absolute inset-0 h-full w-full overflow-visible">
          {shown.map((c, i) => {
            const [ax, ay] = anchor(c);
            const [lx, ly] = LABEL[c.id]!;
            const ex = c.side === 'left' ? lx + 12 : lx - 12;
            const y = ly + 26;
            return (
              <g key={c.id} data-active={focus === c.id || undefined} data-on={isOn(look, c.id) || undefined} className="chapter-leader" style={{ '--d': `${700 + i * 60}ms` } as React.CSSProperties}>
                <path className="chapter-lead" pathLength={1} d={`M${ax} ${ay}L${ex + (ax - ex) * 0.3} ${y}L${ex} ${y}`} />
                <circle className="chapter-lead-dot" cx={ax} cy={ay} r="5" />
              </g>
            );
          })}
        </svg>

        {shown.map((c, i) => {
          const [lx, ly] = LABEL[c.id]!;
          const left = c.side === 'left';
          return (
            <div
              key={c.id}
              className="chapter-callout-in absolute z-30"
              style={{ ...at({ x: left ? lx - LABEL_W : lx, y: ly, w: LABEL_W }), '--d': `${780 + i * 60}ms` } as React.CSSProperties}
            >
              <Step
                c={c}
                look={look}
                focus={focus}
                press={press}
                setHover={setHover}
                burst={burst}
                name={name}
                variant="board"
                align={left ? 'right' : 'left'}
                className={`relative ${left ? 'ml-auto' : ''}`}
              />
              {burst.id === c.id && (
                <span key={`stamp-${burst.n}`} aria-hidden className={`chapter-added ${left ? 'right-full mr-3' : 'left-full ml-3'}`}>
                  {ACT1.added}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Phone: the same toy, stacked ─────────────────────────────────────────────

function Stacked({ look, focus, uid, press, pick, setHover, burst, name, lines }: Shared) {
  return (
    <div className="shell">
      <div className="relative isolate mx-auto max-w-[30rem]">
        <div aria-hidden className="absolute inset-x-0 -bottom-2 top-[6%] z-[-1] rounded-[28px] bg-electric-lit" />
        <div className={bump(burst)}>
          <Hoodie look={look} focus={focus} uid={`${uid}-m`} name={name} />
        </div>
        {CALLOUTS.map((c) => {
          const [px, py] = c.pin ?? c.at;
          return (
            <span
              key={c.id}
              aria-hidden
              data-active={focus === c.id || undefined}
              data-on={isOn(look, c.id) || undefined}
              className="chapter-pin absolute"
              style={{ left: `${((px - VIEW.x) / VIEW.size) * 100}%`, top: `${((py - VIEW.y) / VIEW.size) * 100}%` }}
            />
          );
        })}
      </div>
      <div className="mt-5 flex flex-col items-center gap-2">
        <NameField />
        <Colorways look={look} pick={pick} />
      </div>
      <div className="mx-auto mt-5 flex max-w-[30rem] flex-wrap justify-center gap-2">
        {CALLOUTS.map((c) => (
          <Step key={c.id} c={c} look={look} focus={focus} press={press} setHover={setHover} burst={burst} name={name} variant="chip" />
        ))}
      </div>
      <div className="mx-auto mb-12 mt-10 w-[min(92%,21rem)] sm:w-[min(100%,24rem)]">
        <Receipt lines={lines} focus={focus} name={name} />
      </div>
    </div>
  );
}
