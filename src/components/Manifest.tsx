import { For } from "solid-js";

import styles from "./Manifest.module.css";

export type ManifestPost = {
  readonly slug: string;
  readonly href: string;
  readonly title: string;
  readonly date: string;
};

export function Manifest(props: { posts: readonly ManifestPost[] }) {
  return (
    <ul class={styles.rows}>
      <For each={props.posts}>
        {(post) => (
          <li>
            <a class={styles.row} href={post.href}>
              <span class={styles.date}>{post.date}</span>
              <span class={styles.title}>{post.title}</span>
            </a>
          </li>
        )}
      </For>
    </ul>
  );
}
