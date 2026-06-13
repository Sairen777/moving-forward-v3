import { Manifest, type ManifestPost } from "../components/Manifest";
import { SectionHeader } from "../components/SectionHeader";
import { fieldMeta } from "../lib/field-meta";
import { articlePath, social } from "../lib/routes";
import { frontmatter as visualizingLife } from "./writing/visualizing-life.mdx";

import styles from "./index.module.css";

const POSTS: readonly ManifestPost[] = [
  {
    slug: "visualizing-life",
    href: articlePath("visualizing-life"),
    title: visualizingLife.title!,
    date: visualizingLife.date!,
    tag: visualizingLife.tag!,
    readTime: visualizingLife.readTime!,
  },
].sort((a, b) => b.date.localeCompare(a.date));

export default function Home() {
  const entryLabel = POSTS.length === 1 ? "01 entry" : `${POSTS.length.toString().padStart(2, "0")} entries`;

  return (
    <>
      <section class={styles.hero}>
        <p class={styles.stamp} aria-hidden="true">
          # {fieldMeta.source} -&gt; {fieldMeta.cols}x{fieldMeta.rows} ascii · the quiet field
        </p>
        <h1>Let's evolve together.</h1>
        <p class={styles.lede}>
          Programming, video games, and productivity — my thoughts, opinions, and the projects I'm currently working on.
        </p>
      </section>

      <div class={styles.reading}>
        <section id="writing" class={styles.block}>
          <SectionHeader title="writing" meta={entryLabel} />
          <Manifest posts={POSTS} />
        </section>

        <section id="about" class={styles.block}>
          <SectionHeader title="about" meta="who & why" />
          <p class={styles.about}>
            Hi, I'm Alex. I work as a SWE at a big fintech, travel, play video games, and love all things productivity —
            without being zealous about it. Here I share my thoughts, opinions, and the projects I'm currently working
            on. Reach out on{" "}
            <a href={social.xUrl} target="_blank" rel="noreferrer">
              X ({social.xHandle})
            </a>{" "}
            if you want to talk.
          </p>
        </section>
      </div>
    </>
  );
}
