import { Meta, Title } from "@solidjs/meta";
import { useLocation } from "@solidjs/router";
import { createMemo, type ParentProps } from "solid-js";
import styles from "./ArticleShell.module.css";
import "../styles/MdxComponents.css";

type ArticleFrontmatter = {
  layout?: string;
  title?: string;
  description?: string;
  date?: string;
  tag?: string;
  readTime?: string;
};

type ArticleShellProps = ParentProps<{
  frontmatter?: ArticleFrontmatter;
}>;

export function ArticleShell(props: ArticleShellProps) {
  const location = useLocation();
  const metadata = createMemo(() => {
    const parts = location.pathname.split("/").filter(Boolean);
    const frontmatter = props.frontmatter ?? {};
    const date = frontmatter.date ?? "";
    const tag = frontmatter.tag ?? "";
    const readTime = frontmatter.readTime ?? "";

    return {
      slug: parts.at(-1) ?? "writing",
      title: frontmatter.title ?? "",
      description: frontmatter.description ?? "",
      metaLine: [date, tag, readTime].filter(Boolean).join(" · "),
    };
  });

  return (
    <article>
      {metadata().title && (
        <>
          <Title>{metadata().title} · moving forward</Title>
          <Meta property="og:title" content={metadata().title} />
          <Meta property="og:description" content={metadata().description} />
          <Meta property="og:type" content="article" />
          <Meta name="twitter:card" content="summary" />
          <Meta name="twitter:title" content={metadata().title} />
          <Meta name="twitter:description" content={metadata().description} />
        </>
      )}

      <header class={styles.head}>
        <p class={styles.crumb}>
          <a href="/#writing">/writing</a> / {metadata().slug}
        </p>
        <p class={styles.meta}>{metadata().metaLine}</p>
        <h1>{metadata().title}</h1>
        {metadata().description && <p class={styles.lede}>{metadata().description}</p>}
      </header>

      <div class={styles.reading}>
        <div class="MdxComponents">{props.children}</div>
        <footer class={styles.postFoot}>
          <a class={styles.back} href="/#writing">
            ← all writing
          </a>
          <span aria-hidden="true">moving forward</span>
        </footer>
      </div>
    </article>
  );
}
