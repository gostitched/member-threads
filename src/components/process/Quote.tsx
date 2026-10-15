import Thread from '@/components/thread/Thread';
import { PROCESS } from '@/lib/process';
import { draw, fade, shift, type Cue } from '@/lib/thread';

/**
 * 03 / QUOTE — an internal production ticket, not a pricing card.
 *
 * The thread comes in at the top-right corner, stitches the ticket down along its
 * top and left edges, ties off with a small cross at the bottom corner and leaves.
 * Then APPROVED is stamped once: the only punch in the section.
 */

const W = 264;
const H = 348;

/** In at the top-right corner, along the top, down the left edge. */
const STITCH = `M${W + 16} -10 L${W - 12} 11 L11 11 L11 ${H - 11}`;
/** The tie-off, then a short tail out of the ticket. */
const TACK = `M4 ${H - 18} L18 ${H - 4} M18 ${H - 18} L4 ${H - 4}`;
const TAIL = `M11 ${H - 11} L14 ${H + 14}`;

// A fixed barcode, so server and client agree.
const BARS = [2, 1, 1, 3, 1, 2, 1, 1, 2, 3, 1, 1, 2, 1, 3, 1, 2, 2, 1, 1, 3, 1, 1, 2, 1, 2, 1, 3, 1, 1, 2, 1];

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-ink/15 py-[5px]">
      <dt className="text-ink/50">{k}</dt>
      <dd>{v}</dd>
    </div>
  );
}

function Reg({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 12 12" className={`absolute h-3 w-3 text-ink/40 ${className}`}>
      <circle cx="6" cy="6" r="3" fill="none" stroke="currentColor" strokeWidth="0.8" />
      <path d="M6 0 V12 M0 6 H12" stroke="currentColor" strokeWidth="0.8" />
    </svg>
  );
}

export default function Quote({ seen, sew }: { seen: Cue; sew: Cue }) {
  const t = PROCESS.ticket;
  let x = 0;

  return (
    <div
      aria-hidden
      className="relative rotate-[2.5deg] bg-white text-ink shadow-[0_30px_50px_-18px_rgba(0,0,0,0.85)]"
      style={{ width: W, height: H, ...fade(seen, 250, 600) }}
    >
      <div className="flex h-full flex-col px-6 pb-5 pt-7 font-mono text-[10px] uppercase leading-[1.3] tracking-[0.08em]">
        <div className="flex items-baseline justify-between">
          <span className="text-[11px] font-semibold tracking-[0.04em]">{t.brand}</span>
          <span className="text-ink/50">Nº {t.project}</span>
        </div>
        <p className="mt-1 text-ink/50">Production ticket</p>

        <dl className="mt-5 border-t border-ink/60">
          <Row k="Project" v={t.project} />
          <Row k="Style" v={t.style} />
          <Row k="Qty" v={t.qty} />
          <Row k="Price" v={t.price} />
          <Row k="Decoration" v={t.decoration} />
          <Row k="Design" v={t.design} />
          <div className="flex justify-between py-[5px]">
            <dt className="text-ink/50">Status</dt>
            <dd />
          </div>
        </dl>

        <div className="mt-auto flex items-end justify-between">
          <svg viewBox="0 0 64 22" className="h-[22px] w-[92px]">
            {BARS.map((b, i) => {
              const r = <rect key={i} x={x} y={0} width={b * 0.7} height={22} fill={i % 2 ? 'transparent' : 'currentColor'} />;
              x += b * 0.7 + 0.5;
              return r;
            })}
          </svg>
          <span className="text-[8px] text-ink/50">{t.project}-02 / {t.total}</span>
        </div>
      </div>

      <Reg className="right-2 top-2" />
      <Reg className="bottom-2 right-2" />

      {/* APPROVED: stamped once, slightly crooked, not quite full ink. */}
      <div
        className="stamp-grain absolute bottom-[78px] right-7 border-[2.5px] border-ink px-2.5 py-1 font-mono uppercase text-[15px] font-bold tracking-[0.18em] text-ink"
        style={shift(
          sew,
          2150,
          380,
          { opacity: 0, transform: 'rotate(-9deg) scale(1.7)' },
          { opacity: 0.88, transform: 'rotate(-9deg) scale(1)' },
          'cubic-bezier(0.5, 0, 0.75, 0)',
        )}
      >
        Approved
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="pointer-events-none absolute inset-0 h-full w-full overflow-visible">
        <Thread d={STITCH} cue={sew} at={950} dur={1000} stitch="running" width={2.2} dash="6 4" data-in />
        <g fill="none" stroke="var(--thread)" strokeWidth="2.2" strokeLinecap="round">
          <path d={TACK} pathLength={1} style={draw(sew, 1950, 200)} />
        </g>
        <Thread d={TAIL} cue={sew} at={2050} dur={150} width={2.2} data-out />
      </svg>
    </div>
  );
}
