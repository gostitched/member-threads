/**
 * What hangs on the rack, as markup.
 *
 * The rack builds and throws away hundreds of garments as it runs, so they are plain
 * DOM, not React. Drawings are the same flat technical drawings as GarmentArt.tsx,
 * compiled once into <defs> and placed with <use>; paint comes in through CSS
 * variables, so each garment costs one small node. Photographed products hang their
 * packshot instead, and a product with a hanger cut-out hangs THAT, exactly where an
 * editor placed it in the dashboard (`product.hanger`).
 *
 * Everything from the dashboard goes through `esc` before it reaches markup.
 */

import { SHAPES, type Part } from '../GarmentArt';
import { galleryOf } from '../ProductMedia';
import type { CatalogProduct, PublicHanger } from '@/lib/catalog/types';
import { entryPrice, formatMoney, garmentKind, paintOf, parseHex, type GarmentKind } from '@/lib/catalog/util';

export const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

export const pad3 = (n: number) => String(n).padStart(3, '0');

/** How a thing hangs: tops on a wire hanger, bottoms on a clip bar, the rest from a peg clip. */
export type Mount = 'top' | 'bottom' | 'head';
const MOUNT: Partial<Record<GarmentKind, Mount>> = { pants: 'bottom', shorts: 'bottom', cap: 'head', fivepanel: 'head', beanie: 'head', tote: 'head', generic: 'head' };
export const mountOf = (kind: GarmentKind): Mount => MOUNT[kind] ?? 'top';

/** Where each drawing sits so its hanging point meets the hanger (necks at y≈88, waists at 70, crowns at 98). */
const TF: Partial<Record<GarmentKind, string>> = {
  shorts: 'translate(0 -40)',
  cap: 'translate(-6 -22)',
  fivepanel: 'translate(-6 -24)',
  beanie: 'translate(0 -44)',
  // Hung by one handle, the way a bag hangs off a peg.
  tote: 'translate(29 0)',
  // The packaging box, clipped at its lid.
  generic: 'translate(0 -10)',
};

/**
 * Where a packshot sits in the same box, as percentages of it. The box is the
 * drawing's 400×340 viewport; packshots are square, so 80% wide is 94% tall.
 */
const PHOTO: Record<Mount, { top: number }> = { top: { top: 0 }, head: { top: 1.2 }, bottom: { top: 0 } };

/**
 * The cut-out, if this product has one we know how to place. Its numbers are in the
 * dashboard's "hanger-v1" box, which IS this file's `VB` (400 × 340 from y 40); a
 * placement in any other space is ignored rather than guessed at.
 */
export function cutoutOf(p: CatalogProduct): PublicHanger | null {
  const h = p.hanger;
  if (!h || h.space !== 'hanger-v1') return null;
  if (h.mount !== 'top' && h.mount !== 'bottom' && h.mount !== 'head') return null;
  if (!(h.imageWidth > 0 && h.imageHeight > 0 && h.width > 0)) return null;
  return h;
}

const BOX = { x: 0, y: 40, w: 400, h: 340 };
const pct = (n: number) => `${+n.toFixed(4)}%`;

/**
 * Box units → percentages of the slot. The slot is the box at `--gw` × `--gh`
 * (gh = gw × 0.85 = 340/400), so this is the whole conversion: no scaling, no pixels.
 * Rotation pivots on the top-centre, where the garment hangs from. Anything below the
 * box's bottom edge is cropped, or it would sit on the product name printed under it.
 */
function cutoutStyle(h: PublicHanger): string {
  const drawnH = (h.width * h.imageHeight) / h.imageWidth;
  const overflow = h.y + drawnH - (BOX.y + BOX.h);
  return [
    `left:${pct(((h.x - h.width / 2 - BOX.x) / BOX.w) * 100)}`,
    `top:${pct(((h.y - BOX.y) / BOX.h) * 100)}`,
    `width:${pct((h.width / BOX.w) * 100)}`,
    `aspect-ratio:${h.imageWidth}/${h.imageHeight}`,
    h.rotation ? `transform:rotate(${+h.rotation.toFixed(2)}deg)` : '',
    overflow > 0 ? `clip-path:inset(0 0 ${pct((overflow / drawnH) * 100)} 0)` : '',
  ]
    .filter(Boolean)
    .join(';');
}

function partSVG(p: Part): string {
  switch (p.t) {
    case 'body':
      return `<path d="${p.d}" style="fill:currentColor;stroke:var(--ol)" stroke-width="1.5" stroke-linejoin="round"/>`;
    case 'accent':
      return `<path d="${p.d}" style="fill:var(--ac)" stroke="rgba(0,0,0,.42)" stroke-width="1.5" stroke-linejoin="round"/>`;
    case 'shade':
      return `<path d="${p.d}" style="fill:currentColor;stroke:var(--ol)" stroke-width="1.2" stroke-linejoin="round"/><path d="${p.d}" style="fill:var(--sh2)"/>`;
    case 'line': {
      const w = p.w ?? 2;
      // A thick line in the cloth colour is a rib or a strap: painted, then outlined.
      return w >= 6
        ? `<path d="${p.d}" fill="none" style="stroke:var(--ol)" stroke-width="${w + 2.5}" stroke-linecap="round"/><path d="${p.d}" fill="none" style="stroke:currentColor" stroke-width="${w}" stroke-linecap="round"/><path d="${p.d}" fill="none" style="stroke:var(--sh)" stroke-width="${w}" stroke-linecap="round"/>`
        : `<path d="${p.d}" fill="none" style="stroke:var(--hl)" stroke-width="${w}" stroke-linecap="round"/>`;
    }
    case 'stitch':
      return `<path d="${p.d}" fill="none" style="stroke:var(--st)" stroke-width="1.6" stroke-dasharray="5 5" stroke-linecap="round"/>`;
    case 'dot':
      return `<circle cx="${p.cx}" cy="${p.cy}" r="${p.r}" style="fill:var(--hl)"/>`;
  }
}

/** Everything the rack references by id: drawings, hangers, motion-blur filters. */
export function buildDefs(): string {
  let s = `<linearGradient id="rk-light" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".22"/><stop offset=".55" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".2"/></linearGradient>
  <filter id="rk-mb1" x="-45%" y="-4%" width="190%" height="108%" color-interpolation-filters="sRGB"><feGaussianBlur stdDeviation="24 0"/></filter>
  <filter id="rk-mb2" x="-25%" y="-2%" width="150%" height="104%" color-interpolation-filters="sRGB"><feGaussianBlur stdDeviation="9 0"/></filter>`;
  for (const k of Object.keys(SHAPES) as GarmentKind[]) {
    const parts = SHAPES[k];
    const tf = TF[k] ? ` transform="${TF[k]}"` : '';
    const clip = parts
      .filter((p): p is Extract<Part, { t: 'body' | 'accent' }> => p.t === 'body' || p.t === 'accent')
      .map((p) => `<path d="${p.d}"/>`)
      .join('');
    s += `<clipPath id="rk-c-${k}">${clip}</clipPath><g id="rk-g-${k}"${tf}>${parts.map(partSVG).join('')}<rect x="0" y="0" width="400" height="400" fill="url(#rk-light)" clip-path="url(#rk-c-${k})"/></g>`;
  }
  // Hanger metal follows the rack's tokens (rack.css): light wire on the night.
  const M = 'var(--rk-metal)';
  const HI = 'var(--rk-metal-hi)';
  s += `<g id="rk-hb-top"><path d="M200 40V68M200 68L106 110Q98 116 108 118H292Q302 116 294 110L200 68" fill="none" style="stroke:${M}" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round"/><path d="M200 70L110 111" fill="none" style="stroke:${HI}" stroke-width=".8" stroke-linecap="round"/></g>
  <g id="rk-hb-bottom"><path d="M200 40V57" style="stroke:${M}" stroke-width="2.6" stroke-linecap="round"/><path d="M118 59H282" style="stroke:${M}" stroke-width="5" stroke-linecap="round"/><path d="M120 57.6H280" style="stroke:${HI}" stroke-width=".8" stroke-linecap="round"/></g>
  <g id="rk-hf-bottom"><rect x="133" y="52" width="16" height="30" rx="2.5" style="fill:${M}"/><rect x="251" y="52" width="16" height="30" rx="2.5" style="fill:${M}"/><path d="M136 55V78M254 55V78" style="stroke:${HI}" stroke-width=".9"/></g>
  <g id="rk-hb-head"><path d="M200 40V86" style="stroke:${M}" stroke-width="2.6" stroke-linecap="round"/></g>
  <g id="rk-hf-head"><rect x="192" y="82" width="16" height="22" rx="3" style="fill:${M}"/><path d="M195 85V101" style="stroke:${HI}" stroke-width=".9"/></g>`;
  return s;
}

function lum(hex: string): number {
  const rgb = parseHex(hex) ?? [201, 201, 201];
  const [r, g, b] = rgb.map((x) => {
    const c = x / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function paintVars(hex: string): string {
  const dark = lum(hex) < 0.18;
  return `color:${hex};--ac:#232323;--ol:${dark ? 'rgba(255,255,255,.34)' : 'rgba(23,23,23,.3)'};--st:${dark ? 'rgba(255,255,255,.5)' : 'rgba(23,23,23,.34)'};--hl:${dark ? 'rgba(255,255,255,.28)' : 'rgba(23,23,23,.22)'};--sh:${dark ? 'rgba(255,255,255,.08)' : 'rgba(0,0,0,.08)'};--sh2:${dark ? 'rgba(255,255,255,.07)' : 'rgba(0,0,0,.1)'}`;
}

export const VB = 'viewBox="0 40 400 340"';

export const HOOK = `<svg class="rk-hook" viewBox="0 0 30 34" aria-hidden="true"><path d="M15 34V19.5C15 15.6 23 14.2 23 8A8 8 0 0 0 7 8C7 10.4 8 12 9.6 13" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round"/><path d="M15.7 32V20C15.7 17 21.6 15.4 22.2 9.5M21.4 4.6A7.2 7.2 0 0 0 12 1.4" fill="none" style="stroke:var(--rk-metal-hi)" stroke-width=".7" stroke-linecap="round"/></svg>`;

/** The garment itself: its packshot, or its drawing in its first colourway. */
function clothMarkup(p: CatalogProduct, mount: Mount, labelled: boolean, eager: boolean): string {
  const cut = cutoutOf(p);
  if (cut) {
    // The rack shows the 600px twin; the lift-off swaps in the full image (`data-full`).
    return `<img class="rk-gm rk-cloth rk-cutout" src="${esc(cut.thumbUrl)}" data-full="${esc(cut.url)}" alt="${
      labelled ? esc(cut.alt ?? p.name) : ''
    }" ${eager ? '' : 'loading="lazy" '}decoding="async" draggable="false" style="${cutoutStyle(cut)}">`;
  }
  const photo = galleryOf(p)[0];
  const colorway = p.colorways[0];
  const label = esc(`${p.name}${colorway && !photo ? ` in ${colorway.name}` : ''}`);
  if (photo) {
    return `<img class="rk-gm rk-cloth rk-photo" src="${esc(photo.thumbUrl)}" alt="${labelled ? esc(photo.alt ?? p.name) : ''}" ${
      eager ? '' : 'loading="lazy" '
    }decoding="async" draggable="false" style="top:${PHOTO[mount].top}%">`;
  }
  return `<svg class="rk-gm" ${VB} style="${paintVars(paintOf(colorway))}" ${
    labelled ? `role="img" aria-label="${label}"` : 'aria-hidden="true"'
  }><g class="rk-cloth"><use href="#rk-g-${garmentKind(p)}"/></g></svg>`;
}

export interface Hung {
  html: string;
  mount: Mount;
  /** Hangs a square packshot (no shadow: it would draw the square). */
  photo: boolean;
  /** Hangs a transparent cut-out (keeps its shadow). */
  cutout: boolean;
}

/**
 * One hanging product: hook, hanger, garment, and (unless it is a blur in the stream)
 * its hangtag and the facts printed under it. Only facts the dashboard has are shown.
 */
export function itemMarkup(p: CatalogProduct, stream: boolean): Hung {
  const cut = cutoutOf(p);
  const cutout = cut !== null;
  // The editor's choice of hanger wins over guessing from the name.
  const mount = cut?.mount ?? mountOf(garmentKind(p));
  const photo = !cutout && galleryOf(p).length > 0;
  // A cut-out can carry a smaller hanger (one that hides inside a hood-up hoodie's
  // shoulders). The slot is the VB box, so 50% 0 is the top of the hook: (200, 40).
  const k = cut?.hangerScale;
  const sized = k && k > 0 && k < 1 ? ` style="transform:scale(${+k.toFixed(3)});transform-origin:50% 0"` : '';
  const hb = `<svg class="rk-hb" ${VB} aria-hidden="true"${sized}><use href="#rk-hb-${mount}"/></svg>`;
  const hf = mount === 'top' ? '' : `<svg class="rk-hf" ${VB} aria-hidden="true"${sized}><use href="#rk-hf-${mount}"/></svg>`;
  const lift = `<div class="rk-lift">${clothMarkup(p, mount, !stream, stream)}</div>`;
  // A packshot or a cut-out is opaque, so a peg's stem goes in front of it, not behind.
  let html = HOOK + `<div class="rk-swing">${(photo || cutout) && mount === 'head' ? lift + hb : hb + lift}${hf}`;
  if (stream) return { html: html + '</div>', mount, photo, cutout };

  const price = entryPrice(p);
  const from = price ? formatMoney(price.cents, price.currency) : null;
  const cycles = !photo && p.colorways.length > 1;
  // The hangtag only names the colorway as it cycles; the rest is on the product page.
  const tagLines = [cycles && `<em class="rk-cwn">${esc(p.colorways[0].name)}</em>`].filter(Boolean);
  if (tagLines.length) {
    html += `<div class="rk-tag" aria-hidden="true"><i class="rk-str"></i><div class="rk-card">${tagLines
      .map((l) => `<span>${l}</span>`)
      .join('')}</div></div>`;
  }
  html += '</div>';
  html += `<div class="rk-info"><div class="rk-nm">${esc(p.name)}</div><div class="rk-pr">${
    from ? `From ${from}` : 'Priced with your collection'
  }</div><div class="rk-vw" aria-hidden="true">${cycles ? `${p.colorways.length} colors · tap to lock` : 'View →'}</div></div>`;
  return { html, mount, photo, cutout };
}

export function dividerMarkup(name: string, count: number): string {
  return `<div class="rk-swing"><svg class="rk-rings" viewBox="0 0 128 46" preserveAspectRatio="none" aria-hidden="true">
    <circle cx="14" cy="3" r="6.6" fill="none" stroke="currentColor" stroke-width="1.9"/><circle cx="114" cy="3" r="6.6" fill="none" stroke="currentColor" stroke-width="1.9"/>
    <path d="M14 9.6V46M114 9.6V46" stroke="currentColor" stroke-width="1"/></svg>
    <div class="rk-dplate"><span class="rk-dn">${esc(name)}</span><span class="sr-only">, ${count} ${count === 1 ? 'piece' : 'pieces'}</span></div></div>`;
}

/** A hang tag on a string, for whatever isn't on the rack. */
export function ctaMarkup(): string {
  return `<div class="rk-swing"><svg class="rk-wire" viewBox="0 0 20 46" aria-hidden="true">
    <circle cx="10" cy="3" r="6.6" fill="none" stroke="currentColor" stroke-width="1.9"/><path d="M10 9.6V46" stroke="currentColor" stroke-width="2"/></svg>
    <div class="rk-cta"><div class="rk-cta-body">
    <h3>Need another style?</h3>
    <p>Your designer will source it.</p>
    <a class="btn-blue" href="/quote" data-nav>Start a collection</a></div></div></div>`;
}

export const EMPTY_HANGER = HOOK + `<div class="rk-swing"><svg class="rk-hb" ${VB}><use href="#rk-hb-top"/></svg></div>`;
