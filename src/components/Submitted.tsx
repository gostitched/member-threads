'use client';

/** What the form reports on success: the consultation, when one was booked. */
export interface SentRequest {
  booking?: { startsAt: string; endsAt?: string; timezone: string; joinUrl?: string } | null;
  bookingPending?: boolean;
}

const BRAND = 'Member Threads';
const CALL_MINUTES = 30;

/** The call's date and time, read in the timezone it was booked in. */
function callParts(b: NonNullable<SentRequest['booking']>) {
  const start = new Date(b.startsAt);
  const end = b.endsAt ? new Date(b.endsAt) : null;
  const f = (d: Date, o: Intl.DateTimeFormatOptions) => {
    try {
      return d.toLocaleString('en-US', { timeZone: b.timezone, ...o });
    } catch {
      return d.toLocaleString('en-US', o);
    }
  };
  const t = { hour: 'numeric', minute: '2-digit' } as const;
  return {
    month: f(start, { month: 'short' }),
    day: f(start, { day: 'numeric' }),
    weekday: f(start, { weekday: 'short' }),
    date: f(start, { weekday: 'long', month: 'long', day: 'numeric' }),
    time: end ? `${f(start, t)} – ${f(end, { ...t, timeZoneName: 'short' })}` : f(start, { ...t, timeZoneName: 'short' }),
  };
}

/** A one-event calendar file for "Add to calendar". */
function icsHref(b: NonNullable<SentRequest['booking']>): string {
  const start = new Date(b.startsAt);
  const end = b.endsAt ? new Date(b.endsAt) : new Date(start.getTime() + CALL_MINUTES * 60_000);
  const stamp = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    `PRODID:-//${BRAND}//Call//EN`,
    'BEGIN:VEVENT',
    `UID:${stamp(start)}-${Math.random().toString(36).slice(2)}@stitched`,
    `DTSTAMP:${stamp(new Date())}`,
    `DTSTART:${stamp(start)}`,
    `DTEND:${stamp(end)}`,
    `SUMMARY:Call with ${BRAND}`,
    ...(b.joinUrl ? [`LOCATION:${b.joinUrl}`, `URL:${b.joinUrl}`] : []),
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(lines.join('\r\n'))}`;
}

/**
 * Shown in place of the form once a request is in: that it arrived, and the call,
 * set out like a booking confirmation.
 */
export default function Submitted({ sent }: { sent: SentRequest }) {
  const b = sent.booking;
  const call = b ? callParts(b) : null;
  return (
    <div role="status" className="band-green px-7 py-10 sm:px-10 sm:py-12">
      <div className="flex items-center gap-4">
        <span aria-hidden className="bg-beige text-green grid h-10 w-10 shrink-0 place-items-center rounded-full">
          <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3.5 8.5l3 3 6-7" />
          </svg>
        </span>
        <h2 className="t-h2">Request received.</h2>
      </div>

      {b && call ? (
        <>
          <div className="mt-8 flex items-center gap-5 border-t border-rule-dark pt-8 sm:gap-6">
            <div className="bg-cream text-green w-[4.5rem] shrink-0 overflow-hidden text-center">
              <p className="bg-beige text-green py-1 text-[0.6875rem] font-semibold uppercase tracking-[0.12em]">{call.month}</p>
              <p className="font-editorial pt-2 text-[2rem] leading-none">{call.day}</p>
              <p className="text-green/60 pb-2 pt-1 text-[0.6875rem] uppercase tracking-[0.12em]">{call.weekday}</p>
            </div>
            <div className="min-w-0">
              <p className="t-small text-beige">Call confirmed</p>
              <p className="t-h3 mt-1">{call.date}</p>
              <p className="t-small text-cream/70 mt-1">
                {call.time}
                {b.joinUrl ? ' · Google Meet' : ''}
              </p>
            </div>
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
            {b.joinUrl && (
              <a href={b.joinUrl} target="_blank" rel="noopener" className="btn-cream">
                Join on Google Meet
              </a>
            )}
            <a href={icsHref(b)} download={`${BRAND} call.ics`} className="link-u t-small font-medium text-cream">
              Add to calendar
            </a>
          </div>
        </>
      ) : (
        <p className="t-body text-cream/90 mt-8 border-t border-rule-dark pt-8">
          {sent.bookingPending ? 'We’ll email you to pick a call time.' : 'We’ll email you to set up a call.'}
        </p>
      )}
    </div>
  );
}
