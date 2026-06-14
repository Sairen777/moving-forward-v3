import { type Accessor, createEffect, onCleanup, onMount } from "solid-js";
import { field } from "../lib/field-data";
import { type FieldRendererHandle, mount } from "../lib/field-renderer";

import styles from "./FieldCanvas.module.css";

type FieldCanvasProps = {
  animate: Accessor<boolean>;
};

const ANIMATION_DELAY_MS = 2000;

export function FieldCanvas(props: FieldCanvasProps) {
  let canvas!: HTMLCanvasElement;
  let renderer: FieldRendererHandle | undefined;
  let startDelay: number | undefined;

  const clearStartDelay = () => {
    if (startDelay === undefined) return;
    window.clearTimeout(startDelay);
    startDelay = undefined;
  };

  const syncAnimation = (shouldAnimate: boolean) => {
    if (!renderer) return;
    clearStartDelay();
    if (!shouldAnimate) {
      renderer.stop();
      canvas.parentElement?.removeAttribute("data-field-ready");
      return;
    }

    startDelay = window.setTimeout(() => {
      startDelay = undefined;
      renderer?.start();
      canvas.parentElement?.setAttribute("data-field-ready", "");
    }, ANIMATION_DELAY_MS);
  };

  onMount(() => {
    renderer = mount(canvas, { field, animate: false });
    syncAnimation(props.animate());
  });

  createEffect(() => {
    syncAnimation(props.animate());
  });

  onCleanup(() => {
    clearStartDelay();
    canvas.parentElement?.removeAttribute("data-field-ready");
    renderer?.destroy();
  });

  return (
    <div class={styles.bg} aria-hidden="true">
      <canvas ref={canvas} class={styles.art} />
    </div>
  );
}
