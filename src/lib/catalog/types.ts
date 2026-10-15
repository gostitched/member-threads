/**
 * The dashboard's public catalog DTOs, as the embed API serves them.
 *
 * Mirrors `PublicCatalogProduct` in the dashboard (`src/modules/catalog/public.ts`),
 * plus the optional site-only `sticker`.
 * That shape is a frozen public contract (its key list is snapshot-tested there), so
 * copying it is safer than it looks — but if the dashboard appends a field, add it
 * here before reading it.
 */

export interface PublicPriceBreak {
  decorationMethod: string | null;
  minQuantity: number;
  unitPriceCents: number;
  currency: string;
}

export type PublicPricing =
  | { mode: 'starting_at'; startingAtCents: number; currency: string }
  | { mode: 'full_breaks'; breaks: PublicPriceBreak[] };

export interface PublicAsset {
  /** Centre-cropped square WebP, up to 1600px. */
  url: string;
  /** The same image at up to 600px, for cards. */
  thumbUrl: string;
  alt: string | null;
}

/**
 * The rack cut-out and where an editor hung it. Numbers are in the `space` box — for
 * 'hanger-v1', the rack's `viewBox="0 40 400 340"`: x/y are the image's top-centre
 * point, `width` its drawn width (height follows imageWidth/imageHeight), `rotation`
 * degrees about that top-centre point.
 */
export interface PublicHanger {
  /** Trimmed transparent WebP, longest side up to 1600 px. */
  url: string;
  /** The same at up to 600 px, for the rack. */
  thumbUrl: string;
  alt: string | null;
  space: string;
  mount: 'top' | 'bottom' | 'head';
  x: number;
  y: number;
  width: number;
  rotation: number;
  /**
   * This product's hanger as a share of the standard one, scaled about the top of the
   * hook. Optional: placements from before hanger sizes are full-size.
   */
  hangerScale?: number;
  imageWidth: number;
  imageHeight: number;
}

export interface Colorway {
  name: string;
  hex: string | null;
  pantone: string | null;
  moq: number | null;
}

export interface CatalogProduct {
  slug: string;
  name: string;
  styleNumber: string | null;
  category: string | null;
  description: string | null;
  fabric: string | null;
  fit: string | null;
  gsm: number | null;
  careInstructions: string | null;
  countryOfOrigin: string | null;
  sustainabilityNotes: string | null;
  decorationMethods: string[];
  sizeMode: 'sized' | 'one_size';
  sizes: Array<{ code: string; upchargeCents?: number }>;
  /** size → measurement → value (`{ M: { Chest: 27 } }`), both already in display order. */
  sizeChart: Record<string, Record<string, number>>;
  sizeChartUnit: 'in' | 'cm';
  colorways: Colorway[];
  minimumOrderQuantity: number | null;
  moqPerColorway: number | null;
  leadTimeDays: { min: number; max: number } | null;
  sampleLeadTimeDays: number | null;
  tags: string[];
  isFeatured: boolean;
  images: Array<PublicAsset & { isPrimary: boolean }>;
  sizeGuideUrl: string | null;
  marketingImages: PublicAsset[];
  /** Optional: dashboards before the hanger tool do not send it. */
  hanger?: PublicHanger | null;
  updatedAt: string;
  /** Absent when the site shows no prices. */
  pricing?: PublicPricing;
  /**
   * Site-only, never sent by the dashboard: a short note drawn as a small label on
   * the piece. Member Threads' own catalog does not use it.
   */
  sticker?: string;
}

export interface CatalogBrand {
  slug: string;
  displayName: string;
}

/**
 * Where the products on screen came from.
 *   live         the dashboard answered, with products
 *   empty        the dashboard answered with nothing published to this site
 *   unavailable  the dashboard could not be reached, or refused the key
 */
export type CatalogSource = 'live' | 'empty' | 'unavailable';

export interface Catalog {
  source: CatalogSource;
  brand: CatalogBrand | null;
  products: CatalogProduct[];
}
