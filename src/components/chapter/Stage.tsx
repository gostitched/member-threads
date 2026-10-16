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
 * Act 01's configurator: the house hoodie on its drawing sheet, eight details.
 *
 * Each detail is a numbered square chip (ink once it's on). Pressing switches
 * it on or off (colour steps through the colorways, and the site's colorway
 * with it, via `useVibe`; the hood liner goes off → solid → stripe → off).
 * Pointing at one previews where it goes and draws its leader solid. Beside the
 * sheet: the organization field (the chest script, the tech pack's woven label,
 * the finale's hang tag and /quote all read it), the colorway swatches and the
 * tech pack, which prints a line per detail at +$0.
 *
 *   ≥1280  sheet cols 1–8, panel cols 9–12
 *   ≥1024  sheet full width, panel and tech pack side by side under it
 *   <1024  the sheet bleeds edge to edge with numbered pins on the garment,
 *          then the name, the swatches, the details as a 2-up chip grid, and
 *          the tech pack
 */

// ── Sheet layout, in sheet units ────────────────────────────────────────────

const U = { w: 1400, h: 960 };
type Box = { x: number; y: number; w: number; h?: number };
const at = ({ x, y, w, h }: Box): React.CSSProperties => ({
  left: `${(x / U.w) * 100}%`,
  top: `${(y / U.h) * 100}%`,
  width: `${(w / U.w) * 100}%`,
  ...(h !== undefined ? { height: `${(h / U.h) * 100}%` } : {}),
});

const GARMENT = { x: 264, y: 34, size: 872 };
/** The drawing sheet behind the garment; the chips cross its edges. */
const PLATE = { x: 214, y: 0, w: 972, h: 960 };
/** Matches the house cut in Hoodie. */
const CUT = { w: 48, l: -70 };

/** A callout's anchor on the sheet. */
function anchor(c: Callout): [number, number] {
  let [x, y] = c.at;
  if (c.rides === 'side') x += x < 966 ? -CUT.w : CUT.w;
  if (c.rides === 'hem') y += CUT.l;
  const k = GARMENT.size / VIEW.size;
  return [GARMENT.x + (x - VIEW.x) * k, GARMENT.y + (y - VIEW.y) * k];
}

/** Where each chip sits: left chips end at x, right chips start at x (y is the chip's centre). */
const LABEL: Record<Custom, [number, number]> = {
  construction: [262, 380], patch: [262, 510], color: [262, 640], rib: [262, 830],
  liner: [1138, 120], trims: [1138, 250], embroidery: [1138, 380], print: [1138, 510],
};
const LABEL_W = 250;

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
    setSaid('Back to the house hoodie.');
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
      aria-label={color ? `${no(c.id)}, colorway: ${cw.name}. Next colorway.` : `${no(c.id)}, ${word}: ${c.add.toLowerCase()}. ${on ? 'Remove' : 'Add'}, plus $0.`}
      data-active={focus === c.id || undefined}
      data-on={on || undefined}
      onPointerEnter={(e) => e.pointerType === 'mouse' && setHover(c.id)}
      onPointerLeave={(e) => e.pointerType === 'mouse' && setHover(null)}
      onFocus={() => setHover(c.id)}
      onBlur={() => setHover(null)}
      onClick={() => press(c.id)}
      className={`chip chapter-chip ${align === 'right' ? 'flex-row-reverse' : ''} ${className}`}
    >
      <span aria-hidden className="chapter-chip-no">{no(c.id)}</span>
      <span className="chapter-chip-word">{word}</span>
      {sub && <span aria-hidden key={sub} className="chapter-chip-sub chapter-fade-in">{sub}</span>}
    </button>
  );
}

/** The site's colorway, as five round swatches with the current name and count. */
function Colorways({ look, pick, className = '' }: Pick<Shared, 'look' | 'pick'> & { className?: string }) {
  const gid = useId();
  return (
    <div className={className}>
      <div className="flex items-baseline justify-between gap-4">
        <p id={gid} className="field-label !mb-0">{ACT1.colorways}</p>
        <p className="t-spec fg-muted num">{String(look.color + 1).padStart(2, '0')} / {String(COLORWAYS.length).padStart(2, '0')}</p>
      </div>
      <div role="group" aria-labelledby={gid} className="-ml-2 mt-2 flex items-center">
        {COLORWAYS.map((c, i) => {
          const current = look.color === i;
          return (
            <button
              key={c.id}
              type="button"
              aria-pressed={current}
              aria-label={c.name}
              onClick={() => pick(i)}
              data-current={current || undefined}
              className="chapter-swatch"
              style={{ '--sw': c.body, '--sw2': c.rib } as React.CSSProperties}
            >
              <span aria-hidden className="chapter-swatch-dot" />
            </button>
          );
        })}
      </div>
      <p className="t-spec mt-2 flex items-center gap-2" aria-live="polite">
        <span key={look.color} className="chapter-fade-in">{COLORWAYS[look.color].name} body · {COLORWAYS[look.color].linerName} rib</span>
        <span aria-hidden className="text-ink/30">/</span>
        <span className="fg-muted">{ACT1.anyColor}</span>
      </p>
    </div>
  );
}

/** The organization field: the chest script, the tech pack, the finale and /quote all read it. */
function NameField({ className = '' }: { className?: string }) {
  const { raw, set, clear } = useOrgName();
  const id = useId();
  const count = raw.trim().length;
  return (
    <div className={className}>
      <div className="flex items-baseline justify-between gap-4">
        <label htmlFor={id} className="field-label !mb-0">{ACT1.nameLabel}</label>
        <span aria-hidden className="t-spec fg-muted num">{String(count).padStart(2, '0')} / {NAME_MAX}</span>
      </div>
      <div className="relative">
        <input
          id={id}
          type="text"
          value={raw}
          onChange={(e) => set(e.target.value)}
          maxLength={NAME_MAX}
          placeholder={ACT1.namePlaceholder}
          autoComplete="organization"
          autoCapitalize="words"
          spellCheck={false}
          enterKeyHint="done"
          aria-describedby={`${id}-hint`}
          className="field chapter-name-input pr-12"
        />
        {raw && (
          <button type="button" onClick={clear} aria-label="Clear the name" className="chapter-clear">
            <svg viewBox="0 0 16 16" className="h-3 w-3" aria-hidden>
              <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" />
            </svg>
          </button>
        )}
      </div>
      <p id={`${id}-hint`} className="t-small fg-muted mt-3 max-w-[34ch]">{ACT1.hint}</p>
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

/** The woven label crossing the sheet's bottom edge: roster number and the name. */
function SheetLabel({ name, className = '' }: { name: string; className?: string }) {
  return (
    <span className={`woven woven-green woven-lg chapter-sheet-label ${className}`}>
      <span className="num">No. 036</span>
      <span aria-hidden className="opacity-60">·</span>
      <span key={name} className="chapter-reweave chapter-woven-name">{name}</span>
    </span>
  );
}

function Desk(props: Shared) {
  const { look, focus, uid, press, setHover, burst, name, lines, pick, reset } = props;
  const [board, entered] = useArrive<HTMLDivElement>();

  return (
    <div className="shell">
      <div className="grid-12 items-start gap-y-12">
        <div className="col-span-12 xl:col-span-8">
          <div
            ref={board}
            data-in={entered}
            className="chapter-board relative mx-auto w-full max-w-[1100px] xl:max-w-none"
            style={{ aspectRatio: `${U.w} / ${U.h}` }}
          >
            {/* The drawing sheet: linen, crop marks, title block. */}
            <div className="chapter-sheet absolute" style={at(PLATE)}>
              <Linen />
              <span aria-hidden className="chapter-crop left-3 top-3" />
              <span aria-hidden className="chapter-crop right-3 top-3 rotate-90" />
              <span aria-hidden className="chapter-crop bottom-3 right-3 rotate-180" />
              <span aria-hidden className="chapter-crop bottom-3 left-3 -rotate-90" />
              <p aria-hidden className="t-spec fg-muted absolute right-5 top-5">MT-HD01</p>
              <p aria-hidden className="t-spec fg-muted absolute bottom-5 right-5">{ACT1.sheet}</p>
            </div>

            <div className="chapter-garment absolute" style={at({ x: GARMENT.x, y: GARMENT.y, w: GARMENT.size, h: GARMENT.size })}>
              <div className={settle(burst)}>
                <Hoodie look={look} focus={focus} uid={`${uid}-d`} name={name} />
              </div>
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
                    <rect className="chapter-lead-dot" x={ax - 6} y={ay - 6} width="12" height="12" />
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
                      <span key={`stamp-${burst.n}`} aria-hidden className={`chapter-added woven woven-beige slap ${left ? 'right-full mr-2' : 'left-full ml-2'}`} style={{ '--r': left ? '-3deg' : '3deg' } as React.CSSProperties}>
                        {ACT1.added}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}

            <div className="absolute z-30" style={{ ...at({ x: PLATE.x + 40, y: PLATE.h, w: 600 }), transform: 'translateY(-50%)' }}>
              <SheetLabel name={name} />
            </div>
          </div>
        </div>

        {/* Under the sheet: the name and the colorway, where you'd write them on a spec. */}
        <div className="col-span-6 grid items-start gap-x-12 gap-y-10 xl:col-span-8 xl:row-start-2 xl:grid-cols-2">
          <NameField />
          <Colorways look={look} pick={pick} />
        </div>
        <div className="col-span-6 xl:col-span-4 xl:col-start-9 xl:row-span-2 xl:row-start-1">
          <Receipt lines={lines} focus={focus} name={name} look={look} rev={burst.n} onReset={reset} setHover={setHover} />
        </div>
      </div>
    </div>
  );
}

// ── Phone and tablet: the same configurator, composed for the thumb ──────────

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
    <div>
      <div className="chapter-sheet relative mx-auto max-w-[44rem] sm:mx-8 md:mx-auto">
        <Linen />
        <span aria-hidden className="chapter-crop left-3 top-3" />
        <span aria-hidden className="chapter-crop right-3 top-3 rotate-90" />
        <p aria-hidden className="t-spec fg-muted absolute right-4 top-4 z-10">MT-HD01</p>
        <div className="relative mx-auto w-[94%] pt-6">
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
                {no(c.id)}
              </span>
            );
          })}
        </div>
      </div>
      <div className="relative z-10 mx-auto flex max-w-[44rem] -translate-y-1/2 px-5 sm:px-8">
        <SheetLabel name={name} />
      </div>

      <div className="shell mx-auto mt-8 max-w-[44rem]">
        <NameField />
        <Colorways look={look} pick={pick} className="mt-10" />
        <div className="mt-10">
          <div className="flex items-baseline justify-between gap-4">
            <p className="field-label !mb-0">{ACT1.details}</p>
            <p className="t-spec fg-muted">Each +$0</p>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {CALLOUTS.map((c) => (
              <Step key={c.id} c={c} look={look} focus={focus} press={press} setHover={setHover} name={name} className="w-full justify-start" />
            ))}
          </div>
        </div>
        <div className="mx-auto mt-14 max-w-[26rem]">
          <Receipt lines={lines} focus={focus} name={name} look={look} rev={burst.n} onReset={reset} setHover={setHover} />
        </div>
      </div>
    </div>
  );
}
