import type { Art, Deco, Drawn } from './work';

/**
 * Get Inspired: concept designs, none of them made for a real organization.
 *
 * Every theme below is a made-up club, team, company or cause, drawn in its own
 * colors. To add one, add a line to THEMES; it gets its own filter and its designs
 * join the wall. The drawn tiles are placeholders. To publish a real mockup (with the
 * organization's permission), drop the file in public/inspo/ and add it to UPLOADS:
 * real ones lead the wall. Remove a theme from THEMES once real work covers it.
 */

export type PieceGroup = 'hoodies' | 'tops' | 'outerwear' | 'bottoms' | 'hats' | 'extras';

export const PIECE_GROUPS: { id: PieceGroup; label: string }[] = [
  { id: 'hoodies', label: 'Hoodies & Crewnecks' },
  { id: 'tops', label: 'Tees, Polos & Jerseys' },
  { id: 'outerwear', label: 'Outerwear' },
  { id: 'bottoms', label: 'Shorts & Sweats' },
  { id: 'hats', label: 'Hats' },
  { id: 'extras', label: 'Totes' },
];

export type Inspo = {
  id: string;
  theme: string;
  piece: string;
  group: PieceGroup | null;
  /** A real mockup, under /public. Wins over `art`. */
  src?: string;
  art?: Art;
  /** What the tile sits on. Flat lays and photos fill the tile. */
  ground: string;
  /** Height over width, which sets the tile's shape on the wall. */
  ratio: number;
};

/** Real mockups: { id, theme, piece, group, src: '/inspo/file.jpg', ground: '#F4EFE6', ratio: height / width }. */
const UPLOADS: Inspo[] = [];

type Palette = { a: string; b: string; c: string; d: string };
type Theme = {
  id: string;
  /** The organization, as the filter and the captions name it. */
  label: string;
  /** The short name, as it is embroidered or printed on a piece. */
  name: string;
  word: [string, string];
  p: Palette;
  face: 'block' | 'varsity' | 'script' | 'chenille';
  grounds: string[];
  pattern: Drawn['pattern'];
  pieces: (keyof typeof RECIPES)[];
};

/** How each face is usually made: varsity in tackle twill, block as a print, the rest embroidered. */
const techOf = (face: Theme['face']): Extract<Deco, { t: 'type' }>['tech'] =>
  face === 'varsity' ? 'twill' : face === 'block' ? 'print' : 'embroidery';

const say = (t: Theme, lines: string[], ink: string, ink2?: string, arch?: boolean): Deco => ({
  t: 'type', lines, face: t.face, tech: techOf(t.face), ink, ink2, arch,
});
const script = (name: string, ink: string): Deco => ({ t: 'type', lines: [name], face: 'script', tech: 'embroidery', ink });
const caps = (t: Theme) => t.name.toUpperCase();
const first = (t: Theme) => t.name[0];

const RECIPES = {
  hoodie: { piece: 'Hoodie', group: 'hoodies', g: (t: Theme): Drawn => ({ kind: 'hoodie', color: t.p.a, trim: t.p.c, lining: t.p.b, deco: say(t, [caps(t)], t.p.b, t.p.c, true) }) },
  zip: { piece: 'Zip hoodie', group: 'hoodies', g: (t: Theme): Drawn => ({ kind: 'ziphoodie', color: t.p.b, trim: t.p.a, lining: t.p.a, place: 'left', deco: script(t.name, t.p.a) }) },
  crew: { piece: 'Crewneck', group: 'hoodies', g: (t: Theme): Drawn => ({ kind: 'crewneck', color: t.p.c, trim: t.p.a, deco: { t: 'type', lines: t.word, face: 'block', tech: 'print', ink: t.p.b, ink2: t.p.d } }) },
  quarter: { piece: 'Quarter-zip', group: 'hoodies', g: (t: Theme): Drawn => ({ kind: 'quarterzip', color: t.p.a, trim: t.p.d, place: 'left', deco: { t: 'crest', letter: first(t), ground: t.p.b, ink: t.p.a } }) },
  tee: { piece: 'Tee', group: 'tops', g: (t: Theme): Drawn => ({ kind: 'tee', color: t.p.b, trim: t.p.a, deco: { t: 'type', lines: t.word, face: 'block', tech: 'print', ink: t.p.a, ink2: t.p.c } }) },
  long: { piece: 'Long sleeve', group: 'tops', g: (t: Theme): Drawn => ({ kind: 'longsleeve', color: t.p.d, trim: t.p.c, place: 'left', deco: say(t, [caps(t)], t.p.c) }) },
  tank: { piece: 'Singlet', group: 'tops', g: (t: Theme): Drawn => ({ kind: 'tank', color: t.p.c, trim: t.p.c, deco: script(t.name, t.p.d) }) },
  // 36, the minimum, is the house number.
  jersey: { piece: 'Jersey', group: 'tops', g: (t: Theme): Drawn => ({ kind: 'jersey', color: t.p.b, trim: t.p.a, stripes: { ink: t.p.a, ink2: t.p.c }, deco: { t: 'type', lines: [caps(t), '36'], face: 'block', tech: 'twill', ink: t.p.c, ink2: t.p.a } }) },
  polo: { piece: 'Polo', group: 'tops', g: (t: Theme): Drawn => ({ kind: 'polo', color: t.p.b, trim: t.p.a, place: 'left', deco: { t: 'crest', letter: first(t), ground: t.p.a, ink: t.p.b } }) },
  coach: { piece: 'Coach jacket', group: 'outerwear', g: (t: Theme): Drawn => ({ kind: 'jacket', color: t.p.c, trim: t.p.b, place: 'left', deco: script(t.name, t.p.b) }) },
  cap: { piece: 'Cap', group: 'hats', g: (t: Theme): Drawn => ({ kind: 'cap', color: t.p.a, trim: t.p.b, deco: { t: 'type', lines: [caps(t)], face: 'block', tech: 'embroidery', ink: t.p.b } }) },
  capcrest: { piece: 'Crest cap', group: 'hats', g: (t: Theme): Drawn => ({ kind: 'cap', color: t.p.b, trim: t.p.c, rope: t.p.d, deco: { t: 'crest', letter: first(t), ground: t.p.b, ink: t.p.c } }) },
  short: { piece: 'Short', group: 'bottoms', g: (t: Theme): Drawn => ({ kind: 'shorts', color: t.p.a, trim: t.p.c, deco: { t: 'type', lines: [first(t)], face: 'script', tech: 'embroidery', ink: t.p.b } }) },
  sweat: { piece: 'Sweatpant', group: 'bottoms', g: (t: Theme): Drawn => ({ kind: 'pants', color: t.p.c, stripes: { ink: t.p.a, ink2: t.p.b }, place: 'left', deco: { t: 'type', lines: [first(t)], face: 'chenille', tech: 'embroidery', ink: t.p.b, ink2: t.p.a } }) },
  tote: { piece: 'Tote', group: 'extras', g: (t: Theme): Drawn => ({ kind: 'tote', color: t.p.b, trim: t.p.a, deco: script(t.name, t.p.a) }) },
} as const;

// Grounds, all from the board: paper, cream, oat, and beige, green and dusty blue let down with paper.
const CREAM = '#EEE6D9';
const OAT = '#E4DACA';
const SAND = '#E1D6C8';
const SAGE = '#DDDCD3';
const MIST = '#DFDCD5';
const PAPER = '#F4EFE6';
const GREEN = '#133327';
const DUSTY = '#223041';

const THEMES: Theme[] = [
  { id: 'harbor', label: 'Harbor Run Club', name: 'Harbor', word: ['HARBOR', 'RUN CLUB'], face: 'block',
    p: { a: '#1F3D30', b: '#EEE6D9', c: '#223041', d: '#C4B19A' }, grounds: [CREAM, SAGE, OAT],
    pattern: { t: 'stripe', ink: '#1F3D30', ink2: '#C4B19A' }, pieces: ['quarter', 'tee', 'tank', 'short', 'cap', 'crew', 'long', 'tote', 'hoodie'] },
  { id: 'eastline', label: 'Eastline Rowing', name: 'Eastline', word: ['EASTLINE', 'ROWING'], face: 'varsity',
    p: { a: '#5A2230', b: '#F2EDE3', c: '#1E2A3D', d: '#B89B5E' }, grounds: [SAND, CREAM, MIST],
    pattern: { t: 'stripe', ink: '#5A2230', ink2: '#B89B5E' }, pieces: ['hoodie', 'crew', 'jersey', 'polo', 'capcrest', 'sweat', 'short', 'tote', 'quarter'] },
  { id: 'ashford', label: 'Ashford Debate Union', name: 'Ashford', word: ['ASHFORD', 'DEBATE'], face: 'varsity',
    p: { a: '#223041', b: '#EEE6D9', c: '#6A5A45', d: '#B08A57' }, grounds: [CREAM, MIST, OAT],
    pattern: { t: 'check', ink: '#223041' }, pieces: ['crew', 'hoodie', 'quarter', 'polo', 'capcrest', 'tee', 'tote', 'sweat', 'long'] },
  { id: 'fieldnote', label: 'Fieldnote Studio', name: 'Fieldnote', word: ['FIELDNOTE', 'STUDIO'], face: 'block',
    p: { a: '#2E2E2B', b: '#E9E4DA', c: '#7C8B6F', d: '#C4B19A' }, grounds: [OAT, SAGE, PAPER],
    pattern: { t: 'stripe', ink: '#2E2E2B', ink2: '#7C8B6F' }, pieces: ['quarter', 'polo', 'tote', 'cap', 'crew', 'tee', 'long', 'zip', 'coach'] },
  { id: 'orchard', label: 'Orchard Lane Coffee', name: 'Orchard', word: ['ORCHARD', 'LANE'], face: 'script',
    p: { a: '#6B3A26', b: '#F1EADF', c: '#2F4A3A', d: '#D9A65A' }, grounds: [SAND, CREAM, SAGE],
    pattern: { t: 'check', ink: '#6B3A26' }, pieces: ['tee', 'cap', 'tote', 'zip', 'crew', 'long', 'hoodie', 'short', 'polo'] },
  { id: 'cedar', label: 'Cedar Street Garden', name: 'Cedar', word: ['CEDAR ST', 'GARDEN'], face: 'block',
    p: { a: '#3C5A3A', b: '#F0E9DC', c: '#4A3A2A', d: '#D8B26A' }, grounds: [SAGE, CREAM, OAT],
    pattern: { t: 'scatter', motif: 'letter', letter: 'C', ink: '#3C5A3A' }, pieces: ['tee', 'hoodie', 'crew', 'tote', 'cap', 'long', 'short', 'sweat', 'zip'] },
  { id: 'whitcombe', label: 'Whitcombe Bowls Club', name: 'Whitcombe', word: ['WHITCOMBE', 'BOWLS'], face: 'script',
    p: { a: '#1F3D30', b: '#F4EFE6', c: '#C4B19A', d: '#223041' }, grounds: [SAND, GREEN, CREAM],
    pattern: { t: 'stripe', ink: '#1F3D30', ink2: '#C4B19A' }, pieces: ['polo', 'crew', 'capcrest', 'zip', 'tote', 'quarter', 'long', 'short', 'hoodie'] },
  { id: 'pembury', label: 'Pembury Tennis Club', name: 'Pembury', word: ['PEMBURY', 'TENNIS'], face: 'varsity',
    p: { a: '#EDE7DB', b: '#1E3A2E', c: '#7A2E2E', d: '#C4B19A' }, grounds: [GREEN, OAT, CREAM],
    pattern: { t: 'stripe', ink: '#1E3A2E', ink2: '#7A2E2E' }, pieces: ['hoodie', 'polo', 'crew', 'quarter', 'short', 'capcrest', 'tee', 'tote', 'long'] },
  { id: 'kingsbury', label: 'Kingsbury FC', name: 'Kingsbury', word: ['KINGSBURY', 'FC'], face: 'block',
    p: { a: '#1E2A3D', b: '#F2EDE3', c: '#8E2F25', d: '#C4B19A' }, grounds: [MIST, CREAM, SAND],
    pattern: { t: 'checker', ink: '#1E2A3D' }, pieces: ['jersey', 'short', 'hoodie', 'sweat', 'cap', 'tee', 'crew', 'coach', 'tote'] },
  { id: 'ironwood', label: 'Ironwood Strength', name: 'Ironwood', word: ['IRONWOOD', 'STRENGTH'], face: 'block',
    p: { a: '#2B2B28', b: '#E6E1D6', c: '#5C6B5A', d: '#B9A27E' }, grounds: [OAT, SAGE, PAPER],
    pattern: { t: 'stripe', ink: '#2B2B28', ink2: '#B9A27E' }, pieces: ['tee', 'tank', 'hoodie', 'short', 'sweat', 'cap', 'crew', 'zip', 'long'] },
  { id: 'saltmarsh', label: 'Saltmarsh Cycling', name: 'Saltmarsh', word: ['SALTMARSH', 'CYCLING'], face: 'block',
    p: { a: '#3E5C6B', b: '#F2EDE3', c: '#223041', d: '#C98B4A' }, grounds: [CREAM, MIST, SAND],
    pattern: { t: 'stripe', ink: '#3E5C6B', ink2: '#C98B4A' }, pieces: ['jersey', 'cap', 'tee', 'coach', 'crew', 'short', 'tote', 'quarter', 'hoodie'] },
  { id: 'ober', label: 'Mount Ober Ski Club', name: 'Ober', word: ['OBER', 'SKI CLUB'], face: 'chenille',
    p: { a: '#7A2630', b: '#F2EDE3', c: '#1E2A3D', d: '#C4B19A' }, grounds: [DUSTY, CREAM, OAT],
    pattern: { t: 'scatter', motif: 'sparkle', ink: '#7A2630' }, pieces: ['quarter', 'hoodie', 'crew', 'capcrest', 'sweat', 'coach', 'tee', 'tote', 'long'] },
];

const rgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
const far = (a: string, b: string) => rgb(a).reduce((sum, v, i) => sum + (v - rgb(b)[i]) ** 2, 0);
/** The ground a piece stands out from most. */
const groundFor = (color: string, grounds: string[], seed: number) => {
  const ranked = [...grounds].sort((x, y) => far(y, color) - far(x, color));
  return ranked[seed % Math.min(2, ranked.length)];
};

function fromTheme(t: Theme, index: number): Inspo[] {
  const made = t.pieces.map((key) => ({ key, recipe: RECIPES[key], g: RECIPES[key].g(t) }));
  const tiles: Inspo[] = made.map(({ key, recipe, g }, i) => ({
    id: `${t.id}-${key}`, theme: t.label, piece: recipe.piece, group: recipe.group,
    art: { t: 'garment', g }, ground: groundFor(g.color, t.grounds, i), ratio: i % 3 === 1 ? 7 / 6 : 1,
  }));
  const [one, two, three] = made;
  const plate: Inspo = {
    id: `${t.id}-set`, theme: t.label, piece: 'Set', group: null, ground: t.grounds[0], ratio: 3 / 4,
    art: {
      t: 'plate', ground: t.grounds[0],
      items: [
        { g: two.g, x: 590, y: 340, s: 1.25, r: 6 },
        { g: one.g, x: 280, y: 320, s: 1.4, r: -4 },
        { g: three.g, x: 660, y: 140, s: 0.75, r: 4 },
      ],
    },
  };
  // Staggered, so the big tiles don't all land in one row.
  tiles.splice((index * 3 + 1) % tiles.length, 0, plate);
  const [, , , four, five] = made;
  tiles.splice((index * 5 + 4) % tiles.length, 0, {
    id: `${t.id}-pair`, theme: t.label, piece: 'Set', group: null, ground: t.grounds[1], ratio: 4 / 3,
    art: {
      t: 'plate', ground: t.grounds[1], tall: true,
      items: [
        { g: four.g, x: 300, y: 260, s: 1.25, r: -3 },
        { g: five.g, x: 310, y: 590, s: 1.1, r: 3 },
      ],
    },
  });
  return tiles;
}

const lists = THEMES.map(fromTheme);
const dealt = Array.from({ length: Math.max(...lists.map((l) => l.length)) }).flatMap((_, i) => lists.flatMap((l) => (l[i] ? [l[i]] : [])));

/** Real mockups first, then the placeholders dealt out one theme at a time, so the wall reads mixed from the first row. */
export const INSPO: Inspo[] = [...UPLOADS, ...dealt];

export const INSPO_THEMES: string[] = [...new Set(INSPO.map((t) => t.theme))];
