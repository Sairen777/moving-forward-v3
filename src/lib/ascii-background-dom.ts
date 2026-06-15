import type { AsciiBackgroundProfile } from "../backgrounds/types";

const TWO_PI = 6.283185307179586;

export type AsciiMotionState = {
  readonly lift: Float64Array;
  readonly gain: Float64Array;
  readonly phase: Float64Array;
  readonly mirrorX: Uint16Array;
  readonly motionIndexes: Uint32Array;
};

export function decodeAsciiData(background: AsciiBackgroundProfile): Uint8Array {
  const bin = atob(background.data);
  const expected = background.meta.cols * background.meta.rows;
  if (bin.length !== expected) {
    throw new Error("ASCII background data length does not match profile dimensions.");
  }
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i += 1) out[i] = bin.charCodeAt(i);
  return out;
}

export function isWheat(byte: number, kCool: number): boolean {
  return (byte & 15) !== 0 && byte >> 4 >= kCool;
}

export function buildAsciiMotionState(background: AsciiBackgroundProfile, base: Uint8Array): AsciiMotionState {
  const cols = background.meta.cols | 0;
  const rows = background.meta.rows | 0;
  const kCool = background.meta.kCool | 0;
  const sourceHalf = cols >> 1;
  const sourceDenom = Math.max(1, sourceHalf - 1);

  const lift = new Float64Array(cols * rows);
  const gain = new Float64Array(cols);
  const phase = new Float64Array(cols);
  const mirrorX = new Uint16Array(cols);

  const top = new Int16Array(sourceHalf);
  const bottom = new Int16Array(sourceHalf);
  const count = new Uint16Array(sourceHalf);
  for (let i = 0; i < sourceHalf; i += 1) {
    top[i] = rows;
    bottom[i] = -1;
    count[i] = 0;
  }

  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < sourceHalf; x += 1) {
      const byte = base[y * cols + x];
      if (isWheat(byte, kCool)) {
        if (y < top[x]) top[x] = y;
        if (y > bottom[x]) bottom[x] = y;
        count[x] += 1;
      }
    }
  }

  for (let x = 0; x < cols; x += 1) {
    const ux = x < sourceHalf ? x : cols - 1 - x;
    mirrorX[x] = ux;

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
      gain[x] = 0;
      phase[x] = 0;
      continue;
    }

    const n = bestN;
    const span = Math.max(1, bottom[n] - top[n]);
    const density = count[n] / (span + 1);
    const distanceFalloff = Math.max(0, 1 - bestDist / Math.max(1, sourceHalf / 2));
    const heightGain = 0.7 + 0.45 * (span / rows);
    const densityGain = 1.15 - 0.35 * Math.min(1, density);
    gain[x] = distanceFalloff * heightGain * densityGain;
    phase[x] = TWO_PI * (0.62 * (n / sourceDenom) + 0.38 * (top[n] / Math.max(1, rows - 1)));

    for (let y = 0; y < rows; y += 1) {
      if (y < top[n] - 1 || y > bottom[n] + 1) continue;
      const liftVal = (bottom[n] - y) / span;
      lift[y * cols + x] = Math.min(1, Math.max(0, liftVal)) ** background.motion.tipPower;
    }
  }

  // Build motionIndexes: every cell where lift[idx] !== 0 and gain[x] !== 0.
  const idxList: number[] = [];
  for (let idx = 0; idx < cols * rows; idx += 1) {
    const x = idx % cols;
    if (lift[idx] !== 0 && gain[x] !== 0) idxList.push(idx);
  }
  const motionIndexes = new Uint32Array(idxList);

  return { lift, gain, phase, mirrorX, motionIndexes };
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export function renderAsciiRow(background: AsciiBackgroundProfile, cells: Uint8Array, row: number): string {
  const cols = background.meta.cols | 0;
  const tileRepeats = background.render.tileRepeats | 0;
  const chars = background.meta.chars;
  const rowOffset = row * cols;
  const paletteCount = background.meta.palette.length;

  const layers: string[] = [];

  for (let cc = 0; cc < paletteCount; cc += 1) {
    const buf: string[] = [];
    // For each horizontal repeat and source column, emit glyph or space.
    for (let tile = 0; tile < tileRepeats; tile += 1) {
      for (let x = 0; x < cols; x += 1) {
        const byte = cells[rowOffset + x];
        const ci = byte & 15;
        const cellCc = byte >> 4;
        if (ci !== 0 && cellCc === cc) {
          buf.push(chars.charAt(ci));
        } else {
          buf.push(" ");
        }
      }
    }
    const line = buf.join("");
    // Omit empty color layers.
    if (line.trim()) {
      layers.push(`<span class="ascii-color-${cc}">${escapeHtml(line)}</span>`);
    }
  }

  return layers.length > 0 ? layers.join("") : "";
}

export function renderAsciiRows(background: AsciiBackgroundProfile, cells: Uint8Array): string[] {
  const rows = background.meta.rows | 0;
  const out: string[] = new Array(rows);
  for (let y = 0; y < rows; y += 1) {
    out[y] = renderAsciiRow(background, cells, y);
  }
  return out;
}

export function writeAsciiFrame(
  background: AsciiBackgroundProfile,
  base: Uint8Array,
  previous: Uint8Array,
  next: Uint8Array,
  motionState: AsciiMotionState,
  elapsedMs: number,
  dirtyRows: Uint8Array,
): void {
  const cols = background.meta.cols | 0;
  const rows = background.meta.rows | 0;
  const kCool = background.meta.kCool | 0;
  const t = elapsedMs;
  const { lift, gain, phase, mirrorX, motionIndexes } = motionState;

  next.set(base);
  dirtyRows.fill(0);

  const sourceDenom = Math.max(1, (cols >> 1) - 1);
  const rowsMax = rows - 1;

  for (let mi = 0; mi < motionIndexes.length; mi += 1) {
    const idx = motionIndexes[mi];
    const y = (idx / cols) | 0;
    const x = idx % cols;
    let sx = x;
    let sy = y;

    // Wind displacement (same equations as canvas renderer)
    {
      const seconds = t * 0.001;
      const ramp = Math.min(1, t / background.timing.motionRampMs);
      const motion = ramp * ramp * (3 - 2 * ramp);
      const xp = mirrorX[x] / sourceDenom;
      const localSeconds = seconds - lift[idx] * background.motion.headLag;
      const gust =
        background.motion.gustBase +
        background.motion.gustAmplitude *
          Math.sin(
            seconds * background.motion.gustFrequency +
              background.motion.gustNestedAmplitude * Math.sin(seconds * background.motion.gustNestedFrequency),
          );
      let wind = 0;
      for (let i = 0; i < background.motion.waves.length; i += 1) {
        const [weight, temporalFrequency, spatialFrequency, phaseScale] = background.motion.waves[i];
        wind += weight * Math.sin(localSeconds * temporalFrequency - xp * spatialFrequency + phase[x] * phaseScale);
      }
      const bend = background.motion.maxBend * motion * gust * gain[x] * lift[idx] * wind;
      sx = Math.round(x - bend);
      sx %= cols;
      if (sx < 0) sx += cols;

      let drop = background.motion.arcDrop * bend * bend * lift[idx];
      if (drop > 2) drop = 2;
      sy = Math.round(y - drop);
      if (sy < 0) sy = 0;
      else if (sy > rowsMax) sy = rowsMax;
    }

    // Fallback rule: if sampled cell is blank or cool, use base output cell;
    // if base output cell is warm, blank the glyph.
    let b = base[sy * cols + sx];
    let ci = b & 15;
    let cc = b >> 4;

    if (ci === 0 || cc < kCool) {
      b = base[idx];
      ci = b & 15;
      cc = b >> 4;
      if (cc >= kCool) ci = 0;
    }

    next[idx] = (cc << 4) | ci;
  }

  // Mark dirty rows
  for (let i = 0; i < next.length; i += 1) {
    if (next[i] !== previous[i]) {
      dirtyRows[(i / cols) | 0] = 1;
    }
  }
}
