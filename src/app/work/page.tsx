import type { Metadata } from 'next';
import WorkWall from '@/components/work/Wall';
import { WORK } from '@/lib/work';

export const metadata: Metadata = {
  title: 'Collections',
  description: 'The members’ wall: concept collections from Member Threads for university clubs, companies, nonprofits, run clubs and members’ clubs, with the pieces, the palette, the finishes and the piece count.',
};

export default function WorkPage() {
  return (
    <div className="overflow-x-clip">
      <WorkWall projects={WORK} />
    </div>
  );
}
