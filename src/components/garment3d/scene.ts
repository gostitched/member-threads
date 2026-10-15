import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import type { CustomizationId } from '@/lib/upcharge';
import { ANCHORS, CAMERA, INCH, MODEL_FIT, MODEL_URL, ROTATION, SHOW_HANGER } from './config';
import { buildCloth, buildCollar, buildHanger, buildPatch, surface } from './mockneck';
import { Atlas, patchFace, ribTile } from './textures';

/**
 * The garment's WebGL scene. Framework-free: the React wrapper creates one, feeds it
 * pointer input and the applied decorations, and reads back where each annotation
 * anchor lands on screen.
 *
 * It renders on demand: a frame is drawn only while something is moving (a drag,
 * inertia settling, a nudge, a hover lean), and never while the section is off
 * screen.
 */

export type Projected = Partial<Record<CustomizationId, { x: number; y: number; facing: boolean }>>;

export type SceneOptions = {
  canvas: HTMLCanvasElement;
  lowPower: boolean;
  reducedMotion: boolean;
  onAnchors: (a: Projected) => void;
  onTurned: (yaw: number) => void;
};

const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));

export class GarmentScene {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera: THREE.PerspectiveCamera;
  private pivot = new THREE.Group(); // yaw + pitch
  private lean = new THREE.Group(); // the board's tilt as it fills up
  private atlas: Atlas;
  private atlasTex: THREE.CanvasTexture;
  private heightTex: THREE.CanvasTexture;
  private patch?: THREE.Group;
  private opts: SceneOptions;
  private frame = 0;
  private visible = true;
  private disposed = false;
  private last = 0;

  // Rotation state: current, target, velocity. Yaw has inertia; pitch eases.
  private yaw = 0;
  private yawVel = 0;
  private yawTarget: number | null = null;
  private pitch = 0;
  private pitchTarget = 0;
  private hoverYaw = 0;
  private hoverPitch = 0;
  private dragging = false;
  private tilt = 0;
  private tiltTarget = 0;
  private applied: readonly CustomizationId[] = [];

  constructor(opts: SceneOptions) {
    this.opts = opts;
    const { canvas, lowPower } = opts;
    this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: !lowPower, powerPreference: 'high-performance' });
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, lowPower ? 1.5 : 1.75));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.NeutralToneMapping;
    this.renderer.toneMappingExposure = 1.0;

    this.camera = new THREE.PerspectiveCamera(CAMERA.fov, 1, 0.1, 50);
    this.camera.position.set(0, CAMERA.lookY + 0.35, CAMERA.distance);
    this.camera.lookAt(0, CAMERA.lookY, 0);

    // Soft studio: a room environment for the fabric's ambient response, a large
    // key from upper left, a gentle fill, and a rim to separate grey from the board.
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    this.scene.environmentIntensity = 0.42;
    pmrem.dispose();
    const key = new THREE.DirectionalLight(0xfff8ef, 1.85);
    key.position.set(-4, 5, 6);
    const fill = new THREE.DirectionalLight(0xe9eef8, 0.55);
    fill.position.set(5, 1, 4);
    const rim = new THREE.DirectionalLight(0xffffff, 1.6);
    rim.position.set(2, 3, -6);
    this.scene.add(key, fill, rim, new THREE.HemisphereLight(0xffffff, 0x404040, 0.35));

    this.atlas = new Atlas(lowPower ? 2048 : 4096);
    this.atlasTex = new THREE.CanvasTexture(this.atlas.color);
    this.atlasTex.colorSpace = THREE.SRGBColorSpace;
    this.atlasTex.anisotropy = Math.min(8, this.renderer.capabilities.getMaxAnisotropy());
    this.heightTex = new THREE.CanvasTexture(this.atlas.height);
    this.heightTex.anisotropy = this.atlasTex.anisotropy;

    this.pivot.add(this.lean);
    this.scene.add(this.pivot);
  }

  /** Build the stand-in, or load the production asset if one is configured. */
  async load() {
    const fleece = new THREE.MeshPhysicalMaterial({
      map: this.atlasTex,
      bumpMap: this.heightTex,
      bumpScale: 1.6,
      roughness: 0.93,
      sheen: 0.55,
      sheenRoughness: 0.75,
      sheenColor: new THREE.Color(0xffffff),
      vertexColors: true,
      side: THREE.DoubleSide,
    });
    const tile = ribTile(128);
    const ribColor = new THREE.CanvasTexture(tile.color);
    ribColor.colorSpace = THREE.SRGBColorSpace;
    const ribHeight = new THREE.CanvasTexture(tile.height);
    for (const t of [ribColor, ribHeight]) {
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.repeat.set(34, 1.4);
    }
    const rib = new THREE.MeshPhysicalMaterial({ map: ribColor, bumpMap: ribHeight, bumpScale: 2.2, roughness: 0.95, sheen: 0.5, sheenRoughness: 0.8, side: THREE.DoubleSide });
    const ribInside = rib.clone();
    ribInside.color = new THREE.Color(0x8c8b88);

    if (MODEL_URL) {
      await this.loadAsset(MODEL_URL, fleece, rib);
    } else {
      const cloth = new THREE.Mesh(buildCloth(this.opts.lowPower ? 0.7 : 1), fleece);
      cloth.name = 'body';
      const collar = buildCollar();
      for (const m of collar.children as THREE.Mesh[]) m.material = m.name === 'collar-inner' ? ribInside : rib;
      this.lean.add(cloth, collar);
    }

    if (SHOW_HANGER) {
      const chrome = new THREE.MeshStandardMaterial({ color: 0xd9d9d9, metalness: 1, roughness: 0.22 });
      this.lean.add(buildHanger(chrome));
    }

    // The patch is real geometry: built once, shown when applied.
    const faceTex = new THREE.CanvasTexture(patchFace(this.opts.lowPower ? 256 : 512));
    faceTex.colorSpace = THREE.SRGBColorSpace;
    const face = new THREE.MeshStandardMaterial({ map: faceTex, roughness: 0.97 });
    const edge = new THREE.MeshStandardMaterial({ color: 0x1b1b1b, roughness: 0.9 });
    const r = 1.9 * INCH;
    this.patch = buildPatch(r, face, edge);
    const a = ANCHORS.patch;
    const s = surface(a.x, a.y, 1);
    const e = 0.01;
    const nx = -(surface(a.x + e, a.y, 1).z - surface(a.x - e, a.y, 1).z) / (2 * e);
    const ny = -(surface(a.x, a.y + e, 1).z - surface(a.x, a.y - e, 1).z) / (2 * e);
    this.patch.position.set(a.x, a.y, s.z + 0.008);
    this.patch.lookAt(new THREE.Vector3(a.x + nx, a.y + ny, s.z + 1));
    this.patch.rotateZ(-0.16);
    this.patch.visible = false;
    this.lean.add(this.patch);

    this.kick();
  }

  private async loadAsset(url: string, fleece: THREE.Material, rib: THREE.Material) {
    const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');
    const { MeshoptDecoder } = await import('three/examples/jsm/libs/meshopt_decoder.module.js');
    const loader = new GLTFLoader();
    loader.setMeshoptDecoder(MeshoptDecoder);
    const gltf = await loader.loadAsync(url);
    gltf.scene.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh) return;
      const n = mesh.name.toLowerCase();
      if (n.includes('body') || n.includes('sleeve')) mesh.material = fleece;
      else if (['collar', 'neck', 'cuff', 'waist', 'hem', 'band'].some((k) => n.includes(k))) mesh.material = rib;
    });
    gltf.scene.scale.setScalar(MODEL_FIT.scale);
    gltf.scene.position.set(...MODEL_FIT.offset);
    this.lean.add(gltf.scene);
  }

  setSize(w: number, h: number) {
    if (!w || !h) return;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    // Keep the whole garment in frame on tall (phone) stages.
    const need = 3.75; // garment units across, sleeves included
    const hfov = 2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(CAMERA.fov) / 2) * this.camera.aspect);
    const dist = need / 2 / Math.tan(hfov / 2);
    this.camera.position.z = Math.max(CAMERA.distance, dist);
    this.camera.updateProjectionMatrix();
    this.kick();
  }

  setApplied(applied: readonly CustomizationId[]) {
    this.applied = applied;
    this.atlas.compose(applied);
    this.atlasTex.needsUpdate = true;
    this.heightTex.needsUpdate = true;
    if (this.patch) this.patch.visible = applied.includes('patch');
    this.kick();
  }

  setTilt(deg: number) {
    this.tiltTarget = THREE.MathUtils.degToRad(deg);
    this.kick();
  }

  setVisible(v: boolean) {
    this.visible = v;
    if (v) this.kick();
  }

  // ── Input ──
  dragStart() {
    this.dragging = true;
    this.yawTarget = null;
    this.yawVel = 0;
  }
  dragBy(dx: number, dy: number, width: number) {
    const k = (Math.PI * 1.1) / Math.max(width, 1);
    const step = dx * k;
    this.yaw = clamp(this.yaw + step, ROTATION.minYaw, ROTATION.maxYaw);
    this.yawVel = step;
    this.pitchTarget = clamp(this.pitchTarget + dy * k * 0.35, ROTATION.minPitch, ROTATION.maxPitch);
    this.kick();
  }
  dragEnd() {
    this.dragging = false;
    this.kick();
  }
  /** Hover: a couple of degrees of give toward the cursor. -1…1 each way. */
  hover(nx: number, ny: number) {
    if (this.opts.reducedMotion) return;
    this.hoverYaw = nx * 0.045;
    this.hoverPitch = ny * 0.025;
    this.kick();
  }
  /** Turn a little toward something, e.g. the back after a back print. */
  nudge(by: number) {
    this.yawTarget = clamp(this.yaw + by, ROTATION.minYaw, ROTATION.maxYaw);
    this.kick();
  }
  get yawNow() {
    return this.yaw;
  }

  // ── Loop ──
  kick() {
    if (this.disposed || !this.visible || this.frame) return;
    this.last = performance.now();
    this.frame = requestAnimationFrame(this.tick);
  }

  private tick = (now: number) => {
    this.frame = 0;
    const dt = Math.min(0.05, (now - this.last) / 1000);
    this.last = now;
    const instant = this.opts.reducedMotion;
    let moving = this.dragging;

    if (!this.dragging) {
      if (this.yawTarget !== null) {
        const d = this.yawTarget - this.yaw;
        this.yaw += instant ? d : d * (1 - Math.exp(-dt * 5));
        if (Math.abs(d) < 0.0005) this.yawTarget = null;
        else moving = true;
      } else if (Math.abs(this.yawVel) > 0.00005) {
        // Inertia: it keeps turning a little, then stops where you left it.
        this.yaw = clamp(this.yaw + this.yawVel, ROTATION.minYaw, ROTATION.maxYaw);
        this.yawVel *= Math.exp(-dt * 6);
        moving = true;
      }
    }

    const ease = (cur: number, to: number, rate: number) => {
      const d = to - cur;
      if (Math.abs(d) > 0.0003) moving = true;
      return instant ? to : cur + d * (1 - Math.exp(-dt * rate));
    };
    this.pitch = ease(this.pitch, this.pitchTarget, 6);
    this.tilt = ease(this.tilt, this.tiltTarget, 4);
    const hy = ease(this.pivot.userData.hy ?? 0, this.hoverYaw, 3);
    const hp = ease(this.pivot.userData.hp ?? 0, this.hoverPitch, 3);
    this.pivot.userData.hy = hy;
    this.pivot.userData.hp = hp;

    this.pivot.rotation.set(this.pitch + hp, this.yaw + hy, 0);
    this.lean.rotation.z = this.tilt;
    this.renderer.render(this.scene, this.camera);
    this.project();
    this.opts.onTurned(this.yaw);

    if (moving) this.kick();
  };

  /** Where each anchor is on the canvas right now, in % of it, and whether it faces us. */
  private project() {
    const out: Projected = {};
    const v = new THREE.Vector3();
    const n = new THREE.Vector3();
    const camDir = new THREE.Vector3();
    this.lean.updateWorldMatrix(true, false);
    const m = this.lean.matrixWorld;
    const nm = new THREE.Matrix3().getNormalMatrix(m);
    for (const id of Object.keys(ANCHORS) as CustomizationId[]) {
      const a = ANCHORS[id];
      const side = a.side === 'front' ? 1 : -1;
      const s = surface(a.x, a.y, side);
      v.set(a.x, a.y + (a.lift ?? 0), id === 'design' ? 0 : s.z);
      n.set(0, 0, id === 'design' ? 1 : side);
      v.applyMatrix4(m);
      n.applyMatrix3(nm).normalize();
      camDir.subVectors(this.camera.position, v).normalize();
      const facing = id === 'design' ? true : n.dot(camDir) > 0.05;
      v.project(this.camera);
      out[id] = { x: (v.x * 0.5 + 0.5) * 100, y: (1 - (v.y * 0.5 + 0.5)) * 100, facing };
    }
    this.opts.onAnchors(out);
  }

  renderOnce() {
    this.kick();
  }

  dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.frame);
    this.scene.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh) return;
      mesh.geometry.dispose();
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      mats.forEach((mat) => {
        for (const v of Object.values(mat)) if (v instanceof THREE.Texture) v.dispose();
        mat.dispose();
      });
    });
    this.renderer.dispose();
  }
}
