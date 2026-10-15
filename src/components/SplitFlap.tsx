'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Split-flap board text.
 *
 * Cells advance forward through the charset one step at a time until they reach
 * their target letter, the way a mechanical board does — random glyphs read as
 * noise, ordered ones read as machinery. Cells settle left to right.
 *
 * Three things keep it honest:
 * - The real string is always in the DOM for assistive tech; the flapping cells
 *   are decorative and hidden from it.
 * - State starts at the final text, so server output and no-JS readers get the
 *   real words and never a row of blanks.
 * - Each cell is width-locked to its own final character with an invisible
 *   sizer, so cycling through wide and narrow glyphs cannot shift the layout.
 */
const CHARSET = " ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.,'&-—!?/";

/** Steps a cell travels before it lands. Later cells travel further. */
function flipsFor(index: number, total: number) {
  // Long strings would otherwise take absurdly long to resolve, so the
  // per-cell stagger shrinks as the string grows.
  const stagger = total > 18 ? 1 : total > 10 ? 1.6 : 2.4;
  return Math.round(6 + index * stagger);
}

export default function SplitFlap({
  text,
  className = '',
  tickMs = 52,
  as: Tag = 'span',
}: {
  text: string;
  className?: string;
  tickMs?: number;
  as?: 'span' | 'div';
}) {
  const chars = Array.from(text);
  const [display, setDisplay] = useState<string[]>(chars);
  const [running, setRunning] = useState(false);
  const frame = useRef<number | null>(null);

  useEffect(() => {
    const finals = Array.from(text);
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplay(finals);
      return;
    }

    const targets = finals.map((c) => {
      const i = CHARSET.indexOf(c.toUpperCase());
      return i === -1 ? -1 : i; // -1 = a glyph we do not flap (punctuation etc.)
    });
    const total = finals.length;
    const totalFlips = finals.map((_, i) => flipsFor(i, total));

    // Each cell starts `flips` steps behind its target and walks forward.
    const cursor = targets.map((t, i) =>
      t === -1 ? -1 : (t - totalFlips[i] + CHARSET.length * 4) % CHARSET.length
    );

    setRunning(true);
    setDisplay(cursor.map((c, i) => (c === -1 ? finals[i] : CHARSET[c])));

    let last = performance.now();
    const step = (now: number) => {
      if (now - last >= tickMs) {
        last = now;
        let moved = false;
        for (let i = 0; i < cursor.length; i++) {
          if (cursor[i] === -1 || cursor[i] === targets[i]) continue;
          cursor[i] = (cursor[i] + 1) % CHARSET.length;
          moved = true;
        }
        setDisplay(cursor.map((c, i) => (c === -1 ? finals[i] : CHARSET[c])));
        if (!moved) {
          setRunning(false);
          setDisplay(finals);
          return;
        }
      }
      frame.current = requestAnimationFrame(step);
    };
    frame.current = requestAnimationFrame(step);

    return () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current);
    };
  }, [text, tickMs]);

  return (
    <Tag className={className}>
      {/* The words themselves, for anything that reads rather than looks. */}
      <span className="sr-only">{text}</span>

      <span aria-hidden className="inline-flex flex-wrap">
        {chars.map((finalChar, i) => {
          if (finalChar === ' ') return <span key={i} className="w-[0.3em]" />;
          const settled = display[i] === finalChar;
          return (
            <span key={i} className="flap relative inline-block">
              {/* Invisible sizer: locks the cell to its final glyph's width. */}
              <span className="invisible">{finalChar}</span>
              {/* Positioned to the cell's top-left with the same line box as the
                  sizer, not flex-centred: centring would align the glyph to the
                  box middle and break the baseline against settled cells. */}
              <span
                className={`absolute left-0 right-0 top-0 text-center ${
                  running && !settled ? 'flapping' : ''
                }`}
              >
                {display[i]}
              </span>
            </span>
          );
        })}
      </span>
    </Tag>
  );
}
