'use client';

import { useEffect, useRef, useState } from 'react';
import Sticker from '@/components/Sticker';
import { useOrgName } from '@/lib/name';
import { APP_URL, CONTACT, REQUEST_FORM_URL } from '@/lib/site';

const MIN_HEIGHT = 1200;
const MAX_HEIGHT = 25000;
/** Before the form reports its height: about one screen of fields, not a page of blank. */
const DEFAULT_HEIGHT = 1200;
const QUIET_AFTER_MS = 9000;
/** Without a handshake the frame scrolls itself; one screen is enough. */
const QUIET_HEIGHT = 760;
const PING_INTERVAL_MS = 2000;
const PING_TIMEOUT_MS = 30000;

/**
 * The real customer intake form, framed from the operations app.
 *
 * This is deliberately the same `/request` page the dashboard serves rather than
 * a reimplementation: submissions land directly in the order pipeline, and there
 * is no second form to keep in sync. The app already sends `frame-ancestors *`
 * on that route, so framing it needs no change on the dashboard side.
 *
 * Implements the same postMessage contract as `public/embed/stitched-form.js`:
 * the frame posts its content height, and we must post an ack back — the form
 * keeps its own scrollbars until it hears a height that matches its content, so
 * a missing ack leaves the customer with a nested scroll area.
 */
export default function RequestForm() {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(DEFAULT_HEIGHT);
  const [submitted, setSubmitted] = useState(false);
  // 'loading' until the form answers the height handshake; 'quiet' if it never
  // does (blocked, offline, or framed somewhere it isn't allowed), which
  // uncovers the frame and offers the plain routes.
  const [status, setStatus] = useState<'loading' | 'ready' | 'quiet'>('loading');
  const gotHeight = useRef(false);

  useEffect(() => {
    const origin = new URL(APP_URL).origin;

    function onMessage(event: MessageEvent) {
      const frame = frameRef.current;
      // Only the frame we created drives its own height; anything else on the
      // page posting a lookalike message is ignored.
      if (!frame || event.source !== frame.contentWindow) return;
      if (event.origin !== origin) return;

      const data = event.data;
      if (!data || typeof data !== 'object') return;

      if (data.type === 'stitched-form-resize' && typeof data.height === 'number') {
        gotHeight.current = true;
        setStatus('ready');
        const next = Math.min(Math.max(Math.ceil(data.height), MIN_HEIGHT), MAX_HEIGHT);
        setHeight((prev) => (Math.abs(next - prev) > 5 ? next : prev));
        try {
          (event.source as Window).postMessage(
            { type: 'stitched-form-height-ack', height: next, clamped: data.height > MAX_HEIGHT },
            origin
          );
        } catch {
          // A failed ack only costs us the frame's own scrollbars.
        }
      }

      if (data.type === 'stitched-form-success') setSubmitted(true);
    }

    window.addEventListener('message', onMessage);

    // Re-ask for a height until the form answers; some loads miss the first post.
    const started = Date.now();
    const ping = window.setInterval(() => {
      if (gotHeight.current || Date.now() - started > PING_TIMEOUT_MS) {
        window.clearInterval(ping);
        return;
      }
      try {
        frameRef.current?.contentWindow?.postMessage({ type: 'stitched-form-ping' }, origin);
      } catch {
        // Cross-origin frames still accept postMessage; ignore anything else.
      }
    }, PING_INTERVAL_MS);

    // No answer after a while: keep the frame, but offer the plain routes.
    const quiet = window.setTimeout(() => {
      if (!gotHeight.current) setStatus('quiet');
    }, QUIET_AFTER_MS);

    return () => {
      window.removeEventListener('message', onMessage);
      window.clearInterval(ping);
      window.clearTimeout(quiet);
    };
  }, []);

  if (submitted) {
    return (
      <div className="band-green px-6 py-14 sm:px-12 sm:py-20" role="status">
        <span className="woven woven-beige">Request received</span>
        <h2 className="t-h1 mt-8">
          Your designer is <em>next</em>.
        </h2>
        <p className="t-script mt-6 text-[clamp(2.25rem,4vw,3.25rem)] text-beige">Welcome to the club.</p>
        <p className="t-body mt-10 max-w-[44ch] text-cream/90">
          We review your timeline first, then a designer reaches out to start on the collection.
        </p>
      </div>
    );
  }

  return (
    <div className="band-cream">
      {/* The plate's header line: a tech-pack slip. */}
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-b border-[var(--rule-c)] px-5 py-4 sm:px-8">
        <p className="t-spec">Request No. —</p>
        <p className="t-spec fg-muted">Member Threads × Stitched</p>
      </div>

      <div className="relative">
        <iframe
          ref={frameRef}
          src={REQUEST_FORM_URL}
          title="Start a collection: request form"
          // Left scrollable on purpose: the height above is only as good as the
          // handshake, and a lost message with scrolling off is a dead end.
          className="block w-full border-0 bg-transparent"
          style={status === 'quiet' ? { height: QUIET_HEIGHT } : { height, minHeight: MIN_HEIGHT }}
        />

        {/* Loading: a stitch sews across the plate until the frame lands. */}
        <div
          aria-hidden={status !== 'loading'}
          data-done={status !== 'loading'}
          className="mt-plate-loading absolute inset-0 flex flex-col gap-6 bg-cream px-5 pt-10 sm:px-8 sm:pt-14"
        >
          <p className="t-spec fg-muted" role="status">
            Loading the request form
          </p>
          <span className="mt-sewing stitch-rule w-full" />
          <div className="space-y-10 pt-6" aria-hidden>
            {['Organization', 'Your name', 'Email', 'Pieces and quantities'].map((l) => (
              <div key={l}>
                <p className="field-label">{l}</p>
                <span className="block h-px w-full bg-ink/20" />
              </div>
            ))}
          </div>
        </div>

        {status === 'quiet' && (
          <div className="absolute inset-x-0 top-0 border-b border-[var(--rule-c)] bg-cream px-5 py-6 sm:px-8" role="status">
            <p className="t-body max-w-[52ch]">
              The form is taking longer than it should.{' '}
              <a href={REQUEST_FORM_URL} target="_blank" rel="noopener" className="link-u font-medium">
                Open it in a new tab
              </a>{' '}
              or write to{' '}
              <a href={`mailto:${CONTACT.email}`} className="link-u font-medium">
                {CONTACT.email}
              </a>
              .
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * /quote headline, personalised: "Start the Harbor Run Club collection." once
 * a name has been typed on the home page, else "Start your collection."
 * Hydrates as the default and swaps in the stored name after (no mismatch).
 * The name is the italic; long names wrap on the serif's balance.
 */
export function QuoteTitle() {
  const { name, isDefault } = useOrgName();
  const who = name.replace(/'/g, '’');
  return (
    <h1 className="t-display">
      <span className="enter block" style={{ ['--d' as string]: '80ms' }}>
        Start {isDefault ? 'your' : 'the'}
      </span>
      <span className="enter block" style={{ ['--d' as string]: '160ms' }}>
        {isDefault ? (
          <>
            <em>collection</em>.
          </>
        ) : (
          <>
            <em>{who}</em> collection.
          </>
        )}
      </span>
    </h1>
  );
}

/** "For {name}": a small woven label beside the form; renders nothing until a name is set. */
export function ForSticker() {
  const { name, isDefault } = useOrgName();
  if (isDefault) return null;
  return (
    <Sticker key={name} shape="label" draggable>
      <span>For {name.replace(/'/g, '’')}</span>
      <span className="opacity-60">Collection 01</span>
    </Sticker>
  );
}
