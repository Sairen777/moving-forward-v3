import type { FieldPayload } from "./field-data";

const TWO_PI = 6.283185307179586;
const FONT = 'ui-monospace,"SF Mono",SFMono-Regular,Menlo,Consolas,"Liberation Mono",monospace';
const MAX_DPR = 2;
const MAX_BEND = 2.8;
const ARC_DROP = 0.07;
const TIP_POWER = 1.45;
const HEAD_LAG = 0.22;
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

function isWheat(byte: number, kCool: number) {
  return (byte & 15) !== 0 && byte >> 4 >= kCool;
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
  private readonly lift: Float64Array;
  private readonly gain: Float64Array;
  private readonly phase: Float64Array;
  private readonly mirrorX: Uint16Array;
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

    // Precompute wheat motion state from decoded bytes
    const sourceHalf = this.cols >> 1;
    const sourceDenom = Math.max(1, sourceHalf - 1);
    this.lift = new Float64Array(this.cols * this.rows);
    this.gain = new Float64Array(this.cols);
    this.phase = new Float64Array(this.cols);
    this.mirrorX = new Uint16Array(this.cols);

    const top = new Int16Array(sourceHalf);
    const bottom = new Int16Array(sourceHalf);
    const count = new Uint16Array(sourceHalf);
    for (let i = 0; i < sourceHalf; i += 1) {
      top[i] = this.rows;
      bottom[i] = -1;
      count[i] = 0;
    }

    for (let y = 0; y < this.rows; y += 1) {
      for (let x = 0; x < sourceHalf; x += 1) {
        const byte = this.bytes[y * this.cols + x];
        if (isWheat(byte, this.kCool)) {
          if (y < top[x]) top[x] = y;
          if (y > bottom[x]) bottom[x] = y;
          count[x] += 1;
        }
      }
    }

    for (let x = 0; x < this.cols; x += 1) {
      const ux = x < sourceHalf ? x : this.cols - 1 - x;
      this.mirrorX[x] = ux;

      let bestN = -1;
      let bestDist = sourceHalf + 1;
      let bestCount = 0;

      for (let n = 0; n < sourceHalf; n += 1) {
        if (count[n] === 0) continue;
        const dist = Math.abs(n - ux);
        if (dist < bestDist) {
          bestN = n;
          bestDist = dist;
          bestCount = count[n];
        } else if (dist === bestDist && count[n] > bestCount) {
          bestN = n;
          bestDist = dist;
          bestCount = count[n];
        } else if (dist === bestDist && count[n] === bestCount && n < bestN) {
          bestN = n;
          bestDist = dist;
          bestCount = count[n];
        }
      }

      if (bestN === -1) {
        this.gain[x] = 0;
        this.phase[x] = 0;
        continue;
      }

      const n = bestN;
      const span = Math.max(1, bottom[n] - top[n]);
      const density = count[n] / (span + 1);
      const distanceFalloff = Math.max(0, 1 - bestDist / Math.max(1, sourceHalf / 2));
      const heightGain = 0.7 + 0.45 * (span / this.rows);
      const densityGain = 1.15 - 0.35 * Math.min(1, density);
      this.gain[x] = distanceFalloff * heightGain * densityGain;
      this.phase[x] = TWO_PI * (0.62 * (n / sourceDenom) + 0.38 * (top[n] / Math.max(1, this.rows - 1)));

      for (let y = 0; y < this.rows; y += 1) {
        if (y < top[n] - 1 || y > bottom[n] + 1) continue;
        const liftVal = (bottom[n] - y) / span;
        this.lift[y * this.cols + x] = Math.min(1, Math.max(0, liftVal)) ** TIP_POWER;
      }
    }

    this.motion = window.matchMedia("(prefers-reduced-motion: reduce)");

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
    const lift = this.lift;
    const gain = this.gain;
    const phase = this.phase;
    const mirrorX = this.mirrorX;
    let lastColor = "";

    ctx.clearRect(0, 0, this.width, this.height);
    ctx.font = this.font;
    ctx.textBaseline = "top";

    const sourceDenom = Math.max(1, (cols >> 1) - 1);
    const rowsMax = rows - 1;

    for (let y = 0; y < rows; y += 1) {
      const py = y * cellH;

      for (let x = 0; x < cols; x += 1) {
        const idx = y * cols + x;
        let sx = x;
        let sy = y;

        if (t !== 0 && lift[idx] !== 0 && gain[x] !== 0) {
          const seconds = t * 0.001;
          const xp = mirrorX[x] / sourceDenom;
          const localSeconds = seconds - lift[idx] * HEAD_LAG;
          const gust = 0.78 + 0.22 * Math.sin(seconds * 0.31 + 0.45 * Math.sin(seconds * 0.11));
          const wind =
            0.64 * Math.sin(localSeconds * 0.9 - xp * 2.4) +
            0.27 * Math.sin(localSeconds * 1.35 - xp * 5.2 + phase[x]) +
            0.09 * Math.sin(localSeconds * 2.2 - xp * 8.4 + phase[x] * 0.5);
          const bend = MAX_BEND * gust * gain[x] * lift[idx] * wind;

          sx = Math.round(x - bend);
          sx %= cols;
          if (sx < 0) sx += cols;

          let drop = ARC_DROP * bend * bend * lift[idx];
          if (drop > 2) drop = 2;
          sy = Math.round(y - drop);
          if (sy < 0) sy = 0;
          else if (sy > rowsMax) sy = rowsMax;
        }

        let b = bytes[sy * cols + sx];
        let ci = b & 15;
        let cc = b >> 4;

        if (ci === 0 || cc < kCool) {
          b = bytes[idx];
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
          for (let tile = 0; tile < this.tiles; tile += 1) {
            ctx.fillText(glyphs[ci], tile * tileW + x * cellW, py);
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
