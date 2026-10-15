'use client';

import { useEffect, useRef, useState } from 'react';
import Sticker from '@/components/Sticker';
import { possessive, useKidName } from '@/lib/name';
import { APP_URL, REQUEST_FORM_URL } from '@/lib/site';

const MIN_HEIGHT = 1200;
const MAX_HEIGHT = 25000;
const DEFAULT_HEIGHT = 3500;
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

    return () => {
      window.removeEventListener('message', onMessage);
      window.clearInterval(ping);
    };
  }, []);

  if (submitted) {
    return (
      <div className="rounded-[32px] bg-electric-lit p-10 text-center text-ink sm:p-16">
        <h2 className="caps text-d2">Got it.</h2>
        <p className="mt-2 font-sans text-[clamp(1.25rem,2vw,1.625rem)] font-medium text-uv">Your designer is next.</p>
        <p className="mx-auto mt-5 max-w-[36ch] text-[0.9375rem] leading-relaxed text-ink/70">
          We check your date first, then a designer reaches out to start on the collection.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl bg-white ring-1 ring-rule">
      <iframe
        ref={frameRef}
        src={REQUEST_FORM_URL}
        title="Start a collection: request form"
        // Left scrollable on purpose: the height above is only as good as the
        // handshake, and a lost message with scrolling off is a dead end.
        className="block w-full border-0"
        style={{ height, minHeight: MIN_HEIGHT }}
      />
    </div>
  );
}

/**
 * /quote headline, personalised: "Tell us about Sophie's day." once a name has
 * been typed on the home page, else "Tell us about your day." Hydrates as the
 * default and swaps in the stored name after (no mismatch). The name line
 * is raspberry; long names shrink to fit.
 */
export function QuoteTitle() {
  const { name, isDefault } = useKidName();
  const who = (isDefault ? 'your day.' : `${possessive(name).replace(/'/g, '’')} day.`).toUpperCase();
  const cap = (len: number) => `min(1em, ${(100 / (Math.max(len, 1) * 0.66)).toFixed(2)}cqw)`;
  return (
    <div className="[container-type:inline-size]">
      <h1 className="caps text-d1">
        <span className="rise block" style={{ animationDelay: '60ms' }}>
          Tell us about
        </span>
        <span className="rise block" style={{ animationDelay: '140ms' }}>
          <span className="inline-block text-uv" style={{ fontSize: cap(who.length) }}>
            {who}
          </span>
        </span>
      </h1>
    </div>
  );
}

/** "For {name}": a small woven label above the form; renders nothing until a name is set. */
export function ForSticker() {
  const { name, isDefault } = useKidName();
  if (isDefault) return null;
  return (
    <Sticker key={name} shape="label" draggable>
      <span>For {name.replace(/'/g, '’')}</span>
    </Sticker>
  );
}
