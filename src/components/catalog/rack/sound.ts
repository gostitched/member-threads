/**
 * The rack's sound. Off until asked for; nothing autoplays.
 *
 * A dry cleaner's conveyor, rendered once on the first press of "Sound":
 *   clinks   thin wire hangers knocking into each other: the main voice
 *   shuffle  garments brushing past garments, a grainy fabric texture
 *   scrape   hooks riding the chrome, plus ticks at the rail joins
 *   rumble   the drive belt underneath
 *   fwump    a garment's weight swinging into its neighbour
 * Hangers are modal synthesis (inharmonic free-bar partials, each dying at its own
 * rate, over a short impact transient), so every hit is steel, not a synth. One small
 * room and a compressor glue it together.
 */

type Loop = { f: BiquadFilterNode; g: GainNode };
type Mode = [freq: number, amp: number, decay: number];

const BAR = [1, 2.756, 5.404, 8.933];
const jitter = (x: number) => 1 + (Math.random() - 0.5) * x;
const pick = <T,>(arr: T[]) => arr[(Math.random() * arr.length) | 0];

export class RackSound {
  on = false;
  private ctx: AudioContext | null = null;
  private bus!: GainNode;
  private clinks: AudioBuffer[] = [];
  private clacks: AudioBuffer[] = [];
  private ticks: AudioBuffer[] = [];
  private fwumps: AudioBuffer[] = [];
  private shuffle!: Loop;
  private scrape!: Loop;
  private rumble!: Loop;
  private jphase = 0;
  private tphase = 0;
  private lastT = 0;
  private lastNudge = 0;

  /** Turns sound on or off; returns whether it is now on. Must run inside a user gesture. */
  toggle(): boolean {
    if (!this.on && !this.init()) return false;
    this.on = !this.on;
    if (this.ctx?.state === 'suspended') void this.ctx.resume();
    if (this.on) this.jangle(3, 0.08, 0.14, 0);
    else this.silence();
    return this.on;
  }

  close() {
    this.on = false;
    void this.ctx?.close();
    this.ctx = null;
  }

  private init(): boolean {
    if (this.ctx) return true;
    const C: typeof AudioContext | undefined =
      window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!C) return false;
    const ctx = (this.ctx = new C());
    const sr = ctx.sampleRate;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -20;
    comp.knee.value = 10;
    comp.ratio.value = 3.5;
    comp.attack.value = 0.003;
    comp.release.value = 0.16;
    const master = ctx.createGain();
    comp.connect(master).connect(ctx.destination);
    this.bus = ctx.createGain();
    this.bus.connect(comp);
    const verb = ctx.createConvolver();
    verb.buffer = this.room(sr, 0.7);
    const wet = ctx.createGain();
    wet.gain.value = 0.22;
    this.bus.connect(verb).connect(wet).connect(comp);

    this.clinks = [2280, 2470, 2650, 2890, 3120, 3390, 3660, 3950].map((f) =>
      this.metal(sr, {
        dur: 0.42,
        modes: BAR.slice(0, 3).map((r, i): Mode => [f * r * jitter(0.03), [1, 0.5, 0.22][i], [0.19, 0.09, 0.045][i]]),
        click: 0.0005,
        clickAmp: 0.3,
      })
    );
    this.clacks = [1180, 1290, 1400].map((f) =>
      this.metal(sr, {
        dur: 0.3,
        modes: BAR.map((r, i): Mode => [f * r * jitter(0.01), [1, 0.45, 0.25, 0.12][i], [0.08, 0.05, 0.032, 0.02][i]]),
        click: 0.0016,
        clickAmp: 0.7,
        thump: [88 + Math.random() * 16, 0.8, 0.03],
      })
    );
    this.ticks = [2700, 3100, 3500].map((f) =>
      this.metal(sr, {
        dur: 0.06,
        modes: BAR.slice(0, 3).map((r, i): Mode => [f * r, [1, 0.35, 0.15][i], [0.016, 0.01, 0.006][i]]),
        click: 0.0006,
        clickAmp: 0.5,
      })
    );
    this.fwumps = [0, 1, 2].map(() => this.fwump(sr));

    const noise = ctx.createBuffer(1, sr * 2, sr);
    const nd = noise.getChannelData(0);
    for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
    const loop = (buf: AudioBuffer, type: BiquadFilterType, freq: number, q: number): Loop => {
      const s = ctx.createBufferSource();
      s.buffer = buf;
      s.loop = true;
      const f = ctx.createBiquadFilter();
      f.type = type;
      f.frequency.value = freq;
      f.Q.value = q;
      const g = ctx.createGain();
      g.gain.value = 0;
      s.connect(f).connect(g).connect(this.bus);
      s.start(0, Math.random() * buf.duration);
      return { f, g };
    };
    this.shuffle = loop(this.rustle(sr, 2.6), 'bandpass', 1300, 0.5);
    this.scrape = loop(noise, 'bandpass', 4200, 1.1);
    this.rumble = loop(noise, 'lowpass', 110, 0.8);
    return true;
  }

  private room(sr: number, dur: number): AudioBuffer {
    const len = (sr * dur) | 0;
    const b = this.ctx!.createBuffer(2, len, sr);
    const pre = (sr * 0.008) | 0;
    for (let c = 0; c < 2; c++) {
      const d = b.getChannelData(c);
      for (let i = pre; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3.6);
    }
    return b;
  }

  private norm(d: Float32Array, to: number) {
    let pk = 0;
    for (let i = 0; i < d.length; i++) pk = Math.max(pk, Math.abs(d[i]));
    if (pk) for (let i = 0; i < d.length; i++) d[i] *= to / pk;
  }

  private metal(sr: number, o: { dur: number; modes: Mode[]; click: number; clickAmp: number; thump?: Mode }): AudioBuffer {
    const len = (sr * o.dur) | 0;
    const b = this.ctx!.createBuffer(1, len, sr);
    const d = b.getChannelData(0);
    const ramp = sr * 0.0004;
    for (const [f, a, dec] of o.modes) {
      const w = (2 * Math.PI * f) / sr;
      const k = 1 / (dec * sr);
      for (let i = 0; i < len; i++) d[i] += a * Math.sin(w * i) * Math.exp(-i * k) * Math.min(1, i / ramp);
    }
    const tl = (sr * o.click) | 0;
    for (let i = 0; i < tl; i++) d[i] += (Math.random() * 2 - 1) * o.clickAmp * (1 - i / tl) ** 2;
    if (o.thump) {
      const [f, a, dec] = o.thump;
      const w = (2 * Math.PI * f) / sr;
      const k = 1 / (dec * sr);
      for (let i = 0; i < len; i++) d[i] += a * Math.sin(w * i) * Math.exp(-i * k) * Math.min(1, i / (sr * 0.0015));
    }
    this.norm(d, 0.9);
    return b;
  }

  /** Fabric: hundreds of tiny overlapping brushes of noise, uneven in size and loudness. */
  private rustle(sr: number, dur: number): AudioBuffer {
    const len = (sr * dur) | 0;
    const b = this.ctx!.createBuffer(1, len, sr);
    const d = b.getChannelData(0);
    for (let g = 0; g < dur * 170; g++) {
      const st = (Math.random() * len) | 0;
      const L = (sr * (0.008 + Math.random() * 0.08)) | 0;
      const a = Math.random() ** 2.2;
      for (let i = 0; i < L; i++) d[(st + i) % len] += (Math.random() * 2 - 1) * a * (0.5 - 0.5 * Math.cos((2 * Math.PI * i) / L));
    }
    this.norm(d, 0.9);
    return b;
  }

  private fwump(sr: number): AudioBuffer {
    const len = (sr * 0.24) | 0;
    const b = this.ctx!.createBuffer(1, len, sr);
    const d = b.getChannelData(0);
    let y = 0;
    for (let i = 0; i < len; i++) {
      y += 0.1 * (Math.random() * 2 - 1 - y);
      d[i] = y * Math.min(1, i / (sr * 0.008)) * Math.exp(-i / (sr * 0.055));
    }
    this.norm(d, 0.9);
    return b;
  }

  private play(buf: AudioBuffer, gain: number, rate: number, pan = 0, when = 0) {
    const ctx = this.ctx!;
    const s = ctx.createBufferSource();
    const g = ctx.createGain();
    s.buffer = buf;
    s.playbackRate.value = rate;
    g.gain.value = gain;
    s.connect(g);
    const p = ctx.createStereoPanner();
    p.pan.value = Math.max(-1, Math.min(1, pan));
    g.connect(p).connect(this.bus);
    s.start(ctx.currentTime + when);
  }

  /** A few hangers knocking together, spread over `spread` seconds. */
  private jangle(n: number, spread: number, gain: number, pan: number) {
    if (!this.ctx) return;
    for (let k = 0; k < n; k++)
      this.play(
        pick(this.clinks),
        gain * (0.45 + Math.random() * 0.55),
        0.94 + Math.random() * 0.14,
        pan + (Math.random() - 0.5) * 0.5,
        k === 0 ? 0 : Math.random() * spread
      );
  }

  private get live() {
    return this.on && this.ctx !== null;
  }

  /** Every frame of a run, with the rack's top speed in px/s. */
  speed(v: number) {
    if (!this.live) return;
    const ctx = this.ctx!;
    const t = ctx.currentTime;
    const dt = this.lastT ? Math.min(0.05, t - this.lastT) : 0;
    this.lastT = v ? t : 0;
    const k = Math.min(1, Math.abs(v) / 9000);
    this.shuffle.g.gain.setTargetAtTime(Math.pow(k, 1.3) * 0.5, t, 0.04);
    this.shuffle.f.frequency.setTargetAtTime(800 + k * 2200, t, 0.06);
    this.scrape.g.gain.setTargetAtTime(k * k * 0.014, t, 0.04);
    this.rumble.g.gain.setTargetAtTime(k * 0.12, t, 0.06);
    // Hangers clattering into each other: sparse at a crawl, a racket at full tilt.
    this.jphase += Math.min(22, Math.abs(v) / 420) * dt;
    while (this.jphase >= 1) {
      this.jphase -= 1;
      this.jangle(1 + ((Math.random() * 3) | 0), 0.045, 0.06 + 0.12 * k, (Math.random() - 0.5) * 1.4);
    }
    this.tphase += Math.min(30, Math.abs(v) / 260) * dt;
    while (this.tphase >= 1) {
      this.tphase -= 1;
      this.play(pick(this.ticks), 0.03 + 0.06 * k, 0.9 + Math.random() * 0.25, (Math.random() - 0.5) * 0.8);
    }
  }

  /** The drive takes up: a jolt, and the whole rack of hangers rattles at once. */
  engage(first: boolean) {
    if (!this.live) return;
    this.play(this.clacks[0], first ? 0.34 : 0.24, 0.5, 0);
    this.play(pick(this.fwumps), 0.3, 0.7, 0, 0.01);
    this.jangle(first ? 9 : 6, first ? 0.16 : 0.11, first ? 0.2 : 0.15, 0);
  }

  /** A garment arrives: its hook seats, its hanger knocks the neighbour, the cloth swings in. */
  land(pan: number) {
    if (!this.live) return;
    this.play(pick(this.clacks), 0.26 + Math.random() * 0.1, 0.96 + Math.random() * 0.08, pan);
    this.jangle(2 + ((Math.random() * 2) | 0), 0.09, 0.15, pan);
    this.play(pick(this.fwumps), 0.3, 0.85 + Math.random() * 0.35, pan, 0.006);
  }

  /** Hover pushes the neighbours aside along the rail. */
  nudge(pan: number) {
    if (!this.live) return;
    const t = performance.now();
    if (t - this.lastNudge < 110) return;
    this.lastNudge = t;
    this.jangle(1 + ((Math.random() * 2) | 0), 0.04, 0.08, pan);
    this.play(pick(this.fwumps), 0.1, 1.2, pan);
  }

  /** Lifted off the rail. */
  pull(pan: number) {
    if (!this.live) return;
    this.play(pick(this.ticks), 0.14, 0.55, pan);
    this.jangle(2, 0.06, 0.1, pan);
    this.play(pick(this.fwumps), 0.32, 1.25, pan, 0.03);
  }

  silence() {
    if (!this.ctx || !this.shuffle) return;
    const t = this.ctx.currentTime;
    for (const b of [this.shuffle, this.scrape, this.rumble]) b.g.gain.setTargetAtTime(0, t, 0.05);
    this.lastT = 0;
    this.jphase = 0;
    this.tphase = 0;
  }
}
