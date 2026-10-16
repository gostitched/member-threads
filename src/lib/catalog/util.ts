/**
 * Pure helpers over catalog products: colour, silhouettes, prices, facets.
 * No I/O, safe on server and client.
 */

import type { CatalogProduct, Colorway, PublicPriceBreak, PublicPricing } from './types';

// ── colour ───────────────────────────────────────────────────────────────────

export interface Hsl {
  h: number;
  s: number;
  l: number;
}

export function parseHex(hex: string | null | undefined): [number, number, number] | null {
  if (!hex) return null;
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return null;
  const v = m[1].length === 3 ? m[1].split('').map((x) => x + x).join('') : m[1];
  return [parseInt(v.slice(0, 2), 16), parseInt(v.slice(2, 4), 16), parseInt(v.slice(4, 6), 16)];
}

export function hexToHsl(hex: string | null | undefined): Hsl | null {
  const rgb = parseHex(hex);
  if (!rgb) return null;
  const [r, g, b] = rgb.map((x) => x / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  const h =
    max === r ? ((g - b) / d + (g < b ? 6 : 0)) * 60 : max === g ? ((b - r) / d + 2) * 60 : ((r - g) / d + 4) * 60;
  return { h, s, l };
}

/** Near-black or white text, whichever reads on this swatch. */
export function inkOn(hex: string | null | undefined): '#133327' | '#FFFFFF' {
  const rgb = parseHex(hex);
  if (!rgb) return '#133327';
  const [r, g, b] = rgb.map((x) => {
    const c = x / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.4 ? '#133327' : '#FFFFFF';
}

export const COLOR_FAMILIES = [
  { id: 'neutral', label: 'Neutrals', swatch: '#D8CEBD' },
  { id: 'red', label: 'Reds', swatch: '#5A2230' },
  { id: 'orange', label: 'Rusts', swatch: '#9A5434' },
  { id: 'yellow', label: 'Khakis', swatch: '#B3A07C' },
  { id: 'green', label: 'Greens', swatch: '#1F3D30' },
  { id: 'blue', label: 'Blues', swatch: '#1E2A3D' },
  { id: 'purple', label: 'Purples', swatch: '#4A3A5C' },
  { id: 'pink', label: 'Pinks', swatch: '#C99AA0' },
] as const;

export type ColorFamily = (typeof COLOR_FAMILIES)[number]['id'];

/**
 * Buckets a colour the way a buyer would name it. Low saturation — greys, blacks,
 * creams, heathers — is "neutral" whatever its nominal hue, because a "warm grey" is
 * not a red.
 */
export function colorFamily(hex: string | null | undefined): ColorFamily | null {
  const hsl = hexToHsl(hex);
  if (!hsl) return null;
  const { h, s, l } = hsl;
  if (s < 0.18 || l < 0.1 || l > 0.93) return 'neutral';
  // Pale warm tints (cream, oat, bone, stone) read as neutrals too.
  if (l > 0.68 && s < 0.5 && h >= 20 && h <= 60) return 'neutral';
  // Muted warm mid-tones (khaki, sand, tan) are khakis, not rusts.
  if (s < 0.4 && l > 0.4 && h >= 25 && h < 68) return 'yellow';
  if (h < 12 || h >= 345) return l > 0.72 ? 'pink' : 'red';
  if (h < 40) return l < 0.3 ? 'red' : 'orange';
  if (h < 68) return 'yellow';
  if (h < 170) return 'green';
  if (h < 250) return 'blue';
  if (h < 300) return 'purple';
  return 'pink';
}

export function productFamilies(product: CatalogProduct): Set<ColorFamily> {
  const out = new Set<ColorFamily>();
  for (const c of product.colorways) {
    const f = colorFamily(c.hex);
    if (f) out.add(f);
  }
  return out;
}

export interface SpectrumSwatch {
  hex: string;
  name: string;
  family: ColorFamily;
  productSlug: string;
  productName: string;
}

/**
 * Every colourway across the catalog, one band: chromatic colours by hue, then neutrals
 * from light to dark. Exact duplicates (the same hex on two products) collapse.
 */
export function spectrum(products: CatalogProduct[]): SpectrumSwatch[] {
  const seen = new Set<string>();
  const out: Array<SpectrumSwatch & { hsl: Hsl }> = [];
  for (const p of products) {
    for (const c of p.colorways) {
      const hsl = hexToHsl(c.hex);
      const family = colorFamily(c.hex);
      if (!hsl || !family || !c.hex) continue;
      const key = c.hex.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({ hex: c.hex, name: c.name, family, productSlug: p.slug, productName: p.name, hsl });
    }
  }
  // Rotated so the band starts at crimson: hues just under 360 are reds, and belong at
  // the start next to the other reds, not stranded at the far end beside the greys.
  // Grouped in the same order as the family chips under the band, so each chip
  // names a run of the strip: neutrals light to dark, then each hue family.
  const order = COLOR_FAMILIES.map((f) => f.id as ColorFamily);
  const hueKey = (h: number) => (h + 20) % 360;
  return out
    .sort(
      (a, b) =>
        order.indexOf(a.family) - order.indexOf(b.family) ||
        (a.family === 'neutral' ? b.hsl.l - a.hsl.l : hueKey(a.hsl.h) - hueKey(b.hsl.h) || a.hsl.l - b.hsl.l)
    )
    .map(({ hsl: _hsl, ...rest }) => rest);
}

/** A colourway's paint: its hex, or a mid grey when the dashboard has none. */
export function paintOf(colorway: Colorway | undefined): string {
  return colorway?.hex && parseHex(colorway.hex) ? colorway.hex : '#C9C9C9';
}

// ── silhouettes ──────────────────────────────────────────────────────────────

export type GarmentKind =
  | 'tee'
  | 'longsleeve'
  | 'hoodie'
  | 'crewneck'
  | 'quarterzip'
  | 'polo'
  | 'rugby'
  | 'jacket'
  | 'vest'
  | 'cap'
  | 'fivepanel'
  | 'beanie'
  | 'tote'
  | 'pants'
  | 'shorts'
  | 'generic';

const KIND_WORDS: Array<[GarmentKind, RegExp]> = [
  // Packaging is drawn as the plain box, never as a bag.
  ['generic', /packag|\bbox(es)?\b/],
  ['hoodie', /hood/],
  ['quarterzip', /quarter[- ]?zip|half[- ]?zip|1\/4[- ]?zip/],
  ['crewneck', /crew|sweatshirt|pullover/],
  ['rugby', /rugby/],
  ['polo', /polo/],
  ['vest', /\bvest|gilet/],
  ['jacket', /jacket|coat|shell|anorak|windbreaker|outerwear|varsity|bomber/],
  ['fivepanel', /five[- ]?panel|5[- ]?panel|camp cap/],
  ['cap', /\bcap\b|hat|snapback|trucker|visor|panel/],
  ['beanie', /beanie|toque|knit hat/],
  ['tote', /tote|\bbags?\b|backpack|pouch/],
  ['shorts', /short/],
  ['pants', /pant|jogger|trouser|legging|bottom/],
  ['longsleeve', /long[- ]?sleeve|\bls\b/],
  // Jerseys and tanks borrow the tee's silhouette.
  ['tee', /\btee|t-shirt|tshirt|shirt|top|jersey|tank/],
];

/** Which drawing stands in for a product that has no photo. Name first, then category. */
export function garmentKind(product: Pick<CatalogProduct, 'name' | 'category' | 'tags'>): GarmentKind {
  const haystacks = [product.name, product.category ?? '', product.tags.join(' ')].map((s) => s.toLowerCase());
  for (const text of haystacks) {
    for (const [kind, re] of KIND_WORDS) if (re.test(text)) return kind;
  }
  return 'generic';
}

// ── prices ───────────────────────────────────────────────────────────────────

export function formatMoney(cents: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

/**
 * One ladder of price breaks, sorted by quantity. Decoration is included in the
 * price, so the site shows one price per piece, never one per decoration method.
 * Breaks the dashboard sets for no particular method win. Otherwise, at each
 * quantity, the highest price across methods, so the site never under-quotes.
 */
export function flatBreaks(pricing: PublicPricing | null | undefined): PublicPriceBreak[] {
  if (!pricing || pricing.mode !== 'full_breaks') return [];
  const general = pricing.breaks.filter((b) => b.decorationMethod === null);
  const source = general.length > 0 ? general : pricing.breaks;
  const byQty = new Map<number, PublicPriceBreak>();
  for (const b of source) {
    const seen = byQty.get(b.minQuantity);
    if (!seen || b.unitPriceCents > seen.unitPriceCents) byQty.set(b.minQuantity, b);
  }
  return [...byQty.values()]
    .map((b) => ({ ...b, decorationMethod: null }))
    .sort((a, b) => a.minQuantity - b.minQuantity);
}

/**
 * The "from" price: what one unit costs at the minimum order, which is where a buyer
 * starts. The deepest volume break would understate it. Read off the one flat ladder.
 * A `starting_at` price is the dashboard's own number, shown as is.
 */
export function entryPrice(product: CatalogProduct): { cents: number; currency: string } | null {
  const p = product.pricing;
  if (!p) return null;
  if (p.mode === 'starting_at') return { cents: p.startingAtCents, currency: p.currency };
  const ladder = flatBreaks(p);
  if (ladder.length === 0) return null;
  const qty = Math.max(product.minimumOrderQuantity ?? 1, ladder[0].minQuantity);
  const tier = [...ladder].reverse().find((t) => qty >= t.minQuantity) ?? ladder[0];
  return { cents: tier.unitPriceCents, currency: tier.currency };
}

// ── facets ───────────────────────────────────────────────────────────────────

export function countBy<T>(items: T[], keysOf: (item: T) => Iterable<string>): Map<string, number> {
  const counts = new Map<string, number>();
  for (const item of items) for (const key of new Set(keysOf(item))) counts.set(key, (counts.get(key) ?? 0) + 1);
  return counts;
}

export function leadTimeLabel(product: CatalogProduct): string | null {
  const lt = product.leadTimeDays;
  if (!lt) return null;
  return lt.min === lt.max ? `${lt.min} days` : `${lt.min}–${lt.max} days`;
}
