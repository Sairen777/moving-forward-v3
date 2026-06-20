import { Manifest } from "../components/Manifest";
import { SectionHeader } from "../components/SectionHeader";
import { POSTS } from "../lib/posts";
import { social } from "../lib/routes";

import styles from "./index.module.css";

export default function Home() {
  const entryLabel = POSTS.length === 1 ? "01 entry" : `${POSTS.length.toString().padStart(2, "0")} entries`;

  return (
    <>
      <section class={styles.hero}>
        <h1>Let's evolve together.</h1>
        <div class={styles.lede} />
      </section>

      <div class={styles.reading}>
        <section id="writing" class={styles.block}>
          <SectionHeader title="writing" meta={entryLabel} />
          <Manifest posts={POSTS} />
        </section>

        <section id="about" class={styles.block}>
          <SectionHeader title="about" meta="who & why" />
          <p class={styles.about}>
            Hi, I'm Alex. I work as a SWE. My other interests are history, video games and longevity. Here I share my
            thoughts, opinions, and the projects I'm currently working on. Reach out on{" "}
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
