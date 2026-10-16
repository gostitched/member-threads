import Image from "next/image";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import { Arrow } from "@/components/SiteHeader";
import { PHOTOS, type PhotoSlug } from "@/lib/photos";
import "@/components/home/home.css";

/**
 * How it works. The heading, lead and CTA hold a sticky left column (cols
 * 1–4); four steps run down the right (cols 6–12), 96px apart, their numerals
 * joined by one running stitch that sews itself downward as the list scrolls
 * in. Each step: block numeral, title, one plain paragraph and a small detail
 * photograph. Anchor for the header's "How it works" link (/#how).
 */
// [CONFIRM] 04: approved pieces are saved per organization for reorders (matches FAQ 05).
const STEPS: {
  n: string;
  title: string;
  body: string;
  photo: PhotoSlug;
  caption: string;
}[] = [
  {
    n: "01",
    title: "Tell us about your group.",
    body: "Your logo, your colors, roughly how many people and when you need it. A brand guide or a few screenshots is plenty.",
    photo: "craft-fabric-swatches",
    caption: "Fabric, weight and color",
  },
  {
    n: "02",
    title: "Design it with us.",
    body: "Pick styles from the catalog and your designer builds them into one collection: colors, fabric, artwork, embroidery and fit.",
    photo: "craft-studio-cutting-table",
    caption: "At the pattern table",
  },
  {
    n: "03",
    title: "Approve one price.",
    body: "Review the proofs and a single quote for the whole collection. Customization is included, so the price you approve is the price you pay.",
    photo: "craft-thread-cones",
    caption: "Thread, matched to your colors",
  },
  {
    n: "04",
    title: "We make it. You wear it.",
    body: "We produce and deliver the collection. Every approved piece is saved to your organization, so next season starts where this one left off.",
    photo: "detail-folded-stack-warm",
    caption: "Folded, counted, delivered",
  },
];

export default function HowItWorks() {
  return (
    <section
      id="how"
      aria-labelledby="how-title"
      className="sec scroll-mt-[var(--header-h)] bg-paper text-ink"
    >
      <div className="shell grid-12">
        <div className="col-span-4 sm:col-span-8 lg:col-span-5">
          <div className="lg:sticky lg:top-[calc(var(--header-h)+4rem)]">
            <p className="t-eyebrow fg-muted">How it works</p>
            <h2 id="how-title" className="t-h1 mt-5">
              Four steps. <br className="hidden sm:block" />
              <em>One</em> collection.
            </h2>
            <p className="t-lead mt-6 max-w-[30ch] sm:mt-8">
              From a logo and a rough idea to a finished collection, with one
              designer and one price the whole way.
            </p>
            <Link href="/quote" className="btn-blue mt-10 w-full sm:w-auto">
              Start a collection <Arrow className="h-[14px] w-[19px]" />
            </Link>
          </div>
        </div>

        <div className="how-steps col-span-4 mt-16 sm:col-span-8 lg:col-start-6 lg:col-end-13 lg:mt-2">
          <ol className="flex flex-col gap-y-24">
            {STEPS.map((s) => {
              const p = PHOTOS[s.photo];
              return (
                <li
                  key={s.n}
                  className="how-step grid grid-cols-[var(--num-w)_minmax(0,1fr)] gap-x-5 sm:gap-x-8"
                >
                  {/* The thread to the next numeral (none after the last). */}
                  <span aria-hidden className="how-thread stitch-rule-v" />
                  <span aria-hidden className="how-num t-block self-start bg-paper">
                    {s.n}
                  </span>
                  <Reveal className="grid gap-x-8 gap-y-8 md:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)]">
                    <div className="pt-1">
                      <h3 className="t-h3">
                        <span className="sr-only">Step {s.n}: </span>
                        {s.title}
                      </h3>
                      <p className="t-body mt-4 max-w-[40ch] text-ink/90">
                        {s.body}
                      </p>
                    </div>
                    <figure className="max-w-[22rem] md:max-w-none">
                      <div className="wipe-in photo grade grain aspect-[3/2]">
                        <Image
                          src={p.src}
                          width={p.width}
                          height={p.height}
                          alt={p.alt}
                          sizes="(min-width: 1024px) 22vw, (min-width: 768px) 36vw, 80vw"
                          style={{ objectPosition: p.objectPosition }}
                        />
                      </div>
                      <figcaption className="caption">{s.caption}</figcaption>
                    </figure>
                  </Reveal>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
