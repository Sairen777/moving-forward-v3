import { Manifest, type ManifestPost } from "../components/Manifest";
import { SectionHeader } from "../components/SectionHeader";
import { field } from "../lib/field-data";
import styles from "./index.module.css";
import { frontmatter as cleanCutover } from "./writing/the-clean-cutover.mdx";

const POSTS: readonly ManifestPost[] = [
  {
    slug: "the-clean-cutover",
    href: "/writing/the-clean-cutover",
    title: cleanCutover.title!,
    date: cleanCutover.date!,
    tag: cleanCutover.tag!,
    readTime: cleanCutover.readTime!,
  },
].sort((a, b) => b.date.localeCompare(a.date));

const notes = [
  {
    date: "2024.11.25",
    line: "Deleted code all morning. Net −400 lines, zero behavior change. A good day.",
  },
  {
    date: "2024.11.11",
    line: "A test you didn't write is a bug you haven't met yet.",
  },
  {
    date: "2024.10.28",
    line: "Refactor in the language of the domain, not the language of the framework.",
  },
] as const;

export default function Home() {
  const entryLabel = POSTS.length === 1 ? "01 entry" : `${POSTS.length.toString().padStart(2, "0")} entries`;

  return (
    <>
      <section class={styles.hero}>
        <p class={styles.stamp} aria-hidden="true">
          # {field.source} -&gt; {field.cols}x{field.rows} ascii · the quiet field
        </p>
        <h1>The slow work of getting better.</h1>
        <p class={styles.lede}>
          A field journal on building software, reading code I didn't write, and the quiet discipline of finishing what I start.
        </p>
      </section>

      <div class={styles.reading}>
        <section id="writing" class={styles.block}>
          <SectionHeader title="writing" meta={entryLabel} />
          <Manifest posts={POSTS} />
        </section>

        <section id="notes" class={styles.block}>
          <SectionHeader title="field notes" meta="shorter logs" />
          <ul class={styles.notes}>
            {notes.map((note) => (
              <li class={styles.noteRow}>
                <span class={styles.date}>{note.date}</span>
                <span class={styles.line}>{note.line}</span>
              </li>
            ))}
          </ul>
        </section>

        <section id="about" class={styles.block}>
          <SectionHeader title="about" meta="who & why" />
          <p class={styles.about}>
            I build software and write about the parts that are hard to get right: finishing what I start, reading code I didn't write, and the slow compounding of small, careful decisions. This is where I keep the notes. No schedule, no funnel, just a field I tend when there's something worth saying.
          </p>
        </section>
      </div>
    </>
  );
}
