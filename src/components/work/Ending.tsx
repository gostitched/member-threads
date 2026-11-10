'use client';

import Link from 'next/link';
import { NAME_MAX, YOUR_NAME, useOrgName } from '@/lib/name';
import { Arrow } from '@/components/SiteHeader';

/**
 * The page ends on their collection. No "next": nothing here has shipped yet. The
 * organization's name is typed straight into the headline, in the serif italic; same
 * name everywhere on the site. A square cream plate.
 */
export default function Ending() {
  const { name, raw, set, isDefault } = useOrgName();
  // The input sizes to what's typed, so the name sits in the line like set type.
  const chars = Math.max((raw || YOUR_NAME).length, 4);
  return (
    <section aria-label="Your collection" className="relative mt-16 overflow-hidden bg-cream text-ink lg:mt-10">
      <div className="relative px-6 py-14 sm:px-10 lg:px-16 lg:py-20">
        <h2 className="t-h1">
          <span className="block">The</span>
          <label className="block">
            <span className="sr-only">Your organization’s name</span>
            <input
              type="text"
              value={raw}
              onChange={(e) => set(e.target.value)}
              maxLength={NAME_MAX}
              placeholder={YOUR_NAME}
              autoComplete="organization"
              autoCapitalize="words"
              spellCheck={false}
              enterKeyHint="done"
              size={chars}
              style={{ width: `min(100%, ${chars * 0.5 + 0.6}em)` }}
              className="wk-name block max-w-full rounded-none bg-transparent pb-[0.04em] font-editorial italic leading-[1.05] text-ink"
            />
          </label>
          <span className="block">collection.</span>
        </h2>
        <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-5">
          <p className="t-lead">starts here.</p>
          <Link href="/quote" className="btn-blue">
            {isDefault ? 'Start a collection' : `Start the ${name.replace(/'/g, '’')} collection`} <Arrow className="h-[14px] w-[19px]" />
          </Link>
        </div>
      </div>
    </section>
  );
}
