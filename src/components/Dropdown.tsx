'use client';

import { useEffect, useId, useRef, useState } from 'react';

/**
 * A square filter chip that opens the site's own menu instead of the browser's: a paper
 * sheet with hairline rows, the chosen row ticked. Keyboard: arrows move, Enter or Space
 * picks, Escape closes, typing a letter jumps to the next match. The empty value is the
 * "all" option.
 */

type Option = { value: string; label: string; count?: number };

export default function Dropdown({ label, all, value, options, onChange }: {
  label: string;
  all: string;
  value: string;
  options: Option[];
  onChange: (value: string) => void;
}) {
  const id = useId();
  const items: Option[] = [{ value: '', label: all }, ...options];
  const selected = Math.max(0, items.findIndex((o) => o.value === value));
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(selected);
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const on = value !== '';

  const show = () => { setActive(selected); setOpen(true); };
  const close = (refocus = true) => { setOpen(false); if (refocus) button.current?.focus(); };
  const pick = (i: number) => { onChange(items[i].value); close(); };

  useEffect(() => {
    if (!open) return;
    list.current?.focus({ preventScroll: true });
    // Bring the whole menu on screen, without pushing the pill under the sticky header.
    const menu = list.current?.getBoundingClientRect();
    const pill = button.current?.getBoundingClientRect();
    if (menu && pill) {
      const by = Math.min(menu.bottom + 16 - window.innerHeight, pill.top - 96);
      if (by > 0) window.scrollBy({ top: by, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    }
    const away = (e: PointerEvent) => { if (!root.current?.contains(e.target as Node)) close(false); };
    document.addEventListener('pointerdown', away);
    return () => document.removeEventListener('pointerdown', away);
  }, [open]);

  useEffect(() => {
    if (open) list.current?.querySelector(`[data-i="${active}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [open, active]);

  const onListKey = (e: React.KeyboardEvent) => {
    const last = items.length - 1;
    if (e.key === 'ArrowDown') setActive((i) => Math.min(last, i + 1));
    else if (e.key === 'ArrowUp') setActive((i) => Math.max(0, i - 1));
    else if (e.key === 'Home') setActive(0);
    else if (e.key === 'End') setActive(last);
    else if (e.key === 'Enter' || e.key === ' ') pick(active);
    else if (e.key === 'Escape') close();
    else if (e.key === 'Tab') { close(false); return; }
    else if (e.key.length === 1) {
      const k = e.key.toLowerCase();
      const next = items.findIndex((o, i) => i > active && o.label.toLowerCase().startsWith(k));
      const wrap = items.findIndex((o) => o.label.toLowerCase().startsWith(k));
      if (next >= 0 || wrap >= 0) setActive(next >= 0 ? next : wrap);
    } else return;
    e.preventDefault();
  };

  return (
    <div ref={root} className="min-w-0 sm:relative">
      <button
        ref={button}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-list`}
        aria-label={`${label}: ${items[selected].label}`}
        onClick={() => (open ? close() : show())}
        onKeyDown={(e) => { if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); show(); } }}
        className={`flex min-h-11 max-w-full items-center gap-2.5 rounded-[var(--radius)] border py-2 pl-4 pr-3.5 font-sans text-[0.9375rem] font-medium transition-colors duration-quick motion-reduce:transition-none ${
          on ? 'border-ink bg-ink text-cream' : 'border-ink/25 bg-transparent text-ink hover:border-ink'
        }`}
      >
        <span className="truncate">{items[selected].label}</span>
        <svg aria-hidden viewBox="0 0 12 12" className={`h-3 w-3 shrink-0 transition-transform duration-200 motion-reduce:transition-none ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2.5 4.5 6 8l3.5-3.5" />
        </svg>
      </button>

      {open && (
        <ul
          ref={list}
          id={`${id}-list`}
          role="listbox"
          tabIndex={-1}
          aria-label={label}
          aria-activedescendant={`${id}-${active}`}
          onKeyDown={onListKey}
          className="dropdown-menu absolute inset-x-0 z-30 mt-1 max-h-[min(24rem,62svh)] overflow-y-auto rounded-[var(--radius)] border border-ink/25 bg-paper text-ink outline-none sm:inset-x-auto sm:left-0 sm:top-full sm:min-w-[16rem]"
        >
          {items.map((o, i) => {
            const isOn = i === selected;
            return (
              <li
                key={o.value || '__all'}
                id={`${id}-${i}`}
                data-i={i}
                role="option"
                aria-selected={isOn}
                onPointerEnter={() => setActive(i)}
                onClick={() => pick(i)}
                className={`flex min-h-11 cursor-pointer items-center gap-3 border-t border-rule px-4 py-2 font-sans text-[0.9375rem] first:border-t-0 ${
                  i === active ? 'bg-cream' : ''
                } ${isOn ? 'font-semibold' : 'font-normal'}`}
              >
                <span className="min-w-0 flex-1 truncate">{o.label}</span>
                {o.count != null && <span className="t-spec num text-muted">{o.count}</span>}
                <svg aria-hidden viewBox="0 0 16 16" className={`h-4 w-4 shrink-0 ${isOn ? '' : 'invisible'}`} fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m3 8.5 3.2 3.2L13 5" />
                </svg>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
