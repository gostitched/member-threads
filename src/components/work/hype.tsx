'use client';

import { useEffect, useRef, useState } from 'react';
import { pieces, type WorkItem } from '@/lib/work';

/**
 * Small pieces shared by the dossier and the collection pages: the piece count as a
 * woven label, and a share link (the buyer usually needs a committee, a board or a
 * manager to see it too).
 */

/** "438 pieces", woven. */
export function PieceStamp({ w, className = '' }: { w: WorkItem; className?: string }) {
  const n = pieces(w);
  if (!n) return null;
  return <span className={`woven woven-green ${className}`}>{n} pieces</span>;
}

/**
 * Share a collection: the phone's share sheet where there is one, otherwise the link
 * goes on the clipboard and the button says so.
 */
export function ShareButton({ w, className = '' }: { w: WorkItem; className?: string }) {
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

  return (
    <button
      type="button"
      onClick={share}
      className={`inline-flex min-h-[44px] items-center text-[14px] font-medium ${className}`}
    >
      <span aria-live="polite" className="link-u">
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
