"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState, type PointerEvent } from "react";
import { Arrow } from "@/components/SiteHeader";
import { PHOTOS, type PhotoSlug } from "@/lib/photos";
import { SEGMENTS } from "@/lib/site";
import "./home.css";

/**
 * Who we make it for: the page's one green band, The Roster. Five audiences as
 * numbered rows divided by hairlines: roster number, the name in the serif,
 * one line on what they order it for, and the pieces they typically order.
 *
 * Desktop with a pointer: a duotone photo slides along the row under the
 * cursor and the name steps 8px right. Phones get the plain list. The photos
 * are mood images, not clients; they carry no claim and are decorative here.
 */

const PEEK: Record<(typeof SEGMENTS)[number]["id"], PhotoSlug> = {
  campus: "lifestyle-park-picnic",
  company: "segment-company-coffee-team",
  nonprofit: "segment-nonprofit-garden",
  athletic: "segment-athletic-rowing",
  social: "segment-social-croquet",
};

export default function Segments() {
  const listRef = useRef<HTMLDivElement>(null);
  const peekRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<number | null>(null);

  const follow = (e: PointerEvent<HTMLLIElement>, i: number) => {
    if (e.pointerType !== "mouse") return;
    const list = listRef.current;
    const peek = peekRef.current;
    if (!list || !peek) return;
    const box = list.getBoundingClientRect();
    const row = e.currentTarget.getBoundingClientRect();
    // Follow the cursor across the row; stay centred on the row vertically.
    peek.style.setProperty("--x", `${e.clientX - box.left}px`);
    peek.style.setProperty("--y", `${row.top - box.top + row.height / 2}px`);
    if (active !== i) setActive(i);
  };

  return (
    <section
      aria-labelledby="segments-title"
      className="band-green sec overflow-x-clip"
    >
      <div className="shell">
        <div className="grid-12 items-end gap-y-6">
          <div className="col-span-4 sm:col-span-8 lg:col-span-7">
            <p className="t-eyebrow text-beige">The roster</p>
            <h2 id="segments-title" className="t-h1 mt-5">
              Built for every kind of <em>membership.</em>
            </h2>
          </div>
          <p className="t-lead fg-muted col-span-4 max-w-measure sm:col-span-7 lg:col-span-5 lg:pb-1">
            If a group of people wears it together, it belongs in a collection.
            These are the organizations we make for most, and what they tend to
            order.
          </p>
        </div>

        <div
          ref={listRef}
          className="relative mt-16 sm:mt-20 lg:mt-24"
          onPointerLeave={() => setActive(null)}
        >
          <ol className="roster-list hairline relative z-[1]">
            {SEGMENTS.map((s, i) => (
              <li
                key={s.id}
                className="roster-row hairline-b grid-12 gap-y-3 py-8 lg:items-baseline lg:py-10"
                onPointerMove={(e) => follow(e, i)}
              onPointerEnter={(e) => follow(e, i)}
              >
                <span className="t-spec col-span-4 text-beige sm:col-span-8 lg:col-span-1">
                  No. {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="col-span-4 sm:col-span-8 lg:col-span-6">
                  <span className="roster-name t-h1 roster-size">{s.label}</span>
                  <span className="sr-only">: {s.title}</span>
                </h3>
                <div className="col-span-4 mt-2 sm:col-span-6 lg:col-span-5 lg:mt-0">
                  <p className="t-body max-w-[44ch] text-cream/90">{s.body}</p>
                  <ul
                    aria-label="Typical pieces"
                    className="mt-4 flex flex-wrap gap-2"
                  >
                    {s.pieces.map((p) => (
                      <li key={p} className="tag text-cream/90">
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            ))}
          </ol>

          {/* The cursor photo (desktop pointer only). */}
          <div
            ref={peekRef}
            aria-hidden
            data-on={active !== null}
            className="roster-peek hidden aspect-[4/5] lg:block"
          >
            {SEGMENTS.map((s, i) => {
              const p = PHOTOS[PEEK[s.id]];
              return (
                <div
                  key={s.id}
                  data-on={active === i}
                  className="photo duo grain"
                >
                  <Image
                    src={p.src}
                    width={p.width}
                    height={p.height}
                    alt=""
                    sizes="264px"
                    loading="lazy"
                    style={{ objectPosition: p.objectPosition }}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* The house number. */}
        <div className="grid-12 mt-16 items-end gap-y-8 sm:mt-20">
          <p
            aria-hidden
            className="t-block col-span-4 text-[clamp(5rem,10vw,9rem)] leading-[0.8] text-beige sm:col-span-3 lg:col-span-3"
          >
            36
          </p>
          <p className="t-h2 col-span-4 max-w-[24ch] sm:col-span-5 lg:col-span-5">
            Don’t see yours? If you have 36 people who’d wear it,{" "}
            <em>we can make it.</em>
          </p>
          <div className="col-span-4 sm:col-span-8 lg:col-span-4 lg:justify-self-end">
            <Link href="/quote" className="btn-white w-full sm:w-auto">
              Start a collection <Arrow className="h-[14px] w-[19px]" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
