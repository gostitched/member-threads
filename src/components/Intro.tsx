import { Star } from "@/components/Sticker";

/**
 * What The Mitzvah Studio is, for a parent landing cold: an intro, three cards and
 * a closing line, in the owner's words. Sits after the chapter (the hoodie builder)
 * and shares the header/hero container so its left edge lines up with the logo.
 */

/** The three ideas in "what we are", in the owner's words. */
const INTRO = [
  {
    title: "Made from scratch",
    body: "Each piece is made from scratch, meaning we cut and sew the garments for your celebration, with your choice of fabrics, colors, fit, and details.",
    plate: "bg-electric-lit",
    star: "fill",
    rotate: -10,
  },
  {
    title: "Every detail is yours",
    body: "From custom hood linings to embroidered sleeves, make every part your own. Customization is included in one clear price, with no surprise fees.",
    plate: "bg-pop-lit",
    star: "fill",
    rotate: 12,
  },
  {
    title: "A free design team",
    body: "Our free design team turns your theme, inspiration, or rough ideas into a complete collection of hoodies, tees, matching sets, hats, and more.",
    plate: "bg-cream",
    star: "fill",
    rotate: 6,
  },
] as const;

export default function Intro() {
  return (
    <section
      aria-label="What The Mitzvah Studio is"
      className="bg-paper pt-12 text-ink sm:pt-12"
    >
      <div className="mx-auto w-full max-w-[1536px] px-5 sm:px-8 lg:px-14">
        <div className="grid gap-5 md:grid-cols-12 md:items-end md:gap-10">
          <div className="md:col-span-6">
            <p className="font-sans text-[0.8125rem] font-medium uppercase tracking-[0.18em] text-uv">
              The Mitzvah Studio
            </p>
            <h2 className="caps mt-3 text-[clamp(2.1rem,4.4vw,3.75rem)] leading-[0.93]">
              Fully custom apparel for bar &amp; bat mitzvahs.
            </h2>
          </div>
          <p className="text-lead text-ink/75 md:col-span-6 md:pb-1">
            The Mitzvah Studio creates fully custom apparel for bar and bat
            mitzvahs. We guide you through the possibilities and handle
            everything from design to delivery.
          </p>
        </div>

        <ul className="mt-10 grid gap-3 sm:mt-12 md:grid-cols-3 md:gap-4">
          {INTRO.map((c) => (
            <li
              key={c.title}
              className={`relative flex flex-col rounded-3xl p-6 sm:p-8 ${c.plate}`}
            >
              <Star
                variant={c.star}
                className="h-7 w-7 text-uv"
                rotate={c.rotate}
              />
              <h3 className="caps mt-5 text-[1.375rem] leading-[1.05] sm:text-[1.5rem]">
                {c.title}
              </h3>
              <p className="mt-3 text-[1rem] leading-[1.55] text-ink/80">
                {c.body}
              </p>
            </li>
          ))}
        </ul>

        <p className="mx-auto mt-10 max-w-[44rem] text-balance text-center font-sans text-[clamp(1.25rem,2vw,1.625rem)] font-medium leading-[1.35] text-ink sm:mt-14">
          Creating pieces your guests will love{" "}
          <span className="text-uv">long after the party.</span>
        </p>
      </div>
    </section>
  );
}
