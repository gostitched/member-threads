'use client';

import { useEffect, useRef, useState } from 'react';
import { pieces, type WorkItem } from '@/lib/work';

export { bandStyle, bandTheme, type BandTheme } from './band';

/**
 * Small pieces shared by the wall, the dossier and the collection pages: the
 * collection's own colour as a hero band, the piece-count chip, and a share button
 * (the buyer usually needs a committee, a board or a manager to see it too).
 */

const CHIP = {
  ink: 'bg-ink text-paper',
  pop: 'bg-uv-lit text-ink',
  paper: 'bg-white text-ink',
};

/**
 * "438 PIECES": a production fact, set as a flat green pill, straight. (`rotate`
 * is accepted for older callers and ignored: the trims sit square now.)
 */
export function PieceStamp({
  w,
  tone = 'ink',
  className = '',
}: {
  w: WorkItem;
  rotate?: number;
  /** pop is a chip fill only (never type). */
  tone?: 'ink' | 'pop' | 'paper';
  className?: string;
}) {
  const n = pieces(w);
  if (!n) return null;
  return (
    <span className={`inline-flex min-h-[36px] items-center rounded-full px-4 text-[0.875rem] font-semibold leading-none ${CHIP[tone]} ${className}`}>
      {n} pieces
    </span>
  );
}

/**
 * Share a collection: the phone's share sheet where there is one, otherwise the link
 * goes on the clipboard and the button says so.
 */
export function ShareButton({ w, tone = 'ink', className = '' }: { w: WorkItem; tone?: 'ink' | 'paper'; className?: string }) {
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle');
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const flash = (s: 'copied' | 'failed') => {
    setState(s);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setState('idle'), 2200);
  };

  const share = async () => {
    const url = `${window.location.origin}/work/${w.slug}`;
    const text = `${w.title}, a concept collection by Member Threads.`;
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({ title: w.title, text, url });
        return;
      } catch (e) {
        if ((e as DOMException)?.name === 'AbortError') return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      flash('copied');
    } catch {
      // Older browsers: a hidden field and the copy command.
      const ta = document.createElement('textarea');
      ta.value = url;
      ta.setAttribute('readonly', '');
      ta.style.cssText = 'position:fixed;opacity:0;pointer-events:none';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand?.('copy');
      ta.remove();
      flash(ok ? 'copied' : 'failed');
    }
  };

  const tones = {
    ink: 'bg-white text-ink ring-1 ring-ink/10 hover:bg-ink hover:text-paper',
    paper: 'bg-white text-ink ring-1 ring-ink/10 hover:bg-ink hover:text-paper',
  };

  return (
    <button
      type="button"
      onClick={share}
      className={`group inline-flex min-h-[44px] items-center gap-2 rounded-full px-4 text-[0.875rem] font-semibold transition-colors duration-200 motion-reduce:transition-none ${tones[tone]} ${className}`}
    >
      <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden className="shrink-0">
        <path d="M2 3.5h12v7H7l-3.5 3v-3H2z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      </svg>
      <span aria-live="polite">
        {state === 'copied' ? (
          <span key="c">Link copied</span>
        ) : state === 'failed' ? (
          'Copy the address bar instead'
        ) : (
          'Share this collection'
        )}
      </span>
    </button>
  );
}
