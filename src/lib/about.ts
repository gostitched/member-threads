/**
 * About page copy. The page reads only from here.
 *
 * True and on file: Ethan Scher founded Stitched in 2023, making apparel for
 * his own college clubs. Member Threads is the organization-focused brand
 * under Stitched Group. Anything else marked [CONFIRM] is listed in README
 * "Before launch".
 */
export const FOUNDER = {
  name: 'Ethan Scher',
  role: 'Founder',
  /** Drop a photo in /public/about/ and set the path here (null shows a plain plate). */
  photo: '/about/founder.jpg' as string | null,
};

export const ORIGIN = {
  intro:
    'Member Threads designs and makes custom apparel collections for organizations: university clubs, companies, nonprofits, teams and associations. Pieces with the quality of a retail label, made for the people who wear your name.',
  /** The large statement in the "Why" section. */
  why: 'Most organizations want better merchandise. They just don’t know how to create it, or where to source it.',
  whyBody:
    'The usual answer is a promo catalog and a logo on a blank tee. It gets handed out once and ends up in a drawer. We think the people who show up for your organization deserve something they reach for on their own: the right fabric, a considered fit, colors that are actually yours, finished with the care of a real apparel brand.',
  // [CONFIRM] "worked directly with manufacturers" and "fabric, fit, color, label" detail, carried over from the Stitched story.
  story: [
    'Ethan Scher started making apparel in 2023 for his own college clubs. The options were the same everywhere: pick a blank from a catalog, press a logo on it, hope people wear it.',
    'So he went further. He worked directly with manufacturers to build the pieces properly: the fabric, the fit, the color, the label inside the neck. Members wore them. Other clubs asked for the same.',
    'That work became Stitched. Member Threads is how we bring it to every kind of organization, with a catalog to start from, a designer to shape it, and one clear price.',
  ],
};

/** "What you get" on /about: what every organization gets, whatever the size. */
export const OFFER = [
  {
    title: 'A dedicated designer',
    line: 'One person owns your collection from first sketch to final proof. Bring a logo and a few references; no design team needed.',
  },
  {
    title: 'One clear price',
    line: 'Embroidery, custom colors, extra print locations and design are built into one per-piece price, quoted before anything is made.',
  },
  {
    title: 'Reorders on file',
    line: 'Every approved piece is saved to your organization, so next season’s run starts where the last one left off.',
  },
  {
    // [CONFIRM] nationwide delivery.
    title: 'Delivered nationwide',
    line: 'Packed by size and shipped to your office, campus or event, anywhere in the U.S.',
  },
] as const;

/** How Member Threads and Stitched Group divide the work. */
export const STITCHED = {
  title: 'Part of Stitched Group.',
  // [CONFIRM] the division of responsibilities between Member Threads and Stitched Group.
  body: 'Member Threads is where organizations design their collections. Stitched Group, our parent company, runs sourcing, production, quality control and logistics. One team from brief to delivery, with no middleman between your designer and the people making the pieces.',
};
