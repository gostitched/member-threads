/**
 * About page copy.
 *
 * [CONFIRM] The founder quote, the origin story and the milestone lines are
 * drafted from the brand brief. Ethan to confirm before launch; the page reads
 * only from here.
 */
export const FOUNDER = {
  name: 'Ethan Scher',
  role: 'Founder',
  /** Drop a photo in /public/about/ and set the path here. */
  photo: '/about/founder.jpg' as string | null,
  quote: 'The apparel should feel as considered as the rest of the event.',
};

export const ORIGIN = {
  intro:
    'The Mitzvah Studio started inside Stitched, a custom apparel studio that designs and makes clothes from the fabric up. Families and planners kept asking for Mitzvah apparel that didn’t look like a giveaway, so we gave it a studio of its own.',
  story: [
    'Ethan started Stitched in 2023, making apparel for his college clubs. Instead of picking blanks from a catalog, he worked directly with manufacturers to build garments from scratch: the fabric, the fit, the color, the label inside the neck.',
    'Then the Bar and Bat Mitzvah requests started. Not giveaways, but pieces that matched the rest of a very designed weekend, the kind a 13-year-old would actually keep wearing. What was out there was mostly wholesale hoodies with a logo pressed on.',
    'So the Studio designs the collection around the kid, and Stitched makes every piece. One designer per family, our own production team, and the same standards whether it’s 50 pieces or 150.',
  ],
};

export const MILESTONES = [
  { year: 'Stitched', line: 'Since 2023: garments designed and made from scratch for clubs, companies and brands.' },
  { year: 'The ask', line: 'Families and planners asking for Mitzvah apparel worth keeping.' },
  { year: 'The Studio', line: 'A dedicated team and process for Bar, Bat and B’nai Mitzvah collections.' },
  { year: 'Now', line: 'Designing collections for families and the planners who work with them.' },
] as const;

/** The #planners section on /about. */
export const PLANNERS = [
  { title: 'Concept', line: 'Send the deck or the mood board. We design to the event’s palette and look, not around it.' },
  { title: 'Timeline', line: 'We work back from the date and tell you on day one if it’s tight.' },
  { title: 'Proofs', line: 'Proofs go to you and the family together, so nobody is chasing approvals.' },
  { title: 'Delivery', line: 'Packed and labelled, to the venue, the hotel or the family’s door.' },
] as const;
