'use client';

import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import Hoodie from './Hoodie';
import { VIEW } from './geometry';
import Receipt, { type SlipLine } from './Receipt';
import { register } from '@/lib/reveal';
import { NAME_MAX, YOUR_NAME, useOrgName } from '@/lib/name';
import { useVibe } from '@/lib/vibe';
import {
  ACT1, BLANK, CALLOUTS, COLORWAYS, LINER_STRIPE, colorwayIndex, initial, isOn, named,
  type Callout, type Custom, type Look,
} from '@/lib/chapter';

/**
 * Act 01's toy: the signature hoodie on its drawing sheet, eight details to tap.
 *
 * Each detail is a square chip (ink once it's on). Pressing switches
 * it on or off (colour steps through the colorways, and the site's colorway
 * with it, via `useVibe`; the hood liner goes off → solid → stripe → off).
 * Pointing at one previews where it goes and draws its leader solid. Under the
 * hoodie: the organization field (the chest script, the tech pack's woven
 * label, the finale and /quote all read it) and the colorway swatches. The tech
 * pack sits on the board's lower right and prints a line per detail at +$0.
 *
 * Desktop lays it out as one board with leaders; a phone gets the hoodie with
 * pins, the name, the swatches, the details as chips, and the tech pack.
 */

// ── Board layout, in board units (1600 × 1000) ──────────────────────────────

const U = { w: 1600, h: 1000 };
type Box = { x: number; y: number; w: number; h?: number };
const at = ({ x, y, w, h }: Box): React.CSSProperties => ({
  left: `${(x / U.w) * 100}%`,
  top: `${(y / U.h) * 100}%`,
  width: `${(w / U.w) * 100}%`,
  ...(h !== undefined ? { height: `${(h / U.h) * 100}%` } : {}),
});

const GARMENT = { x: 380, y: 10, size: 840 };
/** The drawing sheet behind the garment and the name row; the chips sit either side of it. */
const PLATE = { x: 400, y: 0, w: 800, h: 1000 };
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

/** Where each chip sits: left chips end at x, right chips start at x (y is the chip's centre). */
const LABEL: Record<Custom, [number, number]> = {
  construction: [350, 350], patch: [350, 476], color: [350, 596], rib: [350, 803],
  liner: [1250, 88], trims: [1250, 236], embroidery: [1250, 388], print: [1250, 496],
};
const LABEL_W = 280;

/** Two-digit roster number for a detail. */
const no = (id: Custom) => String(CALLOUTS.findIndex((c) => c.id === id) + 1).padStart(2, '0');

function lineOf(c: Callout, look: Look, name: string, you = false) {
  const cw = COLORWAYS[look.color];
  const line = c.id === 'liner' && look.linerStripe ? LINER_STRIPE.line : c.line;
  return named(
    line.replace('{color}', cw.name).replace('{liner}', cw.linerName).replace('{accent}', cw.accentName.toLowerCase()).replace('{initial}', initial(name)),
    name,
    you,
  );
}

/** The last detail that went on, and a counter so the stamp and the settle replay. */
type Burst = { id: Custom | null; n: number };

export default function Stage({ receipt: _receipt = false }: { receipt?: boolean }) {
  const uid = useId().replace(/:/g, '');
  const [look, setLook] = useState<Look>(BLANK);
  const [order, setOrder] = useState<Custom[]>(['embroidery']);
  const [focus, setHover] = useState<Custom | null>(null);
  const [said, setSaid] = useState('');
  const [burst, setBurst] = useState<Burst>({ id: null, n: 0 });
  const { name: typed, isDefault: you } = useOrgName();
  /** What the garment and the tech pack show: the typed name, or a prompt. */
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
      setSaid(on ? `${lineOf(c, next, who)}: added, plus $0.` : `${named(c.word, who)}: removed.`);
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
      // The liner has a second step: solid, then a rugby stripe, then off.
      if (id === 'liner') {
        return apply(id, (l) => (!l.liner ? { ...l, liner: true, linerStripe: false } : !l.linerStripe ? { ...l, linerStripe: true } : { ...l, liner: false, linerStripe: false }));
      }
      apply(id, (l) => ({ ...l, [id]: !l[id] }));
    },
    [apply, pick],
  );
  const reset = useCallback(() => {
    setLook(BLANK);
    setOrder(['embroidery']);
    setBurst((b) => ({ id: null, n: b.n + 1 }));
    setSaid('Back to the signature hoodie.');
  }, []);

  // The garment always wears the site's colorway (the hero can change it too).
  const shown = useMemo(() => ({ ...look, color: ci }), [look, ci]);
  const lines: SlipLine[] = useMemo(
    () => order.map((id) => ({ id, no: no(id), label: lineOf(CALLOUTS.find((c) => c.id === id)!, shown, name) })),
    [order, shown, name],
  );
  const shared: Shared = { look: shown, focus, uid, press, pick, setHover, burst, name, lines, reset };

  return (
    <>
      <p aria-live="polite" className="sr-only">{said}</p>
      <div className="hidden lg:block"><Desk {...shared} /></div>
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
  reset: () => void;
};

/** One detail: a square chip with its roster number. Pointing previews it, pressing adds (or removes) it. */
function Step({
  c,
  look,
  focus,
  press,
  setHover,
  name,
  align = 'left',
  className = '',
}: Pick<Shared, 'look' | 'focus' | 'press' | 'setHover' | 'name'> & {
  c: Callout;
  align?: 'left' | 'right';
  className?: string;
}) {
  const on = isOn(look, c.id);
  const color = c.id === 'color';
  const cw = COLORWAYS[look.color];
  const word = named(c.word, name);
  const sub = color ? cw.name : c.id === 'liner' && look.liner ? (look.linerStripe ? 'Stripe' : 'Solid') : null;
  return (
    <button
      type="button"
      aria-pressed={color ? undefined : on}
      aria-label={color ? `Colorway: ${cw.name}. Next colorway.` : `${word}: ${c.add.toLowerCase()}. ${on ? 'Remove' : 'Add'}, plus $0.`}
      data-active={focus === c.id || undefined}
      data-on={on || undefined}
      onPointerEnter={(e) => e.pointerType === 'mouse' && setHover(c.id)}
      onPointerLeave={(e) => e.pointerType === 'mouse' && setHover(null)}
      onFocus={() => setHover(c.id)}
      onBlur={() => setHover(null)}
      onClick={() => press(c.id)}
      className={`chip chapter-chip ${className}`}
    >
      <span className="chapter-chip-word">{word}</span>
      {sub && <span aria-hidden key={sub} className="chapter-chip-sub chapter-fade-in">{sub}</span>}
    </button>
  );
}

/** The site's colorway as five round swatches, then a quiet "any color": the five are examples. */
function Colorways({ look, pick, className = '' }: Pick<Shared, 'look' | 'pick'> & { className?: string }) {
  return (
    <div role="group" aria-label={`${ACT1.colorways}: ${COLORWAYS[look.color].name}`} className={`flex items-center justify-center ${className}`}>
      {COLORWAYS.map((c, i) => {
        const current = look.color === i;
        return (
          <button
            key={c.id}
            type="button"
            aria-pressed={current}
            aria-label={`Colorway: ${c.name}`}
            onClick={() => pick(i)}
            data-current={current || undefined}
            className="chapter-swatch"
            style={{ '--sw': c.body, '--sw2': c.rib } as React.CSSProperties}
          >
            <span aria-hidden className="chapter-swatch-dot" />
          </button>
        );
      })}
      <span className="t-spec fg-muted ml-2 whitespace-nowrap">{ACT1.anyColor}</span>
    </div>
  );
}

/** The organization field: the chest script, the tech pack, the finale and /quote all read it. */
function NameField({ className = '' }: { className?: string }) {
  const { raw, set, clear } = useOrgName();
  return (
    <div className={`relative w-[17rem] max-w-full ${className}`}>
      <input
        type="text"
        value={raw}
        onChange={(e) => set(e.target.value)}
        maxLength={NAME_MAX}
        placeholder={ACT1.namePlaceholder}
        aria-label={ACT1.nameLabel}
        autoComplete="organization"
        autoCapitalize="words"
        spellCheck={false}
        enterKeyHint="done"
        className="field chapter-name-input !py-2 !text-[1.125rem] pr-10"
      />
      {raw && (
        <button type="button" onClick={clear} aria-label="Clear the name" className="chapter-clear">
          <svg viewBox="0 0 16 16" className="h-3 w-3" aria-hidden>
            <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" />
          </svg>
        </button>
      )}
    </div>
  );
}

/** Settles in once when scrolled to (before paint, so nothing flashes). */
function useArrive<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [inn, setIn] = useState(true);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight * 0.85) return;
    setIn(false);
    return register({ el, show: () => setIn(true) });
  }, []);
  return [ref, inn] as const;
}

/** A soft settle on the garment after each press: the class alternates so the animation restarts. */
const settle = (b: Burst) => (b.n === 0 ? '' : b.n % 2 ? 'chapter-settle-a' : 'chapter-settle-b');

/** The weave under the drawing: a fine plain-weave texture, drawn in CSS. */
function Linen() {
  return <div aria-hidden className="chapter-linen" />;
}

function Desk(props: Shared) {
  const { look, focus, uid, press, setHover, burst, name, lines, pick, reset } = props;
  const [board, entered] = useArrive<HTMLDivElement>();

  return (
    <div className="shell max-w-[1320px]">
      <div
        ref={board}
        data-in={entered}
        className="chapter-board relative mx-auto w-full"
        style={{ aspectRatio: `${U.w} / ${U.h}` }}
      >
        {/* The drawing sheet: linen, crop marks, title block. */}
        <div className="chapter-sheet absolute" style={at(PLATE)}>
          <Linen />
        </div>

        {/* The tech pack, lower right beside the garment, so it prints in view of every step. */}
        <div className="chapter-callout-in absolute z-20 hidden xl:block" style={{ ...at({ x: 1250, y: 560, w: 350 }), '--d': '450ms' } as React.CSSProperties}>
          <Receipt lines={lines} focus={focus} name={name} look={look} rev={burst.n} onReset={reset} setHover={setHover} className="chapter-slip-board" />
        </div>

        <div className="chapter-garment absolute" style={at({ x: GARMENT.x, y: GARMENT.y, w: GARMENT.size, h: GARMENT.size })}>
          <div className={settle(burst)}>
            <Hoodie look={look} focus={focus} uid={`${uid}-d`} name={name} />
          </div>
        </div>

        {/* Under the garment, on the sheet: the name and the colorway. */}
        <div className="chapter-callout-in absolute z-30 flex items-center justify-center gap-5" style={{ ...at({ x: PLATE.x, y: 905, w: PLATE.w }), '--d': '520ms' } as React.CSSProperties}>
          <NameField />
          <Colorways look={look} pick={pick} />
        </div>

        {/* Leaders: 1px dashed ink at 40%; solid and full ink while pointed at. */}
        <svg aria-hidden viewBox={`0 0 ${U.w} ${U.h}`} className="chapter-leaders pointer-events-none absolute inset-0 h-full w-full overflow-visible">
          {CALLOUTS.map((c, i) => {
            const [ax, ay] = anchor(c);
            const [lx, ly] = LABEL[c.id];
            const left = c.side === 'left';
            const ex = left ? lx + 6 : lx - 6;
            const knee = ex + (ax - ex) * 0.32;
            return (
              <g key={c.id} data-active={focus === c.id || undefined} data-on={isOn(look, c.id) || undefined} className="chapter-leader" style={{ '--d': `${560 + i * 60}ms` } as React.CSSProperties}>
                <path className="chapter-lead" d={`M${ex} ${ly}L${knee} ${ly}L${ax} ${ay}`} />
                <path className="chapter-lead-solid" pathLength={1} d={`M${ex} ${ly}L${knee} ${ly}L${ax} ${ay}`} />
              </g>
            );
          })}
        </svg>

        {CALLOUTS.map((c, i) => {
          const [lx, ly] = LABEL[c.id];
          const left = c.side === 'left';
          return (
            <div
              key={c.id}
              className={`chapter-callout-in absolute z-30 flex -translate-y-1/2 ${left ? 'justify-end' : 'justify-start'}`}
              style={{ ...at({ x: left ? lx - LABEL_W : lx, y: ly, w: LABEL_W }), '--d': `${640 + i * 60}ms` } as React.CSSProperties}
            >
              <div className="relative">
                <Step c={c} look={look} focus={focus} press={press} setHover={setHover} name={name} align={left ? 'right' : 'left'} />
                {burst.id === c.id && (
                  <span key={`stamp-${burst.n}`} aria-hidden className={`chapter-added t-spec slap ${left ? 'right-full mr-2' : 'left-full ml-2'}`}>
                    {ACT1.added}
                  </span>
                )}
              </div>
            </div>
          );
        })}

      </div>
      {/* Narrower desks: the board has no room beside the garment, so the tech pack sits under it. */}
      <div className="mx-auto mt-16 max-w-[24rem] xl:hidden">
        <Receipt lines={lines} focus={focus} name={name} look={look} rev={burst.n} onReset={reset} setHover={setHover} />
      </div>
    </div>
  );
}

// ── Phone: the same toy, stacked ─────────────────────────────────────────────

function Stacked({ look, focus, uid, press, pick, setHover, burst, name, lines, reset }: Shared) {
  // Light the pin for the detail that just went on, briefly.
  const [lit, setLit] = useState<Custom | null>(null);
  useEffect(() => {
    if (!burst.id) return;
    setLit(burst.id);
    const t = window.setTimeout(() => setLit(null), 1100);
    return () => window.clearTimeout(t);
  }, [burst]);

  return (
    <div className="shell">
      <div className="chapter-sheet relative isolate mx-auto max-w-[30rem] pb-6 pt-2" style={{ overflow: 'visible' }}>
        <Linen />
        <div className="relative">
          <div className={settle(burst)}>
            <Hoodie look={look} focus={focus} uid={`${uid}-m`} name={name} />
          </div>
          {CALLOUTS.map((c) => {
            const [px, py] = c.pin ?? c.at;
            return (
              <span
                key={c.id}
                aria-hidden
                data-active={focus === c.id || lit === c.id || undefined}
                data-on={isOn(look, c.id) || undefined}
                className="chapter-pin"
                style={{ left: `${((px - VIEW.x) / VIEW.size) * 100}%`, top: `${((py - VIEW.y) / VIEW.size) * 100}%` }}
              >
              </span>
            );
          })}
        </div>
        <div className="mt-2 flex flex-col items-center gap-1 px-4">
          <NameField />
          <Colorways look={look} pick={pick} />
        </div>
      </div>
      <div className="mx-auto mt-10 grid max-w-[30rem] grid-cols-2 gap-2">
        {CALLOUTS.map((c) => (
          <Step key={c.id} c={c} look={look} focus={focus} press={press} setHover={setHover} name={name} className="w-full justify-start" />
        ))}
      </div>
      <div className="mx-auto mt-10 max-w-[24rem]">
        <Receipt lines={lines} focus={focus} name={name} look={look} rev={burst.n} onReset={reset} setHover={setHover} />
      </div>
    </div>
  );
}
