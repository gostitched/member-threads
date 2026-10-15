import { surface } from './mockneck';

/**
 * A shaded still of the garment for before the 3D scene arrives (or when WebGL
 * isn't available). Lit from the same shape the mesh is built from and framed the
 * way the camera frames it, so when the live garment fades in nothing jumps.
 */
export function drawStill(cv: HTMLCanvasElement, cam: { fov: number; distance: number; lookY: number }) {
  const rect = cv.getBoundingClientRect();
  if (!rect.width || !rect.height) return;
  const scale = Math.min(1, 520 / rect.width); // compute small, let the browser smooth it up
  const w = Math.round(rect.width * scale);
  const h = Math.round(rect.height * scale);
  cv.width = w;
  cv.height = h;
  const c = cv.getContext('2d')!;
  const img = c.createImageData(w, h);

  // Match the scene's framing.
  const aspect = rect.width / rect.height;
  const vfov = (cam.fov * Math.PI) / 180;
  const hfov = 2 * Math.atan(Math.tan(vfov / 2) * aspect);
  const dist = Math.max(cam.distance, 3.75 / 2 / Math.tan(hfov / 2));
  const viewH = 2 * dist * Math.tan(vfov / 2);
  const ppu = h / viewH;
  const L = [-0.42, 0.5, 0.76];

  const e = 0.6 / ppu;
  for (let j = 0; j < h; j++) {
    const y = cam.lookY + (h / 2 - j) / ppu;
    for (let i = 0; i < w; i++) {
      const x = (i - w / 2) / ppu;
      const s = surface(x, y, 1);
      if (s.sample.d >= 0) continue;
      const nx = -(surface(x + e, y, 1).z - s.z) / e;
      const ny = -(surface(x, y + e, 1).z - s.z) / e;
      const nl = Math.hypot(nx, ny, 1);
      const lambert = Math.max(0, (nx * L[0] + ny * L[1] + L[2]) / nl);
      const v = (0.34 + 0.52 * lambert) * s.ao;
      const grain = (Math.random() - 0.5) * 0.05;
      const k = (i + j * w) * 4;
      img.data[k] = Math.min(255, (v + grain) * 190);
      img.data[k + 1] = Math.min(255, (v + grain) * 189);
      img.data[k + 2] = Math.min(255, (v + grain) * 185);
      img.data[k + 3] = 255;
    }
  }
  c.putImageData(img, 0, 0);
}
