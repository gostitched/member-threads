import Link from 'next/link';
import Media from '@/components/work/Media';
import { WORK, leadOf, type WorkItem } from '@/lib/work';

/**
 * The collections, straight after the chapter that makes the claims: lead first, each
 * opening its collection page. The full wall is on /work.
 */
export default function SelectedWork() {
  const [lead, ...rest] = WORK;
  if (!lead) return null;

  return (
    <section id="selected-work" aria-labelledby="work-title" className="scroll-mt-20 sm:scroll-mt-[84px] lg:scroll-mt-[108px] bg-paper text-ink">
      <div className="shell py-24 sm:py-32">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <h2 id="work-title" className="caps mt-5 text-d1">
              Here’s the proof.
            </h2>
            <p className="-mt-1 font-sans text-d2 font-medium text-uv">Four kids, four collections.</p>
          </div>
          <Link href="/work" className="inline-flex min-h-[44px] items-center gap-2 text-[0.9375rem] font-semibold text-ink underline decoration-rule underline-offset-4 hover:decoration-ink">
            All collections <span aria-hidden>→</span>
          </Link>
        </div>

        <div className="mt-14 grid gap-x-6 gap-y-12 lg:grid-cols-12">
          <Tile project={lead} className="lg:col-span-6" ratio="aspect-[4/5]" sizes="(min-width: 1024px) 45vw, 92vw" />
          <div className="grid grid-cols-2 gap-x-6 gap-y-12 lg:col-span-6">
            {rest.slice(0, 4).map((w) => (
              <Tile key={w.id} project={w} ratio="aspect-square" sizes="(min-width: 1024px) 22vw, 45vw" />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Tile({ project, className = '', ratio, sizes }: { project: WorkItem; className?: string; ratio: string; sizes: string }) {
  const asset = leadOf(project);
  return (
    <Link href={`/work/${project.slug}`} className={`group block ${className}`}>
      <div className={`relative overflow-hidden rounded-3xl bg-white ring-1 ring-rule ${ratio}`}>
        <Media asset={asset} sizes={sizes} labelled={false} className="transition-transform duration-700 ease-out group-hover:scale-[1.03]" />
      </div>
      <div className="mt-4 flex items-baseline gap-3">
        <span className="font-extrabold tracking-tight group-hover:text-uv">{project.title}</span>
      </div>
      <p className="mt-1 text-[0.875rem] text-muted">{project.sector}</p>
    </Link>
  );
}
