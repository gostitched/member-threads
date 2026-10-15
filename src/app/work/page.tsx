import type { Metadata } from 'next';
import WorkWall from '@/components/work/Wall';
import { WORK } from '@/lib/work';

export const metadata: Metadata = {
  title: 'Collections',
  description: 'Concept collections for Bar and Bat Mitzvahs: the pieces, the palette, the piece count and how it all arrives.',
};

export default function WorkPage() {
  return (
    // The wall runs nearly full-bleed: wider than the site's text measure on purpose.
    // Its ink header band runs the full width, so the page clips sideways overflow.
    <div className="overflow-x-clip">
      <section className="mx-auto px-4 lg:w-[min(94vw,1840px)] lg:px-0 lg:pt-9">
        <WorkWall projects={WORK} />
      </section>
    </div>
  );
}
