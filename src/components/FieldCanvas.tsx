import { createEffect, onCleanup, onMount, type Accessor } from "solid-js";
import { field } from "../lib/field-data";
import { mount, type FieldRendererHandle } from "../lib/field-renderer";
import styles from "./FieldCanvas.module.css";

type FieldCanvasProps = {
  animate: Accessor<boolean>;
};

export function FieldCanvas(props: FieldCanvasProps) {
  let canvas!: HTMLCanvasElement;
  let renderer: FieldRendererHandle | undefined;

  onMount(() => {
    renderer = mount(canvas, { field, animate: props.animate() });
  });

  createEffect(() => {
    const shouldAnimate = props.animate();
    if (!renderer) return;
    if (shouldAnimate) renderer.start();
    else renderer.stop();
  });

  onCleanup(() => renderer?.destroy());

  return (
    <div class={styles.bg} aria-hidden="true">
      <canvas ref={canvas} class={styles.art} />
    </div>
  );
}
