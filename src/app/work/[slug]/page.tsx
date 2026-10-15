import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Fragment } from 'react';
import { notFound } from 'next/navigation';
import Media from '@/components/work/Media';
import { bandStyle, bandTheme } from '@/components/work/band';
import { PieceStamp, ShareButton } from '@/components/work/hype';
import '@/components/work/work.css';
import { CASES, type CaseStudy } from '@/lib/cases';
import { WORK, assetById, leadOf, projectBySlug, specs, type WorkAsset, type WorkItem } from '@/lib/work';

export function generateStaticParams() {
  return WORK.map((w) => ({ slug: w.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const w = projectBySlug((await params).slug);
  return w ? { title: w.title, description: w.note ?? `${w.title}: ${w.sector}. ${specs(w).join(', ')}.` } : {};
}

/**
 * One collection, in full: what was in it, how it was made, and its case study from
 * @/lib/cases (the ask, the collection, the numbers). The wall's dossier links here.
 */
export default async function WorkProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const w = projectBySlug((await params).slug);
  if (!w) notFound();
  const study = w.caseId ? CASES.find((c) => c.id === w.caseId) : undefined;
  const lead = leadOf(w);
  const rest = w.assets.filter((a) => a !== lead);
  const next = WORK[(WORK.indexOf(w) + 1) % WORK.length];
  const whole = (k: string) => k === 'garment' || k === 'artifact';

  if (w.chapters) return <Chaptered w={w} next={next} study={study} />;

  return (
    <div className="wk overflow-x-clip">
    <Hero w={w} />
    <article className="mx-auto w-[min(94vw,1480px)] pb-24 pt-10 lg:pt-14">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.32fr)_minmax(0,1fr)] lg:gap-[4vw]">
        <div className="relative aspect-[4/3] lg:aspect-[5/4]">
          {whole(lead.kind) && <div className="wk-plate absolute inset-0" />}
          <div className={`absolute overflow-hidden ${whole(lead.kind) ? 'inset-[8%]' : 'inset-0 rounded-[18px]'}`}>
            <Media asset={lead} sizes="(min-width: 1024px) 55vw, 94vw" eager />
          </div>
        </div>

        <div>
          <Chips w={w} />
          {(study || w.note) && <p className="mt-8 max-w-measure text-lead text-ink/75">{study ? study.title : w.note}</p>}
        </div>
      </div>

      {study && <CaseBlock study={study} />}

      {rest.length > 0 && (
        <ul className="mt-20 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {rest.map((a, i) => (
            <li key={a.id} className={`relative ${i === 0 ? 'col-span-2 row-span-2 aspect-square' : 'aspect-square'}`}>
              {whole(a.kind) && <div className="wk-plate absolute inset-0" />}
              <div className={`absolute overflow-hidden ${whole(a.kind) ? 'inset-[9%]' : 'inset-0 rounded-[18px]'}`}>
                <Media asset={a} sizes={i === 0 ? '(min-width: 1024px) 47vw, 94vw' : '(min-width: 1024px) 23vw, 47vw'} />
              </div>
            </li>
          ))}
        </ul>
      )}

      <Footer next={next} />
    </article>
    </div>
  );
}

/** What's in it, as pill chips. */
function Chips({ w, className = '' }: { w: WorkItem; className?: string }) {
  return (
    <ul className={`flex flex-wrap gap-2 ${className}`}>
      {/* The piece count is already stamped in the header. */}
      {specs(w).filter((m) => !/ pieces$/i.test(m)).map((m) => <li key={m} className="wk-chip">{m}</li>)}
    </ul>
  );
}

/**
 * The hero band: a rounded panel washed with the collection's first colour, with the piece
 * count and a button to send it to the group chat.
 */
function Hero({ w }: { w: WorkItem }) {
  const t = bandTheme(w);
  return (
    <header className="mx-auto mt-3 w-[min(94vw,1480px)] rounded-[24px] bg-electric-lit text-ink lg:mt-5" style={bandStyle(t)}>
      <div className="px-5 pb-8 pt-3 lg:px-10 lg:pb-12 lg:pt-5">
        <Link href="/work" className="inline-flex min-h-[44px] items-center gap-2 text-[0.9375rem] font-semibold text-ink/75 hover:text-ink">
          <span aria-hidden>←</span> All collections
        </Link>
        <div className="mt-6 grid gap-6 lg:mt-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div className="min-w-0">
            <h1 className="caps break-words text-d2">{w.title}</h1>
            <p className="mt-2 font-sans text-[clamp(1.125rem,1.5vw,1.375rem)] font-medium leading-none text-uv">{w.sector}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <PieceStamp w={w} />
            <ShareButton w={w} />
          </div>
        </div>
      </div>
    </header>
  );
}

/** The case study: the ask in one line, and the numbers as tiles. */
function CaseBlock({ study }: { study: CaseStudy }) {
  return (
    <section className="mt-16 grid gap-8 lg:mt-24 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-center lg:gap-[4vw]">
      <p className="max-w-measure text-lead text-ink/75">{study.challenge}</p>
      <dl className="grid grid-cols-2 gap-3">
        {study.metrics.slice(0, 2).map((m) => (
          <div key={m.k} className="flex flex-col-reverse gap-2 rounded-3xl bg-white p-5 ring-1 ring-rule">
            <dt className="text-[0.875rem] text-muted">{m.k}</dt>
            <dd className="caps text-d1 text-ink">{m.v}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function Footer({ next }: { next: WorkItem }) {
  return (
    <div className="mt-20 flex flex-wrap items-end justify-between gap-8 border-t border-rule pt-10">
      <Link href={`/work/${next.slug}`} className="group">
        <p className="text-[0.875rem] text-muted">Next collection</p>
        <p className="caps mt-2 text-d2 transition-colors group-hover:text-uv">{next.title} <span aria-hidden>→</span></p>
      </Link>
      <Link href="/quote" className="btn-blue">
        Start a collection <span aria-hidden>→</span>
      </Link>
    </div>
  );
}

// ── a case study told in pictures ───────────────────────────────────────────

/** A drawn garment or object, shown whole rather than cropped. */
const cutOut = (a: WorkAsset) => !a.src && (a.kind === 'garment' || a.kind === 'artifact');

/** Width over height, from the file when it's known. */
const ratioOf = (a: WorkAsset) =>
  a.width && a.height ? a.width / a.height : a.orientation === 'portrait' ? 0.8 : a.orientation === 'landscape' ? 1.25 : 1;

/**
 * Numbered sections, pictures first. Nothing is written that the project doesn't
 * record: each section is a plain label and its pictures, at their own proportions.
 * A single picture is held to the screen's height and set off-centre, alternating
 * sides; a pair shares one height, each at its own width. A small source file (a
 * crop from a phone photo) is never blown up past twice its pixel width.
 */
function Chaptered({ w, next, study }: { w: WorkItem; next: WorkItem; study?: CaseStudy }) {
  const chapters = w.chapters!.map((c) => ({ ...c, pics: c.assets.map((id) => assetById(w, id)).filter((a): a is WorkAsset => !!a) }));
  return (
    <div className="wk overflow-x-clip">
    <Hero w={w} />
    <article className="mx-auto w-[min(94vw,1480px)] pb-24 pt-2 lg:pt-4">
      <Chips w={w} className="mt-8" />

      {chapters.map((c, i) => (
        <Fragment key={c.label}>
        <section className="mt-14 lg:mt-20" aria-label={c.label}>
          <h2 className="flex items-center gap-4 text-[0.9375rem] font-semibold text-ink/80">
            {c.label}
            <span className="h-px flex-1 bg-rule" aria-hidden />
          </h2>
          {c.kind === 'swatches' && w.palette ? (
            <Swatches palette={w.palette} />
          ) : c.kind === 'index' ? (
            <ArtIndex pics={c.pics} captions={c.captions} />
          ) : c.pics.length === 1 ? (
            <figure className={`mt-6 flex ${i % 2 ? 'lg:justify-end lg:pr-[6%]' : 'lg:pl-[6%]'}`}>
              <Pic a={c.pics[0]} eager={i === 0} height={i === 0 ? 'min(72vh, 860px)' : 'min(64vh, 760px)'} />
            </figure>
          ) : (
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-end">
              {c.pics.map((a, k) => (
                <figure key={a.id} className="min-w-0" style={{ flex: `${ratioOf(a)} 1 0%`, maxWidth: a.width ? a.width * 2 : undefined }}>
                  <div className="relative w-full" style={{ aspectRatio: String(ratioOf(a)) }}>
                    {/* A drawn piece sits on a raised plate. */}
                    {cutOut(a) && <div className="wk-plate absolute inset-0" />}
                    <div className={`absolute overflow-hidden ${cutOut(a) ? 'inset-[9%]' : 'inset-0 rounded-[18px]'}`}>
                      <Media asset={a} sizes="(min-width: 640px) 47vw, 94vw" />
                    </div>
                  </div>
                  {c.captions?.[k] && <figcaption className="mt-3 text-[0.875rem] text-muted">{c.captions[k]}</figcaption>}
                </figure>
              ))}
            </div>
          )}
        </section>
        {/* The words come after the first picture: the photograph introduces them. */}
        {i === 0 && study && <CaseBlock study={study} />}
        <Story story={(w.story ?? []).filter((t) => (t.after ?? chapters[0].label) === c.label)} />
        </Fragment>
      ))}

      <Footer next={next} />
    </article>
    </div>
  );
}

/** The palette: a block of each colour, named underneath. */
function Swatches({ palette }: { palette: NonNullable<WorkItem['palette']> }) {
  return (
    <div className="mt-8 lg:pl-[6%]">
      <ul className="wk-swatches grid grid-cols-3 sm:flex">
        {palette.map((c) => (
          <li key={c.name} className="sm:w-[min(13rem,30%)]">
            <div className="aspect-[4/5] rounded-2xl shadow-[inset_0_0_0_1px_theme(colors.ink/8%)]" style={{ background: c.hex }} />
            <p className="mt-3 text-[0.875rem] leading-tight text-ink/75">{c.name}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * A design made of many small drawings, taken apart: each drawing on its own tile,
 * numbered, with a plain label. Tiles keep the fabric's ground, so the grid reads as
 * the print laid out flat.
 */
function ArtIndex({ pics, captions }: { pics: WorkAsset[]; captions?: string[] }) {
  return (
    <ol className="mt-6 grid grid-cols-2 overflow-hidden rounded-2xl bg-ink sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {pics.map((a, k) => (
        <li key={a.id} className="group relative outline outline-1 -outline-offset-[0.5px] outline-paper/10">
          <div className="relative aspect-square">
            <div className="absolute inset-[16%] transition-transform duration-300 ease-out group-hover:scale-[1.06]">
              <Image src={a.src!} alt={a.alt} fill sizes="(min-width: 1280px) 18vw, (min-width: 1024px) 23vw, (min-width: 640px) 31vw, 47vw" className="object-contain" />
            </div>
          </div>
          {captions?.[k] && (
            <p className="absolute inset-x-0 bottom-0 truncate px-3 pb-3 text-[0.75rem] text-paper/60">{captions[k]}</p>
          )}
        </li>
      ))}
      {/* The last cell says what holds them together. */}
      <li className="relative flex aspect-square flex-col justify-end p-4 outline outline-1 -outline-offset-[0.5px] outline-paper/10">
        <p className="caps text-[clamp(1.4rem,2.2vw,2rem)] leading-[0.9] text-paper">One ink.</p>
        <p className="mt-2 font-sans text-[clamp(1rem,1.4vw,1.25rem)] font-medium leading-none text-paper/70">White on navy.</p>
      </li>
    </ol>
  );
}

function Pic({ a, height, eager = false }: { a: WorkAsset; height: string; eager?: boolean }) {
  const r = ratioOf(a);
  // Width follows the height cap, the page and, for a small file, twice its pixels.
  const cap = a.width ? `${a.width * 2}px` : '100%';
  return (
    <div className="relative overflow-hidden rounded-[18px]" style={{ aspectRatio: String(r), width: `min(100%, calc(${height} * ${r.toFixed(4)}), ${cap})` }}>
      <Media asset={a} sizes={`min(94vw, ${a.width ? a.width * 2 : 1400}px)`} eager={eager} />
    </div>
  );
}

/** Short prose sections: a label in the margin, the text at a reading measure. */
function Story({ story }: { story: NonNullable<WorkItem['story']> }) {
  if (!story.length) return null;
  return (
    <div className="mt-16 space-y-12 lg:mt-24 lg:space-y-16">
      {story.map((s) => (
        <section key={s.label} className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-[4vw]">
          <h2 className="text-[0.9375rem] font-semibold text-muted">{s.label}</h2>
          <div className="max-w-measure space-y-5">
            {/* One paragraph: the rest is for the call. */}
            <p className="text-lead text-ink/75">{s.body[0]}</p>
            {s.quote && (
              <figure className="pt-4">
                <blockquote className="font-sans text-[clamp(1.375rem,2vw,1.875rem)] font-medium leading-[1.2] text-uv">
                  “{s.quote.text}”
                </blockquote>
                <figcaption className="mt-4 text-[0.875rem] text-muted">{s.quote.cite}</figcaption>
              </figure>
            )}
          </div>
        </section>
      ))}
    </div>
  );
}
