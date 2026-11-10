/**
 * The drawings: the types every drawn piece on the site is built from.
 *
 * Get Inspired (`@/lib/inspo`) and the chapter's three example pieces
 * (`@/lib/chapter`) describe garments with these types; `@/components/work/art`
 * draws them as SVG, in the organization's colors. None of it is a real
 * organization's work: every drawing is a concept.
 */

// ── the drawings ─────────────────────────────────────────────────────────────

export type DrawnKind =
  | 'tee' | 'longsleeve' | 'hoodie' | 'ziphoodie' | 'crewneck' | 'quarterzip' | 'polo'
  | 'jacket' | 'robe' | 'cap' | 'shorts' | 'pants' | 'pajama' | 'tote'
  | 'babytee' | 'tank' | 'jersey' | 'box';

/** Decoration on a drawn piece. */
export type Deco =
  | {
      t: 'type';
      lines: string[];
      /** block: heavy sans. varsity: heavy collegiate caps with an outline. script: the brand script. chenille: felt-backed pile. */
      face: 'block' | 'varsity' | 'script' | 'chenille';
      tech: 'embroidery' | 'print' | 'puff' | 'twill';
      ink: string;
      /** Second colour: the outline on varsity, the felt on chenille and twill, the last line on a block print. */
      ink2?: string;
      /** Set the first line on an arch. */
      arch?: boolean;
    }
  /** A woven patch: a framed rectangle with a stitched edge. */
  | { t: 'patch'; lines: string[]; ground: string; ink: string }
  /** A club crest: a shield with a monogram and, at size, a word over it. */
  | { t: 'crest'; letter: string; ground: string; ink: string; words?: string }
  /** Full-colour art, as direct-to-garment prints it. `photo` draws a photographic scene. */
  | { t: 'art'; colors: string[]; photo?: boolean };

/** An all-over pattern in the cloth: a check, a rugby stripe, a checker, a repeat motif. */
export type Pattern = {
  t: 'check' | 'stripe' | 'checker' | 'scatter';
  ink: string;
  ink2?: string;
  motif?: 'letter' | 'bow' | 'sparkle';
  letter?: string;
};

export type Drawn = {
  kind: DrawnKind;
  color: string;
  deco?: Deco;
  /** Where the decoration sits: full front, or left chest (left thigh on a pant). */
  place?: 'chest' | 'left';
  /** Reflective tape across the body, for a run club's night kit. */
  tape?: boolean;
  /** Contrast rib: cuffs, hem, collar, waistband, a cap's visor, a tote's base and handles, a box's ribbon. */
  trim?: string;
  /** The inside of the hood. */
  lining?: string;
  /** The rope across a cap's brim. */
  rope?: string;
  pattern?: Pattern;
  /** Stripes: across the chest on a top, down the side seam on a bottom. */
  stripes?: { ink: string; ink2?: string };
};

/** A hang-tag or woven label laid on a flat lay. */
export type Sticker = {
  lines: string[];
  x: number;
  y: number;
  r: number;
  shape?: 'tag' | 'round';
  color?: string;
  ink?: string;
};

export type Art =
  | { t: 'garment'; g: Drawn }
  /** A flat lay on a coloured ground: the stand-in for a lifestyle photograph. */
  | {
      t: 'plate';
      ground: string;
      /** Wide stripes across the ground, in this colour. */
      stripe?: string;
      tall?: boolean;
      items: { g: Drawn; x: number; y: number; s: number; r: number }[];
      stickers?: Sticker[];
    }
  /** A macro of the decoration on its cloth. */
  | { t: 'macro'; cloth: string; deco: Deco; satin?: boolean }
  | { t: 'swatch'; color: string; name: string }
  | { t: 'spool'; color: string }
  | { t: 'patch'; deco: Extract<Deco, { t: 'patch' }> }
  /** A gift box, from above: the lid, the ribbon, the card. */
  | { t: 'box'; lines: string[]; color?: string; ribbon?: string }
  /** A hang-tag on its string. */
  | { t: 'tag'; lines: string[]; color?: string; ink?: string }
  /** A woven neck label. */
  | { t: 'label'; lines: string[]; ground: string; ink: string };
