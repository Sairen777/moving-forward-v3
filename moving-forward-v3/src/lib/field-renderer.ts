import type { FieldPayload } from "./field-data";

const TWO_PI = 6.283185307179586;
const FONT = 'ui-monospace,"SF Mono",SFMono-Regular,Menlo,Consolas,"Liberation Mono",monospace';
const MAX_DPR = 2;
const GAIN_X = 1.85;
const ARC = 0.05;
const POWER = 0.8;
const F1 = 2.1;
const F2 = 3.7;
const F3 = 5.3;
const FRAME_MS = 80;

export type FieldRendererHandle = {
  start(): void;
  stop(): void;
  destroy(): void;
};

type MountOptions = {
  field: FieldPayload;
  animate?: boolean;
};

function decode(data: string) {
  const bin = atob(data);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i += 1) out[i] = bin.charCodeAt(i);
  return out;
}

class FieldRenderer implements FieldRendererHandle {
  private readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  private readonly source: FieldPayload;
  private readonly cols: number;
  private readonly rows: number;
  private readonly kCool: number;
  private readonly bytes: Uint8Array;
  private readonly palette: readonly string[];
  private readonly glyphs: string[];
  private readonly envelope: Float64Array;
  private readonly phase1: Float64Array;
  private readonly phase2: Float64Array;
  private readonly phase3: Float64Array;
  private readonly heightCurve: Float64Array;
  private readonly wave: Float64Array;
  private readonly motion: MediaQueryList;
  private readonly resizeSoon: () => void;
  private readonly syncMotion: () => void;
  private width = 1;
  private height = 1;
  private cellW = 1;
  private cellH = 1;
  private tileW = 1;
  private tiles = 1;
  private font = "";
  private running = false;
  private wantsAnimation = false;
  private raf = 0;
  private last = 0;
  private resizePending = false;

  constructor(canvas: HTMLCanvasElement, options: MountOptions) {
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) throw new Error("Field canvas could not create a 2D context.");

    this.canvas = canvas;
    this.ctx = ctx;
    this.source = options.field;
    this.cols = this.source.cols | 0;
    this.rows = this.source.rows | 0;
    this.kCool = this.source.kCool | 0;
    this.bytes = decode(this.source.data);
    this.palette = this.source.palette;
    this.glyphs = [];
    for (let i = 0; i < this.source.chars.length; i += 1) this.glyphs[i] = this.source.chars.charAt(i);

    this.envelope = new Float64Array(this.cols);
    this.phase1 = new Float64Array(this.cols);
    this.phase2 = new Float64Array(this.cols);
    this.phase3 = new Float64Array(this.cols);
    this.heightCurve = new Float64Array(this.rows);
    this.wave = new Float64Array(this.cols);
    this.motion = window.matchMedia("(prefers-reduced-motion: reduce)");

    for (let x = 0; x < this.cols; x += 1) {
      const px = x / (this.cols - 1);
      this.envelope[x] = Math.min(1, Math.sin(Math.PI * px) / 0.35);
      this.phase1[x] = TWO_PI * F1 * px;
      this.phase2[x] = TWO_PI * F2 * px;
      this.phase3[x] = TWO_PI * F3 * px;
    }

    for (let y = 0; y < this.rows; y += 1) {
      this.heightCurve[y] = ((this.rows - 1 - y) / (this.rows - 1)) ** POWER;
    }

    this.resizeSoon = () => {
      if (this.resizePending) return;
      this.resizePending = true;
      requestAnimationFrame(() => {
        this.resizePending = false;
        this.resize();
      });
    };

    this.syncMotion = () => {
      if (this.wantsAnimation && !this.motion.matches) this.runLoop();
      else this.holdStill();
    };

    this.resize();
    window.addEventListener("resize", this.resizeSoon, { passive: true });
    if (this.motion.addEventListener) this.motion.addEventListener("change", this.syncMotion);
    else this.motion.addListener(this.syncMotion);

    if (options.animate !== false) this.start();
    else this.stop();
  }

  start() {
    this.wantsAnimation = true;
    this.syncMotion();
  }

  stop() {
    this.wantsAnimation = false;
    this.holdStill();
  }

  destroy() {
    this.wantsAnimation = false;
    this.running = false;
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = 0;
    window.removeEventListener("resize", this.resizeSoon);
    if (this.motion.removeEventListener) this.motion.removeEventListener("change", this.syncMotion);
    else this.motion.removeListener(this.syncMotion);
  }

  private resize() {
    const w = Math.max(1, window.innerWidth | 0);
    const h = Math.max(1, window.innerHeight | 0);
    const dpr = Math.min(MAX_DPR, Math.max(1, window.devicePixelRatio || 1));
    const pw = Math.ceil(w * dpr);
    const ph = Math.ceil(h * dpr);

    if (this.canvas.width !== pw) this.canvas.width = pw;
    if (this.canvas.height !== ph) this.canvas.height = ph;
    this.canvas.style.width = `${w}px`;
    this.canvas.style.height = `${h}px`;

    this.width = w;
    this.height = h;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.cellH = h / this.rows;
    this.font = `${this.cellH}px ${FONT}`;
    this.ctx.font = this.font;
    this.ctx.textBaseline = "top";
    this.cellW = this.ctx.measureText("M").width || this.cellH * 0.6;
    this.tileW = this.cols * this.cellW;
    this.tiles = Math.max(1, Math.ceil(w / this.tileW) + 1);
    this.draw(0);
  }

  private draw(t: number) {
    const ctx = this.ctx;
    const cols = this.cols;
    const rows = this.rows;
    const bytes = this.bytes;
    const kCool = this.kCool;
    const palette = this.palette;
    const glyphs = this.glyphs;
    const cellW = this.cellW;
    const cellH = this.cellH;
    const tileW = this.tileW;
    const envelope = this.envelope;
    const phase1 = this.phase1;
    const phase2 = this.phase2;
    const phase3 = this.phase3;
    const heightCurve = this.heightCurve;
    const wave = this.wave;
    let lastColor = "";

    ctx.clearRect(0, 0, this.width, this.height);
    ctx.font = this.font;
    ctx.textBaseline = "top";

    for (let y = 0; y < rows; y += 1) {
      const yn = y / rows;
      const p1 = (-t / 5200) * TWO_PI + 2.3 * yn;
      const p2 = (-t / 3500) * TWO_PI + 3.4 * yn + 1.7;
      const p3 = (-t / 4400) * TWO_PI + 1.1 * yn + 4.0;

      for (let x = 0; x < cols; x += 1) {
        wave[x] = Math.sin(phase1[x] + p1) + 0.6 * Math.sin(phase2[x] + p2) + 0.4 * Math.sin(phase3[x] + p3);
      }

      const gx = heightCurve[y] * GAIN_X;
      const py = y * cellH;

      for (let tile = 0; tile < this.tiles; tile += 1) {
        const ox = tile * tileW;

        for (let x = 0; x < cols; x += 1) {
          const bend = gx * envelope[x] * (wave[x] - wave[cols - 1 - x]);
          let dy = ARC * bend * bend;
          if (dy > 3) dy = 3;

          let sx = Math.round(x - bend);
          if (sx < 0) sx = 0;
          else if (sx >= cols) sx = cols - 1;

          let sy = Math.round(y - dy);
          if (sy < 0) sy = 0;
          else if (sy >= rows) sy = rows - 1;

          let b = bytes[sy * cols + sx];
          let ci = b & 15;
          let cc = b >> 4;

          if (ci === 0 || cc < kCool) {
            b = bytes[y * cols + x];
            ci = b & 15;
            cc = b >> 4;
            if (cc >= kCool) ci = 0;
          }

          if (ci !== 0) {
            const color = palette[cc] || "#7a8a86";
            if (color !== lastColor) {
              ctx.fillStyle = color;
              lastColor = color;
            }
            ctx.fillText(glyphs[ci], ox + x * cellW, py);
          }
        }
      }
    }
  }

  private runLoop() {
    if (this.running) return;
    this.running = true;
    this.last = 0;

    const loop = (t: number) => {
      if (!this.running) return;
      this.raf = requestAnimationFrame(loop);
      if (t - this.last < FRAME_MS) return;
      this.last = t;
      this.draw(t);
    };

    this.raf = requestAnimationFrame(loop);
  }

  private holdStill() {
    this.running = false;
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = 0;
    this.draw(0);
  }
}

export function mount(canvas: HTMLCanvasElement, options: MountOptions): FieldRendererHandle {
  return new FieldRenderer(canvas, options);
}
