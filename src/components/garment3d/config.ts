import type { CustomizationId } from '@/lib/upcharge';

/**
 * Everything about the 3D garment that isn't code: which asset to load, where each
 * decoration sits, and where each annotation's leader line attaches.
 *
 * ── Swapping in the production garment ─────────────────────────────────────────
 * Until `MODEL_URL` points at a real file, the board uses a stand-in mockneck that is
 * generated in code (./mockneck.ts). To replace it:
 *
 *   1. Put the file at `public/models/mockneck_blank.glb`.
 *   2. Set `MODEL_URL` below to '/models/mockneck_blank.glb'.
 *   3. If the asset's scale or anchor points differ, adjust `MODEL_FIT` and `ANCHORS`.
 *
 * The asset must follow the atlas contract below; nothing else changes.
 *
 * ── The atlas contract ─────────────────────────────────────────────────────────
 * All printable cloth (body front, body back, both sleeves) shares ONE UV atlas:
 *   • u 0.0–0.5: the FRONT, laid flat as it would be photographed, wearer's left on
 *     the right of the image, sleeves included.
 *   • u 0.5–1.0: the BACK, laid flat as seen from behind.
 *   • v 0 at the hem, v 1 at the top of the collar line.
 * Decorations are drawn into that atlas in garment units (see `ATLAS`), so a
 * placement written once works on the stand-in and on the real asset.
 *
 * Mesh names the loader looks for (case-insensitive, `includes` match):
 *   body / sleeve  → heather fleece, gets the decoration atlas
 *   collar / neck  → rib knit
 *   cuff           → rib knit
 *   waist / hem / band → rib knit
 * Anything else keeps the material it shipped with.
 */

/** null = use the generated stand-in. */
export const MODEL_URL: string | null = null;

/** Scale/offset applied to a loaded asset so it lands where the stand-in does. */
export const MODEL_FIT = { scale: 1, offset: [0, 0, 0] as [number, number, number] };

/** Show a small chrome hanger hook above the collar, like a sample on a rack. */
export const SHOW_HANGER = true;

/**
 * The flat garment's extent in garment units (x across, y up). The atlas maps this
 * box: front into u 0–0.5, back (mirrored) into u 0.5–1.
 */
export const ATLAS = { minX: -1.9, maxX: 1.9, minY: -0.88, maxY: 0.86 };

/** Garment units: the body is ~1.52 wide, so 1 in ≈ 0.063. */
export const INCH = 0.063;

/**
 * Where each option lands, in garment units on the front or back face. `z` is
 * worked out from the surface, so only x/y are needed. The receipt copy for each
 * one lives in @/lib/upcharge; this is only geometry.
 */
export const ANCHORS: Record<CustomizationId, { side: 'front' | 'back'; x: number; y: number; lift?: number }> = {
  embroidery: { side: 'front', x: 0.34, y: 0.3 }, // wearer's left chest
  patch: { side: 'front', x: -0.36, y: 0.16 },
  art: { side: 'front', x: 0, y: -0.02 },
  sleeve: { side: 'front', x: -1.02, y: -0.02 }, // wearer's right sleeve, upper forearm
  location: { side: 'back', x: 0, y: -0.49 }, // lower back, just above the rib
  back: { side: 'back', x: 0, y: 0.08 },
  design: { side: 'front', x: 0, y: 0.72, lift: 0.14 }, // top of the collar
};

/** Camera framing: a long lens, like apparel photography. */
export const CAMERA = { fov: 20, distance: 8, lookY: -0.02 }; // distance is a minimum: the scene backs off until the garment fits the width

/** How far a visitor can turn it: all the way round horizontally, barely vertically. */
export const ROTATION = { minYaw: -Math.PI, maxYaw: Math.PI, minPitch: -0.1, maxPitch: 0.16 };
