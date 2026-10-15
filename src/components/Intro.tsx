/**
 * What Member Threads is, for a buyer landing cold: a heading, one paragraph,
 * three numbered principles and a closing line. Sits after the chapter (the
 * hoodie builder) and shares the header/hero frame so its left edge lines up
 * with the logo. Server component.
 */

// [CONFIRM] 01: every style is cut and sewn to spec (not decorated stock blanks).
const PRINCIPLES = [
  {
    n: '01',
    title: 'Made from the fabric up',
    body: 'We cut and sew to your spec: your choice of fabric, weight, color and fit. Not a stock blank with a logo pressed on.',
  },
  {
    n: '02',
    title: 'Every detail customizable',
    body: 'Embroidery, chenille, woven labels, custom trims and Pantone-matched colors, all in one clear price with no upcharges.',
  },
  {
    n: '03',
    title: 'Design team included',
    body: 'A designer turns your logo, colors and a few references into a cohesive collection, and revises it with you until it is right.',
  },
] as const;

export default function Intro() {
  return (
    <section aria-labelledby="intro-title" className="bg-paper py-20 text-ink sm:py-28 lg:py-32">
      <div className="mx-auto w-full max-w-[1536px] px-5 sm:px-8 lg:px-14">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-10">
          <div className="lg:col-span-7">
            <p className="label text-ink/60">What we do</p>
            <h2 id="intro-title" className="caps mt-5 text-[clamp(2rem,4vw,3.75rem)] leading-[0.95] tracking-[-0.03em]">
              Not merch. A collection.
            </h2>
          </div>
          <p className="max-w-[34rem] text-lead text-ink/75 lg:col-span-5 lg:pb-1">
            We make custom collections the way a label makes a season: considered pieces, one point of view,
            finished properly. You bring the organization. We handle design, production and delivery.
          </p>
        </div>

        <ul className="mt-14 grid gap-px overflow-hidden rounded-[20px] bg-rule sm:mt-16 md:grid-cols-3">
          {PRINCIPLES.map((c) => (
            <li key={c.n} className="flex flex-col bg-cream p-7 sm:p-9 lg:p-10">
              <span className="label text-ink/50">{c.n}</span>
              <h3 className="caps mt-10 text-[1.375rem] leading-[1.02] sm:mt-14 lg:text-[1.5rem]">{c.title}</h3>
              <p className="mt-4 max-w-[34ch] text-[1rem] leading-[1.6] text-ink/75">{c.body}</p>
            </li>
          ))}
        </ul>

        <p className="mx-auto mt-14 max-w-[44rem] text-balance text-center text-[clamp(1.25rem,2vw,1.625rem)] font-medium leading-[1.35] tracking-[-0.01em] text-ink sm:mt-20">
          Pieces your members keep reaching for,{' '}
          <span className="text-uv">season after season.</span>
        </p>
      </div>
    </section>
  );
}
