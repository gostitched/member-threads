/**
 * Case studies: one per collection in @/lib/work, matched by `caseId`.
 *
 * CONCEPT CONTENT. Each entry is a worked example of a Mitzvah Studio collection, not
 * a real family: no client names, photographs or quotes, because inventing those
 * would be fabricating credentials. When a real family agrees to be featured, swap
 * the concept out and add a `quote` only once they've cleared it.
 *
 * Each title leads with what the family got; the ask and the collection back it up.
 * Lead times are the studio's standard [CONFIRM before launch].
 */
export type CaseStudy = {
  id: string;
  sector: string;
  brand: string;
  title: string;
  /** The ask: what the family (or their planner) came in with. */
  challenge: string;
  /** The collection: what we designed and made. */
  approach: string;
  metrics: { k: string; v: string }[];
  /** Optional attributed quote. Only ever populate with a real, cleared one. */
  quote?: { text: string; by: string };
};

export const CASES: CaseStudy[] = [
  {
    id: 'sophie',
    sector: 'Concept collection · Bat Mitzvah · Miami, Florida',
    brand: 'The Mitzvah Studio',
    title: '86 pieces in cream, navy and baby blue, boxed by name and waiting at the door',
    challenge: 'Cream, navy and baby blue. She loves Aviator Nation and vintage country-club stuff. Something amazing for 80 kids, and a matching set for her closest friends.',
    approach: 'A 420 GSM oversized hoodie with contrast rib and her name in satin script, a Pantone-matched baby tee and foldover short for the friends, sweats, dance-floor caps and PJ pants: one palette, one drop.',
    metrics: [
      { k: 'Pieces', v: '86' },
      { k: 'Guests', v: '80' },
      { k: 'Lead time', v: '12 weeks' },
      { k: 'Pieces by name', v: 'All 86' },
    ],
  },
  {
    id: 'jake',
    sector: 'Concept collection · Bar Mitzvah · Scottsdale, Arizona',
    brand: 'The Mitzvah Studio',
    title: 'A 72-piece country-club collection built around one crest',
    challenge: 'A golf weekend in Scottsdale that should feel like an old members’ club, not a party store. Forest green, cream and a little butter yellow.',
    approach: 'JAKE in chenille on a forest hoodie, a crest polo, rope-brim caps for the dance floor, PJ pants with the crest on repeat, a tote for the parents and a box for every guest.',
    metrics: [
      { k: 'Pieces', v: '72' },
      { k: 'Guests', v: '64' },
      { k: 'Lead time', v: '12 weeks' },
      { k: 'Pieces by name', v: 'All 72' },
    ],
  },
  {
    id: 'levi-noa',
    sector: 'Concept collection · B’nai Mitzvah · Westchester, New York',
    brand: 'The Mitzvah Studio',
    title: 'One racing team, two drivers, 118 numbered pieces',
    challenge: 'Twins, one party and two very different kids, both into cars. Make it a vintage racing team without putting them in matching outfits.',
    approach: 'A white jersey for Levi and a black one for Noa, each with their own number, a silver Grand Prix crewneck, caps and checker totes, with a woven label numbering every piece out of 118.',
    metrics: [
      { k: 'Pieces', v: '118' },
      { k: 'Guests', v: '110' },
      { k: 'Lead time', v: '12 weeks' },
      { k: 'Pieces by name', v: 'All 118' },
    ],
  },
  {
    id: 'ella',
    sector: 'Concept collection · Bat Mitzvah · Los Angeles, California',
    brand: 'The Mitzvah Studio',
    title: 'A ballet-core collection her friends wear to the studio, long after the party',
    challenge: 'She dances and wanted it to look like it: soft pink, ribbon, nothing loud. Pieces for the studio and for sleepovers.',
    approach: 'An oat zip hoodie and a ribbed black tank with “Ella” in script, blush gingham PJ pants for the after-party and a tote, each boxed in blush with a satin ribbon.',
    metrics: [
      { k: 'Pieces', v: '64' },
      { k: 'Guests', v: '58' },
      { k: 'Lead time', v: '12 weeks' },
      { k: 'Pieces by name', v: 'All 64' },
    ],
  },
];
