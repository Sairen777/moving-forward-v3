import { For } from "solid-js";
import { activeBackgroundMeta } from "../backgrounds/current";

import styles from "./Manifest.module.css";

export type ManifestPost = {
  readonly slug: string;
  readonly href: string;
  readonly title: string;
  readonly date: string;
  readonly tag: string;
  readonly readTime: string;
};

function readMeter(readTime: string) {
  const minutes = Number.parseInt(readTime, 10);
  const meterLength = Number.isFinite(minutes) ? Math.max(3, Math.min(8, minutes + 1)) : 5;

  return activeBackgroundMeta.chars.slice(1, 1 + meterLength);
}

export function Manifest(props: { posts: readonly ManifestPost[] }) {
  return (
    <>
      <div class={styles.head} aria-hidden="true">
        <span>date</span>
        <span>title</span>
        <span>tag</span>
        <span>read</span>
      </div>
      <ul class={styles.rows}>
        <For each={props.posts}>
          {(post) => (
            <li>
              <a class={styles.row} href={post.href}>
                <span class={styles.date}>{post.date}</span>
                <span class={styles.title}>{post.title}</span>
                <span class={styles.tag}>{post.tag}</span>
                <span class={styles.meter} aria-hidden="true">
                  {readMeter(post.readTime)}
                </span>
              </a>
            </li>
          )}
        </For>
      </ul>
    </>
  );
}
