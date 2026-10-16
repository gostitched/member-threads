import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import WorkArt from '@/components/work/art';
import { ShareButton } from '@/components/work/hype';
import { Arrow, ArrowBack, Em, MoodPhoto } from '@/components/work/ui';
import '@/components/work/work.css';
import { CASES } from '@/lib/cases';
import { WORK, assetById, categoryOf, drop, pieces, projectBySlug, scheduleOf, specs, type WorkAsset } from '@/lib/work';

export function generateStaticParams() {
  return WORK.map((w) => ({ slug: w.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const w = projectBySlug((await params).slug);
  return w ? { title: `${w.title} · Collections`, description: w.note ?? `${w.title}: ${w.sector}. ${specs(w).join(', ')}.` } : {};
}

/** True when a colour is dark enough to take a cream stitch. */
const dark = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  return 0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255) < 140;
};

const WORDS = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
const FLAT_COLS: Record<number, string> = { 3: 'lg:grid-cols-3', 4: 'lg:grid-cols-4', 5: 'lg:grid-cols-5' };

/**
 * One collection as a lookbook: mood photography up top, the drawn garments as the
 * product flats, the piece schedule as a spec table, the palette as woven labels, and
 * the next collection waiting at the bottom. Every collection here is a concept, and
 * the page says so in the spec panel, the captions and the roster label.
 */
export default async function CollectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const w = projectBySlug((await params).slug);
  if (!w) notFound();
  const study = CASES.find((c) => c.id === w.caseId);
  const next = WORK[(WORK.indexOf(w) + 1) % WORK.length];
  const cat = categoryOf(w);
  const rows = scheduleOf(w);
  const chapter = (label: string) => w.chapters?.find((c) => c.label === label);
  const pics = (label: string) => (chapter(label)?.assets ?? []).map((id) => assetById(w, id)).filter((a): a is WorkAsset => !!a);
  const plate = assetById(w, w.cover?.[0] ?? '') ?? pics('The collection')[0];
  const second = w.chapters?.[1];
  const tall = second ? pics(second.label)[0] : undefined;
  const close = pics('Up close');
  const closeCaps = chapter('Up close')?.captions ?? [];
  const thinking = w.story?.[0]?.body[0] ?? '';
  const cut = thinking.indexOf('. ');
  const pull = cut > 0 ? thinking.slice(0, cut + 1) : thinking;
  const after = cut > 0 ? thinking.slice(cut + 2) : '';
  const total = rows.reduce((n, r) => n + (r.count ?? 0), 0);

  return (
    <div className="wk overflow-x-clip">
      {/* ── 1. Hero ─────────────────────────────────────────────────────── */}
      <header>
        <div className="shell flex min-h-[64px] flex-wrap items-center justify-between gap-x-6 gap-y-1 pt-4 lg:pt-6">
          <Link href="/work" className="link-arrow group text-[14px] font-medium">
            <ArrowBack className="h-3 w-4 transition-transform duration-base ease-out group-hover:-translate-x-1" />
            <span className="link-u">All collections</span>
          </Link>
          <p className="t-spec hidden text-muted sm:block">
            {drop(w.no)} · {cat?.title}
          </p>
        </div>

        <div className="relative mt-4 lg:mt-6">
          {w.mood && (
            <MoodPhoto
              slug={w.mood.hero}
              ratio="portrait"
              className="lg:aspect-[21/9]"
              treatment="grade"
              priority
              sizes="100vw"
            />
          )}
        </div>

        <div className="shell grid-12 relative gap-y-10">
          {/* The title plate cuts up into the photo by one line. */}
          <div className="wk-plate-title col-span-4 -mt-[clamp(3rem,6.6vw,7.5rem)] pr-6 pt-[clamp(0.75rem,1.4vw,1.5rem)] sm:col-span-7 lg:col-span-8 lg:pr-12">
            <p className="t-spec flex items-center gap-3 text-muted">
              <span className="hidden sm:inline">{drop(w.no)}</span>
              <span aria-hidden className="stitch-rule hidden w-8 sm:block" />
              <span>{w.sector}</span>
            </p>
            <h1 className="t-display mt-4 lg:mt-5">
              <span className="enter block">{w.title}</span>
            </h1>
            {w.vibe && (
              <p className="t-lead enter mt-6 text-ink/80 lg:mt-8" style={{ ['--d' as string]: '120ms' }}>
                {w.vibe}.
              </p>
            )}
          </div>

          {/* The spec panel: the page's one label object, sewn across the photo's edge. */}
          <aside aria-label="Collection spec" className="wk-spec col-span-4 self-start p-7 sm:col-span-6 lg:col-span-4 lg:col-start-9 lg:-mt-36 lg:p-8">
            <p className="t-eyebrow relative z-[1] flex justify-between">
              <span>Spec</span>
              <span className="num">{drop(w.no)}</span>
            </p>
            <dl className="relative z-[1] mt-5">
              {[
                ['Organization', w.title],
                ['For', cat?.title ?? ''],
                ['Pieces', pieces(w) ?? '—'],
                ['Styles', String(rows.length).padStart(2, '0')],
                ['Decoration', w.method],
                ['Status', 'Concept collection'],
                ['Photography', 'Mood reference'],
              ].map(([k, v]) => (
                <div key={k} className="flex items-baseline justify-between gap-4 border-t border-ink/15 py-2.5">
                  <dt className="t-spec text-muted">{k}</dt>
                  <dd className="t-spec num text-right">{v}</dd>
                </div>
              ))}
            </dl>
          </aside>
        </div>
      </header>

      {/* ── 2. The brief ────────────────────────────────────────────────── */}
      <section aria-labelledby="wk-brief" className="sec">
        <div className="shell grid-12 gap-y-8">
          <p className="t-spec col-span-4 text-muted sm:col-span-8 lg:col-span-2">01 · The brief</p>
          <h2 id="wk-brief" className="t-h1 col-span-4 sm:col-span-8 lg:col-span-9 lg:col-start-3">
            {study ? <Em text={study.title} /> : w.title}.
          </h2>
          {w.brief?.map((b, i) => (
            <div
              key={b.label}
              className={`col-span-4 sm:col-span-4 ${i === 0 ? 'lg:col-span-5 lg:col-start-3' : 'lg:col-span-4 lg:col-start-9'} mt-4 lg:mt-10`}
            >
              <h3 className="t-eyebrow text-muted">{b.label === 'The ask' ? 'The ask, as a concept brief' : b.label}</h3>
              <p className={`${i === 0 ? 't-lead' : 't-body'} mt-4`}>{b.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 3. The spread ───────────────────────────────────────────────── */}
      <section aria-label="Lookbook" className="pb-[var(--sec)]">
        <div className="shell grid-12 gap-y-14">
          {plate?.art && (
            <figure className="col-span-4 sm:col-span-8 lg:col-span-8">
              <div className="wipe-in relative aspect-[4/3] overflow-hidden">
                <WorkArt art={plate.art} label={plate.alt} className="absolute inset-0 h-full w-full" />
              </div>
              <figcaption className="caption">The collection, laid flat · Concept drawing</figcaption>
            </figure>
          )}
          {w.mood && (
            <figure className="col-span-3 col-start-2 sm:col-span-4 sm:col-start-5 lg:col-span-3 lg:col-start-10 lg:mt-40">
              <MoodPhoto slug={w.mood.detail} ratio="portrait" wipe sizes="(min-width: 1024px) 24vw, (min-width: 640px) 50vw, 75vw" />
              <figcaption className="caption">Mood · {w.mood.detailNote}</figcaption>
            </figure>
          )}

          {tall?.art && (
            <figure className="col-span-4 sm:col-span-5 lg:col-span-4 lg:col-start-2">
              <div className="wipe-in relative aspect-[3/4] overflow-hidden">
                <WorkArt art={tall.art} label={tall.alt} className="absolute inset-0 h-full w-full" />
              </div>
              <figcaption className="caption">{second?.label} · Concept drawing</figcaption>
            </figure>
          )}
          {pull && (
            <figure className="col-span-4 self-center sm:col-span-8 lg:col-span-5 lg:col-start-7">
              <blockquote className="t-quote">{pull}</blockquote>
              {after && <p className="t-body mt-8 max-w-[52ch]">{after}</p>}
              <figcaption className="t-spec mt-8 flex items-center gap-3 text-muted">
                <span aria-hidden className="stitch-rule w-8" />
                Design note · Member Threads
              </figcaption>
            </figure>
          )}
        </div>
      </section>

      {/* ── 4. The pieces ───────────────────────────────────────────────── */}
      <section aria-labelledby="wk-pieces" className="band-cream sec">
        <div className="shell">
          <div className="grid-12 items-end gap-y-6">
            <p className="t-spec col-span-4 text-muted sm:col-span-8 lg:col-span-2 lg:self-start lg:pt-4">02 · The pieces</p>
            <h2 id="wk-pieces" className="t-h1 col-span-4 sm:col-span-8 lg:col-span-6 lg:col-start-3">
              {WORDS[rows.length] ?? rows.length} styles, <em>{pieces(w)}</em> pieces.
            </h2>
            <p className="t-body col-span-4 max-w-[40ch] sm:col-span-6 lg:col-span-3 lg:col-start-10">
              Each style starts in our catalog and is cut, colored and decorated for this collection. Sizes mix freely within each style.
            </p>
          </div>

          {/* The product flats. */}
          <ul className={`mt-16 grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 sm:gap-x-6 lg:gap-x-8 lg:mt-24 ${FLAT_COLS[rows.length] ?? 'lg:grid-cols-5'}`}>
            {rows.map((r) => (
              <li key={r.no}>
                <div className="wk-flatplate relative aspect-[4/5]">
                  {r.flat?.art && (
                    <div className="absolute inset-x-[8%] inset-y-[14%]">
                      <WorkArt art={r.flat.art} label={r.flat.alt} className="h-full w-full" />
                    </div>
                  )}
                  <span className="t-spec absolute left-3 top-3 text-muted">{r.no}</span>
                </div>
                <h3 className="t-h3 mt-4">{r.name}</h3>
                {r.count && <p className="t-spec num mt-1 text-muted">{r.count} pieces</p>}
              </li>
            ))}
          </ul>

          {/* The schedule. */}
          <div className="mt-20 lg:mt-28">
            <h3 className="t-eyebrow text-muted">Piece schedule</h3>
            <table className="mt-5 w-full border-collapse text-left">
              <caption className="sr-only">Piece schedule for {w.title}: style, fabric and colour, decoration and quantity</caption>
              <thead className="hidden sm:table-header-group">
                <tr className="t-spec text-muted">
                  <th scope="col" className="w-16 pb-3 font-medium">No.</th>
                  <th scope="col" className="pb-3 font-medium">Style</th>
                  <th scope="col" className="pb-3 font-medium">Fabric &amp; colour</th>
                  <th scope="col" className="pb-3 font-medium">Decoration</th>
                  <th scope="col" className="pb-3 text-right font-medium">Qty</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.no} className="grid grid-cols-[2.5rem_minmax(0,1fr)_auto] gap-x-3 border-t border-ink/15 py-5 sm:table-row sm:py-0">
                    <td className="t-spec text-muted sm:py-6 sm:align-top">{r.no}</td>
                    <th scope="row" className="t-h3 font-normal sm:w-[22%] sm:py-6 sm:pr-6 sm:align-top">{r.name}</th>
                    <td className="t-small col-span-2 col-start-2 row-start-2 mt-2 sm:w-[30%] sm:py-6 sm:pr-8 sm:align-top sm:text-[1rem]">{r.fabric}</td>
                    <td className="t-small col-span-2 col-start-2 row-start-3 mt-1 text-ink/80 sm:py-6 sm:pr-8 sm:align-top sm:text-[1rem]">{r.decoration.join('. ')}</td>
                    <td className="t-block col-start-3 row-start-1 text-right text-[1.5rem] sm:py-6 sm:align-top sm:text-[1.75rem]">{r.count}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="grid grid-cols-[1fr_auto] border-y border-ink py-5 sm:table-row sm:py-0">
                  <th scope="row" colSpan={4} className="t-spec font-medium sm:py-5">Total · {rows.length} styles · Minimum 36 per style</th>
                  <td className="t-block text-right text-[1.5rem] sm:py-5 sm:text-[1.75rem]">{total}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </section>

      {/* ── 5. Up close ─────────────────────────────────────────────────── */}
      {close.length > 0 && (
        <section aria-labelledby="wk-close" className="sec">
          <div className="shell grid-12 gap-y-12">
            <p className="t-spec col-span-4 text-muted sm:col-span-8 lg:col-span-2">03 · Up close</p>
            <h2 id="wk-close" className="t-h1 col-span-4 sm:col-span-8 lg:col-span-6 lg:col-start-3">
              Where the <em>care</em> shows.
            </h2>
            {close.map((a, i) => (
              <figure
                key={a.id}
                className={
                  i === 0
                    ? 'col-span-4 sm:col-span-5 lg:col-span-6 lg:col-start-3 lg:mt-8'
                    : 'col-span-3 col-start-2 sm:col-span-3 sm:col-start-6 lg:col-span-3 lg:col-start-10 lg:mt-48'
                }
              >
                <div className={`wipe-in relative overflow-hidden ${i === 0 ? 'aspect-[4/3]' : 'aspect-square bg-cream'}`}>
                  {a.art && (
                    <div className={i === 0 ? 'absolute inset-0' : 'absolute inset-[12%]'}>
                      <WorkArt art={a.art} label={a.alt} className="h-full w-full" />
                    </div>
                  )}
                </div>
                <figcaption className="caption">{closeCaps[i] ?? a.alt}</figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}

      {/* ── 6. Palette ──────────────────────────────────────────────────── */}
      {w.palette && (
        <section aria-labelledby="wk-palette" className="band-green sec">
          <div className="shell">
            <div className="grid-12 items-end gap-y-6">
              <p className="t-spec col-span-4 text-beige sm:col-span-8 lg:col-span-2 lg:self-start lg:pt-4">04 · Palette</p>
              <h2 id="wk-palette" className="t-h1 col-span-4 sm:col-span-8 lg:col-span-6 lg:col-start-3">
                {WORDS[w.palette.length] ?? w.palette.length} colors, <em>woven</em> in.
              </h2>
              {w.paletteNote && <p className="t-body fg-muted col-span-4 max-w-[36ch] sm:col-span-6 lg:col-span-3 lg:col-start-10">{w.paletteNote}</p>}
            </div>
            <ul className="mt-16 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:mt-24 lg:grid-cols-4 lg:gap-x-8">
              {w.palette.map((c, i) => (
                <li key={c.name}>
                  <div className="wk-label text-ink" style={{ background: c.hex, color: dark(c.hex) ? '#EEE6D9' : '#133327' }}>
                    <span className="relative z-[1] flex items-baseline justify-between gap-3 bg-cream px-3 py-2.5 text-ink">
                      <span className="t-spec">{c.name}</span>
                      <span className="t-spec num text-muted">{String(i + 1).padStart(2, '0')}</span>
                    </span>
                  </div>
                  <p className="t-spec mt-4 flex justify-between gap-3">
                    <span className="num">{c.hex.toUpperCase()}</span>
                  </p>
                  {c.use && <p className="t-small fg-muted mt-1">{c.use}</p>}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* ── 7. Next collection ──────────────────────────────────────────── */}
      <section aria-labelledby="wk-next" className="sec-sm">
        <div className="shell">
          <p className="t-spec hairline flex justify-between pt-5 text-muted">
            <span>Next collection</span>
            <span>{drop(next.no)}</span>
          </p>
          <Link href={`/work/${next.slug}`} className="wk-next-link group mt-10 grid-12 items-end gap-y-8 lg:mt-14">
            <div className="col-span-4 sm:col-span-8 lg:col-span-5">
              <p className="t-spec text-muted">{categoryOf(next)?.title}</p>
              <h2 id="wk-next" className="t-h1 mt-4">
                <span className="link-u">{next.title}</span>
              </h2>
              <p className="t-spec mt-5 flex items-center gap-3">
                {next.sector}
                <Arrow className="h-3 w-4 transition-transform duration-base ease-out group-hover:translate-x-1" />
              </p>
            </div>
            {next.mood && (
              <div className="col-span-4 sm:col-span-8 lg:col-span-7 lg:-mr-14">
                <MoodPhoto slug={next.mood.hero} ratio="landscape" className="lg:aspect-[21/9]" treatment="release" alt="" sizes="(min-width: 1024px) 60vw, 100vw" />
              </div>
            )}
          </Link>
        </div>
      </section>

      <section aria-label="Start a collection" className="pb-[var(--sec)]">
        <div className="shell">
          <div className="hairline flex flex-col gap-8 pt-10 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="t-h2">
                Make one for <em>your</em> members.
              </p>
              <p className="t-body mt-3 max-w-[48ch]">From 36 pieces per style, design included, one clear price.</p>
            </div>
            <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
              <ShareButton w={w} />
              <Link href="/quote" className="btn-blue">
                Start a collection <Arrow />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

