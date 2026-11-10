import type { Metadata } from 'next';
import Catalog from '@/components/work/Catalog';

export const metadata: Metadata = {
  title: 'Get Inspired',
  description:
    'Concept collections for clubs, teams, companies and causes: hoodies, quarter-zips, polos, jerseys and caps, drawn in each organization’s colors. Browse by organization and by piece.',
};

export default function WorkPage() {
  return (
    // Same edges as the site header, so the wall lines up with the logo and the button.
    <div className="overflow-x-clip">
      <section className="mx-auto w-full max-w-[1536px] px-5 pb-14 sm:px-8 lg:px-14 lg:pb-20 lg:pt-9">
        <Catalog />
      </section>
    </div>
  );
}
