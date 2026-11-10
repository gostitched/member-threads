import { Star } from '@/components/Sticker';

/**
 * What Member Threads is, for a buyer landing cold: the name, a headline and a
 * lead, three plates and a closing line that hands off to How it works. The same
 * build as The Mitzvah Studio's intro. Shares the header/hero container so its
 * left edge lines up with the logo. Server component.
 */

// [CONFIRM] "Made from the fabric up": every style is cut and sewn to spec.
const INTRO = [
  {
    title: 'Made from the fabric up',
    body: 'Your fabric, weight, color and fit. Not a stock blank with a logo pressed on.',
    plate: 'bg-cream',
    rotate: -10,
  },
  {
    title: 'Every detail is yours',
    body: 'Embroidery, chenille, woven labels and trims, all in one clear price.',
    plate: 'bg-uv-lit/45',
    rotate: 12,
  },
  {
    title: 'A designer included',
    body: 'Send a logo and a few references. Your designer turns them into a collection.',
    plate: 'bg-dusty/10',
    rotate: 6,
  },
] as const;

export default function Intro() {
  return (
    <section aria-labelledby="intro-title" className="bg-paper pt-12 text-ink sm:pt-16">
      <div className="mx-auto w-full max-w-[1536px] px-5 sm:px-8 lg:px-14">
        <div className="grid gap-5 md:grid-cols-12 md:items-end md:gap-10">
          <div className="md:col-span-6">
            <p className="t-eyebrow text-uv">Member Threads</p>
            <h2 id="intro-title" className="t-h1 mt-3">
              Fully custom apparel for <em>your organization.</em>
            </h2>
          </div>
          <p className="t-lead md:col-span-6 md:pb-1">
            Member Threads makes fully custom apparel for clubs, companies, nonprofits and teams. You bring the name. We
            design it, make it and deliver it.
          </p>
        </div>

        <ul className="mt-10 grid gap-3 sm:mt-12 md:grid-cols-3 md:gap-4">
          {INTRO.map((c) => (
            <li key={c.title} className={`flex flex-col p-6 sm:p-8 ${c.plate}`}>
              <Star className="h-7 w-7 text-uv" rotate={c.rotate} />
              <h3 className="t-h3 mt-5">{c.title}</h3>
              <p className="t-body mt-3 text-ink/90">{c.body}</p>
            </li>
          ))}
        </ul>

        <p className="t-lead mx-auto mt-10 max-w-[44rem] text-balance text-center !text-[clamp(1.25rem,2vw,1.625rem)] sm:mt-14">
          Pieces your members will reach for <em className="text-uv">long after the event.</em>
        </p>
      </div>
    </section>
  );
}
