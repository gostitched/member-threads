/**
 * Case studies: one per collection in @/lib/work, matched by `caseId`.
 *
 * CONCEPT CONTENT. Each entry is a worked example of a Member Threads collection for an
 * invented organization: no client names, photographs or quotes, because inventing
 * those would be fabricating credentials. When a real organization agrees to be
 * featured, swap the concept out and add a `quote` only once they've cleared it.
 *
 * Metrics are the concept's own numbers (pieces and styles), never claims about the
 * business. Lead times live in the FAQ in @/lib/site.
 */
export type CaseStudy = {
  id: string;
  sector: string;
  brand: string;
  /** The headline. One word wrapped in *asterisks* is set in italic, the house emphasis. */
  title: string;
  /** The ask: what the organization came in with. */
  challenge: string;
  /** The collection: what we designed and made. */
  approach: string;
  metrics: { k: string; v: string }[];
  /** Optional attributed quote. Only ever populate with a real, cleared one. */
  quote?: { text: string; by: string };
};

export const CASES: CaseStudy[] = [
  {
    id: 'ashford',
    sector: 'Concept collection · University club · Fall recruitment',
    brand: 'Member Threads',
    title: 'A five-piece recruitment collection that looks like the campus store’s *best* shelf',
    challenge: 'Recruitment week is the first thing new students see of the society. Members should look like they came from the best shelf in the campus store, not a career-fair table, with one piece just for the exec board.',
    approach: 'An oatmeal hoodie with ASHFORD arched in burgundy tackle twill, a crest crewneck, a heather quarter-zip reserved for the board, a tee for every new member and a six-panel cap.',
    metrics: [
      { k: 'Pieces', v: '438' },
      { k: 'Styles', v: '5' },
    ],
  },
  {
    id: 'halden',
    sector: 'Concept collection · Company · New-hire kit',
    brand: 'Member Threads',
    title: 'A first-day kit people wear on *weekends*',
    challenge: 'Most of what new hires had been handed ended up in a drawer. The kit had to be worn outside the office, with the logo small enough that it never feels like a uniform.',
    approach: 'A tonal charcoal hoodie, a stone quarter-zip, a bone heavyweight tee with the one loud moment in ember, a cap and a canvas tote.',
    metrics: [
      { k: 'Pieces', v: '328' },
      { k: 'Styles', v: '5' },
    ],
  },
  {
    id: 'riverbend',
    sector: 'Concept collection · Nonprofit · Charity 5K',
    brand: 'Member Threads',
    title: 'Race-day apparel that *funds* the mission instead of costing it',
    challenge: 'The 5K is the biggest fundraiser of the year. Runners need a shirt, volunteers need to be easy to spot, and the merch table needs something good enough to sell.',
    approach: 'A linen race tee for every registrant, a teal volunteer crewneck, a supporter hoodie with a woven patch and a teal rope cap.',
    metrics: [
      { k: 'Pieces', v: '528' },
      { k: 'Styles', v: '4' },
    ],
  },
  {
    id: 'eastline',
    sector: 'Concept collection · Run club · Members’ issue',
    brand: 'Member Threads',
    title: 'Something to race in, and something for *after*',
    challenge: 'A club that runs three mornings a week wanted something to race in and something to wear to coffee after, in its orange, without looking like a fun-run giveaway.',
    approach: 'An asphalt singlet and short, a chalk members’ tee, a heather crewneck with an arched wordmark and a safety-orange cap.',
    metrics: [
      { k: 'Pieces', v: '396' },
      { k: 'Styles', v: '5' },
    ],
  },
  {
    id: 'holloway',
    sector: 'Concept collection · Members’ club · Spring capsule',
    brand: 'Member Threads',
    title: 'A capsule that sits next to what members *already* own',
    challenge: 'Members of a private club already own good clothes, and pro-shop logo wear wasn’t getting worn. The brief: a small seasonal capsule, the crest and nothing else.',
    approach: 'An ivory crest polo, a navy quarter-zip, an oxford-blue crewneck in navy script and an ivory rope cap, embroidered throughout.',
    metrics: [
      { k: 'Pieces', v: '276' },
      { k: 'Styles', v: '4' },
    ],
  },
];
