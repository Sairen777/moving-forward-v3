import { type Accessor, createEffect, For, onCleanup, onMount } from "solid-js";
import { NoHydration } from "solid-js/web";
import { activeBackground, activeBackgroundStyles } from "../backgrounds/current";
import {
  type AsciiMotionState,
  buildAsciiMotionState,
  decodeAsciiData,
  renderAsciiRow,
  renderAsciiRows,
  writeAsciiFrame,
} from "../lib/ascii-background-dom";

const baseCells = decodeAsciiData(activeBackground);
const initialRows = renderAsciiRows(activeBackground, baseCells);

export function SiteBackground(props: { readonly animate: Accessor<boolean> }) {
  let root!: HTMLDivElement;
  let animationActive = false;
  let timer: number | undefined;
  let raf: number | undefined;
  let origin = 0;
  let last = 0;
  let previous = baseCells;
  let next = new Uint8Array(baseCells.length);
  let dirtyRows = new Uint8Array(activeBackground.meta.rows);
  let rowEls: HTMLDivElement[] = [];
  let motion: MediaQueryList | undefined;
  let motionState: AsciiMotionState | undefined;
  let removeMotionListener: (() => void) | undefined;

  const clearTimer = () => {
    if (timer === undefined) return;
    window.clearTimeout(timer);
    timer = undefined;
  };

  const holdStill = () => {
    animationActive = false;
    if (raf !== undefined) {
      cancelAnimationFrame(raf);
      raf = undefined;
    }
    origin = 0;
    last = 0;
    if (rowEls.length === activeBackground.meta.rows) {
      for (let y = 0; y < activeBackground.meta.rows; y += 1) {
        rowEls[y].innerHTML = initialRows[y];
      }
    }
    previous.set(baseCells);
    next.fill(0);
    dirtyRows.fill(0);
  };

  const runLoop = () => {
    const state = motionState;
    if (raf !== undefined || !state) return;
    const loop = (t: number) => {
      if (!animationActive) return;
      raf = requestAnimationFrame(loop);
      if (origin === 0) {
        origin = t;
        last = t;
        return;
      }
      if (t - last < activeBackground.timing.frameMs) return;
      last = t;
      writeAsciiFrame(activeBackground, baseCells, previous, next, state, t - origin, dirtyRows);
      for (let y = 0; y < activeBackground.meta.rows; y += 1) {
        if (dirtyRows[y]) {
          rowEls[y].innerHTML = renderAsciiRow(activeBackground, next, y);
        }
      }
      // Swap buffers
      const tmp = previous;
      previous = next;
      next = tmp;
    };
    raf = requestAnimationFrame(loop);
  };

  const syncAnimation = (shouldAnimate: boolean) => {
    clearTimer();
    const reducedMotion = motion?.matches ?? false;
    if (!shouldAnimate || reducedMotion) {
      holdStill();
      return;
    }
    timer = window.setTimeout(() => {
      timer = undefined;
      animationActive = true;
      runLoop();
    }, activeBackground.timing.startDelayMs);
  };

  onMount(() => {
    const rows = root.querySelectorAll<HTMLDivElement>("[data-ascii-row]");
    if (rows.length !== activeBackground.meta.rows) {
      throw new Error("ASCII background row count does not match the active profile.");
    }
    rowEls = Array.from(rows);

    motionState = buildAsciiMotionState(activeBackground, baseCells);
    next = new Uint8Array(baseCells.length);
    dirtyRows = new Uint8Array(activeBackground.meta.rows);
    previous = new Uint8Array(baseCells);
    previous.set(baseCells);

    motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onMotionChange = () => syncAnimation(props.animate());
    if (motion.addEventListener) {
      motion.addEventListener("change", onMotionChange);
      removeMotionListener = () => motion?.removeEventListener("change", onMotionChange);
    } else {
      motion.addListener(onMotionChange);
      removeMotionListener = () => motion?.removeListener(onMotionChange);
    }

    syncAnimation(props.animate());
  });

  createEffect(() => {
    syncAnimation(props.animate());
  });

  onCleanup(() => {
    clearTimer();
    holdStill();
    removeMotionListener?.();
    removeMotionListener = undefined;
  });

  return (
    <div ref={root} class={activeBackgroundStyles.bg} data-ascii-background-root="" aria-hidden="true">
      <NoHydration>
        <For each={initialRows}>
          {(html, row) => (
            <div
              class={activeBackgroundStyles.row}
              data-ascii-row={row()}
              style={{ top: `${(row() * 100) / activeBackground.meta.rows}%` }}
              innerHTML={html}
            />
          )}
        </For>
      </NoHydration>
    </div>
  );
}
